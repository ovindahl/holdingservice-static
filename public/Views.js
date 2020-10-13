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
  "eventValidator": "#e402024d",
  "eventType": "#9a25e07a",
}

let editableAttributeView = (S, A, entity, attributeEntity, value) => d([
  entityLabel(S, A, attributeEntity ),
  input(
    {value: value, style: `text-align: right; ${ validateAttributeValue(S, attributeEntity, value ) ? "" : "background-color: #fb9e9e; " }`}, 
    "change", 
    e => A.updateEntityAttribute( entity, S["sharedData"]["E"][attributeEntity]["attr/name"], S["sharedData"]["E"][attributeEntity]["attr/valueType"] === "number" ? Number(submitInputValue(e)) : submitInputValue(e)) 
  ),
  ], {class: "columns_3_1"})

let entityLabel = (S, A, entity) => d( [
  span( `${S["sharedData"]["E"][ entity ]["entity/label"]}`, `[${entity}] ${S["sharedData"]["E"][entity]["entity/doc"]}`, {class: "entityLabel", style: `background-color: ${entityColors[S["sharedData"]["E"][ entity ]["entity/type"]]};`}, "click", e => A.updateLocalState({"sidebar/selectedEntity": entity}) )
], {style:"display: inline-flex;"} ) 

let entityValue = (value) => d( [
  d(`${JSON.stringify(value)}`, {class: typeof value === "number" ? "rightAlignText" : "" } )
]) 

let entityLabelAndValue = (S, A, entity, value) => d([
  entityLabel(S, A, entity),
  entityValue(value)
], {class: "eventInspectorRow"})

let entityRedlinedValue = (value, prevValue) => d( [
  span( `${JSON.stringify(prevValue)}`, "", {class: "redlineText"}),
  span( `${JSON.stringify(value)}`),
], {style:"display: inline-flex;justify-content: flex-end;"} ) 



let entityLabelAndRedlinedValue = (S, A, entity, value, prevValue) => d([
  entityLabel(S, A, entity),
  entityRedlinedValue(value, prevValue)
], {class: "eventInspectorRow"})

let eventErrorMessageView = (errorMessage) => d( errorMessage, {class: "entityLabel", style:`background-color: #e402024d;`})


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
  d( S["sharedData"]["userEvents"].filter( E => E["event/incorporation/orgnumber"] ).map( E => E["event/incorporation/orgnumber"] ).filter( filterUniqueValues ).map( orgnumber => d( orgnumber, {class: orgnumber === S["UIstate"].selectedOrgnumber ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {selectedOrgnumber : orgnumber} ) )  ).concat(d( "+", {class: "textButton"}, "click", e => console.log("TBD...") )), {style: "display:flex;"}),
]) 
let pageSelectionMenuRow = (S, A) => d( ["timeline", "companyDoc", "Admin", "Admin/Datomer"].map( pageName => d( pageName, {class: pageName === S["UIstate"].currentPage ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {currentPage : pageName} ) )  ), {style: "display:flex;"})

let generateHTMLBody = (S, A) => [
  headerBarView(S),
  companySelectionMenuRow(S, A),
  pageSelectionMenuRow(S, A),
  pageContainer(S, A)
]

let pageContainer = (S, A) => d([
  sidebar_left(S, A),
  pageRouter[ S["UIstate"].currentPage ]( S, A ),
  sidebar_right(S, A)
], {class: "pageContainer"})

let pageRouter = {
  "timeline": (S, A) => timelineView(S, A),
  "companyDoc": (S, A) => companyDocPage( S, A ),
  "Admin": (S, A) => adminPage( S, A ),
  "Admin/Datomer": (S, A) => latestDatomsPage( S, A ),
}

let sidebar_left = (S, A) => S["UIstate"].currentPage === "Admin" 
  ? d([
      d( ["attribute", "eventType", "eventField", "companyField", "eventValidator"].map( pageName => d( pageName, {class: pageName === S["UIstate"].currentSubPage ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {currentSubPage : pageName} ) )  )),
      d( getSubPageCategories( S, A ).map( category => d( category, {class: category === S["UIstate"].selectedCategory ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {selectedCategory : category} ) )  )),
      d( categoryRouter[ S["UIstate"].currentSubPage ](S)
        .map( e => S["sharedData"]["E"][e] )
        .filter( e => e["entity/category"] === S["UIstate"].selectedCategory )
        .map( entity => d( entity["entity/label"], {class: entity.entity === S["UIstate"].selectedEntity ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {selectedEntity : entity.entity} ) ) ) 
        )
  ], {style: "display:flex;"})
  : d("other")

let sidebar_right = (S, A) => d([
  entityInspectorView(S, A, S["sharedData"]["E"][S["UIstate"]["sidebar/selectedEntity"]] ),
  //txView(S, A, S["sharedData"]["latestTxs"][0])
]) 

let entityInspectorView = (S, A, selectedEntity) => selectedEntity 
  ? d([
      h3(`[${selectedEntity["entity"]}] ${selectedEntity["entity/label"]}`, {style: `background-color: ${entityColors[selectedEntity["entity/type"]]}; padding: 3px;`}),
      entityLabelAndValue(S, A, getAttributeEntityFromName(S, "entity/type"), String(selectedEntity["entity/type"])),
      entityLabelAndValue(S, A, getAttributeEntityFromName(S, "entity/category"), String(selectedEntity["entity/category"])),
      d("<br>"),
      //editableAttributeView(S, A, selectedEntity, getAttributeEntityFromName(S, "entity/doc"), selectedEntity["entity/doc"] )
      d(selectedEntity["entity/doc"]),
      d("Rediger", {class: "textButton"}, "click", e => A.updateLocalState({currentPage: "Admin", currentSubPage: selectedEntity["entity/type"], selectedCategory: selectedEntity["entity/category"], selectedEntity: selectedEntity.entity }))
    ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
  : d("")

let timelineView = (S, A) => d( S["selectedCompany"]["appliedEvents"].concat(S["selectedCompany"]["rejectedEvents"]).map( Event => eventView( S, Event, A )  )) 

let eventView = (S, Event , A) => {

  let eventTypeEntity = Event["eventAttributes"]["event/eventTypeEntity"]
  let eventType = S["sharedData"]["E"][eventTypeEntity ]
  let eventAttributeEntities = eventType["eventType/eventAttributes"]
  let eventFieldEntities = Object.keys(eventType["eventType/eventFieldConstructors"])

  return d([
    h3(eventType["entity/label"]),
    d( eventAttributeEntities.map( attributeEntity => editableAttributeView(S, A, Event["eventAttributes"].entity, attributeEntity, Event["eventAttributes"][ S["sharedData"]["E"][attributeEntity]["attr/name"] ])  )),
    d( eventFieldEntities.map( eventFieldEntity => Event["eventFields"] ? entityLabelAndValue(S, A, eventFieldEntity, Event["eventFields"][eventFieldEntity]) : d("ERROR")  )),
    d(Event["errors"] 
      ? Event["errors"].map( eventErrorMessageView )
      : ""),
    retractEventButton( Event["eventAttributes"]["entity"], A),
    newEventDropdown(S, A, Event)
], {class: "feedContainer"} )
} 

let companyDocPage = (S, A) => {

  let selectedVersion = S["UIstate"]["companyDocPage/selectedVersion"];
  let selectedEvent =  S["selectedCompany"]["appliedEvents"][selectedVersion - 1 ]
  let eventType = S["sharedData"]["E"][ selectedEvent["eventAttributes"]["event/eventTypeEntity"] ]

  return d([
    d([
      d("<", {class: "textButton"}, "click", e => A.updateLocalState({"companyDocPage/selectedVersion": Math.max(1, selectedVersion - 1 )  })),
      d(">", {class: "textButton"}, "click", e => A.updateLocalState({"companyDocPage/selectedVersion": Math.min(S["selectedCompany"]["appliedEvents"].length, selectedVersion + 1 ) })),
    ], {class: "shareholderRow"}),
    d([
      h3(`Attributter for hendelse ${selectedVersion}: ${eventType["entity/label"]}`),
      d( eventType["eventType/eventAttributes"].map( attributeEntity => editableAttributeView(S, A, selectedEvent["eventAttributes"].entity, attributeEntity, selectedEvent["eventAttributes"][ S["sharedData"]["E"][attributeEntity]["attr/name"] ])  )),
    ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
    d("<br>"),
    d([
      h3(`Hendelsesrapport for hendelse ${selectedVersion}: ${eventType["eventType/label"]}`),
      d(Object.keys(eventType["eventType/eventFieldConstructors"]).map( eventFieldEntity => entityLabelAndValue(S, A, eventFieldEntity, selectedEvent["eventFields"][eventFieldEntity]) ) )
    ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
    d("<br>"),
    companyDocChangesView(S, A, selectedVersion),
    d("<br>"),
    companyDocView(S, A, selectedVersion),
  ] )
}

let companyDocChangesView = (S, A, selectedVersion) => d([
  h3(`Endringer i Selskapsdokumentet som følge av hendelse ${selectedVersion}`),
  d( Object.keys(S["selectedCompany"]["companyFields"][selectedVersion ])
    .filter( companyFieldEntity => S["selectedCompany"]["companyFields"][ S["UIstate"]["companyDocPage/selectedVersion"] ][companyFieldEntity] !== S["selectedCompany"]["companyFields"][ S["UIstate"]["companyDocPage/selectedVersion"] - 1 ][companyFieldEntity] )
    .map( companyFieldEntity => {

    let value = S["selectedCompany"]["companyFields"][ S["UIstate"]["companyDocPage/selectedVersion"] ][companyFieldEntity]
    let prevValue = S["selectedCompany"]["companyFields"][ S["UIstate"]["companyDocPage/selectedVersion"] - 1 ][companyFieldEntity]

    return (value === prevValue) ? entityLabelAndValue(S, A, companyFieldEntity, value) : entityLabelAndRedlinedValue(S, A, companyFieldEntity, value , prevValue )

  } ))
], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

let companyDocView = (S, A, selectedVersion) => {

  let entityObjects = S["sharedData"]["allCompanyFields"].map( entity => S["sharedData"]["E"][entity] )

  let categories = entityObjects.map( entityObject => S["sharedData"]["E"][entityObject.entity]["entity/category"]).filter(filterUniqueValues)

  return d([
    h3(`Hele Selskapsdokumentet etter hendelse ${selectedVersion}`),
    d(categories.map( category => d([
      d(`Kategori: ${category}`),
      d( Object.keys(S["selectedCompany"]["companyFields"][selectedVersion ])
        .filter( companyFieldEntity => S["sharedData"]["E"][companyFieldEntity]["entity/category"] === category )
        .map( companyFieldEntity => entityLabelAndValue(S, A, companyFieldEntity, S["selectedCompany"]["companyFields"][ S["UIstate"]["companyDocPage/selectedVersion"] ][companyFieldEntity]) ))
    ]) ))
    
  ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

}

let latestDatomsPage = (S, A) => {

  let txs = S["sharedData"]["latestTxs"]

  return d([
    sidebar_left(S, A),
    d( txs.map( tx => txView(S, A, tx) ) ),
    d("sidebar_right"),
  ], {class: "pageContainer"})
} 

let txView = (S, A, tx) => d([
  h3( `${moment(tx.tx) }` ),
  d( `Bruker: ${tx.user}` ),
  d("<br>"),
  d([
    d("Entitet"),
    d("Attributt"),
    d("Verdi")
  ], {class: "columns_1_1_1"}),
  d( tx.datoms
    .filter( datom => datom.entity === tx.datoms.map( d => d.entity ).sort()[0] )
    .map( datom => d([
      //entityLabel(S, A, datom.entity),
      S["sharedData"]["E"][datom.entity] ? entityLabel(S, A, datom.entity) : d(String(datom.entity)),
      entityLabel(S, A, getAttributeEntityFromName(S, datom.attribute) ),
      input({value: String(datom.value), disabled: "disabled", class: "rightAlignText" })
    ], {class: "columns_1_1_1"})  )),
], {class: "feedContainer"})

let eventFieldConstructorsView = (S, A, selectedEventType) => d([
  d(
    Object.keys(selectedEventType["eventType/eventFieldConstructors"]).map( entity => d([
      entityLabel(S, A, entity ),
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
    entityLabel(S, A, entity), 
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




let adminPage = (S, A) => entityAdminRouter[S["sharedData"]["E"][S["UIstate"]["selectedEntity"]]["entity/type"]](S, A, S["sharedData"]["E"][S["UIstate"]["selectedEntity"]] )

let getSubPageCategories = (S, A) => categoryRouter[ S["UIstate"].currentSubPage ? S["UIstate"].currentSubPage : "attribute" ](S, A).map( entity => S["sharedData"]["E"][entity]["entity/category"] ).filter(filterUniqueValues)

let categoryRouter = {
  "attribute": S => S["sharedData"]["attributes"].map( a => a.entity ),
  "eventType": S => S["sharedData"]["allEventTypes"],
  "eventField": S => S["sharedData"]["allEventFields"],
  "companyField": S => S["sharedData"]["allCompanyFields"],
  "eventValidator": S => S["sharedData"]["allEventValidators"],
}


let defaultEntityFields = (S, A, selectedEntity) => d([
  h3( `${selectedEntity["entity/category"]} /  ${selectedEntity["entity/label"]}`  ),
  d([
    d("Attributtens entitetsID:"),
    d( String(selectedEntity["entity"]) )
  ], {class: "eventAttributeRow"}),
  editableAttributeView(S, A, selectedEntity["entity"], getAttributeEntityFromName(S, "entity/label"), selectedEntity["entity/label"]  ),
  editableAttributeView(S, A, selectedEntity["entity"], getAttributeEntityFromName(S, "entity/category"), selectedEntity["entity/category"]  ),
  editableAttributeView(S, A, selectedEntity["entity"], getAttributeEntityFromName(S, "entity/doc"), selectedEntity["entity/doc"]  ),
  editableAttributeView(S, A, selectedEntity["entity"], getAttributeEntityFromName(S, "entity/note"), selectedEntity["entity/note"]  )
])

let adminView_attribute = (S, A, selectedEntity) =>  d([
  defaultEntityFields(S, A, selectedEntity),
  editableAttributeView(S, A, selectedEntity["entity"], getAttributeEntityFromName(S, "attr/name"), selectedEntity["attr/name"]  ),
  editableAttributeView(S, A, selectedEntity["entity"], getAttributeEntityFromName(S, "attr/valueType"), selectedEntity["attr/valueType"]  ),
  editableAttributeView(S, A, selectedEntity["entity"], getAttributeEntityFromName(S, "attribute/validatorFunctionString"), selectedEntity["attribute/validatorFunctionString"]  ),
],{class: "feedContainer"})

let adminView_eventType = (S, A, selectedEntity) =>  d([
  defaultEntityFields(S, A, selectedEntity),
  multipleEntitySelectorView(S, A, selectedEntity.entity, "eventType/eventAttributes", S["sharedData"]["allEventAttributes"]),
  multipleEntitySelectorView(S, A, selectedEntity.entity, "eventType/eventValidators", S["sharedData"]["allEventValidators"]),
  multipleEntitySelectorView(S, A, selectedEntity.entity, "eventType/requiredCompanyFields", S["sharedData"]["allCompanyFields"]),
  eventFieldConstructorsView(S, A, selectedEntity),
  retractEntityButton(A, selectedEntity["entity"])
],{class: "feedContainer"})

let adminView_eventField = (S, A, selectedEntity) =>  d([
  defaultEntityFields(S, A, selectedEntity),
  multipleEntitySelectorView(S, A, selectedEntity.entity, "eventField/companyFields", S["sharedData"]["allCompanyFields"]),
  retractEntityButton(A, selectedEntity["entity"])
],{class: "feedContainer"})

let adminView_companyField = (S, A, selectedEntity) =>  d([
  defaultEntityFields(S, A, selectedEntity),
  editableAttributeView(S, A, selectedEntity["entity"], getAttributeEntityFromName(S, "companyField/constructorFunctionString"), selectedEntity["companyField/constructorFunctionString"]  ),
  multipleEntitySelectorView(S, A, selectedEntity.entity, "companyField/companyFields", S["sharedData"]["allCompanyFields"]),
  retractEntityButton(A, selectedEntity["entity"])
],{class: "feedContainer"})

let adminView_eventValidator = (S, A, selectedEntity) =>  d([
  defaultEntityFields(S, A, selectedEntity),
  editableAttributeView(S, A, selectedEntity["entity"], getAttributeEntityFromName(S, "eventValidator/validatorFunctionString"), selectedEntity["eventValidator/validatorFunctionString"]  ),
  editableAttributeView(S, A, selectedEntity["entity"], getAttributeEntityFromName(S, "eventValidator/errorMessage"), selectedEntity["eventValidator/errorMessage"]  ),
  retractEntityButton(A, selectedEntity["entity"])
],{class: "feedContainer"})

let entityAdminRouter = {
  "attribute": adminView_attribute,
  "eventType": adminView_eventType,
  "eventField": adminView_eventField,
  "companyField": adminView_companyField,
  "eventValidator": adminView_eventValidator,
}