const ActorsPage = {
    entity: 7977,
    onLoad: State => returnObject({selectedEntity: undefined, selectedEventIndex: State.DB.get( State.S.selectedCompany, 12385 ) }),
    Actions: State => returnObject({
      createActor: actorType => State.Actions.createAndSelectEntity( [
        newDatom( 'newEntity', 'entity/entityType', 7979 ),
        newDatom( 'newEntity' , "actor/actorType", actorType ),  
        newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ),  
        newDatom( 'newEntity' , 6, 'Aktør uten navn' )
      ] ),
      retractActor: actor =>  State.Actions.retractEntity( actor )
    })
  }


  
  
  let actorsView = State => isDefined( State.S.selectedEntity) ? singleActorView( State ) : allActorsView( State )




  let actorRowView = (State, actor) => d([
    entityLabelWithPopup( State, actor ),
    entityLabelWithPopup( State, State.DB.get( actor, 8668 ) ),
    d( State.DB.get( actor, 12496 )( State.S.selectedEventIndex   ).map( actorRole => entityLabelWithPopup(State, actorRole) ) )
], {style: gridColumnsStyle("2fr 1fr 3fr")})

let allActorsView = State => d([
    h3("Alle aktører"),
    d([
    d([
        d( "Navn" ),
        d( "Type" ),
        d( "Roller" ),
    ], {style: gridColumnsStyle("2fr 1fr 3fr")}),
    ], {class: "feedContainer"}),
    d( State.DB.get( State.S.selectedCompany, 10065 ).map( actor => actorRowView(State, actor)  ), {class: "feedContainer"}),
    br(),
    d([
      h3("Opprett aktør:"),
      d( State.DB.getAll(8665).map( actorType => entityLabelWithPopup( State, actorType, () => State.Actions.createEvent( actorType ) )  )  ),
  ], {class: "feedContainer"})
])


  
  let singleActorView = State => {


    let activeRoles = State.DB.get( State.S.selectedEntity,  12496)( State.S.selectedEventIndex   )





    return d([
      submitButton( " <---- Tilbake ", () => State.Actions.selectEntity( undefined, ActorsPage.entity )  ),
      br(),
      transactionIndexSelectionView( State ),
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
      br(),
      h3("Alle inn- og utbetalinger mot aktør"),
      temporalEntityAttributeView( State, State.S.selectedEntity, 12462, State.S.selectedEventIndex ),
      temporalEntityAttributeView( State, State.S.selectedEntity, 12463, State.S.selectedEventIndex ),
      temporalEntityAttributeView( State, State.S.selectedEntity, 12456, State.S.selectedEventIndex ),
      temporalEntityAttributeView( State, State.S.selectedEntity, 12457, State.S.selectedEventIndex ),
      br(),
      entityActionsView( State, State.S.selectedEntity ),
    ])
  }






  let temporalEntityAttributeView = (State, entity, calculatedField, eventIndex ) => d([
    entityLabelWithPopup( State, calculatedField ),
    temporalValueView( State, entity, calculatedField, eventIndex )
  ], {style:  gridColumnsStyle("3fr 3fr 1fr") + "margin: 5px;"} )


  let temporalValueView = (State, entity, calculatedField, eventIndex ) => d([
    State.DB.get( calculatedField, 18 ) === 32
    ? d( State.DB.get( entity, calculatedField )( eventIndex   ).map( event => entityLabelWithPopup(State, event) ) )
    : State.DB.get( calculatedField, 18 ) === 31
      ? d( formatNumber( State.DB.get( entity, calculatedField )( eventIndex   ) ), {style: `text-align: right;`} )
      : d( State.DB.get( entity, calculatedField )( eventIndex   ) ),
    tinyEventLabel( State, State.DB.get( State.S.selectedCompany, 12783 )( eventIndex ) )
  ], {style: "display: contents;"})