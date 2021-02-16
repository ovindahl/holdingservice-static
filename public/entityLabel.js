
let entityLabelWithPopup = ( State, entity, onClick ) => {

    let entityTypeLabelController = {
      "7948": transactionLabel,
      "7979": actorLabel,
      "7932": nodeLabel,
      "10062": sourceDocumentLabel
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
      getEntityLabel(State.DB, entity), 
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


  
let transactionLabelText = (State, companyTransaction) => d([d(`Transaksjon ${ State.DB.get(companyTransaction, 8354) }`, {class: "entityLabel", style: `background-color:${State.DB.get( State.DB.get(companyTransaction, "transaction/transactionType"), 20  )};`}, "click", () => State.Actions.selectEntity(  companyTransaction, TransactionsPage.entity ) )], {style:"display: flex;"})
  
let transactionLabel = (State, companyTransaction) => d([
  d([
    transactionLabelText( State, companyTransaction ),
    entityPopUp( State, companyTransaction ),
  ], {class: "popupContainer", style:"display: inline-flex;"})
  ], {style:"display: inline-flex;"} )


  //__

  
  //---
  
  let nodeLabelText = (State, node, onclick) => d([d(State.DB.get(node, 6), {class: "entityLabel", style: `background-color:${ State.DB.get(node, "entity/entityType") === 10617 ? "#79554852" : State.DB.get(State.DB.get(node, "balanceObject/balanceObjectType") , 20)};`}, "click", isDefined(onclick) ? onclick : () => State.Actions.selectEntity(node, BalancePage.entity) )], {style:"display: flex;"})
  
  let nodeLabel = (State, node, onclick) => d([
    d([
      nodeLabelText( State, node, onclick ),
      entityPopUp( State, node ),
    ], {class: "popupContainer", style:"display: inline-flex;"})
    ], {style:"display: inline-flex;"} )
  
  
//---
  
let sourceDocumentLabelText = (State, sourceDocument, onclick) => d([d(
  State.DB.get(sourceDocument, 10070) === 10132
    ? `[${ moment( State.DB.get(sourceDocument, 1757) ).format('DD/MM/YYYY')}] Banktransaksjon: ${formatNumber( State.DB.get(sourceDocument, 10107) ) } `
    : `${State.DB.get(sourceDocument, 10401) ? "✅" : "🚧"} ${State.DB.get(State.DB.get(sourceDocument, 10070), 6)}`,
  {class: "entityLabel", style: `background-color: ${State.DB.get(sourceDocument, 10070) === 10132 ? "#75c6bf" : "#ffc10785"} ;`}, 
  "click", 
  isDefined(onclick) 
    ? onclick 
    : () => State.Actions.selectSourceDocument( sourceDocument ) 
  )], {style:"display: flex;"})
  
let sourceDocumentLabel = (State, sourceDocument, onclick) => d([
  d([
    sourceDocumentLabelText( State, sourceDocument, onclick ),
    entityPopUp( State, sourceDocument ),
  ], {class: "popupContainer", style:"display: inline-flex;"})
  ], {style:"display: inline-flex;"} )

//--------


let actorLabelText = (State, actor, onclick) => d([d( State.DB.get(actor, 8668) === 8666 ? State.DB.get(actor, 1001) : State.DB.get(actor, 1113) , {class: "entityLabel", style: `background-color:#bfd1077a;`}, "click", isDefined(onclick) ? onclick : () => State.Actions["ActorsPage/selectActor"](actor) )], {style:"display: flex;"})
  
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
