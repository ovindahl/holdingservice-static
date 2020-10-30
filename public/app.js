
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
        console.log(`Executed ${type} request to '/${endPoint}' in ${Date.now() - startTime} ms.`, parsedResponse)
        sideEffects.isIdle = true;
        return parsedResponse;
      }else{
        console.log("Declined HTTP request, another in progress:", type, endPoint, stringBody )
        return null;
      }
    },
    auth0: null,
    configureClient: async () => {
        sideEffects.auth0 = await createAuth0Client({
          domain: "holdingservice.eu.auth0.com",
          client_id: "3BjA7O8H2dGx2g2nhssoFie0vWWx7ne5",
          audience: "localhost:3000/api"
        }); //This call is for some reason never resolved..
        if(await sideEffects.auth0.isAuthenticated()){
            console.log("Authenticated");            
            let Entities = await sideEffects.APIRequest("GET", "Entities", null)
            
            if( Entities === null){console.log("Received null")}
            else{ update({
              UIstate: {
                "currentPage": "timeline",
                "selectedOrgnumber": null,
                "companyDocPage/selectedVersion": 1,
                "selectedEntityType" : 42,
                "selectedCategory": "[db] Entitet",
                "selectedEntity": 4,
                "selectedReport": 10439,
                "currentSearchString": "Søk etter entitet",
              },
              Entities
            })}
            
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
        if(Datoms.filter( d => d.attribute !== "attr/name" ).every( datom => validateDatom(S, datom) )){return await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( Datoms ))}
        else{return logThis(S,["ERROR: Datoms not valid: ", Datoms])}
        }
      else{return logThis(S,["ERROR: HTTP request already in progress, did not submit datoms.", Datoms])}
    }
}

let addUpdatedEntities = (S, changedEntities) => S.Entities.filter( Entity => !changedEntities.map( Entity =>  Entity.entity ).includes( Entity.entity ) ).concat( changedEntities )

let validateDatom = (S, datom) => {

  //TBD: Check that exactly all entity type attributes are present (wbu events)?
  //Other ???

  let isExistingEntity = (typeof datom.entity === "number")
  let Attribute = S.getEntity( S.attrEntity(datom.attribute)  )

  let ValueType = S.getEntity(Attribute.get("attribute/valueType"))


  let isValidValueType = new Function("inputValue", ValueType.get("valueType/validatorFunctionString") )(datom.value)


  if(!isValidValueType){return logThis(false, ["Value is not valid for the valueType of the selected attribute", datom])}
  let isValidAttributeValue = new Function("inputValue", Attribute.get("attribute/validatorFunctionString") )(datom.value)
  if(!isValidAttributeValue){return logThis(false, ["Value did not pass global attribute validation", datom])}
  else{return true}





  if(isExistingEntity){
    let Entity = S.getEntity(datom.entity)
    let EntityType = S.getEntity(Entity["entity/entityType"])
    let isRetraction = !datom.isAddition
    let isEvent = EntityType.entity === 7790
    let isValidAttributeForEntityType = EntityType["entityType/attributes"].includes(attribute) //Event har varierende attributter...
    let eitherOr = (isEvent || isValidAttributeForEntityType || isRetraction)


    if(eitherOr){
      
      
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

  console.log("storedEvents", storedEvents)

  

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

let getUserActions = (S) => returnObject({
    updateLocalState: (patch) => update({
      UIstate: mergerino( S["UIstate"], patch ), 
      Entities: S["Entities"] 
    }),
    createEntity: async entityTypeEntity => {

      console.log("Creating new entity of type: ", entityTypeEntity)

      let Datoms = S.getEntity(entityTypeEntity).get("entityType/attributes").map( attribute => newDatom("newEntity", S.getEntity(attribute).get("attr/name"), new Function("S", S.getEntity(attribute).get("attribute/startValue") )( S )))
        .filter( datom => datom.attribute !== "entity/entityType" )
        .filter( datom => datom.attribute !== "entity/label" )
        .concat([
          newDatom("newEntity", "entity/entityType", entityTypeEntity ),
          newDatom("newEntity", "entity/label", `[${S.getEntity(entityTypeEntity).get("entity/label")} uten navn]` ),
          newDatom("newEntity", "entity/category", S["UIstate"]["selectedCategory"] )
        ])
      let changedEntities = await sideEffects.submitDatomsWithValidation(S, Datoms)
      update( {
        UIstate: S["UIstate"],
        Entities: addUpdatedEntities(S, changedEntities)
      } ) 
    },
    createEvent: async ( prevEvent, newEventTypeEntity ) => update({
      UIstate: S["UIstate"],
      Entities: addUpdatedEntities(S, await sideEffects.submitDatomsWithValidation(S, [
        newDatom("newEntity", "entity/entityType", 46),
        newDatom("newEntity", "event/eventTypeEntity", newEventTypeEntity),
        newDatom("newEntity", S.attrName(1005), prevEvent.get( S.attrName(1005) ) )
    ]))
    }),
    createCompany: async () => update({
      UIstate: S["UIstate"],
      Entities: addUpdatedEntities(S, await sideEffects.submitDatomsWithValidation(S, [
        newDatom("newEntity", "entity/entityType", 46),
        newDatom("newEntity", "event/eventTypeEntity", 5000),
        newDatom("newEntity", S.attrName(1005), randBetween(800000000, 1000000000) ),
    ]))
    }),
    update: changedEntities => update({
      UIstate: S["UIstate"],
      Entities: addUpdatedEntities(S, changedEntities)
    })
})

let activateEntities = (S, Entities) => {

  let activatedEntities = Entities.map( Entity => {
    Entity.get = attribute => Entity.current[S.attrName(attribute)]
    Entity.type = () => Entity.get("entity/entityType") ? Entity.get("entity/entityType") : logThis(null, `Entitet [${Entity.get("entity")}] ( mangler entitetstype )` )
    Entity.label = () => Entity.get("entity/label") ? Entity.get("entity/label") : `Entitet [${Entity.get("entity")}] ( mangler visningsnavn )`
    Entity.doc = () => Entity.get("entity/doc") ? Entity.get("entity/doc") : `Entitet [${Entity.get("entity")}] ( mangler beskrivelse )`
    Entity.category = () => Entity.get("entity/category") ? Entity.get("entity/category") : `Entitet [${Entity.get("entity")}] ( mangler kategori )`
    Entity.version = () => Entity.Datoms[ Entity.Datoms.length - 1 ].tx
    Entity.getRetractionDatoms = () => Object.entries( Entity.current )
      .filter( entry => typeof entry[1] !== "function" )
      .map( e => newDatom(Entity.get("entity"), e[0], e[1], false) )
      .filter( d => d["attribute"] !== "entity" )

    Entity.retract = async () => logThis( await sideEffects.submitDatomsWithValidation(S,  Entity.getRetractionDatoms() ), "Entity Retraction: Response from server")
    Entity.update = async (attribute, newValue) => logThis( await sideEffects.submitDatomsWithValidation(S, [newDatom( Entity.get("entity"), S.attrName(attribute), newValue )] ), "Entity Update: Response from server")
    Entity.submitDatoms = async (attributeValueArray) => logThis( await sideEffects.submitDatomsWithValidation(S, attributeValueArray.map( entry => newDatom(Entity.get("entity"), S.attrName(entry.attribute), entry.value) ) ), "Entity Update: Response from server")
  
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
    let Attributes = S.Entities.filter( Entity => Entity.current["entity/entityType"] === 42 )

    S.attrName = attribute => (typeof attribute === "string") ? attribute : Attributes.filter( Attribute => Attribute.current.entity === attribute )[0].current["attr/name"]
    S.attrEntity = attrName => (typeof attrName === "number") ? attrName : Attributes.filter( Attribute => Attribute.current["attr/name"] === attrName )[0].current["entity"]
    
    let Entities = activateEntities( S, S.Entities.filter( Entity => Object.keys(Entity.current).length > 1 ) ) 
    S.getEntity = entity => Entities.getEntity(entity)
    S.findEntities = filterFunction => Entities.filter( filterFunction )
    S.getEntityLabel = entity => Entities.getEntity(entity).label()
    S.getEntityDoc = entity => Entities.getEntity(entity).doc()
    S.getEntityCategory = entity => Entities.getEntity(entity).category()
    S.getLatestEntityID = () => Entities.map( Entity => Entity.get("entity") ).sort( (a, b) => b - a )[0]
    S.getUserEvents = () => S.findEntities( Entity => Entity.type() === 46 )
      .filter( Event => Event.get(S.attrName(1005)) === Number(S["UIstate"].selectedOrgnumber) )
      .sort( (EventA, EventB) => EventA.get("event/index") - EventB.get("event/index")  )

    //User data
    try {S.selectedCompany = constructEvents(S, S.getUserEvents())} catch (error) {console.log(error)}


    //Local state
    S["UIstate"].selectedEntity = (S.getEntity(S["UIstate"].selectedEntity) === null) ? 4 : S["UIstate"].selectedEntity
    /* S["UIstate"].selectedOrgnumber = (S["UIstate"].selectedOrgnumber === null) ? S.findEntities( e => e["entity/entityType"] === 7790 ).map( E => E.get(11320) ).filter( filterUniqueValues )[0] : S["UIstate"].selectedOrgnumber
    S["UIstate"].selectedVersion = (typeof S["UIstate"].selectedVersion === "undefined" ) ? S["selectedCompany"].t : S["UIstate"].selectedVersion */

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
    submitDatoms: async Datoms => await sideEffects.submitDatomsWithValidation(Admin.S, Datoms),
    submitDatomsWithoutValidation: async Datoms => await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( Datoms ))
}



//Archive
let getRetractionDatomsWithoutChildren = Entities => Entities.map( Entity =>  Object.entries( Entity ).filter( entry => typeof entry[1] !== "function" ).map( e => newDatom(Entity.get("entity"), e[0], e[1], false) ).filter( d => d["attribute"] !== "entity" ) ).flat() //Need to also get children