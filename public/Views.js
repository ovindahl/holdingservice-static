let IDcounter = [0];
let getNewElementID = () => String( IDcounter.push( IDcounter.length  ) )



//HTML element generation
let isVoid = tagName => ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"].includes(tagName)
let htmlElementObject = (tagName, attributesObject, innerHTML, eventType, action) => {

  let isArray = Array.isArray(innerHTML)
  let isString = typeof innerHTML === "string"
  let isEither = (isArray || isString)

  if( !isEither ){console.log("ERROR: innerHTML is not array or string:", tagName, attributesObject, innerHTML, eventType, action)} //should input null for void elements?
  
  let id = getNewElementID()
  let attributes = mergerino(attributesObject, {id: id} )
  
  let children = Array.isArray(innerHTML) ? innerHTML : []
  let ownInnerHTML = typeof innerHTML === "string" ? innerHTML : ""
  let openingTag = `<${tagName} ${Object.entries(attributes).map( (keyValuePair) => ` ${keyValuePair[0]}="${keyValuePair[1]}" `).join('')}>` 
  let closingTag = `</${tagName}>`
  let childrenHTML = children.map( child => child.html ).join('')
  let html = isVoid(tagName) ? openingTag : openingTag + ownInnerHTML + childrenHTML + closingTag
  

  let ownEventListeners = (eventType && action) ? [{eventType, action, id}] : []
  let childrenEventListeners = children.map( child => child.eventListeners ).flat()
  let eventListeners = ownEventListeners.concat(childrenEventListeners)

  return {tagName, attributes, innerHTML, eventListeners, html}  

}
let d = (innerHTML, attributesObject, eventType, action) => htmlElementObject("div", attributesObject, innerHTML , eventType, action )
let h3 = (content, attributesObject)  => htmlElementObject("h3", attributesObject , content)
let input = (attributesObject, eventType, action) => htmlElementObject("input", attributesObject, "", eventType, action)

let dropdown = (value, optionObjects, updateFunction) => htmlElementObject("select", {id: getNewElementID(), style:"padding: 1em; border: 1px solid lightgray"}, optionObjects.map( o => `<option value="${o.value}" ${o.value === value ? `selected="selected"` : ""}>${o.label}</option>` ).join(''), "change", updateFunction  )

let createEventButton = (currentEventEntityID, eventType, A) => d(`Ny hendelse: [${eventType}] `, {class: "textButton"}, "click", e => A.createEvent(currentEventEntityID, eventType) )
let retractEventButton = (entityID, A) => d("Slett hendelse", {class: "textButton"}, "click", e => A.retractEvent(entityID) )

let headerBarView = (S) => d([
  d('<header><h1>Holdingservice Beta</h1></header>', {class: "textButton"}),
  d(`Server version: ${S.serverConfig.serverVersion}`),
  d(`Client app version: ${S.serverConfig.clientVersion}`),
  d(`DB version: ${S.tx}`),
  d(`Server cache updated: ${moment(S.serverConfig.cacheUpdated).format()}`),
  d([
    d("Logg ut", {class: "textButton"}, "click", e => console.log("Log out!")),
    d("Innstillinger", {class: "textButton"}, "click", e => console.log("Innstillinger!"))
  ], {style: "display:flex;"} )
], {style: "padding-left:3em; display:flex; justify-content: space-between;"})

let feedContainer = (content, date, entityID) => d([
  d([content], {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"} ),
  d( `${date} (id: ${entityID} )` , {style: "margin-right: 1em;text-align: right;margin-bottom: 1em;color:#979797;margin-top: 3px;"})
])

let generateHTMLBody = (S, A) => [
  headerBarView(S),
  d( S.Events.filter( E => E["event/incorporation/orgnumber"] ).map( E => E["event/incorporation/orgnumber"] ).filter( filterUniqueValues ).map( orgnumber => d( orgnumber, {class: orgnumber === S.selectedOrgnumber ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {selectedOrgnumber : orgnumber} ) )  ), {style: "display:flex;"}),
  d( S.eventCycles.map( (eventCycle, index) => feedContainer(  eventCycle["isValidEventType"] ? validEventView( eventCycle, A ) :  invalidEventTypeView( eventCycle, A ) , eventCycle["eventAttributes"]["event/date"], eventCycle["eventAttributes"]["entity"] )  ), {class: "pageContainer"} ),
  d( [feedContainer(  accumulatedVariablesView( S.eventCycles[ S.eventCycles.length - 1 ] ) , S.eventCycles[ S.eventCycles.length - 1 ]["eventAttributes"]["event/date"], S.eventCycles[ S.eventCycles.length - 1 ]["eventAttributes"]["entity"] )], {class: "pageContainer"}  ),
]

//Event Cycle Views

let validEventView = (eventCycle , A) => d([
  h3(eventCycle["eventType"], {style: `background-color: ${eventCycle[ "isValid" ] ? "#1073104f" : "#fb9e9e"}; padding: 1em;`} ),
  d([
    historicVariablesTableView(eventCycle),
    d("<br>"),
    attributesTableView(eventCycle, A),
    d("<br>"),
    d( eventCycle[ "accumulatedVariables_after" ]["company/:currentEventCombinedValidators"].filter( validator => !validator["isValid"]).map(  error => d(`[${error.validator}] ${error.errorMessage}`, {style: "background-color: lightgray; color: red; padding: 3px; margin: 3px;"}))),
    d("<br>"),
    outputTableView(eventCycle["eventPatch"]),
    d("<br>"),
    eventCycle["eventType"] === "incorporation" ? d("") : retractEventButton( eventCycle["eventAttributes"]["entity"]  , A),
    d(eventCycle[ "accumulatedVariables_after" ]["company/:applicableEventTypes"].map( eventType => createEventButton( eventCycle["eventAttributes"]["entity"], eventType, A) ))
  ]) 
])

let invalidEventTypeView = (eventCycle, A) => d( JSON.stringify( eventCycle ) )

let historicVariablesTableView = (eventCycle) => d([
  h3("Historiske variabler som brukes"),
  d( getRequiredHistoricalVariables( eventCycle["eventType"] ).map( companyVariable =>  historicVariablesTableRowView(
      companyVariable, 
      eventCycle[ "accumulatedVariables_before" ][companyVariable], 
      eventCycle[ "accumulatedVariables_after" ]["company/:currentEventCompanyVariableValidators"].filter( validator => !validator["isValid"]).filter( validator => validator["companyVariable"] === companyVariable )
      )) ),
  d("<br>"),
  d( eventCycle[ "accumulatedVariables_after" ]["company/:currentEventCompanyValidators"].filter( validator => !validator["isValid"] ).map(  error => d(`[${error.validator}] ${error.errorMessage}`, {style: "background-color: lightgray; color: red; padding: 3px; margin: 3px;"}))),
  d("<br>")
], {style: "background-color: #f1f0f0; padding: 1em;"})

let historicVariablesTableRowView = (companyVariable, value, validators) => d([
  d([
    d(`${companyVariable}:`),
    input({value: value, disabled: "disabled", style: `text-align: right; ${(validators.length === 0) ? "background-color: none;" : "background-color: #ffb1b1;"}`}),
    ], {class: "eventInspectorRow"}),
    d( validators.map( validator => d(`[${validator.validator}] ${validator.errorMessage}`, {style: "background-color: lightgray; color: red; padding: 3px; margin: 3px;"})  ) )
])

let attributesTableView = (eventCycle, A) => d([
  h3("Brukerinput"),
  d( Object.keys(eventCycle["eventAttributes"]).map( attribute =>  attributeTableRowView(
    attribute, 
    eventCycle["eventAttributes"][ attribute ], 
    eventCycle[ "accumulatedVariables_after" ]["company/:currentEventAttributeValidators"].filter( validator => !validator["isValid"]).filter( validator => validator["attribute"] === attribute), 
    e => A.updateEventAttribute( eventCycle["eventAttributes"], attribute, e)) ) 
  ),
  d("<br>"),
  d( eventCycle[ "accumulatedVariables_after" ]["company/:currentEventEventValidators"].filter( validator => !validator["isValid"]).map(  error => d(`[${error.validator}] ${error.errorMessage}`, {style: "background-color: lightgray; color: red; padding: 3px; margin: 3px;"}))),
  d("<br>")
], {style: "background-color: #f1f0f0; padding: 1em;"})


let attributeTableRowView = (attribute, value, validators, onChange) => d([
  d([
    d(`${attribute}`),
    input({value: value, style: `text-align: right; ${(validators.length === 0) ? "background-color: none;" : "background-color: #ffb1b1;"}`}, "change", onChange ),
    ], {class: "eventInspectorRow"}),
    d( validators.map( validator => d(`[${validator.validator}] ${validator.errorMessage}`, {style: "background-color: lightgray; color: red; padding: 3px; margin: 3px;"})  ) )
])

let outputTableView = (eventPatch) => d([
  h3("Beregnet output"),
  d( Object.keys(eventPatch).map( companyVariable =>  d([
      d(`${companyVariable}:`),
      input({value: eventPatch[companyVariable], style: "text-align: right;", disabled: "disabled"}),
      ], {class: "eventInspectorRow"})) ),
  d("<br>")
], {style: "background-color: #f1f0f0; padding: 1em;"})

let accumulatedVariablesView = (eventCycle) => d([
  h3(`Akkumulerte selskapsvariabler etter event ${eventCycle["eventAttributes"]["entity"]}`),
  outputTableView( eventCycle["accumulatedVariables_after"] )
])