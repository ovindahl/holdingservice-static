const Database = {
  tx: null,
  Entities: [],
  setLocalState: (entity, newState) => {

    let updatedEntity = Database.getServerEntity(entity)
    updatedEntity.localState = newState
    Database.Entities = Database.Entities.filter( Entity => Entity.entity !== updatedEntity.entity ).concat( updatedEntity )
    update( Database.S )
    
    return;
  },
  getLocalState: entity => {

    let serverEntity = Database.getServerEntity(entity)
    let localState = serverEntity.localState 
      ? serverEntity.localState
      : {tx: serverEntity.Datoms.map( Datom => Datom.tx ).filter( tx => !isUndefined(tx) ).sort().slice(-1)[0]}
    
    return localState




  },
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
      Database.recalculateCompanies()

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
      Database.recalculateCompanies()
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
    Database.recalculateCompanies()
    update( Database.S )
  },
  createEvent: (eventType, orgNumber, eventIndex, parentProcess) => {

    let eventTypeAttributes = Database.get(eventType, "eventType/eventAttributes" )
    let eventTypeDatoms = eventTypeAttributes.map( attribute => {
      let functionString = Database.get(attribute, "attribute/startValue" )
      let func = new Function( ["Database"], functionString )
      let value = func(Database)
      let Datom = newDatom("newEntity", Database.attrName(attribute), value )  
      return Datom
    } ).filter( Datom => Datom.attribute !== "eventAttribute/1000" ).filter( Datom => Datom.attribute !== "event/process" )
    let Datoms = [
      newDatom("newEntity", "event/eventTypeEntity", eventType),
      newDatom("newEntity", "eventAttribute/1005", orgNumber),
      newDatom("newEntity", "eventAttribute/1000", eventIndex),
      newDatom("newEntity", "event/process", parentProcess),
    ].concat(eventTypeDatoms)
    if(Datoms.every( Datom => isString(Datom.entity) && isString(Datom.attribute) && !isUndefined(Datom.value) )){Database.createEntity(46, Datoms)}else{log("Datoms not valid: ", Datoms)}
  },
  retractEntity: async entity => {
    let Datoms = Database.getServerEntity(entity).Datoms
    let activeDatoms = Datoms.filter( Datom => Datoms.filter( dat => dat.attribute === Datom.attribute && dat.tx > Datom.tx ).length === 0  )
    let retractionDatoms = activeDatoms.map( Datom => newDatom(entity, Datom.attribute, Datom.value, false) )
    let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( retractionDatoms ) )
    Database.Entities = Database.Entities.filter( Entity => Entity.entity !== entity ).concat( serverResponse[0] )
    Database.recalculateCompanies()
    update( Database.S )
  },
  submitDatoms: async datoms => await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( datoms ) ),
  getEntityColor: entity => Database.get( Database.get(entity, "entity/entityType" ), Database.attrName(20) ),
  init: async () => { 
    Database.Entities = await sideEffects.APIRequest("GET", "Entities", null)
    const attrNameToEntity = mergeArray(Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 ).map( serverEntity => createObject(serverEntity.current["attr/name"], serverEntity.entity) ))
    Database.attr = attrName => isNumber(attrName) ? attrName : attrNameToEntity[attrName]
    Database.account = accountNumber => mergeArray( Database
      .getAll(5030)
      .map( entity => createObject( Database.get(entity, "entity/label").substr(0, 4), entity ) ) 
    )[accountNumber]

    Database.recalculateCompanies()

    return;
  },
  attrName: attribute => isNumber(attribute) 
    ? Database.get(attribute, "attr/name") 
    : Database.attr(attribute)
      ? attribute
      : log(undefined, `[ Database.attrName(${attribute}) ]: Attribute ${attribute} does not exist`),
  getServerEntity: entity => {
    let serverEntity = Database.Entities.find( serverEntity => serverEntity.entity === entity  );
    
    if(isUndefined(serverEntity)){return log(undefined, `[ Database.getServerEntity(${entity}) ]: Entity ${entity} does not exist`)}
    else{
      serverEntity.Datoms = serverEntity.Datoms.map( serverDatom => isUndefined(serverDatom.tx) ? mergerino(serverDatom, {tx: 0}) : serverDatom )
      return serverEntity}
  },
  getServerDatom: (entity, attribute, version) => {
    let serverEntity = Database.getServerEntity(entity)
    if(isUndefined(serverEntity)){return log(undefined, `[ Database.getServerDatom(${entity},${attribute}, ${version}) ]: Entity ${entity} does not exist`)}
    if(isUndefined(Database.attrName(attribute))){return log(undefined, `[ Database.getServerDatom(${entity},${attribute}, ${version}) ]: Attribute ${attribute} does not exist`)}
    let attributeDatoms = serverEntity.Datoms.filter( Datom => Datom.attribute === Database.attrName(attribute) )
    if(attributeDatoms.length === 0){return log(undefined, `[ Database.getServerDatom(${entity},${attribute}, ${version}) ]: Entity ${entity} does not have any datoms with attribute ${Database.attrName(attribute)} [${Database.attr(attribute)}]`)}
    let selectedDatom = isUndefined(version) 
      ? attributeDatoms.slice(-1)[0]
      : attributeDatoms
        .map( serverDatom => isUndefined(serverDatom.tx) ? mergerino(serverDatom, {tx: 0}) : serverDatom ) //NB: Some early datoms lacks tx.....
        .filter( serverDatom => serverDatom.tx <= version ).slice(-1)[0]
    if(isUndefined(selectedDatom)){return log(undefined, `[ Database.getServerDatom(${entity},${attribute}, ${version}) ]: Entity ${entity} does not have any datoms with attribute ${Database.attrName(attribute)} [${Database.attr(attribute)}] with version <= ${version}`)}
    return selectedDatom
  },
  getDatom: (entity, attribute, version) => {
    let selectedDatom = Database.getServerDatom(entity, attribute, version)
    if(isUndefined(selectedDatom)){return log(undefined, `[ Database.getDatom(${entity},${attribute}, ${version}) ]: Datom does not exist`)}
    selectedDatom.attr = Database.attr(selectedDatom.attribute)
    selectedDatom.valueType = Database.getServerEntity(selectedDatom.attr).current["attribute/valueType"] //Should not need validation?
    return selectedDatom
  },
  getOptions: (entity, attribute, version) => {
    let selectedDatom = Database.getServerDatom(entity, attribute, version)
    if(isUndefined(selectedDatom)){return log(undefined, `[ Database.getDatom(${entity},${attribute}, ${version}) ]: Datom does not exist`)}
    selectedDatom.attr = Database.attr(selectedDatom.attribute)
    selectedDatom.valueType = Database.getServerEntity(selectedDatom.attr).current["attribute/valueType"] //Should not need validation?
    if([32, 37].includes(selectedDatom.valueType)){
      try {
        let optionObjects = new Function( ["Database"] , Database.get(Database.attr(selectedDatom.attribute), "attribute/selectableEntitiesFilterFunction") )( Database )
        //Should return array of [{value: x, label: y}]
        return optionObjects
      } catch (error) {return log([], error)}
    }
    return selectedDatom
  },
  get: (entity, attribute, version) => isUndefined(attribute) 
    ? Database.getServerEntity(entity)
    : Database.getServerDatom(entity, attribute, version).value,
  getAll: entityType => Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === entityType ).map(E => E.entity),
  selectEntity: entity => update( mergerino(Database.S, {"UIstate": {"selectedEntity": entity}})  ),
  getEvent: entity => {
    
    let serverEntity = Database.getServerEntity(entity)
    let Event = {
      userInput: attribute => serverEntity.current[Database.attrName(attribute)] ? serverEntity.current[Database.attrName(attribute)] : undefined,
      get: attribute => serverEntity.current[Database.attrName(attribute)] ? serverEntity.current[Database.attrName(attribute)] : undefined,
      latestEntityID: () => 0,
      companyAttribute: () => "TBD",
      account: () => "TBD",
    }

    return Event
  },
  recalculateCompanies: () => {

    Database.Companies = Database.getAll( 46 )
      .map( event => Database.get(event, "eventAttribute/1005") )
      .filter( filterUniqueValues )
      .map( orgNumber => Database.createCompany(orgNumber) )

  },
  createCompany: orgNumber => {
    let companyEvents = Database.getAll( 46 )
    .filter( event => Database.get(event, "eventAttribute/1005") === orgNumber )
    .sort( (eventA, eventB) => Database.get(eventA, "eventAttribute/1000") - Database.get(eventB, "eventAttribute/1000")  )
    let Company = companyEvents.reduce( (Company, event, index) => {
        let Event = Database.getEvent(event);

        let t = index + 1
        Company.t = t;

        let Q = {
          latestEntityID: () => Company.latestEntityID,
          account: accountNumber => Database.account(accountNumber)
        }

        let eventDatoms = Database.get( Database.get(event, "event/eventTypeEntity") , "eventType/newDatoms").map( datomConstructor => {
                    
          let datom;
          try {
            datom = {"entity": new Function( [`Q`, `Database`, `Company`, `Event`], datomConstructor["entity"] )( Q, Database, Company, Event ), "attribute": datomConstructor.attribute, "value": new Function( [`Q`, `Database`, `Company`, `Event`], datomConstructor["value"] )( Q, Database, Company, Event ),"t": t }
            
          
          }
          catch (error) {datom = {"entity": new Function( [`Q`, `Database`, `Company`, `Event`], datomConstructor["entity"] )( Q, Database, Company, Event ),"attribute": datomConstructor.attribute,"value": "ERROR" ,"t": t, "error": String(error)}}
          finally{
            if( [1112, 1131, 1080, 1086, 1097, 1137].includes( datom.attribute ) ){
              Company.idents[ datom.value ] = datom.entity
            }
            return datom
          }
        }).sort( (datomA, datomB) => datomA.entity - datomB.entity )
        Company.Datoms = Company.Datoms.concat(eventDatoms)

        Company.Entities = Object.values(Company.Datoms.reduce( (Entities, Datom) => mergerino(
          Entities,
          createObject(Datom.entity, {entity: Datom.entity, t: Datom.t}),
          createObject(Datom.entity, createObject(Datom.attribute, Datom.value ))
        ), [] ));

        

        Company.getDatom = (entity, attribute, t) => Company.Datoms
          .filter( Datom => Datom.entity === entity )
          .filter( Datom => Datom.attribute === attribute )
          .filter( Datom => isDefined(t) ? Datom.t <= t : true )
          .slice( -1 )[0]

        Company.get = (entity, attribute, t) => Company.getDatom(entity, attribute, t).value

        Company.getAll = (entityType, t) => Company.Entities
          .filter( companyEntity => companyEntity["19"] === entityType )
          .filter( Datom => isDefined(t) ? Datom.t <= t : true )
          .map( companyEntity => companyEntity.entity )

        Company.getOptions = (attribute, t) => {

          let options = [];

          try {options = new Function( ["Database", "Company", "t"] , Database.get(attribute, "attribute/selectableEntitiesFilterFunction") )( Database, Company, t )} 
          catch (error) { log(error) }

          return options

        }

        Company.idents = mergeArray( Company.Datoms
          .filter( Datom => isDefined( Company.getDatom(Datom.entity, 19) )   )
          .filter( Datom => [1112, 1131, 1080, 1086, 1097, 1137].includes( Datom.attribute ) )
          .map( Datom => createObject(Datom.value, Datom.entity) )
          )

        Company.id = id => Company.idents[id]

        Company.getEntityValueFromID = (id, attribute) => Company.get( Company.id(id), attribute )

        Company.getAccountBalance = accountNumber => `[Saldobalanse for ${accountNumber}]`
        Company.sumAccountBalance = accountNumbers => `[Saldobalanse for ${accountNumbers}]`

        Company.latestEntityID = Company.Datoms
            .map( Datom => Datom.entity )
            .sort( (a, b) => a - b )
            .slice( -1 )[0]

        return Company
      } , {
        orgNumber: orgNumber,
        events: companyEvents,
        Datoms: [],
        Entities: [],
        Reportfields: [],
        latestEntityID: 0,
        idents: {}
      }  )
      return Company;
  },
  getCompany: orgNumber => Database.Companies.find( Company => Company.orgNumber === orgNumber ),
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

let newDatom = (entity, attribute, value, isAddition) => returnObject({entity, attribute, value, isAddition: isAddition === false ? false : true })

let getUserActions = (S, Database) => returnObject({
    updateLocalState: (patch) => update({
      UIstate: mergerino( S["UIstate"], patch )
    })
})


let update = ( S ) => {

    console.log("Database", Database)

    console.log("S", S)
    
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
    
    console.log("State: ", S)
    let A = getUserActions(S, Database)

    let startTime = Date.now()
    S.elementTree = generateHTMLBody(S, A )
    sideEffects.updateDOM( S.elementTree )
    console.log(`generateHTMLBody finished in ${Date.now() - startTime} ms`)


    

    backgroundDataSync(S)
    

}

let backgroundDataSync = S => {
  let userEntity = S.UIstate.user === "ovindahl@gmail.com" ? 5614 : 5613
  let savedState = Database.get(userEntity, 5615)
  let hasChanged = JSON.stringify(savedState) !== JSON.stringify(S.UIstate)
  if( hasChanged ){Database.updateEntityInBackground( userEntity, 5615, S.UIstate )}
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

















//let newAttributes = []
    //let datoms = prepareImportDatoms(newAttributes)
    //let serverResponse = Database.submitDatoms(datoms)
    //console.log("serverResponse", serverResponse)

  //let prepareImportDatoms = newAttributesArray => newAttributesArray.map( attrObject =>  Object.entries(attrObject).filter(entry => entry[0] !== "entity" ).map( entry => newDatom(attrObject.entity, entry[0], entry[1] ) )   ).flat()



  
let updateCompanyMethods = Company => {

  Company.ids = mergeArray( Object.entries(Company.Entities)
    .map( Entry => Object.entries(Entry[1]).map( entry => returnObject({entity: Entry[0], attribute: Number(entry[0]), value: entry[1]}) ) ).flat()
    .filter( Datom => [1112, 1131, 1080, 1086, 1097, 1137].includes( Datom.attribute )   )
    .map( Datom => createObject( Datom.value, Datom.entity) )
  )

  let companyEntities = Object.values(Company.Entities)

  Company.accounts = companyEntities.filter( Entity => Entity[19] === 5672  ).map(  Entity => Entity[1653] ).filter( filterUniqueValues )
  
  Company.accountBalanceObject = mergeArray( Company.accounts.map( accountEntity => createObject(accountEntity, companyEntities
    .filter( Entity => Entity[19] === 5672  )
    .filter( Entity => Entity[1653] === accountEntity  )
    .reduce( (Sum, recordEntity) => Sum + recordEntity[1083], 0  )  ) )   )

  Company.getEntityFromID = id => Company.ids[id] ? Company.getEntity(Company.ids[id]) : undefined
  Company.getEntityNumberFromID = id => Company.ids[id] ? Company.getEntity(Company.ids[id]).entity : undefined

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

  Company.getEntityValueFromEntity = (entity, attribute) => Company.getEntity(entity)[attribute] ? Company.getEntity(entity)[attribute] : "Aktøren har ikke den forespurte attributten"

  Company.getEntity = entity => Company.Entities[entity] ? Company.Entities[entity] : "Entiteten finnes ikke"
  
  Company.getAttributeValue = attribute => Company.getEntityValueFromEntity(1, attribute)

  Company.getAccountEntity = accountNumber => mergeArray( Database.getAll(5030).map( entity => createObject( Database.get(entity, "entity/label").substr(0, 4), entity ) ) )[accountNumber]

  Company.getAccountBalance = accountNumber => {
    let accountEntity = Company.getAccountEntity(accountNumber)
    return Company.accountBalanceObject[accountEntity] ? Company.accountBalanceObject[accountEntity] : 0;
  }

  Company.sumAccountBalance = accountNumbers => accountNumbers.reduce( (sum, accountNumber) => sum + Company.getAccountBalance(accountNumber), 0 )

  Company.getLatestEntityID = () => Number(Object.keys(Company.Entities)[ Object.keys(Company.Entities).length - 1 ])
  Company.getVersion = t => Company.previousVersions.filter( Company => Company.t === t  )[0]

  Company.getReport = (report, t) => mergeArray( Database.get(report, "report/reportFields").map( reportField => {

    

    let selectedCompanyVersion = ( typeof t === "undefined" || t === Company.t ) ? Company : Company.getVersion(t)


    let reportFunction = new Function( [`Company`], reportField["value"] )
          let calculatedReport;
          try {
            calculatedReport = reportFunction( selectedCompanyVersion )
            
          } catch (error) {
            console.log("reportFunction error", error, Company, reportField )
            calculatedReport = undefined
          }

    return createObject(reportField.attribute, calculatedReport ) 
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

  let Company = initialCompany

  try {

    Company = Events.reduce( (Company, Event) => {

      let t = Company.t + 1 
  
      let eventType = Database.get(Event.entity, "event/eventTypeEntity")
  
      let isApplicable = [
        (Company, Event) => Company.isValid,
        (Company, Event) => Database.get(eventType, "eventType/eventAttributes").every( attribute =>  new Function(`inputValue`, Database.get( attribute, "attribute/validatorFunctionString") )( Database.get(Event.entity, attribute ) ) ),
        (Company, Event) => Database.get(eventType, "eventType/eventValidators").every( eventValidator =>  new Function([`Q`], Database.get(eventValidator, "eventValidator/validatorFunctionString")( Company ) )),
      ].every( validatorFunction => validatorFunction(Company, Event) )
  
  
      if(isApplicable){
  
        let Q = {
          account: accountNumber => Company.getAccountEntity(accountNumber),
          userInput: attribute => Database.get(Event.entity, attribute ),
          getActorEntity: actorID => Object.values(Company.Entities)
            .filter( Entity => Object.keys(Entity).includes("1112")  )
            .filter( Entity => Entity["1112"] === actorID  )
            [0].entity,
          getEntityFromID: id => Company.getEntityFromID(id),
          getEntityValueFromID: (id, attribute) => Company.getEntityValueFromID(id, attribute),
          get: attribute => Database.get(Event.entity, attribute ),
          companyAttribute: attribute => Company.getAttributeValue(attribute),
          latestEntityID: () => Company.getLatestEntityID(),
        }

        let dbObject = {
          account: accountNumber => Company.getAccountEntity(accountNumber),
        }

        let eventObject = {
          userInput: attribute => Database.get(Event.entity, attribute ),
          get: attribute => Database.get(Event.entity, attribute ),
        }

        let companyObject = {
          getActorEntity: actorID => Object.values(Company.Entities)
            .filter( Entity => Object.keys(Entity).includes("1112")  )
            .filter( Entity => Entity["1112"] === actorID  )
            [0].entity,
          getEntityFromID: id => Company.getEntityFromID(id),
          getEntityNumberFromID: id => Company.getEntityNumberFromID(id),
          getEntityValueFromID: (id, attribute) => Company.getEntityValueFromID(id, attribute),
          get: (entity, attribute) => Company.getEntity(entity)[attribute],
          companyAttribute: attribute => Company.getAttributeValue(attribute),
          latestEntityID: () => Company.getLatestEntityID()
        }
  
        let eventDatoms = Database.get(eventType, "eventType/newDatoms").map( datomConstructor => {

          let entityFunction = new Function( [`Q`, `Database`, `Company`, `Event`], datomConstructor["entity"] )
          let calculatedEntity;
          try {
            calculatedEntity = entityFunction( Q, dbObject, companyObject, eventObject )
            
          } catch (error) {
            console.log("entityFunction error", error, Event, datomConstructor )
            calculatedEntity = undefined
          }

          let valueFunction = new Function( [`Q`, `Database`, `Company`, `Event`], datomConstructor["value"] )
          let calculatedValue;
          try {
            calculatedValue = valueFunction( Q, dbObject, companyObject, eventObject )
            
          } catch (error) {
            console.log("valueFunction error", error, Event, datomConstructor )
            calculatedValue = undefined
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
  
    }, updateCompanyMethods(Company) )
    
  } catch (error) {
    console.log(error)
  }

  

  return Company

}