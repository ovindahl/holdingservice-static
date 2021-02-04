//Action button

//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------

// CLIENT PAGE VIEWS

let navBarView = (State) => isDefined(State.S.selectedEntity)
  ? d([
      entityLabelWithPopup( State, State.S.selectedCompany ),
      span( " / " ),
      entityLabelWithPopup( State, State.S.selectedPage, () => State.Actions.selectEntity( undefined ) ),
      span( " / " ),
      State.DB.get(State.S.selectedEntity, 19) === 7948
        ? transactionLabel( State, State.S.selectedEntity )
        : State.DB.get(State.S.selectedEntity, 19) === 7932
        ? nodeLabel( State, State.S.selectedEntity )
          : entityLabelWithPopup( State, State.S.selectedEntity )
  ], {class: "feedContainer"})
  : d([
      entityLabelWithPopup( State, State.S.selectedCompany ),
      span( " / " ),
      entityLabelWithPopup( State, State.S.selectedPage, () => State.Actions.selectEntity( undefined ) ),
], {class: "feedContainer"})

let clientPage = State => {

  if(State.S.isError){return d(State.S.error) }
  if(isUndefined(State.DB)){return d("Laster..") }


  let pageRouter = {
    "9951": companyView,
    "7509": accountingYearsView,
    "7860": balanceObjectsView,
    "7882": transactionsView,
    "7977": actorsView,
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
          d( [7860, 7509 , 7882, 7977].map( pageEntity => entityLabelWithPopup( State, Number(pageEntity), () => State.Actions.selectPage(pageEntity) ) ), {class: "feedContainer"} ),
          br(),
          //navBarView( State ),
          br(),
          d([
            isDefined(pageRouter[ State.S.selectedPage ])
            ? pageRouter[ State.S.selectedPage ]( State ) 
            : definitionsPage( State )
          ], {class: "feedContainer"} )
        ])
      ])
    ], {class: "pageContainer"})
    
  ])
}

let companyView = State => d([
  h3("Sider"),
  d( [7860, 7509 , 7882, 7977].map( pageEntity => entityLabelWithPopup( State, Number(pageEntity), () => State.Actions.selectPage(pageEntity) ) ) ),
])

let definitionsPage = State => d([
  h3("Definisjoner"),
  entityLabelWithPopup( State, State.S.selectedEntity ),
  d([
    entityLabelWithPopup( State, 19 ),
    entityLabelWithPopup( State, State.DB.get(State.S.selectedEntity, 19) ),
  ], {style: gridColumnsStyle("1fr 1fr")})
  
])

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
          State.S.selectedCompanyEventIndex < getAllTransactions( State.DB, State.S.selectedCompany ).length ? submitButton(">", () => State.Actions.selectCompanyEventIndex( State.S.selectedCompanyEventIndex + 1 ) ) : d(""),
          submitButton("[>>]", () => State.Actions.selectCompanyEventIndex( State.Company.get( getAllTransactions( State.DB, State.S.selectedCompany ).slice( - 1 )[0], 8354  )  ) )
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

let singleAccountingYearView = State => d([
  d([
    d([
      entityLabelWithPopup( State, State.S.selectedCompany ),
      span( " / " ),
      entityLabelWithPopup( State, 7509, () => State.Actions.selectPage( 7509 ) ),
      span( " / " ),
      entityLabelWithPopup( State, State.S.selectedAccountingYear ),
      isDefined( State.S.selectedEntity ) 
        ? d([
            span( " / " ),
            entityLabelWithPopup( State, State.S.selectedEntity ),
          ]) 
        : d("")
    ], {style: "display: inline-flex;"}),
  ], {style: gridColumnsStyle("3fr 1fr")}),
  br(),
  State.DB.get(State.S.selectedEntity, 19) === 7976
  ? singleReportView( State )
  : State.DB.get(State.S.selectedAccountingYear, "accountingYear/accountingYearType") === 8263 || State.DB.get(State.S.selectedAccountingYear, "accountingYear/accountingYearType") === 9903
    ? openingBalannceOverviewView( State )
    : State.DB.get(State.S.selectedAccountingYear, "accountingYear/accountingYearType") === 9892
      ? closedAccountingYearView( State )
      : openAccountingYearView( State )
])

let allAccountingYearsView = State => d([
  h3("Alle regnskapsår"),
  d( getAllAccountingYears(State.DB, State.S.selectedCompany).map( accountingYear => d([
    entityLabelWithPopup( State, accountingYear ),
    entityLabelWithPopup( State, State.DB.get( accountingYear, "accountingYear/accountingYearType")  ),
  ], {style: gridColumnsStyle("1fr 1fr 4fr")}) ), {class: "feedContainer"} ),
  br(),
  getAllAccountingYears(State.DB, State.S.selectedCompany).every( accYear => State.DB.get(accYear, 9753) )
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

let openingBalannceOverviewView = State => d([
  d([
    h3("Åpningsbalanse"),
  ], {class: "feedContainer"}),
  d([
    h3("Transaksjoner i åpningsbalansen"),
    d( State.DB.get(State.S.selectedAccountingYear, 9715).map( t => transactionRowView( State, t) ) ),
  ], {class: "feedContainer"}),
  br(),
  d([
    h3("Årets utgående balanse"),
    balanceSheetView( State, State.DB.get( State.S.selectedAccountingYear, 9814 ) )
  ], {class: "feedContainer"}),
])

let getYearCloseDatoms = (State, accountingYear) => {

  let company = State.S.selectedCompany

  let taxDebtNode = State.Company.getBalanceObjects( 5231 )[0]
  let taxCostNode = State.Company.getBalanceObjects( 8746 )[0]
  let taxCostAmount = State.Company.get( State.S.selectedCompany, 8774 )
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

  let annualResultNode = State.Company.getBalanceObjects( 8784 )[0]
  let retainedProfitsNode = State.Company.getBalanceObjects( 8741 )[0]

  let annualResultAmount = Math.abs( State.Company.get( State.S.selectedCompany , 8781 ) ) + taxCostAmount

  let annualResultDatoms = [
    newDatom( "newTransaction_EK", "entity/entityType", 7948 ),
    newDatom( "newTransaction_EK", "entity/company", company ),
    newDatom( "newTransaction_EK", "event/date", lastDate ),
    newDatom( "newTransaction_EK", "transaction/accountingYear", accountingYear ),
    newDatom( "newTransaction_EK", "transaction/transactionType", 9384 ),
    newDatom( "newTransaction_EK", "transaction/originNode", retainedProfitsNode ),
    newDatom( "newTransaction_EK", "transaction/destinationNode", annualResultNode ),
    newDatom( "newTransaction_EK", 1083, annualResultAmount ),
    newDatom( "newTransaction_EK", 1139, "Bokføring av resultatdisponering" ),
   /*  newDatom( "newTransaction_resultat", "entity/entityType", 7948 ),
    newDatom( "newTransaction_resultat", "entity/company", company ),
    newDatom( "newTransaction_resultat", "event/date", lastDate ),
    newDatom( "newTransaction_resultat", "transaction/accountingYear", accountingYear ),
    newDatom( "newTransaction_resultat", "transaction/transactionType", 9723 ),
    newDatom( "newTransaction_resultat", "transaction/originNode", retainedProfitsNode ),
    newDatom( "newTransaction_resultat", "transaction/destinationNode", resultDisposalNode ),
    newDatom( "newTransaction_resultat", 1083, annualResultAmount  ),
    newDatom( "newTransaction_resultat", 1139, "Bokføring av resultatdisponering" ), */
  ]
    
    
  let resetPnLAccountsDatoms = State.Company.getBalanceObjects( 8788 )
    .filter( PnLnode => State.Company.get(PnLnode, 7433) !== 0 )
    .map( (PnLnode, index) => [
      newDatom( "newTransaction_"+index, "entity/entityType", 7948 ),
      newDatom( "newTransaction_"+index, "entity/company", company ),
      newDatom( "newTransaction_"+index, "event/date", lastDate ),
      newDatom( "newTransaction_"+index, "transaction/accountingYear", accountingYear ),
      newDatom( "newTransaction_"+index, "transaction/transactionType", 9716 ),
      newDatom( "newTransaction_"+index, "transaction/originNode", State.Company.get(PnLnode, 7433) >= 0 ? PnLnode : State.Company.getBalanceObjects( 8784 )[0] ),
      newDatom( "newTransaction_"+index, "transaction/destinationNode", State.Company.get(PnLnode, 7433) < 0 ? PnLnode : State.Company.getBalanceObjects( 8784 )[0] ),
      newDatom( "newTransaction_"+index, 1083, Math.abs( State.Company.get(PnLnode, 7433 ) )  ),
      newDatom( "newTransaction_"+index, 1139, "Bokføring av årsresultat" ),
  ] ).flat()


  let lockYearDatom = newDatom(accountingYear, "accountingYear/accountingYearType", 9892)

  return [
    taxDatoms,
    annualResultDatoms,
    resetPnLAccountsDatoms,
    lockYearDatom
  ].flat()

}

let accountingYearPnLView = (State, accountingYear) => {



  return d([
    h3("Resultatregnskap"),
    br(),
    d( [8743].map( nodeType => State.Company.getBalanceObjects(nodeType) ).flat().map( balanceObject => d([
      companyValueView( State, balanceObject,  7934 ),
      companyValueView( State, balanceObject,  7433, State.DB.get( accountingYear, 9814 ) ),
    ], {style: gridColumnsStyle("repeat(2, 1fr)")}) ) ),
    companyDatomView( State, State.S.selectedCompany,  9632, State.DB.get( accountingYear, 9814 ) ),
    br(),
    d( [8744, 8745].map( nodeType => State.Company.getBalanceObjects(nodeType) ).flat().map( balanceObject => d([
      companyValueView( State, balanceObject,  7934 ),
      companyValueView( State, balanceObject,  7433, State.DB.get( accountingYear, 9814 ) ),
    ], {style: gridColumnsStyle("repeat(2, 1fr)")}) ) ),
    companyDatomView( State, State.S.selectedCompany,  9633, State.DB.get( accountingYear, 9814 ) ),
    br(),
    companyDatomView( State, State.S.selectedCompany,  8769, State.DB.get( accountingYear, 9814 ) ),
    companyDatomView( State, State.S.selectedCompany,  9634, State.DB.get( accountingYear, 9814 ) ),
    br(),
    companyDatomView( State, State.S.selectedCompany,  9642, State.DB.get( accountingYear, 9814 )),
    br(),
    companyDatomView( State, State.S.selectedCompany,  9635, State.DB.get( accountingYear, 9814 )),
  ], {class: "feedContainer"})
}

let closedAccountingYearView = State => d([
  d([
    h3("Status på året"),
    companyValueView(State, State.S.selectedAccountingYear, 8257),
    br(),
    getAllAccountingYears( State.DB, State.S.selectedCompany ).some( accountingYear => State.DB.get(accountingYear, "accountingYear/prevAccountingYear") === State.S.selectedAccountingYear )
      ? d("Alle senere år må slettes for å gjøre endirnger")
      : submitButton("Tilbakestill årsavslutning", () => State.Actions.postDatomsAndUpdateCompany( getEntitiesRetractionDatoms( State.DB, State.DB.get(State.S.selectedAccountingYear, 9715).filter( transaction => [9286, 9384, 9716, 9723].includes( State.Company.get(transaction, "transaction/transactionType") )  ) ).concat(newDatom(State.S.selectedAccountingYear, "accountingYear/accountingYearType", 8254))   )  )
  ], {class: "feedContainer"}),
  accountingYearPnLView( State, State.S.selectedAccountingYear ),
  d([
    h3("Balanse"),
    balanceSheetView( State, State.DB.get( State.S.selectedAccountingYear, 9814 ), State.DB.get( State.S.selectedAccountingYear, 9813 ) )
  ], {class: "feedContainer"}),
  d([
    h3("Altinn-skjemaer"),
    d( State.DB.getAll( 7976 ).map( report => entityLabelWithPopup( State, report ) ) )
  ], {class: "feedContainer"}),
])

let singleReportView = State => State.DB.get(State.S.selectedAccountingYear, "accountingYear/accountingYearType") === 9892
? d([
  entityLabelWithPopup( State, State.S.selectedEntity ),
  d(  DB.getAll( 8359 )
    .filter( reportField => DB.get(reportField, 8363) === State.S.selectedEntity )
    .sort( (a,b) => a-b )
    .map( reportField => reportFieldView( State, State.S.selectedAccountingYear, reportField ) ) )
  ])
: d("Kan kun generere rapporter for avsluttede regnskapsår")

let reportFieldView = ( State, accountingYear, reportField ) => d([
  entityLabelWithPopup( State, reportField ),
  d( new Function(["storedValue"], State.DB.get(State.DB.get(reportField, "attribute/valueType"), "valueType/formatFunction") )( getReportFieldValue( State.DB, State.companyDatoms, State.S.selectedCompany, accountingYear, reportField, State.S.selectedCompanyEventIndex )  ), {style: State.DB.get(reportField, "attribute/valueType") === 31 ? `text-align: right;` : ""}  )
], {style: gridColumnsStyle("3fr 1fr")})

let openAccountingYearView = State => {

  return d([
    d([
      h3("Status på året"),
      companyValueView(State, State.S.selectedAccountingYear, 8257),
      br(),
      d( [9813, 9814, 9753].map( calculatedField => d([
        entityLabelWithPopup( State, calculatedField),
        d( String( State.DB.get( State.S.selectedAccountingYear, calculatedField ) ) )
      ], {style: gridColumnsStyle("1fr 1fr")}) ) ),
      br(),
      submitButton("Slett året og alle årets transaksjoner", () => State.Actions.postDatomsAndUpdateCompany( getEntitiesRetractionDatoms( State.DB, [State.DB.get(State.S.selectedAccountingYear, 9715), State.S.selectedAccountingYear].flat() ) )  )
    ], {class: "feedContainer"}),
    d([
      h3("Årets åpningsbalanse"),
      br(),
      balanceSheetView( State, State.DB.get( State.S.selectedAccountingYear, 9813 ) )
    ], {class: "feedContainer"}), 
    br(),
    d([
      h3("Bank"),
      br(),
      d([
        d([
          entityLabelWithPopup( State, 8737 ),
          entityLabelWithPopup( State, 7433 ),
          d("Importer")
        ], {style: gridColumnsStyle("1fr 1fr 1fr")}),
        d( State.Company.getBalanceObjects(8737).map( bankAccount => d([
          entityLabelWithPopup( State, bankAccount ),
          companyValueView( State, bankAccount, 7433 ),
          input({type: "file", style: `text-align: right;`}, "change", e => State.Actions.importBankTransactions( bankAccount, e ) ),
        ], {style: gridColumnsStyle("1fr 1fr 1fr")}) ) )
      ]),
      entityAttributeView( State, State.S.selectedAccountingYear, 8750 ),
    ], {class: "feedContainer"}),
    br(),
    d([
      h3("Verdijustering"),
      entityAttributeView( State, State.S.selectedAccountingYear, 8751 ),
    ], {class: "feedContainer"}),
    br(),
    d([
      d([
        h3("Foreløpig resultat"),
        nodeBalanceView( State, 8743, State.DB.get(State.S.selectedAccountingYear, 9886) ),
        companyDatomView( State, State.S.selectedCompany,  9632, State.DB.get(State.S.selectedAccountingYear, 9886) ),
        nodeBalanceView( State, 8744, State.DB.get(State.S.selectedAccountingYear, 9886) ),
        nodeBalanceView( State, 8745, State.DB.get(State.S.selectedAccountingYear, 9886) ),
        nodeBalanceView( State, 9878, State.DB.get(State.S.selectedAccountingYear, 9886) ),
        companyDatomView( State, State.S.selectedCompany,  9633, State.DB.get(State.S.selectedAccountingYear, 9886) ),
        companyDatomView( State, State.S.selectedCompany,  8769, State.DB.get(State.S.selectedAccountingYear, 9886) ),
      ]),
      br(),
      d([
        h3("Skatt"),
        companyDatomView( State, State.S.selectedCompany,  8770, State.DB.get(State.S.selectedAccountingYear, 9886) ),
        companyDatomView( State, State.S.selectedCompany,  8771, State.DB.get(State.S.selectedAccountingYear, 9886) ),
        companyDatomView( State, State.S.selectedCompany,  8772, State.DB.get(State.S.selectedAccountingYear, 9886) ),
        companyDatomView( State, State.S.selectedCompany,  8773, State.DB.get(State.S.selectedAccountingYear, 9886) ),
        companyDatomView( State, State.S.selectedCompany,  8774, State.DB.get(State.S.selectedAccountingYear, 9886) ),
        companyDatomView( State, State.S.selectedCompany,  8775, State.DB.get(State.S.selectedAccountingYear, 9886) ),
      ]),
      br(),
      d([
        h3("Resultatdisponering"),
        companyDatomView( State, State.S.selectedCompany,  8781, State.DB.get(State.S.selectedAccountingYear, 9886) ),
      ]),
      br(),
      (State.Company.get( State.S.selectedAccountingYear, 8750 ) && State.Company.get( State.S.selectedAccountingYear, 8751 ) ) 
        ? submitButton("Bokfør skattekostnad og årsresultat, og lås året", () => State.Actions.postDatomsAndUpdateCompany( getYearCloseDatoms( State, State.S.selectedAccountingYear ) )  )
        :  d("Fullfør årets oppgaver for å lukke året")
    ], {class: "feedContainer"})
  ])

} 


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

let nodeBalanceView = (State, nodeType, transactionIndex) => d([
  entityLabelWithPopup( State, nodeType),
  d(formatNumber( State.Company.getBalanceObjects(nodeType).reduce( (sum, node) => sum + State.Company.get(node, 7433, transactionIndex), 0 )   ), {style: `text-align: right;`} )
], {style: gridColumnsStyle("1fr 1fr")})


//---

let nodeLabelText = (State, node, onclick) => d([d(State.Company.get(node, 6), {class: "entityLabel", style: `background-color:${State.DB.get( State.DB.get(node, "balanceObject/balanceObjectType"), 20  )};`}, "click", isDefined(onclick) ? onclick : () => State.Actions.selectEntity(node) )], {style:"display: flex;"})


let nodeLabel = (State, node, transactionIndex, onclick) => d([
  d([
    nodeLabelText( State, node, onclick ),
    nodePopUp( State, node, transactionIndex ),
  ], {class: "popupContainer", style:"display: inline-flex;"})
  ], {style:"display: inline-flex;"} )



  let nodePopUp = (State, node, transactionIndex) => d([
    d([
      nodeLabelText( State, node ),
      companyValueView( State, node, 7934 ),
    ], {style: gridColumnsStyle("1fr 1fr")}),
    companyDatomView( State, node, 8747 ),
    br(),
    isDefined( transactionIndex )
      ? d([
        companyDatomView( State, State.Company.getTransactionByIndex( transactionIndex ) , 1757 ),
        balanceChangeView( State, node, State.Company.getTransactionByIndex( transactionIndex ) )
      ])  
      : companyDatomView( State, node, 7433 ),
   /*  State.DB.get(node, 7934) === 8738 
      ? d([
        companyDatomView( State, node, 7449, transactionIndex ),
        companyDatomView( State, node, 7451, transactionIndex ),
      ]) 
      : d(""), */
  ], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;width: 400px;"})



let undefinedNodeView = State => d([
  h3( State.DB.get(State.DB.get( State.S.selectedEntity, "balanceObject/balanceObjectType" ), 6) ),
  entityAttributeView(State, State.S.selectedEntity, 6),
  br(),
  d("Velg type:"),
  br(),
  d( [7537, 7539, 7538].map( balanceSection =>  d([
    h3( State.DB.get(balanceSection, 6) ),
    d( State.DB.getAll(7531)
      .filter( nodeType => State.DB.get( nodeType, 7540 ) === balanceSection )
      .filter( nodeType => nodeType !== 9906 )
      .map( nodeType => entityLabelWithPopup( State, nodeType, () => State.Actions.updateEntity(State.S.selectedEntity, "balanceObject/balanceObjectType", nodeType) ) ) 
      ),
    br()
  ])), {class: "feedContainer"} ),
  submitButton("Slett", e => State.Actions.retractEntity( State.S.selectedEntity ) )
], {class: "feedContainer"})


let balanceObjectsView = State => isDefined( State.S.selectedEntity ) 
  ? State.DB.get( State.S.selectedEntity , "balanceObject/balanceObjectType" ) === 9906
    ? undefinedNodeView( State ) 
    : singleBalanceObjectView( State ) 
  : allBalanceObjectsView( State )

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
        entityLabelWithPopup( State, State.S.selectedCompany ),
        span( " / " ),
        entityLabelWithPopup( State, 7860 ),
        span( " / " ),
        entityLabelWithPopup( State, balanceObject ),
      ]),
      br(),
      transactionIndexSelectionView( State ),
      br(),
      d([
        h3( State.DB.get(balanceObject, 6) ),
        d([
          companyDatomView( State, balanceObject, 7934 ),
          isLocked ? d("") : submitButton("X", () => State.Actions.updateEntity(State.S.selectedEntity, "balanceObject/balanceObjectType", 9906) )
        ], {style: gridColumnsStyle("7fr 1fr")}),
        entityAttributeView(State, balanceObject, 6),
        br(),
        d( State.DB.get( balanceObjectType, "companyEntityType/attributes" ).map( attribute => isLocked ? companyDatomView( State, balanceObject, attribute ) : entityAttributeView( State, balanceObject, attribute ) ) ),
        br(),
        d( balanceObjectCalculatedFields.filter( calculatedField => ![8768, 7895, 7896].includes(calculatedField) ).map( calculatedField => companyDatomView( State, balanceObject, calculatedField ) ) ),
    ], {class: "feedContainer"})

  ]) 
} 

let balanceSheetView = (State, currentIndex, previousIndex) => d([
  d([
    d(""),
    d( moment( State.Company.get( getTransactionByIndex(State.DB, State.S.selectedCompany, State.companyDatoms, currentIndex), 1757  )  ).format("DD.MM.YYYY"), {style: `text-align: right;`} ),
    isDefined(previousIndex) ? d( moment( State.Company.get( getTransactionByIndex(State.DB, State.S.selectedCompany, State.companyDatoms, previousIndex), 1757  )  ).format("DD.MM.YYYY"), {style: `text-align: right;`} ) : d(""),
  ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
  d([
    entityLabelWithPopup( State, 7537 ),
    d( State.Company.getBalanceObjects().filter( balanceObject => State.DB.get( State.DB.get( balanceObject, "balanceObject/balanceObjectType" ), 7540 ) === 7537 ).map( balanceObject => d([
      entityLabelWithPopup( State, balanceObject ),
      companyValueView( State, balanceObject,  7433, currentIndex ),
      isDefined( previousIndex) ? companyValueView( State, balanceObject,  7433, previousIndex ) : d("na.", {style: `text-align: right;`}),
    ], {style: gridColumnsStyle("repeat(3, 1fr)")}))),
    d([
      entityLabelWithPopup( State, State.DB.get( 7537, 7748 ) ),
      companyValueView( State, State.S.selectedCompany, State.DB.get( 7537, 7748 ), currentIndex ),
      isDefined( previousIndex) ? companyValueView( State, State.S.selectedCompany, State.DB.get( 7537, 7748 ), previousIndex ) : d("na.", {style: `text-align: right;`}),
    ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
  ]),
  br(),
  d([
    entityLabelWithPopup( State, 7539 ),
    d( State.Company.getBalanceObjects().filter( balanceObject => State.DB.get( State.DB.get( balanceObject, "balanceObject/balanceObjectType" ), 7540 ) === 7539 ).map( balanceObject => d([
      entityLabelWithPopup( State, balanceObject ),
      companyValueView( State, balanceObject,  7433, currentIndex ),
      isDefined( previousIndex) ? companyValueView( State, balanceObject,  7433, previousIndex ) : d("na.", {style: `text-align: right;`}),
    ], {style: gridColumnsStyle("repeat(3, 1fr)")}))),
    d([
      entityLabelWithPopup( State, State.DB.get( 7539, 7748 ) ),
      companyValueView( State, State.S.selectedCompany, State.DB.get( 7539, 7748 ), currentIndex ),
      isDefined( previousIndex) ? companyValueView( State, State.S.selectedCompany, State.DB.get( 7539, 7748 ), previousIndex ) : d("na.", {style: `text-align: right;`}),
    ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
  ]),
  br(),
  d([
    entityLabelWithPopup( State, 7538 ),
    d( State.Company.getBalanceObjects().filter( balanceObject => State.DB.get( State.DB.get( balanceObject, "balanceObject/balanceObjectType" ), 7540 ) === 7538 ).map( balanceObject => d([
      entityLabelWithPopup( State, balanceObject ),
      companyValueView( State, balanceObject,  7433, currentIndex ),
      isDefined( previousIndex) ? companyValueView( State, balanceObject,  7433, previousIndex ) : d("na.", {style: `text-align: right;`}),
    ], {style: gridColumnsStyle("repeat(3, 1fr)")}))),
    d([
      entityLabelWithPopup( State, State.DB.get( 7538, 7748 ) ),
      companyValueView( State, State.S.selectedCompany, State.DB.get( 7538, 7748 ), currentIndex ),
      isDefined( previousIndex) ? companyValueView( State, State.S.selectedCompany, State.DB.get( 7538, 7748 ), previousIndex ) : d("na.", {style: `text-align: right;`}),
    ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
    d([
      entityLabelWithPopup( State, 9647 ),
      companyValueView( State, State.S.selectedCompany, 9647, currentIndex ),
      isDefined( previousIndex) ? companyValueView( State, State.S.selectedCompany, State.DB.get( 7538, 7748 ), previousIndex ) : d("na.", {style: `text-align: right;`}),
    ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
  ])
]) 

let transactionIndexSelectionView = State => d([
  entityLabelWithPopup( State, 7929 ),
  d([
    d([
      submitButton("[<<]", () => State.Actions.selectCompanyEventIndex( 0 ) ),
      State.S.selectedCompanyEventIndex >= 1 ? submitButton("<", () => State.Actions.selectCompanyEventIndex( State.S.selectedCompanyEventIndex - 1 ) ) : d(""),
      State.S.selectedCompanyEventIndex < getAllTransactions( State.DB, State.S.selectedCompany ).length ? submitButton(">", () => State.Actions.selectCompanyEventIndex( State.S.selectedCompanyEventIndex + 1 ) ) : d(""),
      submitButton("[>>]", () => State.Actions.selectCompanyEventIndex( State.Company.get( getAllTransactions( State.DB, State.S.selectedCompany ).slice( - 1 )[0], 8354  )  ) )
    ], {style: gridColumnsStyle("repeat(8, 1fr)")}),
    transactionLabel( State, getTransactionByIndex( State.DB, State.S.selectedCompany, State.companyDatoms, State.S.selectedCompanyEventIndex ) ),
    entityLabelWithPopup( State, State.DB.get( getTransactionByIndex( State.DB, State.S.selectedCompany, State.companyDatoms, State.S.selectedCompanyEventIndex ), "transaction/accountingYear" )  ),
    d( moment( State.DB.get( getTransactionByIndex( State.DB, State.S.selectedCompany, State.companyDatoms, State.S.selectedCompanyEventIndex ), 1757 ) ).format("DD.MM.YYYY")),
  ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
], {class: "feedContainer", style: gridColumnsStyle("1fr 3fr")})

let allBalanceObjectsView = State => {

  let allBalanceObjects = State.Company.getBalanceObjects().sort( (a,b) => State.DB.get( a, "balanceObject/balanceObjectType" ) - State.DB.get( b, "balanceObject/balanceObjectType" ) )

  return d([
    d([
      entityLabelWithPopup( State, State.S.selectedCompany ),
      span( " / " ),
      entityLabelWithPopup( State, 7860 ),
    ]),
    h3("Selskapets balanse"),
    transactionIndexSelectionView( State ),
    br(),
    d([
      d( [7537, 7539, 7538].map( balanceSection =>  d([
        d([
          entityLabelWithPopup( State, balanceSection ),
          submitButton("+", () => State.Actions.createBalanceObject( D.getAll(7531).find( e => D.get(e, 7540) ===  balanceSection ) ) ),
        ], {style: "display: flex;"}),
        d( allBalanceObjects.filter( balanceObject => State.DB.get( State.DB.get( balanceObject, "balanceObject/balanceObjectType" ), 7540 ) === balanceSection ).map( balanceObject => d([
          nodeLabel(State, balanceObject),
          companyValueView( State, balanceObject,  7433, State.S.selectedCompanyEventIndex ),
        ], {style: gridColumnsStyle("repeat(4, 1fr)") + "padding-left: 1em;"}))),
        d([
          entityLabelWithPopup( State, State.DB.get( balanceSection, 7748 ) ),
          companyValueView( State, State.S.selectedCompany, State.DB.get( balanceSection, 7748 ), State.S.selectedCompanyEventIndex )   
        ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
        br()
      ]),  ) ),
    ], {class: "feedContainer"})
    ])
} 

//--- Transaction views

let transactionRowView = (State, companyTransaction) => d([
  transactionLabel( State, companyTransaction ),
  d( moment( State.DB.get( companyTransaction, 1757 ) ).format("DD.MM.YYYY") , {style: `text-align: right;`}),
  d([
    isDefined( State.DB.get(companyTransaction, 7867) ) ? nodeLabel(State, State.DB.get(companyTransaction, 7867), State.Company.get(companyTransaction, 8354) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}),
    d(" --> "),
    isDefined( State.DB.get(companyTransaction, 7866) ) ? nodeLabel(State, State.DB.get(companyTransaction, 7866), State.Company.get(companyTransaction, 8354) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}) ,
  ], {style: gridColumnsStyle("3fr 1fr 3fr") + "padding-left: 3em;"} ),
  companyValueView( State, companyTransaction, 8748 ),
], {style: gridColumnsStyle("1fr 1fr 3fr 1fr ")})


let accountingYearLabel = (State, entity, onClick ) => d([ d(State.DB.get(entity,6), {class: "entityLabel", style: `background-color: ${ entity === State.S.selectedAccountingYear ? State.DB.get( State.DB.get( entity, "entity/entityType"), "entityType/color") : "gray" } ;`}, "click", onClick) ], {style:"display: inline-flex;"})


let allTransactionsView = State => {

  let alltransactions = getAllTransactions(State.DB, State.S.selectedCompany, State.S.selectedAccountingYear )

  return d([
    h3("Transaksjoner"),
    d([
      entityLabelWithPopup( State, 7403 ),
      d( getAllAccountingYears(State.DB, State.S.selectedCompany).map( e => accountingYearLabel(State, e, () => State.Actions.selectAccountingYear(e)) ), {display: "flex"} )
    ], {class: "feedContainer", style: gridColumnsStyle("1fr 3fr")}),
    br(),
    d([
      d( alltransactions.map( companyTransaction => transactionRowView(State, companyTransaction)  ) ),
      br(),
      submitButton("Legg til fri postering", () => State.Actions.postDatomsAndUpdateCompany([
        newDatom( 'newEntity' , 'entity/entityType', 7948 ),
        newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
        newDatom( 'newEntity' , 'transaction/accountingYear', State.S.selectedAccountingYear ), 
        newDatom( 'newEntity' , "transaction/transactionType", 8019 ), 
        newDatom( 'newEntity' , "eventAttribute/1083", 0 ), 
        newDatom( 'newEntity' , "event/date", Date.now() ), 
        newDatom( 'newEntity' , "eventAttribute/1139", "" )
      ]) ),
    ], {class: "feedContainer"})
  ])
} 

let transactionsView = State => isDefined( State.S.selectedEntity ) 
  ? transactionView2( State ) 
  : allTransactionsView( State )

let prevNextTransactionView = State => {

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
        entityLabelWithPopup( State, State.S.selectedCompany ),
        span( " / " ),
        entityLabelWithPopup( State, 7882, () => State.Actions.selectPage(7882) ),
        span( " / " ),
        entityLabelWithPopup( State, State.DB.get( State.S.selectedEntity, 8258 ) ),
        span( " / " ),
        transactionLabel( State, State.S.selectedEntity ),
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
])

let transactionFlowView = (State, companyTransaction) => d([
  d([
    d([ isDefined( State.DB.get(companyTransaction, 7867) ) ? nodeLabel(State, State.DB.get(companyTransaction, 7867), State.Company.get(companyTransaction, 8354) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}) ]),
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
    d([ isDefined( State.DB.get(companyTransaction, 7866) ) ? nodeLabel(State, State.DB.get(companyTransaction, 7866), State.Company.get(companyTransaction, 8354) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}), ]) ,
    isDefined( State.DB.get(companyTransaction, 7866) ) 
      ? balanceChangeView( State, State.Company.get( companyTransaction, 7866 ), companyTransaction ) 
      : d("")
  ])
], {class: "feedContainer", style: gridColumnsStyle("2fr 3fr 2fr")})

// Outgoing transactions


let transactionLabelText = (State, companyTransaction) => d([d(`Transaksjon ${ State.Company.get(companyTransaction, 8354) }`, {class: "entityLabel", style: `background-color:${State.DB.get( State.DB.get(companyTransaction, "transaction/transactionType"), 20  )};`}, "click", () => State.Actions.selectEntity(companyTransaction) )], {style:"display: flex;"})

let transactionLabel = (State, companyTransaction) => d([
  d([
    transactionLabelText( State, companyTransaction ),
    transactionPopUp( State, companyTransaction ),
  ], {class: "popupContainer", style:"display: inline-flex;"})
  ], {style:"display: inline-flex;"} )

  let transactionPopUp = (State, companyTransaction) => d([
    d([
      transactionLabelText( State, companyTransaction ),
      d( moment( State.Company.get( companyTransaction, 1757, State.S.selectedCompanyEventIndex ) ).format("DD.MM.YYYY") ),
    ], {style: gridColumnsStyle("1fr 1fr")}),
    companyDatomView( State, companyTransaction, 8748 ),
    d([
      entityLabelWithPopup(State, State.DB.get(companyTransaction, 7867) ),
      d([
        companyValueView( State, companyTransaction, 8748 ),
        d(" ---------> "),
      ]),
      entityLabelWithPopup(State, State.DB.get(companyTransaction, 7866) )
    ], {style: gridColumnsStyle("3fr 2fr 3fr")})
  ], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;width: 400px;"})


let transactionView2 = State => d([
  prevNextTransactionView( State ),
  br(),
  transactionFlowView( State, State.S.selectedEntity ),
  br(),
  d([
    h3("Transaksjonstype"),
    companyDatomView( State, State.S.selectedEntity, 7935 ),
    br(),
    State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) === 8829 
    ? categorizePaymentView( State )
    : State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) === 8850 
      ? categorizeReceiptView( State )
      : (State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) === 8019 || State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) === 9035 )
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
  ], {class: "feedContainer"}),
  br(),
  d([
    h3("Kilde"),
    State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) === 8019 
      ? d("Fri postering")
      : isNumber( State.Company.get(State.S.selectedEntity, 9011) ) 
        ? companyDatomView( State, State.S.selectedEntity,  9011 )
        : State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) === 9035 
          ? d([
            companyDatomView( State, State.S.selectedEntity,  9041 ),
            companyDatomView( State, State.Company.get( State.S.selectedEntity,  9041 ),  8748 ),
            companyDatomView( State, State.S.selectedEntity,  9191 ),
            companyDatomView( State, State.S.selectedEntity,  9042 ),
          ]) 
          : d([
              companyDatomView( State, State.S.selectedEntity,  9104 ),
              companyDatomView( State, State.S.selectedEntity,  9084 ),
              companyDatomView( State, State.S.selectedEntity,  8832 ),
              companyDatomView( State, State.S.selectedEntity, 8830 ),
              companyDatomView( State, State.S.selectedEntity,  8831 ),
              companyDatomView( State, State.S.selectedEntity,  1080 ),
              br(),
              d([
                h3("Splitt"),
                d([
                  (State.DB.get( State.S.selectedEntity , "transaction/transactionType") === 8829 || State.DB.get( State.S.selectedEntity , "transaction/transactionType") === 8850) ? submitButton("Splitt transaksjon", () => State.Actions.splitTransaction( State.S.selectedEntity) ) : d("Tilbakestill kategori for å splitte"),
                  State.Company.get(State.S.selectedEntity, 9030).length > 0 
                    ? d([
                      entityLabelWithPopup( State, 9030 ),
                      d( State.Company.get(State.S.selectedEntity, 9030).map( t => d([
                        transactionLabel( State, t ),
                        entityAttributeView( State, t, 1083),
                        submitButton("X", () => State.Actions.retractEntity( t ))
                      ], {style: gridColumnsStyle("6fr 3fr 1fr") + "padding-left: 1em;"} ) ) ),
                      companyDatomView( State, State.S.selectedEntity, 9040) 
                    ]) 
                    : d("Transaksjonen er ikke splittet")
                ])
              ]),
      ]),
  ], {class: "feedContainer"}),
  br(),
  d([
    h3("Brukerinput"),
    State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) === 8019 
    ? d([
      h3("Fri postering"),
      d( [7867, 7866, 1757, 1139, 1083, 7450].map( attribute => State.DB.get(attribute, "entity/entityType") === 42 ? entityAttributeView( State, State.S.selectedEntity, attribute ) : companyDatomView( State, State.S.selectedEntity, attribute) ) ),
      br(),
      State.Company.get(State.S.selectedEntity, 8355) ? d("🔒") : submitButton("Slett", e => State.Actions.retractEntity(State.S.selectedEntity) )
    ])
    : d( State.DB.get( State.DB.get( State.S.selectedEntity, "transaction/transactionType" ), 7942 ).map( inputAttribute => entityAttributeView( State, State.S.selectedEntity , inputAttribute ) ) ),
  ], {class: "feedContainer"}),
  d([
    h3("Transaksjosoutput"),
    d([
      companyDatomView( State, State.S.selectedEntity,  8748),
      isNumber( State.DB.get( State.S.selectedEntity, 7450)   ) ? companyDatomView( State, State.S.selectedEntity,  8749) : d("")
    ])
  ], {class: "feedContainer"})
])

let categorizePaymentView = State => d([
  d([
    h3(`Kostnad`),
    d( State.Company.getBalanceObjects( 8743 ).map(  selectedCostNode => nodeLabel( State, selectedCostNode, undefined, () => State.Actions.postDatoms([
      newDatom( State.S.selectedEntity, "transaction/transactionType", 8954 ),
      newDatom( State.S.selectedEntity, "transaction/destinationNode", selectedCostNode ),
    ]) ) ) ),
  ]),
  br(),
  d([
    h3(`Kjøp av verdipapir`),
    d([
      d( State.Company.getBalanceObjects( 8738 ).map(  security => nodeLabel( State, security, undefined, () => State.Actions.postDatoms([
        newDatom( State.S.selectedEntity, "transaction/transactionType", 8908 ),
        newDatom( State.S.selectedEntity, "transaction/destinationNode", security ),
        newDatom( State.S.selectedEntity, 7450, 0 ),
      ]) ) ) ),
    ], {style:"display: inline-flex;"})
  ]),
  br(),
  d([
    h3(`Overføring`),
    d([
      d( State.Company.getBalanceObjects( [8742, 8739, 8737] ).map(  selectedDebtNode => nodeLabel( State, selectedDebtNode, undefined, () => State.Actions.postDatoms([
        newDatom( State.S.selectedEntity, "transaction/transactionType", 8955 ),
        newDatom( State.S.selectedEntity, "transaction/destinationNode", selectedDebtNode ),
      ]) ) ) ),
    ], {style:"display: inline-flex;"})
  ]),
  br(),
  d([
    h3(`Utbytte`),
    d([
      d( State.Company.getBalanceObjects( 7857 ).map(  selectedDebtNode => nodeLabel( State, selectedDebtNode, undefined, () => State.Actions.postDatoms([
        newDatom( State.S.selectedEntity, "transaction/transactionType", 8955 ),
        newDatom( State.S.selectedEntity, "transaction/destinationNode", selectedDebtNode ),
      ]) ) ) ),
    ], {style:"display: inline-flex;"})
  ]),
])

let  categorizeReceiptView = State => d([
  d([
    h3(`Inntekt`),
    d( State.Company.getBalanceObjects( 8745 ).map(  selectedCostNode => nodeLabel( State, selectedCostNode, undefined, () => State.Actions.postDatoms([
      newDatom( State.S.selectedEntity, "transaction/transactionType", 8974 ),
      newDatom( State.S.selectedEntity, "transaction/originNode", selectedCostNode ),
    ]) ) ) ),
  ]),
  br(),
  d([
    h3(`Salg av verdipapir`),
    d([
      d( State.Company.getBalanceObjects( 8738 ).map(  security => nodeLabel( State, security, undefined, async () => State.Actions.postDatoms([
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
      ])  ) ) )
    ], {style:"display: inline-flex;"})
  ]),
  br(),
  d([
    h3(`Overføring`),
    d([
      d( State.Company.getBalanceObjects( [8742, 8739, 8737] ).map(  selectedDebtNode => nodeLabel( State, selectedDebtNode, undefined, () => State.Actions.postDatoms([
        newDatom( State.S.selectedEntity, "transaction/transactionType", 8975 ),
        newDatom( State.S.selectedEntity, "transaction/originNode", selectedDebtNode ),
      ]) ) ) ),
    ], {style:"display: inline-flex;"})
  ])
], {class: "feedContainer"})

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

