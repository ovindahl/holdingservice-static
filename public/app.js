const Database = {
  tx: null,
  Entities: [],
  applyEntityMethods: serverEntity => {

    let Entity = {
      entity: serverEntity.entity,
      Datoms: serverEntity.Datoms.map( Datom => typeof Datom.tx === "undefined" ? mergerino(Datom, {tx: 0}) : Datom ),
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



    Entity.getDatom = (attributeName, version) => {

      let D = Entity.Datoms
      .filter( Datom => Datom.attribute === attributeName )
      .filter( Datom => version ? Datom.tx <= version : true )
      .reverse()[0] 

      if(D){
        D.update = async submittedValue => {
          let updatedEntity = await Database.updateEntity( Entity.entity, D.attribute, submittedValue )
          update(Database.S)
        } 

        //D.Attribute = () => Database.getEntity(  )



      }
      return D

    } 

    Entity.getAttributeValue = attributeName => Entity.getDatom(attributeName) 
      ? Entity.getDatom(attributeName).isAddition
        ? Entity.getDatom(attributeName).value 
        : undefined //To be verified....
      : undefined



    Entity.type = Entity.getAttributeValue("entity/entityType")
    Entity.label = Entity.getAttributeValue("entity/label") ? Entity.getAttributeValue("entity/label") : `[${Entity.entity}] mangler visningsnavn.`
    Entity.category = Entity.getAttributeValue("entity/category")

    Entity.getRetractionDatoms = () => Entity.getActiveDatoms().map( Datom => newDatom(Entity.entity, Datom.attribute, Datom.value, false) )

    Entity.update = async ( attribute, newValue ) => {
      let updatedEntity = await Database.updateEntity( Entity.entity, attribute, newValue )
      update(Database.S)
    } 
    Entity.retract = async ( ) => {
      let updatedEntity = await Database.retractEntity( Entity.entity )
      update(Database.S)
    } 

    Entity.localState = isUndefined(serverEntity.localState) 
      ? {tx: Entity.tx }
      : serverEntity.localState
    
    Entity.setLocalState = newState => {
      Entity.localState = newState
      Database.updateDatabaseEntity(Entity)
      update(Database.S)
    } 

    if(Entity.type === 46 ){
      Entity.EventType = () => Database.getEntity( Entity.getAttributeValue("event/eventTypeEntity") )
    }
    return Entity
  },
  updateEntity: async (entity, attribute, value) => {

    let attr =  typeof attribute === "string" ? Database.attr(attribute) : attribute
    let Attribute = Database.getEntity( attr )
    let ValueType = Database.getEntity( Attribute.getAttributeValue("attribute/valueType") )

    let isValid_existingEntity = typeof Database.getEntity(entity) === "object"
    let isValid_valueType = new Function("inputValue", ValueType.getAttributeValue("valueType/validatorFunctionString") ) ( value )
    let isValid_attribute = new Function("inputValue", Attribute.getAttributeValue("attribute/validatorFunctionString") ) ( value )
    let isValid_notNaN = !Number.isNaN(value)


    //Add checks for whether attribtue is valid for the entity type?

    if( isValid_existingEntity && isValid_valueType && isValid_attribute && isValid_notNaN  ){
      let Datom = newDatom(entity, Attribute.getAttributeValue("attr/name"), value )
      let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( [Datom] ) )
      Database.updateDatabaseEntity(serverResponse[0])
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
    Database.updateDatabaseEntity(serverResponse[0])
  },
  retractEntity: async entity => {
    let Entity = Database.getEntity(entity)
    let retractDatoms = Entity.getRetractionDatoms()
    let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( retractDatoms ) )
    Database.updateDatabaseEntity(serverResponse[0])
  },
  updateDatabaseEntity: serverEntity => {

    let updatedEntity = Database.applyEntityMethods(serverEntity)
    Database.Entities = Database.Entities.filter( Entity => Entity.entity !== updatedEntity.entity ).concat( updatedEntity )

    Database.find = filterFunction => Database.Entities.filter( filterFunction )
    Database.attrName = attribute => Database.find( Entity => Entity.entity === attribute )[0].getAttributeValue("attr/name")
    Database.attr = attrName => Database.find( Entity => Entity.type === 42 ).filter( Entity => Entity.getAttributeValue("attr/name") === attrName )[0].entity
    Database.tx = Database.find( Entity => true ).map( Entity => Entity.tx ).reverse()[0]
    Database.getEntity = entity => Database.find( E => E.entity === entity  )[0]
    
    return Database
  },
  updateEntities: Entitites => {

    Database.Entities = Entitites.map( serverEntity => Database.applyEntityMethods(serverEntity) )
    Database.find = filterFunction => Database.Entities.filter( filterFunction )
    Database.attrName = attribute => Database.find( Entity => Entity.entity === attribute )[0].getAttributeValue("attr/name")
    Database.attr = attrName => Database.find( Entity => Entity.type === 42 ).filter( Entity => Entity.getAttributeValue("attr/name") === attrName )[0].entity
    Database.tx = Database.find( Entity => true ).map( Entity => Entity.tx ).reverse()[0]
    Database.getEntity = entity => Database.find( E => E.entity === entity  )[0]
    
    return Database
  },
  submitDatoms: async datoms => await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( datoms ) ),
  init: async () => { 
    let serverResponse = await sideEffects.APIRequest("GET", "Entities", null)
    Database.updateEntities( serverResponse )
    return;
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

            init()
            
            
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

let updateCompanyMethods = Company => {

  Company.getEntity = entity => Company.Entities[entity]
  Company.getAttributeValue = attribute => Company.getEntity(1)[attribute]
  Company.getLatestEntityID = () => Number(Object.keys(Company.Entities)[ Object.keys(Company.Entities).length - 1 ])
  Company.getVersion = t => Company.previousVersions.filter( Company => Company.t === t  )[0]
  Company.getReport = (report, t) => mergeArray( Database.getEntity(report).getAttributeValue("report/reportFields").map( reportField => {

    let selectedCompanyVersion = ( typeof t === "undefined" || t === Company.t ) ? Company : Company.getVersion(t)

    let ReportField = createObject(reportField.attribute, new Function( [`Company`], reportField["value"] )( selectedCompanyVersion ) )

    return ReportField
  }))

  Company.getEntities = (filterFunction) => Object.values(Company.Entities).filter( filterFunction )
  

  return Company
}

let constructEvents = Events => {

  let initialCompany = {
    t: 0,
    Events: Events,
    Datoms: [],
    Entities: {
      "1": {}
    },
    previousVersions: [],
    isValid: true
  }



  Company = Events.reduce( (Company, Event) => {

    let t = Company.t + 1

    let EventType = Event.EventType()

    /* S.Attributes = DB.find( Entity => Entity.type === 42 )
    S.allEventTypes = DB.find( Entity => Entity.type === 43 )
    S.ValueTypes = DB.find( Entity => Entity.type === 44 )
    S.EntityTypes = DB.find( Entity => Entity.type === 47 )
    S.accounts = DB.find( Entity => Entity.type === 5030 )
    S.Reports = DB.find( Entity => Entity.type === 49 ) */

    let isApplicable = [
      (Company, Event) => Company.isValid,
      (Company, Event) => Database.find( Entity => Entity.type === 43 ).map( E => E.entity).includes( Event.getAttributeValue("event/eventTypeEntity") ),
      (Company, Event) => EventType.getAttributeValue("eventType/eventAttributes").every( attribute =>  new Function(`inputValue`, Database.getEntity( attribute ).getAttributeValue("attribute/validatorFunctionString") )( Event.getAttributeValue( Database.getEntity( attribute ).getAttributeValue("attr/name") ) ) ),
      (Company, Event) => EventType.getAttributeValue("eventType/eventValidators").every( eventValidator =>  new Function([`Q`], Database.getEntity(eventValidator).getAttributeValue("eventValidator/validatorFunctionString"))( Company ) ),
    ].every( validatorFunction => validatorFunction(Company, Event) )


    if(isApplicable){

      let Q = {
        account: accountNumber => Database.find( Entity => Entity.type === 5030 ).filter( Entity => Entity.label.startsWith(accountNumber) )[0].entity,
        Account:  accountNumber => Database.find( Entity => Entity.type === 5030 ).filter( Entity => Entity.label.startsWith(accountNumber) )[0].entity,
        userInput: attribute => Event.getAttributeValue(Database.getEntity(attribute).getAttributeValue("attr/name") ),
        companyAttribute: attribute => Company.getAttributeValue(attribute),
        latestEntityID: () => Company.getLatestEntityID()
      }

      let eventDatoms = EventType.getAttributeValue("eventType/newDatoms").map( datomConstructor => returnObject({
          "entity": new Function( [`Q`], datomConstructor["entity"] )( Q ),
          "attribute": datomConstructor.attribute,
          "value": new Function( [`Q`], datomConstructor["value"] )( Q ),
          "t": t
        })
      )

      let Entities = eventDatoms.reduce( (updatedEntities, datom) => mergerino(
        updatedEntities,
        createObject(datom.entity, {entity: datom.entity, t: datom.t}),
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

      return updateCompanyMethods(updatedCompany);

    }else{return mergerino(Company, {isValid: false}) }

  }, updateCompanyMethods(initialCompany) )

  return Company

}

let newDatom = (entity, attribute, value, isAddition) => returnObject({entity, attribute, value, isAddition: isAddition === false ? false : true })

let getUserActions = (S, Database) => returnObject({
    updateLocalState: (patch) => update({
      UIstate: mergerino( S["UIstate"], patch )
    }),
    createEntity: async entityTypeEntity => {

      let updatedDB = await Database.createEntity(entityTypeEntity)

      let newEntity = updatedDB.getLatestModifiedEntity()

      let updatedState = mergerino(S, {UIstate: {"selectedEntity": newEntity}})

      if(entityTypeEntity === 42){updatedState["UIstate"]["eventAttributeSearchString"] = "[Attributt uten navn]" }



      update(updatedState )


    },
    retractEntity: async entity => {

      let updatedDB = await Database.getEntity(entity).retract()

      let updatedState = mergerino(S, {UIstate: {"selectedEntity": null}})

      update(updatedState )


    },
    createEvent: async ( prevEvent, newEventTypeEntity ) => {

      let eventDatoms = [
        newDatom("newEntity", "event/eventTypeEntity", newEventTypeEntity),
        newDatom("newEntity", Database.getEntity(1005).getAttributeValue("attr/name"), prevEvent.getAttributeValue( Database.getEntity(1005).getAttributeValue("attr/name") ) ),
        newDatom("newEntity", Database.getEntity(1000).getAttributeValue("attr/name"), prevEvent.getAttributeValue( Database.getEntity(1000).getAttributeValue("attr/name") ) + 1 )
      ]
      let updatedDB = await Database.createEntity(46, eventDatoms )

      update( S )

    },
    createCompany: async () => {

      let eventDatoms = [
        newDatom("newEntity", "event/eventTypeEntity", 5000),
        newDatom("newEntity", Database.getEntity(1005).getAttributeValue("attr/name"), randBetween(800000000, 1000000000) ),
        newDatom("newEntity", Database.getEntity(1000).getAttributeValue("attr/name"), 1 )
      ]
      let updatedDB = await Database.createEntity(46, eventDatoms )
      update( S )

    },
    update: newDB => update({UIstate: S["UIstate"]})
})

let update = ( S ) => {

    console.log("Database", Database)

    //DB queries
    S.getEntity = entity => Database.getEntity(entity)


    



    S.Events = Database.find( Entity => Entity.type === 46 )
    S.orgNumbers = S.Events.map( Entity => Entity.getAttributeValue("eventAttribute/1005") ).filter( filterUniqueValues )
    S.userEvents = S.Events
    .filter( Event => Event.getAttributeValue("eventAttribute/1005") === Number(S["UIstate"].selectedOrgnumber) )
    .sort( (EventA, EventB) => EventA.getAttributeValue("eventAttribute/1000") - EventB.getAttributeValue("eventAttribute/1000")  )
    
    S.selectedCategories = Database.find( Entity => Entity.type === S["UIstate"].selectedEntityType ).map( Entity => Entity.getAttributeValue("entity/category") ).filter(filterUniqueValues)
    S.selectedEntities = Database.find( Entity => Entity.type === S["UIstate"].selectedEntityType && Entity.getAttributeValue("entity/category") === S["UIstate"].selectedCategory )
    
    Database.S = S;
    Database.S = S;
    Admin.S = S;
    Admin.DB = Database

    try { S.selectedCompany = constructEvents( S.userEvents )} catch (error) {console.log(error)}

    console.log("State: ", S)
    let A = getUserActions(S, Database)

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



let init = async () => {


  await Database.init();



      let S = {
        UIstate: {
          "currentPage": "timeline",
          "selectedOrgnumber": null,
          "companyDocPage/selectedVersion": 1,
          "selectedEntityType" : 42,
          "selectedCategory": null,
          "selectedEntity": 6,
          "selectedReport": 5575,
          "selectedVersion": 0,
          "eventAttributeSearchString": "1920",
        }
      }

    update( S )



}