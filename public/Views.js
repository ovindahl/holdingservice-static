//Action button

//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------

const ClientApp = {
  Actions: State => returnObj({
    selectPage: pageEntity => updateState( State, {S: mergerino({selectedPage: pageEntity, selectedEntity: undefined, selectedFilters: [] }) }),
    selectEntity: (entity, pageEntity) => updateState( State, {S: mergerino({selectedEntity: entity}, isDefined(pageEntity) ? {selectedPage: pageEntity, selectedFilters: []} : {}) }),
    selectEventIndex: eventIndex => updateState( State, {S:  {selectedEventIndex: eventIndex, selectedAccountingYear: Database.get( Database.get(State.S.selectedCompany, 12783)(eventIndex), 10542)} }),
    selectAccountingYear: accountingYear => updateState( State, {S: {selectedAccountingYear: accountingYear, selectedEntity: undefined } }),
    addFilter: newFilter => updateState( State, {S: {selectedFilters: State.S.selectedFilters.concat( newFilter ) } }),
    removeFilter: removedFilter => updateState( State, {S: {selectedFilters: State.S.selectedFilters.filter( f => f !== removedFilter ) } }),
    removeFilters: () => updateState( State, {S: {selectedFilters: [] } } ),
    retractEntity: async entity => updateState( State, { DB: await Transactor.retractEntity(State.DB, entity), S: {selectedEntity: undefined } } ),
    selectCompany: company => updateState( State, { S: {selectedCompany: company, selectedEntity: undefined, selectedFilters: [] } } ),
    postDatoms: async newDatoms => {

      let updatedDB = await Transactor.postDatoms( State.DB, newDatoms)

      if( updatedDB !== null ){ updateState( State, {DB: updatedDB } ) }else{ log({ERROR: updatedDB}) }

    },
    createEvent: ( eventType, sourceEntity ) => {

      let basicDatoms = [
        newDatom( 'newEntity', 'entity/entityType', 10062 ),
        newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
        newDatom( 'newEntity', 10070, eventType ),
        newDatom( 'newEntity' , 'event/accountingYear', State.S.selectedAccountingYear ), 
        newDatom( 'newEntity' , 'entity/label', State.DB.get( eventType, 6 ) ), 
        newDatom( 'newEntity' , 1139, "" )
      ]

      let sourceEntityDatoms = isDefined(sourceEntity) ? [
        newDatom( 'newEntity', 1757, isDefined( State.DB.get( sourceEntity, 1757 )  ) 
          ? State.DB.get( sourceEntity, 1757 ) 
          :  State.DB.get( State.S.selectedAccountingYear, "accountingYear/lastDate" ) 
          ),
        State.DB.get( eventType, 7942 ).includes( 1083 )
          ? newDatom( 'newEntity' , 1083, isDefined( State.DB.get( sourceEntity, 1083 ) ) ? State.DB.get( sourceEntity, 1083 ) : 0  )
          : null,
      ].filter( Datom => Datom !== null ) : []

      let newEventDatoms = basicDatoms.concat( sourceEntityDatoms )


      State.Actions.createAndSelectEntity( newEventDatoms )

    },
    createEventFromSourceDocument: ( eventType, sourceDocument ) => {

      let basicDatoms = [
        newDatom( 'newEntity', 'entity/entityType', 10062 ),
        newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
        newDatom( 'newEntity', 10070, eventType ),
        newDatom( 'newEntity' , 'event/accountingYear', State.DB.get( sourceDocument, 7512 ) ), 
        newDatom( 'newEntity' , 1757, State.DB.get( State.DB.get( sourceDocument, 7512 ), "accountingYear/lastDate" )  ), 
        newDatom( 'newEntity' , 'entity/label', State.DB.get( eventType, 6 ) ), 
        newDatom( 'newEntity' , 1139, "" ),
        newDatom( 'newEntity' , 11477, sourceDocument ),
      ]

      State.Actions.createAndSelectEntity( basicDatoms )

    },
    createSourceDocument: sourceDocumentType => State.Actions.createAndSelectEntity( [
      newDatom( 'newEntity', 'entity/entityType', 11472 ),
      newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
      newDatom( 'newEntity', 11688, sourceDocumentType ),
      newDatom( 'newEntity', 1757, State.DB.get( State.S.selectedAccountingYear, "accountingYear/lastDate" ) ),
      newDatom( 'newEntity' , 6, 'Bilagsdokument uten navn' ), 
      newDatom( 'newEntity' , 1139, '' ), 
      newDatom( 'newEntity' , 7512, 7407), 
    ] ),
    createActor: actorType => State.Actions.createAndSelectEntity( [
      newDatom( 'newEntity', 'entity/entityType', 7979 ),
      newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ),  
      newDatom( 'newEntity' , "actor/actorType", actorType ),  
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


let constructBankTransactionSourceDocumentDatoms = ( State, transactionRow, index, selectedBank, sourceDocument) => {

  //NB: Denne brukes av entitet 11693: Datomer for import av banktransaksjoner

  let parseDNBamount = stringAmount => Number( stringAmount.replaceAll(".", "").replaceAll(",", ".") ) 
          
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



  let Datoms = [
    newDatom( "newDatom_"+ index, "entity/entityType", 10062  ),
    newDatom( "newDatom_"+ index, "entity/company", State.S.selectedCompany  ),
    newDatom( "newDatom_"+ index, 10070, isPayment ? 13186 : 13187  ),
    newDatom( "newDatom_"+ index, 'event/accountingYear', State.DB.get( sourceDocument, 7512 ) ),
    newDatom( "newDatom_"+ index, 1757, date  ),
    newDatom( "newDatom_"+ index, 1083, isPayment ? paidAmount : receivedAmount  ),
    newDatom( "newDatom_"+ index, 8831, description  ),
    newDatom( "newDatom_"+ index, "bankTransaction/referenceNumber", referenceNumber  ),
    newDatom( "newDatom_"+ index, "entity/selectSourceDocument", sourceDocument ),
    newDatom( "newDatom_"+ index, "entity/label", isPayment ? `[${moment(date).format('DD/MM/YYYY')}] Utbetaling fra bank på NOK ${paidAmount}` : `[${transactionRow[0]}] Innbetaling til bank på NOK ${receivedAmount}` ).replaceAll(`"`, `'`),
    newDatom( "newDatom_"+ index, 1139, "" ),
    newDatom( "newDatom_"+ index, 12377, false ),
  ]

  return Datoms

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
      dropdown(State.S.selectedCompany, 
        State.DB.get(State.S.selectedUser, "user/isAdmin")
          ? State.DB.getAll(5722).map( company => returnObj({value: company, label: State.DB.get(company, "entity/label")  })  )
          : State.DB.get(State.S.selectedUser, "user/companies").map( entity => returnObj({value: entity, label: State.DB.get(entity, "entity/label")  })  ), 
        e => State.Actions.selectCompany( Number( submitInputValue(e) ) ))
      ]),
      d([dropdown(State.S.selectedAccountingYear, State.DB.get(null, 10061).map( entity => returnObj({value: entity, label: getEntityLabel( State.DB, entity )  })  ), e => State.Actions.selectAccountingYear( Number( submitInputValue(e) ) ))]),
  ], {style: "padding: 1em;"}),
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

let sidebarCreateButton = State => State.S.selectedPage === 11974
  ? createEventButton( State )
  : State.S.selectedPage === 11474
    ? createSourceDocumentButton( State )
    : State.S.selectedPage === 7977
      ? createActorButton( State )
      : d("")
  
  
  

let createEventButton = State => d([
  d( "Ny hendelse 📅", {style: "padding:1em; margin-left:2em; background-color: #79554852;"}),
    d([
      isDefined( State.S.selectedEntity )
        ? d([
            d("Kopierer dato og beløp fra:"),
            entityLabelWithPopup( State, State.S.selectedEntity )
        ])
        : d(""),
      br(),
      d("Velg hendelsestype:"),
      d(State.DB.getAll( 10063   ).map( entity =>State.DB.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).map( category => d([
        h3(category),
        d(State.DB.getAll(10063).filter( e => State.DB.get(e, "entity/category") === category ).sort( (a,b) => a-b ).map( eventType => entityLabelWithPopup( State, eventType, () => State.Actions.createEvent( eventType, State.DB.get( State.S.selectedEntity, 19 ) === 10062 ? State.S.selectedEntity : undefined ) ) ) ),
      ])  ) ),
    ], {class: "createButtonPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
    
], {class: "createButtonPopupContainer", style:"display: inline-flex;"})

let createEventFromSourceDocumentButton = State => d([
  d( "Ny hendelse basert på bilaget 📅", {style: "padding:1em; margin-left:2em; background-color: #79554852;"}),
    d([
      d("Velg hendelsestype:"),
      d(State.DB.getAll( 10063   ).map( entity =>State.DB.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).map( category => d([
        h3(category),
        d(State.DB.getAll(10063).filter( e => State.DB.get(e, "entity/category") === category ).sort( (a,b) => a-b ).map( eventType => entityLabelWithPopup( State, eventType, () => State.Actions.createEventFromSourceDocument( eventType, State.S.selectedEntity ) ) ) ),
      ])  ) ),
    ], {class: "createButtonPopup_right", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
    
], {class: "createButtonPopupContainer_right", style:"display: inline-flex;"})

let createSourceDocumentButton = State => d([
  d( "Nytt bilag 🗃️", {style: "padding:1em; margin-left:2em; background-color: #79554852;"}),
  d([
    d(State.DB.getAll( 11686   ).map( entity =>State.DB.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).map( category => d([
      h3(category),
      d(State.DB.getAll(11686).filter( e => State.DB.get(e, "entity/category") === category ).sort( (a,b) => a-b ).map( sourceDocumentType => entityLabelWithPopup( State, sourceDocumentType, () => State.Actions.createSourceDocument( sourceDocumentType ) ) ) ),
    ])  ) ),
  ], {class: "createButtonPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
], {class: "createButtonPopupContainer", style:"display: inline-flex;"})

let createActorButton = State => d([
  d( "Ny aktør 📘", {style: "padding:1em; margin-left:2em; background-color: #79554852;"}),
    d( 
      State.DB.getAll(8665).map( actorType => entityLabelWithPopup( State, actorType, () => State.Actions.createActor( actorType ) )  ), 
      {class: "createButtonPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}
    ),
], {class: "createButtonPopupContainer", style:"display: inline-flex;"})

let navBarView = (State) => d([
  d([
    d([
      d([entityLabelWithPopup( State, State.S.selectedPage, () => State.Actions.selectEntity( undefined ) )]),
        isUndefined( State.S.selectedEntity ) 
          ? d("") 
          : State.S.selectedPage === 11974
            ? d([
                dropdown( State.S.selectedEntity, State.DB.get( State.S.selectedCompany, 10073  ).filter( event => Database.get(event, 12986) === State.S.selectedAccountingYear  ).map( e => returnObj({value: e, label: getEntityLabel( State.DB, e ) }) ), e => State.Actions.selectEntity( Number( submitInputValue(e) ) )  ),
                prevNextEventView( State ),
              ], {style: gridColumnsStyle("5fr 1fr")}) 
            : entityLabelWithPopup( State, State.S.selectedEntity ),
    ], {style: "display: inline-flex;"}),
    sidebarCreateButton( State ),

  ], {style: gridColumnsStyle("5fr 1fr")})
  
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
    h3( getEntityLabel( State.DB, State.S.selectedPage) ),
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
  d("Innlevering av skattemelding med vedlegg: 31. mai 2021"),
  d("Godkjenning av årsregnskapet: Innen seks måneder etter regnskapsårets slutt, senest 30. juni 2021"),
  d("Innsending av årsregnskapet: Innen en måned etter fastsetting av årsregnskapet, og senest 31. juli 2021"),
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



//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
