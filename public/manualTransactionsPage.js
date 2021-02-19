const ManualTransactionsPage = {
    entity: 10042,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({ })
  }


  
  let manualTransactionsView = State => isDefined( State.S.selectedEntity) ? singleEventView( State ) : allManualTransactionsView( State )
  
  let allManualTransactionsView = State => d([
    h3("Alle fri posteringer"),
    d([
        entityLabelWithPopup( State, 1757 ),
        entityLabelWithPopup( State, 7867 ),
        entityLabelWithPopup( State, 7866 ),
        entityLabelWithPopup( State, 1083 ),
        entityLabelWithPopup( State, 10401 ),
    ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr  1fr 1fr")}),
    d( State.DB.get( State.S.selectedCompany, 10073 )
        .filter( sourceDocument => [10317].includes( State.DB.get(sourceDocument, 10070 ) )   )
        .map( sourceDocument => d([
        lockedSingleValueView( State, sourceDocument, 1757 ),
        lockedSingleValueView( State, sourceDocument, 7867 ),
        lockedSingleValueView( State, sourceDocument, 7866 ),
        lockedSingleValueView( State, sourceDocument, 1083 ),
        d(State.DB.get(sourceDocument, 10401) ? "✅" : "🚧"),
        submitButton( "Vis", () => State.Actions.selectEntity(  sourceDocument, ManualTransactionsPage.entity ))
    ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr  1fr 1fr")}) )),
  br(),
  eventActionButton( State, State.S.selectedCompany, 11620),
  ]) 

