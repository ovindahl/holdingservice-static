const AdminPage = {
    initial: DB => returnObject({ 
      "AdminPage/selectedEntity": 47
    }),
    Actions: State => returnObject({
      selectEntity: entity => updateState( State, {S: {"AdminPage/selectedEntity": entity}}),
      createEntity: async (entityType, entityDatoms) => updateState( State, {DB: await Transactor.createEntity( State.DB, entityType, entityDatoms )  } ),
      retractEntity: async entity => updateState( State, {DB: await Transactor.retractEntity(State.DB, entity), S: {"AdminPage/selectedEntity": undefined }} ),
      retractEntities: async entities => updateState( State, {DB: await Transactor.retractEntities(State.DB, entities), S: {"AdminPage/selectedEntity": undefined }} ),
      duplicateEntity: async entity => {
        let entityType = State.DB.get( entity, "entity/entityType")
        let entityTypeAttributes = State.DB.get( entityType, "entityType/attributes" )
        let newEntityDatoms = entityTypeAttributes.map( attr => newDatom("newEntity", State.DB.attrName(attr), State.DB.get( entity, attr) ) ).filter( Datom => Datom.attribute !== "entity/label" ).concat( newDatom("newEntity", "entity/label", `Kopi av ${State.DB.get( entity, 6)}` ) )
        if(entityType === 42){ newEntityDatoms.push( newDatom( "newEntity", "attr/name", "attr/" + Date.now() )  ) }
        let updatedDB = await Transactor.createEntity( State.DB, entityType, newEntityDatoms)
        updateState( State, {DB: updatedDB, S: {"AdminPage/selectedEntity": updatedDB.Entities.slice(-1)[0].entity}} )
      },
      updateEntity: async (entity, attribute, newValue, isAddition) => updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, newValue, isAddition )  } ),
      postDatoms: async newDatoms => updateState( State, {DB: await Transactor.postDatoms( State.DB, newDatoms)  } ),
    })
  }

  
// ADMIN PAGE VIEWS

//Basic entity views

let entityLabel = (State, entity, onClick, isSelected) => State.DB.isEntity(entity)
  ?  d([d( 
        getEntityLabel(State.DB, entity), 
        {
          class: "entityLabel", 
          style: `background-color:${State.DB.get( State.DB.get( entity, "entity/entityType"), "entityType/color") ? State.DB.get( State.DB.get( entity, "entity/entityType"), "entityType/color") : "gray"}; ${(isSelected || State.S["AdminPage/selectedEntity"] === entity ) ? "border: 2px solid black;" : ""}`
        }, 
        "click", 
        isDefined(onClick) ? onClick : e => State.Actions.selectEntity( entity )
      )], {style:"display: inline-flex;"})
  : d(`[${ entity}] na.`, {class: "entityLabel", style: `background-color:gray;`})


let entityLabelWithPopup = ( State, entity, onClick, isSelected) => d([
d([
  entityLabel( State, entity, onClick, isSelected),
  entityPopUp( State, entity ),
], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"} )

let entityPopUp = (State, entity) => d([
  entityLabel( State, entity ),
  br(),
  d( getEntityLabel( State.DB, State.DB.get(entity, "entity/entityType") )  ),
  br(),
  d( State.DB.get( entity, "entity/doc") ? State.DB.get( entity, "entity/doc") : "" ),
  br(),
  span(`Entitet: ${ entity}`),
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

//AdminEntityLabel



let adminEntityLabelWithPopup = ( State, entity, onClick, isSelected) => d([
d([
  entityLabel( State, entity, onClick, isSelected),
  adminEntityPopUp( State, entity ),
], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"} )

let adminEntityPopUp = (State, entity) => d([
h3( `${ State.DB.get( entity, "entity/label") ? State.DB.get( entity, "entity/label") : "Mangler visningsnavn."}` ),
d([
  d([span( `Entitet`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`})], {style:"display: inline-flex;"}),
  d(String(entity)),
], {class: "columns_1_1"}),
d([
  entityLabel( State,  47 ),
  entityLabel( State,  State.DB.get( entity, "entity/entityType" ) ),
], {class: "columns_1_1"}),
br(),
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})




//NEW VIEWS

let prevNextEntityButtonsView = State => {

  let selectedEntityType = State.DB.get(State.S["AdminPage/selectedEntity"], 19)
  let selectedEntityCategory = State.DB.get(State.S["AdminPage/selectedEntity"], 14)

  let entities = State.DB.getAll( selectedEntityType ).filter( e => State.DB.get(e, 14) === selectedEntityCategory ).sort( (a,b) => a-b )

  let prevEntity = entities[ entities.findIndex( t => t === State.S["AdminPage/selectedEntity"] ) - 1 ]
  let nextEntity = entities[ entities.findIndex( t => t === State.S["AdminPage/selectedEntity"] ) + 1 ]

  return d([
    isDefined( prevEntity ) >= 1 ? submitButton("<", () => State.Actions.selectEntity( prevEntity ) ) : d(""),
    isDefined( nextEntity ) < entities.length ? submitButton(">", () => State.Actions.selectEntity( nextEntity ) ) : d(""),
  ], {style: gridColumnsStyle("3fr 1fr")})
}

let entityView = (State, entity) => isDefined(entity)
  ? isDefined(State.DB.get(entity, "entity/entityType"))
    ? d([
      d([
        d([span( `Entitet`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`})], {style:"display: inline-flex;"}),
        entityLabelWithPopup( State, entity),
        prevNextEntityButtonsView( State )
      ], {class: "columns_1_1_1"}),
      d( State.DB.get( State.DB.get(entity, "entity/entityType"), "entityType/attributes" ).map( attribute => entityAttributeView(State, entity, attribute) ) ),
      d([
        submitButton( "Slett", e => State.Actions.retractEntity(entity) ),
        submitButton( `Opprett ny ${h3( `${ State.DB.get( State.DB.get(entity, "entity/entityType"), "entity/label") ? State.DB.get( State.DB.get(entity, "entity/entityType"), "entity/label") : "Mangler visningsnavn."}` ) } `, e => State.Actions.createEntity( State.DB.get(entity, "entity/entityType") ) ),
        submitButton( "Lag kopi", e => State.Actions.duplicateEntity( entity ) ),
      ])
    ], {class: "feedContainer"} )
    : d([
        h3("Entitet med feil"),
        prevNextEntityButtonsView( State ),
        d( JSON.stringify(State.DB.get(entity)) ),
        entityAttributeView(State, entity, 19),
        submitButton( "Slett", e => State.Actions.retractEntity(entity) ),
      ])
  : d("Ingen entitet valgt", {class: "feedContainer"})

let entityVersionLabel = (State, entity, attribute) => d([
  d([
    d( "v" + State.DB.getEntityAttribute(entity, attribute).Datoms.length, {style: "padding: 3px;background-color: #46b3fb;color: white;margin: 5px;"} ),
    entityVersionPopup( State, entity, attribute )
  ], {class: "popupContainer"})
  ], {style:"display: inline-flex;"} )

let entityVersionPopup = (State, entity, attribute) => {

  let EntityDatoms = State.DB.getEntity( entity ).Datoms.filter( Datom => Datom.attribute === State.DB.attrName(attribute) )

  return d([
    d([
      d( "Endret"),
      d("Tidligere verdi")
    ], {style: gridColumnsStyle("2fr 2fr 1fr")}),
      d( EntityDatoms.reverse().slice(1, 5).map( Datom => d([
        d( moment(Datom.tx).format("YYYY-MM-DD") ),
        d(JSON.stringify(Datom.value)),
        submitButton( "Gjenopprett", async e => updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, Datom.attribute, Datom.value )} )
        )
      ], {style: gridColumnsStyle("2fr 2fr 1fr")})   ) )
    ], {class: "entityInspectorPopup", style: "width: 400px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
}



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
    ])  ) ),
    br(),
    h3("Mangler type"),
    d( State.DB.getAll(undefined).map( entity => adminEntityLabelWithPopup( State, entity ) ) )
  ],{class: "feedContainer"})