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
let returnNullAndLog = (input, label) => {
console.log(input, label ? label : "")
return null
}
let randBetween = (lowest, highest) => Math.round(lowest + Math.random() * highest )
let ABS = (number) => Math.abs(number);
let filterUniqueValues = (value, index, self) => self.indexOf(value) === index
let getRandomArrayItem = (array) => array[ randBetween(0, array.length - 1 ) ]

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
let attributesList = attributesObject => (typeof attributesObject == "object") ? Object.entries(attributesObject).map((keyValuePair)=>{return ` ${keyValuePair[0]}="${keyValuePair[1]}" `}) : {} 
let isVoid = tagName => ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"].includes(tagName)
let voidElement = (tagName, attributesObject) => `<${tagName}${attributesList(attributesObject)}>`
let fullElement = (tagName, attributesObject, content) => `<${tagName}${attributesList(attributesObject)}>` + content + `</${tagName}>`
let el = (tagName, attributesObject, content) => (isVoid(tagName)) ? voidElement(tagName, attributesObject) : fullElement(tagName, attributesObject, content)
let createActionMappings = (triggerId, type, action) => [{triggerId, type, action}]


//New view mocdel
let elWithAction = (tagName, attributesObject, content, eventType, action) => {

  if(typeof eventType == "string" && typeof action == "function") {

    let id = attributesObject["id"] ? attributesObject["id"] : getNewElementID()
    let html = el(tagName, mergerino(attributesObject, {id: id} ), content)
    let actionMappings = createActionMappings(id, eventType, action )
    addActionMapping(actionMappings) //Impure, to be improved
    return html


  }else{
    return (isVoid(tagName)) ? voidElement(tagName, attributesObject) : fullElement(tagName, attributesObject, content)
  }
}

let d = (content, userDefinedAttributes, eventType, action) => elWithAction("div", (typeof userDefinedAttributes == "object") ? userDefinedAttributes : {}, Array.isArray(content) ? content.join('') : (typeof content === "string") ? content : console.log("ERRROR: Div received other input than array/string: ", content), eventType, action)
let divs = (contentArray, userDefinedAttributes) => contentArray.map((content) => d(content, userDefinedAttributes)).join('');
let h3 = content => el("h3", {} , content)

let input = (attributesObject, eventType, action) => elWithAction("input", attributesObject, null, eventType, action)
let dropdown = (value, optionObjects, updateFunction) => elWithAction("select", {id: getNewElementID(), style:"padding: 1em; border: 1px solid lightgray"}, optionObjects.map( o => `<option value="${o.value}" ${o.value === value ? `selected="selected"` : ""}>${o.label}</option>` ).join(''), "change", updateFunction  )
let inputWithLabelField = (label, value, onChange) => d(label + input({value: value, style: "text-align: right;" }, "change", onChange ), {class: "inputWithLabel"}  )
let inputWithLabelField_disabled = (label, value) => d(label + input({disabled: "disabled", value: value, style: "text-align: right;" }), {class: "inputWithLabel"}  )
let inputWithLabel_string = (A, entity, label, attribute) => d(label + input({value: (typeof entity[attribute] == "undefined") ? "" : entity[attribute], style: "text-align: right;" }, "change", e => A.submitDatoms( [newDatom(entity["entity"], attribute, e.srcElement.value)] ) ), {class: "inputWithLabel"}  )
let inputWithLabel_number = (A, entity, label, attribute) => d(label + input({value: (typeof entity[attribute] == "undefined") ? "" : entity[attribute], style: "text-align: right;" }, "change", e => A.submitDatoms( [newDatom(entity["entity"], attribute, validate.number(e.srcElement.value))] ) ), {class: "inputWithLabel"}  )

const templateDatoms = {
  complexTransaction: (S) => [
    newDatom("process", "type", "process"),
    newDatom("process", "date", S.selectedCompany["h/Events"][1]["date"]),
    newDatom("process", "process/identifier", "complexTransaction"),
    newDatom("process", "company/orgnumber", S.selectedCompany["company/orgnumber"]),
    newDatom("complexTransaction", "type", "transactions"),
    newDatom("complexTransaction", "parent", "process"),
    newDatom("complexTransaction", "date", S.selectedCompany["h/Events"][1]["date"]),
    newDatom("complexTransaction", "company/orgnumber", S.selectedCompany["company/orgnumber"]),
    newDatom("complexTransaction", "transaction/description", "Fri postering"),
    newDatom("record", "type", "records"),
    newDatom("record", "parent", "complexTransaction"),
    newDatom("record", "transaction/generic/account", "1920"),
    newDatom("record", "transaction/amount", -10000),
    newDatom("record2", "type", "records"),
    newDatom("record2", "parent", "complexTransaction"),
    newDatom("record2", "transaction/generic/account", "1920"),
    newDatom("record2", "transaction/amount", 10000),
  ],
  newRecord: (S, eventEntity) => [
    newDatom("record", "type", "records"),
    newDatom("record", "parent", eventEntity.Documents[0]["entity"]),
    newDatom("record", "transaction/generic/account", "1920"),
    newDatom("record", "transaction/amount", 0),
  ],
  newCompany: (S, orgnumber) => [
    newDatom("process", "type", "process"),
    newDatom("process", "date", "2020-01-01"),
    newDatom("process", "process/identifier", "incorporation"),
    newDatom("process", "company/orgnumber", String( orgnumber) ),
  ],
  addFounder: (incorporationEvent) => [
    newDatom(incorporationEvent.entity, "transaction/records", Array.isArray(incorporationEvent["transaction/records"]) ? incorporationEvent["transaction/records"].concat({"company/orgnumber":"010120123456","transaction/investment/quantity":0,"transaction/investment/unitPrice":0}) : [{"company/orgnumber":"010120123456","transaction/investment/quantity":0,"transaction/investment/unitPrice":0}] )
  ]
}

var currentActionMappings = [] //Temporary global container for actionsmappings, to be made functional

let addActionMapping = (actionMappings) => currentActionMappings = currentActionMappings.concat( actionMappings )

const renderUI = (S, A) => { 
    currentActionMappings = [];
    document.getElementById("appContainer").innerHTML = (S === null) ? "Server is re-booting, refresh in 10 sec.." :  pageView(S, A)
    currentActionMappings.forEach( actionMapping => document.getElementById(actionMapping.triggerId).addEventListener(actionMapping.type, actionMapping.action) )
}

let pageView = (S, A) => {

  let pageController = {
    "overview": timeline,
    "bankImport": bankImportPage,
    "yearEnd": yearEndPage,
    "admin": adminView
  } 

  return divs([
    headerBarView(S),
    menuBarView(S, A),
    pageContainer( pageController[S.currentPage](S, A) )
  ])

}



let adminView = (S, A) => d("AdminView TBD")

//Feed page

let sortEntitiesByDate = ( a, b ) => {

  let aDate = new Date( a["date"] )
  let bDate = new Date( b["date"] )


  return aDate - bDate
} 


//New event timeline

let attributeView_eventType = (Event, A) => d([
  Event["process/identifier"] === "incorporation" ? inputWithLabelField_disabled("Hendelsestype", "Stiftelse") : d([
    d("Hendelsestype: "), 
    dropdown( 
      Object.keys(H.eventTypes).includes(Event["process/identifier"]) ? Event["process/identifier"] : "" , 
      Object.entries( H.eventTypes ).map( entry => returnObject({label: `${entry[1].label}`, value: entry[0] })).concat([{value: 0, label: ""}]), 
      e => A.submitDatoms([newDatom(Event.entity, "process/identifier", e.srcElement.value )]) 
    ),
    "<br>"
  ], {class: "inputWithLabel"}  ),
])

let attributeView_stringifyEvent = (Event, A) => d( JSON.stringify(Event) )


var func = new Function("prevCompany, Event", "return prevCompany['company/shareholders'];" )
var func2 = new Function("prevCompany, Event", "console.log(prevCompany['company/shareholders']) ;" )

let valueTypes = {
  "number": {},
  "string": {},
  "object": {},
  "select": {}, // ???
}

let Attributes = { //NB: What is the entity id of the attribute entity itself?
  "entity/id": {
    "attr/name": "entity/id",
    "attr/valueType": "number",
    "attr/doc": "Arbritrary id number assigned from DB when creating new entities.",
    "attr/validatorFunction": (value) => (typeof value === "number"),
    "attr/viewFunction": attributeView_stringifyEvent
  },
  "entity/type": {
    "attr/name": "entity/type",
    "attr/valueType": "string",
    "attr/doc": "String name used to distinguish between a set of defined object types, eg. 'User' or 'Event'.",
    "attr/validatorFunction": (value) => (typeof value === "string"),
    "attr/viewFunction": attributeView_stringifyEvent
  },
  "event/eventType": {
    "attr/name": "event/eventType",
    "attr/valueType": "string",
    "attr/doc": "String name used to distinguish between a set of defined event types, eg. 'incorporation' or 'operatingCost'.",
    "attr/validatorFunction": (value) => ["incorporation", "incorporationCost", "operatingCost", "shareholderLoan_increase", "investment_new"].includes(value),
    "attr/viewFunction": attributeView_eventType
  },
  "event/index": {
    "attr/name": "event/index",
    "attr/valueType": "number",
    "attr/doc": "The index of a given event in the timeline of a given company.",
    "attr/validatorFunction": (value) => (typeof value === "number" && value >= 1),
    "attr/viewFunction": attributeView_stringifyEvent
  },
  "event/date": {
    "attr/name": "event/date",
    "attr/valueType": "string",
    "attr/doc": "YYYY-MM-DD date to show on the company's timeline.",
    "attr/validatorFunction": (value) => (typeof value === "string" && value.length === 10 ),
    "attr/viewFunction": attributeView_stringifyEvent
  },
  "event/incorporation/founders": {
    "attr/name": "event/incorporation/founders",
    "attr/valueType": "object",
    "attr/doc": "Array of objects containng shareholderID, shareCount and sharePremium for each founder of the company.",
    "attr/validatorFunction": (value) => Array.isArray(value) 
    ? value.map( founder => (
        typeof founder["shareholderID"] === "string" && 
        typeof founder["shareCount"] === "number" && 
        typeof founder["sharePremium"] === "number"  
       ) ).every( founderValidation => founderValidation === true )
    : false,
    "attr/viewFunction": attributeView_stringifyEvent
  },
  "event/incorporation/nominalSharePrice": {
    "attr/name": "event/incorporation/nominalSharePrice",
    "attr/valueType": "number",
    "attr/doc": "Nominal price per share as according to the company's articles of assembly.",
    "attr/validatorFunction": (value) => typeof value === "number",
    "attr/viewFunction": attributeView_stringifyEvent
  }, // event/error, from companyConstructor
  "event/incorporation/orgnumber": {
    "attr/name": "event/incorporation/orgnumber",
    "attr/valueType": "string",
    "attr/doc": "Norwegian organizational number as according to the company's articles of assembly.",
    "attr/validatorFunction": (value) => (typeof value === "string" && value.length === 9 && Number(value) >= 800000000 ),
    "attr/viewFunction": attributeView_stringifyEvent
  }
}

let outputFunctions = {
  "event/accountBalance": (prevCompany, Event) => mergerino( {}, Event["recordObjects"].map( record => record.account ).filter( filterUniqueValues ).map( account => createObject(account, Event["recordObjects"].filter( record => record.account === account ).reduce( (sum, record) => sum + record.amount, 0) )) ),
  "event/incorporation/shareCount": (prevCompany, Event) => Event["event/incorporation/founders"].reduce( (sum, founderObject) => sum + founderObject.shareCount, 0),
  "event/incorporation/shareCapital": (prevCompany, Event) => Event["event/incorporation/founders"].reduce( (sum, founderObject) => sum + (nominalSharePrice + founderObject.sharePremium) *  founderObject.shareCount, 0),
  "event/incorporation/shareholders": (prevCompany, Event) => Event["event/incorporation/founders"].map( shareholder => shareholder["id"] ).filter( filterUniqueValues ),
  "company/orgnumber": (prevCompany, Event) => Event["event/incorporation/orgnumber"] ? Event["event/incorporation/orgnumber"] : prevCompany["company/orgnumber"],
  "company/Events": (prevCompany, Event) => prevCompany["company/Events"] ? prevCompany["company/Events"].concat(Event) : [Event],
  "company/nominalSharePrice": (prevCompany, Event) => ifNot(Event["event/incorporation/nominalSharePrice"], prevCompany["company/nominalSharePrice"]),
  "company/shareCount": (prevCompany, Event) => Event["event/incorporation/shareCount"] ? prevCompany["company/shareCount"] + Event["event/incorporation/shareCount"] : Event["company/shareCount"],
  "company/shareholders": (prevCompany, Event) => ifNot( Event["event/incorporation/shareholders"], prevCompany["company/shareholders"] ),
  "company/shareCapital": (prevCompany, Event) => Event["event/eventType"] === "incorporation" ? Event["event/incorporation/shareCapital"] : prevCompany["company/shareCapital"],
  "company/accountBalance": (prevCompany, Event) => Event["event/eventType"] === "incorporation" ? Event["event/accountBalance"] : addAccountBalances(prevCompany["company/accountBalance"], Event["event/accountBalance"]),
  "company/validEventTypes": (prevCompany, Event) => ["incorporation", "incorporationCost", "operatingCost", "shareholderLoan_increase", "investment_new"],
}



const companyConstructur = {
  constructCompany: (Events) => {
    let [validatedEventsObject, eventObjectError] = companyConstructur.validateAndPrepareEventsObject(Events) 

    let constructedEvents = validatedEventsObject.map( companyConstructur.constructEvent )
    let companySnapshots = constructedEvents.map( (Event, index) => constructedEvents.slice(0, index + 1).reduce( companyConstructur.applyConstructedEventToCompany, companyConstructur.getCompanyTemplate()  )  )

    let Company = {
      inputEvents: Events,
      constructedEvents: constructedEvents,
      companySnapshots: companySnapshots
    }

    return Company
  },
  validateAndPrepareEventsObject: (Events) => [Array.isArray(Events) ? Events.sort( (E1, E2) => E1["event/index"] - E2["event/index"] ) : [], Array.isArray(Events) ? [] : Events ],
  constructEvent: (Event) => {
    let eventTypes = companyConstructur.getEventTypes()
    let eventType = Event["process/identifier"]
    let hasValidEventType = Object.keys(eventTypes).includes( eventType )
    if(!hasValidEventType){return mergerino(Event, {"event/error": `Error 1: Invalid eventType:: ${eventType}.`})}
    let eventTypeObject = eventTypes[ eventType ]
    let requiredAttributes_allEvents = ["entity", "type", "process/identifier", "company/orgnumber", "date"] // update
    let requiredAttributes_eventType = eventTypeObject["inputVariables"]
    let requiredAttributes = requiredAttributes_allEvents.concat(requiredAttributes_eventType)
    let hasRequiredAttributes = requiredAttributes.every( attr => Object.keys(Event).includes(attr) ) // Store missing attribute names?
    if(!hasRequiredAttributes){return mergerino(Event, {"event/error": `Error 2: Missing the following required attributes: ${requiredAttributes.filter( attr => !Object.keys(Event).includes(attr) )} `})}
    let attributesObject = companyConstructur.getAttributesObject() //NB: Now only inputAttributes
    let resultObjects = Object.keys(Event).filter( attribute => Object.keys(attributesObject).includes(attribute) ).map( eventAttribute => companyConstructur.validateAttributeValues( attributesObject[eventAttribute], eventAttribute, Event[ eventAttribute ] ) )
    let hasValidAttributeValues = resultObjects.every( resultObject => resultObject.error === false )
    //let constructedEventWithErrors = mergerino({}, resultObjects.map( resultObject => createObject(resultObject.attribute, resultObject.value) ), {"event/error": resultObjects.filter( resultObject => resultObject.error ) } )
    if(!hasValidAttributeValues){return mergerino(Event, {"event/error": `Error 3: Invalid attribute values.`})}
    let eventTypeLevelValidator = eventTypeObject["validateCombinedEventInputs"]
    let hasValidEventLevelInputs = eventTypeLevelValidator(Event)
    if(!hasValidEventLevelInputs){return mergerino(Event, {"event/error": `Error 4: The combination of inputs do not pass eventType level validation.`})}

    let calculatedAttributesObject = companyConstructur.getCalculatedAttributesObject()

    

    let attributesToCalculate = eventTypeObject["calculatedOutputs"]

    console.log(Event, attributesToCalculate)

    let calculatedOutputs = attributesToCalculate.map( attribute => createObject( attribute, calculatedAttributesObject[ attribute ](Event) )  )

    let constructedEvent = mergerino(Event, calculatedOutputs )
    return constructedEvent
  },
  validateAttributeValues: ( attributeObject, attribute, value ) => {
    let error = attributeObject.validator(value) === true ? false : {Error: `3: attribute [${attribute}] did not pass validation.`}
    let resultObject = {attribute, value, error}
    return resultObject
  },
  getEventTypes: () => {
    return H.eventTypes
  },
  getAttributesObject: () => {
    return H.inputAttributes
  },
  getCalculatedAttributesObject: () => {
    return H.calculatedAttributes
  },
  getCompanyTemplate: () => returnObject({type: "Company", "company/isIncorporated": false}),
  applyConstructedEventToCompany: (prevCompany, constructedEvent) => {
    let isIncorporated = (prevCompany["company/isIncorporated"] || constructedEvent["process/identifier"] === "incorporation")
    if(!isIncorporated){return mergerino(constructedEvent, {"event/error": "Error 5: No incorporation event."})}

    let defaultDependencies = [] //generic attributes, eg. latest event index etc
    let eventType = constructedEvent["process/identifier"]
    let eventTypes = companyConstructur.getEventTypes()
    let eventTypeObject = eventTypes[ eventType ]
    let eventTypeDependencies = eventTypeObject["companyOutputVariableDependencies"]
    let attributesToUpdate = defaultDependencies.concat(eventTypeDependencies)

    let prevCompanyAttributes = Object.keys(prevCompany)
    let unAffectedAttributes = prevCompanyAttributes.filter( attribute => !attributesToUpdate.includes(attribute) )

    let attributeUpdateFunctions = companyConstructur.getAttributeUpdateFunctions()

    let Company = mergerino(
      {},
      unAffectedAttributes.map( attribute => createObject( attribute, prevCompany[ attribute ] ) ),
      attributesToUpdate.map( attribute => createObject(attribute, attributeUpdateFunctions[ attribute ]( prevCompany, constructedEvent ) ) ) //Should handle non-applicable events generically instead of in each attributeTypeUpdatefunction??
    )

    return Company
  },
  getAttributeUpdateFunctions: () => H.calculatedAttributes
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
      view: (Event, A) => ``
    },
    "type": { 
      validator: (value) => value === "process" ? true : false,
      view: (Event, A) => ``
    },
    "process/identifier": { 
      validator: (value) => Object.keys(H.eventTypes).includes(value) ? true : false,
      view: (Event, A) => d([
        Event["process/identifier"] === "incorporation" ? inputWithLabelField_disabled("Hendelsestype", "Stiftelse") : d([
          d("Hendelsestype: "), 
          dropdown( 
            Object.keys(H.eventTypes).includes(Event["process/identifier"]) ? Event["process/identifier"] : "" , 
            Object.entries( H.eventTypes ).map( entry => returnObject({label: `${entry[1].label}`, value: entry[0] })).concat([{value: 0, label: ""}]), 
            e => A.submitDatoms([newDatom(Event.entity, "process/identifier", e.srcElement.value )]) 
          ),
          "<br>"
        ], {class: "inputWithLabel"}  ),
      ])
    }
  },
  inputAttributes: {
    "transaction/records": { 
      validator: (value) => (typeof value === "object") ? true : false,
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
      validator: (value) => true,
      view: (Event, A) => d([
        d("Konto"),
        dropdown( Event["transaction/generic/account"] ? Event["transaction/generic/account"] : 0, Object.entries( H.Accounts ).map( entry => returnObject({label: `${entry[0]} - ${entry[1].label}`, value: entry[0] })).concat([{value: 0, label: ""}]), e => A.submitDatoms([newDatom(Event.entity, "transaction/generic/account", e.srcElement.value )]) )
      ], {class: "inputWithLabel"}  )
    },
    "transaction/amount": {
      validator: (value) => (typeof value === "number") ? true : false,
      view: (Event, A) => inputWithLabel_number(A, Event, "Beløp", "transaction/amount")
    },
    "company/orgnumber": {
      validator: (value) => (typeof value === "string") ? true : false,
      errorMessage: "9-sifret norsk organisasjonsnummer.",
      view: (Event, A) => inputWithLabelField_disabled("Orgnr.", Event["company/orgnumber"])
    },
    "date": {
      validator: (value) => (typeof value === "string") ? true : false,
      view: (Event, A) => Event["process/identifier"] === "incorporation" ? inputWithLabelField_disabled("Dato", Event["date"]) : inputWithLabel_string(A, Event, "Dato", "date")
    },
    "company/AoA/nominalSharePrice": { 
      validator: (value) => (typeof value === "number") ? true : false,
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
    "event/isIncorporated": (eventInput) => eventInput["process/identifier"] === "incorporation" ? true : false,
    "event/shareCountIncrease": (eventInput) => Array.isArray(eventInput["transaction/records"]) ? eventInput["transaction/records"].reduce( (sum, shareholderTransaction) => sum + shareholderTransaction["transaction/investment/quantity"], 0 ) : null,
    "event/shareCapitalIncrease": (eventInput) => Array.isArray(eventInput["transaction/records"]) ? eventInput["transaction/records"].reduce( (sum, shareholderTransaction) => sum + shareholderTransaction["transaction/investment/quantity"] * (eventInput["company/AoA/nominalSharePrice"] + shareholderTransaction["transaction/investment/unitPrice"]), 0 ) : null,
    "event/accountBalance": (Event) => Event["process/identifier"] === "incorporation" ? {
      "2000": -Event["transaction/records"].reduce( (sum, shareholderTransaction) => sum + shareholderTransaction["transaction/investment/quantity"] * (Event["company/AoA/nominalSharePrice"] + shareholderTransaction["transaction/investment/unitPrice"]), 0 ),
      "1370": Event["transaction/records"].reduce( (sum, shareholderTransaction) => sum + shareholderTransaction["transaction/investment/quantity"] * (Event["company/AoA/nominalSharePrice"] + shareholderTransaction["transaction/investment/unitPrice"]), 0 )
    } : (Event["transaction/generic/account"] && Event["transaction/amount"]) ? mergerino({"1920": Event["transaction/amount"]}, createObject(Event["transaction/generic/account"], -Event["transaction/amount"] )) : undefined
  },
  eventTypes: {
    "incorporation": {
      label: "Stiftelse",
      inputVariables: ["transaction/records", "date", "company/AoA/nominalSharePrice"],
      companyOutputVariableDependencies: ["company/isIncorporated", "company/orgnumber", "company/AoA/nominalSharePrice", "company/shareCount", "company/shareholders", "company/shareCapital", "company/accountBalance"],
      validateCombinedEventInputs: (eventInputs) => true,
      calculatedOutputs: ["event/isIncorporated", "event/shareCountIncrease", "event/shareCapitalIncrease", "event/accountBalance"]
      },
      "operatingCost": {
        label: "Driftskostnader",
        inputVariables: ["date", "transaction/generic/account", "transaction/amount"],
        allowedAccounts: ["entity", "type", "process/identifier", "company/orgnumber", "date", "transaction/generic/account", "transaction/amount"],
        companyOutputVariableDependencies: ["company/accountBalance"],
        validateCombinedEventInputs: (eventInputs) => true,
        calculatedOutputs: ["event/accountBalance"]
      }
  }
}

let timeline = (S, A) => {

  //let CompanySnapshots = constructCompanySnapshots(S.selectedEvents, H.eventTypes)
  

  let Company = companyConstructur.constructCompany(S.selectedEvents)
  console.log(Company)
  let eventViews = Company.constructedEvents.map( (constructedEvent, index) => genericEventView( S, A, Company["constructedEvents"][index], Company["companySnapshots"][index] )  ).join('')
  //let eventViews = Company["company/Events"].map( (CompanySnapshot, index) => genericEventView(S, CompanySnapshot, index, H.eventTypes, A)  ).join('')

  return d([
    eventViews,
    createEventView(S, A)
  ])
} 


let genericEventView = ( S, A, Event, companySnapshot ) => {

  let eventType = Event["process/identifier"]

  let eventTypeAttributes = H.eventTypes[eventType]["inputVariables"]
  let systemAttributes = Object.keys(H.systemAttributes)
  let visibleAttributes = eventTypeAttributes.filter( attribute => !systemAttributes.includes(attribute) )

  let attributeViews = visibleAttributes.map( attribute => H.inputAttributes[ attribute ].view( Event, A )  ).join("")

  return d([
    d([
      h3("Event view:"),
      attributeViews,
      "<br>",
      eventInspector(Event),
      "<br>",
      companyInspector(companySnapshot)
    ], {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
    d( `${Event["date"]} (id: ${Event["entity"]} )` , {style: "margin-right: 1em;text-align: right;margin-bottom: 1em;color:#979797;margin-top: 3px;"})
  ])



}

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


let eventInspector = (Event) => {
  let eventType = Event["process/identifier"]
  let eventTypeObject = H.eventTypes[ eventType ]
  
  let systemAttributes = Object.keys(H.systemAttributes)
  let inputAttributes = eventTypeObject["inputVariables"]
  let calculatedAttributes_event = eventTypeObject["calculatedOutputs"]

  return d([
    h3("Event inspector"),
    systemAttributes.map( attribute => d([d(attribute), d("system"), d(typeof Event[ attribute ]), d(JSON.stringify(Event[ attribute ]), {style: "max-width: 200px;"}) ], {class: "eventInspectorRow"}) ).join(''),
    "<br>",
    inputAttributes.map( attribute => d([
      d(attribute),
      d("input"),
      d(typeof Event[ attribute ] ),
      d([
        Array.isArray(Event[attribute]) 
        ? Event[attribute].map( entry => d( JSON.stringify(entry) ) ).join("")
        : (typeof Event[attribute] === "object" )
          ? Object.entries(Event[attribute]).map( entry => d( entry[0] + ": " + JSON.stringify(entry[1]) ) ).join("")
          : d(JSON.stringify( Event[attribute]))
      ], {style: "max-width: 200px;"})
    ], {class: "eventInspectorRow"}) ).join(""),
    "<br>",
    calculatedAttributes_event.map( attribute => d([d(attribute), d("calculated"), d(typeof Event[ attribute ]), d(JSON.stringify(Event[ attribute ]), {style: "max-width: 200px;"}) ], {class: "eventInspectorRow"}) ).join(''),
    "<br>",
    d(Event["event/error"] ? Event["event/error"] : "No event errors.")
  ], {style: "background-color: #8080803b; padding: 1em;"})
}

let companyInspector = (companySnapshot) => {

  return d([
    h3("Company inspector"),
    Object.keys(companySnapshot).map( attribute => d([d(attribute), d(JSON.stringify(companySnapshot[attribute]))], {class: "eventInspectorRow"} )  ).join('')
  ], {style: "background-color: #8080803b; padding: 1em;"})
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



//New event timeline END

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

//Annual report

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
}

//Page frame and page controller

//Containers
let pageContainer = (page) => d( page, {class: "pageContainer"} )
let feedItemContainer = (entity, view) => d([
  d( view, {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
  d( entity["date"], {style: "margin-right: 1em;text-align: right;margin-bottom: 1em;color:#979797;margin-top: 3px;"}),
  d( "id: " + String( entity["entity"] ), {style: "margin-right: 1em;text-align: right;margin-bottom: 1em;color:#979797;margin-top: 3px;"}),
  d( entity["process/identifier"], {style: "margin-right: 1em;text-align: right;margin-bottom: 1em;color:#979797;margin-top: 3px;"}),
]) 

let headerBarView = (S) => d([
  '<header><h1>Holdingservice Beta</h1></header>',
  `<div>Server version: ${S.serverConfig.serverVersion}</div>`,
  `<div>Client app version: ${S.serverConfig.clientVersion}</div>`,
  `<div>DB version: ${S.tx}</div>`,
  `<div>Server cache updated: ${moment(S.serverConfig.cacheUpdated).format()}</div>`,
  d( divs(["Logg ut", "Innstillinger"], {class: "textButton"}), {style: "display:flex;"} )
], {style: "padding-left:3em; display:flex; justify-content: space-between;"})

let menuRow = (labels, selectedOptionIndex, buttonActions) => d( labels.map( (label, index) => d( label, {class: index === selectedOptionIndex ? "textButton textButton_selected" : "textButton"}, "click", buttonActions[index] ) ), {style: "display:flex;"} )

let menuBarView = (S, A) => {

  let orgnumbers = S.Events.map( E => E["company/orgnumber"] ).filter( filterUniqueValues )
  let years = S.Events.filter( E => E["company/orgnumber"] === S.selectedOrgnumber ).map( E => E["date"].slice(0,4) ).filter( filterUniqueValues )
  let pageLabels = ["Hendelser", "Årsavslutning", "Bank",  "Admin"]
  let pageNames = ["overview", "yearEnd", "bankImport", "admin"]

  return d([
    menuRow(
      orgnumbers, 
      orgnumbers.indexOf( S.selectedOrgnumber ),
      orgnumbers.map( orgnumber => e => {
        let selectedOrgnumber = orgnumber
        let selectedYear = S.Events.filter( C => C["company/orgnumber"] === orgnumber)[0]["date"].slice(0,4)
        let patch = mergerino({selectedOrgnumber, selectedYear})
        A.patch(  patch )
      }  )
    ),
    d( "Legg til nytt selskap", {class: "textButton"}, "click", e => A.submitDatoms( templateDatoms.newCompany(S, randBetween(8000000, 999999999) ) ) ),
    menuRow(
      years,
      years.indexOf( String(S.selectedYear) ),
      years.map( year => e => A.patch({selectedYear: year}) )
    ),
    menuRow(
      pageLabels, 
      pageNames.indexOf( S.currentPage ),
      pageNames.map( pageName => e => A.patch({currentPage: pageName}) )
    )
  ], {style: "padding-left:3em;"})
}

//Bank import page
  
let bankImportPage = (S, A) => d([
  S["bankImport/parsedFile"] ? reviewImportView(S, A) : selectFileView(S, A) 
]) 

let reviewImportView = (S, A) => d([
  importedTransactionsTable(S, A, S["bankImport/parsedFile"]),
  d([d("Bekreft", {class: "textButton"}, "click", e => A.importBankTransactions()), d("Avbryt", {class: "textButton"}, "click", e => A.patch( createObject("bankImport/parsedFile", false)))], {style: "display: flex;"})
])

let selectFileView = (S, A) => d([
  el("input", {type: "file", id:"fileInput"} ),
  d("Last opp", {class: "divButton"}, "click", e => A.parseFile( document.getElementById('fileInput').files[0] ))
])

let importedTransactionsTable = (S, A, importedRows) => d([
  d(divs(["Dato", "Transaksjonstekst", "Beløp", "Bankens referanse"]), {style: "display:grid;grid-template-columns: 1fr 3fr 1fr 1fr; text-align: right;"}),
  importedRows.map( row => importedTransactionsTableRow(S, A, row) ).join('')
])

let importedTransactionsTableRow = (S, A, row) => d([
  d( row["date"], {style: "text-align: right;"}),
  d( row["description"]),
  d( format.amount( row["amount"] ), {style: "text-align: right;"}),
  d( row["transactionReference"], {style: "text-align: right;"})
], {style: "display:grid;grid-template-columns: 1fr 3fr 1fr 1fr;"})

//Shareholders page

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