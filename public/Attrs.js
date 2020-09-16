
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

//CONFIG DATA

const AttributeValidators = { //Ad-hoc validators specified on event level. Global attribute validation has been performed already.
  "event/index": {
    "isFirstEvent": value => value === 1,
    "notFirstEvent": value => value > 1,
    "notLaterThanFifthEvent": value => value <= 5,
  },
  "event/date": {
    "is2020": value => value.startsWith("2020")
  },
  "event/incorporation/nominalSharePrice": {
    "isPositiveNumber": value => value > 0,
    "isAboveFive": value => value > 5,
  }
}

const companyVariablesValidators = {
  "hasNominalSharePrice": (companyVariables) => Object.keys(companyVariables).includes("company/:nominalSharePrice"),
  "hasNominalSharePriceAbove10": (companyVariables) => companyVariables["company/:nominalSharePrice"] > 10
}

const eventValidators = {
  "sumOfindexAndNomSPAbove10": (inputEvent) => (inputEvent["event/index"] + inputEvent["event/incorporation/nominalSharePrice"]) > 10
}

const combinedValidators = {
  "dateEqualToSP": (companyVariables, inputEvent) =>  inputEvent["event/date"].endsWith( String(companyVariables["company/:nominalSharePrice"]) )
}

let event_incorporation = {
  eventType: "incorporation",
  requiredAttributes: ["event/index", "event/date", "event/incorporation/orgnumber", "event/incorporation/nominalSharePrice"],
  attributeCriteria: [
    {attribute: "event/index", validator: "isFirstEvent" }
  ],
  requiredCompanyInputs: ["company/:applicableEventTypes"],
  companyVariablesValidators: [],
  eventValidators: ["sumOfindexAndNomSPAbove10"],
  combinedValidators: [],
  dependencies: ["company/:orgnumber", "company/:nominalSharePrice", "company/:applicableEventTypes", "company/:currentEventEntity", "company/:applicableEventTypes"],
}

let event_testEvent = {
  eventType: "testEvent",
  requiredAttributes: ["event/index", "event/date"],
  attributeCriteria: [
    {attribute: "event/index", validator: "notFirstEvent" },
    {attribute: "event/index", validator: "notLaterThanFifthEvent" },
    {attribute: "event/date", validator: "is2020" },
  ],
  requiredCompanyInputs: ["company/:nominalSharePrice"],
  companyVariablesValidators: ["hasNominalSharePrice", "hasNominalSharePriceAbove10"],
  eventValidators: [],
  combinedValidators: ["dateEqualToSP"],
  dependencies: ["company/:testOutput", "company/:currentEventEntity", "company/:prevEventEntity", "company/:applicableEventTypes"],
}

let allEventTypes = [
  event_incorporation,
  event_testEvent
]

let eventTypes = {
  incorporation: event_incorporation,
  testEvent: event_testEvent
}

let getEventTypeObject = (parameter) => mergerino({},
  allEventTypes.map( eventType => createObject(eventType.eventType, eventType[parameter] )   )
)




const EventType = {
  requiredAttributes: getEventTypeObject("requiredAttributes"),
  requiredCompanyInputs: getEventTypeObject("requiredCompanyInputs"),
  attributeCriteria: getEventTypeObject("attributeCriteria"),
  companyVariablesValidators: getEventTypeObject("companyVariablesValidators"),
  eventValidators: getEventTypeObject("eventValidators"),
  combinedValidators: getEventTypeObject("combinedValidators"),
  dependencies: getEventTypeObject("dependencies"),
  getRequiredAttributes: (eventType) => EventType[ "requiredAttributes" ][ eventType ],
  getRequiredCompanyInputs: (eventType) => EventType[ "requiredCompanyInputs" ][ eventType ],
  prevEventCycleIncludesEventType: (companyVariables, eventType) => companyVariables["company/:applicableEventTypes"].includes(eventType),
  hasRequiredCompanyVars: (companyVariables, eventType) => EventType.getRequiredCompanyInputs(eventType ).every( requiredCompanyVariable => Object.keys(companyVariables).includes(requiredCompanyVariable)  ),
  combinedEventInputsAreValid: (inputEvent) => EventType[ "eventValidators" ][ inputEvent["event/eventType"] ].every( eventCriterium => eventValidators[ eventCriterium ](inputEvent) ),
  companyVariablesAreValid: (companyVariables, eventType) => EventType[ "companyVariablesValidators" ][ eventType ].every( applicabilityCriterium => companyVariablesValidators[ applicabilityCriterium ]( companyVariables ) ),
  getDependencies: (eventType) => EventType[ "dependencies" ][ eventType ],
  getAllEventTypes: () => allEventTypes.map( eventType => eventType.eventType )
}

//Attributes

const Attribute = {
  validators: {
    "entity/type": v => [
      v => typeof v === "string", //validator + description of correct format should be sufficient [?]
      v => ["process", "event"].includes(v)
    ].every( f => f(v) ),
    "event/eventType": v => [
        v => typeof v === "string", 
        v => EventType.getAllEventTypes().includes(v)
      ].every( f => f(v) ),
    "event/index": v => [
          v => typeof v === "number",
          v => v >= 1
      ].every( f => f(v) ),
    "event/incorporation/orgnumber": v => [
      v => typeof v === "string", 
      v => v.length === 9,
      v => v === "999999999" //for testing...
    ].every( f => f(v) ),
    "event/date": v => [
      v => typeof v === "string", 
      v => v.length === 10
    ].every( f => f( v ) ),
    "event/incorporation/nominalSharePrice": v => [
      v => typeof v === "number", 
      v => v > 0
    ].every( f => f(v) )
  },
  validate: (attribute, value) => Attribute.validators[ attribute ](value),
  validateAttributes: (inputEvent) => Object.entries(inputEvent).filter( entry => Object.keys(Attribute.validators).includes(entry[0]) ).every( entry => Attribute.validators[ entry[0] ](entry[1]) ),
  isNumber: (attribute) => ["event/index", "event/incorporation/nominalSharePrice"].includes(attribute),
  getSystemAttributes: () => ["entity", "entity/type"]
}


//Output functions

const outputFunction = {
  functions: {
    "company/:currentEventEntity": (companyVariables, Event) => Event["entity"],
    "company/:prevEventEntity": (companyVariables, Event) => companyVariables["company/:currentEventEntity"],
    "company/:orgnumber": (companyVariables, Event) => Event["event/incorporation/orgnumber"],
    "company/:nominalSharePrice": (companyVariables, Event) => Event["event/incorporation/nominalSharePrice"],
    "company/:applicableEventTypes": (companyVariables, Event) => allEventTypes.map( eventType => eventType.eventType ),
    "company/:testOutput": (companyVariables, Event) => Math.round( Math.random() * 3 ),
  },
  calculate: (functionName, companyVariables, Event) => outputFunction.functions[ functionName ](companyVariables, Event)
}











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



//Archive

//var func = new Function("prevCompany, Event", "return prevCompany['company/shareholders'];" )
//var func2 = new Function("prevCompany, Event", "console.log(prevCompany['company/shareholders']) ;" )


/* 


let eventTypes = {
  "incorporation": {
    userInputs: ["event/date", "event/incorporation/orgnumber", "event/incorporation/nominalSharePrice"],
    companyInputs: ["company/appliedEvents"],
    eventInputCriteria: [
      Event => Event["event/eventType"] === "incorporation",
    ],
    applicabilityCriteria: [
      Company => Company["company/eventCycle"] === 0,
    ],
    dependencies: ["event/earlierEvents", "company/orgnumber", "company/nominalSharePrice", "company/appliedEvents", "company/appliedEventsCount"],
    //getAccountBalance: (Event) => returnObject({}),
  }
}

let calculatedOutputs = { //Should only provide correct output when used in correct context, ie. no validation/error handling.
  "event": {
    "event/isIncorporated": (prevCompany, Event) => Event["event/eventType"] === "incorporation",
    "event/earlierEvents": (prevCompany, Event) => prevCompany["company/appliedEvents"],
  },
  "company": {
    "company/isIncorporated": (prevCompany, Event) => Event["event/isIncorporated"],
    "company/orgnumber": (prevCompany, Event) => Event["event/incorporation/orgnumber"],
    "company/nominalSharePrice": (prevCompany, Event) => Event["event/incorporation/nominalSharePrice"],
    //"company/appliedEvents": (prevCompany, Event) => Event["event/earlierEvents"].concat(Event),
    //"company/appliedEventsCount": (prevCompany, Event) => Event["event/earlierEvents"].length + 1
    
  }
} */