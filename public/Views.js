let IDcounter = [0];
let getNewElementID = () => String( IDcounter.push( IDcounter.length  ) )

//Datom creation functions
let newDatom = (entity, attribute, value, isAddition) => returnObject({entity, attribute, value, isAddition: isAddition === false ? false : true })

let filterUniqueValues = (value, index, self) => self.indexOf(value) === index

function split(array, isValid) {
  return array.reduce(([pass, fail], elem) => {
    return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
  }, [[], []]);
}

let ifError = (value, fallback) => value ? value : fallback
let ifNot = (test, ifNot, then) => test ? then : ifNot

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
let h3 = content => htmlElementObject("h3", {} , content)
let input = (attributesObject, eventType, action) => htmlElementObject("input", attributesObject, "", eventType, action)

let dropdown = (value, optionObjects, updateFunction) => htmlElementObject("select", {id: getNewElementID(), style:"padding: 1em; border: 1px solid lightgray"}, optionObjects.map( o => `<option value="${o.value}" ${o.value === value ? `selected="selected"` : ""}>${o.label}</option>` ).join(''), "change", updateFunction  )

let retractEventButton = (Event, A) => d("Slett hendelse", {class: "textButton"}, "click", e => A.retractEvent(Event) )

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
  d( S.eventCycles.map( (eventCycle, index) => feedContainer(  eventCycle["accumulatedVariables_after"]["company/:allEventsAreValid"] ? validEventView( eventCycle, A ) :  eventValidationView( eventCycle, A ) , eventCycle["eventAttributes"]["event/date"], eventCycle["eventAttributes"]["entity"] )  ), {class: "pageContainer"} ),
]

//Event Cycle Views

let eventTypeHeaderView = (eventType, isApplied) => d( eventType , {style: `background-color: ${isApplied ? "#1073104f" : "#fb9e9e"}; padding: 1em; margin: 1em;`} )

let validEventView = (eventCycle , A) => d([
  eventTypeHeaderView(eventCycle["eventType"], true ),
  attributesTableView(eventCycle["eventAttributes"], A),
  d("<br>"),
  d([
    d(`"outputVariabel"`),
    d(`Beregnet verdi`),
    ], {class: "eventInspectorRow"}),
  d( Object.keys(eventCycle["eventPatch"]).map( companyVariable =>  d([
    d(`${companyVariable}:`),
    input({value: eventCycle["eventPatch"][companyVariable], style: "text-align: right;", disabled: "disabled"}),
    ], {class: "eventInspectorRow"})) ),
  d("<br>"),
])

let eventValidationView = (eventCycle , A) => d([
  eventTypeHeaderView(eventCycle["eventType"], false ),
  d("<br>"),
  attributesTableView(eventCycle["eventAttributes"], A),
  h3("Valideringsfeil:"),
  d( eventCycle["accumulatedVariables_after"]["company/:currentEventValidationErrors"].map( validator => d( `[${validator["type"]}: ${validator["validator"]}]: ${validator["errorMessage"]}<br> `)))
])

let attributesTableView = (selectedEvent, A) => d([
  d([
    d(`Attributt`),
    d(`Oppgitt verdi`),
    ], {class: "eventInspectorRow"}),
  d(Object.keys(selectedEvent).map( attribute =>  d([
    d(`${attribute}:`),
    input({value: selectedEvent[ attribute ], style: "text-align: right;"}, "change", e => A.updateEventAttribute( selectedEvent, attribute, e) ),
    ], {class: "eventInspectorRow"})) ),
  d("<br>")
])

let validatorWithLabelView = (label, isValid) => d([
  d(label),
  input({value: isValid, disabled: "disabled", style: `text-align: right; background-color: ${isValid ? "#1073104f" : "#fb9e9e" };"`}),
], {class: "eventInspectorRow"})