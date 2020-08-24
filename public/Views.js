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
    "shareholders": shareholdersPage,
    "admin": adminView
  } 

  return divs([
    headerBarView(S),
    menuBarView(S, A),
    pageContainer( pageController[S.currentPage](S, A) )
  ])

}

let adminView = (S, A) => d("AdminView TBD")



//Transaction feed item

let metadataViews = {
  "1920": (S, A, record) => d([
    inputWithLabel_number(A, record, "Bankkonto (kun tall)", `transaction/bankAccount`),
    inputWithLabel_string(A, record, "Transaksjonsreferanse", `transaction/bankTransactionReference`),
  ]),
  "1810": (S, A, record) => metadataViews["1820"](S, A, record),
  "1820": (S, A, record) => d([
        inputWithLabel_string(A, record, "Selskap (orgnr)", `company/orgnumber`),
        inputWithLabel_number(A, record, "Antall", `transaction/investment/quantity`),
        inputWithLabelField_disabled( "Enhetspris: ", format.amount( Math.abs( record["transaction/amount"] / record["transaction/investment/quantity"] )  ) )
    ]),
  "2000": (S, A, record) => d([
      inputWithLabel_string(A, record, "Orgnr/personnummer", `company/orgnumber`),
      inputWithLabel_number(A, record, "Antall", `transaction/investment/quantity`),
      inputWithLabelField_disabled( "Enhetspris: ", format.amount( Math.abs( record["transaction/amount"] / record["transaction/investment/quantity"] )  ) )
    ]),
  "2915": (S, A, record) => d([
      inputWithLabel_string(A, record, "Orgnr/personnummer", `company/orgnumber`)
    ])
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
      accountMetaDataView(S, A, otherRecord)
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
    accountMetaDataView(S, A, record),
    (record["transaction/generic/account"] === "1920" && record["transaction/bankTransactionReference"]) ? inputWithLabelField_disabled( "Beløp", amount ) : inputWithLabel_number(A, record, "Beløp", "transaction/amount"),
    d("Slett linje", {class: "textButton"}, "click", e => A.retractEntity( record["entity"] ) )
  ], {class: "paddingAndBorder"})
} 

let accountSelectionDropdown = (A, record) => d([
  d("Konto"),
  dropdown( record["transaction/generic/account"], Object.entries( Accounts ).map( entry => returnObject({label: `${entry[0]} - ${entry[1].label}`, value: entry[0] })).concat([{value: 0, label: ""}]), e => A.submitDatoms([newDatom(record.entity, "transaction/generic/account", e.srcElement.value )]) )
], {class: "inputWithLabel"}  )

let accountMetaDataView = (S, A, record) => metadataViews[ record["transaction/generic/account"] ] ? metadataViews[ record["transaction/generic/account"] ](S, A, record) :  d("na.")


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

//Feed page

let sortEntitiesByDate = ( a, b ) => {

  let aDate = new Date( a["date"] )
  let bDate = new Date( b["date"] )


  return aDate - bDate
} 

let timeline = (S, A) => S.selectedCompany["h/Events"].filter( Event => Event.date.substr(0,4) === S.selectedYear ).map( Event => feedItemContainer( Event, eventTypeController[ Event["process/identifier"] ](S, A, Event)  ) ).join('')


let eventTypeController = {
  "incorporation": (S, A, eventEntity) => feedItem_incorporation(S, A, eventEntity),
  "simpleTransaction": (S, A, eventEntity) => feedItem_simpleTransaction(S, A, eventEntity),
  "complexTransaction": (S, A, eventEntity) => feedItem_complexTransaction(S, A, eventEntity),
  "yearEnd_2020": (S, A, eventEntity) => feedItem_yearEnd(S, A, eventEntity),
}

let feedItem_yearEnd = (S, A, eventEntity) => {  

  return d([
   h3(`Årsavslutning ${S.selectedYear}`),
   "<br>",
   trialBalanceView(S, A, eventEntity),
   "<br>",
   annualReportView(S, A, eventEntity),
   "<br>",
   h3("Utfylling av Næringsoppgave 2 (RF-1167)"),
   "<br>",
   d("Fyll ut feltene under seksjonene Foretaksopplysninger og Revisor og regnskapsfører."),
   "<br>",
   d([d("Feltnummer"), d("Beløp", {class: "numberCell"} )], {class: "trialBalanceRow"})
 ])
 }

let trialBalanceView = (S, A, eventEntity) => {

  let accountBalance = getAccountBalance(S, eventEntity);

  let openingBalance = getOpeningBalance(S, eventEntity);

  let allAccounts = Object.keys( mergerino(openingBalance, accountBalance) )

  return d([
    h3(`Foreløpig saldobalanse`),
    d([d("Kontonr."), d("Konto"), d("Åpningsbalanse", {class: "numberCell"} ), d("Endring", {class: "numberCell"} ), d("Utgående balanse", {class: "numberCell"} )], {class: "trialBalanceRow"}),
    allAccounts.map( account => {
      let opening = openingBalance[ account ] ? openingBalance[ account ] : 0 
      let closing = accountBalance[ account ]
        
      let change = closing - opening

      let openingString = (Number(account) < 3000) ? format.amount( opening ) : ""
      let closingString = (Number(account) < 3000) ? format.amount( closing ) : ""
      let changeString = format.amount( change )

      return d([ 
        d( account ), 
        d( Accounts[ account ]["label"] ), 
        d( openingString, {class: "numberCell"}), 
        d( changeString, {class: "numberCell"}), 
        d( closingString, {class: "numberCell"}), 
      ], {class: "trialBalanceRow"})
    }).join('')
  ])
} 


//Annual report

let getPnL = (S, eventEntity ) => {

  let accountBalance = getAccountBalance(S, eventEntity);

  let openingBalance = getOpeningBalance(S, eventEntity);

  let PnLItems = [
    {label: "DRIFTSRESULTAT", accounts: [], note: "" },
    {label: "Annen driftskostnad", accounts: ['6540', '6551', '6552', '6580', '6701', '6702', '6705', '6720', '6725', '6726', '6790', '6890', '6900', '7770', '7790', '7791'], note: "" },
    {label: "Driftsresultat", accounts: ['6540', '6551', '6552', '6580', '6701', '6702', '6705', '6720', '6725', '6726', '6790', '6890', '6900', '7770', '7790', '7791'], note: "" },
    {label: "<br>", accounts: [], note: "" },
    {label: "FINANSINNTEKTER OG FINANSKOSTNADER", accounts: [], note: "" },
    {label: "Inntekt på investering i datterselskap og tilknyttet selskap", accounts: ['8000', '8020'], note: "1" },
    {label: "Renteinntekt fra foretak i samme konsern", accounts: ['8030', '8130'], note: "2" },
    {label: "Annen finansinntekt", accounts: ['8050', '8055', '8060', '8070'], note: "3" },
    {label: "Inntekt på andre investeringer", accounts: ['8071', '8078', '8090'], note: "" },
    {label: "Verdiendring av finansielle instrumenter vurdert til virkelig verdi", accounts: ['8080', '8100'], note: "" },
    {label: "Sum finansinntekter", accounts: ['8000', '8020', '8030', '8130', '8050', '8055', '8060', '8070', '8071', '8078', '8090', '8080', '8100'], note: "" },
    {label: "<br>", accounts: [], note: "" },
    {label: "Nedskrivning av finansielle eiendeler", accounts: ['8110', '8120'], note: "" },
    {label: "Annen finanskostnad", accounts: ['8140', '8150', '8155', '8160', '8170', '8178'], note: "" },
    {label: "Sum finanskostnader", accounts: ['8110', '8120', '8140', '8150', '8155', '8160', '8170', '8178'], note: "" },
    {label: "<br>", accounts: [], note: "" },
    {label: "Skattekostnad på ordinært resultat", accounts: ['8300', '8320'], note: "" },
    {label: "<br>", accounts: [], note: "" },
    {label: "Årsresultat", accounts: ['8800'], note: "" },
  ]

  let headerRow = d([ d(""), d(""), d( eventEntity["date"].substr(0, 4) , {class: "numberCell"} ), d( String( Number( eventEntity["date"].substr(0, 4) - 1) ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} )

  let pnl = [headerRow].concat(PnLItems.map( item => {

    let thisYear = Object.entries( accountBalance ).reduce( (sum, entry) => sum + returnObject(item.accounts.includes( String(entry[0]) ) ? entry[1] : 0), 0  )
    let prevYear = Object.entries( openingBalance ).reduce( (sum, entry) => sum + returnObject(item.accounts.includes( String(entry[0]) ) ? entry[1] : 0), 0  )

    return d([ d(item.label), d(item.note), d( (thisYear === 0) ? "" : format.amount( thisYear ), {class: "numberCell"} ), d( (prevYear === 0) ? "" : format.amount( prevYear ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} )
  })).join('')


  return pnl

}

let getAccountBalance = (S, eventEntity) => (S.selectedCompany["company/latestEvent"] === eventEntity["date"]) ? S.selectedCompany["acc/accounts"]
:  S.selectedCompany["h/Snapshots"].filter( snapshot => snapshot["company/latestEvent"] === eventEntity["date"] && Object.keys(snapshot["acc/accounts"]).includes("8800")  )[0]["acc/accounts"]

let getOpeningBalance = (S, eventEntity) => {

  let olderSnapshots = S.selectedCompany["h/Snapshots"].filter( snapshot => Number(snapshot["company/latestEvent"].substr(0, 4)) < Number(eventEntity["date"].substr(0, 4)) )

  let openingBalanceSnapshot = olderSnapshots[ olderSnapshots.length - 1 ]

  let openingBalance = openingBalanceSnapshot ? openingBalanceSnapshot["acc/accounts"] : {}

  return openingBalance
  
}

let getBalanceSheet = (S, eventEntity ) => {

  let accountBalance = getAccountBalance(S, eventEntity);

  let openingBalance = getOpeningBalance(S, eventEntity);

  let lineItems = [
    {label: 'EIENDELER', accounts: [], note: ''}, 
    {label: 'Utsatt skattefordel', accounts: ["1070"], note: ''}, 
    {label: 'Sum immatrielle eiendeler', accounts: ["1070"], note: ''}, 
    {label: "<br>", accounts: [], note: "" },
    {label: 'Investeringer i datterselskap', accounts: ["1300"], note: ''}, 
    {label: 'Lån til foretak i samme konsern', accounts: ["1320"], note: ''}, 
    {label: 'Investeringer i tilknyttet selskap', accounts: ["1330"], note: ''}, 
    {label: 'Lån til tilknyttet selskap og felles kontrollert virksomhet', accounts: ["1340"], note: ''}, 
    {label: 'Investeringer i aksjer og andeler', accounts: ["1350"], note: ''}, 
    {label: 'Obligasjoner', accounts: ["1360"], note: ''}, 
    {label: 'Andre fordringer (anleggsmidler)', accounts: ["1370", "1375", "1380", "1399"], note: ''},
    {label: 'Sum finansielle anleggsmidler', accounts: ['1300' ,' 1320' ,' 1330' ,' 1340' ,' 1350' ,' 1360' ,' 1370' ,' 1375' ,' 1380' ,' 1399'], note: ''},  
    {label: "<br>", accounts: [], note: "" },
    {label: 'Andre fordringer (omløpsmidler)', accounts: ["1576", "1579", "1749"], note: ''},
    {label: 'Sum fordringer', accounts: ["1576", "1579", "1749"], note: ''}, 
    {label: "<br>", accounts: [], note: "" },
    {label: 'Aksjer og andeler i foretak i samme konsern', accounts: ["1800"], note: ''}, 
    {label: 'Markedsbaserte aksjer', accounts: ["1810"], note: ''}, 
    {label: 'Andre finansielle instrumenter', accounts: ["1820"], note: ''}, 
    {label: 'Andre markedsbaserte finansielle instrumenter', accounts: ["1880"], note: ''}, 
    {label: 'Andre finansielle instrumenter', accounts: ["1830", "1870"], note: ''}, 
    {label: 'Sum investeringer', accounts: ["1810", "1820", "1830", "1870", "1880"], note: ''}, 
    {label: "<br>", accounts: [], note: "" },
    {label: 'Bankinnskudd, kontanter og lignende', accounts: ["1920"], note: ''}, 
    {label: 'Sum Bankinnskudd, kontanter og lignende', accounts: ["1920"], note: ''}, 
    {label: 'SUM EIENDELER', accounts: Object.keys(Accounts).filter( acc => Number(acc) < 2000 ).map( acc => String(acc) ), note: ''}, 
    {label: "<br>", accounts: [], note: "" },
    {label: 'EGENKAPITAL OG GJELD', accounts: [], note: ''}, 
    {label: 'Aksjekapital', accounts: ["2000"], note: ''}, 
    {label: 'Overkurs', accounts: ["2020"], note: ''}, 
    {label: 'Annen innskutt egenkapital', accounts: ["2030"], note: ''}, 
    {label: 'Sum innskutt egenkapital', accounts: ["2000", "2020", "2030"], note: ''}, 
    {label: "<br>", accounts: [], note: "" },
    {label: 'Annen egenkapital', accounts: ["2050"], note: ''}, 
    {label: 'Udekket tap', accounts: ["2080"], note: ''}, 
    {label: 'Sum opptjent egenkapital', accounts: ["2050", "2080"], note: ''}, 
    {label: 'SUM EGENKAPITAL', accounts: Object.keys(Accounts).filter( acc => Number(acc) >= 2000 && Number(acc) < 2100 ).map( acc => String(acc) ), note: ''}, 
    {label: "<br>", accounts: [], note: "" },
    {label: 'Utsatt skatt', accounts: ["2120"], note: ''}, 
    {label: 'Sum avsetning for forpliktelser', accounts: ["2120"], note: ''}, 
    {label: "<br>", accounts: [], note: "" },
    {label: 'Gjeld til kredittinstitusjoner', accounts: ["2220"], note: ''}, 
    {label: 'Øvrig langsiktig gjeld', accounts: ["2250" , "2260" , "2290"], note: ''}, 
    {label: 'Sum annen langsiktig gjeld', accounts: ["2220", "2250" , "2260" , "2290"], note: ''}, 
    {label: "<br>", accounts: [], note: "" },
    {label: 'Leverandørgjeld', accounts: ["2400"], note: ''}, 
    {label: 'Betalbar skatt', accounts: ["2500", "2510"], note: ''}, 
    {label: 'Annen kortsiktig gjeld', accounts: ["2800" ,"2910" ,"2920","2990"], note: ''},
    {label: 'Sum kortsiktig gjeld', accounts: ["2400", "2500" , "2510" , "2800" ,"2910" ,"2920","2990"], note: ''}, 
    {label: 'SUM GJELD', accounts: Object.keys(Accounts).filter( acc => Number(acc) >= 2100 && Number(acc) < 3000 ).map( acc => String(acc) ), note: ''}, 
    {label: "<br>", accounts: [], note: "" },
    {label: 'SUM EGENKAPITAL OG GJELD', accounts: Object.keys(Accounts).filter( acc => Number(acc) >= 2000 && Number(acc) < 3000 ).map( acc => String(acc) ), note: ''}
  ]

  let headerRow = d([ d(""), d(""), d( eventEntity["date"].substr(0, 4) , {class: "numberCell"} ), d( String( Number( eventEntity["date"].substr(0, 4) - 1) ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} )

  let balanceSheet = [headerRow].concat(lineItems.map( item => {

    let thisYear = Object.entries( accountBalance ).reduce( (sum, entry) => sum + returnObject(item.accounts.includes( String(entry[0]) ) ? entry[1] : 0), 0  )
    let prevYear = Object.entries( openingBalance ).reduce( (sum, entry) => sum + returnObject(item.accounts.includes( String(entry[0]) ) ? entry[1] : 0), 0  )

    return d([ d(item.label), d(item.note), d( (thisYear === 0) ? "" : format.amount( thisYear ), {class: "numberCell"} ), d( (prevYear === 0) ? "" : format.amount( prevYear ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} )
  })).join('')


  return balanceSheet

}

let annualReportView = (S, A, eventEntity) => {

  


  return d([
    h3(`Årsregnskap ${S.selectedYear} for ${S.selectedCompany["company/name"]}`),
    "<br>",
    d([h3(`Resultatregnskap`), getPnL( S, eventEntity ) ], {class: "borderAndPadding"}),
    "<br>",
    d([h3(`Balanseregnskap`), getBalanceSheet(S, eventEntity )], {class: "borderAndPadding"}),
    "<br>",
    d([h3(`Noter`), notesText(S, A, eventEntity)], {class: "borderAndPadding"}),
    "<br>",
  ])
}

let em = (content) => String('<span class="emphasizedText">' + content + '</span>')


let notesText = (S, A, eventEntity) => {


  let accountBalance = S.selectedCompany["acc/accounts"]

  let olderSnapshots = S.selectedCompany["h/Snapshots"].filter( snapshot => Number(snapshot["company/latestEvent"].substr(0, 4)) < Number(eventEntity["date"].substr(0, 4)) )

  let openingBalanceSnapshot = olderSnapshots[ olderSnapshots.length - 1 ]

  let openingBalance = openingBalanceSnapshot ? openingBalanceSnapshot["acc/accounts"] : {}

  let nominalSharePrice = S.selectedCompany["company/AoA/nominalSharePrice"]
  

  let shareCount = S.selectedCompany["shareCount"]

  let shareholders = S.selectedCompany["shareholders"] ? Object.entries(S.selectedCompany["shareholders"]) : []

  

  let shareCapital_start = ifNot(openingBalance["2000"], 0)
  let shareCapital = ifNot(accountBalance["2000"], 0)
  let shareCapital_change = shareCapital - shareCapital_start

  let sharePremium_start = ifNot(openingBalance["2020"], 0)
  let sharePremium = ifNot(accountBalance["2020"], 0)
  let sharePremium_change = sharePremium - sharePremium_start

  let otherEquity_start = ifNot(accountBalance["2050"], 0)
  let otherEquity = ifNot(accountBalance["2050"], 0)
  let otherEquity_change = otherEquity - otherEquity_start

  let totalEquity_start = shareCapital_start + sharePremium_start + otherEquity_start
  let totalEquity_change = shareCapital_change + sharePremium_change + otherEquity_change
  let totalEquity = shareCapital + sharePremium + otherEquity

  let taxRate = "22%"

  let auditorCost_main = 0
  let auditorCost_other = 0

  let annualResult = 0

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
Foretaket har ${em( format.amount(shareCount) ) } aksjer, pålydende kr ${em( format.amount( nominalSharePrice ) )}, noe som gir en samlet aksjekapital på kr ${em(format.amount( shareCapital ) )}. Selskapet har én aksjeklasse.
<br><br>
Aksjene eies av: 
<br>
${shareholders.map( shareholder => d(em(`${shareholder[0]}: ${shareholder[1].shareCount} <br>`))).join('')}

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
    <td class="numberCell">${em( shareCapital_start ) }</td>
    <td class="numberCell">${em( sharePremium_start ) }</td>
    <td class="numberCell">${em( otherEquity_start ) }</td>
    <td class="numberCell">${em( totalEquity_start ) }</td>
  </tr>
  <tr>
    <td>Endring ila. året </td>
    <td class="numberCell">${em( shareCapital_change ) }</td>
    <td class="numberCell">${em( sharePremium_change ) }</td>
    <td class="numberCell">${em( otherEquity_change ) }</td>
    <td class="numberCell">${em( totalEquity_change ) }</td>
  </tr>
  <tr>
    <td>Egenkapital 31.12 </td>
    <td class="numberCell">${em( shareCapital ) }</td>
    <td class="numberCell">${em( sharePremium ) }</td>
    <td class="numberCell">${em( otherEquity ) }</td>
    <td class="numberCell">${em( totalEquity ) }</td>
  </tr>
</tbody>
</table>

${taxNote(S, A, eventEntity)}

<h4>Note 4: Lønnskostnader, antall ansatte, godtgjørelser, revisjonskostnader mm.</h4>
Selskapet har i ${em( S.selectedYear ) } ikke hatt noen ansatte og er således ikke pliktig til å ha tjenestepensjon for de ansatte etter Lov om obligatoriske tjenestepensjon. Det er ikke utdelt styrehonorar.
<br><br>
Kostnadsført revisjonshonorar for ${em( S.selectedYear ) } utgjør kr ${em( auditorCost_main ) }. Honorar for annen bistand fra revisor utgjør kr ${em( auditorCost_other ) }.



<h4>Note 6: Bankinnskudd</h4>
Posten inneholder kun frie midler.

<h4>Note 7: Gjeld til nærstående, ledelse og styre</h4>
Selskapet har gjeld til følgende nærstående personer: <br>

${shareholders.map( shareholder => d(em(`${shareholder[0]}: [TBD] <br>`))).join('')}

`}


let taxNote = (S, A, eventEntity) => {

  let accounts = S.selectedCompany["acc/accounts"]




  return `
<h4>Note 5: Skatt</h4>
Beregning betalbar skatt: 
<br>
${d([
  d([ d(""), d(""), d( eventEntity["date"].substr(0, 4) , {class: "numberCell"} ), d( String( Number( eventEntity["date"].substr(0, 4) - 1) ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} ),
  d([ d("Resultat før skatt"), d(""), d( em( format.amount( 0 )  ), {class: "numberCell"} ), d( em( format.amount( 0 )  ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} ),
  d([ d("Permanente forskjeller "), d(""), d( em( format.amount( 0 )  ), {class: "numberCell"} ), d( em( format.amount( 0 )  ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} ),
  d([ d("Endring midlertidige forskjeller"), d(""), d( em( format.amount( 0 )  ), {class: "numberCell"} ), d( em( format.amount( 0 )  ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} ),
  d([ d("Benyttet fremførbart underskudd"), d(""), d( em( format.amount( 0 )  ), {class: "numberCell"} ), d( em( format.amount( 0 )  ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} ),
  d([ d("Årets skattegrunnlag"), d(""), d( em( format.amount( 0 )  ), {class: "numberCell"} ), d( em( format.amount( 0 )  ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} ),
  d([ d("Betalbar skatt (22%)"), d(""), d( em( format.amount( 0 )  ), {class: "numberCell"} ), d( em( format.amount( 0 )  ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} ),
])}
<br><br>
Beregning utsatt skatt:
<br>
${d([
  d([ d(""), d(""), d( eventEntity["date"].substr(0, 4) , {class: "numberCell"} ), d( String( Number( eventEntity["date"].substr(0, 4) - 1) ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} ),
  d([ d("Sum skatteøkende forskjeller"), d(""), d( em( format.amount( 0 )  ), {class: "numberCell"} ), d( em( format.amount( 0 )  ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} ),
  d([ d("Sum skattereduserende forskjeller"), d(""), d( em( format.amount( 0 )  ), {class: "numberCell"} ), d( em( format.amount( 0 )  ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} ),
  d([ d("Forskjeller som ikke inngår i beregningen"), d(""), d( em( format.amount( 0 )  ), {class: "numberCell"} ), d( em( format.amount( 0 )  ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} )
])}
<br><br>
Skattekostnad: 
<br>
${d([
  d([ d(""), d(""), d( eventEntity["date"].substr(0, 4) , {class: "numberCell"} ), d( String( Number( eventEntity["date"].substr(0, 4) - 1) ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} ),
  d([ d("Resultat før skatt"), d(""), d( em( format.amount( 0 )  ), {class: "numberCell"} ), d( em( format.amount( 0 )  ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} ),
  d([ d("Permanente forskjeller "), d(""), d( em( format.amount( 0 )  ), {class: "numberCell"} ), d( em( format.amount( 0 )  ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} ),
  d([ d("Estimatavvik"), d(""), d( em( format.amount( 0 )  ), {class: "numberCell"} ), d( em( format.amount( 0 )  ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} ),
  d([ d("Grunnlag skattekostnad"), d(""), d( em( format.amount( 0 )  ), {class: "numberCell"} ), d( em( format.amount( 0 )  ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} ),
  d([ d("Skattekostnad (22%)"), d(""), d( em( format.amount( 0 )  ), {class: "numberCell"} ), d( em( format.amount( 0 )  ), {class: "numberCell"} )  ], {class: "financialStatementsRow"} )
])}
<br><br>
`}


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

  let orgnumbers = S.Companies.map( C => C["company/orgnumber"] )
  let years = S.selectedCompany["h/Events"].map( e => e.date.substr(0, 4) ).filter( filterUniqueValues ).sort().reverse()
  let pageLabels = ["Hendelser", "Bank", "Aksjonærer", "Admin"]
  let pageNames = ["overview", "bankImport", "shareholders", "admin"]

  return d([
    menuRow(
      S.Companies.map( C => C["company/name"] ), 
      orgnumbers.indexOf( S.selectedCompany["company/orgnumber"] ),
      orgnumbers.map( orgnumber => e => {
        let selectedOrgnumber = orgnumber
        let selectedYear = S.Companies.filter( C => C["company/orgnumber"] === S.selectedOrgnumber)[0]["h/Events"][0]["date"].slice(0,4)
        let patch = mergerino({selectedOrgnumber, selectedYear})
        A.patch(  patch )
      }  )
    ),
    menuRow(
      years, 
      years.indexOf( String(S.selectedYear) ),
      years.map( year => e => A.patch({selectedYear: year}) )
    ),
    menuRow(
      pageLabels, 
      pageNames.indexOf( S.currentPage ),
      pageNames.map( pageName => e => A.patch({currentPage: pageName}) )
    ),
    d( "Legg til fri postering", {class: "textButton"}, "click", e => A.submitDatoms( templateDatoms.complexTransaction(S) ) )
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

let shareholdersPage = (S, A) => d( "TBD" )

