
//Updated Company Construction pipeline

let getCompanyEntities = companyDatoms => companyDatoms.map( companyDatom => companyDatom.entity ).filter( entity => !isNull(entity) ).filter(filterUniqueValues)
let getLatestEntityID = companyDatoms => isArray(companyDatoms)
  ? companyDatoms.length > 0
    ? getCompanyEntities( companyDatoms ).slice( -1 )[0]
    : 0
  : undefined

let getAllCompanyEntitiesByType = (companyDatoms, companyEntityType, eventTime) => {

  

  if( companyEntityType === 7863 ){ return companyDatoms
    .filter( companyDatom => isDefined(eventTime) ? companyDatom.t <= eventTime : true )
    .filter( companyDatom => companyDatom.attribute === 7861 )
    .filter( companyDatom => companyDatom.value === 7863 )
    .map(  companyDatom => companyDatom.entity )
    .filter( filterUniqueValues ) } else if( companyEntityType === 7865 ){ 
      return companyDatoms
      .filter( companyDatom => isDefined(eventTime) ? companyDatom.t <= eventTime : true )
      .filter( companyDatom => companyDatom.attribute === 7861 )
      .filter( companyDatom => companyDatom.value === 7865 )
      .map(  companyDatom => companyDatom.entity )
      .filter( filterUniqueValues ) 
    }else if( companyEntityType === 7864 ){ 
      return companyDatoms
      .filter( companyDatom => isDefined(eventTime) ? companyDatom.t <= eventTime : true )
      .filter( companyDatom => companyDatom.attribute === 7861 )
      .filter( companyDatom => companyDatom.value === 7864 )
      .map(  companyDatom => companyDatom.entity )
      .filter( filterUniqueValues ) 
    }else{
      return companyDatoms
        .filter( companyDatom => isDefined(eventTime) ? companyDatom.t <= eventTime : true )
        .filter( companyDatom => companyDatom.attribute === 6781 )
        .filter( companyDatom => companyDatom.value === companyEntityType )
        .map(  companyDatom => companyDatom.entity )
        .filter( filterUniqueValues )
    }





    


  
} 


let getProcessEntities = (DB, companyDatoms, process) => getProcessEvents(DB, process).map( event => getCompanyEntityFromEvent(companyDatoms, event) ).flat()

let getCompanyEntityQueryObject = (companyDatoms, entity, eventTime) => returnObject({
  entityDatoms: companyDatoms
    .filter( companyDatom => isDefined(eventTime) ? companyDatom.t <= eventTime : true )
    .filter( companyDatom => companyDatom.entity === entity ),
  get: attr => getFromCompany( companyDatoms, entity, attr, eventTime ),
  label: () => getFromCompany( companyDatoms, entity, 7529, eventTime )
})

let getCompanyDatomValue = (companyDatoms, entity, attribute, eventTime) => {

  let matchingDatoms = companyDatoms
  .filter( companyDatom => isDefined(eventTime) ? companyDatom.t <= eventTime : true )
  .filter( companyDatom => companyDatom.entity === entity )
  .filter( companyDatom => companyDatom.attribute === attribute )

  let selectedDatom = matchingDatoms.length > 0
    ? matchingDatoms.slice( -1 )[0]
    : undefined

  let datomValue = isDefined( selectedDatom ) ? selectedDatom.value : undefined

  //Return empty array if attribute is array?

  return datomValue
}  

let getCompanyEntityLabel = (DB, companyDatoms, companyEntity) => {

  let entityTypeController = {
    "6253": () => `Aksjepost i ${getFromCompany( companyDatoms, companyEntity, 1101 )}`,
    "6248": () => `Bankkonto i ${getFromCompany( companyDatoms, companyEntity, 1809 )}`,
    "7828": () => `Fordring på ${getFromCompany( companyDatoms, getFromCompany(companyDatoms, companyEntity, 5675) , 1113 )}`,
    "6237": () => `Aksjekapitalinnskudd ${ moment( getFromCompany( companyDatoms, companyEntity , 1757 ) ).format( "MM/YY" ) }`,
    "6243": () => `Opptjent egenkapital ${getFromCompany( companyDatoms, companyEntity, 6 )}`,
    "6264": () => `Gjeld til ${getFromCompany( companyDatoms, getFromCompany(companyDatoms, companyEntity, 5675) , 1113 )}`,
    "7858": () => `Foreløpig årsresultat ${moment( getFromCompany( companyDatoms, companyEntity, 1757 ) ).format("YYYY") }`,
    "7857": () => `Tilleggsutbytte ${moment( getFromCompany( companyDatoms, companyEntity, 1757 ) ).format("DD/MM") }`,
  }
  
  
  
  let companyEntityType = getFromCompany(companyDatoms, companyEntity, 6781)

  

  return isDefined( entityTypeController[ companyEntityType ]) 
    ? entityTypeController[ companyEntityType ]( ) 
    : `[${companyEntity}] ${ DB.get( companyEntityType, "entity/label") ? DB.get( companyEntityType, "entity/label") : "Mangler visningsnavn."}`
}  


let getAllEntityTransactions = (DB, companyDatoms, companyEntity, eventTime) => getAllCompanyEntitiesByType( companyDatoms, 7817, eventTime )
.filter( transactionEntity => getFromCompany(companyDatoms, transactionEntity, 7533) === companyEntity )

let getCompanyEntityFromEvent = (companyDatoms, event) => {
  let matchingDatom = companyDatoms.find( companyDatom => companyDatom.event === event )
  return isDefined(matchingDatom) ? matchingDatom.entity : undefined
} 

let getFromCompany = (companyDatoms, entity, attribute, eventTime) => isDefined(attribute) ? getCompanyDatomValue(companyDatoms, entity, attribute, eventTime) : getCompanyEntityQueryObject(companyDatoms, entity, eventTime)

let getCompanyEvents = (DB, company) => DB.getAll(46).filter( event => DB.get( event, "event/company")  === company  ).sort(  (a,b) => DB.get(a, 'event/date' ) - DB.get(b, 'event/date' ) )

let getEventIndex = (DB, event) => getCompanyEvents( DB, DB.get( event, "event/company") ).findIndex( e => e === event  )

let getCompanyProcesses = (DB, company) => {

  let companyEvents = getCompanyEvents( DB, State.Company.entity )

  return DB.getAll(5692).filter( process => DB.get(process , 'process/company' ) === company  ).sort( (processA, processB) => {
    let firstEventA = companyEvents.find( e => DB.get(e, "event/process") === processA )
    let firstEventDateA = isDefined(firstEventA) ? DB.get(firstEventA, 'event/date') : Date.now()
    let firstEventB = companyEvents.find( e => DB.get(e, "event/process") === processB )
    let firstEventDateB = isDefined(firstEventB ) ? DB.get(firstEventB , 'event/date') : Date.now()
  return firstEventDateA - firstEventDateB;
  })
} 


let getProcessEvents = (DB, process) => getCompanyEvents( DB, DB.get( process, "process/company" ) ).filter( event => DB.get( event, "event/process" ) === process )


let constructCompanyDatoms = (DB, company ) => {

  let allEvents = DB.getAll(46).filter( event => DB.get( event, "event/company")  === company  )

  let sourceDocumentEvents = allEvents.filter( event => DB.get( DB.get(event, "event/eventTypeEntity" ) , 7913 ) === 7865  )
  let balanceObjectCreationEvents = allEvents.filter( event => DB.get( DB.get(event, "event/eventTypeEntity" ) , 7913 ) === 7863  )
  let transactionEvents = allEvents.filter( event => DB.get( DB.get(event, "event/eventTypeEntity" ) , 7913 ) === 7864  ).sort(  (a,b) => DB.get(a, 'event/date' ) - DB.get(b, 'event/date' ) )
  let reportEvents = allEvents.filter( event => DB.get( DB.get(event, "event/eventTypeEntity" ) , 7913 ) === 7914  )
  
  

  let sortedEvents = [
    sourceDocumentEvents,
    balanceObjectCreationEvents,
    transactionEvents,
    reportEvents
  ].flat()


  return sortedEvents.reduce( (companyDatoms, event) => companyEventReducer(DB, companyDatoms, event), [] )

} 

let newCompanyDatom = (companyEntity, attribute, value, event, t) => returnObject({
  entity: companyEntity, 
  attribute,
  value,
  event,
  t
})


let companyEventReducer = (DB, companyDatoms, event) => {

  let eventType = DB.get(event, "event/eventTypeEntity" )
  let eventIndex = getEventIndex( DB, event )
  let newCompanyEntityType = DB.get(eventType, 7913 )
  let eventTypeConstructors = DB.get( eventType , "eventType/newEntities" )
  if( isUndefined(eventTypeConstructors) ){ return companyDatoms }
  let entityConstructor = eventTypeConstructors[0] //NB NB NB
  if( isUndefined(entityConstructor) ){ return companyDatoms }
  let sharedStatementsString = DB.get( eventType, "eventType/sharedStatements" )
      .filter( statement => statement["statement/isEnabled"] )
      .map( statement => statement["statement/statement"] )
      .join(";") + ";"

  let CompanyQueryObject = { 
    companyDatoms,
    getAll: (companyEntityType, eventIndex) => getAllCompanyEntitiesByType(companyDatoms, companyEntityType, eventIndex),
    get: (entity, attr, eventIndex) => getFromCompany( companyDatoms, entity, attr, eventIndex ),
    getCompanyEntityFromEvent: event => getCompanyEntityFromEvent( companyDatoms, event )
  }

  let newEntityID = getLatestEntityID(companyDatoms) + 1

  


  let genericNewEntityDatoms = [
    newCompanyDatom( newEntityID, 7861, newCompanyEntityType, event, eventIndex ),
    newCompanyDatom( newEntityID, 6781, entityConstructor.companyEntityType,event, eventIndex ),
    newCompanyDatom( newEntityID, 7543, event, event, eventIndex )
  ] 

  
  //log({event, eventType})

  /* {
    entity: newEntityID, 
    attribute,
    value: tryFunction( () => new Function( [`Database`, `Company`, `Event`], sharedStatementsString + entityConstructor.attributeAssertions[ attribute ].valueFunction )( DB, CompanyQueryObject, DB.get(event) ) ),
    t: eventIndex
  } */

  let generatedDatoms =  DB.get( entityConstructor.companyEntityType , "companyEntityType/attributes" ) 
    .filter( attribute => isDefined( entityConstructor.attributeAssertions[ attribute ] ) )
    .filter( attribute => entityConstructor.attributeAssertions[ attribute ].isEnabled )
    .reduce(  (generatedDatoms, attribute) => generatedDatoms.concat( newCompanyDatom(
      newEntityID, 
      attribute, 
      tryFunction( () => new Function( [`Database`, `Company`, `Event`], sharedStatementsString + entityConstructor.attributeAssertions[ attribute ].valueFunction )( DB, CompanyQueryObject, DB.get(event) ) ), 
      event, 
      eventIndex
    ) ) , genericNewEntityDatoms  )

  let companyDatomsWithEventTypeDatoms = companyDatoms.concat( generatedDatoms )

  // Sortering av rekkefølge for oppdattering av kalkulerte felter for selskapsentiteter

  //Videre sorterting TBD

  let allCompanyEntities = getCompanyEntities( companyDatomsWithEventTypeDatoms )
  let transactionEntityTypes = DB.getAll(6778)
  let transactionEntities = allCompanyEntities.filter( companyEntity => transactionEntityTypes.includes( getFromCompany(companyDatomsWithEventTypeDatoms, companyEntity, 6781) )  )
  let objectEntities = allCompanyEntities.filter( companyEntity => !transactionEntities.includes(companyEntity )  )
  let sortedEntities = transactionEntities.concat( objectEntities )

  // Sortering av rekkefølge for oppdattering av kalkulerte felter for selskapsentiteter - END

  let companyDatomsWithEventCalculatedDatoms = sortedEntities.reduce( (companyDatoms, companyEntity) => companyEntityReducer(DB, companyDatoms, companyEntity, event, eventIndex) , companyDatomsWithEventTypeDatoms  )

  let companyDatomsWithCompanyCalculatedDatoms = DB.get(7537, 7751).concat( 
    DB.get(7538, 7751),
    DB.get(7539, 7751)
    ).reduce( (companyDatoms, companyCalculatedField) => companyCalculatedFieldReducer(DB, companyDatoms, companyCalculatedField, event, eventIndex), companyDatomsWithEventCalculatedDatoms )


  return companyDatomsWithCompanyCalculatedDatoms
}

let companyEntityReducer = (DB, companyDatoms, companyEntity, event, eventIndex) => {

  let companyEntityType = getFromCompany(companyDatoms, companyEntity, 6781 )
  let companyEntityTypeCalculatedFields = DB.get( companyEntityType , 6789 )
  let companyDatomsWithCompanyEntityCalculatedDatoms = companyEntityTypeCalculatedFields.reduce( (companyDatoms, companyEntityTypeCalculatedField) => companyEntityCalculatedFieldReducer( DB, companyDatoms, companyEntity, companyEntityTypeCalculatedField, event, eventIndex ), companyDatoms )

  return companyDatomsWithCompanyEntityCalculatedDatoms

}

let companyEntityCalculatedFieldReducer = ( DB, companyDatoms, companyEntity, companyEntityTypeCalculatedField, event, eventIndex ) => {

  let CompanyQueryObject = { 
    getAll: (companyEntityType, eventIndex) => getAllCompanyEntitiesByType( companyDatoms, companyEntityType, eventIndex ),
    get: (entity, attr) => getFromCompany( companyDatoms, entity, attr, eventIndex ),
    getEntityTransactions: companyEntity => getAllEntityTransactions( DB, companyDatoms, companyEntity )
  }

  let CompanyEntityQueryObject = { 
    entity: companyEntity, 
    get: attr => getFromCompany( companyDatoms, companyEntity, attr, eventIndex ),
    getTransactions: () => getAllEntityTransactions( DB, companyDatoms, companyEntity ),
    getOutgoingTransactions: () => getAllCompanyEntitiesByType( companyDatoms, 7868, eventIndex ).filter( transactionEntity => getFromCompany(companyDatoms, transactionEntity, 7867) === companyEntity ),
    getIncomingTransactions: () => getAllCompanyEntitiesByType( companyDatoms, 7868, eventIndex ).filter( transactionEntity => getFromCompany(companyDatoms, transactionEntity, 7866) === companyEntity ),
    getTransaction: transactionEntity => getFromCompany( companyDatoms, transactionEntity ), //NB: Bør valideres?
   }


  let newValueFunctionString = DB.get( companyEntityTypeCalculatedField, 6792 ) 
    .filter( statement => statement["statement/isEnabled"] )
    .map( statement => statement["statement/statement"] )
    .join(";")

  let calculatedDatom = newCompanyDatom(
    companyEntity, 
    companyEntityTypeCalculatedField, 
    tryFunction( () => new Function( [`Database`, `Company`, `Entity`], newValueFunctionString )( DB, CompanyQueryObject, CompanyEntityQueryObject ) ),
    event, 
    eventIndex
  )
  

  let prevValue = getFromCompany( companyDatoms, companyEntity, companyEntityTypeCalculatedField, eventIndex )

  return calculatedDatom.value === prevValue
    ? companyDatoms
    : companyDatoms.concat( calculatedDatom )
  
}

let companyCalculatedFieldReducer = ( DB, companyDatoms, companyCalculatedField, event, eventIndex ) => {

  let CompanyQueryObject = { 
    getAll: (companyEntityType, eventIndex) => getAllCompanyEntitiesByType( companyDatoms, companyEntityType, eventIndex ),
    get: (entity, attr) => getFromCompany( companyDatoms, entity, attr, eventIndex ),
  }


  let newValueFunctionString = DB.get( companyCalculatedField, 6792 ) 
    .filter( statement => statement["statement/isEnabled"] )
    .map( statement => statement["statement/statement"] )
    .join(";")

  let calculatedDatom = newCompanyDatom(
    null, 
    companyCalculatedField, 
    tryFunction( () => new Function( [`Database`, `Company`], newValueFunctionString )( DB, CompanyQueryObject ) ),
    event, 
    eventIndex
  )
  

  let prevValue = getFromCompany( companyDatoms, null, companyCalculatedField, eventIndex )

  return calculatedDatom.value === prevValue
    ? companyDatoms
    : companyDatoms.concat( calculatedDatom )
  
}

//Updated Company Construction pipeline -- END