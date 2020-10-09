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
let textArea = (content, onChange) => htmlElementObject("textarea", {}, content, "change", onChange )

let dropdown = (value, optionObjects, updateFunction) => htmlElementObject("select", {id: getNewElementID(), style:"padding: 1em; border: 1px solid lightgray"}, optionObjects.map( o => `<option value="${o.value}" ${o.value === value ? `selected="selected"` : ""}>${o.label}</option>` ).join(''), "change", updateFunction  )

let retractEventButton = (entityID, A) => d("Slett hendelse", {class: "textButton"}, "click", e => A.retractEvent(entityID) )
let retractEntityButton = (A, entity) => d("Slett", {class: "textButton"}, "click", e => A.retractEntity(entity) )

//Page frame

let headerBarView = (S) => d([
  d('<header><h1>Holdingservice Beta</h1></header>', {class: "textButton"}),
  d(`Server version: ${"S.serverConfig.serverVersion"}`),
  d(`Client app version: ${"S.serverConfig.clientVersion"}`),
  d(`DB version: ${"S.tx"}`),
  d(`Server cache updated: ${"moment(S.serverConfig.cacheUpdated).format()"}`),
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
  d( S["userEvents"].filter( E => E["event/incorporation/orgnumber"] ).map( E => E["event/incorporation/orgnumber"] ).filter( filterUniqueValues ).map( orgnumber => d( orgnumber, {class: orgnumber === S["UIstate"].selectedOrgnumber ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {selectedOrgnumber : orgnumber} ) )  ).concat(d( "+", {class: "textButton"}, "click", e => console.log("TBD...") )), {style: "display:flex;"}),
]) 
let pageSelectionMenuRow = (S, A) => d( ["timeline", "companyDoc", "Admin/Attributter", "Admin/Hendelsestyper", "Admin/HendelsesOutput", "Admin/SelskapsOutput"].map( pageName => d( pageName, {class: pageName === S["UIstate"].currentPage ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {currentPage : pageName} ) )  ), {style: "display:flex;"})

let generateHTMLBody = (S, A) => [
  headerBarView(S),
  companySelectionMenuRow(S, A),
  pageSelectionMenuRow(S, A),
  pageRouter[ S["UIstate"].currentPage ]( S, A )  
]

let pageRouter = {
  "timeline": (S, A) => timelineView(S, A),
  "companyDoc": (S, A) => companyDocPage( S, A ),
  "Admin/Attributter": (S, A) => d( [attributesPage( S, A )], {class: "pageContainer"}),
  "Admin/Hendelsestyper": (S, A) => eventTypesPage( S, A ),
  "Admin/HendelsesOutput": (S, A) => eventFieldsPage( S, A ),
  "Admin/SelskapsOutput": (S, A) => companyFieldsPage( S, A ),
  "admin/eventValidators": (S, A) => eventValidatorsPage( S, A )
}

let timelineView = (S, A) => d([
  d( S["selectedCompany"]["appliedEvents"].map( Event => feedContainer(  eventView( S, Event, A ) , Event["eventAttributes"]["event/date"], Event["eventAttributes"]["entity"] )  ), {class: "pageContainer"}),
  d( S["selectedCompany"]["rejectedEvents"].map( Event => feedContainer(  eventView( S, Event, A ) , Event["eventAttributes"]["event/date"], Event["eventAttributes"]["entity"] )  ), {class: "pageContainer"})
])

let eventView = (S, Event , A) => d([
    d( [entitySpan(S, Event["eventAttributes"]["event/eventTypeEntity"] )], {style: `background-color: ${Event["eventFields"] ? "#1073104f" : "#fb9e9e"}; padding: 1em;`} ),
    attributesTableView(S, Event["eventAttributes"], A),
    d("<br>"),
    //d( Event["event/:eventErrors"] ? Event["event/:eventErrors"].map( error => d(error, {style: "background-color: lightgray; color: red; padding: 3px; margin: 3px;"})  )  : [d("")] ),
    retractEventButton( Event["eventAttributes"]["entity"], A),
    newEventDropdown(S, A, Event)
])

let attributesTableView = (S, eventAttributes, A) => d([
  h3("Attributter"),
  d( S["sharedData"]["E"][ eventAttributes["event/eventTypeEntity"] ]["eventType/eventAttributes"].map( attributeID =>  [3478, 3761].includes(attributeID) 
      ? specialAttributeViews[ attributeID ](S, A, attributeID, eventAttributes[ S["sharedData"]["E"][attributeID]["attr/name"] ], eventAttributes["entity"] ) 
      : genericAttributeView( S, attributeID, eventAttributes[ S["sharedData"]["E"][attributeID]["attr/name"] ], e => A.updateEntityAttribute( eventAttributes["entity"], S["sharedData"]["E"][attributeID]["attr/name"], S["sharedData"]["E"][attributeID]["attr/valueType"] === "number" ? Number(submitInputValue(e)) : submitInputValue(e)) )
      ) 
  )
], {style: "background-color: #f1f0f0; padding: 1em;"})

let genericAttributeView = (S, attributeID, value, onChange) => d([
    entitySpan(S, attributeID ),
    input({value: value, style: `text-align: right; ${ validateAttributeValue(S, attributeID, value ) ? "" : "background-color: #fb9e9e; " }`}, "change", onChange ),
    ], {class: "eventInspectorRow"})

let entitySpan = (S, id) => span( S["sharedData"]["E"][id]["entity/label"], `[${id}] ${S["sharedData"]["E"][id]["entity/doc"]}` )

let slider = (value, min, max, onChange) => input({type: "range", min, max, value}, "change", onChange )

let eventFieldViews = {
  "4372": (S, selectedEvent, eventFieldEntity) => d([
    d( S["sharedData"]["E"][ eventFieldEntity ]["entity/label"], {style: "font-weight: bold;"} ),
    accountBalanceView(S, selectedEvent["eventFields"][eventFieldEntity]),
    d("<br>")
    ])
}


let eventFieldView = (S, selectedEvent, eventFieldEntity) => d([
      d(`${S["sharedData"]["E"][ eventFieldEntity ]["entity/label"]}:`),
      d(`${JSON.stringify(selectedEvent["eventFields"][eventFieldEntity])}`, {class: "rightAlignText"})
    ], {class: "eventInspectorRow"})


let companyFieldViews = {
  "4372": (S, companyFieldEntity) => d([
    d( S["sharedData"]["E"][ companyFieldEntity ]["entity/label"], {style: "font-weight: bold;"} ),
    accountBalanceWithHistoryView(S, companyField, prevCompanyField),
    d("<br>")
    ])
}

let a = `return eventAttributes['event/incorporation/incorporationCost'];`
let b = `return Object.values( eventAttributes['event/incorporation/shareholders'] ).reduce( (shareCapital, shareholder) => shareCapital + shareholder['shareCount'] * shareholder['sharePrice']  , 0);`


let companyFieldView = (S, companyFieldEntity) => d([
  d(`${S["sharedData"]["E"][ companyFieldEntity ]["entity/label"]}:`),
  d(`${JSON.stringify(S["selectedCompany"]["companyFields"][ S["UIstate"]["companyDocPage/selectedVersion"] ][companyFieldEntity])}`, {class: "rightAlignText"})
], {class: "eventInspectorRow"})



let companyDocPage = (S, A) => {

  let selectedVersion = S["UIstate"]["companyDocPage/selectedVersion"];
  let selectedEvent =  S["selectedCompany"]["appliedEvents"][selectedVersion - 1 ]
  let companyFields =  S["selectedCompany"]["companyFields"][selectedVersion ]
  let eventType = S["sharedData"]["E"][ selectedEvent["eventAttributes"]["event/eventTypeEntity"] ]

  return d([
    input({value: selectedVersion, disabled: "disabled"}, "change", e => A.updateLocalState({"companyDocPage/selectedVersion": submitInputValue(e)})),
    d([
      d("<", {class: "textButton"}, "click", e => A.updateLocalState({"companyDocPage/selectedVersion": Math.max(1, selectedVersion - 1 )  })),
      d(">", {class: "textButton"}, "click", e => A.updateLocalState({"companyDocPage/selectedVersion": Math.min(S["selectedCompany"]["appliedEvents"].length, selectedVersion + 1 ) })),
    ], {class: "shareholderRow"}),
    d([
      h3(`Attributter for hendelse ${selectedVersion}: ${eventType["entity/label"]}`),
      attributesTableView(S, selectedEvent["eventAttributes"], A ),
    ], {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
    d("<br>"),
    d([
      h3(`Hendelsesrapport for hendelse ${selectedVersion}: ${eventType["eventType/label"]}`),
      d(Object.keys(eventType["eventType/eventFieldConstructors"]).map( eventFieldEntity => eventFieldView(S, selectedEvent, eventFieldEntity) ) )
    ], {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
    d("<br>"),
    d([
      h3(`Selskapsdokumentet etter hendelse ${selectedVersion}`),
      d( Object.keys(companyFields).map( companyFieldEntity => companyFieldView(S, companyFieldEntity) ))
    ], {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
  ] , {class: "pageContainer"} )
} 

let accountBalanceView = (S, accountBalance) => d( Object.entries( accountBalance ).map( entry => d([
  d( `[${ entry[0] }] ${ S["sharedData"]["Accounts"][ entry[0] ].label }` ),
  d( `${entry[1] }`, {class: "rightAlignText"} )
], {class: "eventInspectorRow"}) ) )

let accountBalanceWithHistoryView = (S, accountBalance, prevAccountBalance) => d( [d([
  d("Konto"),
  d("Før", {class: "rightAlignText"}),
  d("Etter", {class: "rightAlignText"}),
], {class: "accountBalanceWithHistoryRow"})].concat(Object.keys( mergerino(accountBalance, prevAccountBalance) ).map( account => d([
  d( `[${ account }] ${ S["sharedData"]["Accounts"][ account ].label }`  ),
  d( `${ prevAccountBalance[account] ? prevAccountBalance[account] : 0 }`, {class: "rightAlignText"} ),
  d( `${ accountBalance[account] }`, {class: "rightAlignText", style: `color: ${accountBalance[account] === prevAccountBalance[account] ? "black" : "red" };` })
], {class: "accountBalanceWithHistoryRow"}) )) )

let attributesPage = ( S, A ) => {
  let selectedAttribute = S["sharedData"]["E"][ S["UIstate"]["attributesPage/selectedAttribute"] ]
  let attributes = S["sharedData"]["attributes"].map( a => a.entity )

  let attributeCategories = attributes.map( attribute => S["sharedData"]["E"][attribute]["attribute/category"]).filter(filterUniqueValues)

  let visibleAttributes = attributes.map( entity => S["sharedData"]["E"][entity] ).filter( attribute => attribute["attribute/category"] === S["UIstate"]["attributesPage/selectedAttributeCategory"] )

  return d([
    d( [h3("Kategori")].concat(attributeCategories.map( category => d( category, {class: category === S["UIstate"]["attributesPage/selectedAttributeCategory"] ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {"attributesPage/selectedAttributeCategory" : category} ) )).concat(d("Ny attributt", {class: "textButton"}, "click", e => A.createAttribute() ))) ),
    d( [h3("Attributt")].concat(visibleAttributes.map( attribute => d( attribute["entity/label"], {class: attribute.entity === S["UIstate"]["attributesPage/selectedAttribute"] ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {"attributesPage/selectedAttribute" : attribute.entity} ) ))) ),
    d([
      h3( `${selectedAttribute["attribute/category"]} /  ${selectedAttribute["entity/label"]}`  ),
      d([
        d("Attributtens entitetsID:"),
        d( String(selectedAttribute["entity"]) )
      ], {class: "eventAttributeRow"}),
      d([
        d("Systemnavn:"),
        input({value: selectedAttribute["attr/name"]}, "change", e => A.updateEntityAttribute( selectedAttribute.entity, "attr/name", submitInputValue(e) ) )
      ], {class: "eventAttributeRow"}),
      d([
        d("Verditype:"),
          dropdown(selectedAttribute["attr/valueType"], [{value: "string", label: "Tekstfelt"}, {value: "number", label: "Tall"}, {value: "object", label: "Objekt"}], e => A.updateEntityAttribute( selectedAttribute.entity, "attr/valueType", submitInputValue(e) ) )
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
        d("Internt notat:"),
        textArea( String(selectedAttribute["entity/note"]), e => A.updateEntityAttribute( selectedAttribute.entity, "entity/note", submitInputValue(e) ) )
      ], {class: "eventAttributeRow"}),
      d([
        d("Valideringsfunksjon:"),
        textArea( selectedAttribute["attribute/validatorFunctionString"], e => A.updateEntityAttribute( selectedAttribute.entity, "attribute/validatorFunctionString", submitInputValue(e) ) )
      ], {class: "eventAttributeRow"})
    ],{class: "feedContainer"}),
  ], {style: "display: flex;"})
} 

let eventTypesPage = ( S, A ) => {
  let selectedEventType = S["sharedData"]["E"][ S["UIstate"]["eventTypesPage/selectedEventType"] ]

  let eventTypeObjects = S["sharedData"]["allEventTypes"].map( entity => S["sharedData"]["E"][entity] )
  let eventAttributes = S["sharedData"]["allEventAttributes"]
  let eventValidators = S["sharedData"]["allEventValidators"]
  let companyFields = S["sharedData"]["allCompanyFields"]

  return d([
    d( [h3("Hendelsestype")].concat(eventTypeObjects.map( eventTypeObject => d( eventTypeObject["entity/label"], {class: eventTypeObject.entity === S["UIstate"]["eventTypesPage/selectedEventType"] ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {"eventTypesPage/selectedEventType" : eventTypeObject.entity} ) )).concat(d("Opprett ny", {class: "textButton"}, "click", e => A.createEventType() ))) ),
    d([
      h3( `${selectedEventType["entity/label"]}`  ),
      d([
        d("EntitetsID:"),
        d( String(selectedEventType["entity"]) )
      ], {class: "eventAttributeRow"}),
      d([
        d("Navn:"),
        input({value: selectedEventType["entity/label"]}, "change", e => A.updateEntityAttribute( selectedEventType.entity, "entity/label", submitInputValue(e) ) )
      ], {class: "eventAttributeRow"}),
      d([
        d("Beskrivelse:"),
        input({value: selectedEventType["entity/doc"]}, "change", e => A.updateEntityAttribute( selectedEventType.entity, "entity/doc", submitInputValue(e) ) )
      ], {class: "eventAttributeRow"}),
      d([
        d("Internt notat:"),
        textArea( String(selectedEventType["entity/note"]), e => A.updateEntityAttribute( selectedEventType.entity, "entity/note", submitInputValue(e) ) )
      ], {class: "eventAttributeRow"}),
      multipleEntitySelectorView(S, A, selectedEventType.entity, "eventType/eventAttributes", eventAttributes),
      multipleEntitySelectorView(S, A, selectedEventType.entity, "eventType/eventValidators", eventValidators),
      multipleEntitySelectorView(S, A, selectedEventType.entity, "eventType/requiredCompanyFields", companyFields),
      eventFieldConstructorsView(S, A, selectedEventType),
      retractEntityButton(A, selectedEventType["entity"])
    ],{class: "feedContainer"}),
  ], {style: "display: flex;"})
}

let newEntityRouter = {
  "eventValidators": (A) => A.createEventValidator(),
  "eventFields": (A) => A.createEventField(),
  "companyFields": (A) => A.createCompanyField()
}

let eventFieldsPage = ( S, A ) => {

  let localStateVarName = "eventFieldsPage/selectedEventField"
  let selectedEntity = S["sharedData"]["E"][ S["UIstate"][localStateVarName] ]

  let entityObjects = S["sharedData"]["allEventFields"].map( entity => S["sharedData"]["E"][entity] )

  let categories = entityObjects.map( entityObject => S["sharedData"]["E"][entityObject.entity]["entity/category"]).filter(filterUniqueValues)
  let currentCategoryEntities = entityObjects.filter( entityObject => entityObject["entity/category"] === S["UIstate"]["eventFieldsPage/selectedCategory"] )
  
  return d([
    d( [h3("Kategori")].concat(categories.map( category => d( category, {class: category === S["UIstate"]["eventFieldsPage/selectedCategory"] ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {"eventFieldsPage/selectedCategory" : category} ) ))) ),
    d( [h3("Hendelsesfelt")].concat(currentCategoryEntities.map( eventFieldObject => d( eventFieldObject["entity/label"], {class: eventFieldObject.entity === S["UIstate"][localStateVarName] ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {[localStateVarName] : eventFieldObject.entity} ) )).concat(d("Opprett ny", {class: "textButton"}, "click", e => A.createEventField() ))) ),
    d([
      h3( `${selectedEntity["entity/label"]}`  ),
      d([
        d("EntitetsID:"),
        d( String(selectedEntity["entity"]) )
      ], {class: "eventAttributeRow"}),
      d([
        d("Navn:"),
        input({value: selectedEntity["entity/label"]}, "change", e => A.updateEntityAttribute( selectedEntity.entity, "entity/label", submitInputValue(e) ) )
      ], {class: "eventAttributeRow"}),
      d([
        d("Kategori:"),
        input({value: selectedEntity["entity/category"]}, "change", e => A.updateEntityAttribute( selectedEntity.entity, "entity/category", submitInputValue(e) ) )
      ], {class: "eventAttributeRow"}),
      d([
        d("Beskrivelse:"),
        input({value: selectedEntity["entity/doc"]}, "change", e => A.updateEntityAttribute( selectedEntity.entity, "entity/doc", submitInputValue(e) ) )
      ], {class: "eventAttributeRow"}),
      d([
        d("Internt notat:"),
        textArea( String(selectedEntity["entity/note"]), e => A.updateEntityAttribute( selectedEntity.entity, "entity/note", submitInputValue(e) ) )
      ], {class: "eventAttributeRow"}),
      multipleEntitySelectorView(S, A, selectedEntity.entity, "eventField/companyFields", S["sharedData"]["allCompanyFields"]),
      d([
        d("Generatorfunksjon"),
        textArea( String(selectedEntity["eventField/constructorFunctionString"]), e => A.updateEntityAttribute( selectedEntity.entity, "eventField/constructorFunctionString", submitInputValue(e) )  )
      ], {class: "eventAttributeRow"}),
      retractEntityButton(A, selectedEntity["entity"])
    ],{class: "feedContainer"}),
  ], {style: "display: flex;"})
} 

let companyFieldsPage = ( S, A ) => {

  let localStateVarName = "companyFieldsPage/selectedCompanyField"
  let selectedEntity = S["sharedData"]["E"][ S["UIstate"][localStateVarName] ]

  let entityObjects = S["sharedData"]["allCompanyFields"].map( entity => S["sharedData"]["E"][entity] )

  let categories = entityObjects.map( entityObject => S["sharedData"]["E"][entityObject.entity]["entity/category"]).filter(filterUniqueValues)
  let currentCategoryEntities = entityObjects.filter( entityObject => entityObject["entity/category"] === S["UIstate"]["companyFieldsPage/selectedCategory"] )
  
  return d([
    d( [h3("Kategori")].concat(categories.map( category => d( category, {class: category === S["UIstate"]["companyFieldsPage/selectedCategory"] ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {"companyFieldsPage/selectedCategory" : category} ) ))) ),
    d( [h3("Selskapsvariabler")].concat(currentCategoryEntities.map( entityObject => d( entityObject["entity/label"], {class: entityObject.entity === S["UIstate"][localStateVarName] ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {[localStateVarName] : entityObject.entity} ) )).concat(d("Opprett ny", {class: "textButton"}, "click", e => A.createCompanyField() ))) ),
    d([
      h3( `${selectedEntity["entity/label"]}`  ),
      d([
        d("EntitetsID:"),
        d( String(selectedEntity["entity"]) )
      ], {class: "eventAttributeRow"}),
      d([
        d("Navn:"),
        input({value: selectedEntity["entity/label"]}, "change", e => A.updateEntityAttribute( selectedEntity.entity, "entity/label", submitInputValue(e) ) )
      ], {class: "eventAttributeRow"}),
      d([
        d("Kategori:"),
        input({value: selectedEntity["entity/category"]}, "change", e => A.updateEntityAttribute( selectedEntity.entity, "entity/category", submitInputValue(e) ) )
      ], {class: "eventAttributeRow"}),
      d([
        d("Beskrivelse:"),
        input({value: selectedEntity["entity/doc"]}, "change", e => A.updateEntityAttribute( selectedEntity.entity, "entity/doc", submitInputValue(e) ) )
      ], {class: "eventAttributeRow"}),
      d([
        d("Internt notat:"),
        textArea( String(selectedEntity["entity/note"]), e => A.updateEntityAttribute( selectedEntity.entity, "entity/note", submitInputValue(e) ) )
      ], {class: "eventAttributeRow"}),
      d([
        d("Generatorfunksjon"),
        textArea( String(selectedEntity["companyField/constructorFunctionString"]), e => A.updateEntityAttribute( selectedEntity.entity, "companyField/constructorFunctionString", submitInputValue(e) )  )
      ], {class: "eventAttributeRow"}),
      retractEntityButton(A, selectedEntity["entity"])
    ],{class: "feedContainer"}),
  ], {style: "display: flex;"})
} 

let eventFieldConstructorsView = (S, A, selectedEventType) => d([
  d(
    Object.keys(selectedEventType["eventType/eventFieldConstructors"]).map( entity => d([
      d( S["sharedData"]["E"][entity]["entity/label"] ),
      input({value: selectedEventType["eventType/eventFieldConstructors"][entity]}, "change", e => A.updateEntityAttribute( selectedEventType.entity, "eventType/eventFieldConstructors",  mergerino( selectedEventType["eventType/eventFieldConstructors"], createObject(entity, submitInputValue(e) ) )  ) ),
      span(" [ Fjern ] ", "Fjern denne oppføringen.", {class: "textButton_narrow"}, "click", e => A.updateEntityAttribute( selectedEventType.entity, "eventType/eventFieldConstructors",  mergerino( selectedEventType["eventType/eventFieldConstructors"], createObject(entity, undefined ) )  )  )
    ], {class: "eventFieldConstructorRow"}))
  ),
  dropdown(
    0,
    S["sharedData"]["allEventFields"].filter( entity => !Object.keys(selectedEventType["eventType/eventFieldConstructors"]).includes( String(entity) )  ).map( entity => returnObject({value: entity, label: `${S["sharedData"]["E"][entity]["entity/label"]}`})).concat({value: 0, label: "Legg til"}), 
    e => A.updateEntityAttribute( selectedEventType.entity, "eventType/eventFieldConstructors", mergerino( selectedEventType["eventType/eventFieldConstructors"], createObject(submitInputValue(e), "return 0;" ) )  )   
    )
]) 


let multipleEntitySelectorView = (S, A, parentEntity, attributeName, allAllowedEntities) =>  d([
  d( attributeName  ),
  d( S["sharedData"]["E"][parentEntity][attributeName].map( entity => d([
    entitySpan(S, entity), 
    span(" [ Fjern ] ", "Fjern denne oppføringen.", {class: "textButton_narrow"}, "click", e => A.updateEntityAttribute( parentEntity, attributeName, S["sharedData"]["E"][parentEntity][attributeName].filter( e => e !== entity )  )  )
    ]) 
  ).concat( dropdown(
    0,
    allAllowedEntities.filter( entity => !S["sharedData"]["E"][parentEntity][attributeName].includes( entity )  ).map( entity => returnObject({value: entity, label: `${S["sharedData"]["E"][entity]["entity/label"]}`})).concat({value: 0, label: "Legg til"}), 
    e => A.updateEntityAttribute( parentEntity, attributeName, S["sharedData"]["E"][parentEntity][attributeName].concat( Number(submitInputValue(e)) )  )   
    )  ) 
  )
], {class: "eventAttributeRow"})



//Tailor-made complex views

let foundersView = (S, A, attributeID, value, entityID) => d([
    entitySpan(S, attributeID),
    d([d("AksjonærID"), d("Antall aksjer"), d("Pris per aksje")], {class: "shareholderRow"}),
    Object.keys(value).length === 0
    ? d("Ingen stiftere")
    : d( Object.values( value ).map( shareholder => d([
        input({value: shareholder["shareholder"], style: `text-align: right;`}, "change", e => A.updateEntityAttribute( 
          entityID, 
          S["sharedData"]["E"][attributeID]["attr/name"], 
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
          S["sharedData"]["E"][attributeID]["attr/name"], 
          mergerino(
            value,
            createObject( shareholder["shareholder"] , createObject("shareCount", Number( submitInputValue(e) ) ) ),
        ) )),
        input({value: shareholder["sharePrice"], style: `text-align: right;`}, "change", e => A.updateEntityAttribute( 
          entityID, 
          S["sharedData"]["E"][attributeID]["attr/name"], 
          mergerino(
            value,
            createObject( shareholder["shareholder"] , createObject("sharePrice", Number( submitInputValue(e) ) ) ),
        ) )),
        d("X", {class: "textButton"}, "click", e => A.updateEntityAttribute( 
          entityID, 
          S["sharedData"]["E"][attributeID]["attr/name"], 
          mergerino(
            value,
            createObject( shareholder["shareholder"] , undefined ) ) 
        ) )
        ], {class: "shareholderRow"}),
        ) ),
    d("Legg til stifter", {class: "textButton"}, "click", e => A.updateEntityAttribute( 
      entityID, 
      S["sharedData"]["E"][attributeID]["attr/name"], 
      mergerino(
        value,
        createObject( "[AksjonærID]" , {shareholder: "[AksjonærID]", shareCount: 0, sharePrice: 0} ),
    ) ) )
  ], {style: "border: solid 1px black;"})

let newEventDropdown = (S, A, Event) => dropdown( "", 
  S["sharedData"]["allEventTypes"].map( eventTypeEntity => returnObject({value: eventTypeEntity, label: S["sharedData"]["E"][eventTypeEntity]["entity/label"] }) ).concat({value: "", label: "Legg til hendelse etter denne"}),
  e => A.createEvent(Event, Number(submitInputValue(e)) )
)
  
let specialAttributeViews = {
  "3761": foundersView
}

let accountDropdown = (S, currentValue) => dropdown(currentValue, Object.keys(S.Accounts).map( accountNumber => returnObject({value: accountNumber, label: `${accountNumber}: ${S.Accounts[ accountNumber ].label}` })).concat({value: "", label: "Ingen konto valgt."}), e => console.log( entityID, "event/account", submitInputValue(e))  )