
//--------------
/* 
let getCompanyEntityQueryObject = (companyDatoms, entity, eventTime) => returnObj({
  entityDatoms: companyDatoms
    .filter( companyDatom => isDefined(eventTime) ? companyDatom.t <= eventTime : true )
    .filter( companyDatom => companyDatom.entity === entity ),
  get: attr => getFromCompany( companyDatoms, entity, attr, eventTime )
})

let getCompanyDatomValue = (companyDatoms, entity, attribute, eventTime) => {

  let matchingDatoms = companyDatoms
  .filter( companyDatom => isDefined(eventTime) ? companyDatom.t <= eventTime : true )
  .filter( companyDatom => companyDatom.entity === entity )
  .filter( companyDatom => companyDatom.attribute === attribute )

  let selectedDatom = matchingDatoms.length > 0
    ? matchingDatoms.slice( -1 )[0]
    : undefined

  let datomValue = isDefined( selectedDatom ) 
    ? selectedDatom.value 
    : undefined




  //Return empty array if attribute is array?

  return datomValue
}  

let getFromCompany = (companyDatoms, entity, attribute, eventTime) => isDefined(attribute) 
  ? getCompanyDatomValue(companyDatoms, entity, attribute, eventTime) 
  : getCompanyEntityQueryObject(companyDatoms, entity, eventTime)

let newCompanyDatom = (companyEntity, attribute, value, t) => returnObj({
  entity: companyEntity, 
  attribute,
  value,
  t
})


 */


//SSOT

//let getAllAccountingYears = (DB, company) => DB.getAll( 7403 ).filter( accountingYear => DB.get( accountingYear, "entity/company") === company ).sort(  (a,b) => DB.get(a, 8255 ) - DB.get(b, 8255 ) )

//let getAccountingYearTransactions = (DB, company, accountingYear) => DB.get( company, 9817 ).filter( t => DB.get(t, "transaction/accountingYear") === accountingYear )

/* 
let getTransactionByIndex = (DB, company, companyDatoms, index) => DB.get( company, 9817 ).find( t => getFromCompany(companyDatoms, t, 8354) === index )

let getAccountingYearOpeningBalanceIndex = (DB,  companyDatoms, company, accountingYear) => getFromCompany( companyDatoms, getAccountingYearTransactions( DB, company, accountingYear )[0], 8354 ) - 1
let getAccountingYearClosingBalanceIndex = (DB, companyDatoms, company, accountingYear) => getFromCompany( companyDatoms, getAccountingYearTransactions( DB, company, accountingYear ).find( t => State.DB.get(t, "transaction/transactionType") === 9384 ), 8354 )

let getAllActors = (DB, company) => DB.getAll( 7979 ).filter( entity => DB.get( entity, 8849 )  === company  )
let getBalanceObjects = (DB, companyDatoms, company, queryObject) => DB.get(company, 10052)( queryObject ) */
/* 
{

  let CompanyQueryObject = { 
    entity: company,
    get: (entity, attr) => DB.isAttribute( attr ) ? DB.get(entity, attr) : getFromCompany( companyDatoms, entity, attr ),
  }

  let allBalanceObjects = DB.get(company, 10034)

  let querryObjectAttributeController = {
    "5030": 8747, //account
    "7531": 7934, //balanceObjectType
    "7536": 8768 //balanceSection
  }

  let queryAttribute = querryObjectAttributeController[ DB.get( isArray(queryObject) ? queryObject[0] : queryObject , 19 ) ]

  return isUndefined(queryObject)
  ? allBalanceObjects
  : isArray(queryObject) 
    ? queryObject.length === 0
      ? []
      : allBalanceObjects.filter( balanceObject => queryObject.includes( CompanyQueryObject.get(balanceObject, queryAttribute) )  )
    : allBalanceObjects.filter( balanceObject => CompanyQueryObject.get(balanceObject,  queryAttribute) === queryObject  )
    
}  */

/* 
let constructCompanyDatoms = (DB, company ) => {
  let startTime = Date.now()
  
  let allTransactions = DB.get( company, 9817 ).filter( transaction => isDefined( DB.get( transaction, "transaction/transactionType" ) )  )
  if(allTransactions.length === 0){return []}
  let companyDatomsWithCompanyCalculatedDatoms = allTransactions.reduce( ( companyDatoms, transaction, index ) => companyTransactionReducer(DB, company, companyDatoms, transaction, index), [] )

  console.log(`constructCompanyDatoms finished in ${Date.now() - startTime} ms`)

  return []// companyDatomsWithCompanyCalculatedDatoms
}


let companyTransactionCalculatedFieldReducer = (DB, companyDatoms, company, transaction, transactionIndex, calculatedField) => {

    let DBObject = {
      get: (entity, attr, tIndex) => DB.get( DB.attr(attr) , 19) === 5817 ? getFromCompany( companyDatoms, entity, DB.attr(attr), isDefined(tIndex) ? tIndex : transactionIndex ) : DB.get(entity, DB.attr(attr))
    }

    let TransactionQueryObject = {entity: transaction, get: attr => DBObject.get(transaction, DB.attr(attr)) }

    return companyDatoms.concat( newCompanyDatom(
      transaction, 
      calculatedField, 
      tryFunction( () => new Function( [`Database`, `Entity`], DB.get(calculatedField, 6792 )
        .filter( statement => statement["statement/isEnabled"] )
        .map( statement => statement["statement/statement"] ).join(";") )( DBObject, TransactionQueryObject ) ),
      transactionIndex
    ) )
}

let companyTransactionReducer = (DB, company, companyDatoms, transaction, index) => {

  let transactionIndex = index + 1
  let companyDatomsWithEventTypeDatoms = DB.get(DB.get(transaction, "transaction/transactionType" ), 6789 ).reduce( (companyDatoms, calculatedField) => companyTransactionCalculatedFieldReducer(DB, companyDatoms, company, transaction, transactionIndex, calculatedField), companyDatoms  )

  let originNode = DB.get(transaction, 7867)
  let destinationNode = DB.get(transaction, 7866)

  let companyDatomsWithupdatedOriginNode = isDefined(originNode)
    ? balanceObjectReducer(DB, company, companyDatomsWithEventTypeDatoms, originNode, transactionIndex)
    : companyDatomsWithEventTypeDatoms

  let companyDatomsWithupdatedDestinationNode = isDefined(destinationNode)
  ? balanceObjectReducer(DB, company, companyDatomsWithupdatedOriginNode, destinationNode, transactionIndex)
  : companyDatomsWithupdatedOriginNode
  
  let companyCalculatedFields = DB.getAll(5817).filter( e => DB.get(e, 8357) === 5722 )

  let companyDatomsWithCompanyCalculatedDatoms = companyCalculatedFields.reduce( (companyDatoms, companyCalculatedField) => companyCalculatedFieldReducer(DB, companyDatoms, company, companyCalculatedField, transactionIndex), companyDatomsWithupdatedDestinationNode )
  

  return companyDatomsWithCompanyCalculatedDatoms
}

let balanceObjectReducer = (DB, company, companyDatoms, balanceObject, transactionIndex) => DB.get( DB.get( balanceObject, "balanceObject/balanceObjectType" ), "companyEntityType/calculatedFields" ).reduce( (companyDatoms, calculatedField) => balanceObjectCalculatedFieldReducer( DB, company, companyDatoms, balanceObject, calculatedField, transactionIndex ), companyDatoms )

let balanceObjectCalculatedFieldReducer = ( DB, company, companyDatoms, balanceObject, calculatedField, transactionIndex ) => {

  let DBObject = {
    get: (entity, attr, tIndex) => DB.get( DB.attr(attr) , 19) === 5817 ? getFromCompany( companyDatoms, entity, DB.attr(attr), isDefined(tIndex) ? tIndex : transactionIndex ) : DB.get(entity, DB.attr(attr))
  }

  let CompanyEntityQueryObject = { 
    entity: balanceObject, 
    t: transactionIndex,
    get: (attr, specificT) => DBObject.get(balanceObject, attr, specificT),
   }

  let newValueFunctionString = DB.get( calculatedField, 6792 ) 
    .filter( statement => statement["statement/isEnabled"] )
    .map( statement => statement["statement/statement"] )
    .join(";")

  let newDatom = newCompanyDatom(
    balanceObject, 
    calculatedField, 
    tryFunction( () => new Function( [`Database`, `Entity`], newValueFunctionString )( DBObject, CompanyEntityQueryObject ) ),
    transactionIndex, 
  )
  return companyDatoms.concat( newDatom )
  
}

let companyCalculatedFieldReducer = ( DB, companyDatoms, company, companyCalculatedField, transactionIndex ) => {

  let DBObject = {
    get: (entity, attr, tIndex) => DB.get( DB.attr(attr) , 19) === 5817 ? getFromCompany( companyDatoms, entity, DB.attr(attr), isDefined(tIndex) ? tIndex : transactionIndex ) : DB.get(entity, DB.attr(attr)),
    getBalanceObjects: queryObject => getBalanceObjects(DB, companyDatoms, company, queryObject),
  }

  let CompanyEntityQueryObject = { 
    entity: company, 
    t: transactionIndex,
    get: (attr, specificT) => DBObject.get(company, attr, specificT),
   }

  let newValueFunctionString = DB.get( companyCalculatedField, 6792 )
    .filter( statement => statement["statement/isEnabled"] )
    .map( statement => statement["statement/statement"] )
    .join(";")

  let calculatedDatom = newCompanyDatom(
    company, 
    companyCalculatedField, 
    tryFunction( () => new Function( [`Database`,`Entity`], newValueFunctionString )( DBObject, CompanyEntityQueryObject ) ),
    transactionIndex
  )
  
  let prevValue = getFromCompany( companyDatoms, company, companyCalculatedField, transactionIndex )

  return calculatedDatom.value === prevValue
    ? companyDatoms
    : companyDatoms.concat( calculatedDatom )
  
}
 */

/* 
{

  let openingBalanceIndex = DB.get( accountingYear, 9813 )
  let closingBalanceIndex = DB.get( accountingYear, 9814 )

  let CompanyQueryObject = { 
    entity: company,
    companyDatoms,
    get: (e, attr, specificT) => ( DB.isAttribute( attr )  || DB.get(attr, 19) === 9815 )
      ? DB.get(e, attr) 
      : getFromCompany( companyDatoms, e, attr, isDefined( specificT ) ? specificT : closingBalanceIndex ),
    getBalanceObjects: queryObject => getBalanceObjects( DB, companyDatoms, company, queryObject ),
  }

  let ReportQueryObject = { 
    entity: accountingYear, 
    get: attr => CompanyQueryObject.get(accountingYear, attr),
   }

  let sourceEntityTypeController = {
    "5030": () =>  DB.get(company, 10052)( DB.get(reportField, 7829) ).reduce( (sum, balanceObject) => sum + CompanyQueryObject.get(balanceObject, 7433), 0 ),
    "5722": () => getFromCompany( companyDatoms, company, calculatedField, closingBalanceIndex ), //company
    "7865": () => getFromCompany( companyDatoms, accountingYear, calculatedField, closingBalanceIndex ),
    "8662": () => tryFunction( () => new Function( [`Database`, `Company`, `Entity`], DB.get(reportField, 8662).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") )( DB, CompanyQueryObject, ReportQueryObject ) )
  }

  let sourceEntityType = DB.get( reportField, 8361 )

  let calculatedField = DB.get( reportField, 8362 )

  let value = sourceEntityTypeController[ sourceEntityType ]() 

  

  return value
  
}


 */