const ActorsPage = {
    entity: 7977,
    onLoad: State => returnObj({selectedEntity: undefined, selectedEventIndex: State.DB.get( State.S.selectedCompany, 12385 ) }),
    Actions: State => returnObj({})
  }


  
  
  let actorsView = State => isDefined( State.S.selectedEntity) ? singleActorView( State ) : allActorsView( State )




  let actorRowView = (State, actor) => d([
    entityLabelWithPopup( State, actor ),
    entityLabelWithPopup( State, State.DB.get( actor, 8668 ) ),
    d( State.DB.get( actor, 12496 )( State.S.selectedEventIndex   ).map( actorRole => entityLabelWithPopup(State, actorRole) ) )
], {style: gridColumnsStyle("2fr 1fr 3fr")})

let allActorsView = State => d([
    h3( getEntityLabel( State.DB, State.S.selectedPage) ),
    d([
    d([
        d( "Navn" ),
        d( "Type" ),
        d( "Roller" ),
    ], {style: gridColumnsStyle("2fr 1fr 3fr")}),
    ], {class: "feedContainer"}),
    d( State.DB.get( State.S.selectedCompany, 10065 ).map( actor => actorRowView(State, actor)  ), {class: "feedContainer"}),
])


  
  let singleActorView = State => {


    let activeRoles = State.DB.get( State.S.selectedEntity,  12496)( State.S.selectedEventIndex   )





    return d([
      selectEventIndexView( State ),
      br(),
      submitButton( " <---- Tilbake ", () => State.Actions.selectEntity( undefined, ActorsPage.entity )  ),
      br(),
      entityAttributeView(State, State.S.selectedEntity, 8668, true),
      entityAttributeView(State, State.S.selectedEntity, 6),
      br(),
      temporalEntityAttributeView( State, State.S.selectedEntity, 12496, State.S.selectedEventIndex ),
      br(),
      d( activeRoles.map( actorRole => d([
        entityLabelWithPopup( State, actorRole ),
        d( State.DB.get(actorRole, 10433).map( calculatedField => temporalEntityAttributeView( State, State.S.selectedEntity, calculatedField, State.S.selectedEventIndex ) ) )
      ])  ) ),
      br(),
      d([
        h3("Handlinger"),
        d( State.DB.get( State.DB.get(State.S.selectedEntity, 8668 )  , 11583).map( action =>  eventActionButton( State, State.S.selectedEntity, action ) )  )
      ], {class: "feedContainer"}),
    ])
  }




