 
// ADMIN PAGE VIEWS

//Basic entity views

//AdminEntityLabel

//NEW VIEWS

let prevNextEntityButtonsView = State => {

  let selectedEntityType = State.DB.get(State.S.selectedEntity, 19)
  let selectedEntityCategory = State.DB.get(State.S.selectedEntity, 14)

  let entities = State.DB.getAll( selectedEntityType ).filter( e => State.DB.get(e, 14) === selectedEntityCategory ).sort( (a,b) => a-b )

  let prevEntity = entities[ entities.findIndex( t => t === State.S.selectedEntity ) - 1 ]
  let nextEntity = entities[ entities.findIndex( t => t === State.S.selectedEntity ) + 1 ]

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
        entityLabelWithPopup( State, entity, () => State.Actions.selectEntity( entity ) ),
        prevNextEntityButtonsView( State )
      ], {class: "columns_1_1_1"}),
      d( State.DB.get( State.DB.get(entity, "entity/entityType"), "entityType/attributes" ).map( attribute => adminEntityAttributeView(State, entity, attribute) ) ),
      br(),
      d([
        submitButton( "Slett", () => State.Actions["adminpage/retractEntity"](entity) ),
        submitButton( `Opprett ny ${h3( `${ State.DB.get( State.DB.get(entity, "entity/entityType"), "entity/label") ? State.DB.get( State.DB.get(entity, "entity/entityType"), "entity/label") : "Mangler visningsnavn."}` ) } `, e => State.Actions.createEntity( State.DB.get(entity, "entity/entityType") ) ),
        submitButton( "Lag kopi", e => State.Actions.duplicateEntity( entity ) ),
      ])
    ], {class: "feedContainer"} )
    : d([
        h3("Entitet med feil"),
        prevNextEntityButtonsView( State ),
        d( JSON.stringify(State.DB.get(entity)) ),
        adminEntityAttributeView(State, entity, 19),
        submitButton( "Slett", () => State.Actions["adminpage/retractEntity"](entity) ),
      ])
  : d("Ingen entitet valgt", {class: "feedContainer"})
  
let adminEntityAttributeView = ( State, entity, attribute, isLocked ) => { try {return d([
  entityLabelWithPopup( State, attribute, () => State.Actions.selectEntity( attribute ) ),
  valueView( State, entity, attribute, isLocked ),
  isLocked ? d(""): entityVersionLabel( State, entity, attribute )
], ( State.DB.get(attribute, "attribute/isArray") || State.DB.get(attribute, "attribute/valueType") === 6534 ) ? {style: "margin: 5px;border: 1px solid #80808052;"} : {style:  gridColumnsStyle("3fr 3fr 1fr") + "margin: 5px;"} ) } catch (error) { return d([
  entityLabel( State, attribute),
  d(`ERROR: entity: ${entity}, attribute: ${attribute} `),
  d(error)
], {style:  gridColumnsStyle("3fr 3fr 1fr") + "margin: 5px;"} )( State,  entity, attribute, error ) } } 

let adminPage = State => isAdmin( State )
  ? d([
      d([
        entityLabelWithPopup( State,  47, () => State.Actions.selectEntity( 47 ) ),
        span(" / "  ),
        isDefined(State.S.selectedEntity)
          ? entityLabelWithPopup( State, State.DB.get(State.S.selectedEntity, "entity/entityType"), () => State.Actions.selectEntity( State.DB.get(State.S.selectedEntity, "entity/entityType") )   )
          : span(" ... "),
        span(" / "  ),
        isDefined(State.S.selectedEntity)
          ? entityLabelWithPopup( State,  State.S.selectedEntity )
          : span("Ingen entitet valgt.")
      ]),
      br(),
      d([
        d(""),
      State.DB.get( State.S.selectedEntity, "entity/entityType" ) === 47
          ? d([
            multipleEntitiesView( State, State.S.selectedEntity ),
            br(),
            entityView( State, State.S.selectedEntity )
          ]) 
          : entityView( State, State.S.selectedEntity )
      ])
  ])
  : d("Siden er ikke tilgjengelig.")
  
  let multipleEntitiesView = (State, entityType) => d([
    entityLabelWithPopup( State, entityType, () => State.Actions.selectEntity( entityType )),
    d(State.DB.getAll( entityType   ).map( entity =>State.DB.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).map( category => d([
      h3(category),
      d(State.DB.getAll(entityType).filter( e => State.DB.get(e, "entity/category") === category ).sort( (a,b) => a-b ).map( entity => entityLabelWithPopup( State, entity, () => State.Actions.selectEntity( entity ) ) ) ),
    ])  ) ),
    br(),
    h3("Mangler type"),
    d( State.DB.getAll(undefined).map( entity => entityLabelWithPopup( State, entity, () => State.Actions.selectEntity( entity ) ) ) )
  ],{class: "feedContainer"})