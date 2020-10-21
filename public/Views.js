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
let dropdown = (value, optionObjects, updateFunction) => htmlElementObject("select", {id: getNewElementID(), style:"padding: 1em; border: 1px solid lightgray"}, optionObjects.map( o => `<option value="${o.value}" ${o.value === value ? `selected="selected"` : ""}>${o.label}</option>` ).join(''), "change", e => {
  let dropdown = document.getElementById(e.srcElement.id)
  dropdown.style = "background-color: darkgray;"
  updateFunction(e)
}   )


let submitButton = (label, onClick) => d(label, {class: "textButton"}, "click", e => {
  let button = document.getElementById(e.srcElement.id)
  button.style = "background-color: darkgray;"
  button.innerHTML = "Laster.."
  onClick(e)
}  )

let retractEntityButton = (A, entity) => submitButton("Slett", e => A.retractEntity(entity) )

//Basic entity views

let getEntityColor = (S, entity) => S.getEntity( S.getEntity(entity)[ "entity/entityType" ] )["entityType/color"]
let editableAttributeView = (S, A, entity, attributeName, value) => d([
  entityLabel(S, A, getAttributeEntityFromName(S, attributeName) ),
  input(
    {value: value, style: `text-align: right; ${ validateAttributeValue(S, getAttributeEntityFromName(S, attributeName), value ) ? "" : "background-color: #fb9e9e; " }`}, 
    "change", 
    e => A.updateEntityAttribute( entity, attributeName, S.getEntity(getAttributeEntityFromName(S, attributeName))["attr/valueType"] === "number" ? Number(submitInputValue(e)) : submitInputValue(e)) 
  ),
  ], {class: "columns_3_1"})


let selectShareholderView = (S, A, Event) => d([
  entityLabel(S, A, 8807 ),
  Object.keys(Event).includes("companyVariables") 
    ?  Object.keys(Event["companyVariables"]).includes("8688") 
      ? dropdown(
          Event["eventAttributes"]["event/selectShareholder"], 
          Event["companyVariables"][8688]
            .map( shareholder => returnObject({value: shareholder.shareholderID, label: shareholder.name }) )
            .concat({value: "", label: "Ingen aksjonær valgt."}), 
            e => A.updateEntityAttribute(Event["eventAttributes"].entity, "event/selectShareholder", submitInputValue(e) ) 
          ) 
      : d("Error")
    : d("Error")
], {class: "columns_3_1"})



let entityLabel = (S, A, entity, onClick) => d( [
  d([
    span( `${ S.getEntityLabel(entity)}`, `[${entity}] ${S.getEntityDoc(entity)}`, {class: "entityLabel", style: `background-color: ${getEntityColor(S, entity)};`}, (typeof onClick === "undefined") ? null : "click", onClick ),
    entityInspectorPopup(S, A, entity ),
  ], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"} )

let entityValue = (value) => d( [
  d(`${JSON.stringify(value)}`, {class: typeof value === "number" ? "rightAlignText" : "" } )
]) 

let entityLabelAndValue = (S, A, entity, value) => d([
  entityLabel(S, A, entity),
  entityValue(value)
], {class: "eventInspectorRow"})

let entityLabelWithoutPopup = (S, A, entity, value) => d( [
  span( `${ S.getEntityLabel(entity)}`, `[${entity}] ${S.getEntityDoc(entity)}`, {class: "entityLabel", style: `background-color: ${getEntityColor(S, entity)};`}, "click", e => A.updateLocalState({"sidebar/selectedEntity": entity}) ),
  entityValue(value)
], {style:"display: inline-flex;"} )

let entityIDWithLabel = (S, A, entity) => d([
  d( [
    span( `EntitetsID`, `ID-nummeret til entiteten i databasen`, {style: `background-color: light-blue;`} )
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
    d("Logg ut", {class: "textButton"}, "click", ),
    d("Innstillinger", {class: "textButton"}, "click", e => console.log("Innstillinger!"))
  ], {style: "display:flex;"} )
], {style: "padding-left:3em; display:flex; justify-content: space-between;"})

let companySelectionMenuRow = (S, A) => d( S.getAllOrgnumbers().map( orgnumber => d( orgnumber, {class: orgnumber === S["UIstate"].selectedOrgnumber ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {selectedOrgnumber : orgnumber} ) )  ).concat(d( "+", {class: "textButton"}, "click", e => console.log("TBD...") )), {style: "display:flex;"}) 
let pageSelectionMenuRow = (S, A) => d( ["timeline", "companyDoc", "Admin", "Admin/Datomer", "Admin/Entitet"].map( pageName => d( pageName, {class: pageName === S["UIstate"].currentPage ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {currentPage : pageName} ) )  ), {style: "display:flex;"})

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
  "Admin/Entitet": (S, A) => entityPage( S, A ),
}

let sortEntitiesAlphabeticallyByLabel = ( a , b ) => ('' + a["entity/label"]).localeCompare(b["entity/label"])

let sidebar_left = (S, A) => S["UIstate"].currentPage == "Admin"
? d([
      d( S.getAll("entityType")
        .filter( e => ![7790, 7806].includes(e.entity)  ) //Not event or tx
        .sort( sortEntitiesAlphabeticallyByLabel )
        .map( Entity => d( 
          Entity["entity/label"], 
          {class: Entity.entity === S["UIstate"].selectedEntityType ? "textButton textButton_selected" : "textButton"}, 
          "click", 
          e => A.updateLocalState(  {
            selectedEntityType : Entity.entity, 
            selectedCategory: S.findEntities( e => e["entity/entityType"] === Entity.entity )[0]["entity/category"],
            selectedEntity: S.findEntities( e => e["entity/entityType"] === Entity.entity )[0]["entity"],
           } ) 
          )  )
      ),
      d( S.findEntities( e => e["entity/entityType"] === S["UIstate"].selectedEntityType ).map( Entity => Entity["entity/category"] ).filter(filterUniqueValues)
        .sort( ( a , b ) => ('' + a).localeCompare(b) )
        .map( category => d( 
          category, 
          {class: category === S["UIstate"].selectedCategory ? "textButton textButton_selected" : "textButton"}, 
          "click", 
          e => A.updateLocalState(  {selectedCategory : category, selectedEntity: S.findEntities( e => e["entity/entityType"] === S["UIstate"].selectedEntityType && e["entity/category"] === category)[0]["entity"]} )
          )  )
      ),
      d( S.findEntities( e => e["entity/entityType"] === S["UIstate"].selectedEntityType && e["entity/category"] === S["UIstate"].selectedCategory )
        .sort( sortEntitiesAlphabeticallyByLabel )
        .map( Entity => d( Entity["entity/label"], {class: Entity.entity === S["UIstate"].selectedEntity ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {selectedEntity : Entity.entity} ) ) )
        )
  ], {style: "display:flex;"})
:  d("")

let sidebar_right = (S, A) => d("")

let entityInspectorPopup = (S, A, entity) => d([
      h3(`[${entity}] ${S.getEntityLabel(entity)}`, {style: `background-color: ${getEntityColor(S, entity)}; padding: 3px;`}),
      entityLabelWithoutPopup(S, A, 7754, S.getEntity(entity)["entity/entityType"]),
      entityLabelWithoutPopup(S, A, 5712, S.getEntityCategory(entity)),
      d("<br>"),
      d(S.getEntityDoc(entity)),
      d("Rediger", {class: "textButton"}, "click", e => A.updateLocalState({currentPage: "Admin", selectedEntityType: S.getEntity(entity)["entity/entityType"], selectedCategory:  S.getEntityCategory(entity), selectedEntity: entity }))
    ], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

let timelineView = (S, A) => S["selectedCompany"] 
  ? d( S["selectedCompany"]["appliedEvents"].concat(S["selectedCompany"]["rejectedEvents"]).map( Event => eventView( S, Event, A )  )) 
  : d("Noe er galt med selskapets tidslinje")

let eventView = (S, Event , A) => {
  let eventType = S.getEntity(Event["eventAttributes"]["event/eventTypeEntity"])
  if(eventType === null){return d([d("ERROR: Hendelsestypen finnes ikke"), d(JSON.stringify(Event))], {class: "feedContainer"})}
  let eventFieldEntities = Object.keys(eventType["eventType/eventFieldConstructors"])

  return d([
    h3( eventType["entity/label"] ),
    entityLabel(S, A, eventType.entity),
    eventAttributesView(S, A, Event),
    //d( eventType["eventType/eventAttributes"].map( attributeEntity => editableAttributeView(S, A, Event["eventAttributes"].entity, S.getEntity(attributeEntity)["attr/name"], Event["eventAttributes"][ S.getEntity(attributeEntity)["attr/name"] ])  )),
    d( eventFieldEntities.map( eventFieldEntity => Event["eventFields"] ? entityLabelAndValue(S, A, eventFieldEntity, Event["eventFields"][eventFieldEntity]) : d("ERROR")  )),
    d(Event["errors"] 
      ? Event["errors"].map( eventErrorMessageView )
      : ""),
      retractEntityButton( A, Event["eventAttributes"]["entity"]),
    newEventDropdown(S, A, Event)
], {class: "feedContainer"} )
}


let eventAttributesView = (S, A, Event) => d(S.getEntity(Event["eventAttributes"]["event/eventTypeEntity"])["eventType/eventAttributes"].map( attributeEntity => (attributeEntity === 8807)
    ? selectShareholderView(S, A, Event)
    : editableAttributeView(S, A, Event["eventAttributes"].entity, S.getEntity(attributeEntity)["attr/name"], Event["eventAttributes"][ S.getEntity(attributeEntity)["attr/name"] ]) 
    ))

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
      d( eventType["eventType/eventAttributes"].map( attributeEntity => editableAttributeView(S, A, selectedEvent["eventAttributes"].entity, S.getEntity(attributeEntity)["attr/name"], selectedEvent["eventAttributes"][ S.getEntity(attributeEntity)["attr/name"] ])  )),
    ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
    d("<br>"),
    d([
      h3(`Hendelsesrapport for hendelse ${selectedVersion}: ${eventType["eventType/label"]}`),
      d( Object.keys(eventType["eventType/eventFieldConstructors"]).map( eventFieldEntity => entityLabelAndValue(S, A, eventFieldEntity, selectedEvent["eventFields"][eventFieldEntity]) ) )
    ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
    d("<br>"),
    accumulatedEventChangesView(S, A, selectedVersion),
    d("<br>"),
    companyDocView(S, A, selectedVersion),
  ] )
}

let newTransactionView = (S, A, eventFieldEntity, records) => d([
  entityLabel(S, A, eventFieldEntity),
  d([
    d(`Nye posteringer:`),
    d([
      d(`#`),
      d(`Konto`),
      d(`Beløp`),
    ], {class: "columns_1_1_1"}),
    d( records.map( (record, index) => d([
      d(`${index}`),
      d(`${record.account}`, {class: "rightAlignText"}),
      d(`${record.amount}`, {class: "rightAlignText"}),
    ], {class: "columns_1_1_1"}) ) ),
    d([
      d(``),
      d(`Sum`),
      d(`${records.reduce(  (sum, record) => sum + record.amount, 0 )}`, {class: "rightAlignText"}),
    ], {class: "columns_1_1_1"}),
  ], {style: "border: 1px solid gray;"})
], {class: "eventInspectorRow"})

let accumulatedEventChangesView = (S, A, selectedVersion) => {

  let entityObjects = S.getAll("companyField")

  let categories = entityObjects.map( entityObject => entityObject["entity/category"]).filter(filterUniqueValues)

  return d([
    h3(`Axels database etter hendelse ${selectedVersion}`),
    d( Object.keys(S["selectedCompany"]["companyFields"][selectedVersion ])
    .map( entity => S.getEntity(entity) )
    .filter( Entity => Entity["entity/category"] === "ADB" )
        .map( Entity => {

          let values = S["selectedCompany"]["companyFields"][ S["UIstate"]["companyDocPage/selectedVersion"] ][Entity.entity] ? S["selectedCompany"]["companyFields"][ S["UIstate"]["companyDocPage/selectedVersion"] ][Entity.entity] : []

          return d([
            entityLabel(S, A, Entity.entity),
            d(values.map( value => d(JSON.stringify(value)) ))
          ])

        }))
  ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

}

let companyDocView = (S, A, selectedVersion) => {

  let entityObjects = S.getAll("companyField")

  let categories = entityObjects.map( entityObject => entityObject["entity/category"]).filter(filterUniqueValues)

  return d([
    h3(`Hele Selskapsdokumentet etter hendelse ${selectedVersion}`),
    d(categories.map( category => d([
      d(`Kategori: ${category}`),
      d( Object.keys(S["selectedCompany"]["companyFields"][selectedVersion ])
        .map( entity => S.getEntity(entity) )
        .filter( Entity => Entity["entity/category"] !== "ADB" )
        .filter( Entity => Entity["entity/category"] === category )
        .map( Entity => {

          let value = S["selectedCompany"]["companyFields"][ S["UIstate"]["companyDocPage/selectedVersion"] ][Entity.entity]
          let prevValue = S["selectedCompany"]["companyFields"][ S["UIstate"]["companyDocPage/selectedVersion"] - 1 ][Entity.entity]

          return (value === prevValue) ? entityLabelAndValue(S, A, Entity.entity, value) : entityLabelAndRedlinedValue(S, A, Entity.entity, value , prevValue )

        }))
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
    d("Verdi"),
    d("Retraction?", {class: "rightAlignText"})
  ], {class: "columns_1_1_1_1"}),
  d( tx.datoms
    .filter( datom => datom.entity === tx.datoms.map( d => d.entity ).sort()[0] )
    .map( datom => d([
      //entityLabel(S, A, datom.entity),
      datom.isAddition 
        ? S.getEntity(datom.entity) ? entityLabel(S, A, datom.entity) : d(String(datom.entity))
        : d(String(datom.entity)),
      entityLabel(S, A, getAttributeEntityFromName(S, datom.attribute) ),
      input({value: String(datom.value), disabled: "disabled", class: "rightAlignText" }),
      datom.isAddition ? d("") : d("true", {class: "rightAlignText", style: "color: red;"} ),
      //entityRedlinedValue(String(datom.value), S.getEntity(datom.entity)[datom.attribute] )
    ], {class: "columns_1_1_1_1"})  )),
    tx.datoms.some( datom => !datom.isAddition ) 
      ? submitButton("Gjennopprett slettet enhet", e => A.undoTx(tx))
      : d("")
], {class: "feedContainer"})


let entityPage = (S, A) => d([
  sidebar_left(S, A),
  d([
    input({value: S["UIstate"]["selectedAdminEntity"]}, "change", e => A.updateLocalState({selectedAdminEntity: Number(submitInputValue(e)) })),
    entityAdminView(S, A, S["UIstate"]["selectedAdminEntity"]),
  ], {class: "feedContainer"}),
  d(""),
], {class: "pageContainer"})



let entityAdminView = (S, A, entity) => d([
  h3(`[${entity}] ${S.getEntityLabel(entity)}`, {style: `background-color: ${getEntityColor(S, entity)}; padding: 3px;`}),
  d(
    Object.keys(S.getEntity(entity))
      .filter( attr => attr !== "entity" )
      .map( attributeName => editableAttributeView(S, A, entity, attributeName, S.getEntity(entity)[attributeName] )  ) //d(`${attributeName}: ${S.getEntity(entity)[attributeName]}`)
  )
])


let eventFieldConstructorsView = (S, A, entity) => d([
  d(
    Object.keys(S.getEntity(entity)["eventType/eventFieldConstructors"]).map( eventFieldEntity => d([
      entityLabel(S, A, eventFieldEntity ),
      textArea( S.getEntity(entity )["eventType/eventFieldConstructors"][eventFieldEntity],{class: "textArea_code"} , e => A.updateEntityAttribute( entity, "eventType/eventFieldConstructors",  mergerino( S.getEntity(entity)["eventType/eventFieldConstructors"], createObject(eventFieldEntity, submitInputValue(e).replaceAll(`"`, `'`) ) )  )),
      span(" [ Fjern ] ", "Fjern denne oppføringen.", {class: "textButton_narrow"}, "click", e => A.updateEntityAttribute( entity, "eventType/eventFieldConstructors",  mergerino( S.getEntity(entity)["eventType/eventFieldConstructors"], createObject(eventFieldEntity, undefined ) )  )  )
    ], {class: "eventFieldConstructorRow"}))
  ),
  dropdown(
    0,
    S.getAll("eventField")
      .filter( e => !Object.keys(S.getEntity(entity)["eventType/eventFieldConstructors"]).includes( String(e.entity) )  )
      .map( e => returnObject({value: e.entity, label: `${e["entity/label"]}`}))
      .concat({value: 0, label: "Legg til"}), 
    e => A.updateEntityAttribute( entity, "eventType/eventFieldConstructors", mergerino( S.getEntity(entity)["eventType/eventFieldConstructors"], createObject(submitInputValue(e), "return 0;" ) )  )   
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

let entityDropdownView = (S, A, parentEntity, attributeName, allAllowedEntities) => d([
    entityLabel(S, A, getAttributeEntityFromName(S, attributeName)),
    dropdown(
      S.getEntity(parentEntity)[attributeName], 
      allAllowedEntities.map( E => returnObject({value: E.entity, label: E["entity/label"]})), 
      e => A.updateEntityAttribute( parentEntity, attributeName, Number(submitInputValue(e))  )   
    )
], {class: "eventAttributeRow"})

let singleEntitySelectorView = (S, A, parentEntity, attributeName, allAllowedEntities) => d([
  entityLabel(S, A, getAttributeEntityFromName(S, attributeName)),
  (typeof S.getEntity(parentEntity)[attributeName] === "number")
    ? entityLabel(S, A, S.getEntity(parentEntity)[attributeName] )
    : d("[Ingen entitet valgt]"),
  d("<br>"),
  input({value: S["UIstate"]["currentSearchString"] }, "input", e => A.updateLocalState({currentSearchString: submitInputValue(e)}) ),
  d(
    allAllowedEntities
      .filter( Entity => Entity["entity/label"].toUpperCase().search( S["UIstate"]["currentSearchString"].toUpperCase() ) >= 0 )
      .map( Entity => entityLabel(S, A, Entity.entity, e => {
        A.updateEntityAttribute( parentEntity, attributeName, Entity.entity  )
        A.updateLocalState({currentSearchString: "Søk her for å bytte"})
      }   ) )
      , {class: "searchBoxContainer"})
], {class: "eventAttributeRow"})



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

let defaultEntityFields = (S, A, entity) => d([
  h3( `[${entity}]  ${S.getEntityLabel(entity)}`, {style: `background-color: ${getEntityColor(S, entity)}; padding: 4px;`}),
  entityIDWithLabel(S, A, entity),
  singleEntitySelectorView(S, A, entity, "entity/entityType", S.getAll("entityType") ),
  editableAttributeView(S, A, entity, "entity/label", S.getEntityLabel(entity)  ),
  editableAttributeView(S, A, entity, "entity/category", S.getEntityCategory(entity)  ),
  editableAttributeView(S, A, entity, "entity/doc", S.getEntityDoc(entity)  ),
  editableAttributeView(S, A, entity, "entity/note", S.getEntityNote(entity)  )
])

let adminView_attribute = (S, A, entity) =>  d([
  defaultEntityFields(S, A, entity),
  editableAttributeView(S, A, entity, "attr/name", S.getEntity(entity)["attr/name"]  ),
  editableAttributeWithStaticDropdown(S, A, entity, "attr/valueType", ['string', 'number', 'object', 'boolean', 'ref']),
  entityDropdownView(S, A, entity, "attribute/valueType", S.getAll("valueType") ),
  singleEntitySelectorView(S, A, entity, "attribute/valueType", S.getAll("valueType") ),
  functionStringView(S, A, entity, "attribute/validatorFunctionString"),
  d("<br>"),
  d( ` Antall ganger benyttet: ${S.findEntities( e => Object.keys(e).includes( S.getEntity(entity)["attr/name"] ) ).length}` ),
  d("<br>"),
  submitButton("Legg til ny", e => A.createAttribute())
],{class: "feedContainer"})

let adminView_eventType = (S, A, entity) =>  d([
  defaultEntityFields(S, A, entity),
  multipleEntitySelectorView(S, A, entity, "eventType/eventAttributes", S.getAll("attribute").filter( e => !["[Arkiverte attributter]", "[db]"].includes(e["entity/category"]) ) ),
  multipleEntitySelectorView(S, A, entity, "eventType/eventValidators", S.getAll("eventValidator")),
  multipleEntitySelectorView(S, A, entity, "eventType/requiredCompanyFields", S.getAll("companyField")),
  eventFieldConstructorsView(S, A, entity),
  retractEntityButton(A, entity),
  d("<br>"),
  submitButton("Legg til ny", e => A.createEntity("eventType"))
],{class: "feedContainer"})

let adminView_eventField = (S, A, entity) =>  d([
  defaultEntityFields(S, A, entity),
  multipleEntitySelectorView(S, A, entity, "eventField/companyFields", S.getAll("companyField")),
  retractEntityButton(A, entity),
  d("<br>"),
  submitButton("Legg til ny", e => A.createEntity("eventField"))
],{class: "feedContainer"})

let adminView_companyField = (S, A, entity) =>  d([
  defaultEntityFields(S, A, entity),
  functionStringView(S, A, entity, "companyField/constructorFunctionString"),
  multipleEntitySelectorView(S, A, entity, "companyField/companyFields", S.getAll("companyField")),
  retractEntityButton(A, entity),
  d("<br>"),
  submitButton("Legg til ny", e => A.createEntity("companyField"))
],{class: "feedContainer"})

let adminView_eventValidator = (S, A, entity) =>  d([
  defaultEntityFields(S, A, entity),
  functionStringView(S, A, entity, "eventValidator/validatorFunctionString"),
  editableAttributeView(S, A, entity, "eventValidator/errorMessage", S.getEntity(entity)["eventValidator/errorMessage"]  ),
  retractEntityButton(A, entity),
  d("<br>"),
  submitButton("Legg til ny", e => A.createEntity("eventValidator"))
],{class: "feedContainer"})

let adminView_valueTypes = (S, A, entity) =>  d([
  defaultEntityFields(S, A, entity),
  editableAttributeView(S, A, entity, "valueType/jsType", S.getEntity(entity)["valueType/jsType"]  ),
  functionStringView(S, A, entity, "valueType/validatorFunctionString"),
  retractEntityButton(A, entity),
  d("<br>"),
  submitButton("Legg til ny", e => A.createEntity("valueType"))
],{class: "feedContainer"})

let adminView_entityTypes = (S, A, entity) =>  d([
  defaultEntityFields(S, A, entity),
  multipleEntitySelectorView(S, A, entity, "entityType/attributes", S.getAll("attribute").filter( e => e["entity/category"] === "[db]" ) ),
  editableAttributeView(S, A, entity, "entityType/color", S.getEntity(entity)["entityType/color"]  ),
  //editableAttributeView(S, A, entity, "valueType/jsType", S.getEntity(entity)["valueType/jsType"]  ),
  //functionStringView(S, A, entity, "valueType/validatorFunctionString"),
  retractEntityButton(A, entity),
  d("<br>"),
  submitButton("Legg til ny", e => A.createEntity("entityType"))
],{class: "feedContainer"})


let entityAdminRouter = {
  7684: adminView_attribute,
  7686: adminView_eventType,
  7780: adminView_eventField,
  7784: adminView_companyField,
  7728: adminView_eventValidator,
  7689: adminView_valueTypes,
  7794: adminView_entityTypes,
}
let adminPage = (S, A) => entityAdminRouter[ S.getEntity(S["UIstate"]["selectedEntity"])["entity/entityType"] ](S, A, S["UIstate"]["selectedEntity"] )