
const sideEffects = {
    isIdle: true,
    appContainer: "appContainer",
    updateDOM: elementTree => [
        sideEffects.applyHTML,
        sideEffects.applyEventListeners
    ].forEach( stepFunction => stepFunction(elementTree) ),
    applyHTML: elementTree => document.getElementById(sideEffects.appContainer).innerHTML = elementTree.map( element => element.html ).join(''),
    applyEventListeners: elementTree => elementTree.map( element => Array.isArray(element.eventListeners) ? element.eventListeners : [] ).flat().forEach( eventListener => document.getElementById( eventListener.id ).addEventListener(eventListener.eventType, eventListener.action) ),
    APIRequest: async (type, endPoint, stringBody) => {


      if(sideEffects.isIdle){
        sideEffects.isIdle = false;
        let startTime = Date.now()
    
        let APIendpoint = `https://holdingservice.appspot.com/api/${endPoint}`
    
        let authToken = await sideEffects.auth0.getTokenSilently()
        let headers = {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken}
        let response = (type === "GET") ? await fetch(APIendpoint, {method: "GET", headers: headers })
                                        : (type === "POST") ? await fetch(APIendpoint, {method: "POST", headers: headers, body: stringBody })
                                        : console.log("ERROR: Invalid HTTP method: ", type, endPoint, body )
        let parsedResponse = await response.json()
        
        let duration = Date.now() - startTime;
        console.log(`Executed ${type} request to '/${endPoint}' in ${duration} ms.`, parsedResponse)
        sideEffects.isIdle = true;
        return parsedResponse;
        
      }else{
        console.log("Declined HTTP request, another in progress:", type, endPoint, stringBody )
      }

        
    },
    auth0: null,
    configureClient: async () => {
  
        sideEffects.auth0 = await createAuth0Client({
          domain: "holdingservice.eu.auth0.com",
          client_id: "3BjA7O8H2dGx2g2nhssoFie0vWWx7ne5",
          audience: "localhost:3000/api"
        }); //This call is for some reason never resolved..
    
        let isAuthenticated = await sideEffects.auth0.isAuthenticated();
    
    
        if(isAuthenticated){
            console.log("Authenticated");
            
            let serverResponse = await sideEffects.APIRequest("GET", "userContent", null)


            //let serverResponse2 = await sideEffects.APIRequest("GET", "Entities", null)

            //console.log(serverResponse2)
            

            if( serverResponse === null){console.log("Received null")}
            else{

              let initialUIstate = {
                "currentPage": "timeline",
                "selectedOrgnumber": null,
                "companyDocPage/selectedVersion": 1,
                "selectedEntityType" : 7684,
                "selectedCategory": "Hendelsesattributter",
                "selectedEntity": 9970,
                "selectedReport": 10439,
                "currentSearchString": "Søk etter entitet",
              }

              update({
                UIstate: initialUIstate,
                Entities: serverResponse.Entities
              })
            }
            
        }else{
            try{
                await sideEffects.auth0.handleRedirectCallback();
                window.history.replaceState({}, document.title, "/");
                sideEffects.configureClient()
              } catch (error) {
                console.log("Not logged in.");
                sideEffects.auth0.loginWithRedirect({redirect_uri: window.location.origin})
              }
        }
        return true
    
    },
    submitDatomsWithValidation: async (S, Datoms) => {
      if(sideEffects.isIdle){
        if(Datoms.filter( d => d.attribute !== "attr/name" ).every( datom => validateDatom(S, datom) )){
          
          let serverResponse = await sideEffects.APIRequest("POST", "transactor", JSON.stringify( Datoms )) 

          let newState = {
            UIstate: S["UIstate"],
            Entities: serverResponse.Entities
          }
          
          return newState }
        else{return logThis(S,["ERROR: Datoms not valid: ", Datoms])}
        }
      else{return logThis(S,["ERROR: HTTP request already in progress, did not submit datoms.", Datoms])}
    }
}

let validateDatom = (S, datom) => {

  //TBD: Check that exactly all entity type attributes are present
  //Other ???

  let isExistingEntity = (typeof datom.entity === "number")
  let attribute = S.attrEntity(datom.attribute)

  if(isExistingEntity){
    let Entity = S.getEntity(datom.entity)
    let EntityType = S.getEntity(Entity["entity/entityType"])
    let isRetraction = !datom.isAddition
    let isEvent = EntityType.entity === 7790
    let isValidAttributeForEntityType = EntityType["entityType/attributes"].includes(attribute) //Event har varierende attributter...
    let eitherOr = (isEvent || isValidAttributeForEntityType || isRetraction)


    if(eitherOr){
      
      let Attribute = S.getEntity( attribute  )
      let ValueType = S.getEntity(Attribute["attribute/valueType"])
      let isValidValueType = new Function("inputValue", ValueType["valueType/validatorFunctionString"] )(datom.value)
      if(isValidValueType){    
        let isValidAttributeValue = new Function("inputValue", Attribute["attribute/validatorFunctionString"] )(datom.value)
        if(isValidAttributeValue){    
          return true
        }else{return logThis(false, ["Value did not pass global attribute validation", datom])}
        
      }else{return logThis(false, ["Value is not valid for the valueType of the selected attribute", datom])}
      
    }else{return logThis(false, ["Attribute is not valid for the selected entity type", datom])}
    
  }else{
    let Attribute = S.getEntity( attribute  )
    let ValueType = S.getEntity(Attribute["attribute/valueType"])
    let isValidValueType = new Function("inputValue", ValueType["valueType/validatorFunctionString"] )(datom.value)
    if(isValidValueType){    
      let isValidAttributeValue = new Function("inputValue", Attribute["attribute/validatorFunctionString"] )(datom.value)
      if(isValidAttributeValue){    
        return true
      }else{return logThis(false, ["Value did not pass global attribute validation", datom])}
        
    }else{return logThis(false, ["Value is not valid for the valueType of the selected attribute", datom])}
  }


}

let validateAttributeValue = (S, attributeEntity, value) =>  new Function(`inputValue`, S.getEntity( attributeEntity )["attribute/validatorFunctionString"] )( value )

let updateCompanyMethods = (S, Company) => {

  Company.getEntity = entity => Company.Entities[entity]
  Company.getAttributeValue = attribute => Company.getEntity(1)[attribute]
  Company.getLatestEntityID = () => Number(Object.keys(Company.Entities)[ Object.keys(Company.Entities).length - 1 ])
  Company.getVersion = t => Company.previousVersions.filter( Company => Company.t === t  )[0]
  Company.getReport = (report, t) => mergeArray( S.getEntity(report)["report/reportFields"].map( reportField => {

    let selectedCompanyVersion = ( typeof t === "undefined" || t === Company.t ) ? Company : Company.getVersion(t)

    let ReportField = createObject(reportField.attribute, new Function( [`Company`], reportField["value"] )( selectedCompanyVersion ) )

    return ReportField
  }))

  Company.getEntities = (filterFunction) => Object.values(Company.Entities).filter( filterFunction )
  

  return Company
}

let constructEvents = (S, storedEvents) => {

  let initialCompany = {
    t: 0,
    Events: storedEvents,
    Datoms: [],
    Entities: {
      "1": {}
    },
    previousVersions: [],
    isValid: true
  }

  

  Company = storedEvents.reduce( (Company, Event) => {

    let t = Company.t + 1

    let EventType = S.getEntity(  Event["event/eventTypeEntity"] )

    let isApplicable = [
      (Company, Event) => Company.isValid,
      (Company, Event) => S.findEntities( E => E["entity/entityType"] === 7686 ).map( E => E.entity).includes( Event["event/eventTypeEntity"] ),
      (Company, Event) => EventType["eventType/eventAttributes"].every( attribute =>  validateAttributeValue(S, attribute, Event[ S.getEntity( attribute )["attr/name"] ] ) ),
      (Company, Event) => EventType["eventType/eventValidators"].every( eventValidator =>  new Function([`Q`], S.getEntity(eventValidator)["eventValidator/validatorFunctionString"])( Company ) ),
    ].every( validatorFunction => validatorFunction(Company, Event) )

    if(isApplicable){

      let Q = {
        userInput: entity => Event[ S.getEntity(entity)["attr/name"] ],
        companyAttribute: attribute => Company.getAttributeValue(attribute),
        latestEntityID: () => Company.getLatestEntityID()
      }

      let eventDatoms = EventType["eventType/newDatoms"].map( datomConstructor => returnObject({
          "entity": new Function( [`Q`], datomConstructor["entity"] )( Q ),
          "attribute": datomConstructor.attribute,
          "value": new Function( [`Q`], datomConstructor["value"] )( Q ),
          "t": t
        })
      )

      let Entities = eventDatoms.reduce( (updatedEntities, datom) => mergerino(
        updatedEntities,
        createObject(datom.entity, {entity: datom.entity}),
        createObject(datom.entity, createObject(datom.attribute, datom.value ))
      ), Company.Entities )

      let updatedCompany = {
        t: t,
        Events: Company.Events,
        Datoms: Company.Datoms.concat(eventDatoms),
        Entities: Entities,
        previousVersions: Company.previousVersions.concat(Company),
        isValid: true
      }

      return updateCompanyMethods(S, updatedCompany);

    }else{return mergerino(Company, {isValid: false}) }

  }, updateCompanyMethods(S, initialCompany) )

  return Company

}

let newDatom = (entity, attribute, value, isAddition) => returnObject({entity, attribute, value, isAddition: isAddition === false ? false : true })


let getRetractionDatomsWithoutChildren = Entities => Entities.map( Entity =>  Object.entries( Entity ).filter( entry => typeof entry[1] !== "function" ).map( e => newDatom(Entity["entity"], e[0], e[1], false) ).filter( d => d["attribute"] !== "entity" ) ).flat() //Need to also get children

let getUserActions = (S) => returnObject({
    updateLocalState: (patch) => update( {
      UIstate: mergerino( S["UIstate"], patch ), 
      sharedData: S["sharedData"] 
    }),
    createEntity: async entityTypeEntity => {

      let EntityType = S.getEntity(entityTypeEntity)

      let Datoms = EntityType["entityType/attributes"].map( attribute => {

      let Attribute = S.getEntity(attribute)
      let value = new Function("S", Attribute["attribute/startValue"] )( S )
      let datom = newDatom("newEntity", Attribute["attr/name"], value)

      return datom


    } )
      .filter( datom => datom.attribute !== "entity/entityType" )
      .filter( datom => datom.attribute !== "entity/label" )
      .concat( [
        newDatom("newEntity", "entity/entityType", entityTypeEntity ),
        newDatom("newEntity", "entity/label", `[${EntityType["entity/label"]} uten navn]` ),
        newDatom("newEntity", "entity/category", S["UIstate"]["selectedCategory"] )
      ]  )

    let newState = await sideEffects.submitDatomsWithValidation(S, Datoms)

    update( newState )

    },
    createEvent: async ( eventAttributes, newEventTypeEntity ) => update( await sideEffects.submitDatomsWithValidation(S, [
        newDatom("newEntity", "entity/entityType", 7790),
        newDatom("newEntity", "event/eventTypeEntity", newEventTypeEntity),
        newDatom("newEntity", 11320, eventAttributes[S.getEntity(11320)["attr/name"]] )
    ])),
    createCompany: async () => update( await sideEffects.submitDatomsWithValidation(S, [
      newDatom("newEntity", "entity/entityType", 7790),
      newDatom("newEntity", "event/eventTypeEntity", 4113),
      newDatom("newEntity", 11320, randBetween(800000000, 1000000000) ),
  ])),
    update: serverResponse => update( {
      UIstate: S["UIstate"],
      Entities: logThis(serverResponse, "serverResponse").Entities
    } )
})

let activateEntities = (S, Entities) => {

  let activatedEntities = Entities.map( Entity => {
    Entity.Datoms = [] //TBD
    Entity.get = attribute => Entity[S.attrName(attribute)]
    Entity.type = () => Entity.get("entity/entityType") ? Entity.get("entity/entityType") : logThis(null, `Entitet [${Entity.get("entity")}] ( mangler visningsnavn )` )
    Entity.label = () => Entity.get("entity/label") ? Entity.get("entity/label") : `Entitet [${Entity.get("entity")}] ( mangler visningsnavn )`
    Entity.doc = () => Entity.get("entity/doc") ? Entity.get("entity/doc") : `Entitet [${Entity.get("entity")}] ( mangler beskrivelse )`
    Entity.category = () => Entity.get("entity/category") ? Entity.get("entity/category") : `Entitet [${Entity.get("entity")}] ( mangler kategori )`
    Entity.retract = async () => await sideEffects.submitDatomsWithValidation(S,  getRetractionDatomsWithoutChildren( [Entity])) //Hmmmmm
    Entity.update = async (attribute, newValue) => await sideEffects.submitDatomsWithValidation(S, [newDatom( Entity.get("entity"), S.attrName(attribute), newValue )] ) //Hmmmmm
  
    return Entity
  }  )


  activatedEntities.getEntity = entity => {
    let searchResult = Entities.filter( Entity => Entity.get("entity") === entity )
    let returnValue = searchResult.length === 1 ? searchResult[0] : logThis(null, `Entitet [${entity}] finnes ikke` )
    return returnValue
  }

  return activatedEntities

} 

let update = (S) => {

    //DB queries
    let Attributes = S.Entities.filter( Entity => Entity["entity/entityType"] === 7684 )

    S.attrName = attribute => (typeof attribute === "string") ? attribute : Attributes.filter( Attribute => Attribute.entity === attribute )[0]["attr/name"]
    S.attrEntity = attrName => (typeof attrName === "number") ? attrName : Attributes.filter( Attribute => Attribute["attr/name"] === attrName )[0]["entity"]
    
    let Entities = activateEntities( S, S.Entities.filter( Entity => Object.keys(Entity).length > 1 ) ) 
    
    
    S.getEntity = entity => Entities.getEntity(entity)  //S["sharedData"]["E"][entity] ? S["sharedData"]["E"][entity] : logThis(null, `Entitet [${entity}] finnes ikke` )
    S.findEntities = filterFunction => Entities.filter( filterFunction )
    S.getEntityLabel = entity => Entities.getEntity(entity).label()
    S.getEntityDoc = entity => Entities.getEntity(entity).doc()
    S.getEntityCategory = entity => Entities.getEntity(entity).category()
    
    try {
      S.selectedCompany = constructEvents(S, Entities
        .filter( e => e["entity/entityType"] === 7790 )
        .filter( eventAttributes => eventAttributes[S.getEntity(11320)["attr/name"]] === S["UIstate"].selectedOrgnumber )
        .sort( (a, b) => a["event/index"] - b["event/index"]  )
      )} catch (error) {console.log(error)}


    //Local state
    S["UIstate"].selectedEntity = (S.getEntity(S["UIstate"].selectedEntity) === null) ? 9970 : S["UIstate"].selectedEntity
    S["UIstate"].selectedOrgnumber = (S["UIstate"].selectedOrgnumber === null) ? S.findEntities( e => e["entity/entityType"] === 7790 ).map( E => E.get(11320) ).filter( filterUniqueValues )[0] : S["UIstate"].selectedOrgnumber
    S["UIstate"].selectedVersion = (typeof S["UIstate"].selectedVersion === "undefined" ) ? S["selectedCompany"].t : S["UIstate"].selectedVersion

    Admin.S = S;

    console.log("State: ", S)
    let A = getUserActions(S)

    S.elementTree = generateHTMLBody(S, A )
    sideEffects.updateDOM( S.elementTree )
}

sideEffects.configureClient();

let Admin = {
    S: null,
    updateClientRelease: (newVersion) => sideEffects.APIRequest("POST", "updateClientRelease", JSON.stringify({"clientVersion": newVersion})),
    resetServer: () => sideEffects.APIRequest("GET", "resetServer", null),
    submitDatoms: async (datoms) => datoms.length < 10000
    ? await sideEffects.APIRequest("POST", "transactor", JSON.stringify( logThis(datoms, "Datoms submitted to Transactor.") )) 
    : console.log("ERROR: Too many datoms: ", datoms),
    getEntity: e => Admin.S.getEntity(e),
    findEntities: filterFunction => Admin.S.findEntities(filterFunction),
    updateEntityAttribute: async (entityID, attribute, value) => await Admin.submitDatoms([newDatom(entityID, attribute, value)]),
    retractEntities: async entities => await Admin.submitDatoms( getRetractionDatomsWithoutChildren(entities.map( e => Admin.S.getEntity(e) )) ),
    retractEntity: async entity => await Admin.retractEntities([entity]),
    getServerCache: async () => await sideEffects.APIRequest("GET", "serverCache", null)
}