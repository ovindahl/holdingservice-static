const Database = {
  tx: null,
  Entities: [],
  setLocalState: (entity, newState) => {

    let updatedEntity = Database.getEntity(entity)
    updatedEntity.localState = newState

    Database.Entities = Database.Entities.filter( Entity => Entity.entity !== updatedEntity.entity ).concat( updatedEntity )
    update( Database.S )
    
    return;
  },
  getLocalState: entity => Database.getEntity(entity).localState,
  updateEntity: async (entity, attribute, value) => {

    let valueType = Database.get( Database.attr(attribute), "attribute/valueType")
    let isValid_existingEntity = Database.Entities.map( E => E.entity).includes(entity)
    let isValid_valueType = new Function("inputValue",  Database.get( valueType, "valueType/validatorFunctionString") ) ( value )
    let isValid_attribute = new Function("inputValue",  Database.get( Database.attr(attribute), "attribute/validatorFunctionString") ) ( value )
    let isValid_notNaN = !Number.isNaN(value)


    //Add checks for whether attribtue is valid for the entity type?

    if( isValid_existingEntity && isValid_valueType && isValid_attribute && isValid_notNaN  ){

      let Datom = newDatom(entity, Database.attrName(attribute), value )
      let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( [Datom] ) )

      let updatedEntity = serverResponse[0]

      let latestTx = serverResponse[0].Datoms.map( Datom => Datom.tx ).filter( tx => !isUndefined(tx) ).sort().reverse()[0]

      updatedEntity.localState = {tx: latestTx }

      Database.Entities = Database.Entities.filter( Entity => Entity.entity !== updatedEntity.entity ).concat( updatedEntity )

      update( Database.S )

    }else{

      console.log("Database.updateEntity did not pass validation.", {isValid_existingEntity, isValid_valueType, isValid_attribute, isValid_notNaN })
      update(Database.S)

    }
    

  },
  updateEntityInBackground: async (entity, attribute, value) => {

    let valueType = Database.get( Database.attr(attribute), "attribute/valueType")
    let isValid_existingEntity = Database.Entities.map( E => E.entity).includes(entity)
    let isValid_valueType = new Function("inputValue",  Database.get( valueType, "valueType/validatorFunctionString") ) ( value )
    let isValid_attribute = new Function("inputValue",  Database.get( Database.attr(attribute), "attribute/validatorFunctionString") ) ( value )
    let isValid_notNaN = !Number.isNaN(value)


    //Add checks for whether attribtue is valid for the entity type?

    if( isValid_existingEntity && isValid_valueType && isValid_attribute && isValid_notNaN  ){

      let Datom = newDatom(entity, Database.attrName(attribute), value )
      let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( [Datom] ) )
      let updatedEntity = serverResponse[0]
      let latestTx = serverResponse[0].Datoms.map( Datom => Datom.tx ).filter( tx => !isUndefined(tx) ).sort().reverse()[0]
      updatedEntity.localState = {tx: latestTx }
      Database.Entities = Database.Entities.filter( Entity => Entity.entity !== updatedEntity.entity ).concat( updatedEntity )

    }else{

      console.log("Database.updateEntity did not pass validation.", {isValid_existingEntity, isValid_valueType, isValid_attribute, isValid_notNaN })

    }
  },
  createEntity: async (entityType, newEntityDatoms) => {

    let Datoms = Database.get( entityType, "entityType/attributes")
      .map( attribute => newDatom("newEntity", Database.attrName(attribute), new Function("S", Database.get(attribute, "attribute/startValue") )( Database )))
      .filter( datom => datom.attribute !== "entity/entityType" )
      .filter( datom => datom.attribute !== "entity/label" )
      .concat([
        newDatom("newEntity", "entity/entityType", entityType ),
        newDatom("newEntity", "entity/label", `[${Database.get(entityType, "entity/label")} uten navn]` ),
        newDatom("newEntity", "entity/category", `Mangler kategori` )
      ])

    if(Array.isArray(newEntityDatoms)){Datoms = Datoms.concat(newEntityDatoms)}
    let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( Datoms ) )
    let updatedEntity = serverResponse[0]
    Database.Entities = Database.Entities.filter( Entity => Entity.entity !== updatedEntity.entity ).concat( updatedEntity )
    update( Database.S )
  },
  createEvent: (eventType, orgNumber, eventIndex) => {

    let eventTypeAttributes = Database.get(eventType, "eventType/eventAttributes" )
    let eventTypeDatoms = eventTypeAttributes.map( attribute => {
      let functionString = Database.get(attribute, "attribute/startValue" )
      let func = new Function( ["Database"], functionString )
      let value = func(Database)
      let Datom = newDatom("newEntity", Database.attrName(attribute), value )  
      return Datom
    } ).filter( Datom => Datom.attribute !== "eventAttribute/1000" )
    let Datoms = [
      newDatom("newEntity", "event/eventTypeEntity", eventType),
      newDatom("newEntity", "eventAttribute/1005", orgNumber),
      newDatom("newEntity", "eventAttribute/1000", eventIndex),
    ].concat(eventTypeDatoms)
    if(Datoms.every( Datom => isString(Datom.entity) && isString(Datom.attribute) && !isUndefined(Datom.value) )){Database.createEntity(46, Datoms)}else{log("Datoms not valid: ", Datoms)}
  } ,
  retractEntity: async entity => {
    let Datoms = Database.getEntity(entity).Datoms
    let activeDatoms = Datoms.filter( Datom => Datoms.filter( dat => dat.attribute === Datom.attribute && dat.tx > Datom.tx ).length === 0  )
    let retractionDatoms = activeDatoms.map( Datom => newDatom(entity, Datom.attribute, Datom.value, false) )
    let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( retractionDatoms ) )
    Database.Entities = Database.Entities.filter( Entity => Entity.entity !== entity ).concat( serverResponse[0] )
    update( Database.S )
  },
  getEventTypes: () => Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 43 ).map( E => E.entity),
  submitDatoms: async datoms => await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( datoms ) ),
  getEntityColor: entity => Database.get( Database.get(entity, "entity/entityType" ), Database.attrName(20) ),
  init: async () => { 
    Database.Entities = await sideEffects.APIRequest("GET", "Entities", null)
    Database.Attributes = Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 )
    Database.eventAttributes = Database.Attributes
      .filter( Attr => Attr.entity >= 1000 )
      .filter( Attr => Attr.current["entity/label"] !== "Ubenyttet hendelsesattributt")
      .map( Attr => Attr.entity ) //To be fixed..    
     Database.ValueTypes = Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 44 ).map( E => E.entity)
    const attrNameToEntity = mergeArray(Database.Attributes.map( serverEntity => createObject(serverEntity.current["attr/name"], serverEntity.entity) )) 
    const attrEntityToName = mergeArray(Database.Attributes.map( serverEntity => createObject(serverEntity.entity, serverEntity.current["attr/name"]) ))
    Database.attrName = attribute => isNumber(attribute) ? attrEntityToName[attribute] : attribute
    Database.attr = attrName => isNumber(attrName) ? attrName : attrNameToEntity[attrName]
    return;
  },
  find: filterFunction => Database.Entities.filter( filterFunction ),
  getEntity: entity => {
    let Entity = Database.Entities.filter(  Entity => Entity.entity === entity   )[0]

    Entity.Datoms = isUndefined(Entity.Datoms)
      ? []
      : Entity.Datoms.map( Datom => typeof Datom.tx === "undefined" ? mergerino(Datom, {tx: 0}) : Datom )
    
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
    Entity.type = Entity.current["entity/entityType"]
    Entity.label = Entity.current["entity/label"] ? Entity.current["entity/label"] : `[${Entity.entity}] mangler visningsnavn.`
    Entity.color = "lightgray"

    Entity.localState = Entity.localState ? Entity.localState : {tx: Entity.Datoms.map( Datom => Datom.tx ).sort().reverse()[0] }

    return Entity





  },
  getEntityVersions: entity => Database.getEntity(entity).Datoms.map( Datom => Datom.tx ).filter( filterUniqueValues ),
  getDatom: (entity, attributeName, version) => {

    let allEntityAttributeDatoms = Database.Entities
    .filter( Entity => Entity.entity === entity )
    .map( Entity => Entity.Datoms ).flat()
    .map( serverDatom => isUndefined(serverDatom.tx) ? mergerino(serverDatom, {tx: 0}) : serverDatom )
    .filter( serverDatom => serverDatom.attribute === Database.attrName(attributeName) )

    let versionFilterDatoms = version 
    ? allEntityAttributeDatoms.filter( serverDatom => version ? serverDatom.tx <= version : true )
    : allEntityAttributeDatoms

    let Datom = versionFilterDatoms.reverse()[0]

    if(!isUndefined(Datom)){

      Datom.ValueType = Datom ? Database.getEntity(Database.attr(Datom.attribute)) : undefined
      Datom.valueType = Datom ? Datom.ValueType.current["attribute/valueType"] : undefined

      if([32, 37].includes(Datom.valueType)){
        Datom.options = new Function( "Database" , Database.get(Database.attr(Datom.attribute), "attribute/selectableEntitiesFilterFunction") )( Database )
      }

    }

    //Datom.Attribute = Database.getEntity( Database.attr(Datom.attribute) )
    


    return Datom

    

  } ,
  get: (entity, attribute, version) => {
    let Datom = Database.getDatom(entity, Database.attrName(attribute), version)
    let Value = isUndefined(Datom) ? undefined : Datom.value
    return Value
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

  Company.ids = mergeArray( Object.entries(Company.Entities)
    .map( Entry => Object.entries(Entry[1]).map( entry => returnObject({entity: Entry[0], attribute: Number(entry[0]), value: entry[1]}) ) ).flat()
    .filter( Datom => [1112, 1131, 1080, 1086, 1097, 1137].includes( Datom.attribute )   )
    .map( Datom => createObject( Datom.value, Datom.entity) )
  )

  

  Company.getEntityFromID = id => Company.ids[id] ? Company.getEntity(Company.ids[id]) : undefined

  Company.getEntityValueFromID = (id, attribute) => {
    if(isUndefined(id)){return "Mangler id"}
    let entity = Company.ids[id]
    if(isUndefined(entity)){return "Aktøren finnes ikke"}
    let Entity = Company.Entities[entity]
    if(isUndefined(entity)){return "Aktøren finnes ikke"}
    let value = Entity[attribute]
    if(isUndefined(value)){return "Aktøren har ikke den forespurte attributten"}
    return value
  } 



  Company.getEntity = entity => Company.Entities[entity]
  Company.getAttributeValue = attribute => Company.getEntity(1)[attribute]
  Company.getLatestEntityID = () => Number(Object.keys(Company.Entities)[ Object.keys(Company.Entities).length - 1 ])
  Company.getVersion = t => Company.previousVersions.filter( Company => Company.t === t  )[0]
  Company.getReport = (report, t) => mergeArray( Database.get(report, "report/reportFields").map( reportField => {

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

  try {

    Company = Events.reduce( (Company, Event) => {

      let t = Company.t + 1
  
      let eventType = Database.get(Event.entity, "event/eventTypeEntity")
  
      let isApplicable = [
        (Company, Event) => Company.isValid,
        //(Company, Event) => Database.find( Entity => Entity.type === 43 ).map( E => E.entity).includes( Event.getAttributeValue("event/eventTypeEntity") ),
        (Company, Event) => Database.get(eventType, "eventType/eventAttributes").every( attribute =>  new Function(`inputValue`, Database.get( attribute, "attribute/validatorFunctionString") )( Database.get(Event.entity, attribute ) ) ),
        (Company, Event) => Database.get(eventType, "eventType/eventValidators").every( eventValidator =>  new Function([`Q`], Database.get(eventValidator, "eventValidator/validatorFunctionString")( Company ) )),
      ].every( validatorFunction => validatorFunction(Company, Event) )
  
  
      if(isApplicable){
  
        let Q = {
          account: accountNumber => accountNumber, //Database.find( Entity => Entity.type === 5030 ).filter( Entity => Entity.label.startsWith(accountNumber) )[0].entity,
          userInput: attribute => Database.get(Event.entity, attribute ),
          getActorEntity: actorID => Object.values(Company.Entities)
            .filter( Entity => Object.keys(Entity).includes("1112")  )
            .filter( Entity => Entity["1112"] === actorID  )
            [0].entity,
          getEntityFromID: id => Company.getEntityFromID(id),
          getEntityValueFromID: (id, attribute) => Company.getEntityValueFromID(id, attribute),
          get: (entity, attribute) => Company.getEntity(entity)[attribute],
          companyAttribute: attribute => Company.getAttributeValue(attribute),
          latestEntityID: () => Company.getLatestEntityID()
        }
  
        let eventDatoms = Database.get(eventType, "eventType/newDatoms").map( datomConstructor => {

          let entityFunction = new Function( [`Q`], datomConstructor["entity"] )
          let calculatedEntity;
          try {
            calculatedEntity = entityFunction( Q )
            
          } catch (error) {
            console.log("entityFunction error", error, Event, datomConstructor )
            calculatedEntity = "ERROR"
          }

          let valueFunction = new Function( [`Q`], datomConstructor["value"] )
          let calculatedValue;
          try {
            calculatedValue = valueFunction( Q )
            
          } catch (error) {
            console.log("valueFunction error", error, Event, datomConstructor )
            calculatedValue = "ERROR"
          }
          
          return returnObject({
            "entity": calculatedEntity,
            "attribute": datomConstructor.attribute,
            "value": calculatedValue,
            "t": t
          })
        } 
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
    
  } catch (error) {
    console.log(error)
  }

  

  return Company

}

let newDatom = (entity, attribute, value, isAddition) => returnObject({entity, attribute, value, isAddition: isAddition === false ? false : true })

let getUserActions = (S, Database) => returnObject({
    updateLocalState: (patch) => {

      update({
        UIstate: mergerino( S["UIstate"], patch )
      })




      //Database.updateEntity(5614, 5615, JSON.stringify({}))
    } ,
    createEntity: async entityTypeEntity => {

      let updatedDB = await Database.createEntity(entityTypeEntity)

      let newEntity = updatedDB.getLatestModifiedEntity()

      let updatedState = mergerino(S, {UIstate: {"selectedEntity": newEntity}})

      if(entityTypeEntity === 42){updatedState["UIstate"]["eventAttributeSearchString"] = "[Attributt uten navn]" }



      update(updatedState )


    },
    createEvent: async ( prevEvent, newEventTypeEntity ) => {

      let eventDatoms = [
        newDatom("newEntity", "event/eventTypeEntity", newEventTypeEntity),
        newDatom("newEntity", Database.attrName(1005), Database.get( prevEvent.entity, Database.attrName(1005) ) ),
        newDatom("newEntity",  Database.attrName(1000), Database.get( prevEvent.entity, Database.attrName(1000) ) + 1 )
      ]
      let updatedDB = await Database.createEntity(46, eventDatoms )

      update( S )

    },
    createCompany: async () => {

      let eventDatoms = [
        newDatom("newEntity", "event/eventTypeEntity", 5000),
        newDatom("newEntity", Database.attrName(1005), randBetween(800000000, 1000000000) ),
        newDatom("newEntity", Database.attrName(1000), 1 )
      ]
      let updatedDB = await Database.createEntity(46, eventDatoms )
      update( S )

    },
    update: newDB => update({UIstate: S["UIstate"]})
})

let update = ( S ) => {

    console.log("Database", Database)

    console.log("S", S)

    S.Events = Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 46 ).map( serverEntity => Database.getEntity(serverEntity.entity) )
    S.EntityTypes = [42, 43, 44, 45, 47, 48, 49, 50, 5030, 5590, 5612] //, 46
    S.Reports =  Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 49 ).map( serverEntity => serverEntity.entity )
    
    
    S.orgNumbers = S.Events.map( Entity => Database.get(Entity.entity, "eventAttribute/1005" ) ).filter( filterUniqueValues )
    S.userEvents = S.Events.filter( Event => Database.get(Event.entity, "eventAttribute/1005") === Number(S["UIstate"].selectedOrgnumber) )
      .sort( (EventA, EventB) => Database.get(EventA.entity, "eventAttribute/1000") - Database.get(EventB.entity, "eventAttribute/1000")  )

    
    S.selectedCategories = Database.Entities
      .filter( serverEntity => serverEntity.current["entity/entityType"] === S["UIstate"].selectedEntityType )
      .map( serverEntity => Database.get(serverEntity.entity, "entity/category" ) )
      .filter(filterUniqueValues)
    
    S.selectedEntities = Database.Entities
      .filter( serverEntity => serverEntity.current["entity/entityType"] === S["UIstate"].selectedEntityType )
      .filter( serverEntity => serverEntity.current["entity/category"] === S["UIstate"].selectedCategory )
      .map( serverEntity => serverEntity.entity )
    
    Database.S = S;
    Admin.S = S;
    Admin.DB = Database

    S.selectedCompany = constructEvents( S.userEvents )

    console.log("State: ", S)
    let A = getUserActions(S, Database)

    let startTime = Date.now()
    S.elementTree = generateHTMLBody(S, A )
    sideEffects.updateDOM( S.elementTree )
    console.log(`generateHTMLBody finished in ${Date.now() - startTime} ms`)


    

    backgroundDataSync(S)
    

}



let backgroundDataSync = S => {
  let savedState = Database.get(5614, 5615)
  let hasChanged = JSON.stringify(savedState) !== JSON.stringify(S.UIstate)
  if( hasChanged ){Database.updateEntityInBackground( 5614, 5615, S.UIstate )}
}




sideEffects.configureClient();

let Admin = {
    S: null,
    updateClientRelease: (newVersion) => sideEffects.APIRequest("POST", "updateClientRelease", JSON.stringify({"clientVersion": newVersion})),
    resetServer: () => sideEffects.APIRequest("GET", "resetServer", null),
}

//Archive


let init = async () => {

  await Database.init();
  let user = await sideEffects.auth0.getUser()
  let userEntity = user.name === "ovindahl@gmail.com" ? 5614 : 5613
  let userState = Database.get(userEntity, 5615 )

  let S = {
    UIstate: userState ? userState : {
      "user": user.name,
      "currentPage": "timeline",
      "selectedOrgnumber": null,
      "companyDocPage/selectedVersion": 1,
      "selectedEntityType" : 42,
      "selectedCategory": undefined,
      "selectedEntity": 6,
      "selectedReport": 5575,
      "selectedVersion": 0,
      "eventAttributeSearchString": "1920",
      "selectedCompanyDocVersion": 1
    }
  }

    update( S )



}