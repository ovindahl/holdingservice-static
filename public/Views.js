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
let span = (text, tooltip, attributesObject, eventType, action) => htmlElementObject("span", mergerino({"title": tooltip}, attributesObject), text, eventType, action)

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
let pageSelectionMenuRow = (S, A) => d( ["timeline", "companyDoc", "admin/eventAttributes", "admin/eventTypes", "admin/eventValidators", "admin/eventFields", "admin/companyFields"].map( pageName => d( pageName, {class: pageName === S.currentPage ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {currentPage : pageName} ) )  ), {style: "display:flex;"})

let generateHTMLBody = (S, A) => [
  headerBarView(S),
  companySelectionMenuRow(S, A),
  pageSelectionMenuRow(S, A),
  pageRouter[ S.currentPage ]( S, A )  
]

let pageRouter = {
  "timeline": (S, A) => timelineView(S, A),
  "companyDoc": (S, A) => companyDocPage( S, A ),
  "admin/eventAttributes": (S, A) => attributesPage( S, A ),
  "admin/eventTypes": (S, A) => eventTypesPage( S, A ),
  "admin/eventFields": (S, A) => eventFieldsPage( S, A ),
  "admin/companyFields": (S, A) => companyFieldsPage( S, A ),
  "admin/eventValidators": (S, A) => eventValidatorsPage( S, A )
}

//Event Cycle Views

let timelineView = (S, A) => d([
  d( S.appliedEvents.map( Event => feedContainer(  appliedEventView( S, Event, A ) , Event["event/date"], Event["entity"] )  ), {class: "pageContainer"}),
  d( S.rejectedEvents.map( Event => feedContainer(  rejectedEventView( S, Event, A ) , Event["event/date"], Event["entity"] )  ), {class: "pageContainer"})
])

let appliedEventView = (S, Event , A) => d([
    h3( S["E"][ Event["event/eventTypeEntity"] ]["entity/label"], {style: `background-color: #1073104f; padding: 1em;`} ),
    attributesTableView(S, Event, A),
    d("<br>"),
    historicalCompanyFieldsView(S, Event),
    d("<br>"),
    eventFieldsTableView(S, Event),
    d("<br>"),
    retractEventButton( Event["entity"], A),
    newEventDropdown(S, A, Event)
])

let rejectedEventView = (S, Event , A) => d([
  h3( S["E"][ Event["event/eventTypeEntity"] ]["entity/label"], {style: `background-color: #fb9e9e; padding: 1em;`} ),
  d([
    h3("Attributter"),
    d( S["E"][ Event["event/eventTypeEntity"] ]["eventType/attributes"].map( attribute =>  d([attributeView(S, A, attribute, Event[ attribute ], Event["entity"] )], Event["event/:invalidAttributes"] ? Event["event/:invalidAttributes"].includes(attribute) ?  {style: `background-color: #fb9e9e;`} : {} : {} )  ) 
    ),
    d("<br>")
  ], {style: "background-color: #f1f0f0; padding: 1em;"}),
  d("<br>"),
  Event["event/:eventErrors"] ? d( Event["event/:eventErrors"].map( error => d(error, {style: "background-color: lightgray; color: red; padding: 3px; margin: 3px;"})  )) : d(""),
  d("<br>"),
  retractEventButton( Event["entity"], A),
  newEventDropdown(S, A, Event)
])

let historicalCompanyFieldsView = (S, Event) => d([
  h3("Benyttede historiske verdier"),
  d( S["E"][ Event["event/eventTypeEntity"] ]["eventType/requiredCompanyFields"].map( entityID =>  d(`${S["E"][entityID]["companyField/label"]}: ${JSON.stringify(Event[entityID])}`) ) 
  ),
], {style: "background-color: #f1f0f0; padding: 1em;"})

let eventFieldsTableView = (S, Event) => d([
  h3("eventFields"),
  d( S["E"][ Event["event/eventTypeEntity"] ]["eventType/eventFields"].map( entityID =>  d(`${S["E"][entityID]["eventField/label"]}: ${JSON.stringify(Event[entityID])}`) ) 
  ),
], {style: "background-color: #f1f0f0; padding: 1em;"})

let attributesTableView = (S, Event, A) => d([
  h3("Attributter"),
  d( S["E"][ Event["event/eventTypeEntity"] ]["eventType/attributes"].map( attribute =>  attributeView(S, A, attribute, Event[ attribute ], Event["entity"] ) ) 
  ),
  d("<br>")
], {style: "background-color: #f1f0f0; padding: 1em;"})

let attributeView = (S, A, attribute, value, entityID) => Object.keys(specialAttributeViews).includes(attribute) ? specialAttributeViews[ attribute ](S, A, attribute, value, entityID) : genericAttributeView( S, attribute, value, e => A.updateEntityAttribute( entityID, attribute, S.eventAttributes[attribute]["attr/valueType"] === "number" ? Number(e.srcElement.value) : e.srcElement.value) )


let genericAttributeView = (S, attribute, value, onChange) => d([
  d([
    span( attribute , attribute ),
    input({value: value, style: `text-align: right;`}, "change", onChange ),
    ], {class: "eventInspectorRow"}),
])

let entitySpan = (S, id) => span( S["E"][id]["entity/label"], S["E"][id]["entity/doc"] )

let slider = (value, min, max, onChange) => input({type: "range", min, max, value}, "change", onChange )

let companyDocPage = (S, A) => d([
  input({value: S["companyDocPage/selectedVersion"], disabled: "disabled"}, "change", e => A.updateLocalState({"companyDocPage/selectedVersion": e.srcElement.value})),
  d([
    d("<", {class: "textButton"}, "click", e => A.updateLocalState({"companyDocPage/selectedVersion": Math.max(0, S["companyDocPage/selectedVersion"] - 1 )  })),
    d(">", {class: "textButton"}, "click", e => A.updateLocalState({"companyDocPage/selectedVersion": Math.min(S["companyDocVersions"].length - 1, S["companyDocPage/selectedVersion"] + 1 ) })),
  ], {class: "shareholderRow"}),
  d([
    h3(`Hendelsesrapport for hendelse ${S["companyDocPage/selectedVersion"]}`),
    d( S["companyDocPage/selectedVersion"] >= 1 ? `${ S["eventTypes"][ logThis(S["appliedEvents"][ S["companyDocPage/selectedVersion"] - 1 ])["event/eventType"] ]["eventType/label"]  }` : "" ),
    S["companyDocPage/selectedVersion"] >= 1 
      ? d( Object.entries(S["appliedEvents"][ S["companyDocPage/selectedVersion"] - 1 ] ).filter( entry => entry[0].startsWith( "eventField/:" )  ).map( entry => d([
        d( `${ S["eventFields"][ entry[0] ]["eventField/label"] }`  ),
        d( `${ JSON.stringify(entry[1]) }`  )
        ], {class: "shareholderRow"})  ) ) 
      : d(""),
  ], {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
  d("<br>"),
  d([
    h3(`Selskapets saldobalanse etter hendelse ${S["companyDocPage/selectedVersion"]}`),
    accountBalanceView(S, S["companyDocVersions"][ S["companyDocPage/selectedVersion"] ]["companyField/:accountBalance"]),
  ], {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
] , {class: "pageContainer"} )

let accountBalanceView = (S, accountBalance) => d( Object.entries( accountBalance ).map( entry => d([
  d( `[${ entry[0] }] ${ S.Accounts[ entry[0] ].label }`  ),
  d( `${entry[1] }`,  {style: Object.keys( S["appliedEvents"][ S["companyDocPage/selectedVersion"] - 1 ]["eventField/:accountBalance"] ).includes( entry[0] ) ? "color: red;" : ""} )
], {class: "shareholderRow"}) ) )

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
    d("Label, doc"),
    d("eventType/attributes"),
    d("eventType/requiredCompanyFields"),
    d("eventType/eventValidators"),
    d("eventType/eventFields"),
  ], {class: "eventTypeRow", style: "background-color: gray;"} ),
  d( S.eventTypes.map( eventType => d([
    d(String(eventType["entity"])),
    d([
      input({value: eventType["entity/label"]}, "change", e => A.updateEntityAttribute( eventType.entity, "entity/label", e.srcElement.value ) ),
      input({value: eventType["entity/doc"]}, "change", e => A.updateEntityAttribute( eventType.entity, "entity/doc", e.srcElement.value ) )
    ], {style: "display: grid;"}),
    d( eventType["eventType/eventAttributes"].map( attributeID => d([
      entitySpan(S, attributeID)
      ],
      {class: "textButton_narrow"}, 
      "click", 
      e => A.updateEntityAttribute( eventType.entity, "eventType/eventAttributes", eventType["eventType/eventAttributes"].filter( attr => attr !== attributeID )  ) 
      ) 
    ).concat( dropdown(
      0,
      S.eventAttributes.filter( eventAttribute => !eventType["eventType/eventAttributes"].includes( eventAttribute["entity"] )  ).map( eventAttribute => returnObject({value: eventAttribute["entity"], label: eventAttribute["entity/label"]})).concat({value: 0, label: "Legg til"}), 
      e => A.updateEntityAttribute( eventType.entity, "eventType/eventAttributes", eventType["eventType/eventAttributes"].concat( Number(e.srcElement.value) )  )   
      )  ) 
    ),
    d( eventType["eventType/requiredCompanyFields"].map( entityID => d([
      entitySpan(S, entityID),
      ],
      {class: "textButton_narrow"}, 
      "click", 
      e => A.updateEntityAttribute( eventType.entity, "eventType/requiredCompanyFields", eventType["eventType/requiredCompanyFields"].filter( companyField => companyField !== entityID )  ) 
      ) 
    ).concat( dropdown(
      0, 
      S.companyFields.filter( companyField => !eventType["eventType/requiredCompanyFields"].includes( companyField["entity"] )  ).map( companyField => returnObject({value: companyField["entity"], label: companyField["entity/label"]})).concat({value: 0, label: "Legg til"}), 
      e => A.updateEntityAttribute( eventType.entity, "eventType/requiredCompanyFields", eventType["eventType/requiredCompanyFields"].concat( Number(e.srcElement.value) )  )   
      )  ) 
    ),
    d( eventType["eventType/eventValidators"].map( entityID => d([
      entitySpan(S, entityID)
      ], 
      {class: "textButton_narrow"}, 
      "click", 
      e => A.updateEntityAttribute( eventType.entity, "eventType/eventValidators", eventType["eventType/eventValidators"].filter( validator => validator !== entityID )  ) 
      ) 
    ).concat( dropdown(
      0, 
      S.eventValidators.filter( eventValidator => !eventType["eventType/eventValidators"].includes( eventValidator["entity"] )  ).map( eventValidator => returnObject({value: eventValidator["entity"], label: eventValidator["entity/label"]})).concat({value: 0, label: "Legg til"}), 
      e => A.updateEntityAttribute( eventType.entity, "eventType/eventValidators", eventType["eventType/eventValidators"].concat( Number(e.srcElement.value) )  )   
      )  ) 
    ),
    d( eventType["eventType/eventFields"].map( entityID => d([
      entitySpan(S, entityID),
      ], 
      {class: "textButton_narrow"}, 
      "click", 
      e => A.updateEntityAttribute( eventType.entity, "eventType/eventFields", eventType["eventType/eventFields"].filter( f => f !== entityID )  ) 
      ) 
    ).concat( dropdown(
      0, 
      S.eventFields.filter( eventField => !eventType["eventType/eventFields"].includes( eventField["entity"] )  ).map( eventField => returnObject({value: eventField["entity"], label: eventField["entity/label"]})).concat({value: 0, label: "Legg til"}), 
      e => A.updateEntityAttribute( eventType.entity, "eventType/eventFields", eventType["eventType/eventFields"].concat( Number(e.srcElement.value) )  )   
      )  ) 
    ),
  ], {class: "eventTypeRow"} ) ) ),
  d([
    d("Opprett ny"),
    input({value: "eventType/[newEventType]" }, "change", e => A.createEventType( e.srcElement.value ) )
  ], {class: "eventTypeRow"} ),
]) 



let entityAdminPage = ( S, A, entityType ) => d([
  Object.values(S[ entityType ]).map( entity => d([
    d(JSON.stringify(entity))
  ]), {class: "attributeRow"} )
])

let eventValidatorsPage = ( S, A ) => d([
  d([
    d("entity"),
    d("entity/label"),
    d("eventValidator/doc"),
    d("eventValidator/errorMessage"),
  ], {class: "attributeRow", style: "background-color: gray;"} ),
  d( Object.values(S.eventValidators).map( eventValidator => d([
    d(String(eventValidator["entity"])),
    input({value: eventValidator["entity/label"]}, "change", e => A.updateEntityAttribute( eventValidator.entity, "entity/label", e.srcElement.value ) ),
    input({value: eventValidator["entity/doc"]}, "change", e => A.updateEntityAttribute( eventValidator.entity, "entity/doc", e.srcElement.value ) ),
    input({value: eventValidator["eventValidator/errorMessage"]}, "change", e => A.updateEntityAttribute( eventValidator.entity, "eventValidator/errorMessage", e.srcElement.value ) ),
  ], {class: "attributeRow"} ) ) ),
  d([
    d("Opprett ny"),
    input({value: "eventValidator/label" }, "change", e => A.createEventValidator( e.srcElement.value ) )
  ], {class: "attributeRow"} ),
]) 
/* 
let eventFieldsPage = ( S, A ) => d([
  d([
    d("entity"),
    d("entity/label"),
    d("entity/doc")
  ], {class: "attributeRow", style: "background-color: gray;"} ),
  d( Object.values(S.eventFields).map( eventField => d([
    d(String(eventField["entity"])),
    input({value: eventField["entity/label"]}, "change", e => A.updateEntityAttribute( eventField.entity, "entity/label", e.srcElement.value ) ),
    input({value: eventField["entity/doc"]}, "change", e => A.updateEntityAttribute( eventField.entity, "entity/doc", e.srcElement.value ) ),
  ], {class: "attributeRow"} ) ) ),
  d([
    d("Opprett ny"),
    input({value: "eventField/label" }, "change", e => A.createEventField( e.srcElement.value ) )
  ], {class: "attributeRow"} ),
]) 

let companyFieldsPage = ( S, A ) => d([
  d([
    d("entity"),
    d("companyField/name"),
    d("entity/label"),
    d("companyField/errorMessage"),
    d("companyField/doc")
  ], {class: "attributeRow", style: "background-color: gray;"} ),
  d( Object.values(S.companyFields).map( companyField => d([
    d(String(companyField["entity"])),
    input({value: companyField["companyField/name"]}, "change", e => A.updateEntityAttribute( companyField.entity, "companyField/name", e.srcElement.value ) ),
    input({value: companyField["companyField/label"]}, "change", e => A.updateEntityAttribute( companyField.entity, "companyField/label", e.srcElement.value ) ),
    d( companyField["companyField/eventFields"].map( eventField => d([span(
      S.eventFields[eventField]["eventField/label"] + "[X]", 
      S.eventFields[eventField]["eventField/doc"])], 
      {class: "textButton_narrow"}, 
      "click", 
      e => A.updateEntityAttribute( companyField.entity, "companyField/eventFields", companyField["companyField/eventFields"].filter( f => f !== eventField )  ) 
      ) 
    ).concat( dropdown(
      0, 
      Object.values(S.eventFields).filter( eventField => !companyField["companyField/eventFields"].includes( eventField["eventField/name"] )  ).map( eventField => returnObject({value: eventField["eventField/name"], label: eventField["eventField/label"]})).concat({value: 0, label: "Legg til"}), 
      e => A.updateEntityAttribute( companyField.entity, "companyField/eventFields", companyField["companyField/eventFields"].concat( e.srcElement.value )  )   
      )  ) 
    ),
    input({value: companyField["companyField/doc"]}, "change", e => A.updateEntityAttribute( companyField.entity, "companyField/doc", e.srcElement.value ) ),
  ], {class: "attributeRow"} ) ) ),
  d([
    d("Opprett ny"),
    input({value: "companyField/[name]" }, "change", e => A.createCompanyField( e.srcElement.value ) )
  ], {class: "attributeRow"} ),
]) 
 */
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
  span(attribute, attribute ),
  d([d("AksjonærID"), d("Antall aksjer"), d("Pris per aksje")], {class: "shareholderRow"}),
  Object.keys(value).length === 0
  ? d("Ingen stiftere")
  : d( Object.values( value ).map( shareholder => d([
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




let newEventDropdown = (S, A, Event) => dropdown( "", 
  S.eventTypes.map( newEventType => returnObject({value: newEventType.entity, label: newEventType["entity/label"] }) ).concat({value: "", label: "Legg til hendelse etter denne"}),
  e => A.createEvent(Event, Number(e.srcElement.value) )
)
  
let specialAttributeViews = {
  "event/account": (S, A, attribute, value, entityID) => d([
    d(`event/account`),
    dropdown(value, Object.keys(S.Accounts).map( accountNumber => returnObject({value: accountNumber, label: `${accountNumber}: ${S.Accounts[ accountNumber ].label}` })).concat({value: "", label: "Ingen konto valgt."}), e => A.updateEntityAttribute( entityID, attribute, e.srcElement.value) ),
    ], {class: "eventInspectorRow"}),
  "transaction/records": recordsView,
  "event/incorporation/shareholders": foundersView
}
