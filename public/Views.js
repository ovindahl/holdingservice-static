//Action button

//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------



// CLIENT PAGE VIEWS


let clientPage = State => {

  if(State.S.isError){return d(State.S.error) }
  if(isUndefined(State.DB)){return d("Laster..") }


  let pageRouter = {
    "7509": accountingYearsView,
    "7860": balanceObjectsView,
    "7882": transactionsView,
    "7977": actorsView,
    "7919": reportsView,
  }
  
  return d([
    d([d('<header><h1>Holdingservice Beta</h1></header>'),d([
      d([dropdown(State.S.selectedCompany, State.DB.getAll( 5722 ).map( company => returnObject({value: company, label: State.DB.get(company, "entity/label")  })  ), e => State.Actions.updateCompany( Number( submitInputValue(e) ) ))]),
      submitButton("Bytt til admin", e => State.Actions.toggleAdmin() )
    ], {style: "display:flex;"} ),], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
    d([
      d(""),
      d([
        stateView( State ),
        d([
          d( [7509, 7860, 7882, 7977, 7919].map( pageEntity => entityLabelWithPopup( State, Number(pageEntity), () => State.Actions.selectPage(pageEntity) ) ), {class: "feedContainer"} ),
          br(),
          d([pageRouter[ State.S.selectedPage ]( State ) ], {class: "feedContainer"} )
        ])
      ])
    ], {class: "pageContainer"})
    
  ])
}

let stateView = State => {

  let companyTransactions = getAllTransactions( State.DB, State.S.selectedCompany )
  
  return d([
    d([
      h3("Nåværende state:"),
      d([
        entityLabelWithPopup( State, 5722),
        isDefined( State.S.selectedCompany ) ? entityLabelWithPopup( State, State.S.selectedCompany ) : d(" MANGLER "),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")} ),,
      d([
        entityLabelWithPopup( State, 7927),
        isDefined( State.S.selectedPage ) ? entityLabelWithPopup( State, State.S.selectedPage ) : d(" MANGLER "),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")} ),
      d([
        entityLabelWithPopup( State, 7929),
        isDefined( State.S.selectedCompanyEventIndex ) ? d( `${formatNumber( State.S.selectedCompanyEventIndex, 0 )} / ${companyTransactions.length} `) : d(" MANGLER "),
        d([
          submitButton("[<<]", () => State.Actions.selectCompanyEventIndex( 0 ) ),
          State.S.selectedCompanyEventIndex >= 1 ? submitButton("<", () => State.Actions.selectCompanyEventIndex( State.S.selectedCompanyEventIndex - 1 ) ) : d(""),
          State.S.selectedCompanyEventIndex < companyTransactions.length ? submitButton(">", () => State.Actions.selectCompanyEventIndex( State.S.selectedCompanyEventIndex + 1 ) ) : d(""),
          submitButton("[>>]", () => State.Actions.selectCompanyEventIndex( State.Company.get( companyTransactions.slice( - 1 )[0], 7916  )  ) )
        ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
      d([
        entityLabelWithPopup( State, 7928),
        isDefined( State.S.selectedEntity ) ? entityLabelWithPopup( State, State.S.selectedEntity ) : d(" - "),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
      br(),
      submitButton("Oppdatter kalkulerte verdier", () => State.Actions.updateCompany( State.S.selectedCompany ) )
    ])
  ], {class: "feedContainer"})
} 

//Page views



let accountingYearsView = State => isDefined( State.S.selectedEntity ) ? singleAccountingYearView( State ) : allAccountingYearsView( State )


let singleAccountingYearView = State => {

  let accountingYear = State.S.selectedEntity
  let accountingYearType = State.DB.get( accountingYear, "accountingYear/accountingYearType" )
  let inputAttributes = State.DB.get( accountingYearType, 7942 )


  return d([
    submitButton( " <---- Tilbake ", () => State.Actions.selectEntity( undefined )  ),
    br(),
    d([
      d([
        entityLabelWithPopup( State, 7403 ),
        span( " / " ),
        entityLabelWithPopup( State, accountingYear ),
        span( " / " ),
        entityLabelWithPopup( State, accountingYear ),
      ], {style: "display: inline-flex;"}),
    ], {style: gridColumnsStyle("3fr 1fr")}),
    br(),
    d( inputAttributes.map( attribute => entityAttributeView( State, accountingYear, attribute ) ) ),
    br(),
    State.DB.get( accountingYear, 8265  ) 
      ? taxView( State )
      : d(""),
    //submitButton("Slett", e => State.Actions.retractEntity(accountingYear) ),  
  ])
} 

let taxView = State => {

  let calculatedFields = State.DB.getAll( 7526 ).filter( e => DB.get(e, "entity/category") === "Resultatregnskapet")

  return d([
    h3("Beregnet resultat [NB: Akkummulert]"),
    d( calculatedFields.map( calculatedField => d([
      entityLabelWithPopup( State, calculatedField ),
      d(formatNumber( State.Company.get(null, calculatedField, State.S.selectedCompanyEventIndex ) )),
    ], {style: gridColumnsStyle("1fr 1fr ")}) ) ),
    br(),
    d([
      entityLabelWithPopup( State, 7819 ),
      d(formatNumber( State.Company.get(null, 7819, State.S.selectedCompanyEventIndex ) )),
    ], {style: gridColumnsStyle("1fr 1fr ")}),
    d([
      entityLabelWithPopup( State, 7818 ),
      d(formatNumber( State.Company.get(null, 7818, State.S.selectedCompanyEventIndex ) )),
    ], {style: gridColumnsStyle("1fr 1fr ")})
  ])
} 

let allAccountingYearsView = State => {

  let allAccountingYears = getAllAccountingYears( State.DB, State.S.selectedCompany )

  return d([
    h3("Alle regnskapsår"),
    d([
      d( allAccountingYears.map( accountingYear => d([
        entityLabelWithPopup( State, accountingYear )
      ], {style: gridColumnsStyle("1fr 1fr ")})  ) ),
    ]),
    br(),
    //submitButton("Legg til", () => State.Actions.createTransaction() ),
    br(),
  ])
} 

//---

let balanceObjectsView = State => isDefined( State.S.selectedEntity ) ? singleBalanceObjectView( State ) : allBalanceObjectsView( State )

let singleBalanceObjectView = State => {

  let balanceObject = State.S.selectedEntity
  let balanceObjectType = State.DB.get( balanceObject, "balanceObject/balanceObjectType" )


  let balanceObjectCalculatedFields = State.DB.get( balanceObjectType, "companyEntityType/calculatedFields" )

  let isLocked = isUndefined( State.Company.get(balanceObject, 7885) )
    ? false
    : State.Company.get(balanceObject, 7885).length > 0 || State.Company.get(balanceObject, 7884).length > 0

  return d([
      submitButton( " <---- Tilbake ", () => State.Actions.selectEntity( undefined )  ),
      br(),
      d([
        entityLabelWithPopup( State, 7860 ),
        span( " / " ),
        entityLabelWithPopup( State, State.DB.get( balanceObjectType, 7540 ) ),
        span( " / " ),
        entityLabelWithPopup( State, balanceObjectType ),
        span( " / " ),
        entityLabelWithPopup( State, balanceObject ),
      ]),
      br(),
      entityAttributeView(State, balanceObject, 7934),
      entityAttributeView(State, balanceObject, 6),
      br(),
      d( State.DB.get( balanceObjectType, "companyEntityType/attributes" ).map( attribute => entityAttributeView( State, balanceObject, attribute ) ) ),
      br(),
      d( balanceObjectCalculatedFields.map( calculatedField => companyDatomView( State, balanceObject, calculatedField ) ) ),
      br(),
      isLocked ? d("") : submitButton("Slett", e => State.Actions.retractEntity(balanceObject) )
    ])
} 


let allBalanceObjectsView = State => {

  let allBalanceObjects = State.Company.getBalanceObjects()

  return d([
    d( State.DB.getAll(7536).map( balanceSection =>  d([
      d([
        entityLabelWithPopup( State, balanceSection ),
        submitButton("+", () => State.Actions.createBalanceObject( D.getAll(7531).find( e => D.get(e, 7540) ===  balanceSection ) ) ),
      ], {style: "display: flex;"}),
      d( allBalanceObjects.filter( balanceObject => State.DB.get( State.DB.get( balanceObject, "balanceObject/balanceObjectType" ), 7540 ) === balanceSection ).map( balanceObject => d([
        entityLabelWithPopup( State, balanceObject ),
        d( formatNumber( State.Company.get( balanceObject, 7433, State.S.selectedCompanyEventIndex  ) ), {style: `text-align: right;`} )
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}))),
      d([
        entityLabelWithPopup( State, State.DB.get( balanceSection, 7748 ) ),
        d( formatNumber( State.Company.get( null, State.DB.get( balanceSection, 7748 ), State.S.selectedCompanyEventIndex  ) ), {style: `text-align: right;`} )        
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
      balanceSection === 7538
        ? d([
            entityLabelWithPopup( State, 6296 ),
            d( formatNumber( State.Company.get( null, 6296, State.S.selectedCompanyEventIndex  ) ), {style: `text-align: right;`} )        
          ], {style: gridColumnsStyle("repeat(3, 1fr)")})
        : br(),
    ]),  ) ),
    
    
    
    br(),
    submitButton("Legg til", () => State.Actions.createBalanceObject() ),
    br(),
    ])
} 

//---

let transactionsView = State => isDefined( State.S.selectedEntity ) ? singleTransactionView( State ) : allTransactionsView( State )

let singleTransactionView = State => isDefined( State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) )
 ? definedTransactionView( State )
 : undefinedTransactionView( State )

let definedTransactionView = State => {

  let companyTransaction = State.S.selectedEntity
  let transactionType = State.DB.get( companyTransaction, "transaction/transactionType" )
  let companyTransactions = getAllTransactions(State.DB, State.S.selectedCompany )

  let prevTransaction = companyTransactions[ companyTransactions.findIndex( t => t === companyTransaction ) - 1 ]
  let nextTransaction = companyTransactions[ companyTransactions.findIndex( t => t === companyTransaction ) + 1 ]

  let originNode = State.DB.get( companyTransaction, "transaction/originNode" )
  let destinationNode = State.DB.get( companyTransaction, "transaction/destinationNode" )

  let requiredAttributes = [7935, 1757, 1139]

  let requiredMeasures = [
    State.DB.get( State.DB.get( originNode, "balanceObject/balanceObjectType" ), "balanceObjectType/requiredMeasures" ),
    State.DB.get( State.DB.get( destinationNode, "balanceObject/balanceObjectType" ), "balanceObjectType/requiredMeasures" ),
  ].flat().filter( a => isNumber(a) ).filter( filterUniqueValues )


  let requiredMetadata = [
    State.DB.get( State.DB.get( originNode, "balanceObject/balanceObjectType" ), "balanceObjectType/requiredMetadata" ),
    State.DB.get( State.DB.get( destinationNode, "balanceObject/balanceObjectType" ), "balanceObjectType/requiredMetadata" ),
  ].flat().filter( a => isNumber(a) ).filter( filterUniqueValues )

  return d([
    submitButton( " <---- Tilbake ", () => State.Actions.selectEntity( undefined )  ),
    br(),
    d([
      d([
        entityLabelWithPopup( State, 7882 ),
        span( " / " ),
        entityLabelWithPopup( State, transactionType ),
        span( " / " ),
        entityLabelWithPopup( State, companyTransaction ),
      ], {style: "display: inline-flex;"}),
      d([
        isDefined( prevTransaction ) >= 1 ? submitButton("<", () => State.Actions.selectEntity( prevTransaction ) ) : d(""),
        isDefined( nextTransaction ) < companyTransactions.length ? submitButton(">", () => State.Actions.selectEntity( nextTransaction ) ) : d(""),
      ], {style: gridColumnsStyle("3fr 1fr")})
    ], {style: gridColumnsStyle("3fr 1fr")}),
    br(),
    br(),
    transactionFlowView( State, companyTransaction ),
    br(),
    d( requiredAttributes.map( attribute => entityAttributeView( State, companyTransaction, attribute ) ) ),
    br(),
    d( requiredMeasures.map( attribute => entityAttributeView( State, companyTransaction, attribute ) ) ),
    br(),
    d( requiredMetadata.map( attribute => entityAttributeView( State, companyTransaction, attribute ) ) ),
    br(),
    State.Company.get(companyTransaction, 8261) 
      ? d("🔒")
      : d([
        submitButton("Splitt i to transaksjoner", e => State.Actions.splitTransaction(companyTransaction) ),  
        submitButton("Slett", e => State.Actions.retractEntity(companyTransaction) ),
      ])
  ])
} 

let undefinedTransactionView = State => d([
  entityAttributeView(State, State.S.selectedEntity, 7935),
  submitButton("Slett", e => State.Actions.retractEntity(State.S.selectedEntity) ),  
])

let transactionFlowView = (State, companyTransaction) => d([
  d([
    entityLabelWithPopup( State, 7867 ),
    singleValueView( State, companyTransaction, 7867 ),
    State.DB.get( State.DB.get(companyTransaction, 7867) , 7934 ) === 7858
      ? entityLabelWithPopup( State, State.Company.get( companyTransaction , 7524 ) )
      : entityLabelWithPopup( State, State.DB.get( State.DB.get(companyTransaction, 7867) , 7934 ) ),
  ]),
  d([
    d(""),
    d([
      d( moment( State.Company.get( companyTransaction, 1757, State.S.selectedCompanyEventIndex ) ).format("DD.MM.YYYY") ),
      entityLabelWithPopup(State, companyTransaction ),
      d(formatNumber( State.Company.get(companyTransaction, 1083, State.S.selectedCompanyEventIndex ) )),
      d(" --------------> "),
    ]),
    d(""),
  ], {style: gridColumnsStyle("3fr 2fr 3fr")}),
  d([
    entityLabelWithPopup( State, 7866 ),
    singleValueView( State, companyTransaction, 7866 ),
    //entityLabelWithPopup( State, State.DB.get( State.DB.get(companyTransaction, 7866) , 1653 ) ),
    State.DB.get( State.DB.get(companyTransaction, 7866) , 7934 ) === 7858
      ? entityLabelWithPopup( State, State.Company.get( companyTransaction , 7524 ) )
      : entityLabelWithPopup( State, State.DB.get( State.DB.get(companyTransaction, 7866) , 7934 ) ),
    
  ])
], {class: "feedContainer", style: gridColumnsStyle("2fr 3fr 2fr")})



let allTransactionsView = State => {

  let alltransactions = getAllTransactions( State.DB, State.S.selectedCompany )

  return d([
    h3("Alle transaksjoner"),
    d([
      d( alltransactions.map( companyTransaction => d([
        entityLabelWithPopup(State, State.DB.get(companyTransaction, "transaction/accountingYear"), () => State.Actions.selectEntity(companyTransaction) ),
        d(`Transaksjon ${ State.Company.get(companyTransaction, 7916) }`, {class: "entityLabel", style: "background-color:#00bcd466;"}, "click", () => State.Actions.selectEntity(companyTransaction) ),
        d( moment( State.DB.get( companyTransaction, 1757 ) ).format("DD.MM.YYYY") , {style: `text-align: right;`}),
        d( formatNumber( State.DB.get( companyTransaction, 1083 ) ) , {style: `text-align: right;`}),
        d([
          isDefined( State.DB.get(companyTransaction, 7867) ) ? entityLabelWithPopup(State, State.DB.get(companyTransaction, 7867) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}) ,
          d(" --> "),
          isDefined( State.DB.get(companyTransaction, 7866) ) ? entityLabelWithPopup(State, State.DB.get(companyTransaction, 7866) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}) ,
        ], {style: gridColumnsStyle("3fr 1fr 3fr") + "padding-left: 3em;"} ),
        State.Company.get(companyTransaction, 8261) 
        ? d("🔒")
        : submitButton("❌", e => State.Actions.retractEntity(companyTransaction) )
      ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 3fr 1fr")})  ) ),
    ]),
    br(),
    submitButton("Legg til", () => State.Actions.createTransaction() ),
    br(),
    d([
      d("Importer fra:"),
      entityLabelWithPopup( State, 7313),
      input({type: "file", style: `text-align: right;`}, "change", e => Papa.parse(e.srcElement.files[0], {header: false, complete: async results => {

        let transactionRows = results.data.filter( row => row.length > 1 ).slice(5, results.data.length-1)

        let datoms = transactionRows.map( (transactionRow, index) => constructTransactionRowDatoms(State, transactionRow, index)  ).flat()            
        log({results, transactionRows, datoms})

        State.Actions.importBankDatoms(datoms)

        } }) ),
    ]),
  ])
} 

let parseDNBamount = stringAmount => Number( stringAmount.replaceAll(".", "").replaceAll(",", ".") ) 


let constructTransactionRowDatoms = ( State, transactionRow, index) => {

  let date = Number( moment( transactionRow[0], "DD.MM.YYYY" ).format("x") )
  let description = `${transactionRow[2]}: ${transactionRow[1]}`

  let paidAmount = transactionRow[5] === ""
    ? undefined
    : parseDNBamount( transactionRow[5] ) 

  let receivedAmount = transactionRow[6] === ""
  ? undefined
  :parseDNBamount( transactionRow[6] ) 

  let isPayment = isNumber( paidAmount )

  let amount = isPayment ? -paidAmount : receivedAmount

  let referenceNumber = transactionRow[7]


  let transactionDatoms = [
    newDatom( "newDatom_"+ index, "entity/entityType", 7948  ),
    newDatom( "newDatom_"+ index, "event/company", State.S.selectedCompany  ),
    newDatom( "newDatom_"+ index, "transaction/transactionType", 8019 ),
    newDatom( "newDatom_"+ index, "event/date", date  ),
    newDatom( "newDatom_"+ index, isPayment ? "transaction/originNode" : "transaction/destinationNode", 7313),
    newDatom( "newDatom_"+ index, "eventAttribute/1083", amount  ),
    newDatom( "newDatom_"+ index, "eventAttribute/1139", description  ),
    newDatom( "newDatom_"+ index, "bankTransaction/referenceNumber", referenceNumber  ),
  ]

  return transactionDatoms

}

//----

let actorsView = State => isDefined( State.S.selectedEntity ) ? singleActorView( State ) : allActorsView( State )

let allActorsView = State => {

  let allActors = State.DB.getAll(7979) //.filter( e => State.DB.get(e, 7535) === 6790 )

  return d([
    d([
      entityLabelWithPopup( State, 1113 ),
    ], {style: gridColumnsStyle("3fr 1fr")}),
    d( allActors.map( actor => d([
      entityLabelWithPopup( State, actor ),
      submitButton("X", e => State.Actions.retractEntity(actor) )
    ], {style: gridColumnsStyle("3fr 1fr")}) )),
  br(),
  submitButton("Legg til", () => State.Actions.createCompanyActor() ),
  br(),
  ]) 
} 

let singleActorView = State => {

  let actor = State.S.selectedEntity
  

  return isDefined(actor)
    ? d([
      submitButton( " <---- Tilbake ", () => State.Actions.selectEntity( undefined )  ),
      br(),
      d([
        entityLabelWithPopup( State, 7977 ),
        span( " / " ),
        entityLabelWithPopup( State, 6790 ),
        span( " / " ),
        entityLabelWithPopup( State, actor ),
      ]),
      br(),
      d( State.DB.get( 6790, "companyEntityType/attributes" ).map( attribute => entityAttributeView(State, actor, attribute ) ) ),
      submitButton("Slett", e => State.Actions.retractEntity(actor) ),  
    ])
  : d([
    entityAttributeView(State, actor, 7535),
    submitButton("Slett", e => State.Actions.retractEntity(actor) ),  
  ])
} 

let reportsView = State => isDefined( State.S.selectedEntity ) ? singleReportView( State ) : allReportsView( State )

let allReportsView = State => {

  let allReports = State.DB.getAll(7865) //.filter( e => State.DB.get(e, 7535) === 6790 )

  return d([
    d([
      entityLabelWithPopup( State, 7865 ),
    ], {style: gridColumnsStyle("3fr 1fr")}),
    d( allReports.map( report => d([
      entityLabelWithPopup( State, report ),
      submitButton("X", e => State.Actions.retractEntity(report) )
    ], {style: gridColumnsStyle("3fr 1fr")}) )),
  br(),
  submitButton("Legg til", () => State.Actions.createCompanyReport( 5669 ) ),
  br(),
  ]) 
} 

let singleReportView = State => {

  let report = State.S.selectedEntity

  let reportType = State.DB.get( report, 8102 )

  let documentTypeAttributes =  DB.get( reportType, 8106 ).filter( datomConstructor => datomConstructor.isEnabled ).map( datomConstructor => datomConstructor.attribute )
  
  

  return d([
    submitButton( " <---- Tilbake ", () => State.Actions.selectEntity( undefined )  ),
    br(),
    d([
      entityLabelWithPopup( State, 7865 ),
      span( " / " ),
      entityLabelWithPopup( State, 7976 ),
      span( " / " ),
      entityLabelWithPopup( State, report ),
    ]),
    br(),
    entityAttributeView(State, report, 8102 ),
    entityAttributeView(State, report, 6 ),
    br(),
    d( documentTypeAttributes.map( attribute => companyDatomView( State, report, attribute ) ) ),
  ])

}

// Company entity view END -------------------------------------------------------------


// ADMIN PAGE VIEWS

let adminPage = State => d([
  d([d('<header><h1>Holdingservice Admin</h1></header>'),d([submitButton("Bytt til klient", e => State.Actions.toggleAdmin() )], {style: "display:flex;"} )], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
  d([
    adminEntityLabelWithPopup( State,  47 ),
    span(" / "  ),
    isDefined(State.S.selectedEntity)
      ? adminEntityLabelWithPopup( State, State.DB.get(State.S.selectedEntity, "entity/entityType")   )
      : span(" ... "),
    span(" / "  ),
    isDefined(State.S.selectedEntity)
      ? adminEntityLabelWithPopup( State,  State.S.selectedEntity )
      : span("Ingen entitet valgt.")
  ], {style: "padding: 1em;"}),
  d([
    d(""),
   State.DB.get( State.S.selectedEntity, "entity/entityType" ) === 47
      ? d([
        multipleEntitiesView( State, State.S.selectedEntity ),
        br(),
        entityView( State, State.S.selectedEntity )
      ]) 
      : entityView( State, State.S.selectedEntity )
  ], {class: "pageContainer"})

])

let multipleEntitiesView = (State, entityType) => d([
  adminEntityLabelWithPopup( State, entityType),
  d(State.DB.getAll( entityType   ).map( entity =>State.DB.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).map( category => d([
    h3(category),
    d(State.DB.getAll(entityType).filter( e => State.DB.get(e, "entity/category") === category ).map( entity => adminEntityLabelWithPopup( State, entity ) ) ),
  ])  ) )
],{class: "feedContainer"})


//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------

