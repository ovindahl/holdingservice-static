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

let newCompanyDatom = (companyEntity, attribute, value, t) => returnObject({
  entity: companyEntity, 
  attribute,
  value,
  t
})


//SSOT
let getAllAccountingYears = (DB, company) => DB.getAll( 7403 ).filter( accountingYear => DB.get( accountingYear, 8259) === company ).sort(  (a,b) => DB.get(a, 8255 ) - DB.get(b, 8255 ) )
let getAllTransactions = (DB, company) => DB.getAll( 7948 ).filter( transaction => DB.get( transaction, "entity/company")  === company  ).sort(  (a,b) => DB.get(a, 'event/date' ) - DB.get(b, 'event/date' ) )
let getAllBalanceObjects = (DB, company) => DB.getAll( 7932 ).filter( balanceObject => DB.get( balanceObject, "entity/company")  === company  )
let getAllActors = (DB, company) => DB.getAll( 7979 ).filter( entity => DB.get( entity, 8849 )  === company  )
let getBalanceObjects = (DB, companyDatoms, company, queryObject) => {

  let CompanyQueryObject = { 
    entity: company,
    get: (entity, attr) => DB.isAttribute( attr ) ? DB.get(entity, attr) : getFromCompany( companyDatoms, entity, attr ),
  }

  let allBalanceObjects = getAllBalanceObjects(DB, company )

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
    
} 




let getAllReports = ( DB, company ) => DB.getAll(7865).filter( report => DB.get( report, "entity/company" )  === company  )

let constructCompanyDatoms = (DB, company ) => {
  let startTime = Date.now()
  
  //Step 0: t=0

  //Entity validation and graph set-up TBD
  

  //Step 1: t=0
  let allBalanceObjects = getAllBalanceObjects( DB, company )
  if(allBalanceObjects.length === 0){return []}
  let companyDatomsWithInitialNodeCalculatedDatoms = allBalanceObjects.reduce( ( companyDatoms, node ) => balanceObjectReducer(DB, company, companyDatoms, node, 0, [] ), [] )

  //Step 2: transactions
  let allTransactions = getAllTransactions( DB, company ).filter( transaction => isDefined( DB.get( transaction, "transaction/transactionType" ) )  )
  if(allTransactions.length === 0){return companyDatomsWithInitialNodeCalculatedDatoms}
  let companyDatomsWithCompanyCalculatedDatoms = allTransactions.reduce( ( companyDatoms, transaction, index ) => companyTransactionReducer(DB, company, companyDatoms, transaction, index), companyDatomsWithInitialNodeCalculatedDatoms )
  
  //Step 3: reports
  let companyDatomsWithReportDatoms = getAllReports( DB, company ).reduce( (companyDatoms, report) => reportReducer(DB, companyDatoms, company, report ) , companyDatomsWithCompanyCalculatedDatoms )

  console.log(`constructCompanyDatoms finished in ${Date.now() - startTime} ms`)

  return companyDatomsWithReportDatoms
}

let getCompanyQueryObject = (DB, company, companyDatoms, allTransactions, transactionIndex) => returnObject({ 
  entity: company,
  get: (entity, attr, specificT) => DB.isAttribute(attr) ? DB.get(entity, attr) : getFromCompany( companyDatoms, entity, attr, isDefined( specificT ) ? specificT : transactionIndex ),
  getAllTransactions: () =>  allTransactions //Denne er veldig treig, TBD
})

let companyTransactionCalculatedFieldReducer = (DB, companyDatoms, company, transaction, transactionIndex, calculatedField) => {

  

    let CompanyQueryObject = {
      entity: company,
      get: (entity, attr) => DB.isAttribute( attr ) ? DB.get(entity, attr) : getFromCompany( companyDatoms, entity, attr, transactionIndex ),
      getAllTransactions: () =>  getAllTransactions( DB, company ) //Denne er veldig treig, TBD
    }

    let TransactionQueryObject = {
      entity: transaction,
      index: transactionIndex,
      get: attr => CompanyQueryObject.get(transaction, attr), //Får ikke kalkulerte verdier fra seg selv
    }

  let calculatedTransactionDatom = newCompanyDatom(
    transaction, 
    calculatedField, 
    tryFunction( () => new Function( [`Database`, `Company`, `Transaction`], DB.get(calculatedField, 6792 ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") )( DB, CompanyQueryObject, TransactionQueryObject ) ),
    transactionIndex
  )

    return companyDatoms.concat( calculatedTransactionDatom )
}

let companyTransactionReducer = (DB, company, companyDatoms, transaction, index) => {

  let transactionIndex = index + 1
  let transactionType = DB.get(transaction, "transaction/transactionType" )
  let transactionCalculatedFields = DB.get(transactionType, 6789 )
  let companyDatomsWithEventTypeDatoms = transactionCalculatedFields.reduce( (companyDatoms, calculatedField) => companyTransactionCalculatedFieldReducer(DB, companyDatoms, company, transaction, transactionIndex, calculatedField), companyDatoms  )

  let originNode = DB.get(transaction, 7867)
  let destinationNode = DB.get(transaction, 7866)
  let allTransactions = companyDatomsWithEventTypeDatoms.filter( companyDatom => companyDatom.attribute === 8354 ).filter( companyDatom => companyDatom.value <= transactionIndex ).map( companyDatom => companyDatom.entity )

  let companyDatomsWithupdatedOriginNode = isDefined(originNode)
    ? balanceObjectReducer(DB, company, companyDatomsWithEventTypeDatoms, originNode, transactionIndex, allTransactions)
    : companyDatomsWithEventTypeDatoms

  let companyDatomsWithupdatedDestinationNode = isDefined(destinationNode)
  ? balanceObjectReducer(DB, company, companyDatomsWithupdatedOriginNode, destinationNode, transactionIndex, allTransactions)
  : companyDatomsWithupdatedOriginNode
  
  let companyCalculatedFields = DB.getAll(5817).filter( e => DB.get(e, 8357) === 5722 )

  let companyDatomsWithCompanyCalculatedDatoms = companyCalculatedFields.reduce( (companyDatoms, companyCalculatedField) => companyCalculatedFieldReducer(DB, companyDatoms, company, companyCalculatedField, transaction, transactionIndex), companyDatomsWithupdatedDestinationNode )
  

  return companyDatomsWithCompanyCalculatedDatoms
}

let balanceObjectReducer = (DB, company, companyDatoms, balanceObject, transactionIndex, allTransactions) => DB
.get( DB.get( balanceObject, "balanceObject/balanceObjectType" ), "companyEntityType/calculatedFields" )
  .reduce( 
    (companyDatoms, calculatedField) => balanceObjectCalculatedFieldReducer( DB, company, companyDatoms, balanceObject, calculatedField, transactionIndex, allTransactions ), 
    companyDatoms )

let balanceObjectCalculatedFieldReducer = ( DB, company, companyDatoms, balanceObject, calculatedField, transactionIndex, allTransactions ) => {

  let CompanyQueryObject = { 
    entity: company,
    get: (entity, attr, specificT) => DB.isAttribute( attr ) ? DB.get(entity, attr) : getFromCompany( companyDatoms, entity, attr, isDefined( specificT ) ? specificT : transactionIndex ),
    getAllTransactions: () =>  allTransactions //Denne er veldig treig, TBD
  }

  let CompanyEntityQueryObject = { 
    entity: balanceObject, 
    get: attr => CompanyQueryObject.get(balanceObject, attr),
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
  return companyDatoms.concat( newDatom )
  
}

let companyCalculatedFieldReducer = ( DB, companyDatoms, company, companyCalculatedField, transaction, transactionIndex ) => {

  

  let CompanyQueryObject = {
    entity: company,
    getAllTransactions: () => getAllTransactions(DB, company ),
    getBalanceObjects: queryObject => getBalanceObjects(DB, companyDatoms, company, queryObject),
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
    company, 
    companyCalculatedField, 
    tryFunction( () => new Function( [`Database`, `Company`], newValueFunctionString )( DB, CompanyQueryObject ) ),
    transactionIndex
  )
  
  let prevValue = getFromCompany( companyDatoms, company, companyCalculatedField, transactionIndex )

  return calculatedDatom.value === prevValue
    ? companyDatoms
    : companyDatoms.concat( calculatedDatom )


    
  
}

let reportReducer = (DB, companyDatoms, company, report ) => {

  let reportType = DB.get( report, 8102 )

  let transactionIndex = DB.get( report, 7916 )

  if( isUndefined(DB.get( reportType, 8106 )) ){return log(companyDatoms, {ERROR: "report missing type: " + report} )}

  let reportFields = DB.getAll( 8359 ).filter( reportField => DB.get(reportField, 8363) === reportType )

  let companyDatomsWithReportDatoms = reportFields.reduce( (companyDatoms, reportField) => reportCalculatedFieldReducer(DB, companyDatoms, company, report, reportField, transactionIndex ), companyDatoms )

  return companyDatomsWithReportDatoms

}

let reportCalculatedFieldReducer = ( DB, companyDatoms, company, report, reportField, transactionIndex ) => {

  let CompanyQueryObject = { 
    entity: company,
    get: (entity, attr, specificT) => DB.isAttribute( attr ) ? DB.get(entity, attr) : getFromCompany( companyDatoms, entity, attr, isDefined( specificT ) ? specificT : transactionIndex ),
  }



  let sourceEntityTypeController = {
    "5030": () => getBalanceObjects(DB, companyDatoms, company, DB.get(reportField, 7829) ).reduce( (sum, balanceObject) => sum + CompanyQueryObject.get(balanceObject, 7433, transactionIndex), 0 ),
    "5722": () => getFromCompany( companyDatoms, company, calculatedField, transactionIndex ), //company
    "7865": () => getFromCompany( companyDatoms, report, calculatedField, transactionIndex ),
    "8662": () => tryFunction( () => new Function( [`Database`, `Company`], DB.get(reportField, 8662).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") )( DB, CompanyQueryObject ) )
  }

  let sourceEntityType = DB.get( reportField, 8361 )

  let calculatedField = DB.get( reportField, 8362 )
  //log({report, reportField, sourceEntityType})

  let datomValue = sourceEntityTypeController[ sourceEntityType ]() 


  let newDatom = newCompanyDatom(
    report, 
    reportField, 
    datomValue,
    transactionIndex, 
  )

  

  return companyDatoms.concat( newDatom )
  
}