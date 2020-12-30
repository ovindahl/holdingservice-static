//Company query objects

let createCompanyEventQueryObject = (DB, CompanyVersion, event ) => {

  let Event = DB.get( event )
  Event.t =  DB.get(event, 'event/date')
  Event.process = Event.get("event/process")
  Event.companyDatoms = CompanyVersion.companyDatoms.filter( companyDatom => companyDatom.event === event )
  Event.entities = Event.companyDatoms.map( companyDatom => companyDatom.entity ).filter( filterUniqueValues )


  //Event.label = () => `[${DB.get( DB.get( Event.process ).get("process/accountingYear") ).label()}/H-${Company.events.findIndex( e => e === event ) + 1}] ${DB.get( Event.get("event/eventTypeEntity") ).label()}`
  Event.label = () => `${DB.get( Event.get("event/eventTypeEntity") ).label()}`

  let processEvents = CompanyVersion.events.filter( event => DB.get(event, "event/process") === Event.process )
  let prevEvent = processEvents[  processEvents.findIndex( e => e  === event ) - 1 ]
  Event.getPrevEvent = () => createCompanyEventQueryObject( DB, CompanyVersion, prevEvent )

  return Event
}

let createCompanyProcessQueryObject = (DB, CompanyVersion, process ) => {

  let Process = DB.get( process )
  Process.events = CompanyVersion.events.filter( event => DB.get(event, "event/process") === process )
  Process.startDate = DB.get(Process.events[0], "event/date")
  Process.endDate = DB.get(Process.events.slice(-1)[0], "event/date")
  
  Process.companyDatoms = CompanyVersion.companyDatoms.filter( companyDatom => companyDatom.process === process )
  Process.entities = Process.companyDatoms.map( companyDatom => companyDatom.entity ).filter( filterUniqueValues )

  Process.label = () => `[${DB.get( Process.get("process/accountingYear") ).label()}/${CompanyVersion.processes.findIndex( p => p === process ) + 1}] ${DB.get( Process.get("process/processType") ).label()}`

  Process.getFirstEvent = () => createCompanyEventQueryObject( DB, CompanyVersion, Process.events[0] )
  
  return Process
}
  
let createCompanyQueryObject = (DB, Company, t) => {

  let CompanyVersionDatoms = Company.companyDatoms.filter( companyDatom => isDefined(t) ? companyDatom.t <= t : true )

  let CompanyVersion = {
    entity: Company.entity,
    t: isDefined(t) ? t : Company.t,
    companyDatoms: CompanyVersionDatoms,
    entities: CompanyVersionDatoms.map( companyDatom => companyDatom.entity ).filter(filterUniqueValues),
    
    //TBD
    latestEntityID: Company.latestEntityID,
    events: Company.events, 
    processes: Company.processes
  }

  CompanyVersion.getAll = entityType => isDefined(entityType)
  ? CompanyVersionDatoms
    .filter( companyDatom => companyDatom.attribute === 6781 )
    .filter( companyDatom => companyDatom.value === entityType )
    .map(  companyDatom => companyDatom.entity )
    .filter( filterUniqueValues )
  : CompanyVersionDatoms
    .map(  companyDatom => companyDatom.entity )
    .filter( filterUniqueValues )
        

    CompanyVersion.getDatom = ( entity, attribute ) => CompanyVersionDatoms
      .filter( companyDatom => companyDatom.entity === entity )
      .filter( companyDatom => companyDatom.attribute === attribute )
      .slice( -1 )[0]

    CompanyVersion.getDatomValue = ( entity, attribute ) => isDefined( CompanyVersion.getDatom( entity, attribute ) ) 
      ? CompanyVersion.getDatom( entity, attribute, t ).value 
      : undefined

    CompanyVersion.getEntity = companyEntity => createCompanyEntityQueryObject(DB, CompanyVersion, companyEntity)

    CompanyVersion.getCalculatedFieldValue = (companyEntity, calculatedField) => {

      let newValueFunctionString = DB.get( calculatedField, 6792 )
        .filter( statement => statement["statement/isEnabled"] )
        .map( statement => statement["statement/statement"] )
        .join(";")

      


      let CompanyEntityVersion = CompanyVersion.getEntity( companyEntity )

      if(isUndefined(CompanyEntityVersion)){return undefined}

      return tryFunction( () => new Function( [`Company`, `Entity`], newValueFunctionString )( CompanyVersion, CompanyEntityVersion ) )
    
  }

  CompanyVersion.getCalculatedFieldversions = (companyEntity, calculatedField) => getCompanyEntityCalculatedFieldVersions(CompanyVersion, companyEntity, calculatedField )


  CompanyVersion.get = ( entity, attribute ) => isUndefined(attribute)
    ? CompanyVersion.getEntity( entity )
    : DB.get(attribute, "entity/entityType") === 42
      ? CompanyVersion.getDatomValue( entity, attribute )
      : CompanyVersion.getCalculatedFieldValue( entity, attribute )
  

  CompanyVersion.getEvent = event => createCompanyEventQueryObject( DB, CompanyVersion, event )
  CompanyVersion.getProcess = process => createCompanyProcessQueryObject( DB, CompanyVersion, process )




  //Temp methods for accbal in year end

  

  CompanyVersion.sumAccountBalance = accountNumbers => {

    let currentAccountBalance = CompanyVersion.get( 1, 6212 )

    let accountEntities = accountNumbers
    .map( accountNumber => getAccountEntity(DB, accountNumber)  )
    .filter( accountEntity => currentAccountBalance.filter( accountBalance => accountBalance.account === accountEntity ).length > 0 )

    

    let selectionSum = accountEntities.reduce( (sum, accountEntity) => sum + currentAccountBalance.find( accountBalance => accountBalance.account === accountEntity ).amount, 0 )

    return selectionSum

  } 

  CompanyVersion.getAccountBalance = accountNumber => CompanyVersion.sumAccountBalance([accountNumber])

  

return CompanyVersion

}

getAccountEntity = (DB, accountNumber) => DB.getAll(5030).find( accountEntity => DB.get(accountEntity, "entity/label").startsWith(accountNumber) )

let createCompanyEntityQueryObject = (DB, CompanyVersion, companyEntity) => {


    let companyEntityDatoms = CompanyVersion.companyDatoms.filter( companyDatom => companyDatom.entity === companyEntity )

    if (companyEntityDatoms.length === 0){return undefined}

    let CompanyEntity = {
      entity: companyEntity,
      t: CompanyVersion.t,
      companyEntityType: CompanyVersion.companyDatoms[0].value,
      companyDatoms: companyEntityDatoms,
    }

    CompanyEntity.get = attribute => DB.get(attribute, "entity/entityType") === 42
      ? CompanyVersion.getDatomValue( companyEntity, attribute, CompanyEntity.t )
      : CompanyVersion.getCalculatedFieldValue( companyEntity, attr, CompanyEntity.t )

    CompanyEntity.getOptions = attribute => DB.getCompanyOptionsFunction( attribute )( CompanyVersion, CompanyEntity )


    CompanyEntity.event = CompanyEntity.companyDatoms[0].event

    CompanyEntity.companyEntityType = CompanyEntity.get(6781)

    const companyEntityTypeLabelController = {
      "6785": () => CompanyEntity.get(1101),
      "6790": () => CompanyEntity.get(1113),
      "6791": () => `Gjeld til ${CompanyVersion.get( CompanyEntity.get(6777) ).label()}`,
      "7310": () => `Konto i ${CompanyEntity.get(1809)}`,
      "7079": () => `[${moment(CompanyEntity.get(1757), "x").format("DD/MM")}] ${ CompanyEntity.get(7450) < 0 ? "" : " + " } ${ CompanyEntity.get(7450) } stk ${CompanyVersion.get( CompanyEntity.get(6777) ).label()} (NOK ${ CompanyEntity.get(1083) }) ` ,
    }

    CompanyEntity.label = () => Object.keys(companyEntityTypeLabelController).includes(String(CompanyEntity.companyEntityType))
      ? companyEntityTypeLabelController[CompanyEntity.companyEntityType]()
      : `${DB.get( CompanyEntity.companyEntityType, "entity/label")} # ${CompanyVersion.getAll(CompanyEntity.companyEntityType).findIndex( e => e === CompanyEntity.entity) + 1}`

    return CompanyEntity

}

let getCompanyEntityCalculatedFieldVersions = (Company, companyEntity, calculatedField) => Company.events.reduce( ( versions, event ) => {

  let Event = Company.getEvent(event)

  let currentEventValue = Company.get(companyEntity, calculatedField, Event.t)

  let prevEventValue = versions.length > 0
   ? Company.get( companyEntity, calculatedField, versions.slice(-1)[0] )
   : undefined
  
  return ( JSON.stringify(currentEventValue) === JSON.stringify(prevEventValue) ) ? versions : versions.concat( Event.t )


}, [] )

//Updated Company Construction pipeline

let constructCompany = (DB, company ) => {

  let companyEvents = DB.getAll(46)
  .filter( event => DB.get( DB.get(event, "event/process"), "process/company" ) === company  )
  .sort(  (a,b) => DB.get(a, 'event/date' ) - DB.get(b, 'event/date' ) )

  let companyProcesses = DB.getAll(5692).filter( process => DB.get(process , 'process/company' ) === company  ).sort( (processA, processB) => {
    let processEventsA = companyEvents.filter( e => DB.get(e, "event/process") === processA )
    let firstEventA = processEventsA[0]
    let firstEventDateA = isDefined(firstEventA) ? DB.get(firstEventA, 'event/date') : Date.now()
    let processEventsB = companyEvents.filter( e => DB.get(e, "event/process") === processB )
    let firstEventB = processEventsB[0]
    let firstEventDateB = isDefined(firstEventB ) ? DB.get(firstEventB , 'event/date') : Date.now()
    return firstEventDateA - firstEventDateB;
  })

  let dbCompany = {
      entity: company,
      tx: DB.tx, //Burde være tx fra siste update i selskapets event/prosess/company, da har man en uniform vesionering,
      t: companyEvents[0].t,
      companyDatoms: [],
      entities: [],
      events: companyEvents,
      processes: companyProcesses
    }
  
    dbCompany.latestEntityID = 0;
  
    let constructedCompany = applyCompanyEvents( DB, createCompanyQueryObject(DB, dbCompany, 0) )

    constructedCompany.tx = DB.tx
    constructedCompany.getVersion = t => createCompanyQueryObject( DB, constructedCompany, t)
    constructedCompany.get = ( entity, attribute, t ) => isUndefined(attribute)
      ? constructedCompany.getVersion( t ).getEntity( entity )
      : DB.get(attribute, "entity/entityType") === 42
        ? constructedCompany.getVersion( t ).getDatomValue( entity, attribute )
        : constructedCompany.getVersion( t ).getCalculatedFieldValue( entity, attribute )

    return constructedCompany
}

let addDatomsToCompany = (prevCompany, Event, newDatoms) => {

  let Company = {
    entity: prevCompany.entity,
    t: Event.t,
    events: prevCompany.events,
    processes: prevCompany.processes,
    companyDatoms: prevCompany.companyDatoms.concat( newDatoms ),
    latestEntityID: newDatoms.reduce( (maxEntity, eventDatom) => eventDatom.entity > maxEntity ? eventDatom.entity : maxEntity, prevCompany.latestEntityID  ),
  }

  return Company

}
  
let applyCompanyEvents = ( DB, dbCompany ) => dbCompany.events.reduce( (prevCompany, event) => {

    let Event = createCompanyEventQueryObject( DB, prevCompany, event )
    let Process = createCompanyProcessQueryObject( DB, prevCompany, DB.get(event, "event/process") )
    let entityConstructors = DB.get( Event.get( "event/eventTypeEntity" ) , "eventType/newEntities" )
    let eventDatoms = entityConstructors.map( (entityConstructor, index) => constructEntityDatoms( DB, prevCompany, Process, Event, entityConstructor, index ) ).flat()
    let updatedCompany = addDatomsToCompany( prevCompany, Event, eventDatoms )
    let updatedCompanyQueryObject = createCompanyQueryObject( DB, updatedCompany )

    return updatedCompanyQueryObject
    }, dbCompany )
  
let constructEntityDatoms = ( DB, Company, Process, Event, entityConstructor, index) => {

let processType = Process.get("process/processType" )
let processTypeSharedStatements = DB.get( processType, "processType/sharedStatements" ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] )

let eventType = Event.get("event/eventTypeEntity" )



let eventTypeSharedStatements = DB.get( eventType, "eventType/sharedStatements" ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] )

let sharedStatements = processTypeSharedStatements.concat(eventTypeSharedStatements)
let sharedStatementsString = sharedStatements.join(";") + ";"

let companyEntityType = entityConstructor.companyEntityType
let attributeAssertions = entityConstructor.attributeAssertions
let entity = Company.latestEntityID + index + 1

let generatedDatoms =  DB.get( companyEntityType , "companyEntityType/attributes" ) 
  .filter( attribute => isDefined( attributeAssertions[ attribute ] ) )
  .filter( attribute => attributeAssertions[ attribute ].isEnabled )
  .map(  attribute => generateDatom( DB, Company, Process, Event, entity, sharedStatementsString, attributeAssertions, attribute ) )

let companyEntityTypeDatom = {
  entity, company: Company.entity, process: Process.entity , event: Event.entity, t: Event.t,
  attribute: 6781,
  value: companyEntityType
}

let entityDatoms = [companyEntityTypeDatom].concat(generatedDatoms)

return entityDatoms
}

let generateDatom = (DB, Company, Process, Event, entity, sharedStatementsString, attributeAssertions, attribute) => returnObject({
  entity, 
  company: Company.entity, 
  process: Process.entity, 
  event: Event.entity, 
  t: Event.t,
  attribute,
  value: tryFunction( () => new Function( [`Database`, `Company`, `Process`, `Event`], sharedStatementsString + attributeAssertions[ attribute ].valueFunction )( DB, Company, Process, Event ) )
})

//Updated Company Construction pipeline -- END