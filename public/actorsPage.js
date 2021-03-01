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
  submitButton( "Legg til person", () => State.Actions.createActor(8667) ),
  submitButton( "Legg til selskap", () => State.Actions.createActor(8666) ),
  br(),
  ])
  
  let singleActorView = State => {


    let activeRoles = State.DB.get( State.S.selectedEntity,  12496)( State.S.selectedEventIndex   )





    return d([
      submitButton( " <---- Tilbake ", () => State.Actions.selectEntity( undefined, ActorsPage.entity )  ),
      br(),
      transactionIndexSelectionView( State ),
      br(),
      entityAttributeView(State, State.S.selectedEntity, 8668),
      entityAttributeView(State, State.S.selectedEntity, 6),
      br(),
      d([
        entityLabelWithPopup( State, 12496 ),
        d( State.DB.get( State.S.selectedEntity, 12496 )( State.S.selectedEventIndex   ).map( event => entityLabelWithPopup(State, event) ) )
      ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
      br(),
      d( activeRoles.map( actorRole => d([
        entityLabelWithPopup( State, actorRole ),
        d( State.DB.get(actorRole, 10433).map( calculatedField => d([
          entityLabelWithPopup( State, calculatedField ),
          State.DB.get(calculatedField, 18) === 31
            ? d( formatNumber( State.DB.get( State.S.selectedEntity, calculatedField )( State.S.selectedEventIndex   ) ), {style: `text-align: right;`} )
            : d( State.DB.get( State.S.selectedEntity, calculatedField )( State.S.selectedEventIndex   ).map( event => entityLabelWithPopup(State, event) ) )
        ], {style: gridColumnsStyle("repeat(4, 1fr)")} )  ) )
      ])  ) ),
      br(),
      br(),
      h3("Alle inn- og utbetalinger mot aktør"),
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
      submitButton( "Slett aktør", () => State.Actions.retractActor(State.S.selectedEntity) ),
    ])
  } 