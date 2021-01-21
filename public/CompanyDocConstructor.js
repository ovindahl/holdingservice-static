
//Updated Company Construction pipeline



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

let getFromCompany = (companyDatoms, entity, attribute, eventTime) => isDefined(attribute) ? getCompanyDatomValue(companyDatoms, entity, attribute, eventTime) : getCompanyEntityQueryObject(companyDatoms, entity, eventTime)







//Being used

let newCompanyDatom = (companyEntity, attribute, value, t) => returnObject({
  entity: companyEntity, 
  attribute,
  value,
  t
})

let getAllTransactions = (DB, company) => DB.getAll( 7948 )
  .filter( transaction => DB.get( transaction, "event/company")  === company  )
  .sort(  (a,b) => DB.get(a, 'event/date' ) - DB.get(b, 'event/date' ) )

let getAllTransactionAttributes = (DB, transactionEntity) => {

  let originNode = DB.get( transactionEntity, "transaction/originNode" )
  let destinationNode =DB.get( transactionEntity, "transaction/destinationNode" )

  let requiredAttributes = [7530, 7935, 7867, 7866, 1757, 1139]

  let requiredMeasures = [
    DB.get( DB.get( originNode, "balanceObject/balanceObjectType" ), "balanceObjectType/requiredMeasures" ),
    DB.get( DB.get( destinationNode, "balanceObject/balanceObjectType" ), "balanceObjectType/requiredMeasures" ),
  ].flat().filter( a => isNumber(a) ).filter( filterUniqueValues )


  let requiredMetadata = [
    DB.get( DB.get( originNode, "balanceObject/balanceObjectType" ), "balanceObjectType/requiredMetadata" ),
    DB.get( DB.get( destinationNode, "balanceObject/balanceObjectType" ), "balanceObjectType/requiredMetadata" ),
  ].flat().filter( a => isNumber(a) ).filter( filterUniqueValues )


  return requiredAttributes.concat(requiredMeasures).concat(requiredMetadata)
}

let getAllBalanceObjects = (DB, company) => DB.getAll( 7932 ).filter( balanceObject => DB.get( balanceObject, "event/company")  === company  )

let constructCompanyDatoms = (DB, company ) => {
  let startTime = Date.now()
    

  let allTransactions = getAllTransactions( DB, company )

  let companyDatomsWithCompanyCalculatedDatoms = allTransactions.filter( transaction => isDefined( DB.get( transaction, "transaction/transactionType" ) )  ).reduce( ( companyDatoms, transaction, index ) => companyTransactionReducer(DB, companyDatoms, transaction, index), [] )


  let companyDatomsWithReportDatoms = DB.getAll(7865).reduce( (companyDatoms, report) => companyReportReducer( DB, companyDatoms, report), companyDatomsWithCompanyCalculatedDatoms )
  console.log(`constructCompanyDatoms finished in ${Date.now() - startTime} ms`)

  return companyDatomsWithReportDatoms

}
  

let companyTransactionReducer = (DB, companyDatoms, transaction, index) => {

  let transactionType = DB.get(transaction, "transaction/transactionType" )
  let transactionIndex = index + 1
  


  let transactionAttributes = getAllTransactionAttributes( DB, transaction )

  

  /* 
  let sharedStatements = DB.get( transactionType, "transactionType/sharedStatements" )
  let transactionTypeInputAttributes = DB.get( transactionType, "transactionType/inputAttributes" )
  let datomConstructors = DB.get( transactionType , "transactionType/outputAttributes" ).filter( datomConstructor => datomConstructor.isEnabled )

  let sharedStatementsString = isDefined( sharedStatements ) 
    ? sharedStatements
      .filter( statement => statement["statement/isEnabled"] )
      .map( statement => statement["statement/statement"] )
      .join(";") + ";"
    : "" */

  let generatedDatoms =  transactionAttributes
    .reduce(  (generatedDatoms, attribute) => generatedDatoms.concat( newCompanyDatom(
      transaction, 
      attribute, 
      DB.get(transaction, attribute),
      /* transactionTypeInputAttributes.includes( datomConstructor.attribute )
        ? DB.get(transaction, datomConstructor.attribute)
        : tryFunction( () => new Function( [`Database`, `Company`, `Event`], sharedStatementsString + datomConstructor.valueFunction )( DB, { get: (entity, attr, transactionIndex) => getFromCompany( companyDatoms, entity, attr, transactionIndex ) }, DB.get(transaction) ) ),  */
      transactionIndex
    ) ) , [newCompanyDatom( transaction, 7916, transactionIndex , transactionIndex )]   )

    
  let companyDatomsWithEventTypeDatoms = companyDatoms.concat( generatedDatoms )

  let balanceObjectsToUpdate = generatedDatoms
    .filter( generatedDatom => generatedDatom.attribute === 7867 || generatedDatom.attribute === 7866 )
    .map( generatedDatom => generatedDatom.value )
    .filter( value => isNumber(value) )
    .filter( filterUniqueValues )

  let allBalanceObjects = getAllBalanceObjects( DB, DB.get( transaction, "event/company") )

  let allTransactions = getAllTransactions(DB, DB.get( transaction, "event/company") )

  let companyDatomsWithEventCalculatedDatoms = balanceObjectsToUpdate.reduce( (companyDatoms, balanceObject) => balanceObjectReducer(DB, companyDatoms, balanceObject, transaction, transactionIndex, allTransactions) , companyDatomsWithEventTypeDatoms  )
  
  let companyDatomsWithCompanyCalculatedDatoms = [
    DB.get(7537, 7751),
    DB.get(7538, 7751),
    DB.get(7539, 7751)
  ].flat().reduce( (companyDatoms, companyCalculatedField) => companyCalculatedFieldReducer(DB, companyDatoms, companyCalculatedField, transaction, transactionIndex), companyDatomsWithEventCalculatedDatoms )


  

  return companyDatomsWithCompanyCalculatedDatoms
}

let balanceObjectReducer = (DB, companyDatoms, balanceObject, transaction, transactionIndex, allTransactions) => {
  let balanceObjectType = DB.get( balanceObject, "balanceObject/balanceObjectType" )
  if( !isDefined(DB.get( balanceObjectType, "companyEntityType/calculatedFields" )) ){ return log(companyDatoms, {error: "balanceObjectReducer", companyDatoms, balanceObject, transaction, transactionIndex}) }
  return  DB.get( balanceObjectType, "companyEntityType/calculatedFields" ).reduce( (companyDatoms, calculatedField) => balanceObjectCalculatedFieldReducer( DB, companyDatoms, balanceObject, calculatedField, transaction, transactionIndex, allTransactions ), companyDatoms )
}


let balanceObjectCalculatedFieldReducer = ( DB, companyDatoms, balanceObject, calculatedField, transaction, transactionIndex, allTransactions ) => {

  let CompanyQueryObject = { 
    get: (entity, attr) => getFromCompany( companyDatoms, entity, attr, transactionIndex ),
    getAllTransactions: () =>  allTransactions //Denne er veldig treig, TBD
  }

  let CompanyEntityQueryObject = { 
    entity: balanceObject, 
    get: attr => getFromCompany( companyDatoms, balanceObject, attr, transactionIndex ),
   }

  let newValueFunctionString = DB.get( calculatedField, 6792 ) 
    .filter( statement => statement["statement/isEnabled"] )
    .map( statement => statement["statement/statement"] )
    .join(";")

  return companyDatoms.concat( newCompanyDatom(
    balanceObject, 
    calculatedField, 
    tryFunction( () => new Function( [`Database`, `Company`, `Entity`], newValueFunctionString )( DB, CompanyQueryObject, CompanyEntityQueryObject ) ),
    transactionIndex, 
  ))
  
}

let companyCalculatedFieldReducer = ( DB, companyDatoms, companyCalculatedField, transaction, transactionIndex ) => {

  

  let CompanyQueryObject = {
    getAllTransactions: () => getAllTransactions(DB, DB.get( transaction, "event/company") ),
    getBalanceObjects: balanceObjectType => isDefined(balanceObjectType)
      ? getAllBalanceObjects(DB, DB.get( transaction, "event/company") ).filter( balanceObject => isArray(balanceObjectType) 
          ? balanceObjectType.includes( DB.get(balanceObject, 7934) ) 
          : DB.get(balanceObject, 7934) === balanceObjectType 
        )
      : getAllBalanceObjects(DB, DB.get( transaction, "event/company") ),
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
    transactionIndex
  )
  
  let prevValue = getFromCompany( companyDatoms, null, companyCalculatedField, transactionIndex )

  return calculatedDatom.value === prevValue
    ? companyDatoms
    : companyDatoms.concat( calculatedDatom )
  
}

//Updated Company Construction pipeline -- END


let companyReportReducer = (DB, companyDatoms, report) => {

  let reportType = DB.get( report, 8102 )

  if( isUndefined(DB.get( reportType, 8106 )) ){return companyDatoms}

  let datomConstructors = DB.get( reportType, 8106 ).filter( datomConstructor => datomConstructor.isEnabled )

  
  let sharedStatements = DB.get( reportType, 6771 )

  let sharedStatementsString = isDefined( sharedStatements ) 
    ? sharedStatements
      .filter( statement => statement["statement/isEnabled"] )
      .map( statement => statement["statement/statement"] )
      .join(";") + ";"
    : ""

    let company = DB.get( report, "event/company")

    let CompanyQueryObject = {
      getAllTransactions: () => getAllTransactions(DB, company ),
      getBalanceObjects: balanceObjectType => isDefined(balanceObjectType)
        ? getAllBalanceObjects(DB, company ).filter( balanceObject => isArray(balanceObjectType) 
            ? balanceObjectType.includes( DB.get(balanceObject, 7934) ) 
            : DB.get(balanceObject, 7934) === balanceObjectType 
          )
        : getAllBalanceObjects(DB, company ),
      get: (entity, attr) => getFromCompany( companyDatoms, entity, attr ),
    }

    let reportDatoms = datomConstructors.map( datomConstructor => newCompanyDatom(
      report, 
      datomConstructor.attribute, 
      tryFunction( () => new Function( [`Database`, `Company`, `Event`], sharedStatementsString + datomConstructor.valueFunction )( DB, CompanyQueryObject, DB.get(report) ) ),
      companyDatoms.slice(-1)[0].t
    ) )

    return companyDatoms.concat( reportDatoms )

}




/* 
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
    }else if( companyEntityType === 7948 ){ 
      return companyDatoms
      .filter( companyDatom => isDefined(eventTime) ? companyDatom.t <= eventTime : true )
      .filter( companyDatom => companyDatom.attribute === 7861 )
      .filter( companyDatom => companyDatom.value === 7948 )
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

 */

