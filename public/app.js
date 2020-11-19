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
    return updatedEntity
  },
  createEvent: (eventType, parentProcess) => {

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
    : isDefined( Database.getServerDatom(entity, attribute, version) )
      ? Database.getServerDatom(entity, attribute, version).value
      : undefined,
  getAll: entityType => Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === entityType ).map(E => E.entity),
  selectEntity: entity => update( mergerino(Database.S, {"UIstate": {"selectedEntity": entity}})  ),
  getEvent: entity => {
    
    let Event = {get: attribute => Database.get(entity, attribute)}

    Event.isValid = () => {

      let Company = Database.getCompany( Database.get( entity, "eventAttribute/1005") )
      let eventValidators = Database.get( Database.get(entity, "event/eventTypeEntity"), "eventType/eventValidators" )
      let isValid = eventValidators.every( eventValidator => new Function( [`Database`, `Company`, `Event`], Database.get( eventValidator, "eventValidator/validatorFunctionString")  )( Database, Company, Event ) )

      return isValid
    } 

    return Event
  },
  recalculateCompanies: () => Database.Companies = Database.getAll( 5722 ).map( company => Database.createCompany( company) ),
  createCompany: company => {


    let companyProcesses = Database.getAll(5692)
    .filter( e => Database.get(e, "process/company" ) === company )

    let events = Database.getAll(46)
    .filter( event => companyProcesses.includes( Database.get(event, "event/process") )  )
    .sort(  (a,b) => Database.get(a, "event/date" ) - Database.get(b, "event/date" ) )


    let Company = events.reduce( (Company, event, index) => {
        let Event = Database.getEvent(event);
        let t = index + 1
        Company.t = t;
        let Q = {latestEntityID: () => Company.latestEntityID}
        
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

        Company.get = (entity, attribute, t) => isDefined(Company.getDatom(entity, attribute, t))
          ? Company.getDatom(entity, attribute, t).value
          : undefined

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

        Company.getAccountBalance = accountNumber => Company.getAll( 5672 )
          .filter( e => isNumber( Company.get(e, 1653) ) )
          .filter( e => Company.get(e, 1653) === Database.account(accountNumber) )
          .reduce( (sum, e) => sum + Company.get(e, 1083), 0 )


        Company.sumAccountBalance = accountNumbers => Company.getAll( 5672 )
        .filter( e => isNumber( Company.get(e, 1653) ) )
        .filter( e => accountNumbers.map( accountNumber => Database.account(accountNumber)  ).includes( Company.get(e, 1653) )  )
        .reduce( (sum, e) => sum + Company.get(e, 1083), 0 )

        Company.latestEntityID = Company.Datoms
            .map( Datom => Datom.entity )
            .sort( (a, b) => a - b )
            .slice( -1 )[0]

        return Company
      } , {
        entity: company,
        events: events,
        Datoms: [],
        Entities: [],
        latestEntityID: 0,
        idents: {}
      }  )
    
    return Company;
  },
  getCompany: company => Database.Companies.find( Company => Company.entity === company ),
}

let D = Database


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
    D = Database

    console.log("State: ", S)
    let A = getUserActions(S, Database)
    Admin.A = A;

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
    A: null,
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

