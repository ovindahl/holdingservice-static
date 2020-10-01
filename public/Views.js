//ATTRS

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



//HTML element generation
let IDcounter = [0];
let getNewElementID = () => String( IDcounter.push( IDcounter.length  ) )
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
let h3 = (content, attributesObject)  => htmlElementObject("h3", attributesObject , content)
let input = (attributesObject, eventType, action) => htmlElementObject("input", attributesObject, "", eventType, action)

let dropdown = (value, optionObjects, updateFunction) => htmlElementObject("select", {id: getNewElementID(), style:"padding: 1em; border: 1px solid lightgray"}, optionObjects.map( o => `<option value="${o.value}" ${o.value === value ? `selected="selected"` : ""}>${o.label}</option>` ).join(''), "change", updateFunction  )

let retractEventButton = (entityID, A) => d("Slett hendelse", {class: "textButton"}, "click", e => A.retractEvent(entityID) )

//Page frame

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

let companySelectionMenuRow = (S, A) => d([
  d( S.Events.filter( E => E["event/incorporation/orgnumber"] ).map( E => E["event/incorporation/orgnumber"] ).filter( filterUniqueValues ).map( orgnumber => d( orgnumber, {class: orgnumber === S.selectedOrgnumber ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {selectedOrgnumber : orgnumber} ) )  ).concat(d( "+", {class: "textButton"}, "click", e => console.log("TBD...") )), {style: "display:flex;"}),
]) 
let pageSelectionMenuRow = (S, A) => d( ["timeline", "companyDoc", "admin/eventAttributes", "admin/eventTypes", "admin/eventValidators"].map( pageName => d( pageName, {class: pageName === S.currentPage ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {currentPage : pageName} ) )  ), {style: "display:flex;"})

let generateHTMLBody = (S, A) => [
  headerBarView(S),
  companySelectionMenuRow(S, A),
  pageSelectionMenuRow(S, A),
  pageRouter[ S.currentPage ]( S, A )  
]

let pageRouter = {
  "timeline": (S, A) => timelineView(S, S.companyDoc, A),
  "companyDoc": (S, A) => companyDocPage( S.companyDoc ),
  "admin/eventAttributes": (S, A) => attributesPage( S, A ),
  "admin/eventTypes": (S, A) => eventTypesPage( S, A ),
  "admin/eventValidators": (S, A) => eventValidatorsPage( S, A )
}

//Event Cycle Views

let timelineView = (S, companyDoc, A) => d([
  d( S.appliedEvents.map( Event => feedContainer(  appliedEventView( S, Event, A ) , Event["event/date"], Event["entity"] )  ), {class: "pageContainer"}),
  d( S.rejectedEvents.map( Event => feedContainer(  rejectedEventView( S, Event, A ) , Event["event/date"], Event["entity"] )  ), {class: "pageContainer"})
])

let appliedEventView = (S, Event , A) => d([
    h3( S.eventTypes[ Event["event/eventType"] ]["eventType/label"], {style: `background-color: #1073104f; padding: 1em;`} ),
    attributesTableView(S, Event, A),
    retractEventButton( Event["entity"], A),
    newEventDropdown(S, A, Event)
])

let rejectedEventView = (S, Event , A) => d([
  h3( S.eventTypes[ Event["event/eventType"] ]["eventType/label"], {style: `background-color: #fb9e9e; padding: 1em;`} ),
  d([
    h3("Attributter"),
    d( S["eventTypes"][ Event["event/eventType"] ]["eventType/attributes"].map( attribute =>  d([attributeView(S, A, attribute, Event[ attribute ], Event["entity"] )], Event["event/:invalidAttributes"] ? Event["event/:invalidAttributes"].includes(attribute) ?  {style: `background-color: #fb9e9e;`} : {} : {} )  ) 
    ),
    d("<br>")
  ], {style: "background-color: #f1f0f0; padding: 1em;"}),
  d("<br>"),
  Event["event/:eventErrors"] ? d( Event["event/:eventErrors"].map( error => d(error, {style: "background-color: lightgray; color: red; padding: 3px; margin: 3px;"})  )) : d(""),
  d("<br>"),
  retractEventButton( Event["entity"], A),
  newEventDropdown(S, A, Event)
])

let attributesTableView = (S, appliedEvent, A) => d([
  h3("Attributter"),
  d( S["eventTypes"][ appliedEvent["event/eventType"] ]["eventType/attributes"].map( attribute =>  attributeView(S, A, attribute, appliedEvent[ attribute ], appliedEvent["entity"] ) ) 
  ),
  d("<br>")
], {style: "background-color: #f1f0f0; padding: 1em;"})

let companyDocViews = {
  "company/:accountBalance": (accountBalance) =>  d( Object.keys( accountBalance ).map( account => d(`${account}: ${accountBalance[account]}`) ) )
}

let companyDocPage = (companyDoc) => d( Object.keys(companyDoc).map( key =>  feedContainer( variableView(companyDoc, key) , "na." , "na." )), {class: "pageContainer"} )

let attributesPage = ( S, A ) => d([
  d([
    d("entity"),
    d("attr/name"),
    d("attr/label"),
    d("attr/valueType"),
    d("attr/doc")
  ], {class: "attributeRow", style: "background-color: gray;"} ),
  d( Object.values(S.eventAttributes).map( attribute => d([
    d(String(attribute["entity"])),
    d(attribute["attr/name"]),
    input({value: attribute["attr/label"]}, "change", e => A.updateEntityAttribute( attribute.entity, "attr/label", e.srcElement.value ) ),
    attribute["attr/valueType"] ? d(attribute["attr/valueType"]) : input({value: "string/number"}, "change", e => A.updateEntityAttribute( attribute.entity, "attr/valueType", e.srcElement.value ) ) ,
    input({value: attribute["attr/doc"]}, "change", e => A.updateEntityAttribute( attribute.entity, "attr/doc", e.srcElement.value ) )
  ], {class: "attributeRow"} ) ) ),
  d([
    d("Opprett ny"),
    input({value: "event/nyAttributt" }, "change", e => A.createAttribute( e.srcElement.value ) )
  ], {class: "attributeRow"} ),
]) 

let eventTypesPage = ( S, A ) => d([
  d([
    d("entity"),
    d("name, label, doc"),
    d("eventType/attributes"),
    d("eventType/eventValidators"),
  ], {class: "eventTypeRow", style: "background-color: gray;"} ),
  d( Object.values(S.eventTypes).map( eventType => d([
    d(String(eventType["entity"])),
    d([
      input({value: eventType["eventType/name"]}, "change", e => A.updateEntityAttribute( eventType.entity, "eventType/name", e.srcElement.value ) ),
      input({value: eventType["eventType/label"]}, "change", e => A.updateEntityAttribute( eventType.entity, "eventType/label", e.srcElement.value ) ),
      input({value: eventType["eventType/doc"]}, "change", e => A.updateEntityAttribute( eventType.entity, "eventType/doc", e.srcElement.value ) )
    ], {style: "display: grid;"}),
    d( eventType["eventType/attributes"].map( attribute => d([span(
      S.eventAttributes[attribute]["attr/label"] + "[X]", 
      S.eventAttributes[attribute]["attr/doc"])], 
      {class: "textButton_narrow"}, 
      "click", 
      e => A.updateEntityAttribute( eventType.entity, "eventType/attributes", eventType["eventType/attributes"].filter( attr => attr !== attribute )  ) 
      ) 
    ).concat( dropdown(
      0, 
      Object.values(S.eventAttributes).filter( eventAttribute => !eventType["eventType/attributes"].includes( eventAttribute["attr/name"] )  ).map( eventAttribute => returnObject({value: eventAttribute["attr/name"], label: eventAttribute["attr/label"]})).concat({value: 0, label: "Legg til"}), 
      e => A.updateEntityAttribute( eventType.entity, "eventType/attributes", eventType["eventType/attributes"].concat( e.srcElement.value )  )   
      )  ) 
    ),
    d( eventType["eventType/eventValidators"].map( validatorName => d([span(
      S.eventValidators[validatorName]["eventValidator/label"] + "[X]", 
      S.eventValidators[validatorName]["eventValidator/doc"])], 
      {class: "textButton_narrow"}, 
      "click", 
      e => A.updateEntityAttribute( eventType.entity, "eventType/eventValidators", eventType["eventType/eventValidators"].filter( validator => validator !== validatorName )  ) 
      ) 
    ).concat( dropdown(
      0, 
      Object.values(S.eventValidators).filter( eventValidator => !eventType["eventType/eventValidators"].includes( eventValidator["eventValidator/name"] )  ).map( eventValidator => returnObject({value: eventValidator["eventValidator/name"], label: eventValidator["eventValidator/label"]})).concat({value: 0, label: "Legg til"}), 
      e => A.updateEntityAttribute( eventType.entity, "eventType/eventValidators", eventType["eventType/eventValidators"].concat( e.srcElement.value )  )   
      )  ) 
    ),
  ], {class: "eventTypeRow"} ) ) ),
  d([
    d("Opprett ny"),
    input({value: "eventType/[newEventType]" }, "change", e => A.createEventType( e.srcElement.value ) )
  ], {class: "eventTypeRow"} ),
]) 

let eventValidatorsPage = ( S, A ) => d([
  d([
    d("entity"),
    d("eventValidator/name"),
    d("eventValidator/label"),
    d("eventValidator/errorMessage"),
    d("eventValidator/doc")
  ], {class: "attributeRow", style: "background-color: gray;"} ),
  d( Object.values(S.eventValidators).map( eventValidator => d([
    d(String(eventValidator["entity"])),
    input({value: eventValidator["eventValidator/name"]}, "change", e => A.updateEntityAttribute( eventValidator.entity, "eventValidator/name", e.srcElement.value ) ),
    input({value: eventValidator["eventValidator/label"]}, "change", e => A.updateEntityAttribute( eventValidator.entity, "eventValidator/label", e.srcElement.value ) ),
    input({value: eventValidator["eventValidator/errorMessage"]}, "change", e => A.updateEntityAttribute( eventValidator.entity, "eventValidator/errorMessage", e.srcElement.value ) ),
    input({value: eventValidator["eventValidator/doc"]}, "change", e => A.updateEntityAttribute( eventValidator.entity, "eventValidator/doc", e.srcElement.value ) ),
  ], {class: "attributeRow"} ) ) ),
  d([
    d("Opprett ny"),
    input({value: "eventValidator/[name]" }, "change", e => A.createEventValidator( e.srcElement.value ) )
  ], {class: "attributeRow"} ),
]) 

let variableView = (companyDoc, key) => d([
  h3(key),
  Object.keys(companyDocViews).includes(key) ? companyDocViews[key]( companyDoc[key] ) : d( JSON.stringify(companyDoc[key]) , {class: "eventInspectorRow"})
])



//Tailor-made complex views

let recordsView = (S, A, attribute, value, entityID) => d([
  span(S.eventAttributes[attribute]["attr/label"], S.eventAttributes[attribute]["attr/doc"] ),
  d( Object.keys(value).map( account => d([
    dropdown(account, Object.keys(S.Accounts).map( accountNumber => returnObject({value: accountNumber, label: `${accountNumber}: ${S.Accounts[ accountNumber ].label}` })), 
      e => A.updateEntityAttribute( 
        entityID, 
        attribute, 
        mergerino(
          value, 
          createObject( account, undefined ),
          createObject( e.srcElement.value, value[ account ]  ) ) 
      ) 
    ),
    input({value: value[account], style: `text-align: right;`}, "change", e => A.updateEntityAttribute( 
      entityID, 
      attribute, 
      mergerino(
        value,
        createObject( account , Number( e.srcElement.value ) ) ) 
    ) ),
    d("X", {class: "textButton"}, "click", e => A.updateEntityAttribute( 
      entityID, 
      attribute, 
      mergerino(
        value,
        createObject( account , undefined ) ) 
    ) )
    ], {class: "recordRow"}),
  ) ),
  dropdown(
    0, 
    Object.keys(S.Accounts).map( accountNumber => returnObject({value: accountNumber, label: `${accountNumber}: ${S.Accounts[ accountNumber ].label}` })).concat({value: 0, label: "Legg til konto"}), 
    e => A.updateEntityAttribute( entityID, attribute, mergerino( value, createObject( e.srcElement.value , 0 ) ) ),
  )
], {style: "border: solid 1px black;"})

let foundersView = (S, A, attribute, value, entityID) => d([
  span(S.eventAttributes[attribute]["attr/label"], S.eventAttributes[attribute]["attr/doc"] ),
  d([d("AksjonærID"), d("Antall aksjer"), d("Pris per aksje")], {class: "shareholderRow"}),
  d( Object.values( value).map( shareholder => d([
    input({value: shareholder["shareholder"], style: `text-align: right;`}, "change", e => A.updateEntityAttribute( 
      entityID, 
      attribute, 
      mergerino(
        value,
        createObject( shareholder["shareholder"], undefined ),
        createObject( e.srcElement.value, mergerino(
          value[shareholder["shareholder"]],
          createObject( "shareholder" , e.srcElement.value ),
          )
        )
    ) )),
    input({value: shareholder["shareCount"], style: `text-align: right;`}, "change", e => A.updateEntityAttribute( 
      entityID, 
      attribute, 
      mergerino(
        value,
        createObject( shareholder["shareholder"] , createObject("shareCount", Number( e.srcElement.value ) ) ),
    ) )),
    input({value: shareholder["sharePrice"], style: `text-align: right;`}, "change", e => A.updateEntityAttribute( 
      entityID, 
      attribute, 
      mergerino(
        value,
        createObject( shareholder["shareholder"] , createObject("sharePrice", Number( e.srcElement.value ) ) ),
    ) )),
    d("X", {class: "textButton"}, "click", e => A.updateEntityAttribute( 
      entityID, 
      attribute, 
      mergerino(
        value,
        createObject( shareholder["shareholder"] , undefined ) ) 
    ) )
    ], {class: "shareholderRow"}),
  ) ),
  d("Legg til stifter", {class: "textButton"}, "click", e => A.updateEntityAttribute( 
    entityID, 
    attribute, 
    mergerino(
      value,
      createObject( "[AksjonærID]" , {shareholder: "[AksjonærID]", shareCount: 0, sharePrice: 0} ),
  ) ) )
], {style: "border: solid 1px black;"})


let span = (text, tooltip, attributesObject, eventType, action) => htmlElementObject("span", mergerino({"title": tooltip}, attributesObject), text, eventType, action)

let attributeView = (S, A, attribute, value, entityID) => Object.keys(specialAttributeViews).includes(attribute) ? specialAttributeViews[ attribute ](S, A, attribute, value, entityID) : genericAttributeView( S, attribute, value, e => A.updateEntityAttribute( entityID, attribute, S.eventAttributes[attribute]["attr/valueType"] === "number" ? Number(e.srcElement.value) : e.srcElement.value) )

let genericAttributeView = (S, attribute, value, onChange) => d([
  d([
    span(S.eventAttributes[attribute]["attr/label"], S.eventAttributes[attribute]["attr/doc"] ),
    input({value: value, style: `text-align: right;`}, "change", onChange ),
    ], {class: "eventInspectorRow"}),
])

let newEventDropdown = (S, A, Event) => dropdown( "", 
  Object.keys(S.eventTypes).map( newEventType => returnObject({value: newEventType, label: S.eventTypes[newEventType]["eventType/label"] }) ).concat({value: "", label: "Legg til hendelse etter denne"}),
  e => A.createEvent(Event, e.srcElement.value )
)
  
let specialAttributeViews = {
  "event/account": (S, A, attribute, value, entityID) => d([
    d(`event/account`),
    dropdown(value, Object.keys(S.Accounts).map( accountNumber => returnObject({value: accountNumber, label: `${accountNumber}: ${S.Accounts[ accountNumber ].label}` })).concat({value: "", label: "Ingen konto valgt."}), e => A.updateEntityAttribute( entityID, attribute, e.srcElement.value) ),
    ], {class: "eventInspectorRow"}),
  "transaction/records": recordsView,
  "event/incorporation/shareholders": foundersView
}




//Archive

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


//var func = new Function("prevCompany, Event", "return prevCompany['company/shareholders'];" )
//var func2 = new Function("prevCompany, Event", "console.log(prevCompany['company/shareholders']) ;" )

