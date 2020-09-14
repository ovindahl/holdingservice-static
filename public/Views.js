let IDcounter = [0];
let getNewElementID = () => String( IDcounter.push( IDcounter.length  ) )

//Datom creation functions
let newDatom = (entity, attribute, value, isAddition) => returnObject({entity, attribute, value, isAddition: isAddition === false ? false : true })

//Mergerino
const assign = Object.assign || ((a, b) => (b && Object.keys(b).forEach(k => (a[k] = b[k])), a))

const run = (isArr, copy, patch) => {
    const type = typeof patch
    if (patch && type === 'object') {
      if (Array.isArray(patch)) for (const p of patch) copy = run(isArr, copy, p)
      else {
        for (const k of Object.keys(patch)) {
          const val = patch[k]
          if (typeof val === 'function') copy[k] = val(copy[k], mergerino)
          else if (val === undefined) isArr && !isNaN(k) ? copy.splice(k, 1) : delete copy[k]
          else if (val === null || typeof val !== 'object' || Array.isArray(val)) copy[k] = val
          else if (typeof copy[k] === 'object') copy[k] = val === copy[k] ? val : mergerino(copy[k], val)
          else copy[k] = run(false, {}, val)
        }
      }
    } else if (type === 'function') copy = patch(copy, mergerino)
    return copy
  }
  
const mergerino = (source, ...patches) => {
    const isArr = Array.isArray(source)
    return run(isArr, isArr ? source.slice() : assign({}, source), patches)
}

//Utils
let createObject = (keyName, value) => Object.assign({}, {[keyName]: value} ) 
let returnObject = (something) => something // a -> a
let logThis = (something, label) => {
console.log( (label) ? label : "Logging this: ", something )
return something
}

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

  if( !isEither ){console.log("ERROR: innerHTML is not array or string:", innerHTML)} //should input null for void elements?
  
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
  d(content, {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"} ),
  d( `${date} (id: ${entityID} )` , {style: "margin-right: 1em;text-align: right;margin-bottom: 1em;color:#979797;margin-top: 3px;"})
])

let generateHTMLBody = (S, A) => [
  headerBarView(S),
  d( S.Events.map( E => E["company/orgnumber"] ).filter( filterUniqueValues ).map( orgnumber => d( orgnumber, {class: orgnumber === S.selectedOrgnumber ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {selectedOrgnumber : orgnumber} ) )  ), {style: "display:flex;"}),
  d( S.Company["company/eventCycles"].map( eventCycle => fullEventCycleView(eventCycle, A)  ), {class: "pageContainer"} )
]

//Event Cycle Views

let prevCompanyDocView = (eventCycle, index) => d( [
    d(`Step ${index}:`),
    d("<br>"),
    d(Object.keys(eventCycle["prevCompany"]).map( attribute =>  d([
      d(`${attribute}`),
      d(`${JSON.stringify(eventCycle["prevCompany"][attribute])}`)
    ] , {class: "eventInspectorRow"}) ) ),
    d("<br>")
], {style: "border: 1px solid lightgray;"} )

let eventTypeView = (eventCycle, index, A) => d( [
  d(`Step ${index}:`),
  d("<br>"),
  d("0. Assigned system variables"),
  d(Object.keys(eventCycle["inputEvent"]).filter( attribute => Attribute.getSystemAttributes().includes(attribute)  ).map( attribute => d([
    d(`${attribute}`),
    d(`${JSON.stringify(eventCycle["inputEvent"][attribute])}`)
  ] , {class: "eventInspectorRow"}) )),
  d("<br>"),
  d("1. Selected eventType"),
  d([
    d("eventType: "),
    dropdown(eventCycle["inputEvent"]["event/eventType"], eventCycle["prevCompany"]["company/applicableEventTypes"].map( eventType => returnObject({label: eventType, value: eventType}) ), e => A.updateEventAttribute(eventCycle["inputEvent"], "event/eventType", e)  )
  ], {class: "eventInspectorRow"}),
  eventCycle["prevCompany"]["company/applicableEventTypes"].includes(eventCycle["inputEvent"]["event/eventType"]) ? d("Selected eventType can be applied to company.") : d("Selected eventType can NOT be applied to company. [Error msg TBD]"),
  d("<br>"),
  d("2. Required historical company variables: "),
  d([
    d(`Variable`),
    d(`Value`),
    d(`Validity/SourceEvent`)
    ], {class: "eventInspectorRow"}),
  d( EventType.getRequiredCompanyInputs(eventCycle["inputEvent"]["event/eventType"]).map( attribute =>  d([
    d(`${attribute}`),
    d(`${JSON.stringify(eventCycle["prevCompany"][attribute])}`),
    d(`TBD`),
  ] , {class: "eventInspectorRow"}) ) ),
  d("<br>"),
  EventType.isApplicable( eventCycle["inputEvent"]["event/eventType"], eventCycle["prevCompany"] ) ? d("The current values of companyInputs are valid for the eventType.") : d("The current values of companyInputs are NOT valid for the eventType. [Error msg TBD]"),
  d("<br>"),
  d("TBD: Specify on single variable level and combined level separately", {style: "color: red;"} ),
  d("<br>"),
  d("3. Required user inputs: "),
  d([
    d(`Attribute`),
    d(`User input`),
    d(`Validity`)
    ], {class: "eventInspectorRow"}),
  d(EventType.getRequiredAttributes(eventCycle["inputEvent"]["event/eventType"]).map( attribute =>  d([
    d(`${attribute}:`),
    input({value: eventCycle["inputEvent"][attribute], style: "text-align: right;"}, "change", e => A.updateEventAttribute(eventCycle["inputEvent"], attribute, e) ),
    d(`${Attribute.validate( attribute, eventCycle["inputEvent"][attribute]) ? "valid" : "invalid"}`)
    ], {class: "eventInspectorRow"})) ),
  d("<br>"),
  EventType.isValid( eventCycle["inputEvent"] ) ? d("Combination of event inputs are valid.") : d("Combination of event inputs are not valid. [Error msg TBD]"),
  d("<br>"),
  d("4. Calculated outputs: "),
  d(Object.keys(eventCycle["updatedAttributes"]).map( attribute => d([
    d(`${attribute}`),
    d(`${JSON.stringify(eventCycle["updatedAttributes"][attribute])}`)
  ] , {class: "eventInspectorRow"}) ) ),
  d("<br>"),
  d("TBD: Should add available next events.", {style: "color: red;"}),
], {style: "border: 1px solid lightgray;"} )

let companyDocView = (eventCycle, index) => d( [
  d(`Step ${index}:`),
  d("<br>"),
  d(Object.keys(eventCycle["Company"]).map( attribute =>  d([
    d(`${attribute}`),
    d(`${JSON.stringify(eventCycle["Company"][attribute])}`)
  ] , {class: "eventInspectorRow"}) ) ),
  d("<br>")
], {style: "border: 1px solid lightgray;"} )

let addNewEventView = (eventCycle, index, A) => d( [
  d(`Step ${index}:`),
  d(`Add new event`),
  d("<br>"),
  d([
    d("eventType: "),
    dropdown("", eventCycle["Company"]["company/applicableEventTypes"].map( eventType => returnObject({label: eventType, value: eventType}) ), e => A.updateEventAttribute(eventCycle["inputEvent"], "event/eventType", e)  )
  ], {class: "eventInspectorRow"}),
  d("<br>")
], {style: "border: 1px solid lightgray;"} )

let eventCycleViews = [
  eventCycle => h3(` Hendelse nr. ${eventCycle["eventCycle"]} `),
  prevCompanyDocView,
  eventTypeView,
  companyDocView, 
  addNewEventView
]

let fullEventCycleView = ( eventCycle, A ) => feedContainer( eventCycleViews.map( (viewFunction, index) => viewFunction(eventCycle, index, A) ), eventCycle["inputEvent"]["event/date"], eventCycle["inputEvent"]["entity"] )

//Event Cycle Views - END


// COMPANY DOCUMENT CREATION PIPELINE

let getCalculatedOutputs = ( prevCompany, Event ) => mergerino( {}, Object.entries( 
    EventType.getDependencies(Event["event/eventType"]  ).reduce( (updatedAttributes, functionName) => mergerino(updatedAttributes, createObject(functionName, outputFunction.calculate(functionName, prevCompany, Event ) )  ), Event  ) 
  ).filter( entry => !Object.keys(Event).includes(entry[0])  ).map( entry => createObject(entry[0], entry[1]) )
  ) 

let createEventCycle = (prevCompany, inputEvent) => {

  let eventCycle = prevCompany["company/eventCycle"] + 1
  let eventIsValid = isValidEvent(inputEvent)
  let eventIsApplicable = isApplicableEvent(prevCompany, inputEvent)
  let updatedAttributes = getCalculatedOutputs( prevCompany, inputEvent  )
  let Company = mergerino( prevCompany, updatedAttributes )

  return {eventCycle, prevCompany, inputEvent, eventIsValid, eventIsApplicable, updatedAttributes, Company}    
}

let createCompanyDoc = (Events) => returnObject({
  "company/name": "TBD",
  "company/eventCycles": Events.map( (Event, index) =>  Events.slice(0, index + 1).reduce( (prevCompany, inputEvent) => createEventCycle(prevCompany, inputEvent) , getInitialCompany() ) )
})

let getInitialCompany = () => returnObject({
  "company/eventCycle": 0,
  "company/eventCycles": [],
  "company/applicableEventTypes": ["incorporation"],
})



//Validators

let validationPipeline = (input) => [].every( criteriumFunction => criteriumFunction(input)  )

let isApplicableEvent = (Company, Event) => EventType.isApplicable( Event["event/eventType"], Company )

let isValidEvent = (Event) => [
  (Event) => EventType.getAllEventTypes().includes( Event["event/eventType"] ), //Event has a valid event type
  (Event) => EventType.getRequiredAttributes(Event["event/eventType"]).every( attribute => Object.keys( Event ).includes( attribute ) ), //Event has all required attributes
  (Event) => EventType.getRequiredAttributes(Event["event/eventType"]).every( attribute => Attribute.validate(attribute, Event[ attribute ] ) ), //All attribute values are valid
  (Event) => EventType.isValid(Event)                    //getEventTypeInputCriteria(Event).every( criterumFunction =>  criterumFunction(Event) ), //All event level input criteria are fulfilled
].every( criteriumFunction => criteriumFunction(Event)  )



// COMPANY DOCUMENT CREATION PIPELINE - END




//CONFIG DATA - END

let decisionTree = {
  conditions: [
    input => input === "test1" ? 1 : 0,
    input => input === "test2" ? 1 : 0
  ],
  outcomes: {
    "00": (input) => input,
    "01": (input) => input,
    "10": (input) => input,
    "11": (input) => input
  }
}




//Archive

/* let attributeDatoms = [
  newDatom("entity/type", "attr/name", "entity/type"),
  newDatom("entity/type", "attr/valueType", "string"),
  newDatom("entity/type", "attr/doc", "Selection between a defined set of entity types, such as 'User', 'Event' etc. "),
  newDatom("event/eventType", "attr/name", "event/eventType"),
  newDatom("event/eventType", "attr/valueType", "string"),
  newDatom("event/eventType", "attr/doc", "Sub-categorization of eventTypes of Event entities."),
  newDatom("event/index", "attr/name", "event/index"),
  newDatom("event/index", "attr/valueType", "number"),
  newDatom("event/index", "attr/doc", "The index of a given event in the timeline of a given company."),
  newDatom("event/date", "attr/name", "event/date"),
  newDatom("event/date", "attr/valueType", "string"),
  newDatom("event/date", "attr/doc", "YYYY-MM-DD date to show on the company's timeline."),
  newDatom("event/incorporation/nominalSharePrice", "attr/name", "event/incorporation/nominalSharePrice"),
  newDatom("event/incorporation/nominalSharePrice", "attr/valueType", "number"),
  newDatom("event/incorporation/nominalSharePrice", "attr/doc", "The nominal share price (in 1.00 NOK) of a company at incorporation, as per the articles of assembly."),
]

let getAttributeDatoms = (attributeName, valueType, doc) => [
  newDatom(attributeName, "attr/name", attributeName),
  newDatom(attributeName, "attr/valueType", valueType),
  newDatom(attributeName, "attr/doc", doc),
]

let orgnr = getAttributeDatoms("event/incorporation/orgnumber", "string", "Norwegian organizational number as according to the company's articles of assembly.") */