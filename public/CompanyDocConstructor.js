
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
    }else if( companyEntityType === 7914 ){ 
      return companyDatoms
      .filter( companyDatom => isDefined(eventTime) ? companyDatom.t <= eventTime : true )
      .filter( companyDatom => companyDatom.attribute === 7861 )
      .filter( companyDatom => companyDatom.value === 7914 )
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
    "7868": () => `Transaksjon # ${ formatNumber( getFromCompany( companyDatoms, companyEntity, 7916 ), 0 )  }`,
  }
  
  
  
  let companyEntityType = getFromCompany(companyDatoms, companyEntity, 6781)

  

  return isDefined( entityTypeController[ companyEntityType ]) 
    ? entityTypeController[ companyEntityType ]( ) 
    : `[${companyEntity}] ${ DB.get( companyEntityType, "entity/label") ? DB.get( companyEntityType, "entity/label") : "Mangler visningsnavn."}`
}  


let getCompanyTransactionByIndex = (companyDatoms, transactionIndex) => companyDatoms.filter( companyDatom => companyDatom.attribute === 7916 ).filter( companyDatom => companyDatom.value === transactionIndex )[0].entity

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



let getAllBalanceObjects = (DB, company) => DB.getAll( 7932 ).filter( balanceObject => DB.get( balanceObject, "event/company")  === company  )
let getAllTransactions = (DB, company) => DB.getAll( 46 )
  .filter( balanceObject => DB.get( balanceObject, "event/company")  === company  )
  .filter( transaction => isDefined(DB.get(transaction, "transaction/transactionType" ))  )
  .sort(  (a,b) => DB.get(a, 'event/date' ) - DB.get(b, 'event/date' ) )
let getAllReports = (DB, company) => DB.getAll(46).filter( event => DB.get( event, "event/company")  === company  ).filter( event => DB.get( DB.get(event, "event/eventTypeEntity" ) , 7913 ) === 7914  ) //TBD

let constructCompanyDatoms = (DB, company ) => getAllTransactions( DB, company ).reduce( ( companyDatoms, transaction, index ) => companyTransactionReducer(DB, companyDatoms, transaction, index), [] )

let newCompanyDatom = (companyEntity, attribute, value, event, t) => returnObject({
  entity: companyEntity, 
  attribute,
  value,
  event,
  t
})

let companyDocumentReducer = (DB, companyDatoms, event) => {

  let eventType = DB.get(event, "event/eventTypeEntity" )
  let eventIndex = 0
  let newCompanyEntityType = 7865

  let eventTypeConstructors = DB.get( eventType , "eventType/newEntities" )
  let entityConstructor = eventTypeConstructors[0] //NB NB NB
  let companyEntityType = entityConstructor.companyEntityType
  let documentAttributes = DB.get( companyEntityType , 6779 )

  let newEntityID = getLatestEntityID(companyDatoms) + 1

  let genericNewEntityDatoms = [
    newCompanyDatom( newEntityID, 7861, newCompanyEntityType, event, eventIndex ),
    newCompanyDatom( newEntityID, 6781, companyEntityType,event, eventIndex ),
    newCompanyDatom( newEntityID, 7543, event, event, eventIndex ),
    newCompanyDatom( newEntityID, 7916, 0, event, eventIndex )
  ] 


  let generatedDatoms =  documentAttributes.reduce(  (generatedDatoms, attribute) => generatedDatoms.concat( newCompanyDatom(
      newEntityID, 
      attribute, 
      DB.get(event, attribute), 
      event, 
      eventIndex
    ) ) , genericNewEntityDatoms  )

  let companyDatomsWithEventTypeDatoms = companyDatoms.concat( generatedDatoms )

  // Sortering av rekkefølge for oppdattering av kalkulerte felter for selskapsentiteter

  //Videre sorterting TBD

  
  return companyDatomsWithEventTypeDatoms
}

let balanceObjectReducer = (DB, companyDatoms, balanceObject) => {
  
  let eventIndex = 0
  let newCompanyEntityType = 7863

  let balanceObjectType = DB.get( balanceObject , "balanceObject/balanceObjectType" )
  let balanceObjectTypeAttributes = DB.get( balanceObjectType , 6779 )


  let newEntityID = getLatestEntityID(companyDatoms) + 1

  let genericNewEntityDatoms = [
    newCompanyDatom( newEntityID, 7861, newCompanyEntityType, balanceObject, eventIndex ),
    newCompanyDatom( newEntityID, 6781, balanceObjectType, balanceObject, eventIndex ),
    newCompanyDatom( newEntityID, 7543, balanceObject, balanceObject, eventIndex ),
    newCompanyDatom( newEntityID, 7916, 0, balanceObject, eventIndex )
  ] 
  
  //log({event, eventType})

  let generatedDatoms =  balanceObjectTypeAttributes
    .reduce(  (generatedDatoms, attribute) => generatedDatoms.concat( newCompanyDatom(
      newEntityID, 
      attribute, 
      DB.get( balanceObject, attribute ), 
      balanceObject, 
      eventIndex
    ) ) , genericNewEntityDatoms  )

  let companyDatomsWithEventTypeDatoms = companyDatoms.concat( generatedDatoms )

  // Sortering av rekkefølge for oppdattering av kalkulerte felter for selskapsentiteter

  //Videre sorterting TBD

  
  return companyDatomsWithEventTypeDatoms
}

let companyTransactionReducer = (DB, companyDatoms, transaction, index) => {

  let transactionType = DB.get(transaction, "transaction/transactionType" )
  let transactionIndex = index + 1

  let sharedStatementsString = DB.get( transactionType, "eventType/sharedStatements" )
      .filter( statement => statement["statement/isEnabled"] )
      .map( statement => statement["statement/statement"] )
      .join(";") + ";"

  let genericNewEntityDatoms = [
    newCompanyDatom( transaction, 7916, transactionIndex, transaction , transactionIndex ),
    newCompanyDatom( transaction, 7861, 46, transaction , transactionIndex ),
  ] 

  let entityConstructor = DB.get( transactionType , 6782 )[0]

  let generatedDatoms =  DB.get( 7868 , "companyEntityType/attributes" ) 
    .filter( attribute => isDefined( entityConstructor.attributeAssertions[ attribute ] ) )
    .filter( attribute => entityConstructor.attributeAssertions[ attribute ].isEnabled )
    .reduce(  (generatedDatoms, attribute) => generatedDatoms.concat( newCompanyDatom(
      transaction, 
      attribute, 
      tryFunction( () => new Function( [`Database`, `Company`, `Event`], sharedStatementsString + entityConstructor.attributeAssertions[ attribute ].valueFunction )( DB, { get: (entity, attr, transactionIndex) => getFromCompany( companyDatoms, entity, attr, transactionIndex ) }, DB.get(transaction) ) ), 
      transaction, 
      transactionIndex
    ) ) , genericNewEntityDatoms  )

    

  let companyDatomsWithEventTypeDatoms = companyDatoms.concat( generatedDatoms )
  let balanceObjects = getAllBalanceObjects( DB, DB.get( transaction, "event/company") ) 
  let companyDatomsWithEventCalculatedDatoms = balanceObjects.reduce( (companyDatoms, balanceObject) => companyEntityReducer(DB, companyDatoms, balanceObject, transaction, transactionIndex) , companyDatomsWithEventTypeDatoms  )
  

  let companyDatomsWithCompanyCalculatedDatoms = DB.get(7537, 7751).concat( 
    DB.get(7538, 7751),
    DB.get(7539, 7751)
    ).reduce( (companyDatoms, companyCalculatedField) => companyCalculatedFieldReducer(DB, companyDatoms, companyCalculatedField, transaction, transactionIndex), companyDatomsWithEventCalculatedDatoms )


  return companyDatomsWithCompanyCalculatedDatoms
}

let companyEntityReducer = (DB, companyDatoms, balanceObject, transaction, transactionIndex) => {

  let balanceObjectType = DB.get( balanceObject, "balanceObject/balanceObjectType" )
  let balanceObjectTypeCalculatedFields = DB.get( balanceObjectType, "companyEntityType/calculatedFields" )
  let companyDatomsWithCompanyEntityCalculatedDatoms = balanceObjectTypeCalculatedFields.reduce( (companyDatoms, calculatedField) => companyEntityCalculatedFieldReducer( DB, companyDatoms, balanceObject, calculatedField, transaction, transactionIndex ), companyDatoms )
  return companyDatomsWithCompanyEntityCalculatedDatoms

}


let companyEntityCalculatedFieldReducer = ( DB, companyDatoms, balanceObject, calculatedField, transaction, transactionIndex ) => {

  let CompanyQueryObject = { 
    get: (entity, attr) => getFromCompany( companyDatoms, entity, attr, transactionIndex )
  }

  let CompanyEntityQueryObject = { 
    entity: balanceObject, 
    get: attr => getFromCompany( companyDatoms, balanceObject, attr, transactionIndex ),
    getOutgoingTransactions: () => getAllTransactions(DB, DB.get( transaction, "event/company") )
      .filter( transactionEntity => isDefined( getFromCompany( companyDatoms, transactionEntity, 7861, transactionIndex ) )  )
      .filter(  transactionEntity => getFromCompany( companyDatoms,  transactionEntity, 7867) === balanceObject ),
    getIncomingTransactions: () => getAllTransactions(DB, DB.get( transaction, "event/company") )
    .filter( transactionEntity => isDefined( getFromCompany( companyDatoms, transactionEntity, 7861, transactionIndex ) )  )
    .filter(  transactionEntity => getFromCompany( companyDatoms,  transactionEntity, 7866) === balanceObject ),
   }


  let newValueFunctionString = DB.get( calculatedField, 6792 ) 
    .filter( statement => statement["statement/isEnabled"] )
    .map( statement => statement["statement/statement"] )
    .join(";")

  let calculatedDatom = newCompanyDatom(
    balanceObject, 
    calculatedField, 
    tryFunction( () => new Function( [`Database`, `Company`, `Entity`], newValueFunctionString )( DB, CompanyQueryObject, CompanyEntityQueryObject ) ),
    transaction, 
    transactionIndex, 
  )
  
  let prevValue = getFromCompany( companyDatoms, balanceObject, calculatedField, transactionIndex )

  return calculatedDatom.value === prevValue
    ? companyDatoms
    : companyDatoms.concat( calculatedDatom )
  
}

let companyCalculatedFieldReducer = ( DB, companyDatoms, companyCalculatedField, transaction, transactionIndex ) => {

  let CompanyQueryObject = { 
    getAll: (companyEntityType, transactionIndex) => getAllCompanyEntitiesByType( companyDatoms, companyEntityType, transactionIndex ),
    get: (entity, attr) => getFromCompany( companyDatoms, entity, attr, transactionIndex ),
  }


  let newValueFunctionString = DB.get( companyCalculatedField, 6792 ) 
    .filter( statement => statement["statement/isEnabled"] )
    .map( statement => statement["statement/statement"] )
    .join(";")

  let calculatedDatom = newCompanyDatom(
    null, 
    companyCalculatedField, 
    tryFunction( () => new Function( [`Database`, `Company`], newValueFunctionString )( DB, CompanyQueryObject ) ),
    transaction, 
    transactionIndex
  )
  

  let prevValue = getFromCompany( companyDatoms, null, companyCalculatedField, transactionIndex )

  return calculatedDatom.value === prevValue
    ? companyDatoms
    : companyDatoms.concat( calculatedDatom )
  
}

//Updated Company Construction pipeline -- END