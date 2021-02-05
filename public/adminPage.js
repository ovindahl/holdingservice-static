const AdminPage = {
    initial: DB => returnObject({ 
      "AdminPage/selectedEntity": 47
    }),
    Actions: State => returnObject({
      selectEntity: entity => updateState( State, {S: {"AdminPage/selectedEntity": entity}}),
    })
  }

  
// ADMIN PAGE VIEWS

let adminPage = State => d([
    d([d('<header><h1>Holdingservice Admin</h1></header>'),d([submitButton("Bytt til klient", e => State.Actions.toggleAdmin() )], {style: "display:flex;"} )], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
    d([
      adminEntityLabelWithPopup( State,  47 ),
      span(" / "  ),
      isDefined(State.S["AdminPage/selectedEntity"])
        ? adminEntityLabelWithPopup( State, State.DB.get(State.S["AdminPage/selectedEntity"], "entity/entityType")   )
        : span(" ... "),
      span(" / "  ),
      isDefined(State.S["AdminPage/selectedEntity"])
        ? adminEntityLabelWithPopup( State,  State.S["AdminPage/selectedEntity"] )
        : span("Ingen entitet valgt.")
    ]),
    br(),
    d([
      d(""),
     State.DB.get( State.S["AdminPage/selectedEntity"], "entity/entityType" ) === 47
        ? d([
          multipleEntitiesView( State, State.S["AdminPage/selectedEntity"] ),
          br(),
          entityView( State, State.S["AdminPage/selectedEntity"] )
        ]) 
        : entityView( State, State.S["AdminPage/selectedEntity"] )
    ])
  
  ])
  
  let multipleEntitiesView = (State, entityType) => d([
    adminEntityLabelWithPopup( State, entityType),
    d(State.DB.getAll( entityType   ).map( entity =>State.DB.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).map( category => d([
      h3(category),
      d(State.DB.getAll(entityType).filter( e => State.DB.get(e, "entity/category") === category ).sort( (a,b) => a-b ).map( entity => adminEntityLabelWithPopup( State, entity ) ) ),
    ])  ) )
  ],{class: "feedContainer"})