const ActorsPage = {
    initial: DB => returnObject({ 
      "ActorsPage/selectedActor": undefined
    }),
    Actions: State => returnObject({
        "ActorsPage/selectActor": entity => updateState( State, {S: {"ActorsPage/selectedActor": entity}}),
        createCompanyActor: async ( ) =>  updateState( State, {DB: await Transactor.createEntity(State.DB, 7979, [ newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany )] )} ),
    })
  }


  
  
  let actorsView = State => isDefined( State.S["ActorsPage/selectedActor"] ) ? singleActorView( State ) : allActorsView( State )
  
  let allActorsView = State => {
    let allActors = getAllActors( State.DB, State.S.selectedCompany )
  
    return d([
      d([
        entityLabelWithPopup( State, 1113 ),
      ], {style: gridColumnsStyle("3fr 1fr")}),
      d( allActors.map( actor => d([
        entityLabelWithPopup( State, actor, () => State.Actions["ActorsPage/selectActor"]( actor ) ),
      ], {style: gridColumnsStyle("3fr 1fr")}) )),
    br(),
    submitButton("Legg til", () => State.Actions.createCompanyActor() ),
    br(),
    ]) 
  } 
  
  let singleActorView = State => {
  
    let actor = State.S["ActorsPage/selectedActor"]
    
  
    return isDefined(actor)
      ? d([
        submitButton( " <---- Tilbake ", () => State.Actions["ActorsPage/selectActor"]( undefined )  ),
        br(),
        d([
          entityLabelWithPopup( State, 7977 ),
          span( " / " ),
          entityLabelWithPopup( State, actor ),
        ]),
        br(),
        entityAttributeView(State, actor, 8668),
        br(),
        isDefined( State.DB.get( actor, "actor/actorType") )
            ? d( State.DB.get( State.DB.get( actor, "actor/actorType"), 7942 ).map( attribute => entityAttributeView(State, actor, attribute ) ) )
            : d(""),
        submitButton("Slett", e => State.Actions.retractEntity(actor) ),  
      ])
    : d([
      entityAttributeView(State, actor, 7535),
      submitButton("Slett", e => State.Actions.retractEntity(actor) ),  
    ])
  } 