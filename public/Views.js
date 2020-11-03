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

let isUndefined = value => typeof value === "undefined"
let isNull = value => typeof value === "null"
let isString = value => typeof value === "string"
let isNumber = value => typeof value === "number"
let isObject = value => typeof value === "object"
let isFunction = value => typeof value === "function"
let isBoolean = value => typeof value === "boolean"
let isArray = value => Array.isArray(value)

let filterUniqueValues = (value, index, self) => self.indexOf(value) === index

let randBetween = (lowest, highest) => Math.round( lowest + Math.random() * (highest - lowest) )

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
let dropdown = (value, optionObjects, updateFunction) => htmlElementObject("select", {id: getNewElementID(), style:"padding: 1em; border: 1px solid lightgray; max-width: 300px;"}, optionObjects.map( o => `<option value="${o.value}" ${o.value === value ? `selected="selected"` : ""}>${o.label}</option>` ).join(''), "change", e => {
  let dropdown = document.getElementById(e.srcElement.id)
  dropdown.style = "background-color: darkgray;"
  updateFunction(e)
}   )
let checkBox = (isChecked, onClick) => input({type: "checkbox", value: isChecked}, "click", onClick)

let submitButton = (label, onClick) => d(label, {class: "textButton"}, "click", e => {
  let button = document.getElementById(e.srcElement.id)
  button.style = "background-color: darkgray;"
  button.innerHTML = "Laster.."
  onClick(e)
}  )

let retractEntityButton = (S, A, entity) => submitButton("Slett", async e => A.retractEntity( entity ))

//Basic entity views

let getEntityColor = (S, entity) => S.getEntity( S.getEntity(entity).type() ).getAttributeValue("entityType/color")

let entityLabel = (S, A, entity, onClick) => d( [
  d([
    span( `${ S.getEntity(entity).label()}`, `[${entity}] ${S.getEntity(entity).getAttributeValue("entity/category")}`, {class: "entityLabel", style: `background-color: ${getEntityColor(S, entity)};`}, (typeof onClick === "undefined") ? null : "click", onClick ),
    entityInspectorPopup(S, A, entity ),
  ], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"} )

let entityLabelWithCategory = (S, A, entity, onClick) => d( [
  d([
    span( `[${ S.getEntity(entity).getAttributeValue("entity/category")}] / ${ S.getEntity(entity).label()}`, `[${entity}] ${S.getEntity(entity).getAttributeValue("entity/category")}`, {class: "entityLabel", style: `background-color: ${getEntityColor(S, entity)};`}, (typeof onClick === "undefined") ? null : "click", onClick ),
    entityInspectorPopup(S, A, entity ),
  ], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"} )

let entityLabelAndValue = (S, A, entity, value) => {

  let valueView = S.getEntity(entity).getAttributeValue("attribute/valueType") === 32
    ? entityLabel(S, A, value)
    : d(`${JSON.stringify(value)}`, {class: typeof value === "number" ? "rightAlignText" : "" } )


  return d([
    entityLabel(S, A, entity),
    valueView
  ], {class: "eventInspectorRow"})

} 

let entityLabelWithoutPopup = (S, A, entity, value) => d( [
  span( `${ S.getEntity(entity).label()}`, `[${entity}] ${S.getEntity(entity).getAttributeValue("entity/doc")}`, {class: "entityLabel", style: `background-color: ${getEntityColor(S, entity)};`}, "click", e => A.updateLocalState({"sidebar/selectedEntity": entity}) ),
  d(`${JSON.stringify(value)}`, {class: typeof value === "number" ? "rightAlignText" : "" } )
], {style:"display: inline-flex;"} )

let entityRedlinedValue = (value, prevValue) => d( [
  span( `${JSON.stringify(prevValue)}`, "", {class: "redlineText"}),
  span( `${JSON.stringify(value)}`),
], {style:"display: inline-flex;justify-content: flex-end;"} ) 

//Page frame

let headerBarView = (S) => d([
  d('<header><h1>Holdingservice Beta</h1></header>'),
  d([
    d("Logg ut", {class: "textButton"}, "click", ),
    d("Innstillinger", {class: "textButton"}, "click", e => console.log("Innstillinger!"))
  ], {style: "display:flex;"} )
], {style: "padding-left:3em; display:flex; justify-content: space-between;"})

let companySelectionMenuRow = (S, A) => d( S.orgNumbers.map( orgnumber => d( String(orgnumber), {class: orgnumber === S["UIstate"].selectedOrgnumber ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {selectedOrgnumber : orgnumber} ) )  ).concat(submitButton( "+", e => A.createCompany() )), {style: "display:flex;"}) 
let pageSelectionMenuRow = (S, A) => d( ["timeline", "Rapporter", "Admin/DB", "Admin/Entitet"].map( pageName => d( pageName, {class: pageName === S["UIstate"].currentPage ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {currentPage : pageName} ) )  ), {style: "display:flex;"})
//"Admin/Hendelsesattributter", "Admin/Hendelsestyper", 

let generateHTMLBody = (S, A) => [
  headerBarView(S),
  companySelectionMenuRow(S, A),
  pageSelectionMenuRow(S, A),
  pageRouter[ S["UIstate"].currentPage ]( S, A ),
]


let pageRouter = {
  "timeline": (S, A) => timelineView(S, A),
  "Rapporter": (S, A) => reportsPage( S, A ),
  "Admin/DB": (S, A) => adminPage( S, A ),
  "Admin/Hendelsesattributter": (S, A) => eventAttributesPage( S, A ),
  "Admin/Hendelsestyper": (S, A) => eventTypesPage( S, A ),
  "Admin/Entitet": (S, A) => genericEntityWithHistoryView(S, A, S["UIstate"]["selectedEntity"]),
}

let eventAttributesPage = (S, A) => d([
  d([
    submitButton("Opprett hendelsesattributt", e => A.createEntity( 42 ) ),
    input({value: S.UIstate["eventAttributeSearchString"]}, "change", e => A.updateLocalState({"eventAttributeSearchString": e.srcElement.value }) ),
    d( S.Attributes
        .filter( Attribute => !Attribute.getAttributeValue("entity/category").startsWith("[db]") )
        .filter( Attribute => Attribute.getAttributeValue("entity/label").toLowerCase().includes(S.UIstate["eventAttributeSearchString"].toLowerCase()) )
        .sort( sortEntitiesAlphabeticallyByLabel )
        .slice(0, 20)
        .map( Entity => entityLabelWithCategory(S, A, Entity.entity, e => A.updateLocalState(  {selectedEntity : Entity.entity} ) ) )
        )
  ]),
  genericEntityView(S, A, S["UIstate"]["selectedEntity"]),
  d("")
], {class: "pageContainer"})

let eventTypesPage = (S, A) => d([
  d([
    submitButton("Opprett hendelsestype", e => A.createEntity( 43 ) ),
    d(  S.allEventTypes
        .sort( sortEntitiesAlphabeticallyByLabel )
        .map( Entity => entityLabelWithCategory(S, A, Entity.entity, e => A.updateLocalState(  {selectedEntity : Entity.entity} ) ) )
        )
  ]),
  genericEntityView(S, A, S["UIstate"]["selectedEntity"]),
  d("")
], {class: "pageContainer"})

let sortEntitiesAlphabeticallyByLabel = ( a , b ) => ('' + a.label()).localeCompare(b.label())

let sidebar_left = (S, A) => d([
      d( S.EntityTypes
        .filter( e => ![7790, 7806].includes(e.entity)  ) //Not event or tx
        .sort( sortEntitiesAlphabeticallyByLabel )
        .map( Entity => entityLabel(S, A, Entity.entity, e => A.updateLocalState(  {
          selectedEntityType : Entity.entity, 
          selectedCategory: null,
          selectedEntity: null
          }))
        )
      ),
      d( S.selectedCategories.map( Entity => Entity.getAttributeValue("entity/category") ).filter(filterUniqueValues)
        .sort( ( a , b ) => ('' + a).localeCompare(b) )
        .map( category => d( 
          category, 
          {class: category === S["UIstate"].selectedCategory ? "textButton textButton_selected" : "textButton", style: "background-color: #c9c9c9;" }, 
          "click", 
          e => A.updateLocalState(  {selectedCategory : category, selectedEntity: null} )
          )  )
      ),
      S["UIstate"].selectedCategory === null 
        ? d("Ingen kategori valgt") 
        : d( S.selectedEntities
          .sort( sortEntitiesAlphabeticallyByLabel )
          .map( Entity => entityLabel(S, A, Entity.entity, e => A.updateLocalState(  {selectedEntity : Entity.entity} ) ))
        )
  ], {style: "display:flex;"})

let entityInspectorPopup = (S, A, entity) => d([
      h3(`[${entity}] ${S.getEntity(entity).label()}`, {style: `background-color: ${getEntityColor(S, entity)}; padding: 3px;`}),
      d("<br>"),
      d(`Type: ${S.getEntity(S.getEntity(entity).getAttributeValue("entity/entityType")).label()}`),
      d(`Kategori: ${S.getEntity(entity).getAttributeValue("entity/category")}`),
      d("Rediger", {class: "textButton"}, "click", e => A.updateLocalState({currentPage: "Admin/DB", selectedEntityType: S.getEntity(entity).type(), selectedCategory:  S.getEntity(entity).category(), selectedEntity: entity }))
    ], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

let newDatomsView = (S, A, Datoms) => d([
  h3("Nye selskapsdatomer generert av hendelsen:"),
  d( Datoms.map( datom => d([
    span( `Selskapsentitet ${ datom.entity }`, ``, {class: "entityLabel", style: `background-color: lightgray;`} ),
    entityLabelAndValue(S, A, datom.attribute, datom.value),
  ], {class: "columns_1_3"} )) )
])

let timelineView = (S, A) => d([
  d(""),
  (S.selectedCompany.Events.length > 0)
  ? d( S.selectedCompany.Events.map( Event => eventView( S, Event, A )  )) 
  : d("Noe er galt med selskapets tidslinje"),
  d("")
], {class: "pageContainer"}) 

let eventView = (S, Event , A) => S.getEntity(Event.getAttributeValue("event/eventTypeEntity")) ? d([
  h3( S.getEntity(Event.getAttributeValue("event/eventTypeEntity")).label() ),
  entityView(S, A, Event.entity),
  entityLabelAndValue(S, A, 27, Event.getAttributeValue("event/eventTypeEntity") ),
  d(S.getEntity(Event.getAttributeValue("event/eventTypeEntity")).getAttributeValue("eventType/eventAttributes").map( attribute => attributeView(S, A, Event.entity, attribute) )),
  d("<br>"),
  S["selectedCompany"]["t"] >= Event.getAttributeValue("eventAttribute/1000") 
    ? newDatomsView(S, A, S["selectedCompany"].Datoms.filter( datom => datom.t === Event.getAttributeValue("eventAttribute/1000") )) 
    : d("Kan ikke vise hendelsens output"),
  d("<br>"),
  retractEntityButton(S, A, Event["entity"]),
  newEventDropdown(S, A, Event)
], {class: "feedContainer"} ) : d([
  entityView(S, A, Event.entity),
  d("<br>"),
  d(` Hendelsestypen [${Event.getAttributeValue("event/eventTypeEntity")}]  finnes ikke.`),
  d("<br>"),
  d( JSON.stringify(Event.current) ),
  retractEntityButton(S, A, Event["entity"]),
], {class: "feedContainer"})

let reportsPage = (S, A) => d([
  d( //Left sidebar
    S.Reports.map( Report => d([
      entityLabel(S, A, Report.entity, e => A.updateLocalState({selectedReport: Report.entity}))
    ])  )
    ),
  genericReportView(S, A, S["UIstate"]["selectedReport"]),
  d("")
], {class: "pageContainer"})

let versionSelector = (S, A) => d([
  d( `Viser rapporten etter hendelse [${S["UIstate"].selectedVersion} / ${S["selectedCompany"]["t"]}]`),
  d([
    submitButton("<<", e => A.updateLocalState({selectedVersion: 0}) ),
    submitButton("<", e => A.updateLocalState({selectedVersion: S["UIstate"].selectedVersion > 0 ? S["UIstate"].selectedVersion - 1 : 0}) ),
    submitButton(">", e => A.updateLocalState({selectedVersion: S["UIstate"].selectedVersion < S["selectedCompany"]["t"] ? S["UIstate"].selectedVersion + 1 : S["selectedCompany"]["t"]}) ),
    submitButton(">>", e => A.updateLocalState({selectedVersion: S["selectedCompany"]["t"]}) ),
  ], {class: "columns_1_1_1_1"})
  
], {class: "columns_1_1_1"})

//Report view

let genericReportView = (S, A, selectedReport) => {

  let Report = S.getEntity(selectedReport)
  let companyReport = S["selectedCompany"].getReport(selectedReport, S["UIstate"].selectedVersion )

  return d([
    versionSelector(S, A),
    h3(Report.label()),
    companyReport 
      ? d( Report.getAttributeValue("report/reportFields").map( reportField => reportFieldView(S, A, selectedReport, reportField.attribute, companyReport[reportField.attribute]) ) ) 
      : d("Rapporten er ikke tilgjengelig")
  ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
} 

let reportFieldView = (S, A, selectedReport, attribute, value) => {

  let customReportFieldViews = {
    "5578": reportFieldView_Datoms, //Tekst
    "5579": reportFieldView_Entities
  }

  return customReportFieldViews[attribute] ? customReportFieldViews[attribute](S, A, value) : entityLabelAndValue(S, A, attribute, value ? value : "na." )
}

let reportFieldView_Datoms = (S, A, Datoms) => d([
  d([
    d( "Entitet" ),
    d( "Attributt" ),
    d( "Verdi" ),
    d( "Hendelse #" ),
  ], {class: "columns_1_1_1_1"}),
  d(Datoms.map( Datom => d([
    d( String( Datom.entity ) ),
    entityLabel(S, A, Datom.attribute),
    d( JSON.stringify(Datom.value) ),
    d( String( Datom.t ) ),
  ], {class: "columns_1_1_1_1"}) ))
])

let reportFieldView_Entities = (S, A, Entities) => d([
  d(Entities.map( Entity => d([
    d(String( Entity.entity )),
    d(Object.keys(Entity)
      .filter( key => key !== "entity" && key !== "t" )
      .map( attribute => d([
        entityLabel(S, A, Number(attribute)),
        d( JSON.stringify(Entity[attribute] ) ),
    ], {class: "columns_1_1"}) )),
    d("<br>"),
  ])   ))
])



let newEventDropdown = (S, A, Event) => dropdown( 0, 
  S.allEventTypes.map( Entity => returnObject({value: Entity.entity, label: Entity.label() }) ).concat({value: 0, label: "Legg til hendelse etter denne"}),
  e => A.createEvent(Event, Number(submitInputValue(e)) )
)

let adminPage = (S, A) => d([
  sidebar_left(S, A),
  genericEntityView(S, A, S["UIstate"]["selectedEntity"]),
  d("")
], {class: "pageContainer"})



let entityView = (S, A, entity) => d([
  d([
    d([span( `Entitet`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`}, null )], {style:"display: inline-flex;"}),
    d(String(entity), {style: `text-align: right;`} )
  ], {class: "columns_1_1"}),
  d([
    d([span( `Versjon`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`}, null )], {style:"display: inline-flex;"}),
    d([
      submitButton("<<", e => S.getEntity(entity).setLocalState(S, {tx: S.getEntity(entity).versions[0]  })),
      submitButton("<", e => {
        let Entity = S.getEntity(entity)
        let versions = Entity.versions
        let selectedVersion = S.getEntity(entity).getLocalState().tx
        let prevVersion = versions.filter( tx => tx < selectedVersion ).length > 0 ? versions.filter( tx => tx < selectedVersion ).reverse()[0] : selectedVersion
        Entity.setLocalState(S, {tx: prevVersion  })
      }),
      d(`${S.getEntity(entity).versions.findIndex( v => v === S.getEntity(entity).getLocalState().tx ) + 1} / ${S.getEntity(entity).versions.length}`),
      submitButton(">", e => {
        let Entity = S.getEntity(entity)
        let versions = Entity.versions
        let selectedVersion = S.getEntity(entity).getLocalState().tx
        let nextVersion = versions.filter( tx => tx > selectedVersion ).length > 0 ? versions.filter( tx => tx > selectedVersion )[0] : selectedVersion
        Entity.setLocalState(S, {tx: nextVersion  })
      }),
      submitButton(">>", e => S.getEntity(entity).setLocalState(S, {tx: S.getEntity(entity).versions[S.getEntity(entity).versions.length - 1]  })),,
    ], {class: "columns_1_1_1_1_1"}),
    d( `${new Date(S.getEntity(entity).getLocalState().tx).toLocaleDateString()} ${new Date(S.getEntity(entity).getLocalState().tx).toLocaleTimeString()}`, {style: `text-align: right;`} )
  ], {class: "columns_1_1_1"}),
]) 


//Entity view

let datomView = (S, A, Datom) => {

  let genericValueTypeViews = {
    "30": input_text, //Tekst
    "31": input_number, //Tall
    "32": input_number, //Entitet
    "33": input_object, //Array
    "37": input_object, //Entiteter
    "34": input_function, //Funksjonstekst
    "35": input_object, //Objekt
    "36": input_object, //Bool
    "38": input_object, //valueTypeView_newDatoms,
    "39": input_object, //valueTypeView_reportFields,
    "40": input_object, //valueTypeView_staticDropdown,
    "41": input_object, //valueTypeView_companyEntityDropdown,
  }
  return singleRowLabel(S, A, S.attr(Datom.attribute) , genericValueTypeViews[ S.getEntity( S.attr(Datom.attribute) ).getAttributeValue("attribute/valueType")  ]( Datom ) )
}

let input_text = Datom => input(
  {value: Datom.value, style: ``},
  "change", 
  async e => await Datom.update( submitInputValue(e) )
)

let input_number = Datom => input(
    {value: String(Datom.value), style: `text-align: right;`}, 
    "change", 
    async e => await Datom.update( Number(submitInputValue(e)) )
)

let input_function = Datom => textArea(
  Datom.value, 
  {class:"textArea_code"}, 
  async e => await Datom.update( submitInputValue(e).replaceAll(`"`, `'`) )
)

let input_object = Datom => textArea(
  JSON.stringify(Datom.value),
  {class:"textArea_code"}, 
  async e => await Datom.update( JSON.parse( submitInputValue(e) ) )
)








let genericEntityWithHistoryView = (S, A, entity) =>  {if( entity ){

  let Entity = S.getEntity(entity)

  let selectedTx = Entity.getLocalState().tx


  let selectedEntityType = S.getEntity(Entity.type())
  let selectedEntityAttribtues = selectedEntityType.getAttributeValue("entityType/attributes")

  let attributeViews = selectedEntityAttribtues.map( attribute => {
    let Datom = Entity.getDatom( S.getEntity(attribute).getAttributeValue("attr/name") , selectedTx )
    if(isUndefined(Datom)){return singleRowLabel(S, A, attribute, d("Verdi mangler"))}
    return datomView(S, A, Datom )
  } )


  return d([
    h3(Entity.label()),
    entityView(S, A, entity),
    d(attributeViews),
    retractEntityButton(S, A, entity),
    submitButton("Legg til", e => A.createEntity( selectedEntityType.entity ) )
  ], {class: "feedContainer"} )

}else{return d("Ingen entitet valgt.", {class: "feedContainer"})}}

let genericEntityView = (S, A, entity) =>  {if( entity ){

  let Entity = S.getEntity(entity)
  let selectedEntityType = S.getEntity(Entity.type())
  let selectedEntityAttribtues = selectedEntityType.getAttributeValue("entityType/attributes")

  
  let attributeViews = selectedEntityAttribtues.map( attribute => attributeView(S, A, entity, attribute) )


  return d([
    h3(Entity.label()),
    entityView(S, A, entity),
    d(attributeViews),
    retractEntityButton(S, A, entity),
    submitButton("Legg til", e => A.createEntity( selectedEntityType.entity ) )
  ], {class: "feedContainer"} )

}else{return d("Ingen entitet valgt.", {class: "feedContainer"})}}

let attributeView = (S, A, entity, attribute) => {

  let genericValueTypeViews = {
    "30": valueTypeView_simpleText, //Tekst
    "31": valueTypeView_number, //Tall
    "32": valueTypeView_singleEntity, //Entitet
    "33": valueTypeView_object, //Array
    "37": valueTypeView_multipleEntities,
    "34": valueTypeView_functionString, //Funksjonstekst
    "35": valueTypeView_object,
    "36": valueTypeView_boolean,
    "38": valueTypeView_newDatoms,
    "39": valueTypeView_reportFields,
    "40": valueTypeView_staticDropdown,
    "41": valueTypeView_companyEntityDropdown,
  }

  let Entity = S.getEntity(entity)
  let Attribute = S.getEntity(attribute)
  let attributeName = Attribute.getAttributeValue("attr/name")
  let valueType = S.getEntity(Attribute.getAttributeValue("attribute/valueType"))
  let Value = Entity.getAttributeValue( attributeName )

  return genericValueTypeViews[valueType.entity](S, A, entity, attribute, Value)
} 




let singleRowLabel = (S, A, attribute, valueView) => d([
  entityLabel(S, A,  isString(attribute) ? S.attr(attribute) : attribute ),
  valueView
], {class: "columns_1_1"})

let valueTypeView_simpleText = (S, A, entity, attribute, value) => singleRowLabel(S, A, attribute, 
  input(
  {value: String(value), style: `{ validateDatom(S, newDatom(entity, attribute, value)) ? "" : "background-color: #fb9e9e; " }`}, 
  "change", 
  async e => A.update( await S.getEntity(entity).update( attribute, submitInputValue(e) )  ) 
  )
)



let valueTypeView_number = (S, A, entity, attribute, value) => singleRowLabel(S, A, attribute, 
  input(
    {value: String(value), style: `text-align: right; { validateDatom(S, newDatom(entity, attribute, value)) ? "" : "background-color: #fb9e9e; " }`}, 
    "change", 
    async e => A.update( await S.getEntity(entity).update( attribute, Number(submitInputValue(e)) )  )
  )
)

let valueTypeView_singleEntity = (S, A, entity, attribute, value) => {

  let options = new Function( "S" , S.getEntity(attribute).getAttributeValue("attribute/selectableEntitiesFilterFunction") )( S )
  
  return singleRowLabel(S, A, attribute, 
      dropdown(
        value, 
        options
          .map( entity => S.getEntity(entity) )
          .sort( sortEntitiesAlphabeticallyByLabel )
          .map( Entity => returnObject({value: Entity.entity, label: Entity.label()})  ).concat({value: "", label: "[tom]"}),
        async e => A.update( await S.getEntity(entity).update( attribute, Number(submitInputValue(e)) )  )
         )
  )
}

let valueTypeView_multipleEntities = (S, A, entity, attribute, value) => {
  
  let options = new Function( "S" , S.getEntity(attribute).getAttributeValue("attribute/selectableEntitiesFilterFunction") )( S )

  let attributeName = S.getEntity(attribute).getAttributeValue("attr/name")

  return d([
    entityLabel(S,A, attribute),
    d([
      d( S.getEntity(entity).getAttributeValue(attributeName).map( attr => d([
        entityLabel(S, A, attr), 
        submitButton("[X]", async e => A.update( await S.getEntity(entity).update( attribute, value.filter( e => e !== attr ) )  ))
        ], {class: "columns_3_1"} ) 
      ).concat( dropdown(
        0,
        options
          .sort( sortEntitiesAlphabeticallyByLabel )
          .filter( Entity => !S.getEntity(entity).getAttributeValue(attributeName).includes( Entity.entity ) )
          .map( Entity => returnObject({value: Entity.entity, label: Entity.label()})).concat({value: 0, label: "Legg til"}), 
        async e => A.update( await S.getEntity(entity).update( attribute, S.getEntity(entity).getAttributeValue(attributeName).concat( Number(submitInputValue(e)) ) )  )
        )  ) 
      )
    ], {class: "eventAttributeRow"})
  ], {class: "columns_1_1"})
}

let valueTypeView_functionString = (S, A, entity, attribute, value) => d([
  entityLabel(S,A, attribute),
  textArea(value, {class:"textArea_code"}, async e => A.update( await S.getEntity(entity).update( attribute, submitInputValue(e).replaceAll(`"`, `'`) )  ))
], {class: "columns_1_1"})

let valueTypeView_object = (S, A, entity, attribute, value) => d([
  entityLabel(S,A, attribute),
  textArea(JSON.stringify(value), {class:"textArea_code"}, async e => A.update( await S.getEntity(entity).update( attribute, JSON.parse(submitInputValue(e)) )  ))
], {class: "columns_1_1"})

let valueTypeView_boolean = (S, A, entity, attribute, value) => d([
  entityLabel(S,A, attribute),
  dropdown(
    value ? "Ja" : "Nei", 
    ["Ja", "Nei"].map( option => returnObject({value: option, label: option})  ),
    async e => A.update( await S.getEntity(entity).update( attribute, (submitInputValue(e) === "Ja") )  )
    )
], {class: "columns_1_1"})

let valueTypeView_newDatoms = (S, A, entity, attribute, value) => {


  let datoms = S.getEntity(entity).getAttributeValue(S.getEntity(attribute).getAttributeValue("attr/name")) ? S.getEntity(entity).getAttributeValue(S.getEntity(attribute).getAttributeValue("attr/name")) : []


  

  return d([
    entityLabel(S, A, attribute),
    d([
      d("EntitetID"),
      d("Attributt"),
      d("Verdi")
    ], {class: "columns_2_2_2_1"}),
    d(datoms.map( (datom, index) => d([
      dropdown(
        datom.entity, 
        [{value: `return 1;`, label: `Selskapets entitet`}, {value: `return Q.latestEntityID() + 1;`, label: `Ny entitet nr. 1`}, {value: `return Q.latestEntityID() + 2;`, label: `Ny entitet nr. 2`}, , {value: `return Q.latestEntityID() + 3;`, label: `Ny entitet nr. 3`}],
        async e => A.update( await S.getEntity(entity).update( attribute, mergerino(datoms, {[index]: {entity: submitInputValue(e)}}) )  )
        ),
      dropdown(datom.attribute, S.Attributes
        .sort( sortEntitiesAlphabeticallyByLabel  )
        .map( E => returnObject({value: E.entity, label: E.label()}) ), async e => {
          let updatedValue = mergerino(datoms, {[index]: {attribute: Number(submitInputValue(e)), value: `return Q.userInput(${Number(submitInputValue(e))})`}})
          
          let newDB = await S.getEntity(entity).update("eventType/eventAttributes", S.getEntity(entity).getAttributeValue("eventType/eventAttributes").concat( Number(submitInputValue(e)) )  )
          A.update( await S.getEntity(entity).update( attribute, updatedValue )  )
        } 
        ),
      textArea(datom.value, {class:"textArea_code"}, async e => A.update( await S.getEntity(entity).update( attribute, mergerino(datoms, {[index]: {value: submitInputValue(e)}}) )  )
      ),
      submitButton("[Slett]", async e => A.update( await S.getEntity(entity).update( attribute, datoms.filter( (d, i) => i !== index  ) )  )
      ),
    ], {class: "columns_2_2_2_1"}) )),
    submitButton("Legg til", async e => A.update( await S.getEntity(entity).update( attribute, datoms.concat({entity: `return Q.latestEntityID() + 1;`, attribute: 1000, value: `return ''` }) )  )
    ),
  ], {style: "padding:1em;border: solid 1px lightgray;"})
}

let valueTypeView_reportFields = (S, A, entity, attribute, value) => {

  let reportFields = S.getEntity(entity).getAttributeValue(S.attrName(attribute)) ? S.getEntity(entity).getAttributeValue(S.attrName(attribute)) : []

  return d([
    entityLabel(S, A, attribute),
    d([
      d("Attributt"),
      d("Verdi")
    ], {class: "columns_2_2_1"}),
    d(reportFields.map( (reportField, index) => d([
      dropdown(reportField.attribute, S.Attributes
        .filter( E => !reportFields.map( reportField => reportField.attribute ).includes(E.entity)  )
        .concat( S.getEntity(reportField.attribute) )
        .sort( sortEntitiesAlphabeticallyByLabel  )
        .map( E => returnObject({value: E.entity, label: S.getEntity(E.entity).label() }) ), async e => A.update( await S.getEntity(entity).update( S.attrName(attribute), mergerino(reportFields, {[index]: {attribute: Number(submitInputValue(e)), value: `return 0`}}) )  )
        ),
      textArea(reportField.value, {class:"textArea_code"}, async e => A.update( await S.getEntity(entity).update( S.attrName(attribute), mergerino(reportFields, {[index]: {value: submitInputValue(e)}}) )  )
      ),
      submitButton("[Slett]", async e => A.update( await S.getEntity(entity).update( S.attrName(attribute), reportFields.filter( (d, i) => i !== index  ) )  )
      ),
    ], {class: "columns_2_2_1"}) )),
    submitButton("Legg til", async e => A.update( await S.getEntity(entity).update( S.attrName(attribute), reportFields.concat({attribute: 1001, value: `return '${S.getEntity(entity).label()}';` }) )  )
    ),
  ])

}

let valueTypeView_staticDropdown = (S, A, entity, attribute, value)  => {

  let options = new Function( "S", S.getEntity(attribute)["attribute/selectableEntitiesFilterFunction"] )( S )

  return d([
    entityLabel(S,A, attribute),
    d([
      dropdown(
        value, 
        options
          .map( option => returnObject({value: option, label: option})  ),
          async e => A.update( await S.getEntity(entity).update( attribute, submitInputValue(e) )  )
         )
    ])
  ], {class: "columns_1_1"})
}

let valueTypeView_companyEntityDropdown = (S, A, entity, attribute, value)  => {

  let companyEntities = Object.values( S["selectedCompany"]["Entities"] )

  let Q = {}

  Q.getShareholders = () => companyEntities.filter( E => E.getAttributeValue("3171") === "shareholder" )

  let options = new Function( "S", "Q" , S.getEntity(attribute)["attribute/selectableEntitiesFilterFunction"] )( S, Q )
  

  return d([
    entityLabel(S,A, attribute),
    d([
      dropdown(
        value, 
        options
          .map( option => returnObject({value: option, label: option})  ),
          async e => A.update( await S.getEntity(entity).update( attribute, submitInputValue(e) )  )
         )
    ])
  ], {class: "columns_1_1"})
}