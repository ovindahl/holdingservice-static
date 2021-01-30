//Action button

//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------

let exportTransactionsGraph = DB => getAllTransactions( DB, 6829 ).map( e => `"${DB.get( DB.get(e, 7867), 6)}" -> "${DB.get( DB.get(e, 7866), 6)}";`   ).join(`
	`)



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
          submitButton("[>>]", () => State.Actions.selectCompanyEventIndex( State.Company.get( companyTransactions.slice( - 1 )[0], 8354  )  ) )
        ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
      d([
        entityLabelWithPopup( State, 7928),
        isDefined( State.S.selectedEntity ) ? entityLabelWithPopup( State, State.S.selectedEntity ) : d(" - "),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
      br(),
      submitButton("Oppdatter kalkulerte verdier", () => State.Actions.updateCompany( State.S.selectedCompany ) ),
      br(),
      submitButton("Slett alle transactioner", () => State.Actions.retractEntities( getAllTransactions(State.DB, State.S.selectedCompany ) ) )
    ])
  ], {class: "feedContainer"})
} 

//Page views



let accountingYearsView = State => isDefined( State.S.selectedEntity ) ? singleAccountingYearView( State ) : allAccountingYearsView( State )


let singleAccountingYearView = State => State.DB.get(State.S.selectedEntity, 19) === 8760
  ? accountingYearStepView( State )
  : accountingYearOverviewView( State )
  
  
  

let accountingYearOverviewView = State => {

  let accountingYear = State.S.selectedEntity
  let accountingYearSteps = State.DB.getAll( 8760 )

  let accountingYearTransactions = getAllTransactions(State.DB, State.S.selectedCompany ).filter( transaction => State.DB.get(transaction, "transaction/accountingYear") === accountingYear )
  let lastEventIndex = State.Company.get( accountingYearTransactions.slice(-1)[0], 8354 ) 

  let reports = getAllReports(State.DB, State.S.selectedCompany )

  

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
    d([
      h3("1: Bokføring av bilag"),
      entityAttributeView( State, accountingYear, 8260 ),
    ]),
    br(),
    d([
      h3("2: Bankavstemming"),
      d( State.Company.getBalanceObjects( 8737 ).map(  bankAccount => d([
        entityLabelWithPopup( State, bankAccount ),
        companyValueView( State, bankAccount, 7433, lastEventIndex )
      ], {style: gridColumnsStyle("1fr 1fr")}) ) ),
      entityAttributeView( State, accountingYear, 8750 ),
    ]),
    br(),
    d([
      h3("3: Verdijustering"),
      d( State.Company.getBalanceObjects( 7537 ).map(  bankAccount => d([
        entityLabelWithPopup( State, bankAccount ),
        companyValueView( State, bankAccount, 7433, lastEventIndex )
      ], {style: gridColumnsStyle("1fr 1fr")}) ) ),
      entityAttributeView( State, accountingYear, 8751 ),
    ]),
    br(),
    d([
      h3("4: Skatt"),
      companyDatomView( State, State.S.selectedCompany,  8769, lastEventIndex ),
      companyDatomView( State, State.S.selectedCompany,  8770, lastEventIndex ),
      companyDatomView( State, State.S.selectedCompany,  8771, lastEventIndex ),
      companyDatomView( State, State.S.selectedCompany,  8772, lastEventIndex ),
      companyDatomView( State, State.S.selectedCompany,  8773, lastEventIndex ),
      companyDatomView( State, State.S.selectedCompany,  8774, lastEventIndex ),
      companyDatomView( State, State.S.selectedCompany,  8775, lastEventIndex ),
      br(),
      submitButton( "Bokfør skattekostnad", () => State.Actions.createTransaction( 
        accountingYear, 
        State.Company.getBalanceObjects( 5231 )[0], 
        State.Company.getBalanceObjects( 8746 )[0], 
        State.Company.get( State.S.selectedCompany, 8774 ), 
        State.DB.get(accountingYear, "accountingYear/lastDate" ), 
        "Årets skattekostnad" 
        )
      )
    ]),
    br(),
    d([
      h3("5: Resultatdisponering"),
      companyDatomView( State, State.S.selectedCompany,  8769, lastEventIndex ),
      companyDatomView( State, State.S.selectedCompany,  8774, lastEventIndex ),
      companyDatomView( State, State.S.selectedCompany,  8781, lastEventIndex ),
      br(),
      submitButton( "Bokfør resultatdisponering", () => State.Actions.createTransaction( 
        accountingYear, 
        State.Company.getBalanceObjects( 8741 )[0], 
        State.Company.getBalanceObjects( 8784 )[0], 
        State.Company.get( State.S.selectedCompany, 8781 ), 
        State.DB.get(accountingYear, "accountingYear/lastDate" ), 
        "Årets resultat" //TBD: Tømme PnL-kontoer
        )
      )
    ]),
    br(),
    d([
      h3("6: Oppgaver"),
      br(),
      submitButton( "Generer oppgaver", () => log("ABC") ),
      d( State.DB.getAll( 7976 )
        .filter( report => isUndefined( State.DB.get( report, 8793 ) )  )
        .map( report => d([
          entityLabelWithPopup( State, report ),
          d( State.DB.getAll( 7976 )
            .filter( rep => State.DB.get( rep, 8793 ) === report  )
            .map( rep => d([
              entityLabelWithPopup( State, rep ),
              entityLabelWithPopup( State, reports.find( r => State.DB.get(r, "companyDocument/documentType") === rep ) ),
             ], {style: gridColumnsStyle("1fr 1fr")})
            ), {style: "padding-left: 1em;"}),
            br()
        ]) )
      )
    ])
  ])
} 


let accountingYearStepView = State => {

  let accountingYear = State.S.selectedEntity
  let accountingYearType = State.DB.get( accountingYear, "accountingYear/accountingYearType" )
  let inputAttributes = State.DB.get( accountingYearType, 7942 )
  let calculatedFields = State.DB.get( accountingYearType, 6789 )

  let accountingYearTransactions = getAllTransactions(State.DB, State.S.selectedCompany ).filter( transaction => State.DB.get(transaction, "transaction/accountingYear") === accountingYear )
  let openingBalanceEventIndex = State.Company.get( accountingYearTransactions[0], 8354 ) - 1
  let lastEventIndex = State.Company.get( accountingYearTransactions.slice(-1)[0], 8354 ) 

  let isLocked = State.DB.get(accountingYear, 8260)
  let bankIsCorrect = State.DB.get(accountingYear, 8750)
  let noValueAdjustments = State.DB.get(accountingYear, 8751)


  let allBalanceObjects = getAllBalanceObjects( State.DB, State.S.selectedCompany )

  let accountingYearSteps = State.DB.getAll( 8760 )


  let selectedStep = State.S.selectedEntity
  let stepType = State.DB.get( selectedStep, 8762 )

  let stepAttributes = State.DB.get( stepType, 7942 )



  return d([
    d([
      d([
        entityLabelWithPopup( State, 7403 ),
        span( " / " ),
        entityLabelWithPopup( State, State.DB.get( State.S.selectedEntity, 8759 ) ),
        span( " / " ),
        entityLabelWithPopup( State, State.DB.get( State.S.selectedEntity, 8762 ) ),
      ], {style: "display: inline-flex;"}),
    ], {style: gridColumnsStyle("3fr 1fr")}),
    br(),
    br(),
    d( stepAttributes.map( attribute => entityAttributeView( State, accountingYear, attribute ) ) ),
    br(),

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
    d( [7537, 7539, 7538, 8788].map( balanceSection =>  d([
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
        companyValueView( State, State.S.selectedCompany, State.DB.get( balanceSection, 7748 ), State.S.selectedCompanyEventIndex )   
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
      br()
    ]),  ) ),
    
    
    
    br(),
    submitButton("Legg til", () => State.Actions.createBalanceObject() ),
    br(),
    ])
} 

//--- Transaction views

let allTransactionsView = State => {

  let alltransactions = getAllTransactions( State.DB, State.S.selectedCompany )

  return d([
    h3("Alle transaksjoner"),
    d([
      d( alltransactions.map( companyTransaction => d([
        entityLabelWithPopup(State, State.DB.get(companyTransaction, "transaction/accountingYear") ),
        transactionLabel( State, companyTransaction ),
        d( moment( State.DB.get( companyTransaction, 1757 ) ).format("DD.MM.YYYY") , {style: `text-align: right;`}),
        companyValueView( State, companyTransaction, 8748 ),
        d([
          isDefined( State.DB.get(companyTransaction, 7867) ) ? entityLabelWithPopup(State, State.DB.get(companyTransaction, 7867) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}),
          d(" --> "),
          isDefined( State.DB.get(companyTransaction, 7866) ) ? entityLabelWithPopup(State, State.DB.get(companyTransaction, 7866) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}) ,
        ], {style: gridColumnsStyle("3fr 1fr 3fr") + "padding-left: 3em;"} ),
        State.Company.get(companyTransaction, 8355) 
        ? d("🔒")
        : submitButton("❌", e => State.Actions.retractEntity(companyTransaction) )
      ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 3fr 1fr")})  ) ),
    ]),
    br(),
    submitButton("Legg til", () => State.Actions.createBlankTransaction() ),
    br(),
    d([
      d("Importer fra:"),
      entityLabelWithPopup( State, 7313),
      input({type: "file", style: `text-align: right;`}, "change", e => Papa.parse(e.srcElement.files[0], {header: false, complete: async results => {

        let transactionRows = results.data.filter( row => row.length > 1 ).slice(5, results.data.length-1)
        let selectedBankAccount = State.Company.getBalanceObjects( 8737 )[0]
        let datoms = transactionRows.map( (transactionRow, index) => constructTransactionRowDatoms(State, transactionRow, index, selectedBankAccount)  ).flat()         

        State.Actions.importBankDatoms(datoms)

        } }) ),
    ]),
  ])
} 

let transactionsView = State => isDefined( State.S.selectedEntity ) 
  ? State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) === 8019 
    ? manualTransactionView( State ) 
    : importedTransactionView( State ) 
  : allTransactionsView( State )

let prevNextTransactionView = State => {

  let companyTransaction = State.S.selectedEntity
  let selectedIndex = State.Company.get( State.S.selectedEntity, 8354 )
  let prevTransactionDatom = State.companyDatoms.find( Datom => Datom.attribute === 8354 && Datom.value === selectedIndex - 1 )
  let prevTransaction = isDefined( prevTransactionDatom ) ? prevTransactionDatom.entity : undefined
  let nextTransactionDatom = State.companyDatoms.find( Datom => Datom.attribute === 8354 && Datom.value === selectedIndex + 1 )
  let nextTransaction = isDefined( nextTransactionDatom ) ? nextTransactionDatom.entity : undefined

  return d([
    submitButton( " <---- Tilbake ", () => State.Actions.selectEntity( undefined )  ),
    br(),
    d([
      d([
        entityLabelWithPopup( State, 7882 ),
        span( " / " ),
        entityLabelWithPopup( State, State.DB.get( companyTransaction, "transaction/transactionType" ) ),
        span( " / " ),
        transactionLabel( State, companyTransaction ),
      ], {style: "display: inline-flex;"}),
      d([
        isDefined( prevTransaction ) ? submitButton("<", () => State.Actions.selectEntity( prevTransaction ) ) : d(""),
        isDefined( nextTransaction ) ? submitButton(">", () => State.Actions.selectEntity( nextTransaction ) ) : d(""),
      ], {style: gridColumnsStyle("3fr 1fr")})
    ], {style: gridColumnsStyle("3fr 1fr")}),
  ])
}

let transactionFlowView = (State, companyTransaction) => d([
  d([
    entityLabelWithPopup(State, 7867 ),
    d([ isDefined( State.DB.get(companyTransaction, 7867) ) ? entityLabelWithPopup(State, State.DB.get(companyTransaction, 7867) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}) ]),
  ]),
  d([
    d(""),
    d([
      d( moment( State.Company.get( companyTransaction, 1757, State.S.selectedCompanyEventIndex ) ).format("DD.MM.YYYY") ),
      transactionLabel( State, companyTransaction ),
      companyValueView( State, companyTransaction, 8748 ),
      d(" --------------> "),
    ]),
    d(""),
  ], {style: gridColumnsStyle("3fr 2fr 3fr")}),
  d([
    entityLabelWithPopup(State, 7866 ),
    d([ isDefined( State.DB.get(companyTransaction, 7866) ) ? entityLabelWithPopup(State, State.DB.get(companyTransaction, 7866) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}), ]) ,
  ])
], {class: "feedContainer", style: gridColumnsStyle("2fr 3fr 2fr")})

let manualTransactionView = State => {

  let companyTransaction = State.S.selectedEntity

  let originNode = State.DB.get( companyTransaction, "transaction/originNode" )
  let destinationNode = State.DB.get( companyTransaction, "transaction/destinationNode" )

  let requiredAttributes = [1757, 1139]

  let requiredMeasures = [
    State.DB.get( State.DB.get( originNode, "balanceObject/balanceObjectType" ), "balanceObjectType/requiredMeasures" ),
    State.DB.get( State.DB.get( destinationNode, "balanceObject/balanceObjectType" ), "balanceObjectType/requiredMeasures" ),
  ].flat().filter( a => isNumber(a) ).filter( filterUniqueValues )


  return d([
    prevNextTransactionView( State ),
    br(),
    transactionFlowView( State, State.S.selectedEntity ),
    br(),
    d( requiredAttributes.map( attribute => entityAttributeView( State, companyTransaction, attribute ) ) ),
    br(),
    d( requiredMeasures.map( attribute => entityAttributeView( State, companyTransaction, attribute ) ) ),
    br(),
    State.Company.get(companyTransaction, 8355) 
      ? d("🔒")
      : d([
        submitButton("Slett", e => State.Actions.retractEntity(companyTransaction) ),
      ])
  ])
} 

// Outgoing transactions

let transactionDataSourceView = State => d([
  h3("Datakilde"),
  isDefined( State.DB.get(State.S.selectedEntity, "transaction/parentTransaction") )
    ? d([
      d("Splittet ut fra importert transaksjon"),
      companyDatomView( State, State.S.selectedEntity,  9011 ),
      entityAttributeView( State, State.S.selectedEntity, 1083 )
    ])
    : d([
      companyDatomView( State, State.S.selectedEntity,  9104 ),
      companyDatomView( State, State.S.selectedEntity,  9084 ),
      companyDatomView( State, State.S.selectedEntity,  8832 ),
      companyDatomView( State, State.S.selectedEntity, 8830 ),
      companyDatomView( State, State.S.selectedEntity,  8831 ),
      companyDatomView( State, State.S.selectedEntity,  1080 ),
      State.Company.get( State.S.selectedEntity, 9030 ).length > 0
        ? d([
          companyDatomView( State, State.S.selectedEntity,  9030 ),
          companyDatomView( State, State.S.selectedEntity,  8748 ),
        ]) 
        : d("")
    ])
  
], {class: "feedContainer"})



let importedTransactionView = State => d([
  prevNextTransactionView( State ),
  br(),
  transactionFlowView( State, State.S.selectedEntity ),
  br(),
  transactionDataSourceView( State ),
  br(),
  d([
    h3("Kategorisering"),
    companyDatomView( State, State.S.selectedEntity,  7935),
  br(),
  d( State.DB.get( State.DB.get( State.S.selectedEntity, "transaction/transactionType" ), 7942 ).map( inputAttribute => entityAttributeView( State, State.S.selectedEntity , inputAttribute ) ) ),
  State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) === 8829 
    ? categorizePaymentView( State )
    : State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) === 8850 
      ? categorizeReceiptView( State )
      : State.DB.get( State.S.selectedEntity, "transaction/paymentType") === 9086
        ? submitButton("Tilbakestill kategori", e => State.Actions.postDatoms([
          newDatom( State.S.selectedEntity, "transaction/transactionType", 8829 ),
          newDatom( State.S.selectedEntity, "transaction/destinationNode", State.DB.get(State.S.selectedEntity, "transaction/destinationNode") , false ),
        ]))
        : submitButton("Tilbakestill kategori", e => State.Actions.postDatoms([
          newDatom( State.S.selectedEntity, "transaction/transactionType", 8850 ),
          newDatom( State.S.selectedEntity, "transaction/originNode", State.DB.get(State.S.selectedEntity, "transaction/originNode") , false ),
      ]))
      
      
  ], {class: "feedContainer"}),
  br(),
  submitButton("Slett", e => State.Actions.retractEntity( State.S.selectedEntity ) ),  
])

let categorizePaymentView = State => d([
  d([
    d([d(`Kostnad`, {class: "entityLabel", style: "background-color:#7b7b7b70;"})], {style:"display: inline-flex;"}),
    d( State.Company.getBalanceObjects( 8743 ).map(  selectedCostNode => entityLabelWithPopup( State, selectedCostNode, () => State.Actions.postDatoms([
      newDatom( State.S.selectedEntity, "transaction/transactionType", 8954 ),
      newDatom( State.S.selectedEntity, "transaction/destinationNode", selectedCostNode ),
    ]) ) ) ),
  ], {style: gridColumnsStyle("1fr 3fr")}),
  d([
    d([d(`Kjøp av verdipapir`, {class: "entityLabel", style: "background-color:#7b7b7b70;"})], {style:"display: inline-flex;"}),
    d([
      d( State.Company.getBalanceObjects( 8738 ).map(  security => entityLabelWithPopup( State, security, () => State.Actions.postDatoms([
        newDatom( State.S.selectedEntity, "transaction/transactionType", 8908 ),
        newDatom( State.S.selectedEntity, "transaction/destinationNode", security ),
        newDatom( State.S.selectedEntity, 7450, 0 ),
      ]) ) ) ),
      span(`Legg til verdipapir`, "", {class: "entityLabel", style: "background-color:#03a9f43b;"}, "click", () => State.Actions.createBalanceObject( 8738 ) ),
    ], {style:"display: inline-flex;"})
  ], {style: gridColumnsStyle("1fr 3fr")}),
  d([
    d([d(`Overføring`, {class: "entityLabel", style: "background-color:#7b7b7b70;"})], {style:"display: inline-flex;"}),
    d([
      d( State.Company.getBalanceObjects( [8742, 8739, 8737] ).map(  selectedDebtNode => entityLabelWithPopup( State, selectedDebtNode, () => State.Actions.postDatoms([
        newDatom( State.S.selectedEntity, "transaction/transactionType", 8955 ),
        newDatom( State.S.selectedEntity, "transaction/destinationNode", selectedDebtNode ),
      ]) ) ) ),
      d(`Legg til gjeld`, {class: "entityLabel", style: "background-color:#03a9f43b;"}, "click", () => State.Actions.createBalanceObject( 8742 ) ),
      d(`Legg til fordring`, {class: "entityLabel", style: "background-color:#03a9f43b;"}, "click", () => State.Actions.createBalanceObject( 8739 ) ),
      d(`Legg til bankkonto`, {class: "entityLabel", style: "background-color:#03a9f43b;"}, "click", () => State.Actions.createBalanceObject( 8737 ) ),
    ], {style:"display: inline-flex;"})
  ], {style: gridColumnsStyle("1fr 3fr")}),
  d([
    d([d(`Utbytte`, {class: "entityLabel", style: "background-color:#7b7b7b70;"})], {style:"display: inline-flex;"}),
    d([
      d( State.Company.getBalanceObjects( 7857 ).map(  selectedDebtNode => entityLabelWithPopup( State, selectedDebtNode, () => State.Actions.postDatoms([
        newDatom( State.S.selectedEntity, "transaction/transactionType", 8955 ),
        newDatom( State.S.selectedEntity, "transaction/destinationNode", selectedDebtNode ),
      ]) ) ) ),
      d(`Legg til utbytte`, {class: "entityLabel", style: "background-color:#03a9f43b;"}, "click", () => State.Actions.createBalanceObject( 7857 ) ),
    ], {style:"display: inline-flex;"})
  ], {style: gridColumnsStyle("1fr 3fr")}),
  d([d(`Splitt transaksjon`, {class: "entityLabel", style: "background-color:#7b7b7b70;"}, "click", () => State.Actions.postDatoms([
    newDatom( "newTransaction", "entity/entityType", State.DB.get( State.S.selectedEntity , "entity/entityType") ),
    newDatom( "newTransaction", "entity/company", State.DB.get( State.S.selectedEntity , "entity/company") ),
    newDatom( "newTransaction", "event/date", State.DB.get( State.S.selectedEntity , "event/date") ),
    newDatom( "newTransaction", "transaction/accountingYear", State.DB.get( State.S.selectedEntity , "transaction/accountingYear") ),
    newDatom( "newTransaction", "transaction/transactionType", State.DB.get( State.S.selectedEntity , "transaction/transactionType") ),
    newDatom( "newTransaction", "transaction/originNode", State.DB.get( State.S.selectedEntity , "transaction/originNode") ),
    newDatom( "newTransaction", "transaction/parentTransaction", State.S.selectedEntity ),
    newDatom( "newTransaction", 1083, 0 ),
  ]) )], {style:"display: inline-flex;"})
])

let  categorizeReceiptView = State => d([
  d([
    d([d(`Inntekt`, {class: "entityLabel", style: "background-color:#7b7b7b70;"})], {style:"display: inline-flex;"}),
    d( State.Company.getBalanceObjects( 8745 ).map(  selectedCostNode => entityLabelWithPopup( State, selectedCostNode, () => State.Actions.postDatoms([
      newDatom( State.S.selectedEntity, "transaction/transactionType", 8974 ),
      newDatom( State.S.selectedEntity, "transaction/originNode", selectedCostNode ),
    ]) ) ) ),
  ], {style: gridColumnsStyle("1fr 3fr")}),
  d([
    d([d(`Salg av verdipapir`, {class: "entityLabel", style: "background-color:#7b7b7b70;"})], {style:"display: inline-flex;"}),
    d([
      d( State.Company.getBalanceObjects( 8738 ).map(  security => entityLabelWithPopup( State, security, async () => {

        await State.Actions.postDatoms([
          newDatom( State.S.selectedEntity, "transaction/transactionType", 8976 ),
          newDatom( State.S.selectedEntity, "transaction/originNode", security ),
          newDatom( State.S.selectedEntity, 7450, 0 ),
        ])

        State.Actions.postDatoms([
          newDatom( "newTransaction", "entity/entityType", State.DB.get( State.S.selectedEntity , "entity/entityType") ),
          newDatom( "newTransaction", "entity/company", State.DB.get( State.S.selectedEntity , "entity/company") ),
          newDatom( "newTransaction", "event/date", State.DB.get( State.S.selectedEntity , "event/date") ),
          newDatom( "newTransaction", "transaction/accountingYear", State.DB.get( State.S.selectedEntity , "transaction/accountingYear") ),
          newDatom( "newTransaction", "transaction/transactionType", 9035 ),
          newDatom( "newTransaction", "transaction/destinationNode", security ),
          newDatom( "newTransaction", "transaction/originNode", State.Company.getBalanceObjects( 8744 )[0] ),
          newDatom( "newTransaction", "transaction/sourceTransactionForProfitCalculation", State.S.selectedEntity ),
        ])


      }  ) ) ),
      span(`Legg til verdipapir`, "", {class: "entityLabel", style: "background-color:#03a9f43b;"}, "click", () => State.Actions.createBalanceObject( 8738 ) ),
    ], {style:"display: inline-flex;"})
  ], {style: gridColumnsStyle("1fr 3fr")}),
  d([
    d([d(`Overføring`, {class: "entityLabel", style: "background-color:#7b7b7b70;"})], {style:"display: inline-flex;"}),
    d([
      d( State.Company.getBalanceObjects( [8742, 8739, 8737] ).map(  selectedDebtNode => entityLabelWithPopup( State, selectedDebtNode, () => State.Actions.postDatoms([
        newDatom( State.S.selectedEntity, "transaction/transactionType", 8975 ),
        newDatom( State.S.selectedEntity, "transaction/originNode", selectedDebtNode ),
      ]) ) ) ),
      d(`Legg til gjeld`, {class: "entityLabel", style: "background-color:#03a9f43b;"}, "click", () => State.Actions.createBalanceObject( 8742 ) ),
      d(`Legg til fordring`, {class: "entityLabel", style: "background-color:#03a9f43b;"}, "click", () => State.Actions.createBalanceObject( 8739 ) ),
      d(`Legg til bankkonto`, {class: "entityLabel", style: "background-color:#03a9f43b;"}, "click", () => State.Actions.createBalanceObject( 8737 ) ),
    ], {style:"display: inline-flex;"})
  ], {style: gridColumnsStyle("1fr 3fr")}),
  d([d(`Splitt transaksjon`, {class: "entityLabel", style: "background-color:#7b7b7b70;"}, "click", () => State.Actions.postDatoms([
    newDatom( "newTransaction", "entity/entityType", State.DB.get( State.S.selectedEntity , "entity/entityType") ),
    newDatom( "newTransaction", "entity/company", State.DB.get( State.S.selectedEntity , "entity/company") ),
    newDatom( "newTransaction", "event/date", State.DB.get( State.S.selectedEntity , "event/date") ),
    newDatom( "newTransaction", "transaction/accountingYear", State.DB.get( State.S.selectedEntity , "transaction/accountingYear") ),
    newDatom( "newTransaction", "transaction/transactionType", State.DB.get( State.S.selectedEntity , "transaction/transactionType") ),
    newDatom( "newTransaction", "transaction/destinationNode", State.DB.get( State.S.selectedEntity , "transaction/destinationNode") ),
    newDatom( "newTransaction", "transaction/parentTransaction", State.S.selectedEntity ),
    newDatom( "newTransaction", 1083, 0 ),
  ]) )], {style:"display: inline-flex;"})
])




let transactionLabel = (State, companyTransaction) => d([d(`Transaksjon ${ State.Company.get(companyTransaction, 8354) }`, {class: "entityLabel", style: "background-color:#00bcd466;"}, "click", () => State.Actions.selectEntity(companyTransaction) )], {style:"display: inline-flex;"}) 

let parseDNBamount = stringAmount => Number( stringAmount.replaceAll(".", "").replaceAll(",", ".") ) 

let constructTransactionRowDatoms = ( State, transactionRow, index, selectedBankAccount) => {

  let date = Number( moment( transactionRow[0], "DD.MM.YYYY" ).format("x") )
  let description = `${transactionRow[2]}: ${transactionRow[1]}`

  let paidAmount = transactionRow[5] === ""
    ? undefined
    : parseDNBamount( transactionRow[5] ) * -1

  let receivedAmount = transactionRow[6] === ""
  ? undefined
  :parseDNBamount( transactionRow[6] ) 

  let isPayment = isNumber( paidAmount )

  let referenceNumber = transactionRow[7]

  let accountingYear = getAllAccountingYears( State.DB, State.S.selectedCompany ).slice(-1)[0]

  let transactionDatoms = [
    newDatom( "newDatom_"+ index, "entity/entityType", 7948  ),
    newDatom( "newDatom_"+ index, "entity/company", State.S.selectedCompany  ),
    newDatom( "newDatom_"+ index, 'transaction/accountingYear', accountingYear ), 
    newDatom( "newDatom_"+ index, "transaction/transactionType", isPayment ? 8829 : 8850 ),
    newDatom( "newDatom_"+ index, "transaction/paymentType", isPayment ? 9086 : 9087 ),
    newDatom( "newDatom_"+ index, 8832, date  ),
    newDatom( "newDatom_"+ index, "event/date", date  ), //Denne burde heller være kalkulert verdi?
    newDatom( "newDatom_"+ index, isPayment ? "transaction/originNode" : "transaction/destinationNode", selectedBankAccount),
    newDatom( "newDatom_"+ index, 8830, isPayment ? paidAmount : receivedAmount  ),
    newDatom( "newDatom_"+ index, 8831, description  ),
    newDatom( "newDatom_"+ index, "bankTransaction/referenceNumber", referenceNumber  ),
    newDatom( "newDatom_"+ index, "entity/sourceDocument", "[TBD] Bankimport lastet opp " + moment( Date.now() ).format("DD/MM/YYYY HH:mm")  ),
    newDatom( "newDatom_"+ index, 1139, ""  ),
  ]

  return transactionDatoms

}

//----

let actorsView = State => isDefined( State.S.selectedEntity ) ? singleActorView( State ) : allActorsView( State )

let allActorsView = State => {
  let allActors = getAllActors( State.DB, State.S.selectedCompany )

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
        entityLabelWithPopup( State, actor ),
      ]),
      br(),
      entityAttributeView(State, actor, 8668),
      br(),
      d( State.DB.get( State.DB.get( actor, "actor/actorType"), 7942 ).map( attribute => entityAttributeView(State, actor, attribute ) ) ),
      submitButton("Slett", e => State.Actions.retractEntity(actor) ),  
    ])
  : d([
    entityAttributeView(State, actor, 7535),
    submitButton("Slett", e => State.Actions.retractEntity(actor) ),  
  ])
} 

let reportsView = State => isDefined( State.S.selectedEntity ) ? singleReportView( State ) : allReportsView( State )

let allReportsView = State => {

  let allReports =  getAllReports( State.DB, State.S.selectedCompany )

  return d([
    d([
      entityLabelWithPopup( State, 7408 ),
      entityLabelWithPopup( State, 7865 ),
    ], {style: gridColumnsStyle("1fr 1fr 1fr")}),
    d( allReports.map( report => d([
      entityLabelWithPopup(State, State.DB.get(report, 7408) ),
      entityLabelWithPopup( State, report ),
      //submitButton("X", e => State.Actions.retractEntity(report) )
    ], {style: gridColumnsStyle("1fr 1fr 1fr")}) )),
  br(),
  //submitButton("Legg til", () => State.Actions.createCompanyReport( 5669 ) ),
  br(),
  ]) 
} 

let singleReportView = State => {

  let report = State.S.selectedEntity

  let reportType = State.DB.get( report, 8102 )
  let inputAttributes =  State.DB.get( reportType, 8 )

  let generatedAttributes =  State.DB.get( reportType, 22 )

  let reportFields = DB.getAll( 8359 ).filter( reportField => DB.get(reportField, 8363) === reportType ).sort( (a,b) => a-b )
  
  

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
    d( inputAttributes.map( attribute => entityAttributeView(State, report, attribute ), ) ),
    br(),
    d( reportFields.map( attribute => companyDatomView( State, report, attribute ) ) ),
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
    d(State.DB.getAll(entityType).filter( e => State.DB.get(e, "entity/category") === category ).sort( (a,b) => a-b ).map( entity => adminEntityLabelWithPopup( State, entity ) ) ),
  ])  ) )
],{class: "feedContainer"})


//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------

