const ActorsPage = {
    entity: 7977,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({
        "ActorsPage/selectActor": entity => updateState( State, {S: {selectedPage: 7977, selectedEntity: entity}}),
        "ActorsPage/retractActor": async actor => updateState( State, { DB: await Transactor.retractEntity(State.DB, actor), S: {selectedEntity: undefined } } ),
        "ActorsPage/createActor": async actor => updateState( State, {DB: await Transactor.createEntity(State.DB, 7979, [ newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ),  newDatom( 'newEntity' , 1113, "Aktør uten navn" )] )} ),
    })
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
  submitButton("Legg til", () => State.Actions["ActorsPage/createActor"]() ),
  br(),
  ]) 
  
  let singleActorView = State => d([
    submitButton( " <---- Tilbake ", () => State.Actions["ActorsPage/selectActor"]( undefined )  ),
    br(),
    entityAttributeView(State, State.S.selectedEntity, 8668),
    br(),
    isDefined( State.DB.get( State.S.selectedEntity, "actor/actorType") )
        ? d( State.DB.get( State.DB.get( State.S.selectedEntity, "actor/actorType"), 7942 ).map( attribute => entityAttributeView(State, State.S.selectedEntity, attribute ) ) )
        : d(""),
    submitButton("Slett", e => State.Actions["ActorsPage/retractActor"]( State.S.selectedEntity ) ),  
  ])