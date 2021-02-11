const ActorsPage = {
    entity: 7977,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({
        "ActorsPage/selectActor": entity => updateState( State, {S: {selectedPage: 7977, selectedEntity: entity}}),
        "ActorsPage/retractActor": async actor => updateState( State, { DB: await Transactor.retractEntity(State.DB, actor), S: {selectedEntity: undefined } } ),
        "ActorsPage/createActor": async actor => updateState( State, {DB: await Transactor.createEntity(State.DB, 7979, [ newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ),  newDatom( 'newEntity' , 1113, "Aktør uten navn" )] )} ),
    })
  }


  
  let actorLabelText = (State, actor, onclick) => d([d( State.DB.get(actor, 8668) === 8666 ? State.DB.get(actor, 1001) : State.DB.get(actor, 1113) , {class: "entityLabel", style: `background-color:#bfd1077a;`}, "click", isDefined(onclick) ? onclick : () => State.Actions["ActorsPage/selectActor"](actor) )], {style:"display: flex;"})
  
  let actorLabel = (State, actor, onclick) => d([
    d([
      actorLabelText( State, actor, onclick ),
      actorPopUp( State, actor ),
    ], {class: "popupContainer", style:"display: inline-flex;"})
    ], {style:"display: inline-flex;"} )
  
  let actorPopUp = (State, actor) => d([
    actorLabelText( State, actor ),
    br(),
    entityAttributeView(State, actor, 8668, true ),
    d(`Entitet: ${actor}`)
  ], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;width: 400px;"})
  
  
  let actorsView = State => isDefined( State.S.selectedEntity) ? singleActorView( State ) : allActorsView( State )
  
  let allActorsView = State => d([
    d([
      entityLabelWithPopup( State, 1113 ),
      entityLabelWithPopup( State, 8668 ),
    ], {style: gridColumnsStyle("1fr 1fr 3fr")}),
    d( State.DB.get( State.S.selectedCompany, 10065 ).map( actor => d([
      actorLabel( State, actor ),
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