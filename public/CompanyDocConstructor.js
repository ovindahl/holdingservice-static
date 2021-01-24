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
let getAllTransactions = (DB, company) => DB.getAll( 7948 ).filter( transaction => DB.get( transaction, "event/company")  === company  ).sort(  (a,b) => DB.get(a, 'event/date' ) - DB.get(b, 'event/date' ) )
let getAllBalanceObjects = (DB, company) => DB.getAll( 7932 ).filter( balanceObject => DB.get( balanceObject, "event/company")  === company  )
let getAllReports = ( DB, accountingYear ) => DB.getAll(7865).filter( report => DB.get( report, 7408 )  === accountingYear  )

let constructCompanyDatoms = (DB, company ) => {
  let startTime = Date.now()
    

  let allTransactions = getAllTransactions( DB, company ).filter( transaction => isDefined( DB.get( transaction, "transaction/transactionType" ) )  )


  if(allTransactions.length === 0){return []}

  let companyDatomsWithCompanyCalculatedDatoms = allTransactions.reduce( ( companyDatoms, transaction, index ) => companyTransactionReducer(DB, company, companyDatoms, transaction, index), [] )
  let companyDatomsWithReportDatoms = getAllAccountingYears( DB, company ).reduce( (companyDatoms, accountingYear) => accountingYearReducer( DB, companyDatoms, company, accountingYear, allTransactions), companyDatomsWithCompanyCalculatedDatoms )
  console.log(`constructCompanyDatoms finished in ${Date.now() - startTime} ms`)

  return companyDatomsWithReportDatoms

}


let getCompanyQueryObject = (DB, company, companyDatoms, allTransactions, transactionIndex) => returnObject({ 
  entity: company,
  get: (entity, attr, specificT) => DB.isAttribute(attr) ? DB.get(entity, attr) : getFromCompany( companyDatoms, entity, attr, isDefined( specificT ) ? specificT : transactionIndex ),
  getAllTransactions: () =>  allTransactions //Denne er veldig treig, TBD
})

let constructCalculatedTransactionDatoms = (DB, companyDatoms, company, transaction, transactionIndex) => {

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
      entity: company,
      get: (entity, attr) => DB.isAttribute( attr ) ? DB.get(entity, attr) : getFromCompany( companyDatoms, entity, attr, transactionIndex ),
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
  let calculatedTransactionDatoms = constructCalculatedTransactionDatoms( DB, companyDatoms, company, transaction, transactionIndex )
  let companyDatomsWithEventTypeDatoms = companyDatoms.concat( calculatedTransactionDatoms )


  let originNode = DB.get(transaction, 7867)
  let destinationNode = DB.get(transaction, 7866)

  let allTransactions = companyDatomsWithEventTypeDatoms.filter( companyDatom => companyDatom.attribute === 8354 ).filter( companyDatom => companyDatom.value <= transactionIndex ).map( companyDatom => companyDatom.entity )

  let companyDatomsWithupdatedOriginNode = isDefined(originNode)
    ? balanceObjectReducer(DB, company, companyDatomsWithEventTypeDatoms, originNode, transactionIndex, allTransactions)
    : companyDatoms

  let companyDatomsWithupdatedDestinationNode = isDefined(destinationNode)
  ? balanceObjectReducer(DB, company, companyDatomsWithupdatedOriginNode, destinationNode, transactionIndex, allTransactions)
  : companyDatomsWithupdatedOriginNode
  
  let companyCalculatedFields = [
    [8356], //placeholder calculatedField
    DB.get(8220, 7751),
    DB.get(7537, 7751),
    DB.get(7538, 7751),
    DB.get(7539, 7751)
  ].flat()

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

  return companyDatoms.concat( newDatom )
  
}

let companyCalculatedFieldReducer = ( DB, companyDatoms, company, companyCalculatedField, transaction, transactionIndex ) => {

  

  let CompanyQueryObject = {
    entity: company,
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

//Updated Company Construction pipeline -- END

let accountingYearReducer = (DB, companyDatoms, company, accountingYear, allTransactions ) => {

  let accountingYearType = DB.get( accountingYear, "accountingYear/accountingYearType" )

  let accountingYearCalculatedFields = DB.get( accountingYearType, 6789 )

  let lastTransaction = allTransactions.filter( transaction => DB.get(transaction, 'transaction/accountingYear') === accountingYear ).slice( -1 )[0]

  let transactionIndex = getFromCompany( companyDatoms, lastTransaction, 8354 )

  let datomsWithAccountingYear = accountingYearCalculatedFields.reduce( (companyDatoms, calculatedField) => {

    let CompanyQueryObject = { 
      entity: company,
      get: (entity, attr, specificT) => DB.isAttribute(attr) ? DB.get(entity, attr) : getFromCompany( companyDatoms, entity, attr, isDefined( specificT ) ? specificT : transactionIndex ),
      getAllTransactions: () =>  allTransactions //Denne er veldig treig, TBD
    }
  
    let CompanyEntityQueryObject = { 
      entity: accountingYear, 
      get: attr => getFromCompany( companyDatoms, accountingYear, attr, transactionIndex ),
     }
  
    let newValueFunctionString = DB.get( calculatedField, 6792 ) 
      .filter( statement => statement["statement/isEnabled"] )
      .map( statement => statement["statement/statement"] )
      .join(";")
  
    let newDatom = newCompanyDatom(
      accountingYear, 
      calculatedField, 
      tryFunction( () => new Function( [`Database`, `Company`, `Entity`], newValueFunctionString )( DB, CompanyQueryObject, CompanyEntityQueryObject ) ),
      transactionIndex, 
    )
  
    return companyDatoms.concat( newDatom )

  }, companyDatoms )


  let accountingYearReports = getAllReports( DB, accountingYear )

  let datomsWithAccountingYearReportDatoms = accountingYearReports.reduce( (companyDatoms, report) => reportReducer(DB, companyDatoms, company, accountingYear, report, transactionIndex ) , datomsWithAccountingYear )

  

  return datomsWithAccountingYearReportDatoms

}

let reportReducer = (DB, companyDatoms, company, accountingYear, report, transactionIndex ) => {

  let reportType = DB.get( report, 8102 )

  if( isUndefined(DB.get( reportType, 8106 )) ){return log(companyDatoms, {ERROR: "report missing type: " + report} )}

  let reportFields = DB.get( reportType, 22 )

  let companyDatomsWithReportDatoms = reportFields.reduce( (companyDatoms, reportField) => reportCalculatedFieldReducer(DB, companyDatoms, company, accountingYear, report, reportField, transactionIndex ), companyDatoms )

  return companyDatomsWithReportDatoms

}

let reportCalculatedFieldReducer = ( DB, companyDatoms, company, accountingYear, report, reportField, transactionIndex ) => {

  let CompanyQueryObject = { 
    entity: company,
    get: (entity, attr, specificT) => DB.isAttribute( attr ) ? DB.get(entity, attr) : getFromCompany( companyDatoms, entity, attr, isDefined( specificT ) ? specificT : transactionIndex ),
  }

  let sourceEntityTypeController = {
    "5722": () => getFromCompany( companyDatoms, company, calculatedField, transactionIndex ), //company
    "7403": () => getFromCompany( companyDatoms, accountingYear, calculatedField, transactionIndex ),
    "7865": () => getFromCompany( companyDatoms, report, calculatedField, transactionIndex ),
    "8662": () => tryFunction( () => new Function( [`Database`, `Company`], DB.get(reportField, 8662).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") )( DB, CompanyQueryObject ) )
  }

  let sourceEntityType = DB.get( reportField, 8361 )

  //log({accountingYear, report, reportField, sourceEntityType})


  let calculatedField = DB.get( reportField, 8362 )

  let datomValue = sourceEntityTypeController[ sourceEntityType ]() 


  let newDatom = newCompanyDatom(
    report, 
    reportField, 
    datomValue,
    transactionIndex, 
  )

  

  return companyDatoms.concat( newDatom )
  
}
