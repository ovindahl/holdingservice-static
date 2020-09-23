
//HTML element generation
let IDcounter = [0];
let getNewElementID = () => String( IDcounter.push( IDcounter.length  ) )
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

let createEventButton = (appliedEvent, newEventType, A) => d(`[Ny hendelse: ${newEventType}] `, {class: "textButton"}, "click", e => A.createEvent(appliedEvent, newEventType) )
let retractEventButton = (entityID, A) => d("Slett hendelse", {class: "textButton"}, "click", e => A.retractEvent(entityID) )

//Page frame

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

let companySelectionMenuRow = (S, A) => d( S.Events.filter( E => E["event/incorporation/orgnumber"] ).map( E => E["event/incorporation/orgnumber"] ).filter( filterUniqueValues ).map( orgnumber => d( orgnumber, {class: orgnumber === S.selectedOrgnumber ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {selectedOrgnumber : orgnumber} ) )  ), {style: "display:flex;"})
let pageSelectionMenuRow = (S, A) => d( ["timeline", "companyDoc"].map( pageName => d( pageName, {class: pageName === S.currentPage ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {currentPage : pageName} ) )  ), {style: "display:flex;"})

let generateHTMLBody = (S, A) => [
  headerBarView(S),
  companySelectionMenuRow(S, A),
  pageSelectionMenuRow(S, A),
  pageRouter[ S.currentPage ]( S, A )  
]

let pageRouter = {
  "timeline": (S, A) => timelineView(S.companyDoc, A),
  "companyDoc": (S, A) => d( [feedContainer(  companyDocView( S.companyDoc ) , "na." , "na." )], {class: "pageContainer"})
}

//Event Cycle Views

let timelineView = (companyDoc, A) => d([
  d( companyDoc["company/:appliedEvents"].map( appliedEvent => feedContainer(  appliedEventView( appliedEvent, A ) , appliedEvent["event/date"], appliedEvent["entity"] )  ), {class: "pageContainer"}),
  d( companyDoc["company/:rejectedEvents"].map( rejectedEvent => feedContainer(  rejectedEventView( rejectedEvent, A ) , rejectedEvent["event/date"], rejectedEvent["entity"] )  ), {class: "pageContainer"})
])

let appliedEventView = (appliedEvent , A) => d([
    h3(appliedEvent["event/eventType"], {style: `background-color: #1073104f; padding: 1em;`} ),
    systemAttributesTableView(appliedEvent),
    d("<br>"),
    historicVariablesTableView(appliedEvent),
    d("<br>"),
    attributesTableView(appliedEvent, A),
    d("<br>"),
    outputTableView(appliedEvent),
    d("<br>"),
    appliedEvent["event/eventType"] === "incorporation" ? d("") : retractEventButton( appliedEvent["entity"], A),
    d( Object.keys(eventTypes).map( newEventType => createEventButton( appliedEvent, newEventType, A) ))
])

let rejectedEventView = (rejectedEvent , A) => d([
  h3(rejectedEvent["event/eventType"], {style: `background-color: #fb9e9e; padding: 1em;`} ),
  d( rejectedEvent["event/:eventErrors"].map( error => d(error, {style: "background-color: lightgray; color: red; padding: 3px; margin: 3px;"})  )),
  d("<br>"),
  systemAttributesTableView(rejectedEvent),
  d("<br>"),
  historicVariablesTableView(rejectedEvent),
  d("<br>"),
  attributesTableView(rejectedEvent, A),
  d("<br>"),
  rejectedEvent["event/eventType"] === "incorporation" ? d("") : retractEventButton( rejectedEvent["entity"], A),
  d( Object.keys(eventTypes).map( newEventType => createEventButton( rejectedEvent, newEventType, A) ))
])


let historicVariablesTableView = (appliedEvent) => d([
  h3("Historiske kalkulerte felter som brukes"),
  d( getRequiredHistoricalVariables( appliedEvent["event/eventType"] ).map( companyVariable =>  historicVariablesTableRowView(
      companyVariable, 
      appliedEvent[companyVariable]
      )) ),
  d("<br>")
], {style: "background-color: #f1f0f0; padding: 1em;"})

let historicVariablesTableRowView = (companyVariable, value, errors) => d([
  d([
    d(`${companyVariable}:`),
    input({value: value, disabled: "disabled", style: `text-align: right; ${!errors ? "background-color: none;" : "background-color: #ffb1b1;"}`}),
    ], {class: "eventInspectorRow"})
])

let systemAttributesTableView = (appliedEvent) => d([
  h3("Systemattributter"),
  d( getSystemAttributes().map( companyVariable =>  d([
    d(`${companyVariable}:`),
    input({value: appliedEvent[companyVariable], style: "text-align: right;", disabled: "disabled"}),
    ], {class: "eventInspectorRow"})) ),
  d("<br>")
], {style: "background-color: #f1f0f0; padding: 1em;"})

let attributesTableView = (appliedEvent, A) => d([
  h3("Attributter"),
  d( getRequiredAttributes( appliedEvent["event/eventType"] ) .map( attribute =>  attributeTableRowView(
    attribute, 
    appliedEvent[ attribute ],
    e => A.updateEventAttribute( appliedEvent, attribute, e)) ) 
  ),
  d("<br>")
], {style: "background-color: #f1f0f0; padding: 1em;"})

let attributeTableRowView = (attribute, value, onChange) => d([
  d([
    d(`${attribute}`),
    input({value: value, style: `text-align: right;`}, "change", onChange ),
    ], {class: "eventInspectorRow"}),
])

let outputTableView = (appliedEvent) => d([
  h3("Kalkulerte felter"),
  d("Hendelsesnivå:"),
  d( Object.keys( appliedEvent ).filter( key => key.startsWith("event/:") ).map( calculatedEventAttribute =>  d([
    d(`${calculatedEventAttribute}:`),
    input({value: appliedEvent[calculatedEventAttribute], style: "text-align: right;", disabled: "disabled"}),
    ], {class: "eventInspectorRow"})) ),
  d("<br>"),
  d("Selskapsnivå:"),
  d( getCalculatedFields_companyLevel( appliedEvent["event/eventType"] ).map( companyVariable =>  d([
      d(`${companyVariable}:`),
      input({value: appliedEvent[companyVariable], style: "text-align: right;", disabled: "disabled"}),
      ], {class: "eventInspectorRow"})) ),
  d("<br>")
], {style: "background-color: #f1f0f0; padding: 1em;"})

let companyDocView = (companyDoc) => d([
  h3("TESTVIEW - companyDoc"),
  d( Object.keys(companyDoc).map( key => d(key, {class: "eventInspectorRow"}) ) )
])