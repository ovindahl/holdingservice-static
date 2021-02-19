//Action button

//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------

const ClientApp = {
  Actions: State => returnObject({
    selectPage: pageEntity => updateState( State, {S: mergerino({selectedPage: pageEntity, selectedEntity: undefined}, isDefined( Components.find( Component => Component.entity === pageEntity ) ) ? Components.find( Component => Component.entity === pageEntity ).onLoad( State ) : {}) }),
    selectEntity: (entity, pageEntity) => updateState( State, {S: mergerino({selectedEntity: entity}, isDefined(pageEntity) ? {selectedPage: pageEntity} : {}) }),
    retractEntity: async entity => updateState( State, { DB: await Transactor.retractEntity(State.DB, entity), S: {selectedEntity: undefined } } ),

    selectSourceDocument: sourceDocument => updateState( State, {S: {selectedEntity: sourceDocument, selectedPage: State.DB.get( State.DB.get(sourceDocument, 10070), 7930) }}), 
    selectCompany: company => updateState( State, {
      DB: State.DB,
      S: {selectedCompany: company, selectedPage: 7882, selectedEntity: undefined} 
    } ),
    postDatoms: async newDatoms => updateState( State, {DB: await Transactor.postDatoms( State.DB, newDatoms) } ),
  })
}



// CLIENT PAGE VIEWS

let publicPage = () => d([
  d([d('<header><h1>Holdingservice Beta</h1></header>')], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
  d([
    d(""),
    d([
      d("Ikke logget inn eller registrer ny bruker"),
      br(),
      submitButton("Logg inn", () => sideEffects.auth0.loginWithRedirect({redirect_uri: window.location.origin}) )
    ], {class: "feedContainer"})
  ], {class: "pageContainer"})
]) 

let loadingPage = () => d([
  d([d('<header><h1>Holdingservice Beta</h1></header>')], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
  d([
    d(""),
    d([
      d("Laster..."),
    ], {class: "feedContainer"})
  ], {class: "pageContainer"})
]) 



let clientPage = State => isUndefined(State.DB)
    ? loadingPage( )
    : isDefined( State.S.selectedUser )
      ? activeUserPage( State )
      : notActivatedUserPage( State )




let activeUserPage = State => {


  let pageRouter = {
    "9951": overviewPageView,

    "7860": balanceObjectsView,
    "7882": transactionsView,
    "11474": sourceDocumentsView,
    "7977": actorsView,
    "10464": reportView,

    "10038": bankImportView,

    "7509": accountingYearsView,
    "10041": sharePurchaseView,
    "10039": operatingCostView,
    "11349": paymentsView,
    "10040": interestView,
    "10042": manualTransactionsView,
    "10036": dividendsView,

    /* "7509": eventPageView,
    "10041": eventPageView,
    "10039": eventPageView,
    "11349": eventPageView,
    "10040": eventPageView,
    "10042": eventPageView,
    "10036": eventPageView, */
    
    "10025": adminPage,
    "9338": graphView,
  }
  
  return d([
    d([d('<header><h1>Holdingservice Beta</h1></header>')], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
    d([
      d(""),
      d([
        State.DB.get(State.S.selectedUser, "user/isAdmin")
          ? adminPanelView( State )
          : d(""),
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


let eventPageView = State => isDefined( State.S.selectedEntity) 
  ? singleEventView( State )
  : multipleEventsView( State )

let singleEventView = State => d([
  submitButton( " <---- Tilbake ", () => State.Actions.selectEntity(  undefined )  ),
  br(),
  entityAttributeView(State, State.S.selectedEntity, 10070, true ),
  entityAttributeView(State, State.S.selectedEntity, 11477, State.DB.get(State.S.selectedEntity, 10401) ),
  entityAttributeView(State, State.S.selectedEntity, 1757, State.DB.get(State.S.selectedEntity, 10401) ),
  br(),
  d( State.DB.get( State.DB.get( State.S.selectedEntity, 10070 ), 7942).map( attribute => entityAttributeView(State, State.S.selectedEntity, attribute, State.DB.get(State.S.selectedEntity, 10401) ) ) ),
  br(),
  d( State.DB.get( State.DB.get( State.S.selectedEntity, 10070 ), 10433).map( calculatedField => entityAttributeView(State, State.S.selectedEntity, calculatedField, true ) ) ),
  br(),
  d( State.DB.get(State.S.selectedEntity, 10402).map( transaction => transactionFlowView( State, transaction) ) ),
  eventActionsView( State, State.S.selectedEntity ),
])



let multipleEventsView = State => d([
  h3( State.DB.get(State.S.selectedPage, 6) ),
  d([
    d([
      d(""),
      entityLabelWithPopup( State, 1757 ),
      entityLabelWithPopup( State, 10070 ),
      entityLabelWithPopup( State, 10401 ),
      d("")
  ], {style: gridColumnsStyle("2fr 1fr 2fr 1fr 1fr")}),
  d( State.DB.get( State.S.selectedCompany, 10073 )
      .filter( event => State.DB.get( State.DB.get(event, 10070 ), 7930) === State.S.selectedPage   )
      .map( event => d([
      entityLabelWithPopup( State, event ),
      lockedSingleValueView( State, event, 1757 ),
      lockedSingleValueView( State, event, 10070 ),
      d(State.DB.get(event, 10401) ? "✅" : "🚧"),
      submitButton( "Vis", () => State.Actions.selectEntity(  event, State.DB.get( State.DB.get(event, 10070 ), 7930) ) )
  ], {style: gridColumnsStyle("2fr 1fr 2fr 1fr 1fr")}) )),
  ], {class: "feedContainer"}),
  br(),
  d([
    h3("Handlinger"),
    d( State.DB.get( State.S.selectedPage, 11956).map( action =>  eventActionButton( State, State.S.selectedCompany, action ) )  )
  ], {class: "feedContainer"}) 
]) 





let navBarView = (State) => d([
  d([
    d([
      d([entityLabelWithPopup( State, 9951, () => State.Actions.selectPage( 9951 ) )]),
        State.S.selectedPage === 9951 
          ? d("") 
          : d([
              span( " / " ),
              entityLabelWithPopup( State, State.S.selectedPage, () => State.Actions.selectEntity( undefined ) )
            ]),
        isUndefined( State.S.selectedEntity ) 
          ? d("") 
          : d([
              span( " / " ),
              entityLabelWithPopup( State, State.S.selectedEntity )
            ]),
    ], {style: "display: inline-flex;"}),
    d([
      d([dropdown(State.S.selectedCompany, State.DB.get(State.S.selectedUser, "user/companies").map( company => returnObject({value: company, label: State.DB.get(company, "entity/label")  })  ), e => State.Actions.selectCompany( Number( submitInputValue(e) ) ))]),
      d([
        entityLabelWithPopup( State, State.S.selectedUser ),
        submitButton("Logg ut", () => sideEffects.auth0.logout({redirect_uri: window.location.origin}) )
      ])
    ], {style: "display: inline-flex;"})

  ], {style: gridColumnsStyle("3fr 1fr")})
  
], {class: "feedContainer"})

let notActivatedUserPage = State => d([
  d([d('<header><h1>Holdingservice Beta</h1></header>')], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
  d([
    d(`Logget inn som: ${State.S.userProfile.name}`),
    br(),
    d("Din brukerkonto er ikke aktivert."),
    br(),
    submitButton("Logg ut", () => sideEffects.auth0.logout() )
  ], {class: "feedContainer"})
])

let overviewPageView = State => d([
  h3("Sider i applikasjonen"),
  d(State.DB.getAll( 7487  ).filter( page => ![9951, 9338, 10025].includes(page) ).map( entity =>State.DB.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).map( category => d([
    h3(category),
    d(State.DB.getAll(7487).filter( e => State.DB.get(e, "entity/category") === category ).sort( (a,b) => a-b ).map( entity => d([
      entityLabelWithPopup( State, entity, () => State.Actions.selectPage(entity) ),
      d( State.DB.get(entity, 7) )
    ], {style: gridColumnsStyle("1fr 3fr")})  ) ),
  ])  ) )
])


let adminPanelView = State => {

  
  return d([
    d([
      h3("Adminpanel"),
      d([
        entityLabelWithPopup( State, 5612),
        isDefined( State.S.selectedUser ) ? entityLabelWithPopup( State, State.S.selectedUser ) : d(" MANGLER ")
      ], {style: gridColumnsStyle("repeat(3, 1fr)")} ),,
      d([
        entityLabelWithPopup( State, 5722),
        isDefined( State.S.selectedCompany ) ? entityLabelWithPopup( State, State.S.selectedCompany ) : d(" MANGLER "),
        d([dropdown(State.S.selectedCompany, State.DB.get(State.S.selectedUser, "user/companies").map( company => returnObject({value: company, label: State.DB.get(company, "entity/label")  })  ), e => State.Actions.selectCompany( Number( submitInputValue(e) ) ))]),
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
      d([
        entityLabelWithPopup( State, 7929),
        isDefined( State.S.selectedTransactionIndex ) ? d( `${State.S.selectedTransactionIndex} / ${State.DB.get( State.S.selectedCompany, 10069 )} `) : d(" - "),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
      d([
        entityLabelWithPopup( State, 9279),
        isDefined( State.S.selectedAccountingYear ) ? entityLabelWithPopup( State, State.S.selectedAccountingYear ) : d(" - "),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
      br(),
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
