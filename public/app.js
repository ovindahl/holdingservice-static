const Database = {
  tx: null,
  Entities: [],
  entities: [],
  setLocalState: (entity, newState) => {
    let updatedEntity = Database.get(entity)
    updatedEntity.localState = mergerino(updatedEntity.localState, newState) 
    Database.Entities = Database.Entities.filter( Entity => Entity.entity !== updatedEntity.entity ).concat( updatedEntity )
    update( )
    return;
  },
  getLocalState: entity => {
    let serverEntity = Database.get(entity)
    let localState = serverEntity.localState 
      ? serverEntity.localState
      : {tx: serverEntity.Datoms.map( Datom => Datom.tx ).filter( tx => !isUndefined(tx) ).sort().slice(-1)[0]}
    return localState
  },
  updateEntity: async (entity, attribute, value) => {

    let attr = Database.attr(attribute)
    let valueType = Database.get( attr , "attribute/valueType")





    let attributeIsArray = isDefined( Database.get( attr, 5823) )
      ? Database.get(attr, 5823)
      : false



    let valueInArray = attributeIsArray ? value : [value]
    let isValid_existingEntity = Database.isEntity(entity)
    let valueTypeValidatorFunction = new Function("inputValue",  Database.get( valueType, "valueType/validatorFunctionString") )

    let isValid_valueType = valueInArray.every( arrayValue => valueTypeValidatorFunction(arrayValue) ) 
    let isValid_attribute = new Function("inputValue",  Database.get( Database.attr(attr), "attribute/validatorFunctionString") ) ( value )
    let isValid_notNaN = valueInArray.every( arrayValue => !Number.isNaN(arrayValue) )

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
      console.log("Database.updateEntity did not pass validation.", {entity, attr, value, validators: {isValid_existingEntity, isValid_valueType, isValid_attribute, isValid_notNaN }})
      return null;
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



    //To be systematized
    Database.Entities = Database.Entities.filter( Entity => Entity.entity !== updatedEntity.entity ).concat( updatedEntity )
    Database.entities = Database.Entities.map( serverEntity => serverEntity.entity )
    Database.attributes = Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 ).map(E => E.entity)
    Database.attrNames = mergeArray(Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 ).map( serverEntity => createObject(serverEntity.current["attr/name"], serverEntity.entity) ))
    Database.tx = Database.Entities.map( Entity => Entity.Datoms.slice( -1 )[0].tx ).sort( (a,b) => a-b ).filter( v => isDefined(v) ).slice(-1)[0]
    //To be systematized ---

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


    //To be systematized
    Database.Entities = Database.Entities.filter( Entity => !entities.includes(Entity.entity) ).concat( serverResponse )
    Database.entities = Database.Entities.map( serverEntity => serverEntity.entity )
    Database.attributes = Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 ).map(E => E.entity)
    Database.attrNames = mergeArray(Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 ).map( serverEntity => createObject(serverEntity.current["attr/name"], serverEntity.entity) ))
    Database.tx = Database.Entities.map( Entity => Entity.Datoms.slice( -1 )[0].tx ).sort( (a,b) => a-b ).filter( v => isDefined(v) ).slice(-1)[0]
    //To be systematized ---






    update( )
  },
  submitDatoms: async datoms => {
    let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( datoms ) )
    update( )
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
  isAttribute: attribute => Database.attributes.includes( Database.attr(attribute) ),
  isEntity: entity => Database.entities.includes(entity),
  isCalculatedField: calculatedField => Database.getAll(5817).includes( calculatedField ),
  get: (entity, attribute, version) => {
    if(Database.isEntity(entity)){
      if( isDefined(attribute) ){
        if( Database.isAttribute(attribute) ){
          let Datom = Database.getDatom(entity, attribute, version)
          if(isUndefined(Datom)){return undefined} //, `[ Database.get(${entity}, ${attribute}, ${version}) ]: No attribute ${attribute} datoms exist for entity ${entity}`)}
          else{ return Datom.value}
        }else if( Database.isCalculatedField(attribute) ){return Database.getCalculatedField(entity, attribute) } //returns calculatedField
      }else{return Database.getEntity(entity)}
    }else{return log(undefined, `[ Database.get(${entity}, ${attribute}, ${version}) ]: Entity does not exist`)}
  },
  getDatom: (entity, attribute, version) => {
    let serverEntity = Database.Entities.find( serverEntity => serverEntity.entity === entity  )
    let Datom = serverEntity.Datoms
          .filter( Datom => Datom.attribute === Database.attrName(attribute) )
          .map( serverDatom => isUndefined(serverDatom.tx) ? mergerino(serverDatom, {tx: 0}) : serverDatom ) //NB: Some early datoms lacks tx.....
          .filter( serverDatom => isDefined(version) ? serverDatom.tx <= version : true )
          .slice(-1)[0]
    return Datom
  },
  getEntity: entity => {
    let serverEntity = Database.Entities.find( serverEntity => serverEntity.entity === entity  )
    let Entity = serverEntity;
    Entity.get = (attr, version) => Database.get(entity, attr, version)
    Entity.getOptions = attr => Database.getOptions(attr)
    Entity.entityType = Entity.get("entity/entityType")
    Entity.label = Entity.get("entity/label") ? Entity.get("entity/label") : "Mangler visningsnavn."
    Entity.isLocked = false;
    Entity.tx = Entity.Datoms.slice( -1 )[ 0 ].tx

    Entity.replaceValue = async (attribute, newValue) => Database.updateEntity(entity, attribute, newValue )

    Entity.addValueEntry = async (attribute, newValue) => await Entity.replaceValue( attribute,  Entity.get(attribute).concat( newValue )  )
    Entity.removeValueEntry = async (attribute, index) => await Entity.replaceValue( attribute,  Entity.get(attribute).filter( (Value, i) => i !== index  ) )
    Entity.replaceValueEntry = async (attribute, index, newValue) => await Entity.replaceValue( attribute,  Entity.get(attribute).filter( (Value, i) => i !== index  ).concat( newValue ) )

    Entity.Actions = [
      {label: "Slett", isActionable: true, actionFunction: async e => await Database.retractEntity(entity) },
      {label: "Legg til", isActionable: true, actionFunction: async e => {
        let newEntity = await Database.createEntity(Entity.entityType)
        Database.selectEntity(newEntity.entity)
      }  },
    ]

    return Entity
  },
  getCalculatedField: (entity, calculatedField) => {
    let Entity = Database.getEntity(entity)
    let calculatedValue;
      try {calculatedValue = new Function( ["Entity", "Database"],  Database.get(calculatedField, 6048) ) (Entity, Database) } 
      catch (error) {calculatedValue = log("ERROR",{info: "calculatedValue calculation  failed", entity, calculatedField, error}) }
    return calculatedValue
  },
  getAll: entityType => Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === entityType ).map(E => E.entity), //Kan bli sirkulær med isAttribute
  getOptions: (attribute, tx ) => {
    let options = [];
    try {options = new Function( ["Database"] , Database.get(attribute, "attribute/selectableEntitiesFilterFunction", tx) )( Database )}
    catch (error) { log(error, {info: "Could not get options for DB attribute", attribute, tx }) }
    return options
  }
}

let Logs = []

const ActiveCompany = {
  company: undefined,
  companyDatoms: [],
  calculatedFieldsCache: [],
  storeDatoms: companyDatoms => ActiveCompany.companyDatoms = ActiveCompany.companyDatoms.concat(companyDatoms),
  getCompanyProcesses: company => Database.getAll(5692).filter( process => Database.get(process , 'process/company' ) === company  )
  .sort( (processA, processB) => {
    let processEventsA = ActiveCompany.getProcessObject(processA).events
    let firstEventA = processEventsA[0]
    let firstEventDateA = isDefined(firstEventA) ? Database.get(firstEventA, 'event/date') : Date.now()
    let processEventsB = ActiveCompany.getProcessObject(processB).events
    let firstEventB = processEventsB[0]
    let firstEventDateB = isDefined(firstEventB ) ? Database.get(firstEventB , 'event/date') : Date.now()
    return firstEventDateA - firstEventDateB;
  }),
  getCompanyEvents: company => Database.getAll(46).filter( event => ActiveCompany.getCompanyProcesses(company).includes( Database.get(event, "event/process") )  ).sort(  (a,b) => Database.get(a, 'event/date' ) - Database.get(b, 'event/date' ) ),
  applyCompanyEvent: (company, event) => {
    let eventType = Database.get( event, "event/eventTypeEntity" )
    let t = ActiveCompany.events.findIndex( e => e === event  ) + 1

    let Company = ActiveCompany.getCompanyObject(company, t - 1)
    let Event = Company.getEvent(event)
    let Process = Company.getProcess( Database.get(event, "event/process") )
    
    let eventDatoms = Database.get( eventType, "eventType/newDatoms" ).map( datomConstructor => {
      let entity;
        try {entity = new Function( [`Q`], datomConstructor.entity )( {latestEntityID: () => ActiveCompany.latestEntityID} )}
        catch (error) {entity = log("ERROR",{info: "entity calculation for datomconstructor failed", event, datomConstructor, error}) }
      let attribute = datomConstructor.attribute
      let value;
        try {value = new Function( [`Company`, `Event`, `Process`, `latestEntityID`], datomConstructor.value )( Company, Event, Process, ActiveCompany.latestEntityID ) } 
        catch (error) {value = log("ERROR",{info: "Value calculation for datomconstructor failed", event, datomConstructor, error}) } 
      let Datom = {company, entity, attribute, value, event, t}
      return Datom
    }  )

    Company.storeDatoms(eventDatoms)

    let maxEventEntity = eventDatoms.map( Datom => Datom.entity ).sort( (a, b) => a-b ).slice(-1)[0]
    let newMax = isNumber(maxEventEntity) 
      ? Math.max(ActiveCompany.latestEntityID, maxEventEntity)
      : ActiveCompany.latestEntityID
      ActiveCompany.latestEntityID = newMax

    let updatedCompany = ActiveCompany.getCompanyObject(company)

    updatedCompany.entities.forEach( companyEntity => {
      let CompanyEntity = updatedCompany.getCompanyEntity( companyEntity )
      let calculatedFields = Database.get( CompanyEntity.entityType , "entityType/calculatedFields" )
      calculatedFields.forEach( calculatedField => {

          let prevValue = updatedCompany.get(companyEntity, calculatedField, t )

          
              
          let value;
            try {
              let calculatedFieldFunction = new Function( ["Entity", "Company"],  Database.get(calculatedField, 6048) )
              value =  calculatedFieldFunction(CompanyEntity, updatedCompany) 
            } 
            catch (err) {
              value = log("ERROR",{info: "CompanycalculatedValue calculation  failed", company, companyEntity, calculatedField, err}) 
            }
            if( value !== prevValue  ){ ActiveCompany.calculatedFieldsCache.push({company, companyEntity, calculatedField, t, value}) }
      })

    } )





  },
  constructCompany: company => {
    let startTime = Date.now()

    ActiveCompany.company = company;
    ActiveCompany.companyDatoms = [];
    ActiveCompany.processes = ActiveCompany.getCompanyProcesses(company)
    ActiveCompany.events = ActiveCompany.getCompanyEvents(company)
    ActiveCompany.latestEntityID = 0;
    ActiveCompany.events.forEach( event => ActiveCompany.applyCompanyEvent(company, event) )

    console.log(`Constructed Company ${company} in ${Date.now() -startTime} ms`)

    //To be improved
    ActiveCompany.Actions = Database.getAll(5687).map( processType => {
      let label = "Ny prosess av typen: " + Database.get(processType, "entity/label");
      let isActionable = true;
      let actionFunction = async e => await Company.createProcess( processType )
      let Action = {label, isActionable, actionFunction}
      return Action
    }  )
    //To be improved
    
  },
  refreshCompany: (company, updatedEvent) => {
    let startTime = Date.now()

    ActiveCompany.companyDatoms = ActiveCompany.companyDatoms.slice(0, ActiveCompany.companyDatoms.findIndex( companyDatom => companyDatom.event === updatedEvent) );

    ActiveCompany.events = ActiveCompany.getCompanyEvents(company)

    ActiveCompany.latestEntityID = ActiveCompany.companyDatoms.reduce( (max, current) => current > max ? current : max, 0 );

    let updatedEventIndex = ActiveCompany.events.findIndex( event => event === updatedEvent )

    let eventsToApply = ActiveCompany.events.slice(updatedEventIndex, ActiveCompany.events.length )

    eventsToApply.forEach( event => ActiveCompany.applyCompanyEvent(company, event) )

    console.log(`Updated Company ${company} from event ${updatedEvent} in ${Date.now() -startTime} ms`)

    //To be improved
    ActiveCompany.Actions = Database.getAll(5687).map( processType => {
      let label = "Ny prosess av typen: " + Database.get(processType, "entity/label");
      let isActionable = true;
      let actionFunction = async e => await Company.createProcess( processType )
      let Action = {label, isActionable, actionFunction}
      return Action
    }  )
    //To be improved

  },
  getCompanyObject: (company, receivedT) => {
    let t = isNumber(receivedT) ? receivedT : ActiveCompany.companyDatoms.filter( Datom => Datom.company === company ).map( Datom => Datom.t ).sort( (a,b) => a-b ).slice(-1)[0]

    let Company = {
      entity: company,
      t
    }
    Company.processes = ActiveCompany.processes
    Company.events = ActiveCompany.events
    Company.companyDatoms = ActiveCompany.companyDatoms
    Company.entityTypes = Database.getAll(47).filter( entity => Database.get(entity, "entity/category") === "Entitetstyper i selskapsdokumentet" )
    Company.entities = Company.companyDatoms.map( Datom => Datom.entity ).filter(filterUniqueValues)
    Company.get = (entity, attribute, providedT) => ActiveCompany.getFromCompany(company, entity, attribute, isDefined(providedT) ? providedT : t)
    Company.getAll = entityType => ActiveCompany.getAllFromCompany(company, entityType, t)
    
    Company.getProcess = process =>  ActiveCompany.getProcessObject( process )
    Company.getEvent = event =>  ActiveCompany.getEventObject(event)
    Company.getOptions = attribute =>  ActiveCompany.getCompanyOptions(company, attribute, t)
    Company.getCompanyEntity = companyEntity =>  ActiveCompany.getCompanyEntityObject(company, companyEntity, t)

    Company.storeDatoms = Datoms => ActiveCompany.storeDatoms(Datoms)
    Company.createEvent = async (eventType, process) => await ActiveCompany.getProcessObject( process ).createEvent( eventType )
    Company.createProcess = async processType => await ActiveCompany.createCompanyProcess(company, processType)

    Company.Actions = ActiveCompany.Actions
    return Company
  },
  getFromCompany: (company, companyEntity, attribute, t) => {
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
    }else{return ActiveCompany.getCompanyEntityObject(company, companyEntity, t)}
  },
  getCompanyOptions: (company, attribute, t) => {
    let options = [];
    let Company = ActiveCompany.getCompanyObject(company)
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
    let matchingCachedValues = ActiveCompany.calculatedFieldsCache.filter( cachedCalculatedField => cachedCalculatedField.company === company && cachedCalculatedField.companyEntity === companyEntity && cachedCalculatedField.calculatedField === calculatedField && cachedCalculatedField.t <= t )
    let latestCachedValues = matchingCachedValues.length > 0 ? matchingCachedValues.slice( -1 )[0] : undefined
    return isDefined(latestCachedValues) ? latestCachedValues.value : undefined
  },
  getProcessObject: process => {

    let Process = Database.get(process)
    Process.processType =  Database.get(process, "process/processType" )
    Process.company = Database.get(process, "process/company" )

    Process.events = Database.getAll(46).filter( event => Database.get(event, 'event/process') === process ).sort(  (a,b) => Database.get(a, 'event/date' ) - Database.get(b, 'event/date' ) )
    Process.getEventEntityByIndex = index => Process.events[index]
    Process.getEventByIndex = index => Database.get( Process.getEventEntityByIndex(index) )
    Process.getFirstEvent = () => Process.getEventByIndex(  0 )
    Process.retract = async () => {
      await Database.retractEntity(process)
      ActiveCompany.processes = ActiveCompany.getCompanyProcesses(Process.company)
      ClientApp.updateState({selectedEntity: undefined})
    }

    Process.createEvent = async eventType => await ActiveCompany.createCompanyEvent( eventType, process )

    Process.Actions = Database.get(Process.processType, "processType/actions").map( actionObject => {

      let label = actionObject[6]
      let criteriumFunctionString = actionObject[5848]
      let criteriumFunction = new Function( ["Database", "Company", "Process"], criteriumFunctionString )
      let isActionable = criteriumFunction(Database, Company, Process)
      let actionFunctionString = actionObject[5850]
      let actionFunction = isActionable 
        ? e => new Function( ["Database", "Company", "Process"] , actionFunctionString ) (Database, Company, Company.getProcess( process ) ) 
        : undefined


      let Action = {
        label, isActionable, actionFunction
      }
      return Action


    } )
  
    return Process

  },
  getEventObject: event => {
    let Event = Database.get( event )
    Event.eventType = Database.get( event, "event/eventTypeEntity" )
    Event.process = Database.get( event, "event/process" )
    Event.processType = Database.get( Event.process, "process/processType" )
    Event.company = Database.get( Event.process , "process/company" )
    Event.t = ActiveCompany.events.findIndex( e => e === event  ) + 1
    Event.companyDatoms = ActiveCompany.companyDatoms.filter( companyDatom => companyDatom.event === event )
    Event.entities = Event.companyDatoms.map( Datom => Datom.entity ).filter(filterUniqueValues)


    Event.prevEvent = ActiveCompany.getProcessObject( Event.process ).events[  ActiveCompany.getProcessObject( Event.process ).events.findIndex( e => e === event ) - 1 ]

    Event.getPrevEvent = () => ActiveCompany.getEventObject( Event.prevEvent )


    Event.retract = async () => {
      await Database.retractEntity(event)
      ActiveCompany.refreshCompany(Event.company, event)
    }

    Event.update = async (attribute, newValue) => {
      await Database.updateEntity(event, attribute, newValue)
      ActiveCompany.refreshCompany(Event.company, event)
    }


    return Event
  },
  getCompanyEntityObject: (company, companyEntity, t) => {
    let CompanyEntity = {
      entity: companyEntity,
      companyEntity
    }
    CompanyEntity.get = attribute => ActiveCompany.getFromCompany(company, companyEntity, attribute, t)
    CompanyEntity.entityType = CompanyEntity.get( 19 )
    CompanyEntity.companyDatoms = ActiveCompany.companyDatoms.filter( companyDatom => companyDatom.entity === companyEntity )
    CompanyEntity.t = CompanyEntity.companyDatoms[0].t
    CompanyEntity.event = CompanyEntity.companyDatoms[0].event
    return CompanyEntity
  },
  createCompanyEvent: async (eventType, process) => {

    let newEvent = await Database.createEntity(46, [
      newDatom(`newEntity`, "event/eventTypeEntity", eventType),
      newDatom(`newEntity`, "event/process", process),
      newDatom(`newEntity`, "event/date", Date.now() )
    ])

    ActiveCompany.events = ActiveCompany.getCompanyEvents(ActiveCompany.company)
    return newEvent;
  },
  createCompanyProcess: async (company, processType) => {

    let newProcess = await Database.createEntity(5692, [
      newDatom( "newEntity" , "process/company", company  ),
      newDatom( "newEntity" , "process/processType", processType ),
      newDatom( "newEntity" , "entity/label", `${Database.get(processType, "entity/label")} for ${Database.get(company, "entity/label")}`  ),
    ] )

    let firstEventType = Database.get(processType, 5926)[0]
    let Process = ActiveCompany.getProcessObject(newProcess.entity)
    let newEvent = await Process.createEvent( firstEventType )
    ActiveCompany.processes = ActiveCompany.getCompanyProcesses(company)
    ActiveCompany.events = ActiveCompany.getCompanyEvents(company)


    return Process
  }
}






const ClientApp = {
  S: {
    selectedPage: "Tidslinje",
    selectedCompany: 5723,
    selectedEntity: undefined
  },
  updateState: patch => ClientApp.S = mergerino( ClientApp.S, patch ),
  replaceState: newState => ClientApp.S = newState,
  selectCompany: company => {
    ActiveCompany.constructCompany(company)
    ClientApp.updateState( {selectedCompany: company} )
  },
  getCompany: () => ActiveCompany.getCompanyObject( ClientApp.S.selectedCompany )
}

const AdminApp = {
  S: {
    selectedPage: "Admin",
    selectedEntity: 1,  
  },
  updateState: patch => AdminApp.S = mergerino( AdminApp.S, patch ),
  replaceState: newState => AdminApp.S = newState,

}

let D = Database
let Company = {}

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

let update = (  ) => {

    D = Database
    Company = ActiveCompany.getCompanyObject( ActiveCompany.company )

    let startTime = Date.now()
    let elementTree = ClientApp.S.selectedPage === "Admin" ? [ adminPage( Company ) ] : [ clientPage(Company) ]
    
    sideEffects.updateDOM( elementTree )
    console.log(`generateHTMLBody finished in ${Date.now() - startTime} ms`)    

}

let init = async () => {

  Database.Entities = await sideEffects.APIRequest("GET", "Entities", null)
  Database.entities = Database.Entities.map( serverEntity => serverEntity.entity )
  Database.attributes = Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 ).map(E => E.entity)
  Database.attrNames = mergeArray(Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 ).map( serverEntity => createObject(serverEntity.current["attr/name"], serverEntity.entity) ))
  Database.tx = Database.Entities.map( Entity => Entity.Datoms.slice( -1 )[0].tx ).sort( (a,b) => a-b ).filter( v => isDefined(v) ).slice(-1)[0]
  Database.selectedEntity = 6

  let company = Database.getAll( 5722 )[0]
  log("Database initialized, constructing company " + company)
  ClientApp.selectCompany(company)
  update(  )
}

sideEffects.configureClient();

