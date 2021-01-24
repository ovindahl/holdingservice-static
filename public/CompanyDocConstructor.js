
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

let getAllAccountingYears = (DB, company) => DB.getAll( 7403 ).filter( accountingYear => DB.get( accountingYear, 8259) === company ).sort(  (a,b) => DB.get(a, 8255 ) - DB.get(b, 8255 ) )
let getAllTransactions = (DB, company) => DB.getAll( 7948 ).filter( transaction => DB.get( transaction, "event/company")  === company  ).sort(  (a,b) => DB.get(a, 'event/date' ) - DB.get(b, 'event/date' ) )
let getAllBalanceObjects = (DB, company) => DB.getAll( 7932 ).filter( balanceObject => DB.get( balanceObject, "event/company")  === company  )
let getAllReports = ( DB, accountingYear ) => DB.getAll(7865).filter( report => DB.get( report, 7408 )  === accountingYear  )



let constructCompanyDatoms = (DB, company ) => {
  let startTime = Date.now()
    

  let allTransactions = getAllTransactions( DB, company ).filter( transaction => isDefined( DB.get( transaction, "transaction/transactionType" ) )  )


  if(allTransactions.length === 0){return []}

  let companyDatomsWithCompanyCalculatedDatoms = allTransactions.reduce( ( companyDatoms, transaction, index ) => companyTransactionReducer(DB, company, companyDatoms, transaction, index), [] )
  let companyDatomsWithReportDatoms = getAllAccountingYears( DB, company ).reduce( (companyDatoms, accountingYear) => accountingYearReducer( DB, companyDatoms, accountingYear), companyDatomsWithCompanyCalculatedDatoms )
  console.log(`constructCompanyDatoms finished in ${Date.now() - startTime} ms`)

  return companyDatomsWithReportDatoms

}

let arrayUnion = Arrays => Arrays.flat().filter( filterUniqueValues )

let constructCalculatedTransactionDatoms = (DB, companyDatoms, transaction, transactionIndex) => {

  let transactionType = DB.get(transaction, "transaction/transactionType" )
  
  let sharedStatements = DB.get( transactionType, "transactionType/sharedStatements" )
  let sharedStatementsString = isDefined( sharedStatements ) 
    ? sharedStatements
      .filter( statement => statement["statement/isEnabled"] )
      .map( statement => statement["statement/statement"] )
      .join(";") + ";"
    : "" 

    let transactionCalculatedFields = DB.get(transactionType, 6789 )

    let CompanyQueryObject = {
      get: (entity, attr) => isDefined( DB.get(entity, attr) )
        ? DB.get(entity, attr)
        : getFromCompany( companyDatoms, entity, attr, transactionIndex ),
    }

    let TransactionQueryObject = {
      index: transactionIndex,
      get: attr => DB.get(transaction, attr), //Får ikke kalkulerte verdier fra seg selv
    }

  let calculatedTransactionDatoms = transactionCalculatedFields.map( calculatedField => newCompanyDatom(
    transaction, 
    calculatedField, 
    tryFunction( () => new Function( [`Database`, `Company`, `Transaction`], sharedStatementsString + DB.get(calculatedField, 6792 ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") )( DB, CompanyQueryObject, TransactionQueryObject ) ),
    transactionIndex
  ) )

    return calculatedTransactionDatoms
}

let companyTransactionReducer = (DB, company, companyDatoms, transaction, index) => {

  let transactionIndex = index + 1
  let calculatedTransactionDatoms = constructCalculatedTransactionDatoms( DB, companyDatoms, transaction, transactionIndex )
  let companyDatomsWithEventTypeDatoms = companyDatoms.concat( calculatedTransactionDatoms )


  let originNode = DB.get(transaction, 7867)
  let destinationNode = DB.get(transaction, 7866)

  let allTransactions = companyDatomsWithEventTypeDatoms.filter( companyDatom => companyDatom.attribute === 8354 ).filter( companyDatom => companyDatom.value <= transactionIndex ).map( companyDatom => companyDatom.entity )

  let companyDatomsWithupdatedOriginNode = isDefined(originNode)
    ? balanceObjectReducer(DB, companyDatomsWithEventTypeDatoms, originNode, transaction, transactionIndex, allTransactions)
    : companyDatoms

  let companyDatomsWithupdatedDestinationNode = isDefined(destinationNode)
  ? balanceObjectReducer(DB, companyDatomsWithupdatedOriginNode, destinationNode, transaction, transactionIndex, allTransactions)
  : companyDatomsWithupdatedOriginNode
  
  let companyCalculatedFields = [
    [8356], //placeholder calculatedField
    DB.get(8220, 7751),
    DB.get(7537, 7751),
    DB.get(7538, 7751),
    DB.get(7539, 7751)
  ].flat()

  let companyDatomsWithCompanyCalculatedDatoms = companyCalculatedFields.reduce( (companyDatoms, companyCalculatedField) => companyCalculatedFieldReducer(DB, companyDatoms, companyCalculatedField, transaction, transactionIndex), companyDatomsWithupdatedDestinationNode )
  

  return companyDatomsWithCompanyCalculatedDatoms
}

let balanceObjectReducer = (DB, companyDatoms, balanceObject, transaction, transactionIndex, allTransactions) => {
  let balanceObjectType = DB.get( balanceObject, "balanceObject/balanceObjectType" )
  if( !isDefined(DB.get( balanceObjectType, "companyEntityType/calculatedFields" )) ){ return log(companyDatoms, {error: "balanceObjectReducer", companyDatoms, balanceObject, transaction, transactionIndex}) }
  return  DB.get( balanceObjectType, "companyEntityType/calculatedFields" ).reduce( (companyDatoms, calculatedField) => balanceObjectCalculatedFieldReducer( DB, companyDatoms, balanceObject, calculatedField, transaction, transactionIndex, allTransactions ), companyDatoms )
}


let balanceObjectCalculatedFieldReducer = ( DB, companyDatoms, balanceObject, calculatedField, transaction, transactionIndex, allTransactions ) => {

  let CompanyQueryObject = { 
    get: (entity, attr, specificT) => isDefined( DB.get(entity, attr) )
    ? DB.get(entity, attr)
    : getFromCompany( companyDatoms, entity, attr, isDefined( specificT ) ? specificT : transactionIndex ),
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

  let newDatom = newCompanyDatom(
    balanceObject, 
    calculatedField, 
    tryFunction( () => new Function( [`Database`, `Company`, `Entity`], newValueFunctionString )( DB, CompanyQueryObject, CompanyEntityQueryObject ) ),
    transactionIndex, 
  )

  if( calculatedField === 8322 ){


    log({newDatom, newValueFunctionString})
  }

  return companyDatoms.concat( newDatom )
  
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
    get: (entity, attr) => {

      let storedCompanyValue = getFromCompany( companyDatoms, entity, attr, transactionIndex )

      return isDefined( storedCompanyValue )
        ? storedCompanyValue
        : DB.get( attr, "attribute/isArray")
          ? []
          : DB.get( attr, "attribute/valueType") === 31
            ? 0
            : undefined


    } ,
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


let accountingYearReducer = (DB, companyDatoms, accountingYear ) => {

  let accountingYearType = DB.get( accountingYear, "accountingYear/accountingYearType" )

  let accountingYearCalculatedFields = DB.get( accountingYearType, 6789 )

  let allTransactions = getAllTransactions(DB, DB.get(accountingYear, "accountingYear/company" ) )

  let lastTransaction = allTransactions.filter( transaction => DB.get(transaction, 'transaction/accountingYear') === accountingYear ).slice( -1 )[0]

  let transactionIndex = getFromCompany( companyDatoms, lastTransaction, 8354 )

  let datomsWithAccountingYear = accountingYearCalculatedFields.reduce( (companyDatoms, calculatedField) => balanceObjectCalculatedFieldReducer( DB, companyDatoms, accountingYear, calculatedField, undefined, transactionIndex, allTransactions ) , companyDatoms )


  let accountingYearReports = [8108] // getAllReports( DB, accountingYear )

  let datomsWithAccountingYearReportDatoms = accountingYearReports.reduce( (companyDatoms, report) => reportReducer(DB, companyDatoms, accountingYear, report ) , datomsWithAccountingYear )

  

  return datomsWithAccountingYearReportDatoms

}

let reportReducer = (DB, companyDatoms, accountingYear, report,  ) => {

  let reportType = DB.get( report, 8102 )

  if( isUndefined(DB.get( reportType, 8106 )) ){return companyDatoms}

  //let datomConstructors = DB.get( reportType, 8106 ).filter( datomConstructor => datomConstructor.isEnabled )

  let reportFields = isDefined( DB.get( reportType, 22 ) ) ? DB.get( reportType, 22 ) : []

    let reportDatoms = reportFields.reduce( (companyDatoms, reportField) => reportCalculatedFieldReducer(DB, companyDatoms, accountingYear, report, reportField ), companyDatoms )
    return companyDatoms.concat( reportDatoms )

}


let reportCalculatedFieldReducer = ( DB, companyDatoms, accountingYear, report, reportField ) => {


  let allTransactions = getAllTransactions(DB, DB.get(accountingYear, "accountingYear/company" ) )

  let lastTransaction = allTransactions.filter( transaction => DB.get(transaction, 'transaction/accountingYear') === accountingYear ).slice( -1 )[0]

  let transactionIndex = getFromCompany( companyDatoms, lastTransaction, 8354 )

  let CompanyQueryObject = { 
    get: (entity, attr, specificT) => isDefined( DB.get(entity, attr) )
    ? DB.get(entity, attr)
    : getFromCompany( companyDatoms, entity, attr, isDefined( specificT ) ? specificT : transactionIndex ),
    getAllTransactions: () =>  allTransactions //Denne er veldig treig, TBD
  }

  let sourceEntityTypeController = {
    "5722": () => CompanyQueryObject.get( null, calculatedField ), //company
    "7403": () => CompanyQueryObject.get( accountingYear, calculatedField ),
    "7865": () => CompanyQueryObject.get( report, calculatedField ),
    "8662": () => tryFunction( () => new Function( [`Database`, `Company`], DB.get(reportField, 8662).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") )( DB, CompanyQueryObject ) )
  }

  let sourceEntityType = DB.get( reportField, 8361 )


  let calculatedField = DB.get( reportField, 8362 )

  let datomValue = sourceEntityTypeController[ sourceEntityType ]() 


  let newDatom = newCompanyDatom(
    report, 
    reportField, 
    datomValue,
    transactionIndex, 
  )

  log({accountingYear, report, reportField, sourceEntityType, newDatom})

  return companyDatoms.concat( newDatom )
  
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
    "7868": () => `Transaksjon # ${ formatNumber( getFromCompany( companyDatoms, companyEntity, 8354 ), 0 )  }`,
  }
  
  
  
  let companyEntityType = getFromCompany(companyDatoms, companyEntity, 6781)

  

  return isDefined( entityTypeController[ companyEntityType ]) 
    ? entityTypeController[ companyEntityType ]( ) 
    : `[${companyEntity}] ${ DB.get( companyEntityType, "entity/label") ? DB.get( companyEntityType, "entity/label") : "Mangler visningsnavn."}`
}  


let getCompanyTransactionByIndex = (companyDatoms, transactionIndex) => companyDatoms.filter( companyDatom => companyDatom.attribute === 8354 ).filter( companyDatom => companyDatom.value === transactionIndex )[0].entity

let getAllEntityTransactions = (DB, companyDatoms, companyEntity, eventTime) => getAllCompanyEntitiesByType( companyDatoms, 7817, eventTime )
.filter( transactionEntity => getFromCompany(companyDatoms, transactionEntity, 7533) === companyEntity )

let getCompanyEntityFromEvent = (companyDatoms, event) => {
  let matchingDatom = companyDatoms.find( companyDatom => companyDatom.event === event )
  return isDefined(matchingDatom) ? matchingDatom.entity : undefined
} 

 */

