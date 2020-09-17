
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

const Validators = {
  "isTrue": value => value === true,
  "companyVariableValidator/numberAbove15": value => value > 15,
  "companyValidator/hasNominalSharePrice": accumulatedVariables_before => Object.keys(accumulatedVariables_before).includes("company/:nominalSharePrice"),
  "companyValidator/hasNominalSharePriceAbove10": accumulatedVariables_before => accumulatedVariables_before["company/:nominalSharePrice"] > 9,
  "attributeValidator/isDefined": value => typeof value !== "undefined",
  "attributeValidator/isFirstEvent": value => value === 1,
  "attributeValidator/notFirstEvent": value => value > 1,
  "attributeValidator/notLaterThanFifthEvent": value => value <= 5,
  "attributeValidator/is2020": value => value.startsWith("2020"),
  "attributeValidator/isPositiveNumber": value => value > 0,
  "attributeValidator/isAboveFive": value => value > 5,
  "eventValidator/sumOfindexAndNomSPAbove10": eventAttributes => (eventAttributes["event/index"] + eventAttributes["event/incorporation/nominalSharePrice"]) > 10,
  "combinedValidator/dateEqualToSP": (accumulatedVariables_before, eventAttributes) =>  eventAttributes["event/date"].endsWith( String(accumulatedVariables_before["company/:nominalSharePrice"]) )
}

let event_incorporation = {
  eventType: "incorporation",
  dependencies: ["company/:orgnumber", "company/:nominalSharePrice", "company/:applicableEventTypes", "company/:currentEventEntity", "company/:applicableEventTypes", "company/:allEventsAreValid"],
  validators: [
    {type: "attributeValidator", attribute: "event/index", validator: "attributeValidator/isFirstEvent" },
    {type: "attributeValidator", attribute: "event/date", validator: "attributeValidator/isDefined" },
    {type: "attributeValidator", attribute: "event/incorporation/orgnumber", validator: "attributeValidator/isDefined" },
    {type: "attributeValidator", attribute: "event/incorporation/nominalSharePrice", validator: "attributeValidator/isDefined" },
    {type: "eventValidator", validator: "eventValidator/sumOfindexAndNomSPAbove10" }
  ]
}

let event_testEvent = {
  eventType: "testEvent",
  dependencies: ["company/:testOutput", "company/:currentEventEntity", "company/:prevEventEntity", "company/:applicableEventTypes", "company/:allEventsAreValid"],
  validators: [
    {type: "companyVariableValidator", companyVariable: "company/:allEventsAreValid", validator: "isTrue" },
    {type: "companyVariableValidator", companyVariable: "company/:nominalSharePrice", validator: "companyVariableValidator/numberAbove15" },
    {type: "attributeValidator", attribute: "event/index", validator: "attributeValidator/notFirstEvent" },
    {type: "attributeValidator", attribute: "event/index", validator: "attributeValidator/notLaterThanFifthEvent" },
    {type: "attributeValidator", attribute: "event/date", validator: "attributeValidator/is2020" },
    {type: "companyValidator", validator: "companyValidator/hasNominalSharePrice" },
    {type: "companyValidator", validator: "companyValidator/hasNominalSharePriceAbove10" },
    {type: "combinedValidator", validator: "combinedValidator/dateEqualToSP" },
  ]
}


const eventTypes = {
  incorporation: event_incorporation,
  testEvent: event_testEvent
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
        v => Object.keys(eventTypes).includes(v)
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
  validateAttributes: (eventAttributes) => Object.entries(eventAttributes).filter( entry => Object.keys(Attribute.validators).includes(entry[0]) ).every( entry => Attribute.validators[ entry[0] ](entry[1]) ),
  isNumber: (attribute) => ["event/index", "event/incorporation/nominalSharePrice"].includes(attribute),
  getSystemAttributes: () => ["entity", "entity/type"]
}


//Output functions

const outputFunction = {
  functions: {
    "company/:currentEventEntity": (accumulatedVariables_before, eventAttributes) => eventAttributes["entity"],
    "company/:prevEventEntity": (accumulatedVariables_before, eventAttributes) => accumulatedVariables_before["company/:currentEventEntity"],
    "company/:orgnumber": (accumulatedVariables_before, eventAttributes) => eventAttributes["event/incorporation/orgnumber"],
    "company/:nominalSharePrice": (accumulatedVariables_before, eventAttributes) => eventAttributes["event/incorporation/nominalSharePrice"],
    "company/:applicableEventTypes": (accumulatedVariables_before, eventAttributes) => Object.keys(eventTypes),
    "company/:testOutput": (accumulatedVariables_before, eventAttributes) => Math.round( Math.random() * 3 ),
    "company/:allEventsAreValid": (accumulatedVariables_before, eventAttributes) => getValidationReport(accumulatedVariables_before, eventAttributes).isValid
  },
  calculate: (functionName, accumulatedVariables_before, eventAttributes) => outputFunction.functions[ functionName ](accumulatedVariables_before, eventAttributes)
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