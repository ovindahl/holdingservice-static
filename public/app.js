
const Database = {
  tx: null,
  Entities: [],
  companyDatoms: [],
  init: async () => { 
    Database.Entities = await sideEffects.APIRequest("GET", "Entities", null)
    Database.attrNames = mergeArray(Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 ).map( serverEntity => createObject(serverEntity.current["attr/name"], serverEntity.entity) ))
    Database.tx = Database.Entities.map( Entity => Entity.Datoms.slice( -1 )[0].tx ).sort( (a,b) => a-b ).filter( v => isDefined(v) ).slice(-1)[0]
    Database.calculatedFieldFunctions = Database.getAll( 5817 ).map( calculatedField => returnObject({calculatedField, function: new Function( ["Entity", "Company"],  Database.get(calculatedField, 6048) ) })  )
    Database.getAll( 5722 ).forEach( company => Companies.reconstructCompany(company) )
    return;
  },
  setLocalState: (entity, newState) => {
    let updatedEntity = Database.get(entity)
    updatedEntity.localState = mergerino(updatedEntity.localState, newState) 
    Database.Entities = Database.Entities.filter( Entity => Entity.entity !== updatedEntity.entity ).concat( updatedEntity )
    update( Database.S )
    return;
  },
  getLocalState: entity => {
    let serverEntity = Database.get(entity)
    let localState = serverEntity.localState 
      ? serverEntity.localState
      : {tx: serverEntity.Datoms.map( Datom => Datom.tx ).filter( tx => !isUndefined(tx) ).sort().slice(-1)[0]}
    return localState
  },
  selectEntity: entity => update( mergerino(Database.S, {"UIstate": {"selectedEntity": entity}})  ),
  updateEntity: async (entity, attribute, value) => {
    let valueType = Database.get( Database.attr(attribute), "attribute/valueType")
    let attributeIsArray = isDefined( Database.get(attribute, 5823) )
      ? Database.get(attribute, 5823)
      : false
    let valueInArray = attributeIsArray ? value : [value]
    let isValid_existingEntity = Database.Entities.map( E => E.entity).includes(entity)
    let valueTypeValidatorFunction = new Function("inputValue",  Database.get( valueType, "valueType/validatorFunctionString") )
    let isValid_valueType = valueInArray.every( arrayValue => valueTypeValidatorFunction(arrayValue) ) 
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
      Database.tx = Database.Entities.map( Entity => Entity.Datoms.slice( -1 )[0].tx ).sort( (a,b) => a-b ).filter( v => isDefined(v) ).slice(-1)[0]
      return updatedEntity;
    }else{
      console.log("Database.updateEntityAndRefreshUI did not pass validation.", {entity, attribute, value, validators: {isValid_existingEntity, isValid_valueType, isValid_attribute, isValid_notNaN }})
      return null;
    }
    
  },
  updateEntityAndRefreshUI: async (entity, attribute, value) => {
    let updatedEntity = await Database.updateEntity(entity, attribute, value)
    update( Database.S )
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
    return updatedEntity
  },
  retractEntity: async entity => Database.retractEntities([entity]),
  retractEntities: async entities => {    
    let retractionDatoms = entities.map( entity => {
      let Datoms = Database.get(entity).Datoms
      let activeDatoms = Datoms.filter( Datom => Datoms.filter( dat => dat.attribute === Datom.attribute && dat.tx > Datom.tx ).length === 0  )
      let retractionDatoms = activeDatoms.map( Datom => newDatom(entity, Datom.attribute, Datom.value, false) )
      return retractionDatoms
    } ).flat()
    let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( retractionDatoms ) )
    Database.Entities = Database.Entities.filter( Entity => !entities.includes(Entity.entity) ).concat( serverResponse )
    Database.tx = Database.Entities.map( Entity => Entity.Datoms.slice( -1 )[0].tx ).sort( (a,b) => a-b ).filter( v => isDefined(v) ).slice(-1)[0]
    update( Database.S )
  },
  submitDatoms: async datoms => {
    let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( datoms ) )
    update( Database.S )
  },
  attrName: attribute => {
    if( isNumber(attribute)  ){
      let serverEntity = Database.Entities.find( serverEntity => serverEntity.entity === attribute  )
      let serverDatoms = serverEntity.Datoms.filter( Datom => Datom.attribute === "attr/name" )
      let latestDatom = serverDatoms.slice( - 1 )[0]
      let value = latestDatom.value
      return value;
    }else if( isDefined( Database.attrNames[attribute] ) ){ return attribute }
    else{ return log(undefined, `[ Database.attrName(${attribute}) ]: Attribute ${attribute} does not exist`) }
  },
  attr: attrName => isDefined(attrName)
    ? isNumber(attrName) ? attrName : Database.attrNames[attrName]
    : log(undefined, `[ Database.attr(${attrName}) ]: Proveded attribute name is undefined`),
  get: (entity, attribute, version) => {
    if(isUndefined(entity)){return log(undefined, `[ Database.get(${entity}, ${attribute}, ${version}) ]: received entity argument is undefined`)}
    let serverEntity = Database.Entities.find( serverEntity => serverEntity.entity === entity  )
    if(isUndefined(serverEntity)){return log(undefined, `[ Database.get(${entity}, ${attribute}, ${version}) ]: Entity does not exist`)}
    if(isDefined(attribute)){
      if( Database.getAll(42).includes( Database.attr(attribute) ) ){
        let Datom = serverEntity.Datoms
        .filter( Datom => Datom.attribute === Database.attrName(attribute) )
        .map( serverDatom => isUndefined(serverDatom.tx) ? mergerino(serverDatom, {tx: 0}) : serverDatom ) //NB: Some early datoms lacks tx.....
        .filter( serverDatom => isDefined(version) ? serverDatom.tx <= version : true )
        .slice(-1)[0]
        if(isUndefined(Datom)){return log(undefined, `[ Database.get(${entity}, ${attribute}, ${version}) ]: No attribute ${attribute} datoms exist for entity ${entity}`)}
        else{ return Datom.value}
      }else if(Database.getAll(5817).includes( attribute )){return Database.getCalculatedField(entity, attribute) } //returns calculatedField
    }else{
      let Entity = serverEntity;
      Entity.get = (attr, version) => Database.get(entity, attr, version)
      return Entity
    }
  },
  getCalculatedField: (entity, eventField) => {

    let entityType = Database.get(entity, "entity/entityType")

    let systemEntityTypes = [42, 43, 44, 45, 47, 48, 5030, 5590, 5612, 5687, 5817];
    let realEntityTypes = [46, 5722, 5692]
    let companyEntityTypes = [5672, 5673, 5674, 5679, 5714, 5810, 5811, 5812]

    let Entity = Database.get(entity)


    
    

    let calculatedValue;
      try {calculatedValue = new Function( ["Entity", "Database"],  Database.get(eventField, 6048) ) (Entity, Database) } 
      catch (error) {calculatedValue = log("ERROR",{info: "calculatedValue calculation  failed", entity, eventField, error}) }
      

    return calculatedValue




  },
  getAll: entityType => Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === entityType ).map(E => E.entity),
  getOptions: (attribute, tx ) => {
    let options = [];
    try {options = new Function( ["Database"] , Database.get(attribute, "attribute/selectableEntitiesFilterFunction", tx) )( Database )}
    catch (error) { log(error, {info: "Could not get options for DB attribute", attribute, tx }) }
    return options
  },
}

const Companies = {
  companyDatoms: [],
  reconstructCompany: company => {
    let startTime = Date.now()
    let events = Database.get(company, 6178) 
    Companies.companyDatoms = Companies.companyDatoms.filter( Datom => Datom.company !== company ) //.concat([initialDatom]) 
    let latestEntityID = 0;
    events.forEach( event => {
      
      let eventType = Database.get( event, "event/eventTypeEntity" )
      let t = Database.get(event, 6101)
      
      let eventDatoms = Database.get( eventType, "eventType/newDatoms" ).map( datomConstructor => {
    
        let entity;
    
          try {entity = new Function( [`Q`], datomConstructor.entity )( {latestEntityID: () => latestEntityID} )}
          catch (error) {entity = log("ERROR",{info: "entity calculation for datomconstructor failed", event, datomConstructor, error}) }
    
        let attribute = datomConstructor.attribute
    
        let Company = Companies.getCompanyObject(company)
        let Event = Database.get(event)
        let Process = Companies.getProcessObject( Database.get(event, "event/process") )
        Process.getPrevEvent = () => Process.getEventByIndex(  Process.events.findIndex( e => e === event ) - 1 ) //Flytte til event?
    
        let value;
        let error = "No errors";
          try {value = new Function( [`Company`, `Event`, `Process`, `latestEntityID`], datomConstructor.value )( Company, Event, Process, latestEntityID ) } 
          catch (error) {value = log("ERROR",{info: "Value calculation for datomconstructor failed", event, datomConstructor, error}) } 
        let Datom = {company, entity, attribute, value, event, t, error}
        return Datom
        
      }  )
      
      Companies.companyDatoms = Companies.companyDatoms.concat(eventDatoms)
      let maxEventEntity = eventDatoms.map( Datom => Datom.entity ).sort( (a, b) => a-b ).slice(-1)[0]
      let newMax = isNumber(maxEventEntity) 
        ? Math.max(latestEntityID, maxEventEntity)
        : latestEntityID
      latestEntityID = newMax
    })
    console.log(`reconstructCompany [${company}] completed in ${Date.now() - startTime} ms`)
  },
  getCompanyObject: (company, t) => {

    let Company = {
      entity: company,
      t
    }

    Company.events = Database.get(company, 6178)
    Company.get = (entity, attribute, providedT) => Companies.getFromCompany(company, entity, attribute, isDefined(providedT) ? providedT : t)
    Company.getAll = entityType => Companies.getAllFromCompany(company, entityType, t)
    Company.getEvent = event =>  Database.get(event)
    Company.getOptions = attribute =>  Companies.getCompanyOptions(company, attribute, t)
    Company.updateEvent = async (event, attribute, value) => await Companies.updateCompanyEvent(company, event, attribute, value)
    Company.createEvent = async (eventType, parentProcess, attributeAssertions) => await Companies.createCompanyEvents(company, eventType, parentProcess, [ isDefined(attributeAssertions) ? attributeAssertions : {} ])
    Company.createEvents = async (eventType, parentProcess, attributeAssertions) => await Companies.createCompanyEvents(company, eventType, parentProcess, attributeAssertions)
    Company.retractEvents = async events => {
      let entities = Array.isArray(events) ? events : [events]
      let retractedEvent = await Database.retractEntities(entities)
      Companies.reconstructCompany(company)
      update( Database.S )
    } 
    return Company
  },
  getFromCompany: (company, companyEntity, attribute, t) => {
    if(isUndefined(company)){return log(undefined, `[ Companies.getFromCompany(${company}, ${companyEntity}, ${attribute}, ${t}) ]: received company argument is undefined`)}
    if(isUndefined(companyEntity)){return log(undefined, `[ Companies.getFromCompany(${company}, ${companyEntity}, ${attribute}, ${t}) ]: received companyEntity argument is undefined`)}
    let matchingDatoms = Companies.companyDatoms
      .filter( companyDatom => companyDatom.company === company  )
      .filter( companyDatom => companyDatom.entity === companyEntity  )
      .filter( companyDatom => isDefined(t) ? companyDatom.t <= t : true )
    if(matchingDatoms.length === 0){return log(undefined, `[ Companies.getFromCompany(${company}, ${companyEntity}, ${attribute}, ${t}) ]: No matching company datoms`)}
    if(isDefined(attribute) ){
      if( Database.getAll(42).includes( Database.attr(attribute) ) ){
        let companyDatom = matchingDatoms
        .filter( companyDatom => companyDatom.attribute === attribute )
        .slice(-1)[0]
        if(isUndefined(companyDatom)){return undefined}
        else{ return companyDatom.value}
      }else if(Database.getAll(5817).includes( attribute )){return Companies.getCompanyCalculatedField(company, companyEntity, attribute, t) } //returns calculatedField
    }else{
      let CompanyEntity = {
        company: company,
        entity: companyEntity,
        companyDatoms: matchingDatoms
      };
      CompanyEntity.get = attr => {
        let matchingDatoms = CompanyEntity.companyDatoms
        .filter( companyDatom => companyDatom.attribute === attr )
        return matchingDatoms.length > 0 ? matchingDatoms.slice(-1)[0] : undefined
      } 

      return CompanyEntity
    }
  },
  getCompanyOptions: (company, attribute, t) => {
    let options = [];
    let Company = Companies.getCompanyObject(company, t)
    try {options = new Function( [ "Company" ] , Database.get(attribute, "attribute/selectableEntitiesFilterFunction") )( Company )}
    catch (error) { log(error, {info: "Could not get options for Company attribute", company, attribute, t }) }
    return options
  },
  getAllFromCompany: (company, entityType, t) => {
    if(isUndefined(company)){return log(undefined, `[ Companies.getAllFromCompany(${company}, ${entityType}, ${t}) ]: received company argument is undefined`)}
    let entities = Companies.companyDatoms
      .filter( companyDatom => companyDatom.company === company  )
      .filter( companyDatom => isDefined(t) ? companyDatom.t <= t : true )
      .filter( companyDatom => companyDatom.attribute === 19 )
      .filter( companyDatom => isDefined(entityType) ? companyDatom.value === entityType : true )
      .map( Datom => Datom.entity ).filter(filterUniqueValues)
      return entities
  },
  getCompanyCalculatedField: (company, companyEntity, calculatedField, t) => {

          let Company = Companies.getCompanyObject(company, t)
      
          let Entity = {
            entity: companyEntity,
            event: Companies.companyDatoms
            .filter( companyDatom => companyDatom.company === company )
            .filter( companyDatom => companyDatom.entity === companyEntity )
            [0].event,
          }

          Entity.get = attribute => Company.get(entity, attribute, t)
          
      
      
            let value;
            let error = "No error";
            try {
              let calculatedFieldFunction = Database.calculatedFieldFunctions.find( calculatedFieldObject => calculatedFieldObject.calculatedField === calculatedField  ).function
              value =  calculatedFieldFunction(Entity, Company) 
            } 
            catch (err) {
              value = log("ERROR",{info: "CompanycalculatedValue calculation  failed", company, companyEntity, calculatedField, err}) 
              error = err;
            }

            return value;

  },
  getProcessObject: process => {

    let Process = Database.get(process)
    Process.events = Process.get(6088)
    Process.getEventEntityByIndex = index => Process.events[index]
    Process.getEventByIndex = index => Database.get( Process.getEventEntityByIndex(index) )
    Process.getFirstEvent = () => Process.getEventByIndex(  0 )
    return Process

  },
  updateCompanyEvent: async (company, event, attribute, value) => {
    await Database.updateEntity(event, attribute, value)
    Companies.reconstructCompany(company)
    update( Database.S )
  },
  createCompanyEvents: async (company, eventType, parentProcess, attributeAssertions) => {
    let eventTypeAttributes = Database.get(eventType, "eventType/eventAttributes" )
    let Datoms = attributeAssertions.map( (attributeAssertion, index) => [
      newDatom(`newEntity ${index}`, "entity/entityType", 46 ),
      newDatom(`newEntity ${index}`, "event/eventTypeEntity", eventType),
      newDatom(`newEntity ${index}`, "event/process", parentProcess),
    ].concat(
      eventTypeAttributes
      .map( attribute => newDatom(`newEntity ${index}`, Database.attrName(attribute), Object.keys(attributeAssertion).includes( String( attribute ) ) 
        ? attributeAssertion[attribute]
        : new Function( ["Database"], Database.get(attribute, "attribute/startValue" ) )(Database) )   
      ))  ).flat()

    if(Datoms.every( Datom => isString(Datom.entity) && isString(Datom.attribute) && !isUndefined(Datom.value) )){

      let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( Datoms ) )
      let updatedEntities = serverResponse
      Database.Entities = Database.Entities.filter( Entity => !updatedEntities.map( updatedEntity => updatedEntity.entity  ).includes(Entity.entity) ).concat( updatedEntities )
      Database.tx = Database.Entities.map( Entity => Entity.Datoms.slice( -1 )[0].tx ).sort( (a,b) => a-b ).filter( v => isDefined(v) ).slice(-1)[0]
      Companies.reconstructCompany(company)
      update( Database.S )
    }else{log("Datoms not valid: ", Datoms)}
  },
}

let D = Database
let Company = {}
let Process = {}

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
        let statusDiv = document.getElementById("APISYNCSTATUS")
        if(!isNull(statusDiv)) {
          statusDiv.innerHTML = "Laster";
        }
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
        if(!isNull(statusDiv)) {
          statusDiv.innerHTML = "Ledig"
        }
        
        return parsedResponse;
      }else{
        log( {type, endPoint, stringBody}, "Declined HTTP request, another in progress:")
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

let update = ( S ) => {

    Database.S = S;
    Admin.S = S;
    Admin.DB = Database
    D = Database

    console.log("State: ", S)
    let A = {updateLocalState: (patch) => update({UIstate: mergerino( S["UIstate"], patch )})}
    Admin.A = A;

    let company = S["UIstate"].selectedCompany
    let t = Database.get(company, 6198)
    Company = isDefined(company) ? Companies.getCompanyObject( company, t ): "Ingen selskap valgt"
    let process = S["UIstate"].selectedProcess
    Process = isDefined(process) ? Companies.getProcessObject(process) : "Ingen prosess valgt"

    let startTime = Date.now()

    let elementTree = generateHTMLBody(S, A, Company )
    sideEffects.updateDOM( elementTree )
    console.log(`generateHTMLBody finished in ${Date.now() - startTime} ms`)    

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
      "currentPage": "Prosesser",
      "selectedEntityType" : 42,
      "selectedCategory": undefined,
      "selectedEntity": 6,
    }
  }

    update( S )



}