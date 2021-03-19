//NB: Brukes av kalkulerte verdier 
let criteriumIsValid = (State, entity, criterium) => new Function( [`Database`, `Entity`] , State.DB.get(criterium, 6792 ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") )( State.DB, {entity, get: attr => State.DB.get(entity, attr)} )

let buttonLabel = (State, entity, action, isActive) => d([d( 
    `${State.DB.get(action, 6)}`, 
    {class: isActive ? "activeButtonLabel" : "disabledButtonLabel" }, 
    "click", 
    isActive 
      ? async () => {

      let updatedDB = await Transactor.postTransaction( State.DB, State.DB.get(entity, State.DB.get(action, 11523) ) )
      if( updatedDB !== null ){ updateState( State, {DB:updatedDB , S: {selectedEntity: [11572, 11657, 11678, 11736, 12532].includes(action) ? undefined : State.S.selectedEntity} }) }else{ log({ERROR: updatedDB}) }

      }   
      : null
  )], {style:"display: inline-flex;"})


let eventActionButton = (State, entity, action) => d([
  d([
    buttonLabel( State, entity , action, State.DB.get(action, 11561).every( criterium => criteriumIsValid(State, entity, criterium) ) ),
    eventActionPopup( State, entity, action ),
  ], {class: "popupContainer", style:"display: inline-flex;"})
] )


let eventActionPopup = (State, entity, action) => d([
  h3( getEntityLabel( State.DB, action ) ),
  entityLabelWithPopup( State, entity),
  br(),
  d( State.DB.get(action, 11561)
    .filter( criterium => !criteriumIsValid(State, entity, criterium) )
    .map( criterium => d([
      d("❌"),
      d(State.DB.get(criterium, 11568))
  ], {style: gridColumnsStyle("1fr 3fr")})  ) ),
  br(),
  span(`Entitet: ${ action}`),
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})



//--------


let getEntityLabel = (DB, entity) => DB.get(entity, 19) === 7979
  ? `${State.DB.get(entity, 8668) === 8667 ? "👨‍💼" : "🏢"} ${State.DB.get(entity, 6)}`
  : DB.get(entity, 19) === 10062
    ? `#${State.DB.get(entity, 11975)} 📅 ${State.DB.get(entity, 6)}`   
    : DB.get(entity, 19) === 11472
      ? `🗃️ ${State.DB.get(entity, 6)} `
      : DB.get(entity, 19) === 7403
        ? `${State.DB.get(entity, 6)} ` // ${ State.DB.get(State.S.selectedCompany, 12990)( entity ) ? "🔒" : "✏️"
        : `${ DB.get( entity, "entity/label") ? DB.get( entity, "entity/label") : "Mangler visningsnavn."}`

let entityLabelWithPopup = ( State, entity, onClick ) => d([
  d([
    entityLabel( State, entity, onClick ),
    entityPopUp( State, entity ),
  ], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"} )

let entityLabel = (State, entity, onClick ) => isDefined( State.DB.get( entity ) )
?  d([d( getEntityLabel(State.DB, entity), {class: "entityLabel", style: `background-color:${State.DB.get( State.DB.get( entity, "entity/entityType"), "entityType/color") ? State.DB.get( State.DB.get( entity, "entity/entityType"), "entityType/color") : "gray"}; ${( State.S.selectedEntity === entity || State.S.selectedAccountingYear === entity) ? "border: 2px solid black;" : ""}`}, 
      isDefined(onClick) ? "click" : undefined , 
      isDefined(onClick) 
        ? onClick 
        : undefined //() => State.Actions.selectEntity(  entity, State.DB.get( State.DB.get( entity, "entity/entityType"), 7930) )
    )], {style:"display: inline-flex;"})
: d(`[${ entity}] na.`, {class: "entityLabel", style: `background-color:gray;`})



let entityPopUp = (State, entity) => d([
  h3( getEntityLabel( State.DB, entity ) ),
  d([ entityLabel( State, State.DB.get(entity, "entity/entityType") ), ]),
  br(),
  /* State.DB.get(entity, 19) === 7979
    ? temporalEntityAttributeView( State, entity, 12496, State.S.selectedEventIndex )
    : d(""), */
  span(`Entitet: ${ entity}`),
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

let tinyEventLabel = (State, event ) => d([d(`📅 H${State.DB.get(event, 11975)} `, {class: "entityLabel", style: `display: inline-flex;background-color:#bade90;`}, "click", () => State.Actions.selectEntity(  event, EventPage.entity ) )], {style:"display: inline;padding-left: 1em;"})


let entityErrorView = (State, error) => d([
  h3("Oops!"),
  d("Det har skjedd en feil."),
  br(),
  d("Entitet: " + State.S.selectedEntity),
  br(),
  d( String(error) )
])