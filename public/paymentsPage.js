
const PaymentsPage = {
    entity: 11349,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({})
  }

  
  let paymentsView = State => isDefined( State.S.selectedEntity ) 
    ? singleEventView( State )
    : allPaymentsView( State )
  
  let allPaymentsView = State => d([
    h3("Alle betalinger mot lån/fordringer"),
    d([
        d(""),
        entityLabelWithPopup( State, 1757 ),
        entityLabelWithPopup( State, 10070 ),
        entityLabelWithPopup( State, 1083 ),
        entityLabelWithPopup( State, 10401 ),
        d("")
    ], {style: gridColumnsStyle("2fr 1fr 1fr 1fr 1fr 1fr ")}),
    d( State.DB.get( State.S.selectedCompany, 10073 )
        .filter( sourceDocument => [11350].includes( State.DB.get(sourceDocument, 10070 ) )   )
        .map( sourceDocument => d([
        entityLabelWithPopup( State, sourceDocument ),
        lockedSingleValueView( State, sourceDocument, 1757 ),
        lockedSingleValueView( State, sourceDocument, 10070 ),
        lockedSingleValueView( State, sourceDocument, 1083 ),
        d(State.DB.get(sourceDocument, 10401) ? "✅" : "🚧"),
        submitButton( "Vis", () => State.Actions.selectEntity(  sourceDocument, PaymentsPage.entity ) )
    ], {style: gridColumnsStyle("2fr 1fr 1fr 1fr 1fr 1fr ")}) )),
  br(),
  eventActionButton( State, State.S.selectedCompany, 11645)
  ]) 

