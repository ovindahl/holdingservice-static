//Action button

//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------

// CLIENT PAGE VIEWS

let navBarView = (State) => d([
      entityLabelWithPopup( State, 9951, () => State.Actions.selectPage( 9951 ) ),
      State.S.selectedPage === 9951 ? d("") : span( " / " ),
      State.S.selectedPage === 9951 ? d("") : entityLabelWithPopup( State, State.S.selectedPage, () => State.Actions.selectEntity( undefined ) ),
], {class: "feedContainer"})

let clientPage = State => {

  if(State.S.isError){return d(State.S.error) }
  if(isUndefined(State.DB)){return d("Laster..") }


  let pageRouter = {
    "9951": homeView,
    "7509": accountingYearsView,
    "7860": balanceObjectsView,
    "7882": transactionsView,
    "7977": actorsView,
    "9338": graphView,
    "10025": adminPage
  }
  
  return d([
    d([d('<header><h1>Holdingservice Beta</h1></header>'),d([
      d([dropdown(State.S.selectedCompany, State.DB.getAll( 5722 ).map( company => returnObject({value: company, label: State.DB.get(company, "entity/label")  })  ), e => State.Actions.selectCompany( Number( submitInputValue(e) ) ))]),
    ], {style: "display:flex;"} ),], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
    d([
      d(""),
      d([
        stateView( State ),
        d([
          navBarView( State ),
          br(),
          d([
            isDefined(pageRouter[ State.S.selectedPage ])
            ? pageRouter[ State.S.selectedPage ]( State ) 
            : WIPpageview( State )
          ], {class: "feedContainer"} )
        ])
      ])
    ], {class: "pageContainer"})
    
  ])
}

let homeView = State => d([
  h3("Sider i applikasjonen"),
  d(State.DB.getAll( 7487  ).map( entity =>State.DB.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).map( category => d([
    h3(category),
    d(State.DB.getAll(7487).filter( e => State.DB.get(e, "entity/category") === category ).sort( (a,b) => a-b ).map( entity => d([
      entityLabelWithPopup( State, entity, () => State.Actions.selectPage(entity) ),
      d( State.DB.get(entity, 7) )
    ], {style: gridColumnsStyle("1fr 3fr")})  ) ),
  ])  ) )
])


let stateView = State => {

  let companyTransactions = getAllTransactions( State.DB, State.S.selectedCompany )

  let allAccountingYears = getAllAccountingYears( State.DB, State.S.selectedCompany )
  let currentAccontingYearIndex = allAccountingYears.findIndex( a => a === State.S.selectedAccountingYear )
  let prevAccountingYear = allAccountingYears[ currentAccontingYearIndex - 1 ]
  let nextAccountingYear = allAccountingYears[ currentAccontingYearIndex + 1 ]
  
  return d([
    d([
      h3("Adminpanel"),
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
      submitButton("Oppdatter kalkulerte verdier", () => State.Actions.selectCompany( State.S.selectedCompany ) ),
      br(),
      submitButton("Slett alle transaksjoner i siste regnskapsår", () => State.Actions.retractEntities( getAllTransactions(State.DB, State.S.selectedCompany, getAllAccountingYears(State.DB, State.S.selectedCompany).slice(-1)[0] )  ) )
    ])
  ], {class: "feedContainer"})
} 

let WIPpageview = State => d([
  h3( State.DB.get(State.S.selectedPage, 6) ),
  d( State.DB.get(State.S.selectedPage, 7) ),
  br(),
  d("Siden er ikke klar.")
])

//Page views

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




//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
