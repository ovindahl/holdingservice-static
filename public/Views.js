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
    "9338": graphView
  }
  
  return d([
    d([d('<header><h1>Holdingservice Beta</h1></header>'),d([
      d([dropdown(State.S.selectedCompany, State.DB.getAll( 5722 ).map( company => returnObject({value: company, label: State.DB.get(company, "entity/label")  })  ), e => State.Actions.selectCompany( Number( submitInputValue(e) ) ))]),
      submitButton("Bytt til admin", e => State.Actions.toggleAdmin() )
    ], {style: "display:flex;"} ),], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
    d([
      d(""),
      d([
        stateView( State ),
        d([
          d( [7860, 7509 , 7882, 7977, 7919].map( pageEntity => entityLabelWithPopup( State, Number(pageEntity), () => State.Actions.selectPage(pageEntity) ) ), {class: "feedContainer"} ),
          br(),
          d([pageRouter[ State.S.selectedPage ]( State ) ], {class: "feedContainer"} )
        ])
      ])
    ], {class: "pageContainer"})
    
  ])
}

let stateView = State => {

  let companyTransactions = getAllTransactions( State.DB, State.S.selectedCompany )

  let allAccountingYears = getAllAccountingYears( State.DB, State.S.selectedCompany )
  let currentAccontingYearIndex = allAccountingYears.findIndex( a => a === State.S.selectedAccountingYear )
  let prevAccountingYear = allAccountingYears[ currentAccontingYearIndex - 1 ]
  let nextAccountingYear = allAccountingYears[ currentAccontingYearIndex + 1 ]
  
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
      d([
        entityLabelWithPopup( State, 9279),
        entityLabelWithPopup( State, State.S.selectedAccountingYear ),
        d([
          isDefined(prevAccountingYear) ? submitButton("<", () => State.Actions.selectAccountingYear( prevAccountingYear ) ) : d(""),
          isDefined(nextAccountingYear) ? submitButton(">", () => State.Actions.selectAccountingYear( nextAccountingYear ) ) : d(""),
          submitButton("X", () => State.Actions.selectAccountingYear( undefined ) )
        ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
      br(),
      submitButton("Oppdatter kalkulerte verdier", () => State.Actions.updateCompany( State.S.selectedCompany ) ),
      br(),
      submitButton("Slett alle transaksjoner i siste regnskapsår", () => State.Actions.retractEntities( getAllTransactions(State.DB, State.S.selectedCompany, getAllAccountingYears(State.DB, State.S.selectedCompany).slice(-1)[0] )  ) )
    ])
  ], {class: "feedContainer"})
} 

//Page views



let accountingYearsView = State => isDefined(State.S.selectedAccountingYear)
  ? singleAccountingYearView( State )
  : allAccountingYearsView( State )


let singleAccountingYearView = State => State.DB.get(State.S.selectedEntity, 19) === 8752
  ? accountingYearStepView( State )
  : State.DB.get(State.S.selectedAccountingYear, "accountingYear/accountingYearType") === 8254
    ? accountingYearOverviewView( State )
    : openingBalannceOverviewView( State )
  
  
//var cy = {}

let graphView = State => {

  return d("", {id: "cy"})

}

let renderGraph = State => {

  let allTransactions = getAllTransactions( State.DB, State.S.selectedCompany ).filter( t => State.Company.get(t, 8354) <= State.S.selectedCompanyEventIndex  )

  let selectedTransaction = allTransactions.find( t => State.Company.get(t, 8354) === State.S.selectedCompanyEventIndex  )

  let nodes = getAllBalanceObjects( State.DB, State.S.selectedCompany ).map( e => returnObject({data: {
    id: String(e), 
    label: State.DB.get(e, 6),
    col: State.Company.get(e, 8768) === 7538
      ? 1
      : State.Company.get(e, 8768) === 7539
        ? 2
        : State.Company.get(e, 7934) === 8744 || State.Company.get(e, 7934) === 8745
          ? 3
          : State.Company.get(e, 7934) === 8737
            ? 4
            : State.Company.get(e, 8768) === 7537
              ? 5
              : 6,
      weight: 50 + State.Company.get(e, 7433, State.S.selectedCompanyEventIndex) / 1000000,
      color: State.Company.get(selectedTransaction, "transaction/originNode") === e 
        ? "red"
        : State.Company.get(selectedTransaction, "transaction/destinationNode") === e 
          ? "green"
          : "black"
  } }  ) )
  let edges = allTransactions
    .filter( t => isNumber( State.Company.get(t, "transaction/originNode") ) && isNumber( State.Company.get(t, "transaction/destinationNode") )   )
    .map( t => returnObject({data: {
      id: String(t), 
      source: String( State.Company.get(t, "transaction/originNode") ), 
      target: String( State.Company.get(t, "transaction/destinationNode") ),
      label: t === selectedTransaction ? formatNumber( State.Company.get(t, 8748), 0 ) : "",
      weight: 3 + State.Company.get(t, 8748) / 1000000
    }}) )

  log({nodes, edges})

  let elements = nodes.concat(edges)

  cytoscape({

    container: document.getElementById('cy'), // container to render in
    elements,
    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': 'data(color)',
          'label': 'data(label)',
          'width': 'data(weight)',
          'height': 'data(weight)',
        }
      },
  
      {
        selector: 'edge',
        style: {
          'width': 'data(weight)',
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'label': 'data(label)'
        }
      }
    ],
  
    layout: {
      name: 'grid',
      position: node => returnObject({
        col: node.data('col')
       })
    }
  
  });
} 

let allAccountingYearsView = State => d([
  h3("Alle regnskapsår"),
  d( getAllAccountingYears(State.DB, State.S.selectedCompany).map( accountingYear => d([
    entityLabelWithPopup( State, accountingYear, () => State.Actions.selectAccountingYear( accountingYear ) ),
    State.Company.get( accountingYear, "accountingYear/isLocked" ) ? d("🔒") : d("Åpent")
  ], {style: gridColumnsStyle("3fr 1fr 1fr")}) )),
br(),
getAllAccountingYears(State.DB, State.S.selectedCompany).every( accYear => State.Company.get( accYear, "accountingYear/isLocked" ) )
  ? submitButton("Legg til", () => State.Actions.postDatomsAndUpdateCompany([
        newDatom( "newEntity", "entity/entityType", 7403 ),
        newDatom( "newEntity", "entity/company", State.S.selectedCompany ),
        newDatom( "newEntity", "accountingYear/accountingYearType", 8254 ),
        newDatom( "newEntity", "accountingYear/firstDate", Number( moment( State.DB.get( getAllAccountingYears(State.DB, State.S.selectedCompany).slice(-1)[0], "accountingYear/firstDate" ) ).add(1, "y").format("x") )    ),
        newDatom( "newEntity", "accountingYear/lastDate", Number(  moment( State.DB.get( getAllAccountingYears(State.DB, State.S.selectedCompany).slice(-1)[0], "accountingYear/lastDate" ) ).add(1, "y").format("x") ) ),
        newDatom( "newEntity", 9629, getAllAccountingYears(State.DB, State.S.selectedCompany).slice(-1)[0] ),
        newDatom( "newEntity", "entity/label", moment( State.DB.get( getAllAccountingYears(State.DB, State.S.selectedCompany).slice(-1)[0], "accountingYear/firstDate" ) ).add(1, "y").format("YYYY") ),
      ]) )
  : d("")
]) 

let openingBalannceOverviewView = State => {


  let accountingYear = State.S.selectedAccountingYear
  let accountingYearTransactions = getAllTransactions(State.DB, State.S.selectedCompany, State.S.selectedAccountingYear )

  let lastTransaction = accountingYearTransactions.slice(-1)[0]
  let lastTransactionIndex = State.Company.get( lastTransaction, 8354 )


  return d([
    submitButton( " <---- Tilbake ", () => State.Actions.selectAccountingYear( undefined )  ),
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
      h3("Åpningsbalanse"),
      entityAttributeView( State, State.S.selectedAccountingYear, 8260 ),
    ], {class: "feedContainer"}),
    d([
      h3("Transaksjoner i åpningsbalansen"),
      d( accountingYearTransactions.map( t => transactionLabel( State, t ) ), {style: "display:flex;"}  ),
    ], {class: "feedContainer"}),
    br(),
    d([
      h3("Årets utgående balanse"),
      d("Status: " + State.Company.get( State.S.selectedAccountingYear, 8260 ) ? "Avsluttet" : "I arbeid, estimert" ),
      balanceSheetView( State, lastTransactionIndex )
    ], {class: "feedContainer"}),
  ])
} 

let getYearCloseDatoms = (State, accountingYear) => {

  let company = State.S.selectedCompany
  let accountingYearTransactions = getAllTransactions(State.DB, State.S.selectedCompany, State.S.selectedAccountingYear )
  let importedTransactions = accountingYearTransactions.filter( transaction => [8850, 8974, 8975, 8976, 8829, 8908, 8954, 8955, 9035].includes( State.Company.get(transaction, "transaction/transactionType") )  )
  let manualTransactions = accountingYearTransactions.filter( transaction => [8019].includes( State.Company.get(transaction, "transaction/transactionType") )  )
  let yearEndTransactions = accountingYearTransactions.filter( transaction => [9286, 9384].includes( State.Company.get(transaction, "transaction/transactionType") )  )

  let firstTransaction = accountingYearTransactions[0]
  let firstTransactionIndex = State.Company.get( firstTransaction, 8354 )
  let openingBalanceTransactionIndex = firstTransactionIndex - 1
  let lastTransaction = accountingYearTransactions.slice(-1)[0]
  let lastTransactionIndex = State.Company.get( lastTransaction, 8354 )

  let taxTransaction = accountingYearTransactions.find( transaction => State.Company.get(transaction, "transaction/transactionType") === 9286 )
  let taxTransactionIndex = State.Company.get(taxTransaction, 8354)
  let annualResultTransaction = accountingYearTransactions.find( t => State.DB.get( State.Company.get(t, "transaction/originNode"), "balanceObject/balanceObjectType" ) === 8784 || State.DB.get( State.Company.get(t, "transaction/destinationNode"), "balanceObject/balanceObjectType" ) === 8784 )
  let annualResultTransactionIndex = State.Company.get(annualResultTransaction, 8354)

  let taxDebtNode = State.Company.getBalanceObjects( 5231 )[0]
  let taxCostNode = State.Company.getBalanceObjects( 8746 )[0]
  let taxCostAmount = State.Company.get( State.S.selectedCompany, 8774, taxTransactionIndex )
  let lastDate = State.DB.get( accountingYear, "accountingYear/lastDate" )

  let taxDatoms = [
    newDatom( "newEntity_tax", "entity/entityType", 7948 ),
    newDatom( 'newEntity_tax' , 'entity/company', company ), 
    newDatom( 'newEntity_tax' , 'transaction/accountingYear', accountingYear ), 
    newDatom( 'newEntity_tax' , "transaction/transactionType", 9286 ), 
    newDatom( 'newEntity_tax' , "transaction/originNode", taxDebtNode ), 
    newDatom( 'newEntity_tax' , "transaction/destinationNode", taxCostNode ), 
    newDatom( 'newEntity_tax' , "eventAttribute/1083", taxCostAmount ), 
    newDatom( 'newEntity_tax' , "event/date", lastDate ), 
    newDatom( 'newEntity_tax' , "eventAttribute/1139", "Årets skattekostnad"  ),
  ]

  let resultDisposalNode = State.Company.getBalanceObjects( 9397 )[0]
  let annualResultNode = State.Company.getBalanceObjects( 8784 )[0]
  let retainedProfitsNode = State.Company.getBalanceObjects( 8741 )[0]

  let annualResultAmount = Math.abs( State.Company.get( State.S.selectedCompany , 8781, taxTransactionIndex ) ) + taxCostAmount

  let annualResultDatoms = [
    newDatom( "newTransaction_EK", "entity/entityType", 7948 ),
    newDatom( "newTransaction_EK", "entity/company", company ),
    newDatom( "newTransaction_EK", "event/date", lastDate ),
    newDatom( "newTransaction_EK", "transaction/accountingYear", accountingYear ),
    newDatom( "newTransaction_EK", "transaction/transactionType", 9384 ),
    newDatom( "newTransaction_EK", "transaction/originNode", resultDisposalNode ),
    newDatom( "newTransaction_EK", "transaction/destinationNode", annualResultNode ),
    newDatom( "newTransaction_EK", 1083, annualResultAmount ),
    newDatom( "newTransaction_EK", 1139, "Bokføring av resultatdisponering" ),
    newDatom( "newTransaction_resultat", "entity/entityType", 7948 ),
    newDatom( "newTransaction_resultat", "entity/company", company ),
    newDatom( "newTransaction_resultat", "event/date", lastDate ),
    newDatom( "newTransaction_resultat", "transaction/accountingYear", accountingYear ),
    newDatom( "newTransaction_resultat", "transaction/transactionType", 9384 ),
    newDatom( "newTransaction_resultat", "transaction/originNode", retainedProfitsNode ),
    newDatom( "newTransaction_resultat", "transaction/destinationNode", resultDisposalNode ),
    newDatom( "newTransaction_resultat", 1083, annualResultAmount  ),
    newDatom( "newTransaction_resultat", 1139, "Bokføring av resultatdisponering" ),
  ]
    
    
  let resetPnLAccountsDatoms = State.Company.getBalanceObjects( 8788 )
    .filter( PnLnode => State.Company.get(PnLnode, 7433) !== 0 )
    .map( (PnLnode, index) => [
      newDatom( "newTransaction_"+index, "entity/entityType", 7948 ),
      newDatom( "newTransaction_"+index, "entity/company", company ),
      newDatom( "newTransaction_"+index, "event/date", lastDate ),
      newDatom( "newTransaction_"+index, "transaction/accountingYear", accountingYear ),
      newDatom( "newTransaction_"+index, "transaction/transactionType", 9384 ),
      newDatom( "newTransaction_"+index, "transaction/originNode", State.Company.get(PnLnode, 7433, taxTransactionIndex) >= 0 ? PnLnode : State.Company.getBalanceObjects( 8784 )[0] ),
      newDatom( "newTransaction_"+index, "transaction/destinationNode", State.Company.get(PnLnode, 7433, taxTransactionIndex) < 0 ? PnLnode : State.Company.getBalanceObjects( 8784 )[0] ),
      newDatom( "newTransaction_"+index, 1083, Math.abs( State.Company.get(PnLnode, 7433, taxTransactionIndex) )  ),
      newDatom( "newTransaction_"+index, 1139, "Bokføring av årsresultat" ),
  ] ).flat()


  let lockYearDatom = newDatom(accountingYear, 8260, true)

  return [
    taxDatoms,
    annualResultDatoms,
    resetPnLAccountsDatoms,
    lockYearDatom
  ].flat()

}


let accountingYearOverviewView = State => {


  let accountingYear = State.S.selectedAccountingYear
  let accountingYearTransactions = getAllTransactions(State.DB, State.S.selectedCompany, State.S.selectedAccountingYear )
  let importedTransactions = accountingYearTransactions.filter( transaction => [8850, 8974, 8975, 8976, 8829, 8908, 8954, 8955, 9035].includes( State.Company.get(transaction, "transaction/transactionType") )  )
  let manualTransactions = accountingYearTransactions.filter( transaction => [8019].includes( State.Company.get(transaction, "transaction/transactionType") )  )
  let yearEndTransactions = accountingYearTransactions.filter( transaction => [9286, 9384].includes( State.Company.get(transaction, "transaction/transactionType") )  )

  let openingBalanceTransaction = getAllTransactions(State.DB, State.S.selectedCompany, State.Company.get(State.S.selectedAccountingYear, 9629) ).slice(-1)[0]
  let openingBalanceTransactionIndex = State.Company.get( openingBalanceTransaction , 8354)

  let lastTransaction = accountingYearTransactions.slice(-1)[0]
  let lastTransactionIndex = State.Company.get( lastTransaction, 8354 )

  let taxTransaction = accountingYearTransactions.find( transaction => State.Company.get(transaction, "transaction/transactionType") === 9286 )
  let taxTransactionIndex = State.Company.get(taxTransaction, 8354)
  let annualResultTransaction = accountingYearTransactions.find( t => State.DB.get( State.Company.get(t, "transaction/originNode"), "balanceObject/balanceObjectType" ) === 8784 || State.DB.get( State.Company.get(t, "transaction/destinationNode"), "balanceObject/balanceObjectType" ) === 8784 )
  let annualResultTransactionIndex = State.Company.get(annualResultTransaction, 8354)



  let PnLViewIndex = isDefined(annualResultTransactionIndex) ? annualResultTransactionIndex : lastTransaction

  return d([
    submitButton( " <---- Tilbake ", () => State.Actions.selectAccountingYear( undefined )  ),
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
      h3("Status på året"),
      companyDatomView( State, State.S.selectedAccountingYear, 9629 ),
      d( [8754, 8755, 8756, 8757, 8758].map( step => d([
        entityLabelWithPopup( State, step ),
        tryFunction( () => new Function( [`Database`, `Company`, `accountingYear`], DB.get(step, 8662 )
        .filter( statement => statement["statement/isEnabled"] )
        .map( statement => statement["statement/statement"] )
        .join(";") 
        )( State.DB, State.Company, State.S.selectedAccountingYear ) ) === true ? d( "Ferdig" ) : d( "Ikke ferdig" )
      ], {style: gridColumnsStyle("1fr 1fr")})  ) ),
      entityAttributeView( State, State.S.selectedAccountingYear, 8260 ),
    ], {class: "feedContainer"}),
    d([
      h3("Input ifm årsavslutning"),
      entityAttributeView( State, State.S.selectedAccountingYear, 8750 ),
      entityAttributeView( State, State.S.selectedAccountingYear, 8751 ),
    ], {class: "feedContainer"}),
    br(),
    d([
      h3("Handlinger"),
      d([
        submitButton("Bokfør skattekostnad og årsresultat, og lås året", () => State.Actions.postDatomsAndUpdateCompany( getYearCloseDatoms( State, accountingYear ) )  ),
        d("Ikke tilgjengelig")
      ], {style: gridColumnsStyle("1fr 1fr")}),
      d([
        submitButton("Tilbakestill årsavslutning", () => State.Actions.postDatomsAndUpdateCompany( getEntitiesRetractionDatoms( State.DB, yearEndTransactions ).concat(newDatom(accountingYear, 8260, false))   )  ),
        d("Ikke tilgjengelig")
      ], {style: gridColumnsStyle("1fr 1fr")}),
      d([
        submitButton("Slett året med alle transaksjoner", () => State.Actions.postDatomsAndUpdateCompany( getEntitiesRetractionDatoms( State.DB, [accountingYearTransactions, accountingYear].flat() ) )  ),
        d("Ikke tilgjengelig")
      ], {style: gridColumnsStyle("1fr 1fr")}),
      d([
        submitButton("Generer oppgaver", () => State.Actions.postDatomsAndUpdateCompany(State.DB.getAll(7976).map( (reportType, index) => [
          newDatom("newEntity_"+index, "entity/entityType", 7865 ),
          newDatom("newEntity_"+index, 'entity/company', State.S.selectedCompany ), 
          newDatom("newEntity_"+index, 7408, State.S.selectedAccountingYear ), 
          newDatom("newEntity_"+index, "companyDocument/documentType", reportType ),
          newDatom("newEntity_"+index, "transaction/index", lastTransactionIndex  ),
          newDatom("newEntity_"+index, 6, State.DB.get(reportType, 6) + " generert " + moment( Date.now() ).format( "DD/MM/YYYY HH:mm" )  ),
        ]  ).flat() )),
        d("Ikke tilgjengelig")
      ], {style: gridColumnsStyle("1fr 1fr")}),
      d([
        submitButton("Slett oppgaver", () => State.Actions.retractEntities( getAllReports(State.DB, State.S.selectedCompany ).filter( report => State.DB.get(report, 7408) === accountingYear ) ) ),
        d("Ikke tilgjengelig")
      ], {style: gridColumnsStyle("1fr 1fr")}),


      
    ], {class: "feedContainer"}),
    d([
      h3("Årets åpningsbalanse"),
      d([
        d("Balansen slik den var etter:"),
        transactionLabel( State, openingBalanceTransaction)
      ], {style: gridColumnsStyle("1fr 1fr")}),
      br(),
      balanceSheetView( State, openingBalanceTransactionIndex )
    ], {class: "feedContainer"}),
    br(),
    d([
      h3("Årets transaksjoner"),
      d([
        d("Importerte transaksjoner:"),
        d( importedTransactions.map( t => transactionLabel( State, t ) ), {style: "display:flex;"}  ),
      ]),
      d([
        d("Manuelt registrerte transaksjoner:"),
        d( manualTransactions.map( t => transactionLabel( State, t ) ), {style: "display:flex;"}  ),
      ]),
      d([
        d("Årsavslutningstransaksjoner:"),
        d( yearEndTransactions.map( t => transactionLabel( State, t ) ), {style: "display:flex;"}  ),
      ]),
    ], {class: "feedContainer"}),
    br(),
    d([
      h3("Resultatregnskap"),
      d([
        d("Viser resultat per dato:"),
        companyValueView( State, accountingYearTransactions.slice(-1)[0],  1757 ),
      ]),
      d("Status: " + State.Company.get( State.S.selectedAccountingYear, 8260 ) ? "Avsluttet" : "I arbeid, estimert" ),
      br(),
      d( [8743].map( nodeType => State.Company.getBalanceObjects(nodeType) ).flat().map( balanceObject => d([
        companyValueView( State, balanceObject,  7934 ),
        companyValueView( State, balanceObject,  7433, PnLViewIndex ),
      ], {style: gridColumnsStyle("repeat(2, 1fr)")}) ) ),
      companyDatomView( State, State.S.selectedCompany,  9632, PnLViewIndex ),
      br(),
      d( [8744, 8745].map( nodeType => State.Company.getBalanceObjects(nodeType) ).flat().map( balanceObject => d([
        companyValueView( State, balanceObject,  7934 ),
        companyValueView( State, balanceObject,  7433, PnLViewIndex ),
      ], {style: gridColumnsStyle("repeat(2, 1fr)")}) ) ),
      companyDatomView( State, State.S.selectedCompany,  9633, PnLViewIndex ),
      br(),
      companyDatomView( State, State.S.selectedCompany,  8769, PnLViewIndex ),
      companyDatomView( State, State.S.selectedCompany,  9634, annualResultTransactionIndex ),
      br(),
      isDefined( annualResultTransaction ) ? companyDatomView( State, State.S.selectedCompany,  9642, annualResultTransactionIndex) : companyDatomView( State, State.S.selectedCompany,  8781, annualResultTransactionIndex ),
    ], {class: "feedContainer"}),
    d([
      h3("Årets utgående balanse"),
      d("Status: " + State.Company.get( State.S.selectedAccountingYear, 8260 ) ? "Avsluttet" : "I arbeid, estimert" ),
      balanceSheetView( State, lastTransactionIndex )
    ], {class: "feedContainer"}),
    d([
      h3("Årets oppgaver"),
      d( State.DB.getAll( 7976 )
        .filter( report => isUndefined( State.DB.get( report, 8793 ) )  )
        .map( report => d([
          d([
            entityLabelWithPopup( State, report ),
            entityLabelWithPopup( State, getAllReports(State.DB, State.S.selectedCompany ).find( r => State.DB.get(r, "companyDocument/documentType") === report ) ),
          ], {style: gridColumnsStyle("1fr 1fr")}),
          d( State.DB.getAll( 7976 )
            .filter( rep => State.DB.get( rep, 8793 ) === report  )
            .map( rep => d([
              entityLabelWithPopup( State, rep ),
              entityLabelWithPopup( State, getAllReports(State.DB, State.S.selectedCompany ).find( r => State.DB.get(r, "companyDocument/documentType") === rep ) ),
            ], {style: gridColumnsStyle("1fr 1fr")})
            ), {style: "padding-left: 1em;"}),
            br()
        ]) )
      )
    ], {class: "feedContainer"}),
  ])
} 


let accountingYearStepView = State => {

  let stepController = {
    "8754": accountingYearStep_bank,
    "8755": accountingYearStep_valueAdjustement,
    "8756": accountingYearStep_tax,
    "8757": accountingYearStep_annualResult,
    "8758": accountingYearStep_forms,
  }

  let lastEventIndex = State.Company.get( getAllTransactions(State.DB, State.S.selectedCompany, State.S.selectedAccountingYear ).slice(-1)[0], 8354 )
  let steps = [8754, 8755, 8756, 8757, 8758]

  let isComplete = tryFunction( () => new Function( [`Database`, `Company`, `accountingYear`], DB.get(State.S.selectedEntity, 8662 )
  .filter( statement => statement["statement/isEnabled"] )
  .map( statement => statement["statement/statement"] )
  .join(";") 
  )( State.DB, State.Company, State.S.selectedAccountingYear ) )
  
  return d([
    d([
      d([
        entityLabelWithPopup( State, 7403 ),
        span( " / " ),
        entityLabelWithPopup( State, State.S.selectedAccountingYear ),
      ], {style: "display: inline-flex;"}),
    ], {style: gridColumnsStyle("3fr 1fr")}),
    br(),
    d( steps.map( step => entityLabelWithPopup( State, step )  ), {style: "display: inline-flex;"} ),
    br(),
    stepController[ State.S.selectedEntity ]( State, lastEventIndex ),
    br(),
    d([
      d("Status"),
      isComplete === true ? d( "Ferdig" ) : d( "Ikke ferdig" ),
    ], {style: gridColumnsStyle("1fr 1fr")})
])

} 

let accountingYearStep_bank = ( State, lastEventIndex ) => d([
  d("Sjekk at beregnet saldo stemmer med faktisk beløp på bankkonto"),
  br(),
  d( State.Company.getBalanceObjects( 8737 ).map(  bankAccount => d([
    entityLabelWithPopup( State, bankAccount ),
    companyValueView( State, bankAccount, 7433, lastEventIndex )
  ], {style: gridColumnsStyle("1fr 1fr")}) ) ),
  entityAttributeView( State, State.S.selectedAccountingYear, 8260 ),
])

let accountingYearStep_valueAdjustement = ( State, lastEventIndex ) => d([
  d( State.Company.getBalanceObjects( 7537 ).map(  bankAccount => d([
    entityLabelWithPopup( State, bankAccount ),
    companyValueView( State, bankAccount, 7433, lastEventIndex )
  ], {style: gridColumnsStyle("1fr 1fr")}) ) ),
  entityAttributeView( State, State.S.selectedAccountingYear, 8751 ),
])

let accountingYearStep_tax = ( State, lastEventIndex ) => {

  let isComplete = tryFunction( () => new Function( [`Database`, `Company`, `accountingYear`], DB.get(State.S.selectedEntity, 8662 )
  .filter( statement => statement["statement/isEnabled"] )
  .map( statement => statement["statement/statement"] )
  .join(";") 
  )( State.DB, State.Company, State.S.selectedAccountingYear ) )


  let taxTransaction = getAllTransactions(State.DB, State.S.selectedCompany, State.S.selectedAccountingYear ).find( transaction => State.Company.get(transaction, "transaction/transactionType") === 9286 )

  let selectedEventIndex = isComplete ? State.Company.get(taxTransaction, 8354) : lastEventIndex 

  return d([
    h3("Beregnet resultat"),
    companyDatomView( State, State.S.selectedCompany,  8769, selectedEventIndex ),
    companyDatomView( State, State.S.selectedCompany,  8770, selectedEventIndex ),
    companyDatomView( State, State.S.selectedCompany,  8771, selectedEventIndex ),
    companyDatomView( State, State.S.selectedCompany,  8772, selectedEventIndex ),
    companyDatomView( State, State.S.selectedCompany,  8773, selectedEventIndex ),
    companyDatomView( State, State.S.selectedCompany,  8774, selectedEventIndex ),
    companyDatomView( State, State.S.selectedCompany,  8775, selectedEventIndex ),
    br(),
    isComplete
    ? d([
      h3("Bokført skattekostad:"),
      transactionRowView( State, taxTransaction ),
      submitButton( "Slett skattekostnad", () => State.Actions.retractEntities( getAllTransactions(State.DB, State.S.selectedCompany, State.S.selectedAccountingYear ).filter( transaction => State.DB.get(transaction, "transaction/transactionType") === 9286 ) )  )
    ]) 
    : submitButton( "Bokfør skattekostnad", () => State.Actions.createEntity( 7948, [
      newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
      newDatom( 'newEntity' , 'transaction/accountingYear', State.S.selectedAccountingYear ), 
      newDatom( 'newEntity' , "transaction/transactionType", 9286 ), 
      newDatom( 'newEntity' , "transaction/originNode", State.Company.getBalanceObjects( 5231 )[0] ), 
      newDatom( 'newEntity' , "transaction/destinationNode", State.Company.getBalanceObjects( 8746 )[0] ), 
      newDatom( 'newEntity' , "eventAttribute/1083", State.Company.get( State.S.selectedCompany, 8774 ) ), 
      newDatom( 'newEntity' , "event/date", State.DB.get(State.S.selectedAccountingYear, "accountingYear/lastDate" ) ), 
      newDatom( 'newEntity' , "eventAttribute/1139", "Årets skattekostnad"  ),
      newDatom( 'newEntity' , 7656, 0 ),
      newDatom( 'newEntity' , 1078, 0 ),
      newDatom( 'newEntity' , 1817, 0 ),
      newDatom( 'newEntity' , 1824, 0 ),
      newDatom( 'newEntity' , 7657, 0 ),
      newDatom( 'newEntity' , 1076, 0 ),
    ] ),
    ),
  ])
} 

let accountingYearStep_annualResult = ( State, lastEventIndex ) => {

  let isComplete = tryFunction( () => new Function( [`Database`, `Company`, `accountingYear`], DB.get(State.S.selectedEntity, 8662 )
  .filter( statement => statement["statement/isEnabled"] )
  .map( statement => statement["statement/statement"] )
  .join(";") 
  )( State.DB, State.Company, State.S.selectedAccountingYear ) )


  let taxTransaction = getAllTransactions(State.DB, State.S.selectedCompany, State.S.selectedAccountingYear ).find( transaction => State.Company.get(transaction, "transaction/transactionType") === 9286 )

  let annualResultTransactions = getAllTransactions(State.DB, State.S.selectedCompany, State.S.selectedAccountingYear ).filter( transaction => State.Company.get(transaction, "transaction/transactionType") === 9384 )

  let selectedEventIndex = State.Company.get(taxTransaction, 8354)


  return d([
    companyDatomView( State, State.S.selectedCompany,  8769, selectedEventIndex ),
    companyDatomView( State, State.S.selectedCompany,  8774, selectedEventIndex ),
    companyDatomView( State, State.S.selectedCompany,  8781, selectedEventIndex ),
    br(),
    isComplete
    ? d([
      h3("Bokført årsresultat:"),
      d( annualResultTransactions.map( companyTransaction => transactionRowView( State, companyTransaction )  ) ),
      submitButton( "Slett årsresultat", () => State.Actions.retractEntities( getAllTransactions(State.DB, State.S.selectedCompany, State.S.selectedAccountingYear )
      .filter( transaction => State.DB.get(transaction, "transaction/transactionType") === 9384 ) )  )
    ]) 
    : d([
      submitButton( "Bokfør årsresultat", () => State.Actions.postDatoms( [
      newDatom( "newTransaction_EK", "entity/entityType", 7948 ),
      newDatom( "newTransaction_EK", "entity/company", State.S.selectedCompany ),
      newDatom( "newTransaction_EK", "event/date", State.DB.get(State.S.selectedAccountingYear, "accountingYear/lastDate" ) ),
      newDatom( "newTransaction_EK", "transaction/accountingYear", State.S.selectedAccountingYear ),
      newDatom( "newTransaction_EK", "transaction/transactionType", 9384 ),
      newDatom( "newTransaction_EK", "transaction/originNode", State.Company.getBalanceObjects( 9397 )[0] ),
      newDatom( "newTransaction_EK", "transaction/destinationNode", State.Company.getBalanceObjects( 8784 )[0] ),
      newDatom( "newTransaction_EK", 1083, Math.abs( State.Company.get( State.S.selectedCompany , 8781, selectedEventIndex ) )  ),
      newDatom( "newTransaction_EK", 1139, "Bokføring av resultatdisponering" ),
      newDatom( "newTransaction_resultat", "entity/entityType", 7948 ),
      newDatom( "newTransaction_resultat", "entity/company", State.S.selectedCompany ),
      newDatom( "newTransaction_resultat", "event/date", State.DB.get(State.S.selectedAccountingYear, "accountingYear/lastDate" ) ),
      newDatom( "newTransaction_resultat", "transaction/accountingYear", State.S.selectedAccountingYear ),
      newDatom( "newTransaction_resultat", "transaction/transactionType", 9384 ),
      newDatom( "newTransaction_resultat", "transaction/originNode", State.Company.getBalanceObjects( 8741 )[0] ),
      newDatom( "newTransaction_resultat", "transaction/destinationNode", State.Company.getBalanceObjects( 9397 )[0] ),
      newDatom( "newTransaction_resultat", 1083, Math.abs( State.Company.get( State.S.selectedCompany , 8781, selectedEventIndex ) )  ),
      newDatom( "newTransaction_resultat", 1139, "Bokføring av resultatdisponering" ),
      ].concat(State.Company.getBalanceObjects( 8788 )
      .filter( PnLnode => State.Company.get(PnLnode, 7433) !== 0 )
      .map( (PnLnode, index) => [
        newDatom( "newTransaction_"+index, "entity/entityType", 7948 ),
        newDatom( "newTransaction_"+index, "entity/company", State.S.selectedCompany ),
        newDatom( "newTransaction_"+index, "event/date", State.DB.get(State.S.selectedAccountingYear, "accountingYear/lastDate" ) ),
        newDatom( "newTransaction_"+index, "transaction/accountingYear", State.S.selectedAccountingYear ),
        newDatom( "newTransaction_"+index, "transaction/transactionType", 9384 ),
        newDatom( "newTransaction_"+index, "transaction/originNode", State.Company.get(PnLnode, 7433) >= 0 ? PnLnode : State.Company.getBalanceObjects( 8784 )[0] ),
        newDatom( "newTransaction_"+index, "transaction/destinationNode", State.Company.get(PnLnode, 7433) < 0 ? PnLnode : State.Company.getBalanceObjects( 8784 )[0] ),
        newDatom( "newTransaction_"+index, 1083, Math.abs( State.Company.get(PnLnode, 7433) )  ),
        newDatom( "newTransaction_"+index, 1139, "Bokføring av årsresultat" ),
    ] ).flat())  ))
    

  ])
])


} 

let accountingYearStep_forms = ( State, lastEventIndex ) => d([
  submitButton( "Generer oppgaver", () => State.Actions.postDatoms(State.DB.getAll(7976).map( (reportType, index) => [
    newDatom("newEntity_"+index, "entity/entityType", 7865 ),
    newDatom("newEntity_"+index, 'entity/company', State.S.selectedCompany ), 
    newDatom("newEntity_"+index, 7408, State.S.selectedAccountingYear ), 
    newDatom("newEntity_"+index, "companyDocument/documentType", reportType ),
    newDatom("newEntity_"+index, "transaction/index", lastEventIndex  ),
    newDatom("newEntity_"+index, 6, State.DB.get(reportType, 6) + " generert " + moment( Date.now() ).format( "DD/MM/YYYY HH:mm" )  ),
  ]  ).flat() ) ),
  submitButton("Slett oppgaver", () => State.Actions.retractEntities( getAllReports(State.DB, State.S.selectedCompany ) ) ),
  d( State.DB.getAll( 7976 )
    .filter( report => isUndefined( State.DB.get( report, 8793 ) )  )
    .map( report => d([
      d([
        entityLabelWithPopup( State, report ),
        entityLabelWithPopup( State, getAllReports(State.DB, State.S.selectedCompany ).find( r => State.DB.get(r, "companyDocument/documentType") === report ) ),
       ], {style: gridColumnsStyle("1fr 1fr")}),
      d( State.DB.getAll( 7976 )
        .filter( rep => State.DB.get( rep, 8793 ) === report  )
        .map( rep => d([
          entityLabelWithPopup( State, rep ),
          entityLabelWithPopup( State, getAllReports(State.DB, State.S.selectedCompany ).find( r => State.DB.get(r, "companyDocument/documentType") === rep ) ),
         ], {style: gridColumnsStyle("1fr 1fr")})
        ), {style: "padding-left: 1em;"}),
        br()
    ]) )
  )
])


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

let balanceSheetView = (State, transactionIndex) => d([
  d([
    entityLabelWithPopup( State, 7537 ),
    d( State.Company.getBalanceObjects().filter( balanceObject => State.DB.get( State.DB.get( balanceObject, "balanceObject/balanceObjectType" ), 7540 ) === 7537 ).map( balanceObject => d([
      entityLabelWithPopup( State, balanceObject ),
      companyValueView( State, balanceObject,  7433, transactionIndex ),
    ], {style: gridColumnsStyle("repeat(2, 1fr)")}))),
    d([
      entityLabelWithPopup( State, State.DB.get( 7537, 7748 ) ),
      companyValueView( State, State.S.selectedCompany, State.DB.get( 7537, 7748 ), transactionIndex )   
    ], {style: gridColumnsStyle("repeat(2, 1fr)")}),
  ]),
  d([
    d([
      entityLabelWithPopup( State, 7539 ),
      d( State.Company.getBalanceObjects().filter( balanceObject => State.DB.get( State.DB.get( balanceObject, "balanceObject/balanceObjectType" ), 7540 ) === 7539 ).map( balanceObject => d([
        entityLabelWithPopup( State, balanceObject ),
        companyValueView( State, balanceObject,  7433, transactionIndex ),
      ], {style: gridColumnsStyle("repeat(2, 1fr)")}))),
      d([
        entityLabelWithPopup( State, State.DB.get( 7539, 7748 ) ),
        companyValueView( State, State.S.selectedCompany, State.DB.get( 7539, 7748 ), transactionIndex )   
      ], {style: gridColumnsStyle("repeat(2, 1fr)")}),
    ]),
    d([
      entityLabelWithPopup( State, 7538 ),
      d( State.Company.getBalanceObjects().filter( balanceObject => State.DB.get( State.DB.get( balanceObject, "balanceObject/balanceObjectType" ), 7540 ) === 7538 ).map( balanceObject => d([
        entityLabelWithPopup( State, balanceObject ),
        companyValueView( State, balanceObject,  7433, transactionIndex ),
      ], {style: gridColumnsStyle("repeat(2, 1fr)")}))),
      d([
        entityLabelWithPopup( State, State.DB.get( 7538, 7748 ) ),
        companyValueView( State, State.S.selectedCompany, State.DB.get( 7538, 7748 ), transactionIndex )   
      ], {style: gridColumnsStyle("repeat(2, 1fr)")}),
      d([
        entityLabelWithPopup( State, 9647 ),
        companyValueView( State, State.S.selectedCompany, 9647, transactionIndex )   
      ], {style: gridColumnsStyle("repeat(2, 1fr)")}),
    ]),
  ])

], {style: gridColumnsStyle("1fr 1fr")}) 

let allBalanceObjectsView = State => {

  let allBalanceObjects = State.Company.getBalanceObjects()
  let latestTransaction = getTransactionByIndex( State.DB, State.S.selectedCompany, State.companyDatoms, State.S.selectedCompanyEventIndex )
  let latestDate = State.Company.get(latestTransaction, 1757)

  return d([
    d([
      d("Viser balansetall per:"),
      d( moment(latestDate).format("DD.MM.YYYY") )
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    br(),
    d( [7537, 7539, 7538].map( balanceSection =>  d([
      d([
        entityLabelWithPopup( State, balanceSection ),
        submitButton("+", () => State.Actions.createBalanceObject( D.getAll(7531).find( e => D.get(e, 7540) ===  balanceSection ) ) ),
      ], {style: "display: flex;"}),
      d( allBalanceObjects.filter( balanceObject => State.DB.get( State.DB.get( balanceObject, "balanceObject/balanceObjectType" ), 7540 ) === balanceSection ).map( balanceObject => d([
        entityLabelWithPopup( State, balanceObject ),
        companyValueView( State, balanceObject,  7433, State.S.selectedCompanyEventIndex ),
        //d( formatNumber( State.Company.get( balanceObject, 7433, State.S.selectedCompanyEventIndex  ) ), {style: `text-align: right;`} )
      ], {style: gridColumnsStyle("repeat(4, 1fr)")}))),
      d([
        entityLabelWithPopup( State, State.DB.get( balanceSection, 7748 ) ),
        companyValueView( State, State.S.selectedCompany, State.DB.get( balanceSection, 7748 ), State.S.selectedCompanyEventIndex )   
      ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
      br()
    ]),  ) ),
    
    
    
    br(),
    submitButton("Legg til", () => State.Actions.createBalanceObject() ),
    br(),
    ])
} 

//--- Transaction views

let transactionRowView = (State, companyTransaction) => d([
  entityLabelWithPopup(State, State.DB.get(companyTransaction, "transaction/accountingYear") ),
  transactionLabel( State, companyTransaction ),
  d( moment( State.DB.get( companyTransaction, 1757 ) ).format("DD.MM.YYYY") , {style: `text-align: right;`}),
  companyValueView( State, companyTransaction, 8748 ),
  d([
    isDefined( State.DB.get(companyTransaction, 7867) ) ? entityLabelWithPopup(State, State.DB.get(companyTransaction, 7867) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}),
    d(" --> "),
    isDefined( State.DB.get(companyTransaction, 7866) ) ? entityLabelWithPopup(State, State.DB.get(companyTransaction, 7866) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}) ,
  ], {style: gridColumnsStyle("3fr 1fr 3fr") + "padding-left: 3em;"} ),
  /* State.Company.get(companyTransaction, 8355) 
  ? d("🔒")
  : submitButton("❌", e => State.Actions.retractEntity(companyTransaction) ) */
], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 3fr 1fr")})

let allTransactionsView = State => {

  let alltransactions = getAllTransactions(State.DB, State.S.selectedCompany, State.S.selectedAccountingYear )

  return d([
    h3("Alle transaksjoner"),
    d( alltransactions.map( companyTransaction => transactionRowView(State, companyTransaction)  ) ),
    br(),
    submitButton("Legg til", () => State.Actions.createBlankTransaction() ),
    br(),
    d([
      d("Importer fra:"),
      entityLabelWithPopup( State, State.Company.getBalanceObjects( 8737 )[0]),
      input({type: "file", style: `text-align: right;`}, "change", e => Papa.parse(e.srcElement.files[0], {header: false, complete: async results => {

        let transactionRows = results.data.filter( row => row.length > 1 ).slice(5, results.data.length-1)
        let selectedBankAccount = State.Company.getBalanceObjects( 8737 )[0]
        let datoms = transactionRows.map( (transactionRow, index) => constructTransactionRowDatoms(State, transactionRow, index, selectedBankAccount)  ).flat()         

        State.Actions.postDatomsAndUpdateCompany(datoms)

        } }) ),
    ]),
  ])
} 

let transactionsView = State => isDefined( State.S.selectedEntity ) 
  ? transactionView( State ) 
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

let balanceChangeView = ( State, balanceObject, companyTransaction ) => d([
  d([
    entityLabelWithPopup(State, 7433 ),
    d([
      d( formatNumber( State.Company.get( balanceObject, 7433, State.Company.get( companyTransaction, 8354 ) - 1 ) ), {class: "redlineText", style: `text-align: right;`} ),
      d( formatNumber( State.Company.get( balanceObject, 7433, State.Company.get( companyTransaction, 8354 )  ) ), {style: `text-align: right;`} ),
    ]),
  ], {style: gridColumnsStyle("1fr 1fr")}),
  /* isDefined( State.Company.get( balanceObject, 7449, State.Company.get( companyTransaction, 8354 )  ) ) 
    ? d([
      entityLabelWithPopup(State, 7449 ),
      d([
        d( formatNumber( State.Company.get( balanceObject, 7449, State.Company.get( companyTransaction, 8354 ) - 1 ) ), {class: "redlineText", style: `text-align: right;`} ),
        d( formatNumber( State.Company.get( balanceObject, 7449, State.Company.get( companyTransaction, 8354 )  ) ), {style: `text-align: right;`} ),
      ])
    ], {style: gridColumnsStyle("1fr 1fr")})
    : d("") */
])

let transactionFlowView = (State, companyTransaction) => d([
  d([
    d([ isDefined( State.DB.get(companyTransaction, 7867) ) ? entityLabelWithPopup(State, State.DB.get(companyTransaction, 7867) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}) ]),
    isDefined( State.DB.get(companyTransaction, 7867) ) 
      ? balanceChangeView( State, State.Company.get( companyTransaction, 7867 ), companyTransaction ) 
      : d("")
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
    d([ isDefined( State.DB.get(companyTransaction, 7866) ) ? entityLabelWithPopup(State, State.DB.get(companyTransaction, 7866) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}), ]) ,
    isDefined( State.DB.get(companyTransaction, 7866) ) 
      ? balanceChangeView( State, State.Company.get( companyTransaction, 7866 ), companyTransaction ) 
      : d("")
  ])
], {class: "feedContainer", style: gridColumnsStyle("2fr 3fr 2fr")})

let transactionDataSourceView = State => d([
  h3("Importerte transaksjonsdata"),
  d([
      companyDatomView( State, State.S.selectedEntity,  9104 ),
      companyDatomView( State, State.S.selectedEntity,  9084 ),
      companyDatomView( State, State.S.selectedEntity,  8832 ),
      companyDatomView( State, State.S.selectedEntity, 8830 ),
      companyDatomView( State, State.S.selectedEntity,  8831 ),
      companyDatomView( State, State.S.selectedEntity,  1080 ),
      ]),
], {class: "feedContainer"})

let manualTransactionView = State => d([
  h3("Fri postering"),
  d( State.DB.get( 8019, 7942 ).map( attribute => State.DB.get(attribute, "entity/entityType") === 42 ? entityAttributeView( State, State.S.selectedEntity, attribute ) : companyDatomView( State, State.S.selectedEntity, attribute) ) ),
  br(),
  State.Company.get(State.S.selectedEntity, 8355) ? d("🔒") : submitButton("Slett", e => State.Actions.retractEntity(State.S.selectedEntity) )
])

// Outgoing transactions

let transactionAttributesView = State => d([
  State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) === 9035
    ? d([
      companyDatomView( State, State.S.selectedEntity,  9041 ),
      companyDatomView( State, State.S.selectedEntity,  9191 ),
      companyDatomView( State, State.S.selectedEntity,  9042 ),
      br()
      ])
    : d(""),
  State.Company.get( State.S.selectedEntity, 9030 ).length > 0
  ? d([
    companyDatomView( State, State.S.selectedEntity,  9030 ),
  ]) 
  : d(""),
  isDefined( State.DB.get(State.S.selectedEntity, "transaction/parentTransaction") )
  ? d([
    companyDatomView( State, State.S.selectedEntity,  9011 ),
    entityAttributeView( State, State.S.selectedEntity, 1083 ),
  ]) : d(""),
  State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) === 8976
          ? d([
            companyDatomView( State, State.S.selectedEntity,  9253 ),
          ]) 
          : d(""),
  br(),
  d( State.DB.get( State.DB.get( State.S.selectedEntity, "transaction/transactionType" ), 7942 ).map( inputAttribute => entityAttributeView( State, State.S.selectedEntity , inputAttribute ) ) ),
])


let transactionCategoryView = State => d([
  companyDatomView( State, State.S.selectedEntity,  7935),
  State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) === 8829 
    ? categorizePaymentView( State )
    : State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) === 8850 
      ? categorizeReceiptView( State )
      : State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) === 9035
        ? d("")
        : submitButton("Tilbakestill kategori", e => State.Actions.postDatoms(
          State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) === 8976
            ? [
              newDatom( State.S.selectedEntity, "transaction/transactionType", 8850 ),
              newDatom( State.S.selectedEntity, "transaction/originNode", State.DB.get(State.S.selectedEntity, "transaction/originNode") , false ),
            ].concat( getEntityRetractionDatoms( State.DB, State.Company.get( State.S.selectedEntity, 9253) ) )
            : State.DB.get( State.S.selectedEntity, "transaction/paymentType") === 9086
            ? [
          newDatom( State.S.selectedEntity, "transaction/transactionType", 8829 ),
          newDatom( State.S.selectedEntity, "transaction/destinationNode", State.DB.get(State.S.selectedEntity, "transaction/destinationNode") , false ),
            ]
          : [
            newDatom( State.S.selectedEntity, "transaction/transactionType", 8850 ),
            newDatom( State.S.selectedEntity, "transaction/originNode", State.DB.get(State.S.selectedEntity, "transaction/originNode") , false ),
          ]
          
        ))
])


let transactionView = State => d([
  prevNextTransactionView( State ),
  br(),
  transactionFlowView( State, State.S.selectedEntity ),
  br(),
  [8829, 8850].includes( State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) ) ? transactionDataSourceView( State ) : d(""),
  br(),
  State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) === 8019 
    ? manualTransactionView( State )
    : d([
      h3("Utfylte transaksjonsdata"),
      transactionCategoryView( State ),
      br(),
      transactionAttributesView( State ),
    ], {class: "feedContainer"}),
  d([
    companyDatomView( State, State.S.selectedEntity,  8748),
    isNumber( State.DB.get( State.S.selectedEntity, 7450)   ) ? companyDatomView( State, State.S.selectedEntity,  8749) : d("")
  ], {class: "feedContainer"})
  
  //submitButton("Slett", e => State.Actions.retractEntity( State.S.selectedEntity ) ),  
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
  br(),
  isNumber( State.DB.get( State.S.selectedEntity, "transaction/parentTransaction" ) )
      ? submitButton("Tilbakestill splittet transaksjon", e => State.Actions.retractEntity( State.S.selectedEntity ) )
      : d([d(`Splitt transaksjon`, {class: "entityLabel", style: "background-color:#7b7b7b70;"}, "click", () => State.Actions.postDatoms([
        newDatom( "newTransaction", "entity/entityType", State.DB.get( State.S.selectedEntity , "entity/entityType") ),
        newDatom( "newTransaction", "entity/company", State.DB.get( State.S.selectedEntity , "entity/company") ),
        newDatom( "newTransaction", "event/date", State.DB.get( State.S.selectedEntity , "event/date") ),
        newDatom( "newTransaction", "transaction/accountingYear", State.DB.get( State.S.selectedEntity , "transaction/accountingYear") ),
        newDatom( "newTransaction", "transaction/transactionType", State.DB.get( State.S.selectedEntity , "transaction/transactionType") ),
        newDatom( "newTransaction", "transaction/originNode", State.DB.get( State.S.selectedEntity , "transaction/originNode") ),
        newDatom( "newTransaction", "transaction/parentTransaction", State.S.selectedEntity ),
        newDatom( "newTransaction", 1139, "" ),
        newDatom( "newTransaction", 1083, 0 ),
      ]) )], {style:"display: inline-flex;"}),
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
      d( State.Company.getBalanceObjects( 8738 ).map(  security => entityLabelWithPopup( State, security, async () => State.Actions.postDatoms([
        newDatom( State.S.selectedEntity, "transaction/transactionType", 8976 ),
        newDatom( State.S.selectedEntity, "transaction/originNode", security ),
        newDatom( State.S.selectedEntity, 7450, 0 ),
        newDatom( "newTransaction", "entity/entityType", State.DB.get( State.S.selectedEntity , "entity/entityType") ),
        newDatom( "newTransaction", "entity/company", State.DB.get( State.S.selectedEntity , "entity/company") ),
        newDatom( "newTransaction", "event/date", State.DB.get( State.S.selectedEntity , "event/date") ),
        newDatom( "newTransaction", "transaction/accountingYear", State.DB.get( State.S.selectedEntity , "transaction/accountingYear") ),
        newDatom( "newTransaction", "transaction/transactionType", 9035 ),
        newDatom( "newTransaction", "transaction/destinationNode", security ),
        newDatom( "newTransaction", "transaction/originNode", State.Company.getBalanceObjects( 8744 )[0] ),
        newDatom( "newTransaction", "transaction/sourceTransactionForProfitCalculation", State.S.selectedEntity ),
        newDatom( "newTransaction", 1139, "" ),
      ])  ) ) ),
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


let transactionLabel = (State, companyTransaction) => d([d(`Transaksjon ${ State.Company.get(companyTransaction, 8354) }`, {class: "entityLabel", style: `background-color:${State.DB.get( State.DB.get(companyTransaction, "transaction/transactionType"), 20  )};`}, "click", () => State.Actions.selectEntity(companyTransaction) )], {style:"display: flex;"}) 

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
    d( reportFields
        .filter( attribute => State.Company.get( report, attribute ) !== 0 ) 
        .map( attribute => companyDatomView( State, report, attribute ) ) 
        ),
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

