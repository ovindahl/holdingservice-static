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
let log = (something, label) => {
console.log( (label) ? label : "Logging this: ", something )
return something
}



let isUndefined = value => typeof value === "undefined"
let isDefined = value => !isUndefined(value)
let isNull = value => value === null
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
  
  let id = isUndefined(attributesObject) 
    ?  getNewElementID()
    : attributesObject.id 
      ? attributesObject.id 
      : getNewElementID()
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
let br = () => d("<br>")
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

let optionsElement = optionObjects => optionObjects.map( o => `<option value="${o.value}">${o.label}</option>` ).join('')


let checkBox = (isChecked, onClick) => input({type: "checkbox", value: isChecked}, "click", onClick)

let submitButton = (label, onClick) => d(label, {class: "textButton"}, "click", e => {
  let button = document.getElementById(e.srcElement.id)
  button.style = "background-color: darkgray;"
  button.innerHTML = "Laster.."
  onClick(e)
}  )

let retractEntityButton = entity => submitButton("Slett", e => Database.retractEntity(entity) )
let createEntityButton = entityType => submitButton("Legg til", e => Database.createEntity(entityType) )    

//Basic entity views

let entityLabel = (entity, onClick) => Database.get(entity) 
? d( [
    d([
      span( `${Database.get(entity, "entity/label") ? Database.get(entity, "entity/label") : "[Visningsnavn mangler]"}`, ``, {class: "entityLabel", style: `background-color:${Database.getEntityColor(entity)};`}, "click", isUndefined(onClick) ? e => Database.selectEntity(entity) : onClick ),
      entityInspectorPopup_small(entity),], {class: "popupContainer", style:"display: inline-flex;"})
  ], {style:"display: inline-flex;"} )
: d(`[${entity}] Entiteten finnes ikke`)

let entityInspectorPopup_small = entity => d([
  h3(`[${entity}] ${Database.get(entity, "entity/label")}`, {style: `background-color: {Entity.color}; padding: 3px;`}),
  d("<br>"),
  d(`Type: ${Database.get(entity, "entity/entityType")}`),
  d(`Kategori: ${Database.get(entity, "entity/category")}`),
  //d("Rediger", {class: "textButton"}, "click", e => A.updateLocalState({currentPage: "Admin/DB", selectedEntityType: Database.get(entity, "entity/entityType"), selectedCategory:  Database.get(entity, "entity/category"), selectedEntity: entity }))
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

let entityLabel_largePopup = entity => isDefined( Database.get(entity) ) 
? d( [
    d([
      span( `${Database.get(entity, "entity/label")}`, ``, {class: "entityLabel", style: `background-color:${Database.getEntityColor(entity)};`}),
      entityInspectorPopup_large(entity)
    ], {class: "popupContainer", style:"display: inline-flex;"})
  ], {style:"display: inline-flex;"} )
: d(`[${entity}] Entiteten finnes ikke`)

let entityInspectorPopup_large = entity => {

  let entityType = Database.get(entity, "entity/entityType")



  let entityAttributes = ( entityType === 46)
    ? Database.get( Database.get(entity, "event/eventTypeEntity") , 8 )
    : Database.get( entityType, 17 )

  

  let view = entityAttributes.map( attrName => d([
      span( `${Database.get( Database.attr(attrName) , "entity/label")}`, ``, {class: "entityLabel", style: `background-color:${Database.getEntityColor(Database.attr(attrName))};`} ),
      Database.get( Database.attr(attrName) , "attribute/valueType") === 32
        ? span( `${Database.get( Database.get( entity, attrName) , "entity/label")}`, ``, {class: "entityLabel", style: `background-color:${Database.getEntityColor(Database.get( entity, attrName))};`} )
        : input( {value: String( Database.get( entity, attrName)  ), style: `text-align: right;`, disabled: "disabled" }   )
    ], {class: "columns_1_1"})  )
  

  return d([
    h3( Database.get( entity , "entity/label") ),
    d([
      d([span( `Entitet`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`} )], {style:"display: inline-flex;"}),
      d(String(entity), {style: `text-align: right;`} )
    ], {class: "columns_1_1"}),

    d([
      d([span( `Gyldighet`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`} )], {style:"display: inline-flex;"}),
      /* d( (Database.get( entity , "entity/entityType") === 46)
          ? String( Database.getEvent(entity).isValid() )
          : "na."
        ), {style: `text-align: right;`} */
    ], {class: "columns_1_1"}),
    d(view)
  ], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
}

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

let companySelectionMenuRow = (S, A) => d([
  d( Database.getAll( 5722 ).map( company => d([
      entityLabel(company, e => A.updateLocalState(  {selectedCompany : company} ))
    ], {style: company === S["UIstate"].selectedCompany ? "background-color: #bfbfbf;" : ""})
  ), {style: "display:flex;"}),
  submitButton( "+", e => console.log("NEW COMPANY") )
], {style: "display:flex;"}) 

let pageSelectionMenuRow = (S, A) => d( ["Prosesser", "Hendelseslogg", "Rapporter", "Admin/DB"].map( pageName => d( pageName, {class: pageName === S["UIstate"].currentPage ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {currentPage : pageName} ) )  ), {style: "display:flex;"})

let generateHTMLBody = (S, A) => [
  headerBarView(S),
  companySelectionMenuRow(S, A),
  pageSelectionMenuRow(S, A),
  pageRouter[ S["UIstate"].currentPage ]( S, A ),
]

let pageRouter = {
  "Prosesser": (S, A) => processesView(S, A),
  "Hendelseslogg": (S, A) => eventLogView(S, A),
  "Rapporter": (S, A) => companyDocPage( S, A ),
  "Admin/DB": (S, A) => adminPage( S, A ),
  //"Admin/Entitet": (S, A) => adminEntityView( S["UIstate"]["selectedEntity"] ),
}

let sortEntitiesAlphabeticallyByLabel = ( a , b ) => ('' + a.label).localeCompare(b.label)

let sidebar_left = (S, A) => d([
      d( [42, 43, 44, 45, 47, 5030, 5590, 5612, 5687, 5722]
        .map( entity => entityLabel(entity, e => A.updateLocalState(  {
          selectedEntityType : entity, 
          selectedCategory: null,
          selectedEntity: null
          }))
        )
      ),
      d( S.selectedCategories
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
          .map( entity => entityLabel( entity, e => Database.selectEntity(entity) ))
        )
  ], {style: "display:flex;"})

let newDatomsView = Datoms => d([
  h3("Nye selskapsdatomer generert av hendelsen:"),
  d( Datoms.sort( (a,b) => a.entity - b.entity ).map( Datom => {

      let valueType = Database.get(Database.attr(Datom.attribute), "attribute/valueType")
      let valueView = (valueType === 32 && !isUndefined(Datom.value)) 
        ? entityLabel(Number(Datom.value)) 
        : d( JSON.stringify(Datom.value) )

    return d([
      span( `Selskapsentitet ${ Datom.entity }`, ``, {class: "entityLabel", style: `background-color: lightgray;`} ),
      entityLabel(Database.attr(Datom.attribute)),
      valueView,
    ], {class: "columns_1_1_1"})

  } ))
])

let eventLogView = (S, A) => {

  let selectedCompany =  S["UIstate"].selectedCompany

  let companyProcesses = Database.getAll(5692).filter( e => Database.get(e, "process/company" ) === selectedCompany )

  let companyEvents = Database.getAll(46)
    .filter(  e => companyProcesses.includes( Database.get(e, "event/process" ) )   )
    .sort(  (a,b) => Database.get(a, "event/date" ) - Database.get(b, "event/date" ) )


  return d([
    d([
      d("#"),
      d("Dato"),
      d("Hendelse"),
      d("Prosess"),
      d("Status"),
    ], {class: "columns_1_1_1_1_1"}),
    d(
      companyEvents.map( (event, index) => d([
        d(String(index)),
        d( moment( Database.get(event, "event/date") ).format("DD/MM/YYYY") ),
        entityLabel_largePopup(event),
        entityLabel_largePopup( Database.get(event, 5708) ),
        Database.getEvent(event).isValid() ? d("Gyldig", {style: "background-color: #269c266e;"}) : d("Ikke gyldig", {style: "background-color: #f94d4d6e;"})
      ], {class: "columns_1_1_1_1_1"})  )
    )
  ], {class: "feedContainer"})
} 


let companyDocPage = (S,A) => {

  let Company = Database.getCompany(Number(S["UIstate"].selectedCompany))

  return d([
    d([
      d( //Left sidebar
        Database.getAll(47)
        .filter( entity => Database.get(entity, "entity/category") === "Entitetstyper i selskapsdokumentet" )
        .map( entity => entityLabel(entity, e => A.updateLocalState({selectedCompanyDocEntityType: entity, selectedCompanyDocEntity: null} )) )
        ),
      d(
        Company.Entities 
          .filter( Entity => Entity[19] === S["UIstate"]["selectedCompanyDocEntityType"]  ) 
          .map( Entity => d( 
            `Entitet # ${Entity.entity}`, 
            {class: Entity.entity === S["UIstate"].selectedCompanyDocEntity ? "textButton textButton_selected" : "textButton", style: "background-color: #c9c9c9;" }, 
            "click", 
            e => A.updateLocalState({selectedCompanyDocEntity: Entity.entity} )
            )
            )
        )
    ], {class: "columns_1_1"}),
    d([
      /* d([
        submitButton("<<", e => A.updateLocalState({"selectedCompanyDocVersion": 0}) ),
        submitButton("<", e => A.updateLocalState({"selectedCompanyDocVersion": Math.max(S["UIstate"].selectedCompanyDocVersion - 1, 0) })),
        d(`${S["UIstate"].selectedCompanyDocVersion} / ${Database.getCompany( Number(S["UIstate"].selectedOrgnumber) ).events.length}`),
        submitButton(">", e => A.updateLocalState({"selectedCompanyDocVersion": Math.min(S["UIstate"].selectedCompanyDocVersion + 1, Database.getCompany( Number(S["UIstate"].selectedOrgnumber) ).events.length)})),
        submitButton(">>", e => A.updateLocalState({"selectedCompanyDocVersion": Database.getCompany( Number(S["UIstate"].selectedOrgnumber) ).events.length})),
      ], {class: "columns_1_1_1_1_1"}), */
      Company.Entities.find( Entity => Entity.entity === S["UIstate"].selectedCompanyDocEntity ) 
        ? d( 
            Object.keys(Company.Entities.find( Entity => Entity.entity === S["UIstate"].selectedCompanyDocEntity ))
            .filter( key => !["entity", "t"].includes(key))
            .map( key => Number(key))
            .map( attribute => d([
              entityLabel(attribute),
              input( 
                {value: Company.get(S["UIstate"].selectedCompanyDocEntity, attribute), style: ``, disabled: "disabled"},
              )
            ], {class: "columns_1_1"}) )
          )
        : d("Ingen entitet valgt.")

    ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
    d("")
  ], {class: "pageContainer"})

}

let adminPage = (S, A) => d([
  sidebar_left(S, A),
  adminEntityView(S["UIstate"]["selectedEntity"]),
  d("")
], {class: "pageContainer"})

let entityView = entity => {

  let versions = Database.get(entity).Datoms.map( Datom => Datom.tx ).filter( filterUniqueValues ).filter( tx => isNumber(tx) )
  let selectedVersion = Database.getLocalState(entity).tx
  let firstVersion = versions[0]
  let lastVersion = versions[versions.length - 1]
  let prevVersion = versions.filter( tx => tx < selectedVersion ).length > 0 ? versions.filter( tx => tx < selectedVersion ).reverse()[0] : selectedVersion
  let nextVersion = versions.filter( tx => tx > selectedVersion ).length > 0 ? versions.filter( tx => tx > selectedVersion )[0] : selectedVersion

  
  return d([
    d([
      d([span( `Entitet`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`}, null )], {style:"display: inline-flex;"}),
      d(String(entity), {style: `text-align: right;`} )
    ], {class: "columns_1_1"}),
    d([
      d([span( `Versjon`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`}, null )], {style:"display: inline-flex;"}),
      d([
        submitButton("<<", e => Database.setLocalState(entity, {tx: firstVersion  })),
        submitButton("<", e => Database.setLocalState(entity, {tx: prevVersion  })),
        d([
          d(`${versions.findIndex( v => v === selectedVersion ) + 1} / ${versions.length}`),
          //submitButton("Gjenopprett", async e => console.log(Entity) ),
        ]),
        submitButton(">", e => Database.setLocalState(entity, {tx: nextVersion  })),
        submitButton(">>", e => Database.setLocalState(entity, {tx: lastVersion })),
      ], {class: "columns_1_1_1_1_1"}),
      d( `${new Date(selectedVersion).toLocaleDateString()} ${new Date(selectedVersion).toLocaleTimeString()}`, {style: `text-align: right;`} )
    ], {class: "columns_1_2_1"}),
  ]) 
} 

//Processes view

let processesView = ( S , A ) => d([
  d([
    d(
      Database.getAll(5692)
        .filter( e => Database.get(e, "process/company" ) === S["UIstate"].selectedCompany )
        .map( entity => entityLabel(entity, e => A.updateLocalState({selectedProcess: entity} )) )
      ),
      br(),
      dropdown(0, [{value: 0, label: "Legg til prosess"}].concat( Database.getAll(5687).map( e => returnObject({value: e, label: Database.get(e, "entity/label")}) ) ) , async e => {

        let processType = Number( submitInputValue(e) )

        let newProcess = await Database.createEntity(5692, [
          newDatom( "newEntity" , "process/company", S["UIstate"].selectedCompany  ),
          newDatom( "newEntity" , "process/processType", processType ),
          newDatom( "newEntity" , "entity/label", `${Database.get(processType, "entity/label")} for ${Database.get(S["UIstate"].selectedCompany, "entity/label")}`  ),
        ] )


        let eventType = Database.get(processType, "attribute/1605528219674")[0].eventType



        let firstEvent = Database.createEvent(eventType, newProcess.entity)

      } )
  ]),
  processView( S , A ,Number(S["UIstate"].selectedProcess) )
], {class: "pageContainer"})

let processProgressView = (S, A, process) => {

  let processEvents = Database.getAll(46)
    .filter( event => Database.get(event).current["event/process"] === process )
    .sort(  (a,b) => Database.get(a, "event/date" ) - Database.get(b, "event/date" ) )

  let selectedEvent = isDefined(Database.getLocalState(process).selectedEvent)
  ? Database.getLocalState(process).selectedEvent
  : processEvents[0]


  return d([
    d( Database.get(Database.get(process, "process/processType"), "attribute/1605528219674").map( (processStep, index) => d([
          entityLabel( processStep.eventType, e => 0 ),
          d( Database.getAll(46)
          .filter( event => Database.get(event).current["event/process"] === process )
          .filter( event => Database.get(event, "event/eventTypeEntity") === processStep.eventType  )
          .map( event => d(String(event), {style: event === selectedEvent ? "color: blue;" : ""}, "click", e => Database.setLocalState(process, {selectedEvent: event })  ) ) )
        ], {style: processStep.eventType === Database.get(selectedEvent, "event/eventTypeEntity") ? "background-color: #bfbfbf;" : ""})
    ), {style: "display: flex;"} ),
    /* d( [
      selectedEventIndex > 0 ? submitButton("<", e => Database.setLocalState(process, {selectedEvent: processEvents[selectedEventIndex - 1] })) : d("["),
      selectedEventIndex < processEvents.length - 1 ? submitButton(">", e => Database.setLocalState(process, {selectedEvent: processEvents[selectedEventIndex + 1 ] })) : d("]")
    ], {style: "display: flex;"}) */
  ])
} 


let processView =  (S , A, process) => {

  let processEvents = Database.getAll(46)
    .filter( event => Database.get(event, "event/process") === process )
    .sort(  (a,b) => Database.get(a, "event/date" ) - Database.get(b, "event/date" ) )
  
  let selectedEvent = isDefined(Database.getLocalState(process).selectedEvent)
  ? Database.getLocalState(process).selectedEvent
  : processEvents[0]

  let Process = Database.get(process)

  Process.getEvents = () => processEvents

  let processType = Database.get(process, "process/processType")
  let nextEventsFunctionString = Database.get( processType, "attribute/1605528219674").find( Step => Step.eventType === Database.get(selectedEvent, "event/eventTypeEntity") ).nextEventsFunction
  let allowedNextEventTypes = new Function( ["Database", "Process"] , nextEventsFunctionString  )( Database, Process )

  return (isNull(process) || isUndefined( Database.get(process) ))
  ? d("Ingen prosess valgt.", {class: "feedContainer"})
  : d([
      d([
        entityLabel(5692),
        entityLabel(process),
      ], {class: "columns_1_1"}),
      d([
        entityLabel(5687),
        entityLabel(Database.get(process, "process/processType")),
      ], {class: "columns_1_1"}),
      processProgressView(S, A, process),
      br(),
      singleEventView(S, selectedEvent ),
      d([
        d("Status på hendelse"),
        Database.getEvent(selectedEvent).isValid() ? d("Gyldig", {style: "background-color: #269c266e;"}) : d("Ikke gyldig", {style: "background-color: #f94d4d6e;"})
      ], {class: "columns_1_1"}),
      Database.getEvent(selectedEvent).isValid()
        ? d([
          d("Legg til hendelse:"),
          d( allowedNextEventTypes.map( eventType => entityLabel(eventType, async e => Database.createEvent( eventType , process ) ) ) )
        ])
        : d("Kan ikke legge til nye hendelser før denne hendelsen er gyldig"),
    ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"} )
}

let singleEventView =  (S, entity) => {
  
  let eventType = Database.get(entity, "event/eventTypeEntity")

  return d([
    h3( Database.get(eventType, "entity/label") ),
    d( Database.get(eventType, "eventType/eventAttributes").map( attribute => datomView( entity, attribute ))),
  ], {class: "feedContainer"} )

}

// End ----

//Entity view

let adminEntityView = entity => {

  let entityType = Database.get(entity, "entity/entityType")

  return (isNull(entity) || isUndefined( Database.get(entity) ))
  ? d("Ingen entitet valgt.", {class: "feedContainer"})
  : d([
      h3( Database.get(entity, "entity/label")),
      entityView(entity),
      d( Database.get( entityType, "entityType/attributes", Database.getLocalState(entityType).tx).map( attribute => datomView( entity, attribute, Database.getLocalState(entity).tx ) )),
      retractEntityButton(entity),
      createEntityButton( entityType ),
    ], {class: "feedContainer"} )
}

let datomView = (entity, attribute, version) => {

  


  let genericValueTypeViews = {
    "30": input_text, //Tekst
    "31": input_number, //Tall
    "32": input_singleEntity, //Entitet
    "33": input_object, //Array
    "37": input_multipleSelect, //Entiteter
    "34": input_function, //Funksjonstekst
    "35": input_object, //Objekt
    "36": input_boolean, //Bool
    "38": input_datomConstructor, //valueTypeView_newDatoms,
    "39": input_eventConstructor, //valueTypeView_newDatoms,
    "40": input_object, //valueTypeView_staticDropdown,
    "41": input_singleCompanyEntity, //valueTypeView_companyEntityDropdown,    
    "5721": input_date
  } 


  let Datom = Database.getDatom( entity, attribute, version )
  


  let view = {}

  try {

    view = isUndefined(Datom)
    ? d([
      entityLabel( attribute ),
      input_undefined( entity, attribute )
    ], {class: "columns_1_1"})
    : [37, 38, 39].includes(Database.get(Database.attr(Datom.attribute), "attribute/valueType"))
      ? genericValueTypeViews[ Datom.valueType  ]( Datom )
      : d([
        entityLabel( Database.attr(Datom.attribute) ),
        genericValueTypeViews[ Database.get(Database.attr(Datom.attribute), "attribute/valueType")  ]( Datom )
      ], {class: "columns_1_1"})
    
  } catch (error) {
    view = d(error)
  }


  return view
}

let input_undefined = (entity, attribute) => input(
  {value: "", style: `background-color: #de171761;`},
  "change", 
  async e => await Database.updateEntity(entity, attribute, Number.isNaN( Number(submitInputValue(e)) ) ? submitInputValue(e) : Number(submitInputValue(e))  )
)

let input_text = Datom => input(
  {value: Datom.value, style: ``},
  "change", 
  async e => await Database.updateEntity(Datom.entity, Datom.attribute,  submitInputValue(e) )
)

let input_number = Datom => input(
    {value: String(Datom.value), style: `text-align: right;`}, 
    "change", 
    async e => await Database.updateEntity(Datom.entity, Datom.attribute,  Number(submitInputValue(e)) )
)

let input_date = Datom => input(
  {value: moment(Datom.value).format("DD/MM/YYYY"), style: `text-align: right;`}, 
  "change", 
  async e => await Database.updateEntity(Datom.entity, Datom.attribute, Number( moment(submitInputValue(e), "DD/MM/YYYY").format("x") )   )
)

let input_function = Datom => textArea(
  Datom.value, 
  {class:"textArea_code"}, 
  async e => await Database.updateEntity(Datom.entity, Datom.attribute,  submitInputValue(e).replaceAll(`"`, `'`) )
)

let input_object = Datom => textArea(
  JSON.stringify(Datom.value),
  {class:"textArea_code"}, 
  async e => await Database.updateEntity(Datom.entity, Datom.attribute,  JSON.parse( submitInputValue(e) ) )
)

let input_boolean = Datom => input(
  {value: Datom.value ? "1" : "0", style: `text-align: right;`}, 
  "change", 
  async e => await Database.updateEntity(Datom.entity, Datom.attribute,  submitInputValue(e) === "1" ? true : false )
)

let input_singleEntity = Datom => d([
  htmlElementObject("datalist", {id:`entity/${Datom.entity}/options`}, optionsElement( Database.getOptions(Datom.entity, Database.attr(Datom.attribute), Datom.tx )) ),
  input(
    {value: Database.getOptions(Datom.entity, Database.attr(Datom.attribute), Datom.tx ).find( Option => Option.value === Datom.value)
       ? Database.getOptions(Datom.entity, Database.attr(Datom.attribute), Datom.tx ).find( Option => Option.value === Datom.value).label
       : "Ingen entitet valgt", 
      list:`entity/${Datom.entity}/options`, 
      style: `text-align: right;`
    }, 
    "change", 
    async e => Database.getOptions(Datom.entity, Database.attr(Datom.attribute), Datom.tx ).map( Option => Option.value ).includes(Number(submitInputValue(e))) 
      ? await Database.updateEntity(Datom.entity, Datom.attribute,  Number(submitInputValue(e)))
      : log("Selected option not valid: ", Datom, Number(submitInputValue(e)))
  )
]) 

let input_datomConstructor = Datom => {

  let datoms = Datom.value

  return d([
    entityLabel(Database.attr(Datom.attribute)),
    d([
      d("EntitetID"),
      d("Attributt"),
      d("Verdi")
    ], {class: "columns_2_2_2_1"}),
    d(datoms.map( (datom, index) => d([
      dropdown(
        datom.entity, 
        [{value: `return 1;`, label: `Selskapets entitet`}, {value: `return Q.latestEntityID() + 1;`, label: `Ny entitet nr. 1`}, {value: `return Q.latestEntityID() + 2;`, label: `Ny entitet nr. 2`}, {value: `return Q.latestEntityID() + 3;`, label: `Ny entitet nr. 3`}, , {value: `return Q.latestEntityID() + 4;`, label: `Ny entitet nr. 4`}, , {value: `return Q.latestEntityID() + 5;`, label: `Ny entitet nr. 5`}],
        async e => await Database.updateEntity(Datom.entity, Datom.attribute, mergerino(datoms, {[index]: {entity: submitInputValue(e)}})  )
        ),
      d([
        htmlElementObject("datalist", {id:`entity/${Datom.entity}/options`}, optionsElement( Database.getAll(42)
          .filter( attr => attr >= 1000 ).concat(19)
          .filter( attr => Database.get(attr, "entity/label") !== "Ubenyttet hendelsesattributt")
        )),
        input(
          {value: Database.get( Database.attr(datom.attribute), "entity/label"), list:`entity/${Datom.entity}/options`, style: `text-align: right;`}, 
          "change", 
          async e => {
            if(!isUndefined(submitInputValue(e))){
            let updatedValue = mergerino(datoms, {[index]: {attribute: Number(submitInputValue(e)), value: `return Event.get(${Number(submitInputValue(e))})`}})
            await Database.updateEntity(Datom.entity, Datom.attribute, updatedValue  )
            await Database.updateEntity(Datom.entity, "eventType/eventAttributes", Database.get(Datom.entity, "eventType/eventAttributes").concat( Number(submitInputValue(e)) ).filter(filterUniqueValues)  )
            }

          } 
        )
      ]),
      textArea(datom.value, {class:"textArea_code"}, async e => await Database.updateEntity(Datom.entity, Datom.attribute, mergerino(datoms, {[index]: {value: submitInputValue(e)}})  )),
      submitButton("[Slett]", async e => await Database.updateEntity(Datom.entity, Datom.attribute, datoms.filter( (d, i) => i !== index  )  )),
    ], {class: "columns_2_2_2_1"}) )),
    submitButton("Legg til", async e => await Database.updateEntity(Datom.entity, Datom.attribute, datoms.concat({entity: `return Q.latestEntityID() + 1;`, attribute: 1001, value: `return ''` })  ))
  ])

}

let input_eventConstructor = Datom => {

  let eventConstructors = Datom.value

  return d([
    entityLabel(5690),
    d([
      d("Steg"),
      d("Hendelsestype"),
      d("Tillatte neste hendelser"),
      d(" "),
    ], {class: "columns_1_2_4_1"}),
    d(eventConstructors.map( (eventConstructor, index) => d([
      d(String(index)),
      dropdown(eventConstructor.eventType,  Database.getAll(43).map( e => returnObject({value: e, label: Database.get(e, "entity/label") }) ), async e => {
        let eventType = Number(submitInputValue(e))
        let nextEventsFunction = `return [${eventType}];`
        let updatedEventConstructor = {eventType, nextEventsFunction}
        await Database.updateEntity(Datom.entity, Datom.attribute, mergerino(eventConstructors, {[index]:updatedEventConstructor}) )
      } ),
      textArea(
        eventConstructor.nextEventsFunction, 
        {class:"textArea_code"}, 
        async e => await Database.updateEntity(Datom.entity, Datom.attribute, mergerino(eventConstructors, {[index]: {nextEventsFunction: submitInputValue(e).replaceAll(`"`, `'`)} }) )
      ),
      submitButton("[Slett]", async e => await Database.updateEntity(Datom.entity, Datom.attribute, eventConstructors.filter( (d, i) => i !== index  )  )),
    ], {class: "columns_1_2_4_1"}) )),
    submitButton("Legg til steg", async e => await Database.updateEntity(Datom.entity, Datom.attribute, eventConstructors.concat({eventType: 5000, nextEventsFunction: "return [5000];" })  ))
  ])
}

let input_multipleSelect = Datom => d([
  entityLabel(Database.attr(Datom.attribute)),
  d([
    d( Datom.value.map( attr => d([
      entityLabel(attr), 
      submitButton("[X]", async e => await Database.updateEntity(Datom.entity, Datom.attribute, Datom.value.filter( e => e !== attr )  ) )
      ], {class: "columns_3_1"} ) 
    )),
    d("<br>"),
    d([
      htmlElementObject("datalist", {id:`entity/${Datom.entity}/options`}, optionsElement( Database.getOptions(Datom.entity, Database.attr(Datom.attribute), Datom.tx )) ),
      input(
        {value: "Legg til (søk)", list:`entity/${Datom.entity}/options`, style: `text-align: right;`}, 
        "change", 
        async e => Database.getOptions(Datom.entity, Database.attr(Datom.attribute), Datom.tx ).map( Option => Option.value ).includes( Number(submitInputValue(e)) ) ? await Database.updateEntity(Datom.entity, Datom.attribute,  Datom.value.concat( Number(submitInputValue(e)) ) ) : console.log("Option not allowed: ", submitInputValue(e) )
      )
    ])
  ], {class: "eventAttributeRow"})
], {class: "columns_1_1"})

let input_singleCompanyEntity = Datom => {
  let Company = Database.getCompany(Number(Database.S["UIstate"].selectedCompany))

  let t =  Company.events.findIndex( e => e === Datom.entity ) // 5 // Database.get(Datom.entity, 1000)

  let optionObjects = Company.getOptions( Database.attr(Datom.attribute), t )
  let selectedOption = optionObjects.find( Option => Option.value === Datom.value)
  let value = isDefined(selectedOption)
  ? selectedOption.value
  : "Ingen entitet valgt"

  return d([
    
    dropdown( Number(value), optionObjects, async e => optionObjects.map( Option => Number(Option.value) ).includes( Number(e.srcElement.value) ) 
    ? await Database.updateEntity(Datom.entity, Datom.attribute,  Number(submitInputValue(e)))
    : log("Selected option not valid: ", Datom, Number(e.srcElement.value))  )
    /* 
    htmlElementObject("datalist", {id:`entity/${Datom.entity}/options`}, optionsElement( optionObjects ) ),
    input(
      {value: value, list:`entity/${Datom.entity}/options`, style: `text-align: right;`}, 
      "change", 
      async e => optionObjects.map( Option => Number(Option.value) ).includes( Number(e.srcElement.value) ) 
        ? await Database.updateEntity(Datom.entity, Datom.attribute,  Number(submitInputValue(e)))
        : log("Selected option not valid: ", Datom, Number(e.srcElement.value))
    ) */
  ])
} 
