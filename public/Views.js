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

let submitButton = (label, onClick) => d(label, {class: "textButton"}, "click", e => {
  let button = document.getElementById(e.srcElement.id)
  button.style = "background-color: darkgray;"
  button.innerHTML = "Laster.."
  onClick(e)
}  )

let retractEntityButton = (A, entity) => submitButton("Slett", e => A.retractEntity(entity) )

//Basic entity views

let getEntityColor = (S, entity) => S.getEntity( S.getEntity(entity)[ "entity/entityType" ] )["entityType/color"]

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

let companySelectionMenuRow = (S, A) => d( S.getAllOrgnumbers().map( orgnumber => d( String(orgnumber), {class: orgnumber === S["UIstate"].selectedOrgnumber ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {selectedOrgnumber : orgnumber} ) )  ).concat(submitButton( "+", e => A.createCompany() )), {style: "display:flex;"}) 
let pageSelectionMenuRow = (S, A) => d( ["timeline", "Rapporter", "Admin", "Admin/Datomer", "Admin/Entitet"].map( pageName => d( pageName, {class: pageName === S["UIstate"].currentPage ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {currentPage : pageName} ) )  ), {style: "display:flex;"})

let generateHTMLBody = (S, A) => [
  headerBarView(S),
  companySelectionMenuRow(S, A),
  pageSelectionMenuRow(S, A),
  pageRouter[ S["UIstate"].currentPage ]( S, A ),
]

let pageContainer = (S, A) => d([
  sidebar_left(S, A),
  pageRouter[ S["UIstate"].currentPage ]( S, A ),
  d("")
], {class: "pageContainer"})

let pageRouter = {
  "timeline": (S, A) => timelineView(S, A),
  "Rapporter": (S, A) => reportsPage( S, A ),
  "Admin": (S, A) => adminPage( S, A ),
  "Admin/Datomer": (S, A) => latestDatomsPage( S, A ),
  "Admin/Entitet": (S, A) => genericEntityView(S, A, S["UIstate"]["selectedEntity"]),
}

let sortEntitiesAlphabeticallyByLabel = ( a , b ) => ('' + a["entity/label"]).localeCompare(b["entity/label"])

let sidebar_left = (S, A) => S["UIstate"].currentPage == "Admin"
? d([
      d( S.findEntities(E => E["entity/entityType"] ===  7794 )
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
        .filter( E => E["entity/status"] !== "Utgått" )
        .sort( sortEntitiesAlphabeticallyByLabel )
        .map( Entity => d( Entity["entity/label"], {class: Entity.entity === S["UIstate"].selectedEntity ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {selectedEntity : Entity.entity} ) ) )
        )
  ], {style: "display:flex;"})
:  d("")

let entityInspectorPopup = (S, A, entity) => d([
      h3(`[${entity}] ${S.getEntityLabel(entity)}`, {style: `background-color: ${getEntityColor(S, entity)}; padding: 3px;`}),
      entityLabelWithoutPopup(S, A, 7754, S.getEntity(entity)["entity/entityType"]),
      entityLabelWithoutPopup(S, A, 5712, S.getEntityCategory(entity)),
      d("<br>"),
      d(S.getEntityDoc(entity)),
      d("Rediger", {class: "textButton"}, "click", e => A.updateLocalState({currentPage: "Admin", selectedEntityType: S.getEntity(entity)["entity/entityType"], selectedCategory:  S.getEntityCategory(entity), selectedEntity: entity }))
    ], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

let newDatomsView = (S, A, companyDocVersion) => d([
  h3("Nye selskapsdatomer generert av hendelsen:"),
  d( companyDocVersion.eventDatoms.map( datom => d([
    d( String( datom.entity ) ),
    entityLabel(S, A, datom.attribute),
    d( JSON.stringify(datom.value) )
  ], {class: "columns_2_4_4"})) )
]) 

let timelineView = (S, A) => d([
  d(""),
  (S.getUserEvents().length > 0)
  ? d( S.getUserEvents().map( eventAttributes => eventView( S, eventAttributes, A )  )) 
  : d("Noe er galt med selskapets tidslinje"),
  d("")
], {class: "pageContainer"}) 

let eventView = (S, eventAttributes , A) => (S.getEntity(eventAttributes["event/eventTypeEntity"]) === null)
  ? d([d("ERROR: Hendelsestypen finnes ikke"), d(JSON.stringify(Event))], {class: "feedContainer"})
  : d([
      h3( S.getEntity(eventAttributes["event/eventTypeEntity"])["entity/label"] ),
      entityLabel(S, A, eventAttributes["event/eventTypeEntity"]),
      eventAttributesView(S, A, eventAttributes),
      d("<br>"),
      S["selectedCompany"][eventAttributes["event/index"]] ? newDatomsView(S, A, S["selectedCompany"][eventAttributes["event/index"]]) : d("Kan ikke vise hendelsens output"),
      d("<br>"),
      retractEntityButton( A, eventAttributes["entity"]),
      newEventDropdown(S, A, eventAttributes)
], {class: "feedContainer"} )



let eventAttributesView = (S, A, eventAttributes) => d(S.getEntity(eventAttributes["event/eventTypeEntity"])["eventType/eventAttributes"].map( attributeEntity => attributeView(S, A, eventAttributes.entity, attributeEntity, eventAttributes[ S.getEntity(attributeEntity)["attr/name"] ] ) ))  

let companyDocPage = (S, A) => {

  let selectedVersion = S["UIstate"]["companyDocPage/selectedVersion"];
  let companyDocVersion =  S["selectedCompany"][selectedVersion ]
  let eventType = S.getEntity( companyDocVersion["eventAttributes"]["event/eventTypeEntity"])

  return d([
    d([
      d("<", {class: "textButton"}, "click", e => A.updateLocalState({"companyDocPage/selectedVersion": Math.max(1, selectedVersion - 1 )  })),
      d(">", {class: "textButton"}, "click", e => A.updateLocalState({"companyDocPage/selectedVersion": Math.min(S["selectedCompany"].length, selectedVersion + 1 ) })),
    ], {class: "shareholderRow"}),
    d([
      h3(`Attributter for hendelse ${selectedVersion}: ${eventType["entity/label"]}`),
      d( eventType["eventType/eventAttributes"].map( attributeEntity =>  attributeView(S, A, companyDocVersion["eventAttributes"].entity, attributeEntity, companyDocVersion["eventAttributes"][ S.getEntity(attributeEntity)["attr/name"] ] )  )),
    ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
    d("<br>"),
    d([newDatomsView(S, A, companyDocVersion)], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"} ),
    d("<br>"),
    d([
      h3(`ADB (Selskapets entiteter) etter hendelse ${selectedVersion}: ${eventType["eventType/label"]}`),
      d( Object.entries(companyDocVersion.Entities).map( arr => d([
        h3(arr[0]),
        d(Object.entries(arr[1]).map( entry => d([
          entityLabelAndValue(S, A, entry[0], entry[1])
          ])))
      ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}) 
      )),
    ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
    d("<br>"),
    d([
      h3(`Selskapsrapporter etter hendelse ${selectedVersion}: ${eventType["eventType/label"]}`),
      d( Object.entries(companyDocVersion.Reports).map( ReportEntry => d([
        entityLabel(S, A, ReportEntry[0]),
        d(Object.entries(ReportEntry[1]).map( ReportFieldEntry => d([
          entityLabelAndValue(S, A, ReportFieldEntry[0], ReportFieldEntry[1])
        ]))),
        d("<br>")
      ])  ) ),
    ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
  ] )
}


let reportsPage = (S, A) => d([
  d( //Left sidebar
    S.findEntities(E => E["entity/entityType"] ===  9966 ).map( Report => d([
      entityLabel(S, A, Report.entity, e => A.updateLocalState({selectedReport: Report.entity}))
    ])  )
    ),
  genericReportView(S, A, S["UIstate"]["selectedReport"]),
  d("")
], {class: "pageContainer"})

let genericReportView = (S, A, selectedReport) => {

  let Report = S.getEntity(selectedReport)
  let companyDocVersion = S["selectedCompany"][ S["selectedCompany"].length - 1 ]
  let companyReport = companyDocVersion["Reports"][ selectedReport ]

  return d([
    h3(Report["entity/label"]),
    companyReport ? d(Report["report/reportFields"].map( reportField => entityLabelAndValue(S, A, reportField.attribute, companyReport[reportField.attribute] ? companyReport[reportField.attribute] : "na." ) )

    ) : d("Rapporten er ikke tilgjengelig")
  ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
} 

let latestDatomsPage = (S, A) => d([
  sidebar_left(S, A),
  d( S.getLatestTxs().map( tx => txView(S, A, tx) ) ),
  d(""),
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



let newEventDropdown = (S, A, eventAttributes) => dropdown( "", 
  S.findEntities(E => E["entity/entityType"] ===  7686 ).map( Entity => returnObject({value: Entity.entity, label: Entity["entity/label"] }) ).concat({value: "", label: "Legg til hendelse etter denne"}),
  e => A.createEvent(eventAttributes, Number(submitInputValue(e)) )
)

let adminPage = (S, A) => d([
  sidebar_left(S, A),
  genericEntityView(S, A, S["UIstate"]["selectedEntity"]),
  d("")
], {class: "pageContainer"})

let genericEntityView = (S, A, entity) => {

  let selectedEntity = S.getEntity(logThis(entity))
  let selectedEntityType = S.getEntity(selectedEntity["entity/entityType"])
  let selectedEntityAttribtues = selectedEntityType["entityType/attributes"]
  
  let entityView = d([
    entityLabel(S, A, entity),
    d(String(entity))
  ], {class: "columns_1_1_1"}) 
  let attributeViews = selectedEntityAttribtues.map( attribute => attributeView(S, A, entity, attribute, selectedEntity[ S.getEntity(attribute)["attr/name"] ] ) )


  return d([
    entityView,
    d(attributeViews),
    retractEntityButton(A, entity),
    d("<br>"),
    submitButton("Legg til ny", e => A.createEntity( selectedEntityType.entity ) )
  ], {class: "feedContainer"} )

}

let attributeView = (S, A, entity, attributeEntity, value) => {

  let genericValueTypeViews = {
    "7651": valueTypeView_simpleText, //Tekst
    "7653": valueTypeView_number, //Tall
    "7664": valueTypeView_singleEntity, //Entitet
    "7669": valueTypeView_object, //Array
    "10849": valueTypeView_multipleEntities,
    "10820": valueTypeView_functionString, //Funksjonstekst
    "10834": valueTypeView_object,
    "10838": valueTypeView_boolean,
    "10905": valueTypeView_newDatoms,
    "10911": valueTypeView_reportFields,
    "11280": valueTypeView_staticDropdown,
    "11304": valueTypeView_companyEntityDropdown,
  }

  let Attribute = S.getEntity(attributeEntity)
  let valueType = S.getEntity(Attribute["attribute/valueType"])

  return genericValueTypeViews[valueType.entity](S, A, entity, attributeEntity, value)
} 

let valueTypeView_simpleText = (S, A, entity, attributeEntity, value) => d([
  entityLabel(S,A, attributeEntity),
  input(
    {value: String(value), style: `${ validateAttributeValue(S, attributeEntity, value ) ? "" : "background-color: #fb9e9e; " }`}, 
    "change", 
    e => A.updateEntityAttribute( entity, S.getEntity(attributeEntity)["attr/name"], submitInputValue(e) )
    )
], {class: "columns_1_1"}) 






let valueTypeView_number = (S, A, entity, attributeEntity, value) => d([
  entityLabel(S,A, attributeEntity),
  input(
    {value: String(value), style: `text-align: right; ${ validateAttributeValue(S, attributeEntity, value ) ? "" : "background-color: #fb9e9e; " }`}, 
    "change", 
    e => A.updateEntityAttribute( entity, S.getEntity(attributeEntity)["attr/name"], Number(submitInputValue(e)) ) 
  )
], {class: "columns_1_1"})

let valueTypeView_singleEntity = (S, A, entity, attributeEntity, value) => {

  let options = new Function( "S" , S.getEntity(attributeEntity)["attribute/selectableEntitiesFilterFunction"] )( S )
  

  return d([
    entityLabel(S,A, attributeEntity),
    d([
      dropdown(
        value, 
        options
          .map( Entity => returnObject({value: Entity.entity, label: Entity["entity/label"]})  ).concat({value: "", label: "[tom]"}),
        e => A.updateEntityAttribute( entity, S.getEntity(attributeEntity)["attr/name"], Number(submitInputValue(e)) )
         )
    ])
  ], {class: "columns_1_1"})
}

let valueTypeView_multipleEntities = (S, A, entity, attributeEntity, value) => {
  
  let attributeName = S.getEntity(attributeEntity)["attr/name"]

  let options = new Function( "S" , S.getEntity(attributeEntity)["attribute/selectableEntitiesFilterFunction"] )( S )

  console.log(entity, attributeEntity, value)

  return d([
    entityLabel(S,A, attributeEntity),
    d([
      d( S.getEntity(entity)[attributeName] .map( attr => d([
        entityLabel(S, A, attr), 
        submitButton("[X]", e => A.updateEntityAttribute( entity, attributeName, value.filter( e => e !== attr )  ) )
        ], {class: "columns_3_1"} ) 
      ).concat( dropdown(
        0,
        options
          .filter( Entity => !S.getEntity(entity)[attributeName].includes( Entity.entity ) )
          .map( Entity => returnObject({value: Entity.entity, label: `${Entity["entity/label"]}`})).concat({value: 0, label: "Legg til"}), 
        e => A.updateEntityAttribute( entity, attributeName, S.getEntity(entity)[attributeName].concat( Number(submitInputValue(e)) )  )   
        )  ) 
      )
    ], {class: "eventAttributeRow"})
  ], {class: "columns_1_1"})
}



let valueTypeView_functionString = (S, A, entity, attributeEntity, value) => d([
  entityLabel(S,A, attributeEntity),
  textArea(value, {class:"textArea_code"}, e => A.updateEntityAttribute(entity, S.getEntity(attributeEntity)["attr/name"], submitInputValue(e).replaceAll(`"`, `'`) ))
], {class: "columns_1_1"})

let valueTypeView_object = (S, A, entity, attributeEntity, value) => d([
  entityLabel(S,A, attributeEntity),
  textArea(JSON.stringify(value), {class:"textArea_code"}, e => A.updateEntityAttribute(entity, S.getEntity(attributeEntity)["attr/name"], JSON.parse(submitInputValue(e)) ))
], {class: "columns_1_1"})

let valueTypeView_boolean = (S, A, entity, attributeEntity, value) => d([
  entityLabel(S,A, attributeEntity),
  d(JSON.stringify(value))
], {class: "columns_1_1"})





let valueTypeView_newDatoms = (S, A, entity, attributeEntity, value) => {

  let datoms = S.getEntity(entity)["eventType/newDatoms"] ? S.getEntity(entity)["eventType/newDatoms"] : []
  return d([
    entityLabel(S, A, getAttributeEntityFromName(S, "eventType/newDatoms")),
    d([
      d("EntitetID"),
      d("Attributt"),
      d("Verdi")
    ], {class: "columns_2_2_2_1"}),
    d(datoms.map( (datom, index) => d([
      dropdown(
        datom.entity, 
        [{value: `return 1;`, label: `Selskapets entitet`}, {value: `return Q.getReportField(10085,10040) + 1;`, label: `Ny entitet nr. 1`}, {value: `return Q.getReportField(10085,10040) + 2;`, label: `Ny entitet nr. 2`}, , {value: `return Q.getReportField(10085,10040) + 3;`, label: `Ny entitet nr. 3`}],
        e => A.updateEntityAttribute(entity, "eventType/newDatoms", mergerino(datoms, {[index]: {entity: submitInputValue(e)}})   )
        ),
      dropdown(datom.attribute, S.findEntities( E => E["entity/entityType"] === 7684  )
        .filter( E => !["[Arkiverte attributter]", "[db]" ].includes(E["entity/category"])  )
        .sort( sortEntitiesAlphabeticallyByLabel  )
        .map( E => returnObject({value: E.entity, label: E["entity/label"]}) ), e => A.updateEntityAttribute(entity, "eventType/newDatoms", mergerino(datoms, {[index]: {attribute: Number(submitInputValue(e)), value: `return Q.userInput(${Number(submitInputValue(e))})`}})   )  ),
      textArea(datom.value, {class:"textArea_code"}, e => A.updateEntityAttribute(entity, "eventType/newDatoms", mergerino(datoms, {[index]: {value: submitInputValue(e)}})   )),
      submitButton("[Slett]", e => A.updateEntityAttribute(entity, "eventType/newDatoms", datoms.filter( (d, i) => i !== index  ) )),
    ], {class: "columns_2_2_2_1"}) )),
    submitButton("Legg til", e => A.updateEntityAttribute(entity, "eventType/newDatoms", datoms.concat({entity: `return Q.getReportField(10085,10040) + 1;`, attribute: 3174, value: `return Q.userInput(3174)` }) )),
  ], {style: "padding:1em;border: solid 1px lightgray;"})
}

let valueTypeView_reportFields = (S, A, entity, attributeEntity, value) => {

  let reportFields = S.getEntity(entity)["report/reportFields"]

  if( !Array.isArray(reportFields) || reportFields.length === 0  ){return d("DATOMS ERROR")}

  return d([
    entityLabel(S, A, getAttributeEntityFromName(S, "report/reportFields")),
    d([
      d("Attributt"),
      d("Verdi")
    ], {class: "columns_2_2_1"}),
    d(reportFields.map( (reportField, index) => d([
      dropdown(reportField.attribute, S.findEntities( E => E["entity/entityType"] === 7684  )
        .filter( E => !["[Arkiverte attributter]", "[db]" ].includes(E["entity/category"])  )
        .filter( E => !reportFields.map( reportField => reportField.attribute ).includes(E["entity"])  )
        .concat( S.getEntity(reportField.attribute) )
        .sort( sortEntitiesAlphabeticallyByLabel  )
        .map( E => returnObject({value: E.entity, label: E["entity/label"]}) ), e => A.updateEntityAttribute(entity, "report/reportFields", mergerino(reportFields, {[index]: {attribute: Number(submitInputValue(e)), value: `return 0`}})   )  ),
      textArea(reportField.value, {class:"textArea_code"}, e => A.updateEntityAttribute(entity, "report/reportFields", mergerino(reportFields, {[index]: {value: submitInputValue(e)}})   )),
      submitButton("[Slett]", e => A.updateEntityAttribute(entity, "report/reportFields", reportFields.filter( (d, i) => i !== index  ) )),
    ], {class: "columns_2_2_1"}) )),
    submitButton("Legg til", e => A.updateEntityAttribute(entity, "report/reportFields", reportFields.concat({attribute: 4933, value: `return [TBD]` }) )),
  ])

}


let valueTypeView_staticDropdown = (S, A, entity, attributeEntity, value)  => {

  let options = new Function( "S", S.getEntity(attributeEntity)["attribute/selectableEntitiesFilterFunction"] )( S )

  return d([
    entityLabel(S,A, attributeEntity),
    d([
      dropdown(
        value, 
        options
          .map( option => returnObject({value: option, label: option})  ),
        e => A.updateEntityAttribute( entity, S.getEntity(attributeEntity)["attr/name"], submitInputValue(e) )
         )
    ])
  ], {class: "columns_1_1"})
}

let valueTypeView_companyEntityDropdown = (S, A, entity, attributeEntity, value)  => {

  let companyEntities = Object.values( S["selectedCompany"][ S.getEntity(entity)["event/index"] ]["Entities"] )

  let Q = {}

  Q.getShareholders = () => companyEntities.filter( E => E["3171"] === "shareholder" )

  let options = new Function( "S", "Q" , S.getEntity(attributeEntity)["attribute/selectableEntitiesFilterFunction"] )( S, Q )
  

  return d([
    entityLabel(S,A, attributeEntity),
    d([
      dropdown(
        value, 
        options
          .map( option => returnObject({value: option, label: option})  ),
        e => A.updateEntityAttribute( entity, S.getEntity(attributeEntity)["attr/name"], submitInputValue(e) )
         )
    ])
  ], {class: "columns_1_1"})
}