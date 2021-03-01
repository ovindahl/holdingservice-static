//NB: Brukes av kalkulerte verdier 
let criteriumIsValid = (State, entity, criterium) => new Function( [`Database`, `Entity`] , State.DB.get(criterium, 6792 ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") )( State.DB, {entity, get: attr => State.DB.get(entity, attr)} )

let buttonLabel = (State, entity, action, isActive) => d([d( 
    `${State.DB.get(action, 6)}`, 
    {class: isActive ? "activeButtonLabel" : "disabledButtonLabel" }, 
    "click", 
    isActive 
      ? async () => {

      let updatedDB = await Transactor.postDatoms( State.DB, State.DB.get(entity, State.DB.get(action, 11523) ) )
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



let subTypeAttribute = entityType => returnObject({
  "7979": 8668, //actor
  "10062": 10070, //event
  "11472": 11688, //sourceDocment
})[ entityType ]


let entityActionsView = (State, entity) => d([
  h3("Handlinger"),
  d( State.DB.get( State.DB.get(entity, subTypeAttribute( State.DB.get(entity, 19) ) )  , 11583).map( action =>  eventActionButton( State, State.S.selectedEntity, action ) )  )
], {class: "feedContainer"}) 

//-------------


let getEntityLabelText = (State, entity) => {

  let entityType = State.DB.get(entity, 19)

  let entityTypeLabelController = {
    "7948": (State, entity) => `Transaksjon ${ State.DB.get(entity, 8354) }`,
    "7979": (State, entity) => State.DB.get(entity, 6),
    "7932": (State, entity) => State.DB.get(entity, 6),
    "10062": (State, entity) =>  `[${ moment( State.DB.get(entity, 1757) ).format('DD/MM/YYYY')}] ${formatNumber( State.DB.get(entity, 10470) ) } ${State.DB.get(entity, 9084) === 9086 ? "💸" : "💰"} `
  }

  return isDefined( entityTypeLabelController[ entityType ])
    ? entityTypeLabelController[entityType](State, entity)
    : getEntityLabel(State.DB, entity)


}


let entityLabelWithPopup = ( State, entity, onClick ) => {

    let entityTypeLabelController = {
      "7979": actorLabel,
      "10062": eventLabel,
      "11472": sourceDocumentLabel
    }
    
    return isDefined( entityTypeLabelController[ State.DB.get(entity  , "entity/entityType") ])
    ? entityTypeLabelController[ State.DB.get( entity , "entity/entityType") ]( State, entity, onClick )
    : d([
        d([
          entityLabel( State, entity, onClick ),
          entityPopUp( State, entity ),
        ], {class: "popupContainer", style:"display: inline-flex;"})
      ], {style:"display: inline-flex;"} )
    } 

let entityLabel = (State, entity, onClick ) => State.DB.isEntity(entity)
?  d([d( 
    getEntityLabelText(State, entity), 
      {
        class: "entityLabel", 
        style: `background-color:${State.DB.get( State.DB.get( entity, "entity/entityType"), "entityType/color") ? State.DB.get( State.DB.get( entity, "entity/entityType"), "entityType/color") : "gray"}; ${( State.S.selectedEntity === entity || State.S.selectedAccountingYear === entity) ? "border: 2px solid black;" : ""}`
      }, 
      "click", 
      isDefined(onClick) ? onClick : null
    )], {style:"display: inline-flex;"})
: d(`[${ entity}] na.`, {class: "entityLabel", style: `background-color:gray;`})



let entityPopUp = (State, entity) => d([
  h3( getEntityLabel( State.DB, entity ) ),
  d( getEntityLabel( State.DB, State.DB.get(entity, "entity/entityType") )  ),
  span(`Entitet: ${ entity}`),
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

  
//---
  
let eventLabelText = (State, event, onclick) => d([d(`📅 Hendelse ${ State.DB.get(event, 11975) }: ${State.DB.get( State.DB.get(event, 10070), 6 )}`, {class: "entityLabel", style: `background-color:#bade90;`}, "click", isDefined(onclick) ? onclick : () => State.Actions.selectEntity(  event, EventPage.entity ) )], {style:"display: inline;"})
  
let eventLabel = (State, sourceDocument, onclick) => d([
  d([
    eventLabelText( State, sourceDocument, onclick ),
    entityPopUp( State, sourceDocument ),
  ], {class: "popupContainer", style:"display: inline-flex;"})
  ], {style:"display: inline-flex;"} )

//---
  
let sourceDocumentLabelText = (State, sourceDocument, onclick) => d([d(
  ` 🗃️ ${State.DB.get(sourceDocument, 6)}`,
  {class: "entityLabel", style: `background-color: #03a9f44f;`}, 
  "click", 
  isDefined(onclick) 
    ? onclick 
    : () => State.Actions.selectEntity( sourceDocument, SourceDocumentsPage.entity ) 
  )], {style:"display: inline;"})
  
let sourceDocumentLabel = (State, sourceDocument, onclick) => d([
  d([
    sourceDocumentLabelText( State, sourceDocument, onclick ),
    entityPopUp( State, sourceDocument ),
  ], {class: "popupContainer", style:"display: inline-flex;"})
  ], {style:"display: inline-flex;"} )


//--------


let actorLabelText = (State, actor, onclick) => d([d( `${State.DB.get(actor, 8668) === 8667 ? "👨‍💼" : "🏢"} ${State.DB.get(actor, 6)}` , {class: "entityLabel", style: `background-color:#8bc34a7d;`}, "click", isDefined(onclick) ? onclick : () => State.Actions.selectEntity( actor, ActorsPage.entity ) )], {style:"display: inline;"})
  
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
