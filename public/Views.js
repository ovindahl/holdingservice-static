//Action button

//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------

const ClientApp = {
  Actions: State => returnObject({
    selectPage: pageEntity => updateState( State, {S: mergerino({selectedPage: pageEntity, selectedEntity: undefined, selectedFilters: [] }, isDefined( Components.find( Component => Component.entity === pageEntity ) ) ? Components.find( Component => Component.entity === pageEntity ).onLoad( State ) : {}) }),
    selectEntity: (entity, pageEntity) => updateState( State, {S: mergerino({selectedEntity: entity}, isDefined(pageEntity) ? {selectedPage: pageEntity, selectedFilters: []} : {}) }),
    selectEventIndex: eventIndex => updateState( State, {S:  {selectedEventIndex: eventIndex, selectedAccountingYear: Database.get( Database.get(State.S.selectedCompany, 12783)(eventIndex), 10542)} }),
    selectAccountingYear: accountingYear => updateState( State, {S: {selectedAccountingYear: accountingYear, selectedEventIndex: Database.get( State.DB.get( State.S.selectedCompany, 11976 )( accountingYear ).filter( event => State.DB.get( event, 11975 ) <= State.DB.get( State.S.selectedCompany, 12385 ) ).slice(-1)[0], 11975 )  } }),
    addFilter: newFilter => updateState( State, {S: {selectedFilters: State.S.selectedFilters.concat( newFilter ) } }),
    removeFilter: removedFilter => updateState( State, {S: {selectedFilters: State.S.selectedFilters.filter( f => f !== removedFilter ) } }),
    removeFilters: () => updateState( State, {S: {selectedFilters: [] } } ),
    retractEntity: async entity => updateState( State, { DB: await Transactor.retractEntity(State.DB, entity), S: {selectedEntity: undefined } } ),
    selectCompany: company => updateState( State, { S: {selectedCompany: company, selectedEntity: undefined, selectedFilters: [] } } ),
    postDatoms: async newDatoms => {

      let updatedDB = await Transactor.postDatoms( State.DB, newDatoms)

      if( updatedDB !== null ){ updateState( State, {DB: updatedDB } ) }else{ log({ERROR: updatedDB}) }

      


      
    },
    createEvent: eventType => State.Actions.createAndSelectEntity( [
      newDatom( 'newEntity', 'entity/entityType', 10062 ),
      newDatom( 'newEntity', "sourceDocument/date", Date.now() ),
      newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
      newDatom( 'newEntity', 'sourceDocument/sourceDocumentType', eventType ),
    ] ),
    createSourceDocument: sourceDocumentType => State.Actions.createAndSelectEntity( [
      newDatom( 'newEntity', 'entity/entityType', 11472 ),
      newDatom( 'newEntity', "sourceDocument/sourceDocumentType", sourceDocumentType ),
      newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
      newDatom( 'newEntity' , 6, 'Bilagsdokument uten navn' ), 
      newDatom( 'newEntity' , 1139, '' ), 
      newDatom( 'newEntity' , 7512, 7407), 
    ] ),
    createActor: actorType => State.Actions.createAndSelectEntity( [
      newDatom( 'newEntity', 'entity/entityType', 7979 ),
      newDatom( 'newEntity' , "actor/actorType", actorType ),  
      newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ),  
      newDatom( 'newEntity' , 6, 'Aktør uten navn' )
    ] ),
    createAndSelectEntity: async newDatoms => {

      if( newDatoms.every( Datom => Datom.entity === newDatoms[0].entity ) ){
        let updatedDB = await Transactor.postDatoms( State.DB, newDatoms)
        let newEntity = updatedDB.Entities.slice( -1 )[0].entity
        updateState( State, {DB: updatedDB, S: { selectedEntity: newEntity, selectedPage: updatedDB.get( updatedDB.get(newEntity, 19), 7930) } } )
      }else{ log({ERROR: "createAndSelectEntity: Received datoms refer to > 1 entity"}) }

      
    }
  })
}



// CLIENT PAGE VIEWS

let publicPage = () => d([
  d([d('<header><h1>Holdingservice Beta</h1></header>')], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
  d([
    d(""),
    d([
      d("Ikke logget inn. "),
      br(),
      submitButton("Logg inn eller registrer ny bruker.", () => sideEffects.auth0.loginWithRedirect({redirect_uri: window.location.origin}) )
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



  let entityErrorView = (State, error) => d([
    h3("Oops!"),
    d("Det har skjedd en feil."),
    br(),
    d("Entitet: " + State.S.selectedEntity),
    br(),
    d( String(error) )
  ])
      


let activeUserPage = State => {


  let pageRouter = {
    "9951": overviewPageView,

    "7860": balanceObjectsView,
    "7882": transactionsView,
    "11474": sourceDocumentsView,
    "7977": actorsView,
    "10464": reportView,
    "11974": eventPageView,

    "10025": adminPage,
    "9338": graphView,
  }
  
  return d([
    d([d('<header><h1>Holdingservice Beta</h1></header>')], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
    d([
      leftSidebar( State ),
      d([
        navBarView( State ),
        br(),
        d([
          isDefined(pageRouter[ State.S.selectedPage ])
          ? pageRouter[ State.S.selectedPage ]( State ) 
          : WIPpageview( State )
        ], {class: "feedContainer"} )
      ])
    ], {class: "pageContainer"})
    
    
  ])
}

let leftSidebar = State => d([
  d([
    d([
      d("Valgt selskap:"),
      d([
        dropdown(State.S.selectedCompany, 
          State.DB.get(State.S.selectedUser, "user/isAdmin")
            ? State.DB.getAll(5722).map( company => returnObject({value: company, label: State.DB.get(company, "entity/label")  })  )
            : State.DB.get(State.S.selectedUser, "user/companies").map( entity => returnObject({value: entity, label: State.DB.get(entity, "entity/label")  })  ), 
          e => State.Actions.selectCompany( Number( submitInputValue(e) ) ))
        ]),
    ], {style: gridColumnsStyle("1fr 1fr")}),
    d([
      d("Valgt år:"),
      d([dropdown(State.S.selectedAccountingYear, State.DB.get(null, 10061).map( entity => returnObject({value: entity, label: State.DB.get(entity, "entity/label")  })  ), e => State.Actions.selectAccountingYear( Number( submitInputValue(e) ) ))]),
    ], {style: gridColumnsStyle("1fr 1fr")}),
  ]),
  d( [9951, 11974, 11474, 7977, 7860, 7882, 10464, 10035, 10025]
      .filter( pageEntity => State.DB.get(State.S.selectedUser, "user/isAdmin") ? true : !State.DB.get( pageEntity, 12506  ) )
      .map( entity => d([
          d( State.DB.get(entity, 6), {class: "sidebarButton", style: `${ State.S.selectedPage === entity ? "color: blue;" : "" }` }, "click", () => State.Actions.selectPage( entity ) ),
          br(),
  ])  ) ),
  br(),
  br(),
  br(),
  submitButton("Logg ut", () => sideEffects.auth0.logout({redirect_uri: window.location.origin}) )
  
])

let sidebarCreateButton = State => d([
  d([
    d( "Legg til", {style: "padding:1em; margin-left:2em; background-color: red; color: white;"}),
    d([
      d([
        h3("Hendelse:"),
        d( State.DB.getAll(10063).map( eventType => entityLabelWithPopup( State, eventType, () => State.Actions.createEvent(eventType) )  ) ),
    ], {class: "feedContainer"}),
    d([
      h3("Bilag"),
      d( State.DB.getAll( 11686 ).map( sourceDocumentType => entityLabelWithPopup( State, sourceDocumentType, () => State.Actions.createSourceDocument( sourceDocumentType ) )  ) ),
    ], {class: "feedContainer"}),
    d([
      h3("Opprett aktør:"),
      d( State.DB.getAll(8665).map( actorType => entityLabelWithPopup( State, actorType, () => State.Actions.createActor( actorType ) )  )  ),
    ], {class: "feedContainer"})
    ], {class: "createButtonPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
  ], {class: "createButtonPopupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"} )

let navBarView = (State) => d([
  d([
    d([
      d([entityLabelWithPopup( State, State.S.selectedPage, () => State.Actions.selectEntity( undefined ) )]),
        isUndefined( State.S.selectedEntity ) 
          ? d("") 
          : d([
              span( " / " ),
              State.S.selectedPage === 11974
                ? dropdown( State.S.selectedEntity, State.DB.get( State.S.selectedCompany, 11976 )( State.S.selectedAccountingYear ).map( e => returnObject({value: e, label: getEntityLabel( State.DB, e ) }) ), e => State.Actions.selectEntity( Number( submitInputValue(e) ) )  )
                : entityLabelWithPopup( State, State.S.selectedEntity )
            ]),
    ], {style: "display: inline-flex;"}),
    sidebarCreateButton( State ),

  ], {style: gridColumnsStyle("7fr 1fr")})
  
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
  d([
    h3("Oppgaver"),
  d([
    d([
      d( "Oppgave" ),
      d( "Status?" ),
      d( "Tilknyttet side" ),
    ], {style: gridColumnsStyle("3fr 1fr 1fr")}),
  ], {class: "feedContainer"}),
    d( State.DB.get( State.S.selectedCompany  , 12158).map(  task => d([
      d( State.DB.get( task, 6 ) ),
      boolView( State, task, 12155 ),
      entityLabelWithPopup( State, 11474, () => State.Actions.selectEntity( undefined, 11474 ) )
    ], {style: gridColumnsStyle("3fr 1fr 1fr")}) ), {class: "feedContainer"} )
  ]),
  br(),
  h3("Frister"),
  d("TBD"),
  br(),
  h3("Kundeservice"),
  d("TBD"),
])


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
    col: 1,
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
