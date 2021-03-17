//Action button

//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------

const ClientApp = {
  Actions: State => returnObject({
    selectPage: pageEntity => updateState( State, {S: mergerino({selectedPage: pageEntity, selectedEntity: undefined, selectedFilters: [] }) }),
    selectEntity: (entity, pageEntity) => updateState( State, {S: mergerino({selectedEntity: entity}, isDefined(pageEntity) ? {selectedPage: pageEntity, selectedFilters: []} : {}) }),
    selectEventIndex: eventIndex => updateState( State, {S:  {selectedEventIndex: eventIndex, selectedAccountingYear: Database.get( Database.get(State.S.selectedCompany, 12783)(eventIndex), 10542)} }),
    selectAccountingYear: accountingYear => updateState( State, {S: {selectedAccountingYear: accountingYear, selectedEntity: undefined } }),
    addFilter: newFilter => updateState( State, {S: {selectedFilters: State.S.selectedFilters.concat( newFilter ) } }),
    removeFilter: removedFilter => updateState( State, {S: {selectedFilters: State.S.selectedFilters.filter( f => f !== removedFilter ) } }),
    removeFilters: () => updateState( State, {S: {selectedFilters: [] } } ),
    retractEntity: async entity => updateState( State, { DB: await Transactor.retractEntities(State.DB, [entity]), S: {selectedEntity: undefined } } ),
    selectCompany: company => updateState( State, { S: {selectedCompany: company, selectedEntity: undefined, selectedFilters: [] } } ),
    postDatoms: async newDatoms => {

      let updatedDB = await Transactor.postTransaction( State.DB, newDatoms)

      if( updatedDB !== null ){ updateState( State, {DB: updatedDB } ) }else{ log({ERROR: updatedDB}) }

    },
    createEvent: ( eventType, sourceEntity ) => {

      let basicDatoms = [
        newDatom( 'newEntity', 'entity/entityType', 10062 ),
        newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
        newDatom( 'newEntity', attrName( State.DB, 10070 ), eventType ),
        newDatom( 'newEntity' , 'event/accountingYear', State.S.selectedAccountingYear ), 
        newDatom( 'newEntity' , 'entity/label', State.DB.get( eventType, 6 ) ), 
        newDatom( 'newEntity' , attrName( State.DB, 1139 ), "" )
      ]

      let sourceEntityDatoms = isDefined(sourceEntity) ? [
        newDatom( 'newEntity', attrName( State.DB, 1757 ), isDefined( State.DB.get( sourceEntity, 1757 )  ) 
          ? State.DB.get( sourceEntity, 1757 ) 
          :  State.DB.get( State.S.selectedAccountingYear, "accountingYear/lastDate" ) 
          ),
        State.DB.get( eventType, 7942 ).includes( 1083 )
          ? newDatom( 'newEntity' , attrName( State.DB, 1083 ), isDefined( State.DB.get( sourceEntity, 1083 ) ) ? State.DB.get( sourceEntity, 1083 ) : 0  )
          : null,
      ].filter( Datom => Datom !== null ) : []

      let newEventDatoms = basicDatoms.concat( sourceEntityDatoms )


      State.Actions.createAndSelectEntity( newEventDatoms )

    },
    createEventFromEvent: ( eventType, sourceEntity ) => {

      let basicDatoms = [
        newDatom( 'newEntity', 'entity/entityType', 10062 ),
        newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
        newDatom( 'newEntity', attrName( State.DB, 10070 ), eventType ),
        newDatom( 'newEntity' , 'event/accountingYear', State.S.selectedAccountingYear ), 
        newDatom( 'newEntity' , 'entity/label', State.DB.get( eventType, 6 ) ), 
        newDatom( 'newEntity' , attrName( State.DB, 1139 ), "" )
      ]

      let sourceEntityDatoms = isDefined(sourceEntity) ? [
        newDatom( 'newEntity', attrName( State.DB, 1757 ), isDefined( State.DB.get( sourceEntity, 1757 )  ) 
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
        newDatom( 'newEntity', attrName( State.DB, 10070 ), eventType ),
        newDatom( 'newEntity' , 'event/accountingYear', State.DB.get( sourceDocument, 7512 ) ), 
        newDatom( 'newEntity' , attrName( State.DB, 1757 ), State.DB.get( State.DB.get( sourceDocument, 7512 ), "accountingYear/lastDate" )  ), 
        newDatom( 'newEntity' , 'entity/label', State.DB.get( eventType, 6 ) ), 
        newDatom( 'newEntity' , attrName( State.DB, 1139 ), "" ),
        newDatom( 'newEntity' , attrName( State.DB, 11477 ), sourceDocument ),
      ]

      State.Actions.createAndSelectEntity( basicDatoms )

    },
    createSourceDocument: sourceDocumentType => State.Actions.createAndSelectEntity( [
      newDatom( 'newEntity', 'entity/entityType', 11472 ),
      newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
      newDatom( 'newEntity', attrName( State.DB, 11688 ) , sourceDocumentType ),
      newDatom( 'newEntity' , attrName( State.DB, 6 ), 'Bilagsdokument uten navn' ), 
      newDatom( 'newEntity' , attrName( State.DB, 1139 ), '' ), 
      newDatom( 'newEntity' , attrName( State.DB, 7512 ), State.S.selectedAccountingYear), 
    ] ),
    createActor: actorType => State.Actions.createAndSelectEntity( [
      newDatom( 'newEntity', 'entity/entityType', 7979 ),
      newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ),  
      newDatom( 'newEntity' , "actor/actorType", actorType ),  
      newDatom( 'newEntity' , "entity/label", 'Aktør uten navn' )
    ] ),
    createAndSelectEntity: async newDatoms => {

      if( newDatoms.every( Datom => Datom.entity === newDatoms[0].entity ) ){
        let updatedDB = await Transactor.postTransaction( State.DB, newDatoms)
        let newEntity = updatedDB.Entities.slice( -1 )[0].entity
        updateState( State, {DB: updatedDB, S: { selectedEntity: newEntity, selectedPage: updatedDB.get( updatedDB.get(newEntity, 19), 7930) } } )
      }else{ log({ERROR: "createAndSelectEntity: Received datoms refer to > 1 entity"}) }

      
    }
  })
}



let importDNBtransactions = (State, sourceDocument) => {

  let allRows = State.DB.get( sourceDocument, 1759 ).filter( row => row.length > 1 )

  let headersRowIndex = allRows.findIndex( row => row.includes("Forklarende tekst") && row.includes("Transaksjonstype") && row.includes("Transaksjonstype") )
  let headerRow = allRows[ headersRowIndex ]

  let accountNumberColumnIndex = headerRow.findIndex( header => header === "Kontonummer" )
  let dateColumnIndex = headerRow.findIndex( header => header === "Bokf�rt dato" )
  let description1ColumnIndex = headerRow.findIndex( header => header === "Transaksjonstype" )
  let description2ColumnIndex = headerRow.findIndex( header => header === "Forklarende tekst" )
  let paidAmountColumnIndex = headerRow.findIndex( header => header === "Ut" )
  let receivedAmountColumnIndex = headerRow.findIndex( header => header === "Inn" )
  let referenceNumberColumnIndex = headerRow.findIndex( header => header === "Arkivref." )

  let transactionRows = allRows.slice( headersRowIndex + 1 )

  let newEventDatoms = transactionRows.map( (row, index) => {

    let txDate = Number( moment( row[ dateColumnIndex ], "DD.MM.YYYY" ).format("x") )

    let parseDNBamount = stringAmount => Number( stringAmount.replaceAll(".", "").replaceAll(",", ".") ) 

    let paidAmount = row[ paidAmountColumnIndex ] === ""
      ? undefined
      : parseDNBamount( row[ paidAmountColumnIndex ] ) * -1

    let receivedAmount = row[ receivedAmountColumnIndex ] === ""
      ? undefined
      : parseDNBamount( row[ receivedAmountColumnIndex ] ) 

    let isPayment = isNumber( paidAmount )

    let amount = isPayment ? paidAmount : receivedAmount


      
    let eventType = isPayment ? 13186 : 13187


    return [
      newDatom( "newDatom_"+ index, "entity/company", State.S.selectedCompany  ),
      newDatom( "newDatom_"+ index, 'event/accountingYear', State.DB.get( sourceDocument, 7512 ) ),
      newDatom( "newDatom_"+ index, "entity/selectSourceDocument", sourceDocument ),
      newDatom( "newDatom_"+ index, "entity/entityType", 10062  ),
      newDatom( "newDatom_"+ index, attrName( State.DB, 1139 ) , "" ),

      newDatom( "newDatom_"+ index, attrName( State.DB, 8831 ), `[${accountNumberColumnIndex === -1 ? "Konto" : row[ accountNumberColumnIndex ] }]  ${ row[ description1ColumnIndex ]}: ${ row[ description2ColumnIndex ]}`  ),
      newDatom( "newDatom_"+ index, attrName( State.DB, 1757 ), txDate ),
      newDatom( "newDatom_"+ index, attrName( State.DB, 10070 ), eventType ),
      newDatom( "newDatom_"+ index, attrName( State.DB, 1083 ),  amount ),
      newDatom( "newDatom_"+ index, "bankTransaction/referenceNumber", row[ referenceNumberColumnIndex ]  ),
      newDatom( "newDatom_"+ index, "entity/label", `[${moment(txDate).format('DD/MM/YYYY')}] ${State.DB.get( eventType, 6 )} på NOK ${ formatNumber( amount, amount > 100 ? 0 : 2 ) }`.replaceAll(`"`, `'`) ),
    ]
  }  ).flat()

    return newEventDatoms
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
          ? State.DB.getAll(5722).map( company => returnObject({value: company, label: State.DB.get(company, "entity/label")  })  )
          : State.DB.get(State.S.selectedUser, "user/companies").map( entity => returnObject({value: entity, label: State.DB.get(entity, "entity/label")  })  ), 
        e => State.Actions.selectCompany( Number( submitInputValue(e) ) ))
      ]),
      d([dropdown(State.S.selectedAccountingYear, State.DB.get(null, 10061).map( entity => returnObject({value: entity, label: getEntityLabel( State.DB, entity )  })  ), e => State.Actions.selectAccountingYear( Number( submitInputValue(e) ) ))]),
  ], {style: "padding: 1em;"}),
  d( [9951, 11474, 11974, 7977, 7860, 7882, 10464, 10035, 10025]
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
  ? isDefined( State.S.selectedEntity )
    ? createEventFromEventButton( State )
    : createEventButton( State )
  : State.S.selectedPage === 11474
    ? createSourceDocumentButton( State )
    : State.S.selectedPage === 7977
      ? createActorButton( State )
      : d("")
  
  
  

let createEventButton = State => d([
  d( "Ny hendelse 📅", {style: "padding:1em; margin-left:2em; background-color: #79554852;"}),
    d([
      br(),
      d("Velg hendelsestype:"),
      d(State.DB.getAll( 10063   ).map( entity =>State.DB.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).map( category => d([
        h3(category),
        d(State.DB.getAll(10063).filter( e => State.DB.get(e, "entity/category") === category ).sort( (a,b) => a-b ).map( eventType => entityLabelWithPopup( State, eventType, () => State.Actions.createEvent( eventType ) ) ) ),
      ])  ) ),
    ], {class: "createButtonPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
    
], {class: "createButtonPopupContainer", style:"display: inline-flex;"})

let createEventFromEventButton = State => d([
  d( "Ny hendelse fra denne 📅", {style: "padding:1em; margin-left:2em; background-color: #03a9f445;"}),
    d([
      d("Kopierer dato og beløp fra:"),
      entityLabelWithPopup( State, State.S.selectedEntity ),
      br(),
      d("Velg hendelsestype:"),
      d(State.DB.getAll( 10063   ).map( entity =>State.DB.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).map( category => d([
        h3(category),
        d(State.DB.getAll(10063).filter( e => State.DB.get(e, "entity/category") === category ).sort( (a,b) => a-b ).map( eventType => entityLabelWithPopup( State, eventType, () => State.Actions.createEventFromEvent( eventType, State.DB.get( State.S.selectedEntity, 19 ) === 10062 ? State.S.selectedEntity : undefined ) ) ) ),
      ])  ) ),
    ], {class: "createButtonPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
    
], {class: "createButtonPopupContainer", style:"display: inline-flex;"})


let createEventFromSourceDocumentButton = State => d([
  d( "Ny hendelse basert på dette bilaget 📅", {style: "padding:1em; margin-left:2em; background-color: #03a9f445;"}),
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
                dropdown( State.S.selectedEntity, State.DB.get( State.S.selectedCompany, 10073  ).filter( event => Database.get(event, 12986) === State.S.selectedAccountingYear  ).map( e => returnObject({value: e, label: getEntityLabel( State.DB, e ) }) ), e => State.Actions.selectEntity( Number( submitInputValue(e) ) )  ),
                prevNextEventView( State ),
              ], {style: gridColumnsStyle("5fr 1fr")}) 
            : entityLabelWithPopup( State, State.S.selectedEntity ),
    ], {style: "display: inline-flex;"}),
    sidebarCreateButton( State ),

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
  ], {class: "feedContainer"}),
  br(),
  d([
    h3("Kundeservice"),
    d("TBD"),
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
