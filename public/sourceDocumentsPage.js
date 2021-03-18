
const SourceDocumentsPage = {
    entity: 11474,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({}),
  }

let sourceDocumentsView = State => { try {return isDefined( State.S.selectedEntity ) 
    ? isAdmin( State )
      ? singleSourceDocumentView( State ) 
      : simpleSourceDocumentView( State )
    : allSourceDocumentsView( State ) 
  } catch (error) { return entityErrorView( State, error ) } }








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
  d( "Last opp bilag 🗃️", {style: "padding:1em; margin-left:2em; background-color: #79554852;"}),
  d([
    d(State.DB.getAll( 11686   ).map( entity =>State.DB.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).filter( category => category !== "Systemgenererte bilag" ).map( category => d([
      h3(category),
      d(State.DB.getAll(11686).filter( e => State.DB.get(e, "entity/category") === category ).sort( (a,b) => a-b ).map( sourceDocumentType => entityLabelWithPopup( State, sourceDocumentType, () => State.Actions.createSourceDocument( sourceDocumentType ) ) ) ),
    ])  ) ),
  ], {class: "createButtonPopup_right", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
], {class: "createButtonPopupContainer_right", style:"display: inline-flex;"})

let generateSourceDocumentButton = State => d([
  d( "Opprett systemgenerert bilag 🗃️", {style: "padding:1em; margin-left:2em; background-color: #79554852;"}),
  d([
    d(State.DB.getAll( 11686   ).filter( e => State.DB.get(e, 14) === "Systemgenererte bilag" ).map( entity =>State.DB.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).map( category => d([
      h3(category),
      d(State.DB.getAll(11686).filter( e => State.DB.get(e, "entity/category") === category ).sort( (a,b) => a-b ).map( sourceDocumentType => entityLabelWithPopup( State, sourceDocumentType, () => State.Actions.createSourceDocument( sourceDocumentType ) ) ) ),
    ])  ) ),
  ], {class: "createButtonPopup_right", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
], {class: "createButtonPopupContainer_right", style:"display: inline-flex;"})

  
  let allSourceDocumentsView = State => d([
    h3( getEntityLabel( State.DB, State.S.selectedPage) ),
    br(),
    d([
      h3("Oppgaver"),
      d( State.DB.get( State.S.selectedCompany  , 12158).map(  task => d([
        singleValueView( State, task, 6, true ),
        boolView( State, task, 12155 )
      ], {style: gridColumnsStyle("3fr 1fr 1fr")}) ) ),
    ], {class: "feedContainer"}),
    br(),
    //generateSourceDocumentButton( State ),
    createSourceDocumentButton( State ),
    br(),
    d([
      d([
        d( "#" ),
        d( "Bilag" ),
        d( "Bilagstype" ),
        d( "Status", {style: `text-align: right;`} ),
      ], {style: gridColumnsStyle("1fr 3fr 2fr 1fr")}), 
    ], {class: "feedContainer"}),
    State.DB.get( State.S.selectedCompany, 11475 ).filter( sourceDocument => isDefined(State.S.selectedAccountingYear) ? State.DB.get(sourceDocument, 7512 ) === State.S.selectedAccountingYear : true  ).length > 0
      ? d( State.DB.get( State.S.selectedCompany, 11475 ).filter( sourceDocument => isDefined(State.S.selectedAccountingYear) ? State.DB.get(sourceDocument, 7512 ) === State.S.selectedAccountingYear : true  ).map( sourceDocument => d([
          d( `${State.DB.get(sourceDocument, 12509 )}` ),
          entityLabelWithPopup( State, sourceDocument, () => State.Actions.selectEntity(  sourceDocument, SourceDocumentsPage.entity  ) ),
          valueView( State, sourceDocument, 11688, true ),
          d([valueView( State, sourceDocument, 13185, true )], {style: `text-align: right;`}),
        ], {style: gridColumnsStyle("1fr 3fr 2fr 1fr") } ) ), {class: "feedContainer"} )
    : d("Ingen bilag i valgt regnskapsår.", {class: "feedContainer"}),
  ]) 

  
  let singleSourceDocumentView = State => d([
    d([
      entityAttributeView( State, State.S.selectedEntity, 13185, true ),
      entityAttributeView( State, State.S.selectedEntity, 11688, true ),
      entityAttributeView( State, State.DB.get( State.S.selectedEntity, 11688  ), 12556, true ),
      entityAttributeView( State, State.S.selectedEntity, 7512, State.DB.get( State.S.selectedEntity, 12712 ) ),
      entityAttributeView( State, State.S.selectedEntity, 6, State.DB.get( State.S.selectedEntity, 12712 ) ),
      entityAttributeView( State, State.S.selectedEntity, 1139, State.DB.get( State.S.selectedEntity, 12712 ) ),
      isDefined(State.DB.get( State.S.selectedEntity, 11688  )) 
      ? d( State.DB.get( State.DB.get( State.S.selectedEntity, 11688  ), 7942 ).map( attribute => entityAttributeView( State, State.S.selectedEntity, attribute, State.DB.get( State.S.selectedEntity, 12712 ) ) )   )
      : d(""),
    ], {class: "feedContainer"}),
    br(),
    d([
      h3("Registrerte hendelser basert på dette bilaget:"),
      State.DB.get(State.S.selectedEntity , 11479).length > 0
        ? valueView( State, State.S.selectedEntity , 11479, true )
        : d("Ingen registrerte hendelser."),
      br(),
      createEventFromSourceDocumentButton( State ),
    ], {class: "feedContainer"}),
    br(),
    d([
      h3("Handlinger"),
      d( State.DB.get( State.DB.get(State.S.selectedEntity, 11688 )  , 11583).map( action =>  eventActionButton( State, State.S.selectedEntity, action ) )  )
    ], {class: "feedContainer"}),
    br(),
    br(),
    State.DB.get( State.S.selectedEntity, 11688  ) === 12699
      ? d("🖨️ Eksporter utskriftsvennlig versjon av avtalen", {}, "click", () => printContractInNewTab( State, State.DB.get(State.S.selectedEntity, 12866) ) )
      : d("")
  ])

 

  







  let simpleSourceDocumentView = State => d([
    entityAttributeView( State, State.S.selectedEntity, 11688, true ),
    entityAttributeView( State, State.S.selectedEntity, 6, State.DB.get( State.S.selectedEntity, 12712 ) ),
    entityAttributeView( State, State.S.selectedEntity, 1139, State.DB.get( State.S.selectedEntity, 12712 ) ),
    entityAttributeView( State, State.S.selectedEntity, 11470, State.DB.get( State.S.selectedEntity, 12712 ) ),
    br(),
    State.DB.get( State.S.selectedEntity, 12795 ) === true
      ? d("🔒 Bilaget er låst")
      : d([
        submitButton( "❌ Slett bilag", () => State.Actions.retractEntity( State.S.selectedEntity ) ),
        isDefined( State.DB.get( State.S.selectedEntity, "sourceDocument/attachment" ) )
          ? submitButton( "✔️ Marker som klart til bokføring", () => State.Actions.updateEntity( State.S.selectedEntity, attrName( State.DB, 12795 ), true ) )
          : d(" "),
      ])
    
  ], {class: "feedContainer"})


let printContractInNewTab = (State, html) => {

  var newWindow = window.open();
  newWindow.document.write( html );

}
