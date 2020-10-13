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

let filterUniqueValues = (value, index, self) => self.indexOf(value) === index

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
let textArea = (content, attributesObject, onChange) => htmlElementObject("textarea", attributesObject, content, "change", onChange )
let dropdown = (value, optionObjects, updateFunction) => htmlElementObject("select", {id: getNewElementID(), style:"padding: 1em; border: 1px solid lightgray"}, optionObjects.map( o => `<option value="${o.value}" ${o.value === value ? `selected="selected"` : ""}>${o.label}</option>` ).join(''), "change", updateFunction  )

let retractEventButton = (entity, A) => d("Slett hendelse", {class: "textButton"}, "click", e => A.retractEvent(entity) )
let retractEntityButton = (A, entity) => d("Slett", {class: "textButton"}, "click", e => A.retractEntity(entity) )

//Basic entity views

const entityColors = {
  "entity": "#eca2637a",
  "attribute": "#eca2637a",
  "eventField": "#5b95eca6",
  "companyField": "#00968870",
  "eventValidator": "#e402024d",
  "eventType": "#9a25e07a",
  "event": "#bfd1077a"
}

let getEntityColor = (S, entity) => entityColors[S.getEntity(entity )["entity/type"]]
let editableAttributeView = (S, A, entity, attributeEntity, value) => d([
  entityLabel(S, A, attributeEntity ),
  input(
    {value: value, style: `text-align: right; ${ validateAttributeValue(S, attributeEntity, value ) ? "" : "background-color: #fb9e9e; " }`}, 
    "change", 
    e => A.updateEntityAttribute( entity, S.getEntity(attributeEntity)["attr/name"], S.getEntity(attributeEntity)["attr/valueType"] === "number" ? Number(submitInputValue(e)) : submitInputValue(e)) 
  ),
  ], {class: "columns_3_1"})

let entityLabel = (S, A, entity) => d( [
  span( `${ S.getEntity(entity)["entity/label"] ? S.getEntity(entity)["entity/label"] : String(entity)}`, `[${entity}] ${S.getEntity(entity)["entity/doc"] ? S.getEntity(entity)["entity/doc"] : String(entity)}`, {class: "entityLabel", style: `background-color: ${entityColors[S.getEntity(entity )["entity/type"]]};`}, "click", e => A.updateLocalState({"sidebar/selectedEntity": entity}) )
], {style:"display: inline-flex;"} )

let entityValue = (value) => d( [
  d(`${JSON.stringify(value)}`, {class: typeof value === "number" ? "rightAlignText" : "" } )
]) 

let entityLabelAndValue = (S, A, entity, value) => d([
  entityLabel(S, A, entity),
  entityValue(value)
], {class: "eventInspectorRow"})

let entityIDWithLabel = (S, A, entity) => d([
  d( [
    span( `EntitetsID`, `ID-nummeret til entiteten i databasen`, {class: "entityLabel", style: `background-color: ${entityColors["entity"]};`} )
  ], {style:"display: inline-flex;"} ),
  input({value: `${entity}`, disabled: "disabled", class: "rightAlignText"})
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
  d('<header><h1>Holdingservice Beta</h1></header>'),
  d([
    d("Logg ut", {class: "textButton"}, "click", e => console.log("Log out!")),
    d("Innstillinger", {class: "textButton"}, "click", e => console.log("Innstillinger!"))
  ], {style: "display:flex;"} )
], {style: "padding-left:3em; display:flex; justify-content: space-between;"})

let companySelectionMenuRow = (S, A) => d( S.getAllOrgnumbers().map( orgnumber => d( orgnumber, {class: orgnumber === S["UIstate"].selectedOrgnumber ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {selectedOrgnumber : orgnumber} ) )  ).concat(d( "+", {class: "textButton"}, "click", e => console.log("TBD...") )), {style: "display:flex;"}) 
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

let newEntityRouter = {
  "attribute": A => A.createAttribute(),
  "eventType": A => A.createEventType(),
  "eventField": A => A.createEventField(),
  "companyField": A => A.createCompanyField(),
  "eventValidator": A => A.createEventValidator(),
}

let sidebar_left = (S, A) => S["UIstate"].currentPage !== "Admin" ? d("")
  : d([
      d( ["attribute", "eventType", "eventField", "companyField", "eventValidator"].map( pageName => d( pageName, {class: pageName === S["UIstate"].currentSubPage ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {currentSubPage : pageName} ) )  )),
      d( S.getAll(S["UIstate"].currentSubPage).map( Entity => Entity["entity/category"] ).filter(filterUniqueValues).map( category => d( category, {class: category === S["UIstate"].selectedCategory ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {selectedCategory : category} ) )  )),
      d( S.getAll( S["UIstate"].currentSubPage )
        .filter( Entity => Entity["entity/category"] === S["UIstate"].selectedCategory )
        .map( Entity => d( Entity["entity/label"], {class: Entity.entity === S["UIstate"].selectedEntity ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {selectedEntity : Entity.entity} ) ) )
        .concat( d("[Legg til ny]", {class: "textButton"}, "click", e => newEntityRouter[ S.getEntity(S["UIstate"].selectedEntity)["entity/type"] ](A) ) )
        )
  ], {style: "display:flex;"})

let sidebar_right = (S, A) => entityInspectorView(S, A, S.getEntity(S["UIstate"]["sidebar/selectedEntity"]) ) 

let entityInspectorView = (S, A, Entity) => Entity 
  ? d([
      h3(`[${Entity["entity"]}] ${Entity["entity/label"]}`, {style: `background-color: ${entityColors[Entity["entity/type"]]}; padding: 3px;`}),
      entityLabelAndValue(S, A, getAttributeEntityFromName(S, "entity/type"), String(Entity["entity/type"])),
      entityLabelAndValue(S, A, getAttributeEntityFromName(S, "entity/category"), String(Entity["entity/category"])),
      d("<br>"),
      d(Entity["entity/doc"]),
      d("Rediger", {class: "textButton"}, "click", e => A.updateLocalState({currentPage: "Admin", currentSubPage: Entity["entity/type"], selectedCategory: Entity["entity/category"], Entity: Entity.entity }))
    ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
  : d("")

let timelineView = (S, A) => d( S["selectedCompany"]["appliedEvents"].concat(S["selectedCompany"]["rejectedEvents"]).map( Event => eventView( S, Event, A )  )) 

let eventView = (S, Event , A) => {
  let eventType = S.getEntity(Event["eventAttributes"]["event/eventTypeEntity"])
  let eventFieldEntities = Object.keys(eventType["eventType/eventFieldConstructors"])

  return d([
    h3( eventType["entity/label"] ),
    d( eventType["eventType/eventAttributes"].map( attributeEntity => editableAttributeView(S, A, Event["eventAttributes"].entity, attributeEntity, Event["eventAttributes"][ S.getEntity(attributeEntity)["attr/name"] ])  )),
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
  let eventType = S.getEntity( selectedEvent["eventAttributes"]["event/eventTypeEntity"])

  return d([
    d([
      d("<", {class: "textButton"}, "click", e => A.updateLocalState({"companyDocPage/selectedVersion": Math.max(1, selectedVersion - 1 )  })),
      d(">", {class: "textButton"}, "click", e => A.updateLocalState({"companyDocPage/selectedVersion": Math.min(S["selectedCompany"]["appliedEvents"].length, selectedVersion + 1 ) })),
    ], {class: "shareholderRow"}),
    d([
      h3(`Attributter for hendelse ${selectedVersion}: ${eventType["entity/label"]}`),
      d( eventType["eventType/eventAttributes"].map( attributeEntity => editableAttributeView(S, A, selectedEvent["eventAttributes"].entity, attributeEntity, selectedEvent["eventAttributes"][ S.getEntity(attributeEntity)["attr/name"] ])  )),
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

  let entityObjects = S.getAll("companyField")

  let categories = entityObjects.map( entityObject => entityObject["entity/category"]).filter(filterUniqueValues)

  return d([
    h3(`Hele Selskapsdokumentet etter hendelse ${selectedVersion}`),
    d(categories.map( category => d([
      d(`Kategori: ${category}`),
      d( Object.keys(S["selectedCompany"]["companyFields"][selectedVersion ])
        .filter( companyFieldEntity => S.getEntity(companyFieldEntity)["entity/category"] === category )
        .map( companyFieldEntity => entityLabelAndValue(S, A, companyFieldEntity, S["selectedCompany"]["companyFields"][ S["UIstate"]["companyDocPage/selectedVersion"] ][companyFieldEntity]) ))
    ]) ))
    
  ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

}

let latestDatomsPage = (S, A) => d([
  sidebar_left(S, A),
  d( S.getLatestTxs().map( tx => txView(S, A, tx) ) ),
  d("sidebar_right"),
], {class: "pageContainer"})

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
      S.getEntity(datom.entity) ? entityLabel(S, A, datom.entity) : d(String(datom.entity)),
      entityLabel(S, A, getAttributeEntityFromName(S, datom.attribute) ),
      input({value: String(datom.value), disabled: "disabled", class: "rightAlignText" })
      //entityRedlinedValue(String(datom.value), S.getEntity(datom.entity)[datom.attribute] )
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
    S.getAll("eventField")
      .filter( entity => !Object.keys(selectedEventType["eventType/eventFieldConstructors"]).includes( String(entity.entity) )  )
      .map( entity => returnObject({value: entity.entity, label: `${entity["entity/label"]}`}))
      .concat({value: 0, label: "Legg til"}), 
    e => A.updateEntityAttribute( selectedEventType.entity, "eventType/eventFieldConstructors", mergerino( selectedEventType["eventType/eventFieldConstructors"], createObject(submitInputValue(e), "return 0;" ) )  )   
    )
]) 

let multipleEntitySelectorView = (S, A, parentEntity, attributeName, allAllowedEntities) => {

  return d([
    entityLabel(S, A, getAttributeEntityFromName(S, attributeName)),
    d( S.getEntity(parentEntity)[attributeName] .map( entity => d([
      entityLabel(S, A, entity), 
      span(" [ Fjern ] ", "Fjern denne oppføringen.", {class: "textButton_narrow"}, "click", e => A.updateEntityAttribute( parentEntity, attributeName, S.getEntity(parentEntity)[attributeName].filter( e => e !== entity )  )  )
      ]) 
    ).concat( dropdown(
      0,
      allAllowedEntities
        .filter( Entity => Entity[attributeName] ? !Entity[attributeName].includes( Entity.entity ) : true  )
        .map( Entity => returnObject({value: Entity.entity, label: `${Entity["entity/label"]}`})).concat({value: 0, label: "Legg til"}), 
      e => A.updateEntityAttribute( parentEntity, attributeName, S.getEntity(parentEntity)[attributeName].concat( Number(submitInputValue(e)) )  )   
      )  ) 
    )
  ], {class: "eventAttributeRow"})
}

let functionStringView = (S, A, entity, attributeName) => d([
  entityLabel(S, A, getAttributeEntityFromName(S, attributeName)),
  textArea( S.getEntity(entity )[attributeName],{class: "textArea_code"} ,e => A.updateEntityAttribute(entity, attributeName, submitInputValue(e).replaceAll(`"`, `'`) ) )
], {class: "eventAttributeRow"})

let newEventDropdown = (S, A, Event) => dropdown( "", 
  S.getAll("eventType").map( Entity => returnObject({value: Entity.entity, label: Entity["entity/label"] }) ).concat({value: "", label: "Legg til hendelse etter denne"}),
  e => A.createEvent(Event, Number(submitInputValue(e)) )
)

let editableAttributeWithStaticDropdown = (S, A, entity, attributeName, options) => d([
  entityLabel(S, A, getAttributeEntityFromName(S, attributeName)),
  staticDropdown(S, A, entity, attributeName, options)
], {class: "columns_3_1"})

let staticDropdown = (S, A, entity, attributeName, options) => dropdown(
  S.getEntity(entity)[attributeName], 
  options.map( option => returnObject({value: option, label: `${option}`})).concat({value: "", label: "[empty]"}), 
  e => A.updateEntityAttribute(entity, attributeName, submitInputValue(e) )
)

let defaultEntityFields = (S, A, selectedEntity) => d([
  h3( `[${selectedEntity["entity"]}]  ${selectedEntity["entity/type"]} /  ${selectedEntity["entity/category"]} /  ${selectedEntity["entity/label"]}`, {style: `background-color: ${getEntityColor(S, selectedEntity["entity"])}; padding: 4px;`}),
  entityIDWithLabel(S, A, selectedEntity.entity),
  editableAttributeView(S, A, selectedEntity["entity"], getAttributeEntityFromName(S, "entity/label"), selectedEntity["entity/label"]  ),
  editableAttributeView(S, A, selectedEntity["entity"], getAttributeEntityFromName(S, "entity/category"), selectedEntity["entity/category"]  ),
  editableAttributeView(S, A, selectedEntity["entity"], getAttributeEntityFromName(S, "entity/doc"), selectedEntity["entity/doc"]  ),
  editableAttributeView(S, A, selectedEntity["entity"], getAttributeEntityFromName(S, "entity/note"), selectedEntity["entity/note"]  )
])

let adminView_attribute = (S, A, selectedEntity) =>  d([
  defaultEntityFields(S, A, selectedEntity),
  editableAttributeView(S, A, selectedEntity["entity"], getAttributeEntityFromName(S, "attr/name"), selectedEntity["attr/name"]  ),
  editableAttributeWithStaticDropdown(S, A, selectedEntity["entity"], "attr/valueType", ['string', 'number', 'object', 'boolean', 'ref']),
  functionStringView(S, A, selectedEntity["entity"], "attribute/validatorFunctionString")
],{class: "feedContainer"})

let adminView_eventType = (S, A, selectedEntity) =>  d([
  defaultEntityFields(S, A, selectedEntity),
  multipleEntitySelectorView(S, A, selectedEntity.entity, "eventType/eventAttributes", S.getAll("attribute")),
  multipleEntitySelectorView(S, A, selectedEntity.entity, "eventType/eventValidators", S.getAll("eventValidator")),
  multipleEntitySelectorView(S, A, selectedEntity.entity, "eventType/requiredCompanyFields", S.getAll("companyField")),
  eventFieldConstructorsView(S, A, selectedEntity),
  retractEntityButton(A, selectedEntity["entity"])
],{class: "feedContainer"})

let adminView_eventField = (S, A, selectedEntity) =>  d([
  defaultEntityFields(S, A, selectedEntity),
  multipleEntitySelectorView(S, A, selectedEntity.entity, "eventField/companyFields", S.getAll("companyField")),
  retractEntityButton(A, selectedEntity["entity"])
],{class: "feedContainer"})

let adminView_companyField = (S, A, selectedEntity) =>  d([
  defaultEntityFields(S, A, selectedEntity),
  functionStringView(S, A, selectedEntity["entity"], "companyField/constructorFunctionString"),
  multipleEntitySelectorView(S, A, selectedEntity.entity, "companyField/companyFields", S.getAll("companyField")),
  retractEntityButton(A, selectedEntity["entity"])
],{class: "feedContainer"})

let adminView_eventValidator = (S, A, selectedEntity) =>  d([
  defaultEntityFields(S, A, selectedEntity),
  functionStringView(S, A, selectedEntity["entity"], "eventValidator/validatorFunctionString"),
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
let adminPage = (S, A) => entityAdminRouter[S.getEntity(S["UIstate"]["selectedEntity"])["entity/type"]](S, A, S.getEntity(S["UIstate"]["selectedEntity"]) )