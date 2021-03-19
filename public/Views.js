
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------



// CLIENT PAGE VIEWS

let header = () => d([d('<header><h1>Holdingservice Beta</h1></header>')], {style: "padding-left:3em; display:flex; justify-content: space-between;"})

let publicPage = () => d([
  header(),
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
  header(),
  d([
    d(""),
    d([
      d("Laster..."),
    ], {class: "feedContainer"})
  ], {class: "pageContainer"})
]) 

let isAdmin = State => State.DB.get(State.S.selectedUser, "user/isAdmin")

let clientPage = State => isUndefined(State.DB)
    ? loadingPage( )
    : isDefined( State.S.selectedUser )
      ? activeUserPage( State )
      : notActivatedUserPage( State )

let activeUserPage = State => {

  let pageRouter = {
    "9951": overviewPageView,
    "7860": balanceObjectsView,
    "11474": sourceDocumentsView,
    "7977": actorsView,
    "10464": reportView,
    "11974": eventPageView,
    "10025": adminPage,
  }
  
  return d([
    header(),
    d([
      leftSidebar( State ),
      d([
        //navBarView( State ),
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
      dropdown(State.S.selectedCompany, 
        isAdmin( State )
          ? State.DB.getAll(5722).map( company => returnObject({value: company, label: State.DB.get(company, "entity/label")  })  )
          : State.DB.get(State.S.selectedUser, "user/companies").map( entity => returnObject({value: entity, label: State.DB.get(entity, "entity/label")  })  ), 
        e => State.Actions.selectCompany( Number( submitInputValue(e) ) ))
      ]),
      d([dropdown(State.S.selectedAccountingYear, State.DB.get(null, 10061).map( entity => returnObject({value: entity, label: getEntityLabel( State.DB, entity )  })  ), e => State.Actions.selectAccountingYear( Number( submitInputValue(e) ) ))]),
  ], {style: "padding: 1em;"}),
  d( [9951, 11474, 11974, 7977, 7860, 10464, 10035, 10025]
      .filter( pageEntity => isAdmin( State ) ? true : !State.DB.get( pageEntity, 12506  ) )
      .map( entity => d([
          d( State.DB.get(entity, 6), {class: "sidebarButton", style: `${ State.S.selectedPage === entity ? "color: blue;" : "" }` }, "click", () => State.Actions.selectPage( entity ) ),
          br(),
  ])  ) ),
  br(),
  br(),
  br(),
  submitButton("Logg ut", () => sideEffects.auth0.logout({redirect_uri: window.location.origin}) )
  
])

let navBarView = (State) => d([
  d([
    d([
      d([entityLabelWithPopup( State, State.S.selectedPage, () => State.Actions.selectEntity( undefined ) )]),
        isUndefined( State.S.selectedEntity ) 
          ? d("") 
          : State.S.selectedPage === 11974
            ? d([
                dropdown( State.S.selectedEntity, State.DB.get( State.S.selectedCompany, 10073  ).filter( event => Database.get(event, 12986) === State.S.selectedAccountingYear  ).map( e => returnObject({value: e, label: getEntityLabel( State.DB, e ) }) ), e => State.Actions.selectEntity( Number( submitInputValue(e) ) )  ),
                prevNextEventView( State ),
              ], {style: gridColumnsStyle("5fr 1fr")}) 
            : entityLabelWithPopup( State, State.S.selectedEntity ),
    ], {style: "display: inline-flex;"}),
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
  h3( getEntityLabel( State.DB, State.S.selectedPage) ),
  d([
    h3("Frister"),
    d("Innlevering av skattemelding med vedlegg: 31. mai 2021"),
    d("Godkjenning av årsregnskapet i generalforsamling: Innen seks måneder etter regnskapsårets slutt, senest 30. juni 2021"),
    d("Innsending av årsregnskapet: Innen en måned etter fastsetting av årsregnskapet, og senest 31. juli 2021"),
  ], {class: "feedContainer"}),
  br(),
  d([
    h3("Chat med kundeservice"),
    State.DB.get( State.S.selectedCompany  , 13477 ).length === 0
      ? d( "Ingen meldinger" )
      : d( State.DB.get( State.S.selectedCompany  , 13477 ).map(  message => d([
          d( `[${ formatDateWithTime( State.DB.get( message, 1757 ) )  }] ${ State.DB.get( State.DB.get( message, 13472 ), 6 )}: ${State.DB.get( message, 13474 )}  `  )
        ]) ) ),
    br(),
    d([
      textArea("", {style: "width: 600px;", id:"chatTextInput" } ),
      submitButton("Send", () => State.Actions.submitUserMessage( document.getElementById("chatTextInput").value )  )
    ])
    
  ], {class: "feedContainer"}),
])

let WIPpageview = State => d([
  h3( State.DB.get(State.S.selectedPage, 6) ),
  d( State.DB.get(State.S.selectedPage, 7) ),
  br(),
  d("Siden er ikke klar.")
])



//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
