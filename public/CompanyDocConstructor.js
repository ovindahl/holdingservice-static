
//Updated Company Construction pipeline

let getCompanyEntities = companyDatoms => companyDatoms.map( companyDatom => companyDatom.entity ).filter( entity => !isNull(entity) ).filter(filterUniqueValues)
let getLatestEntityID = companyDatoms => isArray(companyDatoms)
  ? companyDatoms.length > 0
    ? getCompanyEntities( companyDatoms ).slice( -1 )[0]
    : 0
  : undefined

let getAllCompanyEntitiesByType = (companyDatoms, companyEntityType, eventTime) => companyDatoms
  .filter( companyDatom => isDefined(eventTime) ? companyDatom.t <= eventTime : true )
  .filter( companyDatom => companyDatom.attribute === 6781 )
  .filter( companyDatom => companyDatom.value === companyEntityType )
  .map(  companyDatom => companyDatom.entity )
  .filter( filterUniqueValues )


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

let getAllEntityTransactions = (DB, companyDatoms, companyEntity) => {

  let companyEntityType = getFromCompany(companyDatoms, companyEntity, 6781)

  let entityTypeTransactionType = DB.get( companyEntityType, 7532 )

  let allTransactionsOfType = getAllCompanyEntitiesByType( companyDatoms, entityTypeTransactionType )

  let allEntityTransactions = allTransactionsOfType.filter( transactionEntity => getFromCompany(companyDatoms, transactionEntity, 7533) === companyEntity )

  return allEntityTransactions

}

let getCompanyEntityFromEvent = (companyDatoms, event) => companyDatoms.find( companyDatom => companyDatom.attribute === 7543 && companyDatom.value === event ).entity

let getFromCompany = (companyDatoms, entity, attribute, eventTime) => isDefined(attribute) ? getCompanyDatomValue(companyDatoms, entity, attribute, eventTime) : getCompanyEntityQueryObject(companyDatoms, entity, eventTime)

let getCompanyEvents = (DB, company) => DB.getAll(46)
.filter( event => DB.get( event, "event/company")  === company  )
.sort(  (a,b) => DB.get(a, 'event/date' ) - DB.get(b, 'event/date' ) )



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


let constructCompanyDatoms = (DB, company ) => getCompanyEvents( DB, company ).reduce( (companyDatoms, event) => companyEventReducer(DB, companyDatoms, event), [] )


let companyEventReducer = (DB, companyDatoms, event) => {

  let eventTime = DB.get(event, 1757)    
  let eventType = DB.get(event, "event/eventTypeEntity" )
  let eventTypeConstructors = DB.get( eventType , "eventType/newEntities" )
  let entityConstructor = eventTypeConstructors[0] //NB NB NB
  let sharedStatementsString = DB.get( eventType, "eventType/sharedStatements" )
      .filter( statement => statement["statement/isEnabled"] )
      .map( statement => statement["statement/statement"] )
      .join(";") + ";"

  let CompanyQueryObject = { 
    companyDatoms,
    getAll: companyEntityType => getAllCompanyEntitiesByType(companyDatoms, companyEntityType),
    get: (entity, attr) => getFromCompany( companyDatoms, entity, attr, eventTime ),
    getCompanyEntityFromEvent: event => getCompanyEntityFromEvent( companyDatoms, event )
  }

  let newEntityID = getLatestEntityID(companyDatoms) + 1

  let genericNewEntityDatoms = [
    {
      entity: newEntityID, 
      attribute: 6781,
      value: entityConstructor.companyEntityType,
      t: eventTime
    } , {
      entity: newEntityID, 
      attribute: 7543,
      value: event,
      t: eventTime
    }
  ]

  let generatedDatoms =  DB.get( entityConstructor.companyEntityType , "companyEntityType/attributes" ) 
    .filter( attribute => isDefined( entityConstructor.attributeAssertions[ attribute ] ) )
    .filter( attribute => entityConstructor.attributeAssertions[ attribute ].isEnabled )
    .reduce(  (generatedDatoms, attribute) => generatedDatoms.concat( {
          entity: newEntityID, 
          attribute,
          value: tryFunction( () => new Function( [`Database`, `Company`, `Event`], sharedStatementsString + entityConstructor.attributeAssertions[ attribute ].valueFunction )( DB, CompanyQueryObject, DB.get(event) ) ),
          t: eventTime
        }) , genericNewEntityDatoms  )

  let companyDatomsWithEventTypeDatoms = companyDatoms.concat( generatedDatoms )

  // Sortering av rekkefølge for oppdattering av kalkulerte felter for selskapsentiteter

  //Videre sorterting TBD

  let allCompanyEntities = getCompanyEntities( companyDatomsWithEventTypeDatoms )
  let transactionEntityTypes = DB.getAll(6778)
  let transactionEntities = allCompanyEntities.filter( companyEntity => transactionEntityTypes.includes( getFromCompany(companyDatomsWithEventTypeDatoms, companyEntity, 6781) )  )
  let objectEntities = allCompanyEntities.filter( companyEntity => !transactionEntities.includes(companyEntity )  )
  let sortedEntities = transactionEntities.concat( objectEntities )

  // Sortering av rekkefølge for oppdattering av kalkulerte felter for selskapsentiteter - END

  let companyDatomsWithEventCalculatedDatoms = sortedEntities.reduce( (companyDatoms, companyEntity) => companyEntityReducer(DB, companyDatoms, companyEntity, eventTime) , companyDatomsWithEventTypeDatoms  )

  let companyDatomsWithCompanyCalculatedDatoms = DB.getAll(7526).filter( e => DB.get(e, "entity/category") === "Balanseoppstilling" ).reduce( (companyDatoms, companyCalculatedField) => companyCalculatedFieldReducer(DB, companyDatoms, companyCalculatedField, eventTime), companyDatomsWithEventCalculatedDatoms )


  return companyDatomsWithCompanyCalculatedDatoms
}

let companyEntityReducer = (DB, companyDatoms, companyEntity, eventTime) => {

  let companyEntityType = getFromCompany(companyDatoms, companyEntity, 6781)
  let companyEntityTypeCalculatedFields = DB.get( companyEntityType , 6789)
  let companyDatomsWithCompanyEntityCalculatedDatoms = companyEntityTypeCalculatedFields.reduce( (companyDatoms, companyEntityTypeCalculatedField) => companyEntityCalculatedFieldReducer( DB, companyDatoms, companyEntity, companyEntityTypeCalculatedField, eventTime ), companyDatoms )

  return companyDatomsWithCompanyEntityCalculatedDatoms

}

let companyEntityCalculatedFieldReducer = ( DB, companyDatoms, companyEntity, companyEntityTypeCalculatedField, eventTime ) => {

  let CompanyQueryObject = { 
    getAll: companyEntityType => getAllCompanyEntitiesByType( companyDatoms, companyEntityType ),
    get: (entity, attr) => getFromCompany( companyDatoms, entity, attr, eventTime ),
    getEntityTransactions: companyEntity => getAllEntityTransactions( DB, companyDatoms, companyEntity )
  }

  let CompanyEntityQueryObject = { 
    entity: companyEntity, 
    get: attr => getFromCompany( companyDatoms, companyEntity, attr, eventTime ),
    getTransactions: () => getAllEntityTransactions( DB, companyDatoms, companyEntity ),
    getTransaction: transactionEntity => getFromCompany( companyDatoms, transactionEntity ), //NB: Bør valideres?
   }


  let newValueFunctionString = DB.get( companyEntityTypeCalculatedField, 6792 ) 
    .filter( statement => statement["statement/isEnabled"] )
    .map( statement => statement["statement/statement"] )
    .join(";")

  let calculatedDatom = {
    entity: companyEntity, 
    attribute: companyEntityTypeCalculatedField,
    value: tryFunction( () => new Function( [`Database`, `Company`, `Entity`], newValueFunctionString )( DB, CompanyQueryObject, CompanyEntityQueryObject ) ),
    t: eventTime,
  }

  return companyDatoms.concat( calculatedDatom )
  
}

let companyCalculatedFieldReducer = ( DB, companyDatoms, companyCalculatedField, eventTime ) => {

  let CompanyQueryObject = { 
    getAll: companyEntityType => getAllCompanyEntitiesByType( companyDatoms, companyEntityType ),
    get: (entity, attr) => getFromCompany( companyDatoms, entity, attr, eventTime ),
  }


  let newValueFunctionString = DB.get( companyCalculatedField, 6792 ) 
    .filter( statement => statement["statement/isEnabled"] )
    .map( statement => statement["statement/statement"] )
    .join(";")

  let calculatedDatom = {
    entity: null, //Eller event/dato?
    attribute: companyCalculatedField,
    value: tryFunction( () => new Function( [`Database`, `Company`], newValueFunctionString )( DB, CompanyQueryObject ) ),
    t: eventTime,
  }

  return companyDatoms.concat( calculatedDatom )
  
}

//Updated Company Construction pipeline -- END