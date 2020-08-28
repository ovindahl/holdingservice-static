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

let timeline = (S, A) => S.selectedCompany["h/Events"].filter( Event => Event["process/identifier"] !== "yearEnd_2020" ).filter( Event => Event.date.substr(0,4) === S.selectedYear ).map( Event => feedItemContainer( Event, eventTypeController[ Event["process/identifier"] ](S, A, Event)  ) ).join('')

let eventTypeController = {
  "incorporation": (S, A, eventEntity) => feedItem_incorporation(S, A, eventEntity),
  "simpleTransaction": (S, A, eventEntity) => feedItem_simpleTransaction(S, A, eventEntity),
  "complexTransaction": (S, A, eventEntity) => feedItem_complexTransaction(S, A, eventEntity)
}

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
        d( Accounts[ account ]["label"] ), 
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

  let orgnumbers = S.Companies.map( C => C["company/orgnumber"] )
  let years = Object.keys( S.selectedCompany["acc/financialYears"] )
  let pageLabels = ["Hendelser", "Årsavslutning", "Bank",  "Admin"]
  let pageNames = ["overview", "yearEnd", "bankImport", "admin"]

  return d([
    menuRow(
      S.Companies.map( C => C["company/name"] ), 
      orgnumbers.indexOf( S.selectedCompany["company/orgnumber"] ),
      orgnumbers.map( orgnumber => e => {
        let selectedOrgnumber = orgnumber
        let selectedYear = Object.keys( S.Companies.filter( C => C["company/orgnumber"] === selectedOrgnumber)[0]["acc/financialYears"])[0]
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
    (S.currentPage === "overview") ? d( "Legg til fri postering", {class: "textButton"}, "click", e => A.submitDatoms( templateDatoms.complexTransaction(S) ) ) : ""
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
