

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

let prepareEventCycles = (Events) => Events.reduce( (eventCycles, eventAttributes, index) => {

  let eventType = eventAttributes["event/eventType"]
  let isValidEventType = Validators["validators"]["isValidEventType"](eventType)
  let accumulatedVariables_before = eventCycles[ index ]["accumulatedVariables_after"]

  let accumulatedVariables_after = isValidEventType ? outputFunction.applyEventPatch( accumulatedVariables_before, eventAttributes ) : mergerino( accumulatedVariables_before, {isValid: false}  )

  let prevEventsAreValid = eventCycles[ index ]["isValid"] 

  let isValid = prevEventsAreValid
  ? isValidEventType 
    ? isValidEvent(accumulatedVariables_after)
    : false
  : false

  return eventCycles.concat( {eventType, isValidEventType, prevEventsAreValid, isValid, accumulatedVariables_before,eventAttributes,accumulatedVariables_after} )
}, [ {isValid: true, "accumulatedVariables_after": {"company/:shareholders": [], "company/:accountBalance": {"1920": 0} } }]   ).slice(1, Events.length + 1 ) //removing initial..

//CONFIG DATA


let isValidEvent = (accumulatedVariables_after) => [
  (accumulatedVariables_after) => accumulatedVariables_after["company/:currentEventCompanyVariableValidators"].filter( validator => !validator.isValid).length === 0,
  (accumulatedVariables_after) => accumulatedVariables_after["company/:currentEventCompanyValidators"].filter( validator => !validator.isValid).length === 0,
  (accumulatedVariables_after) => accumulatedVariables_after["company/:currentEventAttributeValidators"].filter( validator => !validator.isValid).length === 0,
  (accumulatedVariables_after) => accumulatedVariables_after["company/:currentEventEventValidators"].filter( validator => !validator.isValid).length === 0,
  (accumulatedVariables_after) => accumulatedVariables_after["company/:currentEventCombinedValidators"].filter( validator => !validator.isValid).length === 0
].every( validationFunction => validationFunction(accumulatedVariables_after) )


let updateAccountBalance = (accountBalance, patch) => mergerino( accountBalance, Object.entries( patch ).map( entry => createObject(entry[0],  accountBalance[ entry[0] ] ?   accountBalance[ entry[0] ] + entry[1] : entry[1] )  ) ) 



const outputFunction = {
  functions: {
    "event/:accountBalance": (accumulatedVariables_before, eventAttributes) =>  outputFunction.calculate( eventTypes[ eventAttributes["event/eventType"] ]["accountBalanceFunction"], accumulatedVariables_before, eventAttributes ),
    "event/:incorporation/addFounder/accountBalance": (accumulatedVariables_before, eventAttributes) => returnObject({"1920": eventAttributes["event/shareCount"] * (accumulatedVariables_before["company/:nominalSharePrice"] + eventAttributes["event/sharePremium"]), "2000": -eventAttributes["event/shareCount"] * (accumulatedVariables_before["company/:nominalSharePrice"] + eventAttributes["event/sharePremium"])}),
    "operatingCost/bank/accountBalance": (accumulatedVariables_before, eventAttributes) => mergerino( {"1920": eventAttributes["event/amount"]} , createObject(eventAttributes["event/account"], -eventAttributes["event/amount"]) ),
    "company/:orgnumber": (accumulatedVariables_before, eventAttributes) => eventAttributes["event/incorporation/orgnumber"],
    "company/:nominalSharePrice": (accumulatedVariables_before, eventAttributes) => eventAttributes["event/incorporation/nominalSharePrice"],
    "company/:incorporationDate": (accumulatedVariables_before, eventAttributes) => eventAttributes["event/date"],
    "company/:shareholders": (accumulatedVariables_before, eventAttributes) => accumulatedVariables_before["company/:shareholders"].concat( eventAttributes["event/shareholder"] ),
    "company/:accountBalance": (accumulatedVariables_before, eventAttributes) => updateAccountBalance( accumulatedVariables_before["company/:accountBalance"], accumulatedVariables_before["event/:accountBalance"] ),
    "company/:applicableEventTypes": (accumulatedVariables_before, eventAttributes) => Object.keys( eventTypes ).filter( key => key !== "incorporation"),
    "company/:latestEventDate": (accumulatedVariables_before, eventAttributes) => eventAttributes["event/date"],
    "company/:currentEventCompanyVariableValidators": (accumulatedVariables_before, eventAttributes) => eventTypes[ eventAttributes["event/eventType"] ]["companyVariableValidators"].map( validator => mergerino( validator, {validatorArgument: accumulatedVariables_before[ validator["companyVariable"] ], isValid: Validators["validators"][ validator.validator ]( accumulatedVariables_before[ validator["companyVariable"] ] )} )  ),
    "company/:currentEventCompanyValidators": (accumulatedVariables_before, eventAttributes) => eventTypes[ eventAttributes["event/eventType"] ]["companyValidators"].map( validator => mergerino( validator, {isValid: Validators["validators"][ validator.validator ]( accumulatedVariables_before )} )  ),
    "company/:currentEventAttributeValidators": (accumulatedVariables_before, eventAttributes) => eventTypes[ eventAttributes["event/eventType"] ]["attributeValidators"].map( validator => mergerino( validator, {validatorArgument: eventAttributes[ validator["attribute"] ], isValid: Validators["validators"][ validator.validator ]( eventAttributes[ validator["attribute"] ] )} )  ),
    "company/:currentEventEventValidators": (accumulatedVariables_before, eventAttributes) => eventTypes[ eventAttributes["event/eventType"] ]["eventValidators"].map( validator => mergerino( validator, {isValid: Validators["validators"][ validator.validator ]( eventAttributes )} )  ),
    "company/:currentEventCombinedValidators": (accumulatedVariables_before, eventAttributes) => eventTypes[ eventAttributes["event/eventType"] ]["combinedValidators"].map( validator => mergerino( validator, {isValid: Validators["validators"][ validator.validator ]( accumulatedVariables_before, eventAttributes )} )  ),
  },
  defaultDependencies: ["company/:latestEventDate", "company/:applicableEventTypes", "company/:currentEventCompanyVariableValidators", "company/:currentEventCompanyValidators", "company/:currentEventAttributeValidators", "company/:currentEventEventValidators", "company/:currentEventCombinedValidators"],
  getFieldsToUpdate: (eventType) => eventTypes[ eventType ]["calculatedFields_eventLevel"].concat(eventTypes[ eventType ]["calculatedFields_companyLevel"]).concat(outputFunction.defaultDependencies),
  calculate: (functionName, accumulatedVariables_before, eventAttributes) => outputFunction.functions[ functionName ](accumulatedVariables_before, eventAttributes),
  applyEventPatch: ( accumulatedVariables_before, eventAttributes ) => outputFunction.getFieldsToUpdate( eventAttributes["event/eventType"] ).reduce( (accumulatedVariables_before, dependency ) => mergerino( accumulatedVariables_before, createObject(dependency, outputFunction.calculate(dependency, accumulatedVariables_before, eventAttributes ) ) ), accumulatedVariables_before )
}



getValidatorArgument = (accumulatedVariables_before, eventAttributes, validator ) => {

  let ValidatorTypes = {
    "attributeValidator": eventAttributes[ validator["attribute"] ],
    "companyVariableValidator": accumulatedVariables_before[ validator["companyVariable"] ],
    "eventValidator": eventAttributes,
    "companyValidator": accumulatedVariables_before
  }

  let argument = ValidatorTypes[ validator["type"] ]

  return argument
}

let getValidationReport = (accumulatedVariables_before, eventAttributes) => {

  let eventType = eventAttributes["event/eventType"]

  let validationResults = eventTypes[ eventType ][ "validators" ].map(  eventValidator => {


      let argumentsSwitch = {
          "attributeValidator": eventAttributes[ eventValidator["attribute"] ],
          "companyVariableValidator": accumulatedVariables_before[ eventValidator["companyVariable"] ],
          "eventValidator": eventAttributes,
          "companyValidator": accumulatedVariables_before,
      }

      let validatorArgument = argumentsSwitch[ eventValidator["type"] ]

      let isValid = eventValidator["type"] === "combinedValidator" ? Validators["validators"][ eventValidator[ "validator" ]  ]( accumulatedVariables_before, eventAttributes ) : Validators["validators"][ eventValidator[ "validator" ]  ]( validatorArgument )

      let validationResult = mergerino( eventValidator, {validatorArgument: validatorArgument, isValid: isValid} )

      return validationResult

  }  )


  let isValid = validationResults.every( validationResult => validationResult.isValid )

  let validationReport = {eventType, isValid, validationErrors: validationResults.filter( validationResult => !validationResult.isValid ) }

  return validationReport
}



const Validators = {
  "validators": {
    "isTrue": value => value === true,
    "isValidEventType":  value => Object.keys( eventTypes ).includes( value ),
    "isDefined": value => typeof value !== "undefined",
    "isOperatingCostAccount": value => Object.keys(Accounts).filter( acc => Number(acc) >= 4000 && Number(acc) < 8000 ).includes( value ),
    "attributeValidator/isFirstEvent": value => value === 1,
    "attributeValidator/notFirstEvent": value => value > 1,
    "combinedValidator/sameDateAsIncorporationDate" : (accumulatedVariables_before, eventAttributes) => eventAttributes["event/date"] === accumulatedVariables_before["company/:incorporationDate"]
  },
  defaultValidators: [ ],
  validate: (accumulatedVariables_before, eventAttributes, validators) => validators.map( validator => mergerino(validator, createObject( "isValid", validator["type"] === "combinedValidator" 
  ? Validators["validators"][validator.validator](accumulatedVariables_before, eventAttributes)
  : Validators["validators"][validator.validator]( getValidatorArgument(accumulatedVariables_before, eventAttributes, validator) )  ) ) )
} 


let event_incorporation = {
  eventType: "incorporation",
  attributes: ["event/index", "event/date", "event/incorporation/orgnumber", "event/incorporation/nominalSharePrice"],
  calculatedFields_eventLevel: [],
  calculatedFields_companyLevel: ["company/:orgnumber", "company/:nominalSharePrice", "company/:incorporationDate"],
  attributeValidators: [
    {attribute: "event/index", validator: "attributeValidator/isFirstEvent", errorMessage: "incorporation must be the first event." },
  ],
  companyVariableValidators: [],
  companyValidators: [],
  eventValidators: [],
  combinedValidators: [],
}

let event_addFounder = {
  eventType: "incorporation/addFounder",
  attributes: ["event/index", "event/date", "event/shareholder", "event/shareCount", "event/sharePremium"],
  calculatedFields_eventLevel: ["event/:accountBalance"],
  calculatedFields_companyLevel: ["company/:shareholders", "company/:accountBalance"],
  accountBalanceFunction: "event/:incorporation/addFounder/accountBalance",
  attributeValidators: [
    {attribute: "event/index", validator: "attributeValidator/notFirstEvent", errorMessage: "Cannot be first event." },
    {attribute: "event/shareholder", validator: "isDefined", errorMessage: "Required field." },
    {attribute: "event/shareCount", validator: "isDefined", errorMessage: "Required field." },
    {attribute: "event/sharePremium", validator: "isDefined", errorMessage: "Required field." },
  ],
  companyVariableValidators: [
    {companyVariable: "company/:nominalSharePrice", validator: "isDefined", errorMessage: "Nominal share price missing." },
    {companyVariable:  "company/:incorporationDate", validator: "isDefined", errorMessage: "Incorporation date is missing." }
  ],
  companyValidators: [],
  eventValidators: [],
  combinedValidators: [
    {validator: "combinedValidator/sameDateAsIncorporationDate", errorMessage: "Must have same date as incorporation event." }
  ],
  newEventDatoms: (eventCycle) => [
    newDatom("newEvent", "type", "process"), //TBU..
    newDatom("newEvent", "entity/type", "event"),
    newDatom("newEvent", "event/eventType", "incorporation/addFounder"),
    newDatom("newEvent", "event/incorporation/orgnumber", eventCycle["accumulatedVariables_after"]["company/:orgnumber"] ), //TBU..
    newDatom("newEvent", "event/index", eventCycle["eventAttributes"]["event/index"] + 1 ),
    newDatom("newEvent", "event/date", eventCycle["accumulatedVariables_after"]["company/:incorporationDate"]),
  ]
}

let event_operatingCostFromBankTransaction = {
  eventType: "operatingCost/bank",
  attributes: ["event/index", "event/date", "event/account", "event/amount"],
  calculatedFields_eventLevel: ["event/:accountBalance"],
  calculatedFields_companyLevel: ["company/:accountBalance"],
  accountBalanceFunction: "operatingCost/bank/accountBalance",
  attributeValidators: [
    {attribute: "event/index", validator: "attributeValidator/notFirstEvent", errorMessage: "Cannot be first event." },
    {attribute: "event/date", validator: "isDefined", errorMessage: "Required field." },
    {attribute: "event/account", validator: "isDefined", errorMessage: "Required field." },
    {attribute: "event/account", validator: "isOperatingCostAccount", errorMessage: "Must be an operating cost account." },
    {attribute: "event/amount", validator: "isDefined", errorMessage: "Required field." },
  ],
  companyVariableValidators: [
    {companyVariable: "company/:accountBalance", validator: "isDefined", errorMessage: "Prior accountBalance missing." }
  ],
  companyValidators: [],
  eventValidators: [],
  combinedValidators: [],
  newEventDatoms: (eventCycle) => [
    newDatom("newEvent", "type", "process"), //TBU..
    newDatom("newEvent", "entity/type", "event"),
    newDatom("newEvent", "event/eventType", "operatingCost/bank"),
    newDatom("newEvent", "event/incorporation/orgnumber", eventCycle["accumulatedVariables_after"]["company/:orgnumber"] ), //TBU..
    newDatom("newEvent", "event/index", eventCycle["eventAttributes"]["event/index"] + 1 ),
    newDatom("newEvent", "event/date", eventCycle["eventAttributes"]["event/date"])
  ]
}



const eventTypes = {
  incorporation: event_incorporation,
  "incorporation/addFounder": event_addFounder,
  "operatingCost/bank": event_operatingCostFromBankTransaction
}

let getRequiredHistoricalVariables = eventType => eventTypes[ eventType ]["companyVariableValidators"].map( validator => validator["companyVariable"] ).filter( filterUniqueValues )
let getRequiredAttributes = eventType => eventTypes[ eventType ]["attributes"]
let getCalculatedFields_eventLevel = eventType => eventTypes[ eventType ]["calculatedFields_eventLevel"]
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
    ].every( f => f(v) )

  },
  validate: (attribute, value) => Attribute.validators[ attribute ](value),
  validateAttributes: (eventAttributes) => Object.entries(eventAttributes).filter( entry => Object.keys(Attribute.validators).includes(entry[0]) ).every( entry => Attribute.validators[ entry[0] ](entry[1]) ),
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