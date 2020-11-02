
const Database = {
  tx: null,
  Entities: [],
  applyEntityMethods: serverEntity => {
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
    Entity.getAttributeValue = attributeName => Entity.getDatom(attributeName) 
      ? Entity.getDatom(attributeName).isAddition
        ? Entity.getDatom(attributeName).value 
        : undefined //To be verified....
      : undefined
    Entity.getAttributeVersion = attributeName => Entity.getDatom(attributeName) ? Entity.getDatom(attributeName).tx : undefined
    Entity.type = () => Entity.getAttributeValue("entity/entityType")
    Entity.label = () => Entity.getAttributeValue("entity/label") ? Entity.getAttributeValue("entity/label") : `[${Entity.entity}] mangler visningsnavn.`
    Entity.category = () => Entity.getAttributeValue("entity/category")

    Entity.getRetractionDatoms = () => Entity.getActiveDatoms().map( Datom => newDatom(Entity.entity, Datom.attribute, Datom.value, false) )

    Entity.update = ( attribute, newValue ) => Database.updateEntity( Entity.entity, attribute, newValue )
    Entity.retract = ( ) => Database.retractEntity( Entity.entity )
    
    return Entity
  },
  updateEntity: async (entity, attribute, value) => {

    let Attribute = Database.getEntity( typeof attribute === "string" ? Database.Entities.filter( Entity => Entity.getAttributeValue("attr/name") === attribute )[0].entity : attribute  )
    let ValueType = Database.getEntity( Attribute.getAttributeValue("attribute/valueType") )

    let isValid_existingEntity = typeof Database.getEntity(entity) === "object"
    let isValid_valueType = new Function("inputValue", ValueType.getAttributeValue("valueType/validatorFunctionString") ) ( value )
    let isValid_attribute = new Function("inputValue", Attribute.getAttributeValue("attribute/validatorFunctionString") ) ( value )
    let isValid_notNaN = !Number.isNaN(value)


    //Add checks for whether attribtue is valid for the entity type?

    if( isValid_existingEntity && isValid_valueType && isValid_attribute && isValid_notNaN  ){

      let Datom = newDatom(entity, Attribute.getAttributeValue("attr/name"), value )
      let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( [Datom] ) )
      let updatedEntity = serverResponse.map( serverEntity => Database.applyEntityMethods(serverEntity) )

      Database.Entities = Database.Entities.filter( Entity => Entity.entity !== entity ).concat( updatedEntity )
      Database.systemAttributes = Database.Entities
        .filter( Entity => Entity.type() === 42 )
        .filter( Entity => Entity.entity < 1000  )
        Database.tx = Database.Entities.map( Entity => Entity.tx ).reverse()[0]
        Database.getEntity = entity => Database.Entities.filter( Entity => Entity.entity === entity )[0]
      
      return Database

    }else{

      console.log("Database.updateEntity did not pass validation.", {isValid_existingEntity, isValid_valueType, isValid_attribute, isValid_notNaN })
      return Database

    }

  },
  createEntity: async (entityType, newEntityDatoms) => {

    let EntityType = Database.getEntity(entityType)
    let Datoms = EntityType.getAttributeValue("entityType/attributes")
      .map( attribute => newDatom("newEntity", Database.getEntity(attribute).getAttributeValue("attr/name"), new Function("S", Database.getEntity(attribute).getAttributeValue("attribute/startValue") )( Database )))
      .filter( datom => datom.attribute !== "entity/entityType" )
      .filter( datom => datom.attribute !== "entity/label" )
      .concat([
        newDatom("newEntity", "entity/entityType", entityType ),
        newDatom("newEntity", "entity/label", `[${EntityType.getAttributeValue("entity/label")} uten navn]` ),
        newDatom("newEntity", "entity/category", `Mangler kategori` )
      ])

    if(Array.isArray(newEntityDatoms)){Datoms = Datoms.concat(newEntityDatoms)}

    let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( Datoms ) )
    let newEntity = serverResponse.map( serverEntity => Database.applyEntityMethods(serverEntity) )

      Database.Entities = Database.Entities.concat( newEntity )
      Database.systemAttributes = Database.Entities
        .filter( Entity => Entity.type() === 42 )
        .filter( Entity => Entity.entity < 1000  )
      Database.tx = Database.Entities.map( Entity => Entity.tx ).reverse()[0]
      Database.getEntity = entity => Database.Entities.filter( Entity => Entity.entity === entity )[0]
      Database.getLatestModifiedEntity = () => Database.Entities[ Database.Entities.length - 1 ].entity
      
      return Database
  },
  retractEntity: async entity => {


    let Entity = Database.getEntity(entity)
    let retractDatoms = Entity.getRetractionDatoms()
    let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( retractDatoms ) )
    let retractedEntity = serverResponse.map( serverEntity => Database.applyEntityMethods(serverEntity) )
    Database.Entities = Database.Entities.filter( Entity => Entity.entity !== entity ).concat( retractedEntity )
    Database.systemAttributes = Database.Entities
        .filter( Entity => Entity.type() === 42 )
        .filter( Entity => Entity.entity < 1000  )
    Database.tx = Database.Entities.map( Entity => Entity.tx ).reverse()[0]
    Database.getEntity = entity => Database.Entities.filter( Entity => Entity.entity === entity )[0]
      
    return Database





  },
  init: async () => { 
    let serverResponse = await sideEffects.APIRequest("GET", "Entities", null)
    Database.Entities = serverResponse
      .filter( serverEntity => Object.keys(serverEntity).length > 1 )
      .map( serverEntity => Database.applyEntityMethods(serverEntity) )

      //Only .createEntity on .getEntity or .findEntities? Not on init

    Database.systemAttributes = Database.Entities
      .filter( Entity => Entity.type() === 42 )
      .filter( Entity => Entity.entity < 1000  )
    Database.tx = Database.Entities.map( Entity => Entity.tx ).reverse()[0]
    Database.getEntity = entity => Database.Entities.filter( Entity => Entity.entity === entity )[0]
    
    return Database
  }
}

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


            let DB = await Database.init();
            

            

            let S = {
              UIstate: {
                "currentPage": "timeline",
                "selectedOrgnumber": null,
                "companyDocPage/selectedVersion": 1,
                "selectedEntityType" : 42,
                "selectedCategory": "[db] Entitet",
                "selectedEntity": null,
                "selectedReport": 10439,
                "eventAttributeSearchString": "1920",
              }
            }

            update( S, DB )
            
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
    
    }
}


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
      (Company, Event) => S.EntityTypes.map( E => E.entity).includes( Event["event/eventTypeEntity"] ),
      (Company, Event) => EventType["eventType/eventAttributes"].every( attribute =>  new Function(`inputValue`, S.getEntity( attribute )["attribute/validatorFunctionString"] )( Event.getAttributeValue( S.getEntity( attribute )["attr/name"] ) ) ),
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

let getUserActions = (S, DB) => returnObject({
    updateLocalState: (patch) => update({
      UIstate: mergerino( S["UIstate"], patch )
    }, DB),
    createEntity: async entityTypeEntity => {

      let updatedDB = await DB.createEntity(entityTypeEntity)

      let newEntity = updatedDB.getLatestModifiedEntity()

      let updatedState = mergerino(S, {UIstate: {"selectedEntity": newEntity}})

      if(entityTypeEntity === 42){updatedState["UIstate"]["eventAttributeSearchString"] = "[Attributt uten navn]" }



      update(updatedState, updatedDB )


    },
    retractEntity: async entity => {

      let updatedDB = await S.getEntity(entity).retract()

      let updatedState = mergerino(S, {UIstate: {"selectedEntity": null}})

      update(updatedState, updatedDB )


    },
    createEvent: async ( prevEvent, newEventTypeEntity ) => {

      let eventDatoms = [
        newDatom("newEntity", "event/eventTypeEntity", newEventTypeEntity),
        newDatom("newEntity", S.getEntity(1005).getAttributeValue("attr/name"), prevEvent.getAttributeValue( S.getEntity(1005).getAttributeValue("attr/name") ) ),
        newDatom("newEntity", S.getEntity(1000).getAttributeValue("attr/name"), prevEvent.getAttributeValue( S.getEntity(1000).getAttributeValue("attr/name") ) + 1 )
      ]
      let updatedDB = await DB.createEntity(46, eventDatoms )

      update( S, updatedDB )

    },
    createCompany: async () => {

      let eventDatoms = [
        newDatom("newEntity", "event/eventTypeEntity", 5000),
        newDatom("newEntity", S.getEntity(1005).getAttributeValue("attr/name"), randBetween(800000000, 1000000000) ),
        newDatom("newEntity", S.getEntity(1000).getAttributeValue("attr/name"), 1 )
      ]
      let updatedDB = await DB.createEntity(46, eventDatoms )
      update( S, updatedDB )

    },
    update: newDB => update({UIstate: S["UIstate"]}, newDB)
})

let update = ( S, DB ) => {

    console.log("DB", DB)

    //DB queries
    S.getEntity = entity => DB.getEntity(entity)

    S.Attributes = DB.Entities.filter( E => E.type() === 42  )
    S.allEventTypes = DB.Entities.filter(E => E.type() ===  43 )
    S.ValueTypes = DB.Entities.filter( E => E.type() === 44  )
    S.EntityTypes = DB.Entities.filter( E => E.type() === 47  )
    S.accounts = DB.Entities.filter( Entity =>  Entity.getAttributeValue('entity/entityType') === 5030).map(E=>E.entity)
    S.orgNumbers = DB.Entities.filter( Entity => Entity.type() === 46 ).map( E => E.getAttributeValue("eventAttribute/1005") ).filter( filterUniqueValues )
    
    S.selectedCategories = DB.Entities.filter( e => e.type() === S["UIstate"].selectedEntityType )
    S.selectedEntities = DB.Entities.filter( e => e.type() === S["UIstate"].selectedEntityType && e.getAttributeValue("entity/category") === S["UIstate"].selectedCategory )
    

    Admin.S = S;
    Admin.DB = DB


    S.getUserEvents = () => DB.Entities.filter( Entity => Entity.type() === 46 )
      .filter( Event => Event.getAttributeValue("eventAttribute/1005") === Number(S["UIstate"].selectedOrgnumber) )
      .sort( (EventA, EventB) => EventA.getAttributeValue("eventAttribute/1000") - EventB.getAttributeValue("eventAttribute/1000")  )

    try {S.selectedCompany = constructEvents(S, S.getUserEvents())} catch (error) {console.log(error)}

    console.log("State: ", S)
    let A = getUserActions(S, DB)

    S.elementTree = generateHTMLBody(S, A )
    sideEffects.updateDOM( S.elementTree )
}

sideEffects.configureClient();

let Admin = {
    S: null,
    updateClientRelease: (newVersion) => sideEffects.APIRequest("POST", "updateClientRelease", JSON.stringify({"clientVersion": newVersion})),
    resetServer: () => sideEffects.APIRequest("GET", "resetServer", null),
}

//Archive
let getRetractionDatomsWithoutChildren = Entities => Entities.map( Entity =>  Object.entries( Entity ).filter( entry => typeof entry[1] !== "function" ).map( e => newDatom(Entity.getAttributeValue("entity"), e[0], e[1], false) ).filter( d => d["attribute"] !== "entity" ) ).flat() //Need to also get children