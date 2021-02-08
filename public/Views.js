//Action button

//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------

const ClientApp = {
  initial: DB => returnObject({
    selectedCompany: 6829, 
    selectedPage: 7882,
  }),
  Actions: State => returnObject({
    selectPage: pageEntity => updateState( State, {S: {selectedPage: pageEntity, selectedEntity: undefined}}),
    selectEntity: entity => updateState( State, {S: {selectedEntity: entity}}),
    selectCompany: (company) => updateState( State, {
      DB: State.DB,
      S: { selectedCompany: company, selectedPage: 7882, selectedEntity: undefined, selectedCompanyEventIndex: getAllTransactions(State.DB, company).length, selectedAccountingYear: State.DB.get(company, 10061).slice(-1)[0] }
    } ),
    postDatoms: async newDatoms => updateState( State, {DB: await Transactor.postDatoms( State.DB, newDatoms) } )
  })
}

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
    "10038": bankImportView,
    "7977": actorsView,
    "9338": graphView,
    "10025": adminPage,
    "10072": sourceDocumentsView,
    //"10041": sharePurchaseView,
  }
  
  return d([
    d([d('<header><h1>Holdingservice Beta</h1></header>')], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
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
  d(State.DB.getAll( 7487  ).filter( page => ![9951, 9338, 10025].includes(page) ).map( entity =>State.DB.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).map( category => d([
    h3(category),
    d(State.DB.getAll(7487).filter( e => State.DB.get(e, "entity/category") === category ).sort( (a,b) => a-b ).map( entity => d([
      entityLabelWithPopup( State, entity, () => State.Actions.selectPage(entity) ),
      d( State.DB.get(entity, 7) )
    ], {style: gridColumnsStyle("1fr 3fr")})  ) ),
  ])  ) )
])


let stateView = State => {

  
  return d([
    d([
      h3("Adminpanel"),
      d([
        entityLabelWithPopup( State, 5722),
        isDefined( State.S.selectedCompany ) ? entityLabelWithPopup( State, State.S.selectedCompany ) : d(" MANGLER "),
        d([dropdown(State.S.selectedCompany, State.DB.getAll( 5722 ).map( company => returnObject({value: company, label: State.DB.get(company, "entity/label")  })  ), e => State.Actions.selectCompany( Number( submitInputValue(e) ) ))]),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")} ),,
      d([
        entityLabelWithPopup( State, 7927),
        isDefined( State.S.selectedPage ) ? entityLabelWithPopup( State, State.S.selectedPage ) : d(" MANGLER "),
        submitButton( "Gå til adminsiden", () => State.Actions.selectPage(10025) )
      ], {style: gridColumnsStyle("repeat(3, 1fr)")} ),
      d([
        entityLabelWithPopup( State, 7928),
        isDefined( State.S.selectedEntity ) ? entityLabelWithPopup( State, State.S.selectedEntity ) : d(" - "),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
      br(),
      submitButton("Slett alle transaksjoner i siste regnskapsår", () => State.Actions.retractEntities( State.DB.get( State.DB.get(State.S.selectedCompany, 10061).slice(-1)[0], 9715) )  )
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

  let allTransactions = State.DB.get( State.S.selectedCompany , 9817)
  

  let selectedTransaction = allTransactions.find( t => State.DB.get(t, 8354) === State.S.selectedCompanyEventIndex  )

  let nodes = State.DB.get( State.S.selectedCompany , 10052)().map( e => returnObject({data: {
    id: String(e), 
    label: State.DB.get(e, 6),
    col: State.DB.get(e, 8768) === 7538
      ? 1
      : State.DB.get(e, 8768) === 7539
        ? 2
        : State.DB.get(e, 7934) === 8744 || State.DB.get(e, 7934) === 8745
          ? 3
          : State.DB.get(e, 7934) === 8737
            ? 4
            : State.DB.get(e, 8768) === 7537
              ? 5
              : 6,
      weight: 50,
      color: "black"
  } }  ) )
  let edges = allTransactions
    .filter( t => isNumber( State.DB.get(t, "transaction/originNode") ) && isNumber( State.DB.get(t, "transaction/destinationNode") )   )
    .map( t => returnObject({data: {
      id: String(t), 
      source: String( State.DB.get(t, "transaction/originNode") ), 
      target: String( State.DB.get(t, "transaction/destinationNode") ),
      label: t === selectedTransaction ? formatNumber( State.DB.get(t, 8748), 0 ) : "",
      weight: 3 + State.DB.get(t, 8748) / 1000000
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
