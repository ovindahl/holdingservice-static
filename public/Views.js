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
let submitInputValue = e => {
  e.srcElement.disabled = true;
  return e.srcElement.value
}
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
  d([content], {class: "feedContainer"} ),
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
  "admin/eventAttributes": (S, A) => d( [attributesPage( S, A )], {class: "pageContainer"}),
  "admin/eventTypes": (S, A) => eventTypesPage( S, A ),
  "admin/eventFields": (S, A) => eventFieldsPage( S, A ),
  "admin/companyFields": (S, A) => companyFieldsPage( S, A ),
  "admin/eventValidators": (S, A) => eventValidatorsPage( S, A )
}

//Event Cycle Views

let timelineView = (S, A) => d([
  d( S.appliedEvents.map( Event => feedContainer(  eventView( S, Event, A ) , Event["event/date"], Event["entity"] )  ), {class: "pageContainer"}),
  d( S.rejectedEvents.map( Event => feedContainer(  eventView( S, Event, A ) , Event["event/date"], Event["entity"] )  ), {class: "pageContainer"})
])

let eventView = (S, Event , A) => d([
    d( [entitySpan(S, Event["event/eventTypeEntity"] )], {style: `background-color: ${Event["event/:invalidAttributes"] || Event["event/:eventErrors"] ? "#fb9e9e" : "#1073104f"}; padding: 1em;`} ),
    attributesTableView(S, Event, A),
    d("<br>"),
    d( Event["event/:eventErrors"] ? Event["event/:eventErrors"].map( error => d(error, {style: "background-color: lightgray; color: red; padding: 3px; margin: 3px;"})  )  : [d("")] ),
    retractEventButton( Event["entity"], A),
    newEventDropdown(S, A, Event)
])

let attributesTableView = (S, Event, A) => d([
  h3("Attributter"),
  d( S["E"][ Event["event/eventTypeEntity"] ]["eventType/eventAttributes"].map( attributeID =>  [3478, 3761].includes(attributeID) 
      ? specialAttributeViews[ attributeID ](S, A, attributeID, Event[ S["E"][attributeID]["attr/name"] ], Event["entity"] ) 
      : genericAttributeView( S, attributeID, Event[ S["E"][attributeID]["attr/name"] ], e => A.updateEntityAttribute( Event["entity"], S["E"][attributeID]["attr/name"], S["E"][attributeID]["attr/valueType"] === "number" ? Number(submitInputValue(e)) : submitInputValue(e)) )
      ) 
  )
], {style: "background-color: #f1f0f0; padding: 1em;"})

let genericAttributeView = (S, attributeID, value, onChange) => d([
    entitySpan(S, attributeID ),
    input({value: value, style: `text-align: right; ${ validateAttributeValue(S, attributeID, value ) ? "" : "background-color: #fb9e9e; " }`}, "change", onChange ),
    ], {class: "eventInspectorRow"})

let entitySpan = (S, id) => span( S["E"][id]["entity/label"], S["E"][id]["entity/doc"] )

let slider = (value, min, max, onChange) => input({type: "range", min, max, value}, "change", onChange )

let companyDocPage = (S, A) => d([
  input({value: S["companyDocPage/selectedVersion"], disabled: "disabled"}, "change", e => A.updateLocalState({"companyDocPage/selectedVersion": submitInputValue(e)})),
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

let attributesPage = ( S, A ) => {
  let selectedAttribute = S["E"][ S["attributesPage/selectedAttribute"] ]

  let attributeCategories = Object.values(S.eventAttributes).map( attribute => attribute["attribute/category"]).filter(filterUniqueValues)

  let visibleAttributes = Object.values(S.eventAttributes).filter( attribute => attribute["attribute/category"] === S["attributesPage/selectedAttributeCategory"] )

  return d([
    d( attributeCategories.map( category => d( (typeof category === "string") ? category : "Mangler kategori", {class: category === S["attributesPage/selectedAttributeCategory"] ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {"attributesPage/selectedAttributeCategory" : category} ) )).concat(d("Ny attributt", {class: "textButton"}, "click", e => A.createAttribute() )) ),
    d( visibleAttributes.map( attribute => d( attribute["entity/label"], {class: attribute.entity === S["attributesPage/selectedAttribute"] ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {"attributesPage/selectedAttribute" : attribute.entity} ) )) ),
    d([
      h3( `${selectedAttribute["attribute/category"]} /  ${selectedAttribute["entity/label"]}`  ),
      d([
        d("Attributtens entitetsID:"),
        d( String(selectedAttribute["entity"]) )
      ], {class: "eventAttributeRow"}),
      d([
        d("Systemnavn:"),
        d( selectedAttribute["attr/name"] )
      ], {class: "eventAttributeRow"}),
      d([
        d("Verditype:"),
        d( selectedAttribute["attr/valueType"] )
      ], {class: "eventAttributeRow"}),
      d([
        d("Attributtnavn:"),
        input({value: selectedAttribute["entity/label"]}, "change", e => A.updateEntityAttribute( selectedAttribute.entity, "entity/label", submitInputValue(e) ) )
      ], {class: "eventAttributeRow"}),
      d([
        d("Attributtkategori:"),
        input({value: selectedAttribute["attribute/category"]}, "change", e => A.updateEntityAttribute( selectedAttribute.entity, "attribute/category", submitInputValue(e) ) )
      ], {class: "eventAttributeRow"}),
      d([
        d("Beskrivelse:"),
        input({value: selectedAttribute["entity/doc"]}, "change", e => A.updateEntityAttribute( selectedAttribute.entity, "entity/doc", submitInputValue(e) ) )
      ], {class: "eventAttributeRow"}),
      d([
        d("Antall hendelser som bruker denne attributten:"),
        d( String( S["Events"].reduce( (sum, Event) => Object.keys(Event).includes( selectedAttribute["attr/name"] ) ? sum + 1 : sum, 0 ) ) )
      ], {class: "eventAttributeRow"}),
    ],{class: "feedContainer"}),
  ], {style: "display: flex;"})
} 

let eventTypesPage = ( S, A ) => d([
  d([
    d("entity"),
    d("Label, doc"),
    d("eventType/eventAttributes"),
    d("eventType/requiredCompanyFields"),
    d("eventType/eventValidators"),
    d("eventType/eventFields"),
  ], {class: "eventTypeRow", style: "background-color: gray;"} ),
  d( S.eventTypes.map( eventType => d([
    d(String(eventType["entity"])),
    d([
      input({value: eventType["entity/label"]}, "change", e => A.updateEntityAttribute( eventType.entity, "entity/label", submitInputValue(e) ) ),
      input({value: eventType["entity/doc"]}, "change", e => A.updateEntityAttribute( eventType.entity, "entity/doc", submitInputValue(e) ) )
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
      e => A.updateEntityAttribute( eventType.entity, "eventType/eventAttributes", eventType["eventType/eventAttributes"].concat( Number(submitInputValue(e)) )  )   
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
      e => A.updateEntityAttribute( eventType.entity, "eventType/requiredCompanyFields", eventType["eventType/requiredCompanyFields"].concat( Number(submitInputValue(e)) )  )   
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
      e => A.updateEntityAttribute( eventType.entity, "eventType/eventValidators", eventType["eventType/eventValidators"].concat( Number(submitInputValue(e)) )  )   
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
      e => A.updateEntityAttribute( eventType.entity, "eventType/eventFields", eventType["eventType/eventFields"].concat( Number(submitInputValue(e)) )  )   
      )  ) 
    ),
    d( "[X]", {class: "textButton"}, "click", e => A.retractEntity(eventType["entity"])  ),
  ], {class: "eventTypeRow"} ) ) ),
  d([
    d("Opprett ny", {class: "textButton"}, "click", e => A.createEventType() ),
  ], {class: "eventTypeRow"} ),
]) 

let newEntityRouter = {
  "eventValidators": (A) => A.createEventValidator(),
  "eventFields": (A) => A.createEventField(),
  "companyFields": (A) => A.createCompanyField()
}

let entityAdminPage = ( S, A, entityType ) => d([
  d([
    d("entity"),
    d("entity/label"),
    d("entity/doc"),
  ], {class: "attributeRow", style: "background-color: gray;"} ),
  d( S[ entityType ].map( entity => d([
    d(String(entity["entity"])),
    input({value: entity["entity/label"]}, "change", e => A.updateEntityAttribute( entity.entity, "entity/label", submitInputValue(e) ) ),
    input({value: entity["entity/doc"]}, "change", e => A.updateEntityAttribute( entity.entity, "entity/doc", submitInputValue(e) ) ),
    d( "[X]", {class: "textButton"}, "click", e => A.retractEntity(entity["entity"])  ),
  ], {class: "attributeRow"} ) ) ),
  d("Opprett ny", {class: "textButton"}, "click", e => newEntityRouter[entityType](A) ),
]) 

let eventValidatorsPage = ( S, A ) =>  entityAdminPage( S, A, "eventValidators" )
let eventFieldsPage = ( S, A ) =>  entityAdminPage( S, A, "eventFields" )
let companyFieldsPage = ( S, A ) =>  entityAdminPage( S, A, "companyFields" )



//Tailor-made complex views

let foundersView = (S, A, attributeID, value, entityID) => d([
    entitySpan(S, attributeID),
    d([d("AksjonærID"), d("Antall aksjer"), d("Pris per aksje")], {class: "shareholderRow"}),
    Object.keys(value).length === 0
    ? d("Ingen stiftere")
    : d( Object.values( value ).map( shareholder => d([
        input({value: shareholder["shareholder"], style: `text-align: right;`}, "change", e => A.updateEntityAttribute( 
          entityID, 
          S["E"][attributeID]["attr/name"], 
          mergerino(
            value,
            createObject( shareholder["shareholder"], undefined ),
            createObject( submitInputValue(e), mergerino(
              value[shareholder["shareholder"]],
              createObject( "shareholder" , submitInputValue(e) ),
              )
            )
        ) )),
        input({value: shareholder["shareCount"], style: `text-align: right;`}, "change", e => A.updateEntityAttribute( 
          entityID, 
          S["E"][attributeID]["attr/name"], 
          mergerino(
            value,
            createObject( shareholder["shareholder"] , createObject("shareCount", Number( submitInputValue(e) ) ) ),
        ) )),
        input({value: shareholder["sharePrice"], style: `text-align: right;`}, "change", e => A.updateEntityAttribute( 
          entityID, 
          S["E"][attributeID]["attr/name"], 
          mergerino(
            value,
            createObject( shareholder["shareholder"] , createObject("sharePrice", Number( submitInputValue(e) ) ) ),
        ) )),
        d("X", {class: "textButton"}, "click", e => A.updateEntityAttribute( 
          entityID, 
          S["E"][attributeID]["attr/name"], 
          mergerino(
            value,
            createObject( shareholder["shareholder"] , undefined ) ) 
        ) )
        ], {class: "shareholderRow"}),
        ) ),
    d("Legg til stifter", {class: "textButton"}, "click", e => A.updateEntityAttribute( 
      entityID, 
      S["E"][attributeID]["attr/name"], 
      mergerino(
        value,
        createObject( "[AksjonærID]" , {shareholder: "[AksjonærID]", shareCount: 0, sharePrice: 0} ),
    ) ) )
  ], {style: "border: solid 1px black;"})

let newEventDropdown = (S, A, Event) => dropdown( "", 
  S.eventTypes.map( newEventType => returnObject({value: newEventType.entity, label: newEventType["entity/label"] }) ).concat({value: "", label: "Legg til hendelse etter denne"}),
  e => A.createEvent(Event, Number(submitInputValue(e)) )
)
  
let specialAttributeViews = {
  "3761": foundersView
}

let accountDropdown = (S, currentValue) => dropdown(currentValue, Object.keys(S.Accounts).map( accountNumber => returnObject({value: accountNumber, label: `${accountNumber}: ${S.Accounts[ accountNumber ].label}` })).concat({value: "", label: "Ingen konto valgt."}), e => console.log( entityID, "event/account", submitInputValue(e))  )