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

let mergeArray = (array) => array.every( object => typeof object === "object") ? mergerino( {}, array ) : console.log( " mergeArray received invalid array ", array )

//Utils
let createObject = (keyName, value) => Object.assign({}, {[keyName]: value} ) 
let returnObject = (something) => something // a -> a
let logThis = (something, label) => {
console.log( (label) ? label : "Logging this: ", something )
return something
}

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

// COMPANY DOCUMENT CREATION PIPELINE

let getEventErrors = (companyDoc, Event) => eventTypes[ Event["event/eventType"] ]["attributes"].map( attribute => 
  Attribute.validate( attribute, Event[ attribute ]  ) 
    ? false 
    : `Attribute not valid: ${attribute}.`   )
  .concat( eventTypes[ Event["event/eventType"] ].validators.map( validator => 
    validator.validator(companyDoc, Event) 
    ? false 
    : validator.errorMessage 
  )
  ).filter( result => result !== false  ) 


let rejectEventWithErrors = (companyDoc, Event) => mergerino(
  companyDoc,
  {"company/:rejectedEvents": companyDoc["company/:rejectedEvents"].concat( mergerino(
    Event,
    {"event/:eventErrors": getEventErrors(companyDoc, Event) },
  )  ) },
  {"company/:isValid": false}
)



let constructEvent = (companyDoc, Event) => mergerino(
  Event,  
  outputFunction.getCalculatedEventFields( companyDoc, Event, Event["event/eventType"] ),
)

let isValidEvent = (companyDoc, Event) => getEventErrors(companyDoc, Event).length === 0

let constructCompanyPatch = (companyDoc, Event) => mergerino( outputFunction.getCalculatedCompanyFields( 
  companyDoc,
  constructEvent(companyDoc, Event), 
  Event["event/eventType"] 
  )
)

let applyEvent = (companyDoc, Event) => mergerino(
  companyDoc,
  constructCompanyPatch(companyDoc, Event)
)

let prepareCompanyDoc = Events => Events.reduce( (companyDoc, Event) => companyDoc["company/:isValid"]
  ? Object.keys( eventTypes ).includes( Event["event/eventType"] )
    ? isValidEvent( companyDoc, Event ) 
      ? applyEvent(companyDoc, Event) 
      : rejectEventWithErrors(companyDoc, Event)
    : rejectEventWithErrors(companyDoc, Event)
  : rejectEventWithErrors(companyDoc, Event),
  getBlankCompanyDoc()
)

let getBlankCompanyDoc = () => returnObject({
  "company/:shareholders": [], 
  "company/:accountBalance": {"1920": 0}, 
  "company/:bankTransactions": [],
  "company/:appliedEvents": [],
  "company/:rejectedEvents": [],
  "company/:prevCompanyDoc": {},
  "company/:eventCount": 0,
  "company/:shareCount": 0,
  "company/:isValid": true
})

//Company output functions

let updateAccountBalance = (accountBalance, patch) => mergerino( accountBalance, Object.entries( patch ).map( entry => createObject(entry[0],  accountBalance[ entry[0] ] ?   accountBalance[ entry[0] ] + entry[1] : entry[1] )  ) ) 

const outputFunction = {
  functions: {
    "company/:orgnumber": (companyDoc, Event) => Event["event/incorporation/orgnumber"],
    "company/:nominalSharePrice": (companyDoc, Event) => Event["event/incorporation/nominalSharePrice"],
    "company/:incorporationDate": (companyDoc, Event) => Event["event/date"],
    "company/:shareholders": (companyDoc, Event) => companyDoc["company/:shareholders"].concat( Event["event/shareholder"] ),
    "company/:shareCount": (companyDoc, Event) => companyDoc["company/:shareCount"] + Event["event/shareCount"] ,
    "company/:openingBalance": (companyDoc, Event) => returnObject({"1920": 0, "2000": 0}),
    "company/:accountBalance": (companyDoc, Event) => updateAccountBalance( companyDoc["company/:accountBalance"], Event["event/:accountBalance"] ),
    "company/:currentYear": (companyDoc, Event) => Event["event/date"].slice(0,4),
    "company/:bankTransactions": (companyDoc, Event) => companyDoc["company/:bankTransactions"].concat( Event["event/bankTransactionReference"] ),
    "company/:appliedEvents": (companyDoc, Event) => companyDoc["company/:appliedEvents"].concat( Event ),
    "company/:prevCompanyDoc": (companyDoc, Event) => companyDoc,
    "company/:applicableEventTypes": (companyDoc, Event) => Object.keys( eventTypes ).filter( key => key !== "incorporation" ),
    "company/:latestEventDate": (companyDoc, Event) => Event["event/date"],
    "company/:eventCount": (companyDoc, Event) => companyDoc["company/:eventCount"] + 1,
    "company/:reports/rf_1028": (companyDoc, Event) => Reports["rf_1028"].prepare(companyDoc["company/:accountBalance"]),
    "company/:reports/rf_1167": (companyDoc, Event) => Reports["rf_1167"].prepare(companyDoc["company/:accountBalance"]),
    "company/:reports/annualReport": (companyDoc, Event) => Reports["annualReport"].prepare(companyDoc["company/:accountBalance"]),
    "company/:reports/notesText": (companyDoc, Event) => Reports["notesText"].prepare(companyDoc),
  },
  defaultDependencies: ["company/:prevCompanyDoc", "company/:latestEventDate", "company/:currentYear", "company/:appliedEvents", "company/:applicableEventTypes", "company/:eventCount"],
  calculate: (functionName, companyDoc, Event) => outputFunction.functions[ functionName ](companyDoc, Event),
  getCalculatedEventFields: ( companyDoc, Event, eventType ) => eventTypes[ eventType ]["eventConstructor"]( companyDoc, Event ),
  getCalculatedCompanyFields: ( companyDoc, calculatedEventAttributes, eventType ) => eventTypes[ eventType ]["calculatedFields_companyLevel"].concat(outputFunction.defaultDependencies).map( (calculatedField) => createObject(calculatedField, outputFunction.calculate(calculatedField, companyDoc, calculatedEventAttributes ) )  ),
}

//Event types

let event_incorporation = {
  eventType: "incorporation",
  attributes: ["event/index", "event/date", "event/incorporation/orgnumber", "event/incorporation/nominalSharePrice"],
  requiredCalculatedFields: [],
  eventConstructor: ( companyDoc, Event ) => {},
  calculatedFields_companyLevel: ["company/:orgnumber", "company/:nominalSharePrice", "company/:incorporationDate", "company/:openingBalance"],
  validators: [
    {
      validator: ( companyDoc, Event ) => Event["event/index"] === 1,
      errorMessage: "Incorporation must be the first event." 
    }
  ],
  newEventDatoms: (appliedEvent) => [
    newDatom("newEvent", "type", "process"), //TBU..
    newDatom("newEvent", "entity/type", "event"),
    newDatom("newEvent", "event/eventType", "incorporation"),
    newDatom("newEvent", "event/incorporation/orgnumber", "111222333"), //TBU..
    newDatom("newEvent", "event/index", 1 ),
    newDatom("newEvent", "event/date", "" )
  ]
}

let event_addFounder = {
  eventType: "incorporation/addFounder",
  attributes: ["event/index", "event/date", "event/shareholder", "event/shareCount", "event/sharePremium"],
  requiredCalculatedFields: ["company/:nominalSharePrice"],
  eventConstructor: ( companyDoc, Event ) => {

    let sharePrice = companyDoc["company/:nominalSharePrice"] + Event["event/sharePremium"]
    let shareCapital = Event["event/shareCount"] * sharePrice

    return {"event/:accountBalance": {"1370": shareCapital, "2000": -shareCapital}} 
  },
  calculatedFields_companyLevel: ["company/:shareholders", "company/:shareCount", "company/:accountBalance"],
  validators: [
    {
      validator: ( companyDoc, Event ) => Event["event/date"].slice(0, 4) === companyDoc["company/:currentYear"],
      errorMessage: "Date must be in current financial year." 
    },
    {
      validator: ( companyDoc, Event ) => Event["event/date"] ===  companyDoc["company/:incorporationDate"] ,
      errorMessage: "Must have same date as incorporation event." 
    },
    {
      validator: ( companyDoc, Event ) => !companyDoc["company/:shareholders"].includes( Event["event/shareholder"]  ) ,
      errorMessage: "Shareholder has already been added." 
    } 
    //TBD: Validator on process level should require share capital of > 30k NOK
  ],
  newEventDatoms: (appliedEvent) => [
    newDatom("newEvent", "type", "process"), //TBU..
    newDatom("newEvent", "entity/type", "event"),
    newDatom("newEvent", "event/eventType", "incorporation/addFounder"),
    newDatom("newEvent", "event/incorporation/orgnumber", appliedEvent["event/incorporation/orgnumber"] ), //TBU..
    newDatom("newEvent", "event/index", appliedEvent["event/index"] + 1 ),
    newDatom("newEvent", "event/date", appliedEvent["event/date"]),
  ]
}

let event_operatingCostFromBankTransaction = {
  eventType: "operatingCost/bank",
  attributes: ["event/index", "event/date", "event/account", "event/amount", "event/bankTransactionReference"],
  requiredCalculatedFields: ["company/:accountBalance"],
  eventConstructor: ( companyDoc, Event ) => createObject( 
    "event/:accountBalance" , 
    mergerino( {
      "1920": Event["event/amount"]} , 
      createObject(Event["event/account"], -Event["event/amount"])
    )
  ),
  calculatedFields_companyLevel: ["company/:bankTransactions", "company/:accountBalance"],
  validators: [
    {
      validator: ( companyDoc, Event ) => Event["event/date"].slice(0, 4) === companyDoc["company/:currentYear"],
      errorMessage: "Date must be in current financial year." 
    },
    {
      validator: ( companyDoc, Event ) => Object.keys(Accounts).filter( acc => Number(acc) >= 4000 && Number(acc) < 8000 ).includes( Event["event/account"] ),
      errorMessage: "Must be an operating cost account." 
    },{
      validator: ( companyDoc, Event ) => !companyDoc["company/:bankTransactions"].includes( Event["event/bankTransactionReference"] )  ,
      errorMessage: "Bank transaction reference has already been used." 
    },{
      validator: ( companyDoc, Event ) => Event["event/amount"] < 0,
      errorMessage: "Cost must have negative bank amount" 
    },
  ],
  newEventDatoms: (appliedEvent) => [
    newDatom("newEvent", "type", "process"), //TBU..
    newDatom("newEvent", "entity/type", "event"),
    newDatom("newEvent", "event/eventType", "operatingCost/bank"),
    newDatom("newEvent", "event/incorporation/orgnumber", appliedEvent["event/incorporation/orgnumber"] ), //TBU..
    newDatom("newEvent", "event/index", appliedEvent["event/index"] + 1 ),
    newDatom("newEvent", "event/date", appliedEvent["event/date"]),
  ]
}

let event_complexTransaction = {
  eventType: "complexTransaction",
  attributes: ["event/index", "event/date", "transaction/records", "event/bankTransactionReference"],
  requiredCalculatedFields: ["company/:accountBalance"],
  eventConstructor: ( companyDoc, Event ) => createObject( "event/:accountBalance" , Event["transaction/records"] ),
  calculatedFields_companyLevel: ["company/:accountBalance"],
  validators: [
    {
      validator: ( companyDoc, Event ) => Event["event/date"].slice(0, 4) === companyDoc["company/:currentYear"],
      errorMessage: "Date must be in current financial year." 
    },{
      validator: ( companyDoc, Event ) => Object.keys(Event["transaction/records"]).every( account => Object.keys(Accounts).includes( account ) )   ,
      errorMessage: "Accounts not valid." 
    },{
      validator: ( companyDoc, Event ) => Object.values( Event["transaction/records"] ).every( value => typeof value === "number" ),
      errorMessage: "Amount must be number." 
    },{
      validator: ( companyDoc, Event ) => Object.values( Event["transaction/records"] ).reduce( (sum, amount) => sum + amount, 0 ) === 0,
      errorMessage: "Transaction must be in balance." 
    }
  ],
  newEventDatoms: (appliedEvent) => [
    newDatom("newEvent", "type", "process"), //TBU..
    newDatom("newEvent", "entity/type", "event"),
    newDatom("newEvent", "event/eventType", "complexTransaction"),
    newDatom("newEvent", "event/incorporation/orgnumber", appliedEvent["event/incorporation/orgnumber"] ), //TBU..
    newDatom("newEvent", "event/index", appliedEvent["event/index"] + 1 ),
    newDatom("newEvent", "event/date", appliedEvent["event/date"]),
    newDatom("newEvent", "transaction/records", {} ),
  ]
}

let event_yearEnd = {
  eventType: "yearEnd",
  attributes: ["event/index", "event/date"],
  requiredCalculatedFields: ["company/:accountBalance"],
  eventConstructor: ( companyDoc, Event ) => returnObject({}),
  calculatedFields_companyLevel: ["company/:reports/rf_1028", "company/:reports/rf_1167", "company/:reports/annualReport", "company/:reports/notesText"],
  validators: [
    {
      validator: ( companyDoc, Event ) => Event["event/date"] === `${companyDoc["company/:currentYear"]}-12-31`,
      errorMessage: "Date must be 31/12 in current financial year." 
    }
  ],
  newEventDatoms: (appliedEvent) => [
    newDatom("newEvent", "type", "process"), //TBU..
    newDatom("newEvent", "entity/type", "event"),
    newDatom("newEvent", "event/eventType", "yearEnd"),
    newDatom("newEvent", "event/incorporation/orgnumber", appliedEvent["event/incorporation/orgnumber"] ), //TBU..
    newDatom("newEvent", "event/index", appliedEvent["event/index"] + 1 ),
    newDatom("newEvent", "event/date", appliedEvent["event/date"]),
  ]
}

const eventTypes = {
  "incorporation": event_incorporation,
  "incorporation/addFounder": event_addFounder,
  "operatingCost/bank": event_operatingCostFromBankTransaction,
  "complexTransaction": event_complexTransaction,
  "yearEnd": event_yearEnd
}

let getRequiredHistoricalVariables = eventType => eventTypes[ eventType ]["requiredCalculatedFields"]
let getRequiredAttributes = eventType => eventTypes[ eventType ]["attributes"]
let getCalculatedFields_companyLevel = eventType => eventTypes[ eventType ]["calculatedFields_companyLevel"]
let getSystemAttributes = () => ["entity", "entity/type", "event/eventType", "type" ]

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
    "event/index": v => [ //Change to "event/prevEventEntity" ???
          v => typeof v === "number",
          v => v >= 1
      ].every( f => f(v) ),
    "event/incorporation/orgnumber": v => [
      v => typeof v === "string", 
      v => v.length === 9,
    ].every( f => f(v) ),
    "event/date": v => [
      v => typeof v === "string", 
      v => v.length === 10
    ].every( f => f( v ) ),
    "event/incorporation/nominalSharePrice": v => [
      v => typeof v === "number", 
      v => v > 0
    ].every( f => f(v) ),
    "event/shareholder": v => [
      v => typeof v === "string", 
    ].every( f => f(v) ),
    "event/shareCount": v => [
      v => typeof v === "number", 
      v => v > 0
    ].every( f => f(v) ),
    "event/sharePremium": v => [
      v => typeof v === "number", 
      v => v >= 0
    ].every( f => f(v) ),
    "event/account": v => [
      v => typeof v === "string", 
      v => v.length === 4,
      v => Number(v) >= 1000,
      v => Number(v) < 10000,
    ].every( f => f(v) ),
    "event/amount": v => [
      v => typeof v === "number",
    ].every( f => f(v) ),
    "event/bankTransactionReference": v => [
      v => typeof v === "string",
    ].every( f => f(v) ),
    "transaction/records": v => [
      v => typeof v === "object"
    ].every( f => f(v) ),
  },
  validate: (attribute, value) => Attribute.validators[ attribute ](value),
  isNumber: (attribute) => ["event/index", "event/incorporation/nominalSharePrice", "event/shareCount", "event/sharePremium", "event/amount"].includes(attribute),
  getSystemAttributes: () => ["entity", "entity/type"]
}



//Other config..



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


const Reports = {
  "rf_1028": {
    accountMapping: {'406': ['1320' , '1340' , '1370' , '1375' , '1380' , '1399' , '1576' , '1579' , '1749'], '408': ['1920'], '440': ['2220' , '2250' , '2260' , '2290' , '2390' , '2400' , '2510' , '2910' , '2920' , '2990']},
    prepare: ( accountBalance ) => mergeArray( 
      Object.keys(Reports["rf_1028"]["accountMapping"]).map( reportKey => 
        createObject(
          reportKey, 
          Reports["rf_1028"]["accountMapping"][ reportKey ].reduce( (sum, account) => sum + accountBalance[account] ? accountBalance[account] : 0, 0 ) 
        ) 
      )  
    )
  },
  "rf_1167": {
    accountMapping: {'8300': ['8300', '0620'], '8320': ['8320, 0620'], '8140': ['8179, 0621'], '8100': ['8100, 0631'], '8110': ['8115, 0632'], '8120': ['8115, 0632'], '8178': ['8174, 0633'], '6726': ['6700, 0640'], '7791': ['7700, 0640'], '8071': ['8090, 0815'], '8000': ['8005, 0830'], '8020': ['8005, 0830'], '8080': ['8080, 0831'], '8078': ['8074, 0833'], '1320': ['0440, 1320'], '1340': ['0440, 1340'], '1370': ['0440, 1370'], '1375': ['0440, 1370'], '1380': ['0440, 1380'], '1399': ['0440, 1390'], '1576': ['0440, 1565'], '1579': ['0440, 1570'], '1749': ['0440, 1570'], '1070': ['1070'], '1300': ['1313'], '1330': ['1332'], '1350': ['1350'], '1360': ['1360'], '1800': ['1800'], '1810': ['1810'], '1820': ['1800'], '1830': ['1830'], '1870': ['1880'], '1880': ['1880'], '1920': ['1920'], '2000': ['2000'], '2020': ['2020'], '2030': ['2030'], '2050': ['2059'], '2080': ['2080'], '2120': ['2120'], '2220': ['2220'], '2250': ['2250'], '2260': ['2260'], '2290': ['2290'], '2390': ['2380'], '2400': ['2400'], '2500': ['2500'], '2510': ['2510'], '2800': ['2800'], '2910': ['2910'], '2920': ['2920'], '2990': ['2990'], '6540': ['6500'], '6551': ['6500'], '6552': ['6500'], '6580': ['6500'], '6701': ['6700'], '6702': ['6700'], '6705': ['6700'], '6720': ['6700'], '6725': ['6700'], '6790': ['6700'], '6890': ['6995'], '6900': ['6995'], '7770': ['7700'], '7790': ['7700'], '8030': ['8030'], '8050': ['8050'], '8055': ['8050'], '8060': ['8060'], '8070': ['8079'], '8090': ['8090'], '8130': ['8130'], '8150': ['8150'], '8155': ['8150'], '8160': ['8160'], '8170': ['8179']},
    prepare: ( accountBalance ) => mergeArray( 
      Object.keys(Reports["rf_1167"]["accountMapping"]).map( reportKey => 
        createObject(
          reportKey, 
          Reports["rf_1167"]["accountMapping"][ reportKey ].reduce( (sum, account) => sum + accountBalance[account] ? accountBalance[account] : 0, 0 ) 
        ) 
      )  
    )
  },
  "rf_1086": {
    prepare: ( accumulatedVariables ) => returnObject({TBD: "TBD"})
  },
  "annualReport": {
    accountMapping: {"9000":[],"9010":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791"],"9050":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791"],"9060":["8000","8020","8030","8050","8055","8060","8070","8071","8078","8080","8090"],"9070":["8100","8110","8120","8130","8140","8150","8155","8160","8170","8178"],"9100":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791","8000","8020","8030","8050","8055","8060","8070","8071","8078","8080","8090","8100","8110","8120","8130","8140","8150","8155","8160","8170","8178"],"9150":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791","8000","8020","8030","8050","8055","8060","8070","8071","8078","8080","8090","8100","8110","8120","8130","8140","8150","8155","8160","8170","8178","8300","8320"],"9200":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791","8000","8020","8030","8050","8055","8060","8070","8071","8078","8080","8090","8100","8110","8120","8130","8140","8150","8155","8160","8170","8178","8300","8320"],"9300":["1070","1300","1320","1330","1340","1350","1360","1370","1375","1380","1399"],"9350":["1576","1579","1749","1800","1810","1820","1830","1870","1880","1920"],"9400":["1070","1300","1320","1330","1340","1350","1360","1370","1375","1380","1399","1576","1579","1749","1800","1810","1820","1830","1870","1880","1920"],"9450":["2000","2020","2030","2050","2080"],"9500":["2120","2220","2250","2260","2290"],"9550":["2390","2400","2500","2510","2800","2910","2920","2990"],"9650":["2000","2020","2030","2050","2080","2120","2220","2250","2260","2290","2390","2400","2500","2510","2800","2910","2920","2990"]},
    prepare: ( accountBalance ) => mergeArray( 
      Object.keys(Reports["annualReport"]["accountMapping"]).map( reportKey => 
        createObject(
          reportKey, 
          Reports["annualReport"]["accountMapping"][ reportKey ].reduce( (sum, account) => sum + accountBalance[account] ? accountBalance[account] : 0, 0 ) 
        ) 
      )  
    ),
    virtualAccounts: [
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
  },
  "notesText": {
    prepare: ( companyDoc ) => {

      let openingBalance = companyDoc["company/:openingBalance"]
      let accountBalance = companyDoc["company/:accountBalance"]
    
      let shareholders = companyDoc["company/:shareholders"]
      let shareCount = companyDoc["company/:shareCount"]
  
      let nominalSharePrice = companyDoc["company/:nominalSharePrice"]
  
      let em = (content) => String('<span class="emphasizedText">' + content + '</span>')
    
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
    Skattekostnaden i resultatregnskapet omfatter både betalbar skatt for perioden og endring i utsatt skatt. Utsatt skatt er beregnet med ${em("TBD")} på grunnlag av de midlertidige forskjeller som eksisterer mellom regnskapsmessige og skattemessige verdier, samt ligningsmessig underskudd til fremføring ved utgangen av regnskapsåret. Skatteøkende og skattereduserende midlertidige forskjeller som reverserer eller kan reversere i samme periode er utlignet og nettoført.
    <br>
    <h4>Note 2: Aksjekapital og aksjonærinformasjon</h4>
    Foretaket har ${em( shareCount ) } aksjer, pålydende kr ${em(  nominalSharePrice )}, noe som gir en samlet aksjekapital på kr ${em( accountBalance["2000"] )}. Selskapet har én aksjeklasse.
    <br><br>
    Aksjene eies av: 
    <br>
    ${shareholders.map( (shareholder, index) => em(`${index}: ${shareholder} <br>`)).join("")}
    
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
        <td class="numberCell">${em( openingBalance["2000"] ) }</td>
        <td class="numberCell">${em( openingBalance["2020"] ) }</td>
        <td class="numberCell">${em( openingBalance["2030"] ) }</td>
        <td class="numberCell">${em( openingBalance["2000"] + openingBalance["2020"] + openingBalance["2030"] ) }</td>
      </tr>
      <tr>
        <td>Endring ila. året </td>
        <td class="numberCell">${em( accountBalance["2000"] - openingBalance["2000"] ) }</td>
        <td class="numberCell">${em( accountBalance["2020"] - openingBalance["2020"] ) }</td>
        <td class="numberCell">${em( accountBalance["2030"] - openingBalance["2030"] ) }</td>
        <td class="numberCell">${em( accountBalance["2000"] - openingBalance["2000"] + accountBalance["2020"] - openingBalance["2020"] + accountBalance["2030"] - openingBalance["2030"] ) }</td>
      </tr>
      <tr>
        <td>Egenkapital 31.12 </td>
        <td class="numberCell">${em( accountBalance["2000"] ) }</td>
        <td class="numberCell">${em( accountBalance["2020"] ) }</td>
        <td class="numberCell">${em( accountBalance["2030"] ) }</td>
        <td class="numberCell">${em( accountBalance["2000"] + accountBalance["2020"] + accountBalance["2030"] ) }</td>
      </tr>
    </tbody>
    </table>
    <br>
    <h4>Note 5: Skatt</h4>
    ${"[TBD]" }
    
    <h4>Note 4: Lønnskostnader, antall ansatte, godtgjørelser, revisjonskostnader mm.</h4>
    Selskapet har i ${em( companyDoc["company/:currentYear"] ) } ikke hatt noen ansatte og er således ikke pliktig til å ha tjenestepensjon for de ansatte etter Lov om obligatoriske tjenestepensjon. Det er ikke utdelt styrehonorar.
    <br><br>
    Kostnadsført revisjonshonorar for ${em( companyDoc["company/:currentYear"] ) } utgjør kr ${em( 0 ) }. Honorar for annen bistand fra revisor utgjør kr ${em( 0 ) }.
    
    
    
    <h4>Note 6: Bankinnskudd</h4>
    Posten inneholder kun frie midler.
    
    <h4>Note 7: Gjeld til nærstående, ledelse og styre</h4>
    Selskapet har gjeld til følgende nærstående personer: <br>
    ${shareholders.map( (shareholder, index) => em(`${index}: ${shareholder} <br>`)).join("")}
    
    `}
  } 
}

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
}


//Archive

//var func = new Function("prevCompany, Event", "return prevCompany['company/shareholders'];" )
//var func2 = new Function("prevCompany, Event", "console.log(prevCompany['company/shareholders']) ;" )
