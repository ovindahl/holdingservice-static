const ActorsPage = {
    entity: 7977,
    onLoad: State => returnObject({selectedEntity: undefined, selectedEventIndex: State.DB.get( State.S.selectedCompany, 12385 ) }),
    Actions: State => returnObject({})
  }


  
  
  let actorsView = State => isDefined( State.S.selectedEntity) ? singleActorView( State ) : allActorsView( State )
  
  let allActorsView = State => d([
    d([
      entityLabelWithPopup( State, 1113 ),
      entityLabelWithPopup( State, 8668 ),
    ], {style: gridColumnsStyle("1fr 1fr 3fr")}),
    d( State.DB.get( State.S.selectedCompany, 10065 ).map( actor => d([
      entityLabelWithPopup( State, actor ),
      entityLabelWithPopup( State, State.DB.get(actor, 8668) ),
    ], {style: gridColumnsStyle("1fr 1fr 3fr")}) )),
  br(),
  eventActionButton( State, State.S.selectedCompany, 11522),
  br(),
  ]) 
  
  let singleActorView = State => d([
    submitButton( " <---- Tilbake ", () => State.Actions.selectEntity( undefined, ActorsPage.entity )  ),
    br(),
    transactionIndexSelectionView( State ),
    br(),
    entityAttributeView(State, State.S.selectedEntity, 8668),
    entityAttributeView(State, State.S.selectedEntity, 6),
    br(),
    h3("Inn- og utbetalinger"),
    d([
      entityLabelWithPopup( State, 12462 ),
      d( State.DB.get( State.S.selectedEntity, 12462 )( State.S.selectedEventIndex   ).map( event => entityLabelWithPopup(State, event) ) )
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    d([
      entityLabelWithPopup( State, 12463 ),
      d( State.DB.get( State.S.selectedEntity, 12463 )( State.S.selectedEventIndex   ).map( event => entityLabelWithPopup(State, event) ) )
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    br(),
    d([
      entityLabelWithPopup( State, 12456 ),
      d( formatNumber( State.DB.get( State.S.selectedEntity, 12456 )( State.S.selectedEventIndex   ) ), {style: `text-align: right;`} ),
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    d([
      entityLabelWithPopup( State, 12457 ),
      d( formatNumber( State.DB.get( State.S.selectedEntity, 12457 )( State.S.selectedEventIndex   ) ), {style: `text-align: right;`} ),
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    br(),
    h3("Aktørens som investeringsobjekt"),
    d([
      entityLabelWithPopup( State, 12464 ),
      d( State.DB.get( State.S.selectedEntity, 12464 )( State.S.selectedEventIndex   ).map( event => entityLabelWithPopup(State, event) ) )
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    d([
      entityLabelWithPopup( State, 12465 ),
      d( State.DB.get( State.S.selectedEntity, 12465 )( State.S.selectedEventIndex   ).map( event => entityLabelWithPopup(State, event) ) )
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    br(),
    d([
      entityLabelWithPopup( State, 12461 ),
      d( formatNumber( State.DB.get( State.S.selectedEntity, 12461 )( State.S.selectedEventIndex   ) ), {style: `text-align: right;`} ),
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    d([
      entityLabelWithPopup( State, 12466 ),
      d( formatNumber( State.DB.get( State.S.selectedEntity, 12466 )( State.S.selectedEventIndex   ) ), {style: `text-align: right;`} ),
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    d([
      entityLabelWithPopup( State, 12467 ),
      d( formatNumber( State.DB.get( State.S.selectedEntity, 12467 )( State.S.selectedEventIndex   ), 2 ), {style: `text-align: right;`} ),
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    br(),
    h3("Aktørens som aksjonær"),
    d([
      entityLabelWithPopup( State, 12476 ),
      d( State.DB.get( State.S.selectedEntity, 12476 )( State.S.selectedEventIndex   ).map( event => entityLabelWithPopup(State, event) ) )
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    d([
      entityLabelWithPopup( State, 12478 ),
      d( formatNumber( State.DB.get( State.S.selectedEntity, 12478 )( State.S.selectedEventIndex   ) ), {style: `text-align: right;`} ),
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    d([
      entityLabelWithPopup( State, 12477 ),
      d( formatNumber( State.DB.get( State.S.selectedEntity, 12477 )( State.S.selectedEventIndex   ) ), {style: `text-align: right;`} ),
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    br(),
    eventActionButton( State, State.S.selectedEntity, 11678),
  ])