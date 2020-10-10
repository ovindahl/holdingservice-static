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

//Basic entity views

const entityColors = {
  "attribute": "#eca2637a",
  "eventField": "#5b95eca6",
  "companyField": "#00968870",
}

let editableAttributeView = (S, A, entity, attributeEntity, value) => d([
  entityLabel(S, attributeEntity ),
  input(
    {value: value, style: `text-align: right; ${ validateAttributeValue(S, attributeEntity, value ) ? "" : "background-color: #fb9e9e; " }`}, 
    "change", 
    e => A.updateEntityAttribute( entity, S["sharedData"]["E"][attributeEntity]["attr/name"], S["sharedData"]["E"][attributeEntity]["attr/valueType"] === "number" ? Number(submitInputValue(e)) : submitInputValue(e)) 
  ),
  ], {class: "columns_3_1"})

let entityLabelWithMouseover = (S, A, entity) => d( [
  span( `${S["sharedData"]["E"][ entity ]["entity/label"]}`, `[${entity}] ${S["sharedData"]["E"][entity]["entity/doc"]}`, {class: "entityLabel"}, "mouseover", e => A.updateLocalState(  {"mouseOveredEntity" : entity} ) )
], {style:"display: inline-flex;"} )

let entityLabel = (S, entity) => d( [
  span( `${S["sharedData"]["E"][ entity ]["entity/label"]}`, `[${entity}] ${S["sharedData"]["E"][entity]["entity/doc"]}`, {class: "entityLabel", style: `background-color: ${entityColors[S["sharedData"]["E"][ entity ]["entity/type"]]};`} )
], {style:"display: inline-flex;"} ) 

let entityValue = (value) => d( [
  d(`${JSON.stringify(value)}`, {class: typeof value === "number" ? "rightAlignText" : "" } )
]) 

let entityLabelAndValue = (S, entity, value) => d([
  entityLabel(S, entity),
  entityValue(value)
], {class: "eventInspectorRow"})

let entityRedlinedValue = (value, prevValue) => d( [
  span( `${JSON.stringify(prevValue)}`, "", {class: "redlineText"}),
  span( `${JSON.stringify(value)}`),
], {style:"display: inline-flex;justify-content: flex-end;"} ) 



let entityLabelAndRedlinedValue = (S, entity, value, prevValue) => d([
  entityLabel(S, entity),
  entityRedlinedValue(value, prevValue)
], {class: "eventInspectorRow"})

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
  "Admin/Attributter": (S, A) => attributesPage( S, A ),
  "Admin/Hendelsestyper": (S, A) => eventTypesPage( S, A ),
  "Admin/HendelsesOutput": (S, A) => eventFieldsPage( S, A ),
  "Admin/SelskapsOutput": (S, A) => companyFieldsPage( S, A ),
  "admin/eventValidators": (S, A) => eventValidatorsPage( S, A )
}

let timelineView = (S, A) => d([
  d("sidebar_left"),
  d( S["selectedCompany"]["appliedEvents"].concat(S["selectedCompany"]["rejectedEvents"]).map( Event => eventView( S, Event, A )  )),
  d("sidebar_right"),
], {class: "pageContainer"}) 

let eventView = (S, Event , A) => {

  let eventTypeEntity = Event["eventAttributes"]["event/eventTypeEntity"]
  let eventType = S["sharedData"]["E"][eventTypeEntity ]
  let eventAttributeEntities = eventType["eventType/eventAttributes"]
  let eventFieldEntities = Object.keys(eventType["eventType/eventFieldConstructors"])



  return d([
    h3(eventType["entity/label"]),
    d( eventAttributeEntities.map( attributeEntity => editableAttributeView(S, A, Event["eventAttributes"].entity, attributeEntity, Event["eventAttributes"][ S["sharedData"]["E"][attributeEntity]["attr/name"] ])  )),
    d( eventFieldEntities.map( eventFieldEntity => entityLabelAndValue(S, eventFieldEntity, Event["eventFields"][eventFieldEntity])  )),
    retractEventButton( Event["eventAttributes"]["entity"], A),
    newEventDropdown(S, A, Event)
], {class: "feedContainer"} )
} 



let mouseOverBanner = (S, entity) => (typeof entity === "undefined") ? d("") : d([
  h3(S["sharedData"]["E"][entity]["entity/label"]),
  d([
    d("ID:"),
    d(String(entity), {class: "rightAlignText"}),
  ], {class: "columns_3_1"}),
  d([
    d("Type:"),
    d(S["sharedData"]["E"][entity]["entity/type"], {class: "rightAlignText"}),
  ], {class: "columns_3_1"}),
  d("<br>"),
  d(S["sharedData"]["E"][entity]["entity/doc"])
], {class: "centerVertically", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

let companyDocPage = (S, A) => {

  let selectedVersion = S["UIstate"]["companyDocPage/selectedVersion"];
  let selectedEvent =  S["selectedCompany"]["appliedEvents"][selectedVersion - 1 ]
  let companyFields =  S["selectedCompany"]["companyFields"][selectedVersion ]
  let eventType = S["sharedData"]["E"][ selectedEvent["eventAttributes"]["event/eventTypeEntity"] ]

  return d([
    d([
      mouseOverBanner(S, S["UIstate"]["mouseOveredEntity"])
    ], {style: "position: relative;"}),
    d([
      d([
        d("<", {class: "textButton"}, "click", e => A.updateLocalState({"companyDocPage/selectedVersion": Math.max(1, selectedVersion - 1 )  })),
        d(">", {class: "textButton"}, "click", e => A.updateLocalState({"companyDocPage/selectedVersion": Math.min(S["selectedCompany"]["appliedEvents"].length, selectedVersion + 1 ) })),
      ], {class: "shareholderRow"}),
      d([
        h3(`Attributter for hendelse ${selectedVersion}: ${eventType["entity/label"]}`),
        d( eventType["eventType/eventAttributes"].map( attributeEntity => editableAttributeView(S, A, selectedEvent["eventAttributes"].entity, attributeEntity, selectedEvent["eventAttributes"][ S["sharedData"]["E"][attributeEntity]["attr/name"] ])  )),
      ], {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
      d("<br>"),
      d([
        h3(`Hendelsesrapport for hendelse ${selectedVersion}: ${eventType["eventType/label"]}`),
        d(Object.keys(eventType["eventType/eventFieldConstructors"]).map( eventFieldEntity => entityLabelAndValue(S, eventFieldEntity, selectedEvent["eventFields"][eventFieldEntity]) ) )
      ], {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
      d("<br>"),
      companyDocChangesView(S, A, selectedVersion),
      d("<br>"),
      companyDocView(S, A, selectedVersion),
    ] )
  ], {class: "pageContainer"}) 
}

let companyDocChangesView = (S, A, selectedVersion) => d([
  h3(`Endringer i Selskapsdokumentet som følge av hendelse ${selectedVersion}`),
  d( Object.keys(S["selectedCompany"]["companyFields"][selectedVersion ])
    .filter( companyFieldEntity => S["selectedCompany"]["companyFields"][ S["UIstate"]["companyDocPage/selectedVersion"] ][companyFieldEntity] !== S["selectedCompany"]["companyFields"][ S["UIstate"]["companyDocPage/selectedVersion"] - 1 ][companyFieldEntity] )
    .map( companyFieldEntity => {

    let value = S["selectedCompany"]["companyFields"][ S["UIstate"]["companyDocPage/selectedVersion"] ][companyFieldEntity]
    let prevValue = S["selectedCompany"]["companyFields"][ S["UIstate"]["companyDocPage/selectedVersion"] - 1 ][companyFieldEntity]

    return (value === prevValue) ? entityLabelAndValue(S, companyFieldEntity, value) : entityLabelAndRedlinedValue(S, companyFieldEntity, value , prevValue )

  } ))
], {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

let companyDocView = (S, A, selectedVersion) => {

  let entityObjects = S["sharedData"]["allCompanyFields"].map( entity => S["sharedData"]["E"][entity] )

  let categories = entityObjects.map( entityObject => S["sharedData"]["E"][entityObject.entity]["entity/category"]).filter(filterUniqueValues)

  return d([
    h3(`Hele Selskapsdokumentet etter hendelse ${selectedVersion}`),
    d(categories.map( category => d([
      d(`Kategori: ${category}`),
      d( Object.keys(S["selectedCompany"]["companyFields"][selectedVersion ])
        .filter( companyFieldEntity => S["sharedData"]["E"][companyFieldEntity]["entity/category"] === category )
        .map( companyFieldEntity => entityLabelAndValue(S, companyFieldEntity, S["selectedCompany"]["companyFields"][ S["UIstate"]["companyDocPage/selectedVersion"] ][companyFieldEntity]) ))
    ]) ))
    
  ], {style: "width: 800px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

} 




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
      entityLabel(S, entity ),
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
    entityLabel(S, entity), 
    span(" [ Fjern ] ", "Fjern denne oppføringen.", {class: "textButton_narrow"}, "click", e => A.updateEntityAttribute( parentEntity, attributeName, S["sharedData"]["E"][parentEntity][attributeName].filter( e => e !== entity )  )  )
    ]) 
  ).concat( dropdown(
    0,
    allAllowedEntities.filter( entity => !S["sharedData"]["E"][parentEntity][attributeName].includes( entity )  ).map( entity => returnObject({value: entity, label: `${S["sharedData"]["E"][entity]["entity/label"]}`})).concat({value: 0, label: "Legg til"}), 
    e => A.updateEntityAttribute( parentEntity, attributeName, S["sharedData"]["E"][parentEntity][attributeName].concat( Number(submitInputValue(e)) )  )   
    )  ) 
  )
], {class: "eventAttributeRow"})

let newEventDropdown = (S, A, Event) => dropdown( "", 
  S["sharedData"]["allEventTypes"].map( eventTypeEntity => returnObject({value: eventTypeEntity, label: S["sharedData"]["E"][eventTypeEntity]["entity/label"] }) ).concat({value: "", label: "Legg til hendelse etter denne"}),
  e => A.createEvent(Event, Number(submitInputValue(e)) )
)
 

let accountDropdown = (S, currentValue) => dropdown(currentValue, Object.keys(S.Accounts).map( accountNumber => returnObject({value: accountNumber, label: `${accountNumber}: ${S.Accounts[ accountNumber ].label}` })).concat({value: "", label: "Ingen konto valgt."}), e => console.log( entityID, "event/account", submitInputValue(e))  )