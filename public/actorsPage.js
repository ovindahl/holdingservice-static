
  let actorsView = State => isDefined( State.S.selectedEntity) ? singleActorView( State ) : allActorsView( State )


  let createActorButton = State => d([
    d( "Ny aktør 📘", {style: "padding:1em; margin-left:2em; background-color: #79554852;"}),
      d( 
        State.DB.getAll(8665).map( actorType => entityLabelWithPopup( State, actorType, () => State.Actions.createActor( actorType ) )  ), 
        {class: "createButtonPopup_right", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}
      ),
  ], {class: "createButtonPopupContainer_right", style:"display: inline-flex;"})
  


  let actorRowView = (State, actor) => d([
    entityLabel( State, actor, () => State.Actions.selectEntity( actor ) ),
    entityLabel( State, State.DB.get( actor, 8668 ) ),
    d( State.DB.get( actor, 12496 )( State.S.selectedEventIndex   ).map( actorRole => entityLabel(State, actorRole) ) )
], {style: gridColumnsStyle("2fr 1fr 3fr")})

let allActorsView = State => d([
    h3( getEntityLabel( State.DB, State.S.selectedPage) ),
    createActorButton( State ),
    br(),
    d([
    d([
        d( "Navn" ),
        d( "Type" ),
        d( "Roller" ),
    ], {style: gridColumnsStyle("2fr 1fr 3fr")}),
    ], {class: "feedContainer"}),
    d( State.DB.get( State.S.selectedCompany, 10065 ).map( actor => actorRowView(State, actor)  ), {class: "feedContainer"}),
])


  
  let singleActorView = State => d([
    selectEventIndexView( State ),
    br(),
    d([
      entityAttributeView(State, State.S.selectedEntity, 8668, true),
      entityAttributeView(State, State.S.selectedEntity, 6),
    ], {class: "feedContainer"}),
    br(),
    d([
      h3("Rapporter på aktøren"),
      temporalEntityAttributeView( State, State.S.selectedEntity, 12496, State.S.selectedEventIndex ),
      br(),
      d( State.DB.get( State.S.selectedEntity,  12496)( State.S.selectedEventIndex   ).map( actorRole => d([
        entityLabelWithPopup( State, actorRole ),
        d( State.DB.get(actorRole, 10433).map( calculatedField => temporalEntityAttributeView( State, State.S.selectedEntity, calculatedField, State.S.selectedEventIndex ) ) )
      ])  ) ),
    ], {class: "feedContainer"}),
    br(),
    d([
      h3("Handlinger"),
      d( State.DB.get( State.DB.get(State.S.selectedEntity, 8668 )  , 11583).map( action =>  eventActionButton( State, State.S.selectedEntity, action ) )  )
    ], {class: "feedContainer"}),
  ])




