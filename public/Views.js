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
let checkBox = (isChecked, onClick) => input({type: "checkbox", value: isChecked}, "click", onClick)

let submitButton = (label, onClick) => d(label, {class: "textButton"}, "click", e => {
  let button = document.getElementById(e.srcElement.id)
  button.style = "background-color: darkgray;"
  button.innerHTML = "Laster.."
  onClick(e)
}  )

let retractEntityButton = (S, A, entity) => submitButton("Slett", async e => A.update( await S.getEntity(entity).retract() ))

//Basic entity views

let getEntityColor = (S, entity) => S.getEntity( S.getEntity(entity).type() ).get("entityType/color")

let entityLabel = (S, A, entity, onClick) => d( [
  d([
    span( `${ S.getEntity(entity).label()}`, `[${entity}] ${S.getEntity(entity).doc()}`, {class: "entityLabel", style: `background-color: ${getEntityColor(S, entity)};`}, (typeof onClick === "undefined") ? null : "click", onClick ),
    entityInspectorPopup(S, A, entity ),
  ], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"} )

let entityLabelAndValue = (S, A, entity, value) => {

  let valueView = S.getEntity(entity).get("attribute/valueType") === 32
    ? entityLabel(S, A, value)
    : d(`${JSON.stringify(value)}`, {class: typeof value === "number" ? "rightAlignText" : "" } )


  return d([
    entityLabel(S, A, entity),
    valueView
  ], {class: "eventInspectorRow"})

} 

let entityLabelWithoutPopup = (S, A, entity, value) => d( [
  span( `${ S.getEntity(entity).label()}`, `[${entity}] ${S.getEntity(entity).doc()}`, {class: "entityLabel", style: `background-color: ${getEntityColor(S, entity)};`}, "click", e => A.updateLocalState({"sidebar/selectedEntity": entity}) ),
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

let companySelectionMenuRow = (S, A) => d( S.findEntities( Entity => Entity.type() === 46 ).map( E => E.get("eventAttribute/1005") ).filter( filterUniqueValues ).map( orgnumber => d( String(orgnumber), {class: orgnumber === S["UIstate"].selectedOrgnumber ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {selectedOrgnumber : orgnumber} ) )  ).concat(submitButton( "+", e => A.createCompany() )), {style: "display:flex;"}) 
let pageSelectionMenuRow = (S, A) => d( ["timeline", "Rapporter", "Admin", "Admin/Entitet"].map( pageName => d( pageName, {class: pageName === S["UIstate"].currentPage ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {currentPage : pageName} ) )  ), {style: "display:flex;"})

let generateHTMLBody = (S, A) => [
  headerBarView(S),
  companySelectionMenuRow(S, A),
  pageSelectionMenuRow(S, A),
  pageRouter[ S["UIstate"].currentPage ]( S, A ),
]


let pageRouter = {
  "timeline": (S, A) => timelineView(S, A),
  "Rapporter": (S, A) => reportsPage( S, A ),
  "Admin": (S, A) => adminPage( S, A ),
  "Admin/Entitet": (S, A) => genericEntityView(S, A, S["UIstate"]["selectedEntity"]),
}

let sortEntitiesAlphabeticallyByLabel = ( a , b ) => ('' + a.label()).localeCompare(b.label())

let sidebar_left = (S, A) => d([
      d( S.findEntities( Entity => Entity.type() ===  47 )
        .filter( e => ![7790, 7806].includes(e.entity)  ) //Not event or tx
        .sort( sortEntitiesAlphabeticallyByLabel )
        .map( Entity => entityLabel(S, A, Entity.entity, e => A.updateLocalState(  {
          selectedEntityType : Entity.entity, 
          selectedCategory: S.findEntities( e => e.type() === Entity.entity )[0]["entity/category"],
          selectedEntity: S.findEntities( e => e.type() === Entity.entity )[0]["entity"]
          }))
        )
      ),
      d( S.findEntities( e => e.type() === S["UIstate"].selectedEntityType ).map( Entity => Entity.get("entity/category") ).filter(filterUniqueValues)
        .sort( ( a , b ) => ('' + a).localeCompare(b) )
        .map( category => d( 
          category, 
          {class: category === S["UIstate"].selectedCategory ? "textButton textButton_selected" : "textButton", style: "background-color: #c9c9c9;" }, 
          "click", 
          e => A.updateLocalState(  {selectedCategory : category, selectedEntity: S.findEntities( e => e.type() === S["UIstate"].selectedEntityType && e.get("entity/category") === category)[0].get("entity")} )
          )  )
      ),
      d( S.findEntities( e => e.type() === S["UIstate"].selectedEntityType && e.get("entity/category") === S["UIstate"].selectedCategory )
        .sort( sortEntitiesAlphabeticallyByLabel )
        .map( Entity => entityLabel(S, A, Entity.entity, e => A.updateLocalState(  {selectedEntity : Entity.entity} ) ))
        )
  ], {style: "display:flex;"})

let entityInspectorPopup = (S, A, entity) => d([
      h3(`[${entity}] ${S.getEntity(entity).label()}`, {style: `background-color: ${getEntityColor(S, entity)}; padding: 3px;`}),
      //entityLabelWithoutPopup(S, A, 7754, S.getEntity(entity).type()),
      //entityLabelWithoutPopup(S, A, 5712, S.getEntity(entity).category()),
      d("<br>"),
      d(S.getEntity(entity).doc()),
      d("Rediger", {class: "textButton"}, "click", e => A.updateLocalState({currentPage: "Admin", selectedEntityType: S.getEntity(entity).type(), selectedCategory:  S.getEntity(entity).category(), selectedEntity: entity }))
    ], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})




let newDatomsView = (S, A, Datoms) => d([
  h3("Nye selskapsdatomer generert av hendelsen:"),
  d( Datoms.map( datom => d([
    d( String( datom.entity ) ),
    entityLabel(S, A, datom.attribute),
    d( JSON.stringify(datom.value) )
  ], {class: "columns_2_4_4"})) )
]) 

let timelineView = (S, A) => d([
  d(""),
  (S.selectedCompany.Events.length > 0)
  ? d( S.selectedCompany.Events.map( Event => eventView( S, Event, A )  )) 
  : d("Noe er galt med selskapets tidslinje"),
  d("")
], {class: "pageContainer"}) 

let eventView = (S, Event , A) => S.getEntity(Event.get("event/eventTypeEntity")) ? d([
  h3( S.getEntity(Event.get("event/eventTypeEntity")).label() ),
  entityView(S, A, Event.get("entity")),
  entityLabelAndValue(S, A, S.attrEntity("event/eventTypeEntity"), Event.get("event/eventTypeEntity") ),
  d(S.getEntity(Event.get("event/eventTypeEntity")).get("eventType/eventAttributes").map( attribute => attributeView(S, A, Event.entity, attribute) )),
  d("<br>"),
  S["selectedCompany"]["t"] >= Event["event/index"] ? newDatomsView(S, A, S["selectedCompany"].Datoms.filter( datom => datom.t === Event["event/index"] )) : d("Kan ikke vise hendelsens output"),
  d("<br>"),
  retractEntityButton(S, A, Event["entity"]),
  newEventDropdown(S, A, Event)
], {class: "feedContainer"} ) : d([
  entityView(S, A, Event.get("entity")),
  d("<br>"),
  d(` Hendelsestypen [${Event.get("event/eventTypeEntity")}]  finnes ikke.`),
  d("<br>"),
  d( JSON.stringify(Event.current) ),
  retractEntityButton(S, A, Event["entity"]),
], {class: "feedContainer"})

let reportsPage = (S, A) => d([
  d( //Left sidebar
    S.findEntities(E => E.type() ===  9966 ).map( Report => d([
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
    companyReport ? d(Report["report/reportFields"].map( reportField => reportFieldView(S, A, selectedReport, reportField.attribute, companyReport[reportField.attribute]) ) // entityLabelAndValue(S, A, reportField.attribute, companyReport[reportField.attribute] ? companyReport[reportField.attribute] : "na." ) )
    ) : d("Rapporten er ikke tilgjengelig")
  ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
} 

let reportFieldView = (S, A, selectedReport, attribute, value) => {

  let customReportFieldViews = {
    "12420": reportFieldView_Datoms, //Tekst
    "12434": reportFieldView_Entities
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
    d(Object.keys(Entity).filter( key => key !== "entity" ).map( attribute => d([
      entityLabel(S, A, Number(attribute)),
      d( JSON.stringify(Entity.get(attribute)) ),
    ], {class: "columns_1_1"}) )),
    d("<br>"),
  ])   ))
])



let newEventDropdown = (S, A, Event) => dropdown( 0, 
  S.findEntities(E => E.type() ===  43 ).map( Entity => returnObject({value: Entity.entity, label: Entity.label() }) ).concat({value: 0, label: "Legg til hendelse etter denne"}),
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
    d( `${new Date(S.getEntity(entity).version()).toLocaleDateString()} ${new Date(S.getEntity(entity).version()).toLocaleTimeString()}`, {style: `text-align: right;`} )
  ], {class: "columns_1_1"}),
]) 







//Entity view

let genericEntityView = (S, A, entity) => {if(S.getEntity(entity)){

  let Entity = S.getEntity(entity)
  let selectedEntityType = S.getEntity(Entity.type())
  let selectedEntityAttribtues = selectedEntityType.get("entityType/attributes")

  
  let attributeViews = selectedEntityAttribtues.map( attribute => attributeView(S, A, entity, attribute) )


  return d([
    h3(Entity.label()),
    entityView(S, A, entity),
    d(attributeViews),
    retractEntityButton(S, A, entity),
    d("<br>"),
    submitButton("Legg til ny", e => A.createEntity( selectedEntityType.entity ) )
  ], {class: "feedContainer"} )

}else{d("Fant ikke entitet.")}}

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
  let valueType = S.getEntity(Attribute.get("attribute/valueType"))

  let Value = Entity.get( attribute )

  return genericValueTypeViews[valueType.get("entity")](S, A, entity, attribute, Value)
} 

let valueTypeView_simpleText = (S, A, entity, attribute, value) => d([
  entityLabel(S, A, attribute),
  input(
    {value: String(value), style: `${ validateDatom(S, newDatom(entity, attribute, value)) ? "" : "background-color: #fb9e9e; " }`}, 
    "change", 
    async e => A.update( await S.getEntity(entity).update( attribute, submitInputValue(e) )  ) 
    )
], {class: "columns_1_1"})


let valueTypeView_number = (S, A, entity, attribute, value) => d([
  entityLabel(S,A, attribute),
  input(
    {value: String(value), style: `text-align: right; ${ validateDatom(S, newDatom(entity, attribute, value)) ? "" : "background-color: #fb9e9e; " }`}, 
    "change", 
    async e => A.update( await S.getEntity(entity).update( attribute, Number(submitInputValue(e)) )  )
  )
], {class: "columns_1_1"})

let valueTypeView_singleEntity = (S, A, entity, attribute, value) => {

  let options = new Function( "S" , S.getEntity(attribute).get("attribute/selectableEntitiesFilterFunction") )( S )
  
  return d([
    entityLabel(S,A, attribute),
    d([
      dropdown(
        value, 
        options
          .sort( sortEntitiesAlphabeticallyByLabel )
          .map( Entity => returnObject({value: Entity.get("entity"), label: Entity.label()})  ).concat({value: "", label: "[tom]"}),
        async e => A.update( await S.getEntity(entity).update( attribute, Number(submitInputValue(e)) )  )
         )
    ])
  ], {class: "columns_1_1"})
}

let valueTypeView_multipleEntities = (S, A, entity, attribute, value) => {
  
  let options = new Function( "S" , S.getEntity(attribute).get("attribute/selectableEntitiesFilterFunction") )( S )

  return d([
    entityLabel(S,A, attribute),
    d([
      d( logThis(S.getEntity(entity).get(attribute)).map( attr => d([
        entityLabel(S, A, attr), 
        submitButton("[X]", async e => A.update( await S.getEntity(entity).update( attribute, value.filter( e => e !== attr ) )  ))
        ], {class: "columns_3_1"} ) 
      ).concat( dropdown(
        0,
        options
          .sort( sortEntitiesAlphabeticallyByLabel )
          .filter( Entity => !S.getEntity(entity).get(attribute).includes( Entity.entity ) )
          .map( Entity => returnObject({value: Entity.entity, label: Entity.label()})).concat({value: 0, label: "Legg til"}), 
        async e => A.update( await S.getEntity(entity).update( attribute, S.getEntity(entity).get(attribute).concat( Number(submitInputValue(e)) ) )  )
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

  let datoms = S.getEntity(entity).get(attribute) ? S.getEntity(entity).get(attribute) : []
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
      dropdown(datom.attribute, S.findEntities( E => E.type() === 42  )
        .sort( sortEntitiesAlphabeticallyByLabel  )
        .map( E => returnObject({value: E.entity, label: E.label()}) ), async e => {

          let updatedValue = mergerino(datoms, {[index]: {attribute: Number(submitInputValue(e)), value: `return Q.userInput(${Number(submitInputValue(e))})`}})

          A.update( await S.getEntity(entity).submitDatoms( [{attribute: attribute, value: updatedValue}, {attribute: S.attrEntity("eventType/eventAttributes"), value: S.getEntity(entity).get("eventType/eventAttributes").concat(Number(submitInputValue(e))) }])  )


          A.update( await S.getEntity(entity).update( attribute, mergerino(datoms, {[index]: {attribute: Number(submitInputValue(e)), value: `return Q.userInput(${Number(submitInputValue(e))})`}}) )  )
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

  let reportFields = S.getEntity(entity).get(9970) ? S.getEntity(entity).get(9970) : []

  return d([
    entityLabel(S, A, 9970),
    d([
      d("Attributt"),
      d("Verdi")
    ], {class: "columns_2_2_1"}),
    d(reportFields.map( (reportField, index) => d([
      dropdown(reportField.attribute, S.findEntities( E => E.type() === 42  )
        .filter( E => !reportFields.map( reportField => reportField.attribute ).includes(E.get("entity"))  )
        .concat( S.getEntity(reportField.attribute) )
        .sort( sortEntitiesAlphabeticallyByLabel  )
        .map( E => returnObject({value: E.entity, label: S.getEntityLabel(E.entity) }) ), async e => A.update( await S.getEntity(entity).update( 9970, mergerino(reportFields, {[index]: {attribute: Number(submitInputValue(e)), value: `return 0`}}) )  )
        ),
      textArea(reportField.value, {class:"textArea_code"}, async e => A.update( await S.getEntity(entity).update( 9970, mergerino(reportFields, {[index]: {value: submitInputValue(e)}}) )  )
      ),
      submitButton("[Slett]", async e => A.update( await S.getEntity(entity).update( 9970, reportFields.filter( (d, i) => i !== index  ) )  )
      ),
    ], {class: "columns_2_2_1"}) )),
    submitButton("Legg til", async e => A.update( await S.getEntity(entity).update( 9970, reportFields.concat({attribute: 4615, value: `return '${S.getEntity(entity).label()}';` }) )  )
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

  Q.getShareholders = () => companyEntities.filter( E => E.get("3171") === "shareholder" )

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