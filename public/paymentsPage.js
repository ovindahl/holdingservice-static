
const PaymentsPage = {
    entity: 11349,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({
        "PaymentsPage/recordPayment": sourceDocument => State.Actions.postDatoms( [
            newDatom( "newEntity" , 'entity/entityType', 7948 ),
            newDatom( "newEntity" , 'entity/company', State.S.selectedCompany ), 
            newDatom( "newEntity" , "transaction/transactionType", 11353 ), 
            newDatom( "newEntity" , "entity/sourceDocument", sourceDocument ), 
            newDatom( "newEntity" , "transaction/originNode", State.DB.get( State.DB.get( sourceDocument, 11180), 9084) === 9086 ? State.DB.get( State.DB.get( sourceDocument, 11180), 7463) : State.DB.get( sourceDocument, 11417) ),
            newDatom( "newEntity" , "transaction/destinationNode", State.DB.get( State.DB.get( sourceDocument, 11180), 9084) === 9086 ? State.DB.get( sourceDocument, 11417) : State.DB.get( State.DB.get( sourceDocument, 11180), 7463) ),
            newDatom( "newEntity" , "eventAttribute/1139",  "Betaling mot gjeld/fordring" )
        ]),
        })
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

  

