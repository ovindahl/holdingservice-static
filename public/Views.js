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
  d( S.eventCycles.map( eventCycle => feedContainer( eventCycle.isApplied ? appliedEventV(eventCycle, A) :  invalidEventView(eventCycle, A) , eventCycle["inputEvent"]["event/date"], eventCycle["inputEvent"]["entity"] )  ), {class: "pageContainer"} ),
]

let invalidEventView = (eventCycle, A) =>  d( [
  eventTypeHeaderView( eventCycle["eventType"], eventCycle["isApplied"]),
  d([
    d(`Alle tidligere hendelser er gyldige`),
    input({value: eventCycle["prevEventCycleIsValid"], disabled: "disabled", style: `text-align: right; background-color: ${eventCycle["prevEventCycleIsValid"] ? "#1073104f" : "#fb9e9e" };"`}),
  ], {class: "eventInspectorRow"}),
  d("<br>"),
  companyVarsTableWithValidationView( eventCycle["eventType"], eventCycle["companyVariablesValidation"]),
  attributesTableWithValidationView(eventCycle["inputEvent"], A),
  d("<br>"),
  d("eventValidators:"),
  d(
    eventCycle["eventValidators"].map( eventValidator => d([
      d( eventValidator["validatorName"] ),
      input({value: eventValidator["isValid"], disabled: "disabled", style: `text-align: right; background-color: ${eventValidator["isValid"] ? "#1073104f" : "#fb9e9e" };"`}),
    ], {class: "eventInspectorRow"}))
  ),
  d("<br>"),
  d("combinedValidators:"),
  d(
    eventCycle["combinedValidators"].map( combinedValidator => d([
      d( combinedValidator["validatorName"] ),
      input({value: combinedValidator["isValid"], disabled: "disabled", style: `text-align: right; background-color: ${combinedValidator["isValid"] ? "#1073104f" : "#fb9e9e" };"`}),
    ], {class: "eventInspectorRow"}))
  ),
] )

//Event Cycle Views

let eventTypeHeaderView = (eventType, isApplied) => d( eventType , {style: `background-color: ${isApplied ? "#1073104f" : "#fb9e9e"}; padding: 1em; margin: 1em;`} )

let appliedEventV = (eventCycle, A) => d([
  eventTypeHeaderView(eventCycle["inputEvent"]["event/eventType"], eventCycle["isApplied"]),
  attributesTableView(eventCycle["inputEvent"], A),
  d("<br>"),
  d([
    d(`"outputVariabel"`),
    d(`Beregnet verdi`),
    ], {class: "eventInspectorRow"}),
  d( Object.keys(eventCycle["updatedCompanyVariables"]).map( companyVariable =>  d([
    d(`${companyVariable}:`),
    input({value: eventCycle["updatedCompanyVariables"][companyVariable], style: "text-align: right;", disabled: "disabled"}),
    ], {class: "eventInspectorRow"})) ),
  d("<br>"),
])

let attributesTableView = (inputEvent, A) => d([
  d([
    d(`Attributt`),
    d(`Oppgitt verdi`),
    ], {class: "eventInspectorRow"}),
  d(EventType.getRequiredAttributes(inputEvent["event/eventType"]).map( attribute =>  d([
    d(`${attribute}:`),
    input({value: inputEvent[ attribute ], style: "text-align: right;"}, "change", e => A.updateEventAttribute( inputEvent, attribute, e) ),
    ], {class: "eventInspectorRow"})) ),
  d("<br>")
])

let attributesTableWithValidationView = (inputEvent, A) => d([
  d([
    d(`Attributt`),
    d(`Oppgitt verdi`),
    ], {class: "eventInspectorRow"}),
  d(EventType.getRequiredAttributes(inputEvent["event/eventType"]).map( attribute =>  d([
    d(`${attribute}:`),
    attributeValidatorView(inputEvent, attribute, A),
    ], {class: "eventInspectorRow"})) ),
  d("<br>")
])

let companyVarsTableWithValidationView = ( eventType, companyVariables ) => d([
  d([
    d(`selskapsVariabel`),
    d(`Historisk verdi`),
    ], {class: "eventInspectorRow"}),
  d(logThis(companyVariables).map( companyVariable =>  d([
    d(`${companyVariable["companyVariable"]}:`),
    input({
      value: companyVariable[ "value" ], 
      disabled: "disabled", 
      style: "text-align: right;" + companyVariable["isValid"]
          ? "background-color: #1073104f;" 
          : "background-color: #fb9e9e;"
    })
    ], {class: "eventInspectorRow"})) ),
  d("<br>")
])


let attributeValidatorView = (inputEvent, attribute, A) => {

  let isTechnicallyValid = Attribute.validate( attribute, inputEvent[attribute] )

  let isEventTypeValid = EventType[ "attributeCriteria" ][ inputEvent["event/eventType"] ].every( criterium => AttributeValidators[ criterium["attribute"] ][ criterium["validator"] ] ( inputEvent[ criterium["attribute"] ] ) )


  let backgroundColor = isTechnicallyValid
    ? isEventTypeValid
      ? "background-color: #1073104f;"
      : "background-color: #fddaa6;"
    : "background-color: #fb9e9e;"


  return input({value: inputEvent[ attribute ], style: "text-align: right;" + backgroundColor}, "change", e => A.updateEventAttribute( inputEvent, attribute, e) )
}


//Event Cycle Views - END


// COMPANY DOCUMENT CREATION PIPELINE

let getCalculatedOutputs = ( companyVariablesBeforeEvent, Event ) => mergerino( {}, 
  EventType.getDependencies(Event["event/eventType"]  ).map( functionName => createObject(functionName, outputFunction.calculate(functionName, companyVariablesBeforeEvent, Event ) )  )
)



let eventCycle = (prevEventCycle, inputEvent) => {

  

  

  

  /* 
  let prevEventCycleIsValid = prevEventCycle["isApplied"]
  let companyVarsAreValid = prevEventCycleIsValid 
    ? EventType.hasRequiredCompanyVars( prevEventCycle["companyVariables"], eventType )
      ? EventType[ "companyVariablesValidators" ][ eventType ].every( validatorName => companyVariablesValidators[ validatorName ]( prevEventCycle["companyVariables"]  ))
      : false
    : false

  let attributesAreValid = companyVarsAreValid 
    ? Attribute.validateAttributes(inputEvent) 
      ? EventType[ "attributeCriteria" ][ eventType ].every( criterium => AttributeValidators[ criterium["attribute"] ][ criterium["validator"] ] ( inputEvent[ criterium["attribute"] ] ) )
      : false
    : false

  let eventIsValid = attributesAreValid
    ? EventType[ "eventValidators" ][ eventType ].every( validatorName => eventValidators[ validatorName ]( inputEvent ) )
    : false

  let combinedEventIsValid = eventIsValid
    ? EventType[ "combinedValidators" ][ eventType ].every( validatorName => combinedValidators[ validatorName ]( prevEventCycle["companyVariables"], inputEvent ) )
    : false

  let isApplied = combinedEventIsValid */

  let eventType = inputEvent["event/eventType"]
  let prevCompanyVariables = prevEventCycle["companyVariables"]
  let eventTypeObject = eventTypes[ eventType ]
  let requiredCompanyVariables = eventTypeObject[ "requiredCompanyInputs" ]

  let eventCycle = {
    eventType,
    inputEvent,
    prevEventCycleIsValid: prevEventCycle["isApplied"],
    companyVariablesValidation: requiredCompanyVariables.map( companyVariable => returnObject({
      companyVariable: companyVariable,
      value: prevEventCycle["companyVariables"][companyVariable], 
      isValid: eventTypeObject[ "companyVariableValidators" ].every( validator => companyVariableValidators[ validator["companyVariable"] ][ validator["validator"] ]( prevEventCycle["companyVariables"][ companyVariable ]  ))
    })),
    attributes: eventTypeObject.requiredAttributes.map( attribute =>  returnObject({
      attribute: attribute,
      value: inputEvent[ attribute ], 
      hasValidFormat: Attribute.validators[ attribute ]( inputEvent[ attribute ] ),
      isValid: eventTypeObject[ "attributeCriteria" ].filter( attributeCriterium => attributeCriterium["attribute"] === attribute ).every( criterium => AttributeValidators[ attribute ][ criterium["validator"] ] ( inputEvent[ attribute ] ) ),
    }) ),
    eventValidators: eventTypeObject[ "eventValidators" ].map( validatorName => returnObject({validatorName, isValid: eventValidators[ validatorName ]( inputEvent ) })  ),
    combinedValidators: eventTypeObject[ "combinedValidators" ].map( validatorName => returnObject({validatorName, isValid: combinedValidators[ validatorName ]( prevEventCycle["companyVariables"], inputEvent ) })  ),
    
  }

  eventCycle.isApplied = eventCycle.prevEventCycleIsValid 
    && eventCycle.companyVariablesValidation.every( companyVariable => companyVariable.isValid ) 
    && eventCycle.attributes.every( attribute => attribute.hasValidFormat && attribute.isValid)
    && eventCycle.eventValidators.every( eventValidator => eventValidator.isValid )
    && eventCycle.combinedValidators.every( combinedValidator => combinedValidator.isValid )

  console.log(eventCycle)

  eventCycle.updatedCompanyVariables = eventCycle.isApplied ? getCalculatedOutputs( prevCompanyVariables, inputEvent  ) : {}
  eventCycle.companyVariables = mergerino(prevCompanyVariables, eventCycle.updatedCompanyVariables)

  return eventCycle

  

  
}

let getInitialEventCycle = () =>  returnObject({isApplied: true, prevEventCycle: {}, accumulatedEventsAreValid: true, inputEvent: {}, combinedInputsAreValid: false, eventIsApplicable: false, updatedCompanyVariables: {}, companyVariables: {"company/:applicableEventTypes": ["incorporation"]} })






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

/* 
let eventTypeView = (eventCycle, A) => d( [
  h3(`Event cycle ${""}:`),
  d("<br>"),
  d("0. Assigned system variables"),
  d(Object.keys(eventCycle["inputEvent"]).filter( attribute => Attribute.getSystemAttributes().includes(attribute)  ).map( attribute => d([
    d(`${attribute}`),
    d(`${JSON.stringify(eventCycle["inputEvent"][attribute])}`)
  ] , {class: "eventInspectorRow"}) )),
  d("<br>"),
  d("1A: Validation of pre-existing company variables"),
  d("<br>"),
  d([
    d(`Variable`),
    d(`Source`),
    d(`Value`),
    d(`Validity`)
    ], {class: "eventInspectorRow"}),
  d( EventType.getRequiredCompanyInputs(eventCycle["inputEvent"]["event/eventType"]).map( companyVariable =>  d([
    d(`${companyVariable}`),
    d("history"),
    input({value: ifError( eventCycle["prevEventCycle"]["companyVariables"][companyVariable], "[ N/A ]"), style: "text-align: right;", disabled: "disabled"}),
    EventType["companyVarValidators"][ eventCycle["inputEvent"]["event/eventType"] ].filter( validatorObject => validatorObject["companyVariable"] === companyVariable  ).every( validatorObject => validatorObject[ "validatorFunction" ]( eventCycle["prevEventCycle"]["companyVariables"][ validatorObject["companyVariable"] ] )  ) ? d("valid") : d("invalid", {style: "color: red;"}),
  ] , {class: "eventInspectorRow"}) ) ),
  d("<br>"),
  eventCycle["companyVarsAreValid"] ? d("Combination of companyVariables is valid", {style: "color: green;"}) : d("Combination of companyVariables is not valid", {style: "color: red;"}),
  d("<br>"),
  d("1B: Validation of event input attributes"),
  d("<br>"),
  d([
    d(`Variable`),
    d(`Source`),
    d(`Value`),
    d(`Validity`)
    ], {class: "eventInspectorRow"}),
  d(EventType.getRequiredAttributes(eventCycle["inputEvent"]["event/eventType"]).map( attribute =>  d([
    d(`${attribute}:`),
    d("event"),
    input({value: eventCycle["inputEvent"][attribute], style: "text-align: right;"}, "change", e => A.updateEventAttribute(eventCycle["inputEvent"], attribute, e) ),
    EventType[ "attributeValidators" ][ eventCycle["inputEvent"]["event/eventType"] ].filter( validatorObject => validatorObject["attribute"] === attribute  ).every( validatorObject => validatorObject[ "validatorFunction" ]( eventCycle["inputEvent"][ validatorObject["attribute"] ] ) ) ? d("valid") : d("invalid", {style: "color: red;"}),
    ], {class: "eventInspectorRow"})) ),
  d("<br>"),
  eventCycle["combinedInputsAreValid"] ? d("Combination of event inputs is valid.", {style: "color: green;"}) : d("Combination of event inputs is NOT valid. [Error msg TBD]", {style: "color: red;"}),
  d("<br>"),
  d("1C: Validation of event inputs combined with pre-existing company variables"),
  d("<br>"),
  eventCycle["eventIsApplicable"] ? d("Combination of event inputs and pre-existing company variables is valid.", {style: "color: green;"}) : d("Combination of event inputs and pre-existing company variables is NOT valid. [Error msg TBD]", {style: "color: red;"}),
  d("<br>"),
  d("4. Calculated outputs: "),
  d(Object.keys(eventCycle["updatedCompanyVariables"]).map( attribute => d([
    d(`${attribute}`),
    d(`${JSON.stringify(eventCycle["updatedCompanyVariables"][attribute])}`)
  ] , {class: "eventInspectorRow"}) ) ),
  d("<br>"),
  d("TBD: Should add available next events.", {style: "color: blue;"}),
  d("<br>"),
  d("5. All accumulated company variables: "),
  d(Object.keys(eventCycle["companyVariables"]).map( attribute =>  d([
    d(`${attribute}`),
    d(`${JSON.stringify(eventCycle["companyVariables"][attribute])}`)
  ] , {class: "eventInspectorRow", style: Object.keys(eventCycle["updatedCompanyVariables"]).includes(attribute) ? "color:red;" : ""}) ) ),
  d("<br>"),
  d("TBD: Add source event entity reference for each variable.", {style: "color: blue;"}),
  d("<br>"),
  d("6. Add next event: "),
  d("<br>"),
  d("Ny hendelse [testEvent]", {class: "textButton"}, "click", e => A.createEvent(eventCycle, "testEvent")),
  d("<br>"),
], {style: "border: 1px solid lightgray;"} )
 */


//Validators

/* let createCompanyDoc = (Events) => returnObject({
  "company/name": "TBD",
  "company/eventCycles": Events.sort( (a,b) => a["event/index"] - b["event/index"] ).map( (Event, index) =>  Events.slice(0, index + 1).reduce( (prevEventCycle, inputEvent) => eventCycle2(prevEventCycle, inputEvent) , getInitialEventCycle()  ) )
})

let createEventCycle = (prevEventCycle, inputEvent) => {
  

  let companyVarsAreValid = companyVariablesAreValid( prevEventCycle["companyVariables"] , inputEvent["event/eventType"] )

  let eventAttributesAreValid = [
    Event => EventType.getRequiredAttributes(Event["event/eventType"]).every( attribute => Object.keys( Event ).includes( attribute ) ), //Event has all required attributes
    Event => EventType.getRequiredAttributes(Event["event/eventType"]).every( attribute => Attribute.validate(attribute, Event[ attribute ] ) ), //All attribute values are valid according to global attribute validators
    Event => EventType.validateEventAttributes(Event), //All attribute values are valid according to eventType attribute validators
  ].every( criteriumFunction => criteriumFunction(inputEvent)  )

  let combinedInputsAreValid = EventType.combinedEventInputsAreValid(inputEvent)


  let eventIsApplicable = EventType.isApplicable( prevEventCycle["companyVariables"], inputEvent )

  let updatedCompanyVariables = getCalculatedOutputs( prevEventCycle["companyVariables"], inputEvent  )
  let companyVariables = mergerino( prevEventCycle["companyVariables"], updatedCompanyVariables )

  let eventCycle = {prevEventCycle, companyVarsAreValid, inputEvent, eventAttributesAreValid, combinedInputsAreValid, eventIsApplicable, updatedCompanyVariables, companyVariables}    

  return eventCycle
}

let validationPipeline = (input) => [].every( criteriumFunction => criteriumFunction(input)  )


let companyVariablesAreValid = (companyVariables, eventType) => [
  EventType.prevEventCycleIncludesEventType,
  EventType.hasRequiredCompanyVars,
  EventType.validateCompanyVars
].every( criteriumFunction => criteriumFunction(companyVariables, eventType)  )

let isValidEvent = (Event) => [
  Event => EventType.getRequiredAttributes(Event["event/eventType"]).every( attribute => Object.keys( Event ).includes( attribute ) ), //Event has all required attributes
  Event => EventType.getRequiredAttributes(Event["event/eventType"]).every( attribute => Attribute.validate(attribute, Event[ attribute ] ) ), //All attribute values are valid according to global attribute validators
  Event => EventType.validateEventAttributes(Event), //All attribute values are valid according to eventType attribute validators
  Event => EventType.combinedEventInputsAreValid(Event)                    //getEventTypeInputCriteria(Event).every( criterumFunction =>  criterumFunction(Event) ), //All event level input criteria are fulfilled
].every( criteriumFunction => criteriumFunction(Event)  )
 */


// COMPANY DOCUMENT CREATION PIPELINE - END