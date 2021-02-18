
const PaymentsPage = {
    entity: 11349,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({})
  }

  
  let paymentsView = State => isDefined( State.S.selectedEntity ) 
    ? singlePaymentView( State )
    : allPaymentsView( State )
  
  let allPaymentsView = State => d([
    h3("Alle betalinger mot lån/fordringer"),
    d([
        entityLabelWithPopup( State, 1757 ),
        entityLabelWithPopup( State, 10070 ),
        entityLabelWithPopup( State, 10107 ),
        entityLabelWithPopup( State, 10401 ),
        d("")
    ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr")}),
    d( State.DB.get( State.S.selectedCompany, 10073 )
        .filter( sourceDocument => [11350].includes( State.DB.get(sourceDocument, 10070 ) )   )
        .map( sourceDocument => d([
        lockedSingleValueView( State, sourceDocument, 1757 ),
        lockedSingleValueView( State, sourceDocument, 10070 ),
        lockedSingleValueView( State, sourceDocument, 10107 ),
        d(State.DB.get(sourceDocument, 10401) ? "✅" : "🚧"),
        submitButton( "Vis", () => State.Actions.selectEntity(  sourceDocument, PaymentsPage.entity ) )
    ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr")}) )),
  br(),
  eventActionButton( State, State.S.selectedCompany, 11645)
  ]) 

  
  let singlePaymentView = State => d([
    submitButton( " <---- Tilbake ", () => State.Actions.selectEntity(  undefined, PaymentsPage.entity )  ),
    br(),
    entityAttributeView(State, State.S.selectedEntity, 10070, true ),
    entityAttributeView(State, State.S.selectedEntity, 11477, State.DB.get(State.S.selectedEntity, 10401) ),
    br(),
    entityAttributeView(State, State.S.selectedEntity, 1757, State.DB.get(State.S.selectedEntity, 10401) ),
    br(),
    entityAttributeView(State, State.S.selectedEntity, 11180, State.DB.get(State.S.selectedEntity, 10401) ),
    entityAttributeView(State, State.S.selectedEntity, 11417, State.DB.get(State.S.selectedEntity, 10401) ),
    br(),
    entityAttributeView(State, State.S.selectedEntity, 10107, true ),
    br(),
    d([
        d("Tilknyttede transaksjoner:"),
        State.DB.get(State.S.selectedEntity, 10401)
            ? d( State.DB.get(State.S.selectedEntity, 10402).map( transaction => transactionFlowView( State, transaction) ) )
            : d("Ingen bokførte transaksjoner")
    ], {class: "feedContainer"}),
    eventActionsView( State, State.S.selectedEntity ),
  ])

  

