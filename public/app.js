
const Database = {
  tx: null,
  Entities: [],
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

    let attr = Database.attr(attribute)


    let valueType = Database.get( attr , "attribute/valueType")
    let attributeIsArray = isDefined( Database.get( attr, 5823) )
      ? Database.get(attr, 5823)
      : false
    let valueInArray = attributeIsArray ? value : [value]
    let isValid_existingEntity = Database.Entities.map( E => E.entity).includes(entity)
    let valueTypeValidatorFunction = new Function("inputValue",  Database.get( valueType, "valueType/validatorFunctionString") )

    log({entity, attr, value, valueInArray})

    let isValid_valueType = valueInArray.every( arrayValue => valueTypeValidatorFunction(arrayValue) ) 
    let isValid_attribute = new Function("inputValue",  Database.get( Database.attr(attr), "attribute/validatorFunctionString") ) ( value )
    let isValid_notNaN = !Number.isNaN(value)

    //Add checks for whether attribtue is valid for the entity type?

    if( isValid_existingEntity && isValid_valueType && isValid_attribute && isValid_notNaN  ){

      let Datom = newDatom(entity, Database.attrName(attr), value )
      let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( [Datom] ) )
      let updatedEntity = serverResponse[0]
      let latestTx = serverResponse[0].Datoms.map( Datom => Datom.tx ).filter( tx => !isUndefined(tx) ).sort().reverse()[0]
      updatedEntity.localState = {tx: latestTx }
      Database.Entities = Database.Entities.filter( Entity => Entity.entity !== updatedEntity.entity ).concat( updatedEntity )
      Database.tx = Database.Entities.map( Entity => Entity.Datoms.slice( -1 )[0].tx ).sort( (a,b) => a-b ).filter( v => isDefined(v) ).slice(-1)[0]
      return updatedEntity;
    }else{
      console.log("Database.updateEntityAndRefreshUI did not pass validation.", {entity, attr, value, validators: {isValid_existingEntity, isValid_valueType, isValid_attribute, isValid_notNaN }})
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
    //Logs.push({method: "Database.get", entity, attribute, version})
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
  getCalculatedField: (entity, calculatedField) => {
    let entityType = Database.get(entity, "entity/entityType")
    let systemEntityTypes = [42, 43, 44, 45, 47, 48, 5030, 5590, 5612, 5687, 5817];
    let realEntityTypes = [46, 5722, 5692]
    let companyEntityTypes = [5672, 5673, 5674, 5679, 5714, 5810, 5811, 5812]
    let Entity = Database.get(entity)
    let calculatedValue;
      try {calculatedValue = new Function( ["Entity", "Database"],  Database.get(calculatedField, 6048) ) (Entity, Database) } 
      catch (error) {calculatedValue = log("ERROR",{info: "calculatedValue calculation  failed", entity, calculatedField, error}) }
    return calculatedValue
  },
  getAll: entityType => Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === entityType ).map(E => E.entity),
  getOptions: (attribute, tx ) => {
    let options = [];
    try {options = new Function( ["Database"] , Database.get(attribute, "attribute/selectableEntitiesFilterFunction", tx) )( Database )}
    catch (error) { log(error, {info: "Could not get options for DB attribute", attribute, tx }) }
    return options
  }
}




let Logs = []

const ActiveCompany = {
  companyDatoms: [],
  calculatedFieldsCache: [],
  storeDatoms: (Datoms) => ActiveCompany.companyDatoms = ActiveCompany.companyDatoms.concat(Datoms),
  constructCompany: company => {
    let startTime = Date.now()
    ActiveCompany.companyDatoms = [];
    ActiveCompany.events = Database.get(company, 6178) 
    let latestEntityID = 0;
    ActiveCompany.events.forEach( event => {
      let eventType = Database.get( event, "event/eventTypeEntity" )
      let t = ActiveCompany.events.findIndex( e => e === event  ) + 1
      let Company = ActiveCompany.getCompanyObject(company, t - 1)
      let Event = Database.get(event)
      let Process = Company.getProcess( Database.get(event, "event/process") )
      Process.getPrevEvent = () => Process.getEventByIndex(  Process.events.findIndex( e => e === event ) - 1 ) //Flytte til event?
      let eventDatoms = Database.get( eventType, "eventType/newDatoms" ).map( datomConstructor => {
        let entity;
          try {entity = new Function( [`Q`], datomConstructor.entity )( {latestEntityID: () => latestEntityID} )}
          catch (error) {entity = log("ERROR",{info: "entity calculation for datomconstructor failed", event, datomConstructor, error}) }
        let attribute = datomConstructor.attribute
        let value;
          try {value = new Function( [`Company`, `Event`, `Process`, `latestEntityID`], datomConstructor.value )( Company, Event, Process, latestEntityID ) } 
          catch (error) {value = log("ERROR",{info: "Value calculation for datomconstructor failed", event, datomConstructor, error}) } 
        let Datom = {company, entity, attribute, value, event, t}
        return Datom
      }  )
      Company.storeDatoms(eventDatoms)
      let maxEventEntity = eventDatoms.map( Datom => Datom.entity ).sort( (a, b) => a-b ).slice(-1)[0]
      let newMax = isNumber(maxEventEntity) 
        ? Math.max(latestEntityID, maxEventEntity)
        : latestEntityID
      latestEntityID = newMax
    })
    let Company = ActiveCompany.getCompanyObject(company)
    Company.entities.forEach( companyEntity => {
      let entityType = Company.get(companyEntity, 19)
      let calculatedFields = Database.get( entityType , "entityType/calculatedFields" )
      calculatedFields.forEach( calculatedField => Company.get(companyEntity, calculatedField, Company.t)    )
    })
    console.log(`Constructed Company ${company} in ${Date.now() -startTime} ms`)
  },
  getCompanyObject: (company, receivedT) => {
    let t = isNumber(receivedT) ? receivedT : ActiveCompany.companyDatoms.filter( Datom => Datom.company === company ).map( Datom => Datom.t ).sort( (a,b) => a-b ).slice(-1)[0]

    //Logs.push({method: "getCompanyObject", company, t})

    let Company = {
      entity: company,
      t
    }
    Company.processes = Database.get(company, 6157)
    Company.selectedProcess = ActiveCompany.selectedProcess
    Company.events = ActiveCompany.events
    Company.selectedEvent = ActiveCompany.selectedEvent
    Company.companyDatoms = ActiveCompany.companyDatoms
    Company.entityTypes = Database.getAll(47).filter( entity => Database.get(entity, "entity/category") === "Entitetstyper i selskapsdokumentet" )
    Company.entities = Company.companyDatoms.map( Datom => Datom.entity ).filter(filterUniqueValues)
    Company.selectedEntity = ActiveCompany.selectedEntity
    Company.get = (entity, attribute, providedT) => ActiveCompany.getFromCompany(company, entity, attribute, isDefined(providedT) ? providedT : t)
    Company.getAll = entityType => ActiveCompany.getAllFromCompany(company, entityType, t)
    Company.getEvent = event =>  ActiveCompany.getEventObject(event)
    Company.getProcess = process =>  ActiveCompany.getProcessObject( process )
    Company.getOptions = attribute =>  ActiveCompany.getCompanyOptions(company, attribute, t)

    Company.storeDatoms = Datoms => ActiveCompany.storeDatoms(Datoms)
    Company.updateEvent = async (event, attribute, value) => await ActiveCompany.updateCompanyEvent(company, event, attribute, value)
    Company.createEvent = async (eventType, parentProcess, attributeAssertions) => await ActiveCompany.createCompanyEvents(company, eventType, parentProcess, [ isDefined(attributeAssertions) ? attributeAssertions : {} ])
    Company.createEvents = async (eventType, parentProcess, attributeAssertions) => await ActiveCompany.createCompanyEvents(company, eventType, parentProcess, attributeAssertions)
    Company.retractEvents = async events => {
      let entities = Array.isArray(events) ? events : [events]
      let retractedEvent = await Database.retractEntities(entities)
      //ActiveCompany.constructCompany(company)
      update( Database.S )
    }

    Company.selectEntity = companyEntity => {
      ActiveCompany.selectedEntity = companyEntity
      update( Database.S )
    } 
    Company.selectProcess = process => {
      ActiveCompany.selectedProcess = process
      ActiveCompany.selectedEvent = Database.get(process, 6088)[0]
      update( Database.S )
    }
    Company.selectEvent = event => {
      ActiveCompany.selectedEvent = event
      ActiveCompany.selectedProcess = Database.get( event, "event/process" )
      Admin.A.updateLocalState({ currentPage : "Prosesser"})
      update( Database.S )
    }
    return Company
  },
  getFromCompany: (company, companyEntity, attribute, t) => {
      
    //Logs.push({method: "getFromCompany", company, companyEntity, attribute, t})
    
    if(isUndefined(company)){return log(undefined, `[ ActiveCompany.getFromCompany(${company}, ${companyEntity}, ${attribute}, ${t}) ]: received company argument is undefined`)}
    if(isUndefined(companyEntity)){return log(undefined, `[ ActiveCompany.getFromCompany(${company}, ${companyEntity}, ${attribute}, ${t}) ]: received companyEntity argument is undefined`)}
    let matchingDatoms = ActiveCompany.companyDatoms
      .filter( companyDatom => companyDatom.company === company  )
      .filter( companyDatom => companyDatom.entity === companyEntity  )
      .filter( companyDatom => isDefined(t) ? companyDatom.t <= t : true )
    if(matchingDatoms.length === 0){return log(undefined, `[ ActiveCompany.getFromCompany(${company}, ${companyEntity}, ${attribute}, ${t}) ]: No matching company datoms`)}
    if(isDefined(attribute) ){
      if( Database.getAll(42).includes( Database.attr(attribute) ) ){
        let companyDatom = matchingDatoms
        .filter( companyDatom => companyDatom.attribute === attribute )
        .slice(-1)[0]
        if(isUndefined(companyDatom)){return undefined}
        else{ return companyDatom.value}
      }else if(Database.getAll(5817).includes( attribute )){return ActiveCompany.getCompanyCalculatedField(company, companyEntity, attribute, t) } //returns calculatedField
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
    let Company = ActiveCompany.getCompanyObject(company, t)
    try {options = new Function( [ "Company" ] , Database.get(attribute, "attribute/selectableEntitiesFilterFunction") )( Company )}
    catch (error) { log(error, {info: "Could not get options for Company attribute", company, attribute, t }) }
    return options
  },
  getAllFromCompany: (company, entityType, t) => {
    if(isUndefined(company)){return log(undefined, `[ ActiveCompany.getAllFromCompany(${company}, ${entityType}, ${t}) ]: received company argument is undefined`)}
    let entities = ActiveCompany.companyDatoms
      .filter( companyDatom => companyDatom.company === company  )
      .filter( companyDatom => isDefined(t) ? companyDatom.t <= t : true )
      .filter( companyDatom => companyDatom.attribute === 19 )
      .filter( companyDatom => isDefined(entityType) ? companyDatom.value === entityType : true )
      .map( Datom => Datom.entity ).filter(filterUniqueValues)
      return entities
  },
  getCompanyCalculatedField: (company, companyEntity, calculatedField, t) => {
    //Logs.push({method: "getCompanyCalculatedField", company, companyEntity, calculatedField, t})

    let cachedCalculatedField = ActiveCompany.calculatedFieldsCache.find( cachedCalculatedField => cachedCalculatedField.company === company && cachedCalculatedField.companyEntity === companyEntity && cachedCalculatedField.calculatedField === calculatedField && cachedCalculatedField.t === t )
    if( isDefined(cachedCalculatedField) ){return cachedCalculatedField.value }
    else{

      let Company = ActiveCompany.getCompanyObject(company, t)
      let Entity = {
        entity: companyEntity,
        event: ActiveCompany.companyDatoms
        .filter( companyDatom => companyDatom.company === company )
        .filter( companyDatom => companyDatom.entity === companyEntity )
        [0].event,
      }
      Entity.get = attribute => Company.get(entity, attribute, t)
          
      let value;
        try {
          let calculatedFieldFunction = new Function( ["Entity", "Company"],  Database.get(calculatedField, 6048) )
          value =  calculatedFieldFunction(Entity, Company) 
        } 
        catch (err) {
          value = log("ERROR",{info: "CompanycalculatedValue calculation  failed", company, companyEntity, calculatedField, err}) 
        }
      ActiveCompany.calculatedFieldsCache.push({company, companyEntity, calculatedField, t, value})
      return value;
    }

          

  },
  getProcessObject: process => {

    let Process = Database.get(process)
    Process.type =  Database.get(process, "process/processType" )
    
    Process.events = Process.get(6088)
    Process.getEventEntityByIndex = index => Process.events[index]
    Process.getEventByIndex = index => Database.get( Process.getEventEntityByIndex(index) )
    Process.getFirstEvent = () => Process.getEventByIndex(  0 )

    Process.Actions = Database.get(Process.type, "processType/actions").map( actionObject => {

      let label = actionObject[6]
      let criteriumFunctionString = actionObject[5848]
      let criteriumFunction = new Function( ["Database", "Company", "Process"], criteriumFunctionString )
      let isActionable = criteriumFunction(Database, Company, Process)
      let actionFunctionString = actionObject[5850]
      let actionFunction = isActionable ? new Function(["Database", "Company", "Process"], actionFunctionString ) : undefined

      let Action = {
        label, isActionable, actionFunction
      }
      return Action


    } )
  
    return Process

  },
  getEventObject: event => {
    let Event = Database.get( event )
    Event.type = Database.get( event, "event/eventTypeEntity" )
    Event.t = ActiveCompany.events.findIndex( e => e === event  ) + 1
    Event.companyDatoms = ActiveCompany.companyDatoms.filter( companyDatom => companyDatom.event === event )
    Event.entities = Event.companyDatoms.map( Datom => Datom.entity ).filter(filterUniqueValues)
    return Event
  },
  updateCompanyEvent: async (company, event, attribute, value) => {
    await Database.updateEntity(event, attribute, value)
    //ActiveCompany.constructCompany(company)
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
      //ActiveCompany.constructCompany(company)
      update( Database.S )
    }else{log("Datoms not valid: ", Datoms)}
  },
}

let D = Database
let Company = {}
let Process = {}


//let fieldsToImport = [{label: 'Sum annen langsiktig gjeld', entities: [, 1324, 1326, 1327, 1330, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ]}, {label: 'Sum avsetning for forpliktelser', entities: [, , , , , 1318, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ]}, {label: 'Sum bankinnskudd, kontanter og lignende', entities: [, , , , , , 1302, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ]}, {label: 'Sum finansielle anleggsmidler', entities: [, , , , , , , 1201, 1202, 1203, 1210, 1196, 1197, 1198, 1199, 1189, 1190, 1187, 1188, 1193, 1194, 1192, 1195, 1200, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ]}, {label: 'Sum fordringer', entities: [, , , , , , , , , , , , , , , , , , , , , , , , 1233, 1234, 1274, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ]}, {label: 'Sum immatrielle eiendeler', entities: [, , , , , , , , , , , , , , , , , , , , , , , , , , , 1154, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ]}, {label: 'Sum innskutt egenkapital', entities: [, , , , , , , , , , , , , , , , , , , , , , , , , , , , 1305, 1309, 1310, 1307, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ]}, {label: 'Sum investeringer', entities: [, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , 1279, 1280, 1296, 1289, 1290, 1291, 1292, 1293, 1294, 1295, 1281, 1282, 1283, 1284, 1285, 1286, 1287, 1288, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ]}, {label: 'Sum kortsiktig gjeld', entities: [, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , 1373, 1375, 1376, 1388, 1340, 1341, 1337, 1338, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ]}]

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
    Company = isDefined(company) ? ActiveCompany.getCompanyObject( company ): "Ingen selskap valgt"
    let process = S["UIstate"].selectedProcess
    Process = isDefined(process) ? ActiveCompany.getProcessObject(process) : "Ingen prosess valgt"

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

  
  Database.Entities = await sideEffects.APIRequest("GET", "Entities", null)
  Database.attrNames = mergeArray(Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 ).map( serverEntity => createObject(serverEntity.current["attr/name"], serverEntity.entity) ))
  Database.tx = Database.Entities.map( Entity => Entity.Datoms.slice( -1 )[0].tx ).sort( (a,b) => a-b ).filter( v => isDefined(v) ).slice(-1)[0]

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
      "selectedCompany": 5723
    }
  }
  let company = S.UIstate.selectedCompany
  log("Database initialized, constructing company " + company)
  ActiveCompany.constructCompany(company)
  update( S )



}