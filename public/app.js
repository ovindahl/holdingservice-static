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
    let Datoms = Database.getServerEntity(entity).Datoms
    let activeDatoms = Datoms.filter( Datom => Datoms.filter( dat => dat.attribute === Datom.attribute && dat.tx > Datom.tx ).length === 0  )
    let retractionDatoms = activeDatoms.map( Datom => newDatom(entity, Datom.attribute, Datom.value, false) )
    let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( retractionDatoms ) )
    Database.Entities = Database.Entities.filter( Entity => Entity.entity !== entity ).concat( serverResponse[0] )
    update( Database.S )
  },
  submitDatoms: async datoms => await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( datoms ) ),
  getEntityColor: entity => Database.get( Database.get(entity, "entity/entityType" ), Database.attrName(20) ),
  init: async () => { 
    Database.Entities = await sideEffects.APIRequest("GET", "Entities", null)
    const attrNameToEntity = mergeArray(Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 ).map( serverEntity => createObject(serverEntity.current["attr/name"], serverEntity.entity) ))
    Database.attr = attrName => isNumber(attrName) ? attrName : attrNameToEntity[attrName]
    return;
  },
  attrName: attribute => isNumber(attribute) 
    ? Database.get(attribute, "attr/name") 
    : Database.attr(attribute)
      ? attribute
      : log(undefined, `[ Database.attrName(${attribute}) ]: Attribute ${attribute} does not exist`),
  getServerEntity: entity => {
    let serverEntity = Database.Entities.find( serverEntity => serverEntity.entity === entity  );
    serverEntity.Datoms = serverEntity.Datoms.map( serverDatom => isUndefined(serverDatom.tx) ? mergerino(serverDatom, {tx: 0}) : serverDatom )
    if(isUndefined(serverEntity)){return log(undefined, `[ Database.getServerEntity(${entity}) ]: Entity ${entity} does not exist`)}
    else{return serverEntity}
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
    if([32, 37].includes(selectedDatom.valueType)){
      try {selectedDatom.options = new Function( "Database" , Database.get(Database.attr(selectedDatom.attribute), "attribute/selectableEntitiesFilterFunction") )( Database )} 
      catch (error) {selectedDatom.options = log([], error)}
    }
    return selectedDatom
  },
  get: (entity, attribute, version) => Database.getServerDatom(entity, attribute, version).value,
  getAll: entityType => Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === entityType ).map(E => E.entity),
  selectEntity: entity => update( mergerino(Database.S, {"UIstate": {"selectedEntity": entity}})  )
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

  let companyEntities = Object.values(Company.Entities)

  Company.accounts = companyEntities.filter( Entity => Entity[29] === 5637  ).map(  Entity => Entity[1653] ).filter( filterUniqueValues )

  Company.accountBalanceObject = mergeArray( Company.accounts.map( accountEntity => createObject(accountEntity, companyEntities
    .filter( Entity => Entity[1653] === accountEntity  )
    .reduce( (Sum, recordEntity) => Sum + recordEntity[1083], 0  )  ) )   )   

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

  Company.getAccountEntity = accountNumber => mergeArray( Database.getAll(5030).map( entity => createObject( Database.get(entity, "entity/label").substr(0, 4), entity ) ) )[accountNumber]

  Company.getAccountBalance = accountNumber => {
    let accountEntity = Company.getAccountEntity(accountNumber)
    return Company.accountBalanceObject[accountEntity];
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
          get: (entity, attribute) => Company.getEntity(entity)[attribute],
          companyAttribute: attribute => Company.getAttributeValue(attribute),
          latestEntityID: () => Company.getLatestEntityID()
        }

        let dbObject = {
          account: accountNumber => Company.getAccountEntity(accountNumber),
        }

        let eventObject = {
          userInput: attribute => Database.get(Event.entity, attribute ),
        }

        let companyObject = {
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
            calculatedEntity = undefined
          }

          let valueFunction = new Function( [`Q`], datomConstructor["value"] )
          let calculatedValue;
          try {
            calculatedValue = valueFunction( Q )
            
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

let newDatom = (entity, attribute, value, isAddition) => returnObject({entity, attribute, value, isAddition: isAddition === false ? false : true })

let getUserActions = (S, Database) => returnObject({
    updateLocalState: (patch) => update({
      UIstate: mergerino( S["UIstate"], patch )
    })
})

let prepareImportDatoms = newAttributesArray => newAttributesArray.map( attrObject =>  Object.entries(attrObject).filter(entry => entry[0] !== "entity" ).map( entry => newDatom(attrObject.entity, entry[0], entry[1] ) )   ).flat()

let update = ( S ) => {

    let newAttributes = [{entity: 1654, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1654', 'entity/label': 'NO2 Selskapsnavn', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1655, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1655', 'entity/label': 'NO2 Selskapets forretningsadresse', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1656, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1656', 'entity/label': 'NO2 Selskapets postnummer', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1657, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1657', 'entity/label': 'NO2 Selskapets poststed', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1658, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1658', 'entity/label': 'NO2 Selskapets organisasjonsnummer', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1659, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1659', 'entity/label': 'NO2 Har foretaket årsregnskapsplikt etter regnskapsloven?', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1660, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1660', 'entity/label': 'NO2 Selskapets næring (virksomhetens art)', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1661, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1661', 'entity/label': 'NO2 Selskapets stiftelsesdato', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1662, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1662', 'entity/label': 'NO2 Revisjonspliktig', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1663, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1663', 'entity/label': 'NO2 Revisors org.nr.', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1664, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1664', 'entity/label': 'NO2 Revisorselskapets navn', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1665, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1665', 'entity/label': 'NO2 Revisors navn', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1666, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1666', 'entity/label': 'NO2 Revisors adresse', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1667, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1667', 'entity/label': 'NO2 Revisors postnr', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1668, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1668', 'entity/label': 'NO2 Revisors poststed', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1669, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1669', 'entity/label': 'NO2 Regnskapsførers navn', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1670, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1670', 'entity/label': 'NO2 Regnskapsførers org.nr.', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1671, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1671', 'entity/label': 'NO2 Regnskapsførers forretningsadresse', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1672, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1672', 'entity/label': 'NO2 Regnskapsførers postnr. ', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1673, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1673', 'entity/label': 'NO2 Regnskapsførers poststed', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1674, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1674', 'entity/label': 'NO2 Regnskapsperiode fra', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1675, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1675', 'entity/label': 'NO2 Regnskapsperiode til', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1676, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1676', 'entity/label': 'NO2 Hvilke regler er benyttet ved utarbeidelsen av årsregnskapet?', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1677, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1677', 'entity/label': 'NO2 Har foretaket årsregnskapsplikt etter regnskapsloven?', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1678, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1678', 'entity/label': 'NO2 Er bokføringsvalutaen en annen enn norske kroner, jf. bokføringsforskriften § 4-2?', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1679, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1679', 'entity/label': 'NO2 Type valuta(er)', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1680, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1680', 'entity/label': 'NO2 Er den løpende bokføringen utført av ekstern regnskapsfører?', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1681, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1681', 'entity/label': 'NO2 Hvem har fylt ut næringsoppgaven?', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1682, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1682', 'entity/label': 'NO2 Org.nr. til den som har fylt ut næringsoppgaven', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1683, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1683', 'entity/label': 'NO2 Navn til den som har fylt ut næringsoppgaven', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1684, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1684', 'entity/label': 'NO2 Postnr. til den som har fylt ut næringsoppgaven', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1685, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1685', 'entity/label': 'NO2 Poststed til den som har fylt ut næringsoppgaven', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 30, 'attribute/startValue': "return''; " , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1686, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1686', 'entity/label': 'NO2 0440', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1687, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1687', 'entity/label': 'NO2 1070', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, 
    {entity: 1688, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1688', 'entity/label': 'NO2 1313', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1689, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1689', 'entity/label': 'NO2 1320', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1690, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1690', 'entity/label': 'NO2 1332', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1691, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1691', 'entity/label': 'NO2 1340', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1692, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1692', 'entity/label': 'NO2 1350', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1693, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1693', 'entity/label': 'NO2 1370', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1694, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1694', 'entity/label': 'NO2 1380', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1695, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1695', 'entity/label': 'NO2 1565', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1696, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1696', 'entity/label': 'NO2 1800', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1697, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1697', 'entity/label': 'NO2 1810', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1698, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1698', 'entity/label': 'NO2 1800', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1699, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1699', 'entity/label': 'NO2 1830', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1700, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1700', 'entity/label': 'NO2 1920', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1701, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1701', 'entity/label': 'NO2 2000', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1702, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1702', 'entity/label': 'NO2 2020', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1703, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1703', 'entity/label': 'NO2 2030', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1704, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1704', 'entity/label': 'NO2 2059', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1705, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1705', 'entity/label': 'NO2 2080', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1706, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1706', 'entity/label': 'NO2 2120', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1707, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1707', 'entity/label': 'NO2 2250', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1708, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1708', 'entity/label': 'NO2 2260', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1709, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1709', 'entity/label': 'NO2 2400', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1710, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1710', 'entity/label': 'NO2 2500', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1711, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1711', 'entity/label': 'NO2 2510', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1712, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1712', 'entity/label': 'NO2 2800', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1713, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1713', 'entity/label': 'NO2 2910', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1714, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1714', 'entity/label': 'NO2 2920', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1715, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1715', 'entity/label': 'NO2 6500', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1716, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1716', 'entity/label': 'NO2 6700', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1717, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1717', 'entity/label': 'NO2 7700', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1718, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1718', 'entity/label': 'NO2 8030', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1719, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1719', 'entity/label': 'NO2 8050', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1720, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1720', 'entity/label': 'NO2 8060', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1721, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1721', 'entity/label': 'NO2 8090', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1722, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1722', 'entity/label': 'NO2 8074', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1723, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1723', 'entity/label': 'NO2 8079', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1724, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1724', 'entity/label': 'NO2 8080', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1725, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1725', 'entity/label': 'NO2 8100', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1726, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1726', 'entity/label': 'NO2 8115', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1727, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1727', 'entity/label': 'NO2 8130', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1728, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1728', 'entity/label': 'NO2 8150', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1729, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1729', 'entity/label': 'NO2 8160', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1730, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1730', 'entity/label': 'NO2 8174', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1731, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1731', 'entity/label': 'NO2 8179', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1732, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1732', 'entity/label': 'NO2 8300', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1733, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1733', 'entity/label': 'NO2 8320', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1734, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1734', 'entity/label': 'NO2 0640', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1735, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1735', 'entity/label': 'NO2 0815', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1736, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1736', 'entity/label': 'NO2 0653', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1737, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1737', 'entity/label': 'NO2 0815', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1738, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1738', 'entity/label': 'NO2 0652', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1739, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1739', 'entity/label': 'NO2 0833', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1740, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1740', 'entity/label': 'NO2 0650', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1741, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1741', 'entity/label': 'NO2 0833', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1742, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1742', 'entity/label': 'NO2 0650', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1743, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1743', 'entity/label': 'NO2 0831', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1744, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1744', 'entity/label': 'NO2 0631', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1745, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1745', 'entity/label': 'NO2 0632', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1746, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1746', 'entity/label': 'NO2 0621', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1747, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1747', 'entity/label': 'NO2 0633', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1748, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1748', 'entity/label': 'NO2 0850', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1749, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1749', 'entity/label': 'NO2 0850', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1750, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1750', 'entity/label': 'NO2 0620', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}, {entity: 1751, 'entity/entityType': 42, 'attr/name': 'eventAttribute/1751', 'entity/label': 'NO2 0820', 'entity/category': 'Næringsoppgave 2', 'attribute/valueType': 31, 'attribute/startValue': "return 0" , 'attribute/validatorFunctionString': 'return true;'}]


    let datoms = prepareImportDatoms(newAttributes)

    console.log("datoms", datoms)

    //let serverResponse = Database.submitDatoms(datoms)
    //console.log("serverResponse", serverResponse)


    console.log("Database", Database)

    console.log("S", S)

    S.Events = Database.getAll( 46 ).map( entity => Database.getServerEntity(entity) )
    S.EntityTypes = [42, 43, 44, 45, 47, 48, 49, 50, 5030, 5590, 5612] //, 46
    S.Reports =  Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 49 ).map( serverEntity => serverEntity.entity )
    
    
    S.orgNumbers = S.Events.map( Entity => Database.get(Entity.entity, "eventAttribute/1005" ) ).filter( filterUniqueValues )
    S.userEvents = S.Events
      .filter( Event => Database.get(Event.entity, "eventAttribute/1005") === Number(S["UIstate"].selectedOrgnumber) )
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