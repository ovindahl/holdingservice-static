
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


            let Entities = await DB.init()
            Entities.getEntity = entity => Entities.filter( Entity => Entity.entity === entity )[0]

            

            let S = {
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
            }

            update( S )
            
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




const DB = {
  tx: null,
  Entities: [],
  createEntity: serverEntity => {
    let Entity = {
      entity: serverEntity.entity,
      Datoms: serverEntity.Datoms.map( Datom => typeof Datom.tx === "undefined" ? mergerino(Datom, {tx: 0}) : Datom )
    }

    Entity.versions = Entity.Datoms.map( Datom => Datom.tx ).filter( filterUniqueValues )

    Entity.tx = Entity.versions[ Entity.versions.length - 1 ]

    Entity.getActiveDatoms = () => Entity.Datoms.filter( Datom => Entity.Datoms.filter( dat => dat.attribute === Datom.attribute && dat.tx > Datom.tx ).length === 0  )

    Entity.getEntityVersion = tx => Entity.Datoms
      .filter( Datom => Datom.tx <= tx )
      .reduce( 
        (Entity, Datom) => mergerino(
          Entity, 
          createObject(
            Datom.attribute, 
            Datom.isAddition 
              ? Datom.value
              : undefined 
          ) 
        ),
        {entity: Entity.entity, tx}
      )
    
    Entity.Entity = () => Entity.getEntityVersion( Entity.tx )



    Entity.getDatom = attributeName => Entity.Datoms.filter( Datom => Datom.attribute === attributeName ).reverse()[0]
    Entity.getAttributeValue = attributeName => Entity.getDatom(attributeName) ? Entity.getDatom(attributeName).value : undefined
    Entity.getAttributeVersion = attributeName => Entity.getDatom(attributeName) ? Entity.getDatom(attributeName).tx : undefined
    Entity.type = () => Entity.getAttributeValue("entity/entityType")
    Entity.label = () => Entity.getAttributeValue("entity/label") ? Entity.getAttributeValue("entity/label") : `[${Entity.entity}] mangler visningsnavn.`
    Entity.category = () => Entity.getAttributeValue("entity/category")

    Entity.getRetractionDatoms = () => Entity.getActiveDatoms().map( Datom => newDatom(Entity.entity, Datom.attribute, Datom.value, false) )
    
    return Entity
  },
  update: (entity, attribute, value) => {
    
              /* Entity.update = async (attribute, newValue) => {
                let serverResponse = await sideEffects.submitDatomsWithValidation(S, [newDatom( Entity.getAttributeValue("entity"), S.attrName(attribute), newValue )] )
                let updatedEntity = serverResponse[0].entity ? serverResponse[0] : undefined
              } */



              //Entity.retract = async () => logThis( await sideEffects.submitDatomsWithValidation(S,  Entity.getRetractionDatoms() ), "Entity Retraction: Response from server")
              
              //Entity.submitDatoms = async (attributeValueArray) => logThis( await sideEffects.submitDatomsWithValidation(S, attributeValueArray.map( entry => newDatom(Entity.getAttributeValue("entity"), S.attrName(entry.attribute), entry.value) ) ), "Entity Update: Response from server")

  },
  init: async () => { 
    let serverResponse = await sideEffects.APIRequest("GET", "Entities", null)
    DB.Entities = serverResponse.map( serverEntity => DB.createEntity(serverEntity) )
    DB.tx = DB.Entities.map( Entity => Entity.tx ).reverse()[0]
    return DB.Entities
  }
}




let addUpdatedEntities = (S, changedEntities) => S.Entities.filter( Entity => !changedEntities.map( Entity =>  Entity.entity ).includes( Entity.entity ) ).concat( changedEntities )

let validateDatom = (S, datom) => {

  //TBD: Check that exactly all entity type attributes are present (wbu events)?
  //Other ???

  let isExistingEntity = (typeof datom.entity === "number")
  let Attribute = S.getEntity( S.attrEntity(datom.attribute)  )

  let ValueType = S.getEntity(Attribute.getAttributeValue("attribute/valueType"))


  let isValidValueType = new Function("inputValue", ValueType.getAttributeValue("valueType/validatorFunctionString") )(datom.value)


  if(!isValidValueType){return logThis(false, ["Value is not valid for the valueType of the selected attribute", datom])}
  let isValidAttributeValue = new Function("inputValue", Attribute.getAttributeValue("attribute/validatorFunctionString") )(datom.value)
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

      let Datoms = S.getEntity(entityTypeEntity).getAttributeValue("entityType/attributes").map( attribute => newDatom("newEntity", S.getEntity(attribute).getAttributeValue("attr/name"), new Function("S", S.getEntity(attribute).getAttributeValue("attribute/startValue") )( S )))
        .filter( datom => datom.attribute !== "entity/entityType" )
        .filter( datom => datom.attribute !== "entity/label" )
        .concat([
          newDatom("newEntity", "entity/entityType", entityTypeEntity ),
          newDatom("newEntity", "entity/label", `[${S.getEntity(entityTypeEntity).getAttributeValue("entity/label")} uten navn]` ),
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
        newDatom("newEntity", S.getEntity(1005).getAttributeValue("attr/name"), prevEvent.getAttributeValue( S.getEntity(1005).getAttributeValue("attr/name") ) )
    ]))
    }),
    createCompany: async () => update({
      UIstate: S["UIstate"],
      Entities: addUpdatedEntities(S, await sideEffects.submitDatomsWithValidation(S, [
        newDatom("newEntity", "entity/entityType", 46),
        newDatom("newEntity", "event/eventTypeEntity", 5000),
        newDatom("newEntity", S.getEntity(1005).getAttributeValue("attr/name"), randBetween(800000000, 1000000000) ),
    ]))
    }),
    update: changedEntities => update({
      UIstate: S["UIstate"],
      Entities: addUpdatedEntities(S, changedEntities)
    })
})

let update = (S) => {


    //DB queries
    S.getEntity = entity => S.Entities.getEntity(entity)
    S.findEntities = filterFunction => S.Entities.filter( filterFunction )
    S.getUserEvents = () => S.findEntities( Entity => Entity.type() === 46 )
      .filter( Event => Event.getAttributeValue("eventAttribute/1005") === Number(S["UIstate"].selectedOrgnumber) )
      .sort( (EventA, EventB) => EventA.getAttributeValue("event/index") - EventB.getAttributeValue("event/index")  )

    //User data
    try {S.selectedCompany = constructEvents(S, S.getUserEvents())} catch (error) {console.log(error)}


    //Local state
    S["UIstate"].selectedEntity = (S.getEntity(S["UIstate"].selectedEntity) === null) ? 4 : S["UIstate"].selectedEntity
    /* S["UIstate"].selectedOrgnumber = (S["UIstate"].selectedOrgnumber === null) ? S.findEntities( e => e["entity/entityType"] === 7790 ).map( E => E.getAttributeValue(11320) ).filter( filterUniqueValues )[0] : S["UIstate"].selectedOrgnumber
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
let getRetractionDatomsWithoutChildren = Entities => Entities.map( Entity =>  Object.entries( Entity ).filter( entry => typeof entry[1] !== "function" ).map( e => newDatom(Entity.getAttributeValue("entity"), e[0], e[1], false) ).filter( d => d["attribute"] !== "entity" ) ).flat() //Need to also get children