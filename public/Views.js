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



const generateHTMLBody = (S, A) => [
  headerBarView(S),
  d( S.Events.map( E => E["company/orgnumber"] ).filter( filterUniqueValues ).map( orgnumber => d( orgnumber, {class: orgnumber === S.selectedOrgnumber ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {selectedOrgnumber : orgnumber} ) )  ), {style: "display:flex;"}),
  d( S.CompanySnapshots.map( CompanySnapshot => CompanySnapshot["company/appliedEvents"].length > 0 ? appliedEventView(S, CompanySnapshot, A) : d("")   ), {class: "pageContainer"} ) ,
  d( [companyInspectorView( S.CompanyDoc, A )]  , {class: "pageContainer"} ),
  d( S.CompanyDoc["company/rejectedEvents"].map( rejectedEvent => rejectedEventView(rejectedEvent, A)   ), {class: "pageContainer"} ),
  d( [addEventView(S.CompanyDoc, A)]  , {class: "pageContainer"} ),
]



let appliedEventView = ( S, CompanySnapshot, A ) => {

  

  let appliedEvents = CompanySnapshot["company/appliedEvents"]
  
  let Event = appliedEvents[ appliedEvents.length - 1 ]

  let dependencies = getDependencies(Event)



  let eventTypeSelector = d(JSON.stringify(Event["event/eventType"]))
  

  let adminInputAttributeViews = getRequiredAttributes(Event).map( attribute => d([
    d("brukerinput"),
    d(attribute),
    input({value: Event[ attribute ], style: "text-align: right;"}, "change", e => A.updateEventAttribute(Event, attribute , (typeof Event[ attribute ] === "number") ? Number(e.srcElement.value) : e.srcElement.value ) ),
    d( String( getAttributeValidatorsObject()[attribute]( Event[ attribute] ) ) ),
  ], {class: "eventInspectorRow"}) )

  let calculatedAttributeViews = getAllOutputFunctionNames_eventLevel().map( attribute => d([
    d("kalkulert (hendelsesnivå)"),
    d(attribute),
    d( String( Event[ attribute ] ) )
  ], {class: "eventInspectorRow"}) )

  let calculatedCompanyAttributeViews = getAllOutputFunctionNames_companyLevel().filter( attr => attr !== "company/appliedEvents" && attr !== "company/rejectedEvents").map( attribute => d([
    d("kalkulert (selskapsnivå)"),
    d(attribute),
    d( JSON.stringify( CompanySnapshot[ attribute ] ) )
  ], {class: "eventInspectorRow"}) )

  let allCompanyAttributeViews = Object.keys(CompanySnapshot).filter( attr => attr !== "company/appliedEvents" && attr !== "company/rejectedEvents").map( attribute => dependencies.includes(attribute) ? d( `${attribute}: ${JSON.stringify(CompanySnapshot[ attribute ])} [ previousValue - TBD ] `, {style: `color:red;`} ) : d( `${attribute}: ${JSON.stringify(CompanySnapshot[ attribute ])}`)  )

  let attributeViews = [
    h3("Hendelse:"),
    eventTypeSelector,
    h3("Brukerinput for valgt hendelsestype:"),
    adminInputAttributeViews,
    h3("Kalkulert output på hendelsesnivå:"),
    calculatedAttributeViews,
    h3("Kalkulert output på selskapssnivå:"),
    calculatedCompanyAttributeViews,
    retractEventButton(Event, A)
  ].flat()

  return d([
    d(
      attributeViews
    , {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"} ),
    d( `${Event["date"]} (id: ${Event["entity"]} )` , {style: "margin-right: 1em;text-align: right;margin-bottom: 1em;color:#979797;margin-top: 3px;"})
  ])



}

let rejectedEventView = ( Event, A ) => {

  /* let inputAttributeObject = sharedConfig.inputAttributes
  let eventTypeObject = sharedConfig.eventTypes[ Event["process/identifier"] ]

  let genericEventAttributeViews = ["process/identifier"].map( attribute => inputAttributeObject[ attribute ].view( Event, A )  )
  let inputAttributeViews = eventTypeObject["inputAttributes"].map( attribute => inputAttributeObject[ attribute ].view( Event, A )  )
  let errorViews = d( [Event["event/errors"]].map( error => d( error.error )  ))

  let attributeViews = [
    h3("Ugyldig hendelse:"),
    genericEventAttributeViews,
    h3("Hendelsens input:"),
    inputAttributeViews,
    h3("Feilmeldinger:"),
    errorViews,
    retractEventButton(Event, A)
  ].flat() */

  return d([
    d(
      "TBD"//attributeViews
    , {style: "width: 800px;padding:1em; margin-left:1em; background-color: #ff000024;border: solid 1px lightgray;"} ),
    d( `${Event["date"]} (id: ${Event["entity"]} )` , {style: "margin-right: 1em;text-align: right;margin-bottom: 1em;color:#979797;margin-top: 3px;"})
  ])



}

let companyInspectorView = ( companySnapshot, A ) => d([
    d([
    h3("Selskapsdokumentet"),
    d("<br><br>"),
    htmlElementObject("textarea", {style: "width: 800px; height: 400px;"}, JSON.stringify(companySnapshot)),
    /* d( Object.keys(companySnapshot).map( attribute => d([
      d(attribute), 
      d(JSON.stringify(companySnapshot[attribute]))
    ], {class: "eventInspectorRow"} )  ) ) */
  ], {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
  d( `${companySnapshot["date"]} (id: ${companySnapshot["entity"]} )` , {style: "margin-right: 1em;text-align: right;margin-bottom: 1em;color:#979797;margin-top: 3px;"})
])

let addEventView = (CompanyDoc, A) => d([
  d([
    h3("Legg til ny hendelse:"),
    dropdown( 0, CompanyDoc["company/applicableEventTypes"].map( eventType => returnObject({label: `${eventType}`, value: eventType })).concat([{value: 0, label: ""}]), e => A.createEvent(CompanyDoc, String(e.srcElement.value) ) )
  ], {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"} ),
  d( `${Event["date"]} (id: ${Event["entity"]} )` , {style: "margin-right: 1em;text-align: right;margin-bottom: 1em;color:#979797;margin-top: 3px;"})
])


// COMPANY DOCUMENT CREATION PIPELINE

let generateCompanyDocument = (Events) => Events.reduce( accumulateEvents, {
  "company/isIncorporated": false, 
  "company/applicableEventTypes": ["incorporation"], 
  "company/rejectedEvents": [], 
  "company/appliedEvents": []
} ) //generate initialCompany dynamically based on default values per outputVariable on company level?

let accumulateEvents = (Company, Event) => ifNot( 
  companyIsValid(Company), 
  rejectEvent(Company, Event, "Cannot apply event to company unless all previous events are successfully applied."),   
    ifNot( 
      isApplicableEvent(Company, Event), 
      rejectEvent(Company, Event, "The selected eventType is not applicable to the company."),
        ifNot( 
          isValidEvent( Event ) , 
          rejectEvent(Company, Event, "The supplied event inputs are not valid."), 
          applyNextEvent(Company, Event)
    )
  )
)

//Rejection function
let rejectEvent = (prevCompany, Event, errorMessage) =>  mergerino(prevCompany, 
  {"company/rejectedEvents": prevCompany["company/rejectedEvents"].concat( mergerino(Event, {"event/errors": {error: errorMessage} })) }
)

//Validators



let companyIsValid = (Company) => [
  (Company) => ["company/isIncorporated", "company/applicableEventTypes"].every( attribute => Object.keys(Company).includes( attribute  ) ) , //Company has all required attributes
  (Company) => Company["company/rejectedEvents"].length === 0 //Company has no errors
].every( criteriumFunction => criteriumFunction(Company) )

let isApplicableEvent = (Company, Event) => Company["company/applicableEventTypes"].includes( Event["event/eventType"] )

let isValidEvent = (Event) => [
  (Event) => getAllEventTypes().includes( Event["event/eventType"] ), //Event has a valid event type
  (Event) => getRequiredAttributes(Event).every( attribute => Object.keys( Event ).includes( attribute ) ), //Event has all required attributes
  (Event) => getRequiredAttributes(Event).every( attribute => getAttributeValidatorsObject()[ attribute ]( Event[ attribute ] ) ), //All attribute values are valid
  (Event) => getEventTypeInputCriteria(Event).every( criterumFunction =>  criterumFunction(Event) ), //All event level input criteria are fulfilled
].every( criteriumFunction => criteriumFunction(Event)  )

//Construct event and apply to company

let applyNextEvent = (Company, Event) => updateCompanyAttributes( Company, constructEvent(Company, Event)  )  // (Company, Event) -> updatedCompany

let constructEvent = (Company, Event) => getDependencies_eventLevel(Event).reduce( (updatedEvent, calculatedAttributeName) => updateCalculatedAttribute_Event(Company, updatedEvent, calculatedAttributeName), Event ) // (Company, Event) -> constructedEvent

let updateCompanyAttributes = (Company, constructedEvent) => getDefaultCalculatedAttributes()
  .concat( getDependencies_companyLevel(constructedEvent) )
  .concat("company/applicableEventTypes")
  .reduce( (updatedCompany, calculatedAttributeName) => updateCalculatedAttribute_Company(updatedCompany, constructedEvent, calculatedAttributeName), Company ) // (Company, constructedEvent) -> updatedCompany

let updateCalculatedAttribute_Event = (Company, Event, calculatedAttributeName) => mergerino( Event,  //(Company, Event, calculatedAttributeName) -> updatedEvent
  createObject(calculatedAttributeName, getCalculatedOutputFunction_eventLevel(calculatedAttributeName)(Company, Event))
)

let updateCalculatedAttribute_Company = (Company, constructedEvent, calculatedAttributeName) => mergerino( Company, //(Company, constructedEvent, calculatedAttributeName) -> updatedCompany
  createObject(calculatedAttributeName, getCalculatedOutputFunction_companyLevel(calculatedAttributeName)(Company, constructedEvent))
)

let addAccountBalances = (prevAccountBalance, accountBalance) => {

  let prevAccounts = Object.keys(prevAccountBalance).length > 0 ? Object.keys(prevAccountBalance) : []

  let newAccounts = Object.keys(accountBalance).length > 0 ? Object.keys(accountBalance) : []

  let allAccounts = prevAccounts.concat(newAccounts).filter( filterUniqueValues )

  let newAccountBalance = mergerino({}, allAccounts.map( acc => createObject(acc, ifError(prevAccountBalance[acc], 0) +  ifError(accountBalance[acc], 0)) ))

  return newAccountBalance
}

// COMPANY DOCUMENT CREATION PIPELINE - END

let Accounts = {
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
}

let attributeValidators = { //Input attributes, ie. actual registered DB attributes
  "entity/type": v => [
      v => typeof v === "string", //validator + description of correct format should be sufficient [?]
      v => ["process", "event"].includes(v)
    ].every( f => f(v) ),
  "event/eventType": v => [
      v => typeof v === "string", 
      v => getAllEventTypes().includes(v)
    ].every( f => f(v) ),
  "event/index": v => [
        v => typeof v === "number",
        v => v >= 1
    ].every( f => f(v) ),
  "event/incorporation/orgnumber": v => [
    v => typeof v === "string", 
    v => v.length === 9
  ].every( f => f(v) ),
  "event/date": v => [
    v => typeof v === "string", 
    v => v.length === 10
  ].every( f => f( v ) ),
  "event/incorporation/nominalSharePrice": v => [
    v => typeof v === "number", 
    v => v > 0
  ].every( f => f(v) )
}

let eventTypes = {
  "incorporation": {
    requiredAttributes: ["event/date", "event/incorporation/orgnumber", "event/incorporation/nominalSharePrice"],
    eventInputCriteria: [
      Event => Event["event/eventType"] === "incorporation",
    ],
    applicabilityCriteria: [
      Company => Company["company/appliedEvents"].length === 0,
    ],
    dependencies: ["event/isIncorporated", "company/isIncorporated", "company/orgnumber", "company/nominalSharePrice"],
    //getAccountBalance: (Event) => returnObject({}),
  }
}

let calculatedOutputs = { //Should only provide correct output when used in correct context, ie. no validation/error handling.
  "event": {
    "event/isIncorporated": (prevCompany, Event) => Event["event/eventType"] === "incorporation",
  },
  "company": {
    "company/isIncorporated": (prevCompany, Event) => Event["event/isIncorporated"],
    "company/orgnumber": (prevCompany, Event) => Event["event/incorporation/orgnumber"],
    "company/nominalSharePrice": (prevCompany, Event) => Event["event/incorporation/nominalSharePrice"],
    "company/appliedEvents": (prevCompany, Event) => prevCompany["company/appliedEvents"].concat(Event),
    "company/appliedEventsCount": (prevCompany, Event) => Event["event/isIncorporated"] ? 1 : prevCompany["company/appliedEventsCount"] + 1,
    "company/applicableEventTypes": (prevCompany, Event) => getAllEventTypes().filter( eventType => getEventTypeApplicabilityCriteria(eventType).every( criteriumFunction => criteriumFunction(prevCompany) )   ) ,
    
  }
}



let getAllEventTypes = () => Object.keys(eventTypes)
let getRequiredAttributes = (Event) => eventTypes[ Event["event/eventType"] ]["requiredAttributes"]
let getAttributeValidatorsObject = () => attributeValidators
let getAllAttributeValidators = () => Object.values( getAttributeValidatorsObject() )
let getEventTypeInputCriteria = (Event) => eventTypes[ Event["event/eventType"] ]["eventInputCriteria"]
let getEventTypeApplicabilityCriteria = (eventType) => eventTypes[ eventType ]["applicabilityCriteria"]
let getDependencies = (Event) => eventTypes[ Event["event/eventType"] ]["dependencies"]
let getDependencies_eventLevel = (Event) => getDependencies(Event).filter( dependency => dependency.startsWith("event/") )
let getDependencies_companyLevel = (Event) => getDependencies(Event).filter( dependency => dependency.startsWith("company/") )
let getOutputFunctionObject = () => calculatedOutputs
let getOutputFunctionObject_eventLevel = () => getOutputFunctionObject()["event"]
let getAllOutputFunctionNames_eventLevel = () => Object.keys( getOutputFunctionObject_eventLevel() ) 
let getOutputFunctionObject_companyLevel = () => getOutputFunctionObject()["company"]
let getAllOutputFunctionNames_companyLevel = () => Object.keys( getOutputFunctionObject_companyLevel() ) 
let getCalculatedOutputFunction_eventLevel = (calculatedAttributeName) => calculatedOutputs["event"][ calculatedAttributeName ]
let getCalculatedOutputFunction_companyLevel = (calculatedAttributeName) => calculatedOutputs["company"][ calculatedAttributeName ]
let getDefaultCalculatedAttributes = () => ["company/appliedEvents", "company/appliedEventsCount"]





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

/* let sharedConfig = {
  Accounts: H.Accounts,
  eventTypes: H.eventTypes,
  inputAttributes: H.inputAttributes,
  defaultCalculatedAttributes: ["company/appliedEvents", "company/appliedEventsCount"],
  calculatedAttributes: H.calculatedAttributes,
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
  inputAttributes: {
    "type": { //Should be inputAttribute
      validators: [
        (value) => value === "process"
      ],
      valueType: "string",
      view: (Event, A) => d([
        d("Entitetstype."),
        input({disabled: "disabled", value: Event["type"], style: "text-align: right;" })
      ], {class: "inputWithLabel"}  )
    },
    "process/identifier": { //Should be inputAttribute
      validators: [
        (value) => Object.keys(sharedConfig.eventTypes).includes(value)
      ],
      valueType: "string",
      view: (Event, A) => d([
        d("Hendelsestype"),
        dropdown( ifError( Event["process/identifier"], 0), Object.entries(sharedConfig.eventTypes).map( entry => returnObject({label: `${entry[0]} - ${entry[1].label}`, value: entry[0] })).concat([{value: 0, label: ""}]), e => A.updateEventAttribute(Event, "process/identifier", String(e.srcElement.value) ) )
      ], {class: "inputWithLabel"}  )
    },
    "transaction/records": { 
      validators: [
        (value) => typeof value === "object"
      ],
      valueType: "object",
      view: (Event, A) => d(JSON.stringify(Event))
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
        dropdown( ifError( Event["transaction/generic/account"], 0), Object.entries( sharedConfig.Accounts ).map( entry => returnObject({label: `${entry[0]} - ${entry[1].label}`, value: entry[0] })).concat([{value: 0, label: ""}]), e => A.updateEventAttribute(Event, "transaction/generic/account", String(e.srcElement.value) ) )
      ], {class: "inputWithLabel"}  )
    },
    "transaction/amount": {
      validators: [
        value => typeof value === "number",
      ],
      valueType: "number",
      view: (Event, A) => d([
        d("Beløp"),
        input({value: Event["transaction/amount"], style: "text-align: right;"}, "change", e => A.updateEventAttribute(Event, "transaction/amount", Number(e.srcElement.value) ) )
      ], {class: "inputWithLabel"}  )
    },
    "company/orgnumber": {
      validators: [
        (value) => typeof value === "string",
        (value) => value.length === 9,
        (value) => Number(value) >= 700000000,
        (value) => Number(value) < 1000000000
      ],
      valueType: "string",
      view: (Event, A) => d([
        d("Orgnr."),
        input({disabled: "disabled", value: Event["company/orgnumber"], style: "text-align: right;" })
      ], {class: "inputWithLabel"}  )
    },
    "date": {
      validators: [
        (value) => true
      ],
      valueType: "string",
      view: (Event, A) => d([
        d("Dato."),
        input({disabled: "disabled", value: Event["date"], style: "text-align: right;" })
      ], {class: "inputWithLabel"}  )
    },
    "company/AoA/nominalSharePrice": { 
      validators: [
        (value) => typeof value === "number",
        (value) => value >= 0.01
      ],
      valueType: "number",
      view: (Event, A) => d([
        d("Aksjenes pålydende"),
        input({value: Event["company/AoA/nominalSharePrice"], style: "text-align: right;"}, "change", e => A.updateEventAttribute(Event, "company/AoA/nominalSharePrice", Number(e.srcElement.value) ) )
      ], {class: "inputWithLabel"}  )
    },
  },
  calculatedAttributes: {
    "company/isIncorporated": (prevCompany, Event) => ( prevCompany["company/isIncorporated"] || Event["event/isIncorporated"]) ? true : false,
    "company/orgnumber": (prevCompany, Event) => prevCompany["company/orgnumber"] ? prevCompany["company/orgnumber"] : Event["company/orgnumber"],
    "company/AoA/nominalSharePrice": (prevCompany, Event) => Event["event/nominalSharePrice"],
    "company/shareCount": (prevCompany, Event) => prevCompany["company/shareCount"] ? prevCompany["company/shareCount"] + Event["event/shareCountIncrease"] : Event["event/shareCountIncrease"],
    "company/shareholders": (prevCompany, Event) => Array.isArray(Event["transaction/records"]) ? Event["transaction/records"].map( shareholderTransaction => shareholderTransaction["company/orgnumber"] ).filter( filterUniqueValues ) : [],
    "company/shareCapital": (prevCompany, Event) => Array.isArray(Event["transaction/records"]) ? Event["event/accountBalance"]["2000"] : null,
    "company/accountBalance": (prevCompany, Event) => addAccountBalances( prevCompany["company/accountBalance"], Event["event/accountBalance"]),
    "company/appliedEvents": (prevCompany, Event) => prevCompany["company/appliedEvents"].concat(Event),
    "company/appliedEventsCount": (prevCompany, Event) => Event["event/isIncorporated"] ? 1 : prevCompany["company/appliedEventsCount"] + 1,
    "company/applicableEventTypes": (prevCompany, Event) => Object.keys(sharedConfig["eventTypes"]).filter( eventType => sharedConfig["eventTypes"][ eventType ]["applicabilityCriteria"].every( criteriumFunction => criteriumFunction(prevCompany) === true )   ) ,
    "event/isIncorporated": (prevCompany, eventInput) => eventInput["process/identifier"] === "incorporation" ? true : false,
    "event/nominalSharePrice": (prevCompany, Event) => Event["company/AoA/nominalSharePrice"],
    "event/shareCountIncrease": (prevCompany, eventInput) => Array.isArray(eventInput["transaction/records"]) ? eventInput["transaction/records"].reduce( (sum, shareholderTransaction) => sum + shareholderTransaction["transaction/investment/quantity"], 0 ) : null,
    "event/shareCapitalIncrease": (prevCompany, eventInput) => Array.isArray(eventInput["transaction/records"]) ? eventInput["transaction/records"].reduce( (sum, shareholderTransaction) => sum + shareholderTransaction["transaction/investment/quantity"] * (eventInput["company/AoA/nominalSharePrice"] + shareholderTransaction["transaction/investment/unitPrice"]), 0 ) : null,
    "event/accountBalance": (prevCompany, Event) => sharedConfig["eventTypes"][ Event["process/identifier"] ].getAccountBalance(Event)
  },
  eventTypes: {
    "incorporation": {
      label: "Stiftelse",
      inputAttributes: ["date", "company/AoA/nominalSharePrice"],
      eventInputCriteria: [
        (Event) => Event["type"] === "process",
        (Event) => Event["process/identifier"] === "incorporation",
      ],
      applicabilityCriteria: [
        (Company) => Company["company/appliedEvents"].length === 0,
      ],
      calculatedAttributes: ["event/isIncorporated", "event/nominalSharePrice"],
      getAccountBalance: (Event) => returnObject({}),
      dependencies: ["company/isIncorporated", "company/orgnumber", "company/AoA/nominalSharePrice"] 
    },
    "incorporation/addFounder": {
      label: "Legg til stifter",
      inputAttributes: ["transaction/records"],
      eventInputCriteria: [
        (Event) => Event["type"] === "process",
      ],
      applicabilityCriteria: [
        (Company) => Company["company/isIncorporated"],
      ],
      calculatedAttributes: ["event/shareCountIncrease", "event/shareCapitalIncrease", "event/accountBalance"],
      getAccountBalance: (Event) => returnObject({}),
      dependencies: ["company/shareCount", "company/shareholders", "company/shareCapital", "company/accountBalance"] 
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
      getAccountBalance: (Event) => mergerino(
        {"1920": Event["transaction/amount"] },
        createObject(Event["transaction/generic/account"], -Event["transaction/amount"])
      ),
      dependencies: ["company/accountBalance"],
      newEventDatoms: (CompanyDoc) => [
        newDatom("newEvent", "type", "process"),
        newDatom("newEvent", "process/identifier", "operatingCost"),
        newDatom("newEvent", "company/orgnumber", CompanyDoc["company/orgnumber"]),
        newDatom("newEvent", "date", CompanyDoc["company/appliedEvents"][ CompanyDoc["company/appliedEventsCount"] - 1 ]["date"]  ),
        newDatom("newEvent", "transaction/generic/account", "7770"),
        newDatom("newEvent", "transaction/amount", 0),
      ]
    }
  }
}

*/