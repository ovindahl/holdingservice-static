const ActorsPage = {
    entity: 7977,
    onLoad: State => returnObject({selectedEntity: undefined}),
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
    entityAttributeView(State, State.S.selectedEntity, 8668),
    entityAttributeView(State, State.S.selectedEntity, 6),
    br(),
    eventActionButton( State, State.S.selectedEntity, 11678),
  ])