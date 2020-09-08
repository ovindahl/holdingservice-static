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
let mergeObjects = (patchesArray) => mergerino({}, patchesArray)
let logThis = (something, label) => {
console.log( (label) ? label : "Logging this: ", something )
return something
}
let randBetween = (lowest, highest) => Math.round(lowest + Math.random() * highest )
let ABS = (number) => Math.abs(number);
let filterUniqueValues = (value, index, self) => self.indexOf(value) === index
let getRandomArrayItem = (array) => array[ randBetween(0, array.length - 1 ) ]
let sortEntitiesByDate = ( a, b ) => {

  let aDate = new Date( a["date"] )
  let bDate = new Date( b["date"] )


  return aDate - bDate
} 

function split(array, isValid) {
  return array.reduce(([pass, fail], elem) => {
    return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
  }, [[], []]);
}

const validate = {
    string: (input) => (typeof input == "string") ? input : "ERROR",
    number: (input) => (typeof +input == "number") ? +input : "ERROR"
}

const format = {
    amount: (number) => accounting.formatNumber(number, 0, " ", ",")
}

let ifNot = (value, fallback) => value ? value : fallback

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
let inputWithLabelField = (label, value, onChange) => d(label + input({value: value, style: "text-align: right;" }, "change", onChange ), {class: "inputWithLabel"}  )
let inputWithLabelField_disabled = (label, value) => d(label + input({disabled: "disabled", value: value, style: "text-align: right;" }), {class: "inputWithLabel"}  )
let inputWithLabel_string = (A, entity, label, attribute) => d(label + input({value: (typeof entity[attribute] == "undefined") ? "" : entity[attribute], style: "text-align: right;" }, "change", e => A.submitDatoms( [newDatom(entity["entity"], attribute, e.srcElement.value)] ) ), {class: "inputWithLabel"}  )
let inputWithLabel_number = (A, entity, label, attribute) => d(label + input({value: (typeof entity[attribute] == "undefined") ? "" : entity[attribute], style: "text-align: right;" }, "change", e => A.submitDatoms( [newDatom(entity["entity"], attribute, validate.number(e.srcElement.value))] ) ), {class: "inputWithLabel"}  )

const renderUI = (S, A) => { 

  let pageFrame = {
    headerBarView: (S) => d([
      d('<header><h1>Holdingservice Beta</h1></header>', {class: "textButton"}),
      d(`Server version: ${S.serverConfig.serverVersion}`),
      d(`Client app version: ${S.serverConfig.clientVersion}`),
      d(`DB version: ${S.tx}`),
      d(`Server cache updated: ${moment(S.serverConfig.cacheUpdated).format()}`),
      d([
        d("Logg ut", {class: "textButton"}, "click", e => console.log("Log out!")),
        d("Innstillinger", {class: "textButton"}, "click", e => console.log("Innstillinger!"))
      ], {style: "display:flex;"} )
    ], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
    companySelectorRow: (S, A) => d(S.Events.map( E => E["company/orgnumber"] ).filter( filterUniqueValues ).map( orgnumber => d( orgnumber, {class: orgnumber === S.selectedOrgnumber ? "textButton textButton_selected" : "textButton"}, "click", e => A.patch(  {selectedOrgnumber : orgnumber} ) )  ), {style: "display:flex;"})
  }

    let Company = companyConstructur.constructCompany(S, A, S.selectedEvents)

    console.log(Company)

    let pageSections = [
      (S, A) => pageFrame.headerBarView(S),
      (S, A) => pageFrame.companySelectorRow(S, A),
      (S, A) => d( [
        d(Company.inspectorViews),
        createEventView(S, A)
       ], {class: "pageContainer"} )
    ]

    let elementTree = pageSections.reduce( (elementArray, pageSection) => elementArray.concat( pageSection(S, A) ), [] )
    let html = elementTree.map( element => element.html ).join('')
    let eventListeners = elementTree.map( element => element.eventListeners ).flat()
    document.getElementById("appContainer").innerHTML = html
    eventListeners.forEach( eventListener => document.getElementById( eventListener.id ).addEventListener(eventListener.eventType, eventListener.action) )
}

let eventApplicationPipeline = {
  run: (pipelineSteps, Attributes, calculatedAttributes, eventTypes, prevCompany, Events) => pipelineSteps.isValidCompany(prevCompany) ? Events.reduce(   (prevCompany, Event) => pipelineSteps.eventApplyer(pipelineSteps, Attributes, calculatedAttributes, eventTypes, logThis(prevCompany, "ÆÆÆÆÆ"), Event), prevCompany ) : pipelineSteps.rejectCompany(prevCompany),
  isValidCompany: (pipelineSteps, prevCompany) => [
    (prevCompany) => ["company/isIncorporated", "company/errors", "company/applicableEventTypes", "company/inputEvents"].every( attribute => Object.keys(prevCompany).includes( attribute  ) ) , //Company has all required attributes
  ].every( criterumFunction => criterumFunction(pipelineSteps, prevCompany)  ),
  rejectCompany: (prevCompany) => mergerino(prevCompany, {"company/errors": prevCompany["company/errors"].concat({error: `Inputcompany not valid.`})}),
  eventApplyer: (pipelineSteps, Attributes, calculatedAttributes, eventTypes, prevCompany, Event) => pipelineSteps.isValidEvent(eventTypes, Attributes, Event) 
  ? pipelineSteps.isApplicableEvent(prevCompany, Event)
    ? pipelineSteps.applyEvent(pipelineSteps, calculatedAttributes, eventTypes, prevCompany, Event)
    : pipelineSteps.rejectInapplicableEvent(prevCompany, Event)
  : pipelineSteps.rejectInvalidEvent(prevCompany, Event),
  isValidEvent: (eventTypes, Attributes, Event) => [
    (eventTypes, Attributes, Event) => Object.keys(eventTypes).includes( Event["process/identifier"]  ), //Event has a valid event type
    (eventTypes, Attributes, Event) => eventTypes[ Event["process/identifier"] ]["inputAttributes"].every( attribute => Object.keys( Event ).includes( attribute ) ), //Event has all required attributes
    (eventTypes, Attributes, Event) => eventTypes[ Event["process/identifier"] ]["inputAttributes"].every( attribute => Attributes[ attribute ].validators.every( validatorFunction =>  validatorFunction( Event[ attribute ]) ) ), //All attribute values are valid
    (eventTypes, Attributes, Event) => eventTypes[ Event["process/identifier"] ]["eventInputCriteria"].every( criterumFunction =>  criterumFunction(Event) ), //All event level input criteria are fulfilled
  ].every( criteriumFunction => criteriumFunction(eventTypes, Attributes, Event)  ),
  rejectInvalidEvent: (prevCompany, Event) => mergerino(prevCompany, {"company/rejectedEvents": prevCompany["company/rejectedEvents"].concat(   mergerino(Event, {"event/errors": [{error: `Event is invalid`}] }) )}),
  isApplicableEvent: (prevCompany, Event) => prevCompany["company/applicableEventTypes"].includes( Event["process/identifier"] ), //Event is applicable to prevCompany
  rejectInapplicableEvent: (prevCompany, Event) => mergerino(prevCompany, {"company/rejectedEvents": prevCompany["company/rejectedEvents"].concat(   mergerino(Event, {"event/errors": [{error: `Event is not applicable to current company.`}] }) )}),
  applyEvent: (pipelineSteps, calculatedAttributes, eventTypes, prevCompany, Event) => pipelineSteps.updateAllowedNextEventTypes( eventTypes,
      pipelineSteps.applyConstructedEventToCompany(prevCompany, calculatedAttributes, eventTypes, 
        pipelineSteps.constructEvent(prevCompany, calculatedAttributes, eventTypes, Event) 
      ) 
    ),
  constructEvent: (prevCompany, calculatedAttributes, eventTypes, Event) => mergerino(Event, eventTypes[ Event["process/identifier"] ]["calculatedAttributes"].map( calculatedAttribute => createObject(calculatedAttribute, calculatedAttributes[ calculatedAttribute ](prevCompany, Event) ) ) ),
  applyConstructedEventToCompany: (prevCompany, calculatedAttributes, eventTypes, constructedEvent) => mergerino(
    prevCompany, 
    eventTypes[ constructedEvent["process/identifier"] ]["dependencies"].map( calculatedAttribute => createObject(calculatedAttribute, calculatedAttributes[ calculatedAttribute ](prevCompany, constructedEvent) )  ), 
    {"company/appliedEvents": prevCompany["company/appliedEvents"].concat( constructedEvent )}),
  updateAllowedNextEventTypes: (eventTypes, updatedCompany) => mergerino(updatedCompany, 
    createObject("company/applicableEventTypes", Object.keys(eventTypes).filter( eventType => eventTypes[ eventType ]["applicabilityCriteria"].every( criteriumFunction => criteriumFunction(updatedCompany) )   ) ),  
  ) 
}


let ifElse = (test, ifTrue, ifFalse) => test ? ifTrue : ifFalse




const companyConstructur = {
  constructCompany: (S, A, Events) => {
    let [validatedEventsObject, eventObjectError] = companyConstructur.validateAndPrepareEventsObject(Events) 

    let constructedEvents = validatedEventsObject.map( Event => companyConstructur.constructEvent(S, A, Event) )
    let companySnapshots = constructedEvents.map( (Event, index) => constructedEvents.slice(0, index + 1).reduce( companyConstructur.applyConstructedEventToCompany, companyConstructur.getCompanyTemplate()  )  )
    let eventViews = constructedEvents.map( Event => companyConstructur.eventInspectorView(A, Event))
    let companyViews = companySnapshots.map( companySnapshot => companyConstructur.companyInspectorView(A, companySnapshot))
    let inspectorViews = constructedEvents.map( (Event, index) => d([
      eventViews[index],
      companyViews[index]
    ])  )

    let companyTemplate = companyConstructur.getCompanyTemplate()

    let Attributes = companyConstructur.getAttributesObject()
    let calculatedAttributes = companyConstructur.getAttributeUpdateFunctions()
    let eventTypes = companyConstructur.getEventTypes()

    let pipelineSteps = eventApplicationPipeline

    let C = pipelineSteps.run(pipelineSteps, Attributes, calculatedAttributes, eventTypes, companyTemplate, validatedEventsObject )
    console.log("C", C)


    let Company = {
      inputEvents: Events,
      constructedEvents: constructedEvents,
      companySnapshots: companySnapshots,
      eventViews: eventViews,
      companyViews: companyViews,
      inspectorViews: inspectorViews
    }

    return Company
  },
  validateAndPrepareEventsObject: (Events) => [Array.isArray(Events) ? Events.sort( (E1, E2) => E1["event/index"] - E2["event/index"] ) : [], Array.isArray(Events) ? [] : Events ],
  constructEvent: (S, A, inputEvent) => {
    let Event = mergerino(inputEvent, {"event/errors": []} )
    let eventTypes = companyConstructur.getEventTypes()
    let eventType = Event["process/identifier"]
    let hasValidEventType = Object.keys(eventTypes).includes( eventType )
    if(!hasValidEventType){return mergerino(Event, {"event/errors": Event["event/errors"].concat({error: `Error 1: Invalid eventType:: ${eventType}.`})})} //Continue construction despite error? To aggregate multiple errors if applicable.
    let eventTypeObject = eventTypes[ eventType ]
    let requiredAttributes_allEvents = ["entity", "type", "process/identifier", "company/orgnumber", "date"] // update
    let inputAttributes = eventTypeObject["inputAttributes"]
    let requiredAttributes = requiredAttributes_allEvents.concat(inputAttributes)
    let hasRequiredAttributes = requiredAttributes.every( attr => Object.keys(Event).includes(attr) ) // Store missing attribute names?
    if(!hasRequiredAttributes){return mergerino(Event, {"event/errors": Event["event/errors"].concat( requiredAttributes.filter( attr => !Object.keys(Event).includes(attr) ).map( attribute => returnObject({error: `Error 2: Missing required inputAttribute: ${attribute} `})))})}
    let attributesObject = companyConstructur.getAttributesObject() //NB: Now only inputAttributes
    let hasValidAttributeValues = inputAttributes.every( attribute => attributesObject[ attribute ].validators.every( validatorFunction => validatorFunction( Event[ attribute ] ) ) === true  )
    //let constructedEventWithErrors = mergerino({}, resultObjects.map( resultObject => createObject(resultObject.attribute, resultObject.value) ), {"event/error": resultObjects.filter( resultObject => resultObject.error ) } )
    if(!hasValidAttributeValues){return mergerino(Event, {"event/errors": Event["event/errors"].concat({error: `Error 3: Invalid attribute values.`})})}
    let eventTypeInputCriteria = eventTypeObject["eventInputCriteria"]
    let hasValidInputs = eventTypeInputCriteria.every( criteriumFunction => criteriumFunction(Event) === true ) //Criteria should return error object if not passed.
    if(!hasValidInputs){return mergerino(Event, {"event/errors": Event["event/errors"].concat({error: `Error 4: The combination of inputs do not pass eventType level validation.`})})}
    let calculatedAttributesObject = companyConstructur.getAttributeUpdateFunctions()
    let attributesToCalculate = eventTypeObject["calculatedAttributes"]
    let calculatedAttributes = attributesToCalculate.map( attribute => createObject( attribute, calculatedAttributesObject[ attribute ](null, Event) )  )
    let constructedEvent = mergerino(Event, calculatedAttributes )
    return constructedEvent
  },
  applyConstructedEventToCompany: (prevCompany, constructedEvent) => {
    if(constructedEvent["event/errors"].length > 0){return mergerino(prevCompany, {"company/errors": prevCompany["company/errors"].concat({error: `Error: Error in submitted event(s). Cannot construct company.`})})} //Move to event pipeline?
    let isIncorporated = (prevCompany["company/isIncorporated"] || constructedEvent["process/identifier"] === "incorporation")
    if(!isIncorporated){return  mergerino(prevCompany, {"company/errors": prevCompany["company/errors"].concat({error: `Error 5: No incorporation event.`})})} //Move to event pipeline?
    let defaultDependencies = ["company/appliedEventsCount"] //generic attributes, eg. latest event index etc
    let eventType = constructedEvent["process/identifier"]
    let eventTypes = companyConstructur.getEventTypes()
    let eventTypeObject = eventTypes[ eventType ]
    let eventTypeDependencies = eventTypeObject["dependencies"]
    let attributesToUpdate = defaultDependencies.concat(eventTypeDependencies)

    let prevCompanyAttributes = Object.keys(prevCompany)
    let unAffectedAttributes = prevCompanyAttributes.filter( attribute => !attributesToUpdate.includes(attribute) )
    let attributeUpdateFunctions = companyConstructur.getAttributeUpdateFunctions()

    let Company = mergerino(
      {},
      unAffectedAttributes.map( attribute => createObject( attribute, prevCompany[ attribute ] ) ),
      attributesToUpdate.map( attribute => createObject(attribute, attributeUpdateFunctions[ attribute ]( prevCompany, constructedEvent ) ) ) //Should handle non-applicable events generically instead of in each attributeTypeUpdatefunction??
    )

    Company["company/applicableEventTypes"] = attributeUpdateFunctions["company/applicableEventTypes"](Company, null) //Getting list of allowed next events

    return Company
  },
  getEventTypes: () => H.eventTypes,
  getAttributesObject: () => H.inputAttributes,
  getAttributeUpdateFunctions: () => H.calculatedAttributes,
  getCompanyTemplate: () => returnObject({"company/isIncorporated": false, "company/errors": [], "company/applicableEventTypes": ["incorporation"], "company/inputEvents": [], "company/rejectedEvents": [], "company/appliedEvents": []}),
  eventInspectorView: (A, Event) => {
    let eventType = Event["process/identifier"]
    let eventTypeObject = H.eventTypes[ eventType ]
    
    let systemAttributes = Object.keys(H.systemAttributes)
    let defaultInputAttribtues = ["type", "company/orgnumber", "date", "process/identifier"]
    let eventInputAttributes = eventTypeObject["inputAttributes"]
    let calculatedAttributes_event = eventTypeObject["calculatedAttributes"]
  
    return d([
      d([
        h3("Adminpanel for hendelse"),
      Event["event/errors"].length === 0 
        ? d("No event errors.") 
        : d(
          Event["event/errors"].map( error => d(error["error"]) ) 
      ),
      d("<br><br>"),
      d( systemAttributes.map( attribute => d([
        d(attribute), 
        d("system"), 
        d(typeof Event[ attribute ]), 
        d(JSON.stringify(Event[ attribute ]), {style: "max-width: 200px;"}) 
      ], {class: "eventInspectorRow"}) )),
      d("<br>"),
      d(defaultInputAttribtues.map( attribute => d([
        d(attribute),
        d("defaultInput"),
        d(typeof Event[ attribute ] ),
        input({value: Event[attribute] }, "change", e => A.submitDatoms( [newDatom(Event["entity"], attribute, validate[typeof Event[ attribute ]](e.srcElement.value))] )),
      ], {class: "eventInspectorRow"}) )),
      d("<br>"),
      d(eventInputAttributes.map( attribute => d([
        d(attribute),
        d("eventInput"),
        d(typeof Event[ attribute ] ),
        input({value: Event[attribute] }, "change", e => A.submitDatoms( [newDatom(Event["entity"], attribute, validate[ H.inputAttributes[attribute]["valueType"] ](e.srcElement.value))] )),
      ], {class: "eventInspectorRow"}) )),
      d("<br>"),
      d(calculatedAttributes_event.map( attribute => d([
        d(attribute), 
        d("calculated"), 
        d(typeof Event[ attribute ]), 
        d(JSON.stringify(Event[ attribute ]), {style: "max-width: 200px;"}) 
      ], {class: "eventInspectorRow"}) )),
      d("Slett hendelse", {class: "textButton"}, "click", e => A.retractSingleEntity(Event))
      ], {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
      d( `${Event["date"]} (id: ${Event["entity"]} )` , {style: "margin-right: 1em;text-align: right;margin-bottom: 1em;color:#979797;margin-top: 3px;"})
    ])
  },
  companyInspectorView: (A, companySnapshot) => {

    return d([
      d([
      h3("Adminpanel for selskap"),
      companySnapshot["company/errors"].length === 0 
        ? d("No event errors.")
        : d( companySnapshot["company/errors"].map( error => d(error["error"]) ) ),
      d("<br><br>"),
      d( Object.keys(companySnapshot).map( attribute => d([
        d(attribute), 
        d(JSON.stringify(companySnapshot[attribute]))
      ], {class: "eventInspectorRow"} )  ) )
    ], {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
    d( `${companySnapshot["date"]} (id: ${companySnapshot["entity"]} )` , {style: "margin-right: 1em;text-align: right;margin-bottom: 1em;color:#979797;margin-top: 3px;"})
  ])
  },
  genericEventView: ( S, A, Event, companySnapshot ) => {


    //To be fixed

    let eventType = Event["process/identifier"]
    let eventTypeAttributes = H.eventTypes[eventType]["inputAttributes"]
    let systemAttributes = Object.keys(H.systemAttributes)
    let visibleAttributes = eventTypeAttributes.filter( attribute => !systemAttributes.includes(attribute) )
    let attributeViews = visibleAttributes.map( attribute => H.inputAttributes[ attribute ].view( Event, A )  ).join("")
  
    return d([
      d([
        h3("Event view:"),
        attributeViews,
        "<br>",
      ], {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
      d( `${Event["date"]} (id: ${Event["entity"]} )` , {style: "margin-right: 1em;text-align: right;margin-bottom: 1em;color:#979797;margin-top: 3px;"})
    ])
  
  
  
  }
}

let H = {
  Accounts: {
    '1070': {label: 'Utsatt skattefordel'}, 
    '1300': {label: 'Investeringer i datterselskap'}, 
    '1320': {label: 'Lån til foretak i samme konsern'}, 
    '1330': {label: 'Investeringer i tilknyttet selskap'}, 
    '1340': {label: 'Lån til tilknyttet selskap og felles kontrollert virksomhet'}, 
    '1350': {label: 'Investeringer i aksjer, andeler og verdipapirfondsandeler'}, 
    '1360': {label: 'Obligasjoner'}, 
    '1370': {label: 'Fordringer på eiere'}, 
    '1375': {label: 'Fordringer på styremedlemmer'}, 
    '1380': {label: 'Fordringer på ansatte'}, 
    '1399': {label: 'Andre fordringer'}, 
    '1576': {label: 'Kortsiktig fordring eiere/styremedl. o.l.'}, 
    '1579': {label: 'Andre kortsiktige fordringer'}, 
    '1749': {label: 'Andre forskuddsbetalte kostnader'}, 
    '1800': {label: 'Aksjer og andeler i foretak i samme konsern'}, 
    '1810': {label: 'Markedsbaserte aksjer og verdipapirfondsandeler'}, 
    '1820': {label: 'Andre aksjer'}, 
    '1830': {label: 'Markedsbaserte obligasjoner'}, 
    '1870': {label: 'Andre markedsbaserte finansielle instrumenter'}, 
    '1880': {label: 'Andre finansielle instrumenter'}, 
    '1920': {label: 'Bankinnskudd'}, 
    '2000': {label: 'Aksjekapital'}, 
    '2020': {label: 'Overkurs'}, 
    '2030': {label: 'Annen innskutt egenkapital'}, 
    '2050': {label: 'Annen egenkapital'}, 
    '2080': {label: 'Udekket tap'}, 
    '2120': {label: 'Utsatt skatt'}, 
    '2220': {label: 'Gjeld til kredittinstitusjoner'}, 
    '2250': {label: 'Gjeld til ansatte og eiere'}, 
    '2260': {label: 'Gjeld til selskap i samme konsern'}, 
    '2290': {label: 'Annen langsiktig gjeld'}, 
    '2390': {label: 'Annen gjeld til kredittinstitusjon'}, 
    '2400': {label: 'Leverandørgjeld'}, 
    '2500': {label: 'Betalbar skatt, ikke fastsatt'}, 
    '2510': {label: 'Betalbar skatt, fastsatt'}, 
    '2800': {label: 'Avsatt utbytte'}, 
    '2910': {label: 'Gjeld til ansatte og eiere'}, 
    '2920': {label: 'Gjeld til selskap i samme konsern'}, 
    '2990': {label: 'Annen kortsiktig gjeld'}, 
    '6540': {label: 'Inventar'}, 
    '6551': {label: 'Datautstyr (hardware)'}, 
    '6552': {label: 'Programvare (software)'}, 
    '6580': {label: 'Andre driftsmidler'}, 
    '6701': {label: 'Honorar revisjon'}, 
    '6702': {label: 'Honorar rådgivning revisjon'}, 
    '6705': {label: 'Honorar regnskap'}, 
    '6720': {label: 'Honorar for økonomisk rådgivning'}, 
    '6725': {label: 'Honorar for juridisk bistand, fradragsberettiget'}, 
    '6726': {label: 'Honorar for juridisk bistand, ikke fradragsberettiget'}, 
    '6790': {label: 'Annen fremmed tjeneste'}, 
    '6890': {label: 'Annen kontorkostnad'}, 
    '6900': {label: 'Elektronisk kommunikasjon'}, 
    '7770': {label: 'Bank og kortgebyrer'}, 
    '7790': {label: 'Annen kostnad, fradragsberettiget'}, 
    '7791': {label: 'Annen kostnad, ikke fradragsberettiget'}, 
    '8000': {label: 'Inntekt på investering i datterselskap'}, 
    '8020': {label: 'Inntekt på investering i tilknyttet selskap'}, 
    '8030': {label: 'Renteinntekt fra foretak i samme konsern'}, 
    '8050': {label: 'Renteinntekt (finansinstitusjoner)'}, 
    '8055': {label: 'Andre renteinntekter'}, 
    '8060': {label: 'Valutagevinst (agio)'}, 
    '8070': {label: 'Annen finansinntekt'}, 
    '8071': {label: 'Aksjeutbytte'}, 
    '8078': {label: 'Gevinst ved realisasjon av aksjer'}, 
    '8080': {label: 'Verdiøkning av finansielle instrumenter vurdert til virkelig verdi'}, 
    '8090': {label: 'Inntekt på andre investeringer'}, 
    '8100': {label: 'Verdireduksjon av finansielle instrumenter vurdert til virkelig verdi'}, 
    '8110': {label: 'Nedskrivning av andre finansielle omløpsmidler'}, 
    '8120': {label: 'Nedskrivning av finansielle anleggsmidler'}, 
    '8130': {label: 'Rentekostnad til foretak i samme konsern'}, 
    '8140': {label: 'Rentekostnad, ikke fradragsberettiget'}, 
    '8150': {label: 'Rentekostnad (finansinstitusjoner)'}, 
    '8155': {label: 'Andre rentekostnader'}, 
    '8160': {label: 'Valutatap (disagio)'}, 
    '8170': {label: 'Annen finanskostnad'}, 
    '8178': {label: 'Tap ved realisasjon av aksjer'}, 
    '8300': {label: 'Betalbar skatt'}, 
    '8320': {label: 'Endring utsatt skatt'},
    '8800': {label: 'Årsresultat'}
  },
  systemAttributes: {
    "entity": { 
      validator: (value) => (typeof value === "number") ? true : false,
    }
  },
  inputAttributes: {
    "type": { //Should be inputAttribute
      validators: [
        (value) => value === "process" ? true : false
      ],
      valueType: "string"
    },
    "process/identifier": { //Should be inputAttribute
      validators: [
        (value) => Object.keys(H.eventTypes).includes(value) ? true : false
      ],
      valueType: "string"
    },
    "transaction/records": { 
      validators: [
        (value) => typeof value === "object"
      ],
      valueType: "object",
      view: (Event, A) => d([
        "<br>",
        d("Stiftere:"),
        Array.isArray(Event["transaction/records"]) ? 
        d([
          d("Orgnr/personnr, antall aksjer, overkurs per aksje"),
          Event["transaction/records"].map( (shareholderTransaction, index) => d([
            input({value: shareholderTransaction["company/orgnumber"]}, "change", e => A.submitDatoms( [newDatom(Event.entity, "transaction/records", Event["transaction/records"].map( (existingRow, innerIndex) => (innerIndex === index) ? mergerino(existingRow, {"company/orgnumber": e.srcElement.value} ) : existingRow ) )] )),
            input({value: shareholderTransaction["transaction/investment/quantity"]}, "change", e => A.submitDatoms( [newDatom(Event.entity, "transaction/records", Event["transaction/records"].map( (existingRow, innerIndex) => (innerIndex === index) ? mergerino(existingRow, {"transaction/investment/quantity": validate.number( e.srcElement.value ) } ) : existingRow ) )] )),
            input({value: shareholderTransaction["transaction/investment/unitPrice"]}, "change", e => A.submitDatoms( [newDatom(Event.entity, "transaction/records", Event["transaction/records"].map( (existingRow, innerIndex) => (innerIndex === index) ? mergerino(existingRow, {"transaction/investment/unitPrice": validate.number( e.srcElement.value )} ) : existingRow ) )] )),
          ]) ).join('')
        ])
          : d("Ingen stiftere."),
        d( "Legg til stifter", {class: "textButton"}, "click", e => A.submitDatoms( templateDatoms.addFounder( Event ) ) ),
        "<br>",
      ]) 
    },
    "transaction/generic/account": {
      validators: [
        (value) => typeof value === "string",
        (value) => value.length === 4,
        (value) => Number(value) >= 1000,
        (value) => Number(value) < 10000
      ],
      valueType: "string",
      view: (Event, A) => d([
        d("Konto"),
        dropdown( Event["transaction/generic/account"] ? Event["transaction/generic/account"] : 0, Object.entries( H.Accounts ).map( entry => returnObject({label: `${entry[0]} - ${entry[1].label}`, value: entry[0] })).concat([{value: 0, label: ""}]), e => A.submitDatoms([newDatom(Event.entity, "transaction/generic/account", e.srcElement.value )]) )
      ], {class: "inputWithLabel"}  )
    },
    "transaction/amount": {
      validators: [
        (value) => typeof value === "number",
      ],
      valueType: "number",
      view: (Event, A) => inputWithLabel_number(A, Event, "Beløp", "transaction/amount")
    },
    "company/orgnumber": {
      validators: [
        (value) => typeof value === "string",
        (value) => value.length === 9,
        (value) => Number(value) >= 800000000,
        (value) => Number(value) < 1000000000
      ],
      valueType: "string",
      view: (Event, A) => inputWithLabelField_disabled("Orgnr.", Event["company/orgnumber"])
    },
    "date": {
      validators: [
        (value) => true
      ],
      valueType: "string",
      view: (Event, A) => Event["process/identifier"] === "incorporation" ? inputWithLabelField_disabled("Dato", Event["date"]) : inputWithLabel_string(A, Event, "Dato", "date")
    },
    "company/AoA/nominalSharePrice": { 
      validators: [
        (value) => typeof value === "number",
        (value) => value >= 0.01
      ],
      valueType: "number",
      view: (Event, A) => inputWithLabel_number(A, Event, "Aksjenes pålydende", "company/AoA/nominalSharePrice")
    },
  },
  calculatedAttributes: {
    "company/isIncorporated": (prevCompany, Event) => ( prevCompany["company/isIncorporated"] || Event["event/isIncorporated"]) ? true : false,
    "company/orgnumber": (prevCompany, Event) => prevCompany["company/orgnumber"] ? prevCompany["company/orgnumber"] : Event["company/orgnumber"],
    "company/AoA/nominalSharePrice": (prevCompany, Event) => Event["company/AoA/nominalSharePrice"],
    "company/shareCount": (prevCompany, Event) => prevCompany["company/shareCount"] ? prevCompany["company/shareCount"] + Event["event/shareCountIncrease"] : Event["event/shareCountIncrease"],
    "company/shareholders": (prevCompany, Event) => Array.isArray(Event["transaction/records"]) ? Event["transaction/records"].map( shareholderTransaction => shareholderTransaction["company/orgnumber"] ).filter( filterUniqueValues ) : [],
    "company/shareCapital": (prevCompany, Event) => Array.isArray(Event["transaction/records"]) ? Event["event/accountBalance"]["2000"] : null,
    "company/accountBalance": (prevCompany, Event) => Array.isArray(Event["transaction/records"]) ? addAccountBalances({}, Event["event/accountBalance"]) : null,
    "company/appliedEventsCount": (prevCompany, Event) => Event["event/isIncorporated"] ? 1 : prevCompany["company/appliedEventsCount"] + 1,
    "company/applicableEventTypes": (prevCompany, Event) => Object.keys(H.eventTypes).filter( eventType => H.eventTypes[ eventType ]["applicabilityCriteria"].every( criteriumFunction => criteriumFunction(prevCompany) === true )   ) ,
    "event/isIncorporated": (prevCompany, eventInput) => eventInput["process/identifier"] === "incorporation" ? true : false,
    "event/shareCountIncrease": (prevCompany, eventInput) => Array.isArray(eventInput["transaction/records"]) ? eventInput["transaction/records"].reduce( (sum, shareholderTransaction) => sum + shareholderTransaction["transaction/investment/quantity"], 0 ) : null,
    "event/shareCapitalIncrease": (prevCompany, eventInput) => Array.isArray(eventInput["transaction/records"]) ? eventInput["transaction/records"].reduce( (sum, shareholderTransaction) => sum + shareholderTransaction["transaction/investment/quantity"] * (eventInput["company/AoA/nominalSharePrice"] + shareholderTransaction["transaction/investment/unitPrice"]), 0 ) : null,
    "event/accountBalance": (prevCompany, Event) => Event["process/identifier"] === "incorporation" ? {
      "2000": -Event["transaction/records"].reduce( (sum, shareholderTransaction) => sum + shareholderTransaction["transaction/investment/quantity"] * (Event["company/AoA/nominalSharePrice"] + shareholderTransaction["transaction/investment/unitPrice"]), 0 ),
      "1370": Event["transaction/records"].reduce( (sum, shareholderTransaction) => sum + shareholderTransaction["transaction/investment/quantity"] * (Event["company/AoA/nominalSharePrice"] + shareholderTransaction["transaction/investment/unitPrice"]), 0 )
    } : (Event["transaction/generic/account"] && Event["transaction/amount"]) ? mergerino({"1920": Event["transaction/amount"]}, createObject(Event["transaction/generic/account"], -Event["transaction/amount"] )) : undefined
  },
  eventTypes: {
    "incorporation": {
      label: "Stiftelse",
      inputAttributes: ["transaction/records", "company/AoA/nominalSharePrice"],
      eventInputCriteria: [ //Is the combination of inputs valid? Not taking into account anything but the provided event input.
        (Event) => Event["type"] === "process",
        (Event) => Event["process/identifier"] === "incorporation",
      ],
      applicabilityCriteria: [ //Is the eventType applicable to the current state of the company?
        (Company) => Company["company/appliedEventsCount"] === 0,
      ],
      calculatedAttributes: ["event/isIncorporated", "event/shareCountIncrease", "event/shareCapitalIncrease", "event/accountBalance"],
      dependencies: ["company/isIncorporated", "company/orgnumber", "company/AoA/nominalSharePrice", "company/shareCount", "company/shareholders", "company/shareCapital", "company/accountBalance"] //Which calculatedAttributes need to be recalculated as a consequence of applying the event?
    },
    "operatingCost": {
      label: "Driftskostnader",
      inputAttributes: ["transaction/generic/account", "transaction/amount"],
      eventInputCriteria: [
        (Event) => Event["type"] === "process",
        (Event) => Event["process/identifier"] === "operatingCost",
        (Event) => Number(Event["transaction/generic/account"]) >= 3000 && Number(Event["transaction/generic/account"]) < 8000,
      ],
      applicabilityCriteria: [
        (Company) => Company["company/isIncorporated"],
      ],
      calculatedAttributes: ["event/accountBalance"],
      dependencies: ["company/accountBalance"]
    }
  }
}


let addErrorToCompany = (prevCompany, errorMessage) => mergerino(prevCompany, {"company/errors": prevCompany["company/errors"].concat( createError(errorMessage) )})
let createError = (errorMessage) => returnObject({type: "error", errorMessage})


let createEventView = (S, A) => {

  let validEventTypes = ["operatingCost"] // Bør følge av siste selskapssnapshot

  let newEventFunction = e => A.submitDatoms([
    newDatom("process", "type", "process"),
    newDatom("process", "date", "2020-09-03"),
    newDatom("process", "process/identifier", "operatingCost"),
    newDatom("process", "company/orgnumber", S.selectedOrgnumber ),
  ])


  return d([
      h3("Legg til ny hendelse"),
      d("Legg til", {class: "textButton"}, "click", newEventFunction )
  ], {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

} 





let addAccountBalances = (prevAccountBalance, accountBalance) => {

  let prevAccounts = Object.keys(prevAccountBalance).length > 0 ? Object.keys(prevAccountBalance) : []

  let newAccounts = Object.keys(accountBalance).length > 0 ? Object.keys(accountBalance) : []

  let allAccounts = prevAccounts.concat(newAccounts).filter( filterUniqueValues )

  let newAccountBalance = mergerino({}, allAccounts.map( acc => createObject(acc, ifNot(prevAccountBalance[acc], 0) +  ifNot(accountBalance[acc], 0)) ))

  return newAccountBalance
}

let accountSelector = (Event, A, allowedAccounts) => {

  let transaction = Event.Documents[0]

  let records = transaction.records
  
  let cashRecord = records.filter( r => r["transaction/generic/account"] === "1920")[0]
  let otherRecord = records.filter( r => r["entity"] !== cashRecord["entity"] )[0]

  let dropdownOptions = Object.entries(H.Accounts ).filter( entry => allowedAccounts.includes(entry[0]) ).map( entry => returnObject({label: `${entry[0]} - ${entry[1].label}`, value: entry[0] })).concat([{value: 0, label: ""}])

  return d([
    d("Konto"),
    dropdown( otherRecord["transaction/generic/account"], dropdownOptions , e => A.submitDatoms([newDatom(otherRecord.entity, "transaction/generic/account", e.srcElement.value )]) )
  ], {class: "inputWithLabel"}  )
} 



//Annual report

/* 
let trialBalanceView = (financialYear) => d([
  h3(`1: Foreløpig saldobalanse`),
  d([d("Kontonr."), d("Konto"), d("Åpningsbalanse", {class: "numberCell"} ), d("Endring", {class: "numberCell"} ), d("Utgående balanse", {class: "numberCell"} )], {class: "trialBalanceRow"}),
  Object.keys( financialYear["accounts"] ).map( account =>  {

    let thisAccount = financialYear["accounts"][account]

    let opening = thisAccount.openingBalance.amount
    let closing = thisAccount.closingBalance.amount
    let change = closing - opening


    return d([ 
      d( account ), 
      d(H.Accounts[ account ]["label"] ), 
      d( format.amount( opening ), {class: "numberCell"}), 
      d( format.amount( change  ), {class: "numberCell"}), 
      d( format.amount( closing ), {class: "numberCell"}), 
    ], {class: "trialBalanceRow"})
  } ).join('')
])

let annualResultView = (financialYear) => {

let taxCostRecord = financialYear.accounts["8300"].accountRecords[0]

return d([
  h3(`3: Beregning av årsresultat, overføringer og disponeringer`),
  "<br>",
  d([ d( "Ordinært resultat før skattekostnad" ), d( format.amount( taxCostRecord.accountingResultBeforeTax ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
  d([ d( "Årets skattekostnad" ), d( format.amount( taxCostRecord.taxCost ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
  d([ d( "Årsresultat" ), d( format.amount( financialYear.accounts["8800"].closingBalance.amount ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
  "<br>",
  d([ d( "Overføres til Annen innskutt egenkapital" ), d( format.amount( financialYear.accounts["2050"].closingBalance.amount ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
  d([ d( "Overføres til Udekket tap" ), d( format.amount( financialYear.accounts["2080"].closingBalance.amount ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
])
} 



let yearEndPage = (S, A) => {  

    let financialYear = S.selectedCompany["acc/financialYears"][S.selectedYear]

    return d([
    h3(`Årsavslutning ${S.selectedYear}`),
    "[Fin visualisering med overordnet status på prosessen]",
    "<br>",
    trialBalanceView(financialYear),
    "<br>",
    h3(`2: Beregning av årets skattekostnad og resultat etter skatt`),
      "<br>",
    taxCostView(financialYear),
    "<br>",
      annualResultView(financialYear),
    "<br>",
    annualReportView(S, financialYear),
    "<br>",
    h3("6: Utfylling av offentlige skjemaer"),
    d("RF-1028"),
    Object.entries(financialYear["reports"]["rf_1028"]).map( entry => `[${entry[0]}]: ${format.amount(entry[1])}`).join("<br>"),
    "<br><br>",
    d("RF-1167"),
    Object.entries(financialYear["reports"]["rf_1167"]).map( entry => `[${entry[0]}]: ${format.amount(entry[1])}`).join("<br>"),
    "<br>",
  ])
 }


 
let getAnnualReport = ( S, financialYear ) => {

  let virtualAccounts = [
    {virtualAccount: '9000', label: 'Sum driftsinntekter', firstAccount: "3000", lastAccount: "3999"},
    {virtualAccount: '9010', label: 'Sum driftskostnader', firstAccount: "4000", lastAccount: "7999"},
    {virtualAccount: '9050', label: 'Driftsresultat', firstAccount: "3000", lastAccount: "7999"},
    {virtualAccount: '9060', label: 'Sum finansinntekter', firstAccount: "8000", lastAccount: "8099"},
    {virtualAccount: '9070', label: 'Sum finanskostnader', firstAccount: "8100", lastAccount: "8199"},
    {virtualAccount: '9100', label: 'Ordinært resultat før skattekostnad', firstAccount: "3000", lastAccount: "8199"},
    {virtualAccount: '9150', label: 'Ordinært resultat', firstAccount: "3000", lastAccount: "8399"},
    {virtualAccount: '9200', label: 'Årsresultat', firstAccount: "3000", lastAccount: "8699"},
    {virtualAccount: '9300', label: 'Sum anleggsmidler', firstAccount: "1000", lastAccount: "1399"},
    {virtualAccount: '9350', label: 'Sum omløpsmidler', firstAccount: "1400", lastAccount: "1999"},
    {virtualAccount: '9400', label: 'Sum eiendeler', firstAccount: "1000", lastAccount: "1999"},
    {virtualAccount: '9450', label: 'Sum egenkapital', firstAccount: "2000", lastAccount: "2099"},
    {virtualAccount: '9500', label: 'Sum langsiktig gjeld', firstAccount: "2100", lastAccount: "2299"},
    {virtualAccount: '9550', label: 'Sum kortsiktig gjeld', firstAccount: "2300", lastAccount: "2999"},
    {virtualAccount: '9650', label: 'Sum egenkapital og gjeld', firstAccount: "2000", lastAccount: "2999"}
]

  let headerRow = d([ d(""), d("Kontoer"), d( String(financialYear.year) , {class: "numberCell"} ), d( String( Number(financialYear.year) - 1), {class: "numberCell"} )  ], {class: "financialStatementsRow"} )

  let prevYear = S.selectedCompany["acc/financialYears"][Number(S.selectedYear) - 1] ? S.selectedCompany["acc/financialYears"][Number(S.selectedYear) - 1] : {}

  let prevYearAccounts = prevYear.annualReportAccounts ? prevYear.annualReportAccounts : {}

  let reportLines = [headerRow].concat( Object.keys(financialYear.annualReportAccounts).map( acc => d([
     d(`[${String(acc)}] ${virtualAccounts.filter( vacc => vacc.virtualAccount === acc )[0].label} `), 
     d(`${virtualAccounts.filter( vacc => vacc.virtualAccount === acc )[0].firstAccount} - ${virtualAccounts.filter( vacc => vacc.virtualAccount === acc )[0].lastAccount}`), 
     d( format.amount( Number(financialYear.annualReportAccounts[ acc ])), {class: "numberCell"} ), 
     d( format.amount( prevYearAccounts[acc] ? prevYearAccounts[acc] : "" ), {class: "numberCell"} ), 
    ], {class: "financialStatementsRow"} )
  ).join(''))
    

  return reportLines

}


let annualReportView = (S, financialYear) => {

  return d([
    h3(`5: Årsregnskap`),
    "<br>",
    d(getAnnualReport( S, financialYear ), {class: "borderAndPadding"}),
    "<br>",
    d([h3(`Noter`), notesText( S, financialYear )], {class: "borderAndPadding"}),
    "<br>",
  ])
}

let em = (content) => String('<span class="emphasizedText">' + content + '</span>')

let notesText = ( S, financialYear ) => {

  let shareCapital_openingBalance = financialYear.accounts["2000"] ? financialYear.accounts["2000"].openingBalance.amount : 0
  let shareCapital_closingBalance = financialYear.accounts["2000"] ? financialYear.accounts["2000"].closingBalance.amount : 0
  let shareCapital_change = shareCapital_closingBalance - shareCapital_openingBalance

  let sharePremium_openingBalance = financialYear.accounts["2020"] ? financialYear.accounts["2020"].openingBalance.amount : 0
  let sharePremium_closingBalance = financialYear.accounts["2020"] ? financialYear.accounts["2020"].closingBalance.amount : 0
  let sharePremium_change = sharePremium_closingBalance - sharePremium_openingBalance

  let otherEquity_openingBalance = financialYear.accounts["2030"] ? financialYear.accounts["2030"].openingBalance.amount : 0
  let otherEquity_closingBalance = financialYear.accounts["2030"] ? financialYear.accounts["2030"].closingBalance.amount : 0
  let otherEquity_change = otherEquity_closingBalance - otherEquity_openingBalance

  let taxRecord = financialYear.accounts["8300"].accountRecords[0]

  let taxRate = taxRecord.taxRate * 100 + "%"

  let shareCapitalAccount =  financialYear.accounts["2000"]

  let shareholders = Object.values(shareCapitalAccount.closingBalance.shareholders)

  let shareCount = shareCapitalAccount.closingBalance.shareCount

  return `
<h4>Note 1: Regnskapsprinsipper</h4>
Regnskapet er utarbeidet i henhold til norske regnskapsregler/-standarder for små foretak.
<br>
<h5>Klassifisering og vurdering av balanseposter</h5>
Omløpsmidler og kortsiktig gjeld omfatter poster som forfaller til betaling innen ett år etter anskaffelsestidspunktet, samt poster som knytter seg til varekretsløpet. Øvrige poster er klassifisert som anleggsmiddel/langsiktig gjeld.
<br>
Omløpsmidler vurderes til laveste av anskaffelseskost og virkelig verdi. Kortsiktig gjeld balanseføres til nominelt beløp på opptakstidspunktet.
<br>
Anleggsmidler vurderes til anskaffelseskost, men nedskrives til gjenvinnbart beløp dersom dette er lavere enn balanseført verdi. Gjenvinnbart beløp er det høyeste av netto salgsverdi og verdi i bruk. Langsiktig gjeld balanseføres til nominelt beløp på etableringstidspunktet.
Markedsbaserte finansielle omløpsmidler som inngår i en handelsportefølje vurderes til virkelig verdi, mens andre markedsbaserte finansielle omløpsmidler vurderes til laveste av anskaffelseskost og virkelig verdi.
<br>
<h5>Skatt</h5>
Skattekostnaden i resultatregnskapet omfatter både betalbar skatt for perioden og endring i utsatt skatt. Utsatt skatt er beregnet med ${em(taxRate)} på grunnlag av de midlertidige forskjeller som eksisterer mellom regnskapsmessige og skattemessige verdier, samt ligningsmessig underskudd til fremføring ved utgangen av regnskapsåret. Skatteøkende og skattereduserende midlertidige forskjeller som reverserer eller kan reversere i samme periode er utlignet og nettoført.
<br>
<h4>Note 2: Aksjekapital og aksjonærinformasjon</h4>
Foretaket har ${em( format.amount(shareCount) ) } aksjer, pålydende kr ${em( format.amount( S.selectedCompany["company/AoA/nominalSharePrice"] ) )}, noe som gir en samlet aksjekapital på kr ${em(format.amount( shareCapital_closingBalance ) )}. Selskapet har én aksjeklasse.
<br><br>
Aksjene eies av: 
<br>
${shareholders.map( shareholder => d(em(`${shareholder.id}: ${shareholder.shareCount} <br>`))).join('')}

<h4>Note 3: Egenkapital</h4>

<table>
<tbody>
  <tr>
    <td class="numberCell"></td>
    <td class="numberCell">Aksjekapital</td>
    <td class="numberCell">Overkurs</td>
    <td class="numberCell">Annen egenkapital</td>
    <td class="numberCell">Sum</td>
  </tr>
  <tr>
    <td>Egenkapital 1.1 </td>
    <td class="numberCell">${em( shareCapital_openingBalance ) }</td>
    <td class="numberCell">${em( sharePremium_openingBalance ) }</td>
    <td class="numberCell">${em( otherEquity_openingBalance ) }</td>
    <td class="numberCell">${em( shareCapital_openingBalance + sharePremium_openingBalance + otherEquity_openingBalance ) }</td>
  </tr>
  <tr>
    <td>Endring ila. året </td>
    <td class="numberCell">${em( shareCapital_change ) }</td>
    <td class="numberCell">${em( sharePremium_change ) }</td>
    <td class="numberCell">${em( otherEquity_change ) }</td>
    <td class="numberCell">${em( shareCapital_change + sharePremium_change + otherEquity_change ) }</td>
  </tr>
  <tr>
    <td>Egenkapital 31.12 </td>
    <td class="numberCell">${em( shareCapital_closingBalance ) }</td>
    <td class="numberCell">${em( sharePremium_closingBalance ) }</td>
    <td class="numberCell">${em( otherEquity_closingBalance ) }</td>
    <td class="numberCell">${em( shareCapital_closingBalance + sharePremium_closingBalance + otherEquity_closingBalance ) }</td>
  </tr>
</tbody>
</table>
<br>
<h4>Note 5: Skatt</h4>
${taxCostView(financialYear)}

<h4>Note 4: Lønnskostnader, antall ansatte, godtgjørelser, revisjonskostnader mm.</h4>
Selskapet har i ${em( S.selectedYear ) } ikke hatt noen ansatte og er således ikke pliktig til å ha tjenestepensjon for de ansatte etter Lov om obligatoriske tjenestepensjon. Det er ikke utdelt styrehonorar.
<br><br>
Kostnadsført revisjonshonorar for ${em( S.selectedYear ) } utgjør kr ${em( 0 ) }. Honorar for annen bistand fra revisor utgjør kr ${em( 0 ) }.



<h4>Note 6: Bankinnskudd</h4>
Posten inneholder kun frie midler.

<h4>Note 7: Gjeld til nærstående, ledelse og styre</h4>
Selskapet har gjeld til følgende nærstående personer: <br>

${shareholders.map( shareholder => d(em(`${shareholder.shareholder}: ${shareholder.creditOutstanding} <br>`))).join('')}

`}

let taxCostView = (financialYear) => {

  let taxCostRecord = financialYear.accounts["8300"].accountRecords[0]


  return d([
    d([ d( "Ordinært resultat før skattekostnad" ), d( format.amount( taxCostRecord.accountingResultBeforeTax ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    "<br>",
    d([ d( "Permanente forskjeller" ), d( format.amount( taxCostRecord.permanentDifferences ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Endring i midlertidige forskjeller" ), d( format.amount( taxCostRecord.temporaryDifferences ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Estimatavvik på feilberegnet skatt forrige år" ), d( format.amount( taxCostRecord.taxEstimateCorrection ), {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Skattegrunnlag før bruk av fremførbart underskudd" ), d( format.amount( taxCostRecord.taxResultBeforeUtilizedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    "<br>",
    d([ d( "Inngående fremførbart underskudd" ), d( format.amount( taxCostRecord.accumulatedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Benyttet fremførbart underskudd" ), d( format.amount( taxCostRecord.utilizedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Utgående fremførbart underskudd" ), d( format.amount( taxCostRecord.accumulatedLosses + taxCostRecord.utilizedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    "<br>",
    d([ d( "Skattegrunnlag etter bruk av fremførbart underskudd" ), d( format.amount( taxCostRecord.taxResultAfterUtilizedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    "<br>",
    d([ d( "Årets skattekostnad" ), d( format.amount( taxCostRecord.taxCost ) , {class: "numberCell"})], {class: "financialStatementsRow"})
  ])
} */










 //Archive

/* 


let constructCompanySnapshots = (eventInputs, eventTypes) => {

  let sortedEvents = eventInputs.sort( sortEntitiesByDate )

  let constructedCompanySnapshots =  sortedEvents.map( (Event, index) => sortedEvents.slice(0, index + 1).reduce( (prevCompany, Event) => prevCompany["company/isValid"] ? applyNextEvent(prevCompany, Event, eventTypes) : prevCompany, {"company/isValid": true} ) )

  return constructedCompanySnapshots
}

let applyNextEvent = (prevCompany, EventInputs, eventTypes) => {

  let eventTypeObject = eventTypes[ EventInputs["process/identifier"] ]

  let validatedEventInputVariables = H.eventInputValidator(EventInputs, eventTypes)

  let validatedCombinedEventInputs = (validatedEventInputVariables === false) ? false : eventTypeObject.validateCombinedEventInputs(validatedEventInputVariables)

  

  if(validatedCombinedEventInputs === false){

    let Company = mergerino( {}, prevCompany )
    Company["company/Events"] = Company["company/Events"].concat(EventInputs)
    Company["company/isValid"] = false;
    return Company

  }else{

    let constructedEvent = eventTypeObject.eventConstructor(EventInputs)

    let Company = eventTypeObject.companyDependencies.reduce( (prevCompany, variableName) => {

      let companyDependencyFunction = H.calculatedAttributes[ variableName ]

      let updatedVariableValue = companyDependencyFunction(prevCompany, constructedEvent)

      let updatedCompany = mergerino(prevCompany, createObject(variableName, updatedVariableValue) )

      return updatedCompany

    }, prevCompany )
  
    Company["company/isValid"] = true;
    return Company

  }  

  

}

let accountSelectionDropdown = (A, record) => d([
  d("Konto"),
  dropdown( record["transaction/generic/account"], Object.entries( Accounts ).map( entry => returnObject({label: `${entry[0]} - ${entry[1].label}`, value: entry[0] })).concat([{value: 0, label: ""}]), e => A.submitDatoms([newDatom(record.entity, "transaction/generic/account", e.srcElement.value )]) )
], {class: "inputWithLabel"}  )
 
let metadataViews = {
  "1920": (A, record) => d([
    inputWithLabel_number(A, record, "Bankkonto (kun tall)", `transaction/bankAccount`),
    inputWithLabel_string(A, record, "Transaksjonsreferanse", `transaction/bankTransactionReference`),
  ]),
  "1810": (A, record) => metadataViews["1820"](A, record),
  "1820": (A, record) => d([
        inputWithLabel_string(A, record, "Selskap (orgnr)", `company/orgnumber`),
        inputWithLabel_number(A, record, "Antall", `transaction/investment/quantity`),
        inputWithLabelField_disabled( "Enhetspris: ", format.amount( Math.abs( record["transaction/amount"] / record["transaction/investment/quantity"] )  ) )
    ]),
  "2000": (A, record) => d([
      inputWithLabel_string(A, record, "Orgnr/personnummer", `company/orgnumber`),
      inputWithLabel_number(A, record, "Antall", `transaction/investment/quantity`),
      inputWithLabelField_disabled( "Enhetspris: ", format.amount( Math.abs( record["transaction/amount"] / record["transaction/investment/quantity"] )  ) )
    ]),
  "2915": (A, record) => d([
      inputWithLabel_string(A, record, "Orgnr/personnummer", `company/orgnumber`)
    ])
}


let feedItem_simpleTransaction = (S, A, eventEntity ) => {

  let transaction = eventEntity.Documents[0]

  let records = transaction.records
  

  if(records.length === 2 && records.filter( r => r["transaction/generic/account"] === "1920" && r["transaction/bankAccount"] ).length >= 1 ){

    let cashRecord = records.filter( r => r["transaction/generic/account"] === "1920")[0]
    let otherRecord = records.filter( r => r["entity"] !== cashRecord["entity"] )[0]

    let bankAccount = "DNB" //TBD

    return d([
      d([ d( bankAccount , {style: "background-color: #007272;color: white;align-self: center;padding: 3px; margin-right: 1em;"}), h3(transaction["transaction/description"])], {style: "display:flex;"}),
      d( format.amount( cashRecord["transaction/amount"]), {style: `text-align: end; font-size: 24px; color: ${cashRecord["transaction/amount"] < 0 ? "red" : "black"} `} ),
      accountSelectionDropdown(A, otherRecord),
      accountMetaDataView(A, otherRecord)
    ])

  }else{
    console.log("ERROR: Records not valid:", records)
    return d( JSON.stringify(transaction) )
  }

} 

let feedItem_complexTransaction = (S, A, eventEntity ) => {

  let transaction = eventEntity.Documents[0]

  let records = transaction.records

  return d([
    d(h3(transaction["transaction/description"]), {class: "paddingAndBorder"}),
    inputWithLabel_string(A, eventEntity, "Dato", `date`),
    d([
      h3("Bokføringslinjer"),
      records.map( (record, i) => basicRecordView(S, A, record, i) ).join(''),
      d("Legg til linje", {class: "textButton"}, "click", e => A.submitDatoms( templateDatoms.newRecord(S, eventEntity) ) )
    ], {class: "paddingAndBorder"}),
    d([
      h3(`Aggreggert for transaksjon`),
      d([d("Kontonr."), d("Konto"), d("Debit", {class: "numberCell"} ), d("Credit", {class: "numberCell"} ), d("Netto endring", {class: "numberCell"} )], {class: "trialBalanceRow"}),
      records.map( record => d([ 
        d( record["transaction/generic/account"] ), 
        d( Accounts[ record["transaction/generic/account"] ]["label"] ), 
        d( record["transaction/amount"] >= 0 ? format.amount( record["transaction/amount"] ) : "", {class: "numberCell"}), 
        d( record["transaction/amount"] < 0 ? format.amount( record["transaction/amount"] ) : "", {class: "numberCell"}), 
        d( format.amount( record["transaction/amount"] ), {class: "numberCell"}), 
      ], {class: "trialBalanceRow"})).join(''),
      d([ 
        d( "" ), 
        d( "Sum" ),  
        d( format.amount( records.reduce( (sum, record) => record["transaction/amount"] >= 0 ? sum + record["transaction/amount"] : sum, 0 ) ), {class: "numberCell"}), 
        d( format.amount( records.reduce( (sum, record) => record["transaction/amount"] < 0 ? sum + record["transaction/amount"] : sum, 0 ) ), {class: "numberCell"}), 
        d( format.amount( records.reduce( (sum, record) => sum + record["transaction/amount"], 0 ) ), {class: "numberCell"}), 
      ], {class: "trialBalanceRow"}),
      "<br>",
      records.reduce( (sum, record) => sum + record["transaction/amount"], 0 ) !== 0 ? d("IKKE I BALANSE", {style: "color:red;"}) : ""
    ], {class: "paddingAndBorder"}),
    d("Slett", {class: "textButton"}, "click", e => A.retractEntity( eventEntity["entity"] ) )
  ])
}

let basicRecordView = (S, A, record, i) => {

  let amount = record["transaction/amount"]

  return d([
    h3(`Bokføringslinje nr. ${i+1}`),
    accountSelectionDropdown(A, record),
    accountMetaDataView(A, record),
    (record["transaction/generic/account"] === "1920" && record["transaction/bankTransactionReference"]) ? inputWithLabelField_disabled( "Beløp", amount ) : inputWithLabel_number(A, record, "Beløp", "transaction/amount"),
    d("Slett linje", {class: "textButton"}, "click", e => A.retractEntity( record["entity"] ) )
  ], {class: "paddingAndBorder"})
} 

let accountMetaDataView = (A, record) => metadataViews[ record["transaction/generic/account"] ] ? metadataViews[ record["transaction/generic/account"] ](A, record) :  d("na.")

let feedItem_incorporation = (S, A, eventEntity) => {

  let AoA = eventEntity.Documents[0]


  return d( [
    h3("Stiftelse"),
    d([d("Organisasjonsnummer:"), d(eventEntity["company/orgnumber"]) ], {class: "inputWithLabel"}),
    d([d("Selskapsnavn:"), d(AoA["company/name"]) ], {class: "inputWithLabel"}),
    d([d("Selskapet har kun ordinære aksjer"), el("input", {type: "checkbox", checked: "checked"})], {class: "inputWithLabel"}),
    d([d("Selskapet har valgt å ikke ha revisor"), el("input", {type: "checkbox", checked: "checked"})], {class: "inputWithLabel"}),
    inputWithLabelField("Aksjenes pålydende: ", format.amount( AoA["company/AoA/nominalSharePrice"] ), e => A.submitDatoms( [newDatom(AoA["entity"], "company/AoA/nominalSharePrice", validate.number(e.srcElement.value) )])),
])
} 






let eventTypeController = {
  "incorporation": (S, A, eventEntity) => feedItem_incorporation(S, A, eventEntity),
  "simpleTransaction": (S, A, eventEntity) => feedItem_simpleTransaction(S, A, eventEntity),
  "complexTransaction": (S, A, eventEntity) => feedItem_complexTransaction(S, A, eventEntity)
}


let eventView = (CompanySnapshot, A) => {
  
  let Event = CompanySnapshot["appliedEvents"][ CompanySnapshot["appliedEvents"].length - 1]
  return CompanySnapshot["company/isValid"] ? d([
    d([
      eventTypeSelector(CompanySnapshot, A), 
      eventTypes[ Event["process/identifier"] ]["view"](CompanySnapshot, A),
    ], {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
    d( `${Event["date"]} (id: ${Event["entity"]} )` , {style: "margin-right: 1em;text-align: right;margin-bottom: 1em;color:#979797;margin-top: 3px;"})
  ]) : d([
    d([
      d("Event not valid:"),
      "<br>",
      d(JSON.stringify(CompanySnapshot["company/eventsToProcess"][ 0 ])),
    ], {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
    d( `${CompanySnapshot["company/eventsToProcess"][ 0 ]["date"]} (id: ${CompanySnapshot["company/eventsToProcess"][ 0 ]["entity"]} )` , {style: "margin-right: 1em;text-align: right;margin-bottom: 1em;color:#979797;margin-top: 3px;"})
  ]) 
} 


let newFounderDatoms = (parent, shareholder, shareCount, sharePremium) => [
  newDatom("shareholderTransaction", "type", "shareholderTransaction"),
  newDatom("shareholderTransaction", "parent", parent),
  newDatom("shareholderTransaction", "shareholder/id", shareholder),
  newDatom("shareholderTransaction", "transaction/investment/quantity", shareCount),
  newDatom("shareholderTransaction", "transaction/investment/unitPrice", sharePremium)
]

let eventView_incorporation = (CompanySnapshot, A) => {

    let incorporationEvent = CompanySnapshot["appliedEvents"][ CompanySnapshot["appliedEvents"].length - 1]

  return d([
    d([d("Organisasjonsnummer:"), d(incorporationEvent["company/orgnumber"]) ], {class: "inputWithLabel"}),
    d([d("Selskapet har kun ordinære aksjer"), el("input", {type: "checkbox", checked: "checked"})], {class: "inputWithLabel"}),
    d([d("Selskapet har valgt å ikke ha revisor"), el("input", {type: "checkbox", checked: "checked"})], {class: "inputWithLabel"}),
    inputWithLabelField("Aksjenes pålydende: ", format.amount( incorporationEvent["company/AoA/nominalSharePrice"] ), e => A.submitDatoms( [newDatom(incorporationEvent["entity"], "company/AoA/nominalSharePrice", validate.number(e.srcElement.value) )])),
    "<br>",
    d([
      incorporationEvent.shareholderTransactions.map( (shareholderTransaction, index) => d( [
        d(`Stifter nr: ${index + 1}:`),
        inputWithLabelField("Personnummer/orgnr: ", shareholderTransaction["company/orgnumber"], e => A.submitDatoms( eventTypes["incorporation"].updateShareholderIDDatoms(shareholderTransaction.entity, validate.string(e.srcElement.value)) )),
        inputWithLabelField("Antall aksjer: ", shareholderTransaction["transaction/investment/quantity"], e => A.submitDatoms( eventTypes["incorporation"].updateShareCountDatoms(shareholderTransaction.entity, validate.string(e.srcElement.value)) )),
        inputWithLabelField("Overkurs per aksje: ", shareholderTransaction["transaction/investment/unitPrice"], e => A.submitDatoms( eventTypes["incorporation"].updateSharePremiumDatoms(shareholderTransaction.entity, validate.string(e.srcElement.value)) )),
        d("Slett", {class: "textButton"}, "click", e => A.submitDatoms( eventTypes["incorporation"].retractFounderDatoms(shareholderTransaction) ) ),
        "<br>",
      ] ) ).join(""),
      "<br>",
    ]),
    d("Legg til stifter", {class: "textButton"}, "click", e => A.submitDatoms( eventTypes["incorporation"].addFounderDatoms(Event) ) ),
    "<br>",
    
    //Stiftere, stiftelseskostnader TBD. Innbetaling bokføres separat.
  ]) 
} */