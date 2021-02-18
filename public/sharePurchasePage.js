const SharePurchasesPage = {
    entity: 10041,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({})
  }


  
let sharePurchaseView = State => isDefined( State.S.selectedEntity) 
    ? singleShareTransactionView( State )
    : allSharePurchasesView( State )
  
  let allSharePurchasesView = State => d([
    h3("Alle verdipapirtransaksjoner"),
    d([
        entityLabelWithPopup( State, 1757 ),
        entityLabelWithPopup( State, 10070 ),
        entityLabelWithPopup( State, 7048 ),
        entityLabelWithPopup( State, 1100 ),
        entityLabelWithPopup( State, 10107 ),
        entityLabelWithPopup( State, 10401 ),
        d("")
    ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr 1fr")}),
    d( State.DB.get( State.S.selectedCompany, 10073 )
        .filter( sourceDocument => [10096, 10111].includes( State.DB.get(sourceDocument, 10070 ) )   )
        .map( sourceDocument => d([
        lockedSingleValueView( State, sourceDocument, 1757 ),
        lockedSingleValueView( State, sourceDocument, 10070 ),
        lockedSingleValueView( State, sourceDocument, 7048 ),
        lockedSingleValueView( State, sourceDocument, 1100 ),
        lockedSingleValueView( State, sourceDocument, 10107 ),
        d(State.DB.get(sourceDocument, 10401) ? "✅" : "🚧"),
        submitButton( "Vis", () => State.Actions.selectEntity( sourceDocument, SharePurchasesPage.entity ))
    ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr 1fr")}) )),
  br(),
  eventActionButton( State, State.S.selectedCompany, 11596),
  eventActionButton( State, State.S.selectedCompany, 11597),
  ]) 

  
  let singleShareTransactionView = State => d([
    submitButton( " <---- Tilbake ", () => State.Actions.selectEntity(  undefined, SharePurchasesPage.entity )  ),
    br(),
    entityAttributeView(State, State.S.selectedEntity, 10070, true ),
    entityAttributeView(State, State.S.selectedEntity, 11174, true ),
    entityAttributeView(State, State.S.selectedEntity, 11477, State.DB.get(State.S.selectedEntity, 10401) ),
    br(),
    entityAttributeView(State, State.S.selectedEntity, 1757, State.DB.get(State.S.selectedEntity, 10401) ),
    entityAttributeView(State, State.S.selectedEntity, 7048, State.DB.get(State.S.selectedEntity, 10401) ),
    entityAttributeView(State, State.S.selectedEntity, 1100, State.DB.get(State.S.selectedEntity, 10401) ),
    
    entityAttributeView(State, State.S.selectedEntity, 11177, State.DB.get(State.S.selectedEntity, 10401) ),
    br(),
    State.DB.get(State.S.selectedEntity, 11177)
        ? d([
            entityAttributeView(State, State.S.selectedEntity, 1083, State.DB.get(State.S.selectedEntity, 10401) ),
            entityAttributeView(State, State.S.selectedEntity, 10103, State.DB.get(State.S.selectedEntity, 10401) )
        ]) 
        : entityAttributeView(State, State.S.selectedEntity, 11180, State.DB.get(State.S.selectedEntity, 10401) ),
    br(),
    entityAttributeView(State, State.S.selectedEntity, 10107, true ),
    br(),
    State.DB.get(State.S.selectedEntity, "sourceDocument/sourceDocumentType") === 10111
        ? d([
            entityAttributeView(State, State.S.selectedEntity, 10490, true ),
            entityAttributeView(State, State.S.selectedEntity, 10491, true ),
        ])
        : d(""),
    br(),
    d([
        d("Tilknyttede transaksjoner:"),
        State.DB.get(State.S.selectedEntity, 10401)
            ? d( State.DB.get(State.S.selectedEntity, 10402).map( transaction => transactionFlowView( State, transaction) ) )
            : d("Ingen bokførte transaksjoner")
    ], {class: "feedContainer"}),
    eventActionsView( State, State.S.selectedEntity ),
  ])