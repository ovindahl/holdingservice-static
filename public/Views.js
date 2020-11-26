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

let actionButton = (label, onClick) => d(label, {class: "actionButton"}, "click", e => {
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
      span( `${Database.get(entity, "entity/label") ? Database.get(entity, "entity/label") : "[Visningsnavn mangler]"}`, ``, {class: "entityLabel", style: `background-color:${Database.get( Database.get(entity, "entity/entityType" ), Database.attrName(20) )};`}, "click", isUndefined(onClick) ? e => Database.selectEntity(entity) : onClick ),
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



let entityInspectorPopup_Company = (company, t) => {

  
  return d([
    h3( Database.get( company , "entity/label") ),
    d([
      d([span( `Entitet`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`} )], {style:"display: inline-flex;"}),
      d(String(company), {style: `text-align: right;`} )
    ], {class: "columns_1_1"}),
    d([
      d([span( `t`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`} )], {style:"display: inline-flex;"}),
      d(String(t), {style: `text-align: right;`} )
    ], {class: "columns_1_1"}),
    d( Database.get(5722, 6050).map( calculateValue => calculatedFieldView(company, calculateValue)  ) ),
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

let pageSelectionMenuRow = (S, A) => d( ["Prosesser", "Hendelseslogg", "Tidslinje", "Selskapets datomer", "Selskapets entiteter", "Admin/DB"].map( pageName => d( pageName, {class: pageName === S["UIstate"].currentPage ? "textButton textButton_selected" : "textButton"}, "click", e => A.updateLocalState(  {currentPage : pageName} ) )  ), {style: "display:flex;"})

let generateHTMLBody = (S, A) => [
  headerBarView(S),
  companySelectionMenuRow(S, A),
  pageSelectionMenuRow(S, A),
  pageRouter[ S["UIstate"].currentPage ]( S, A ),
]

let pageRouter = {
  "Prosesser": (S, A) => processesView(S, A),
  "Hendelseslogg": (S, A) => eventLogView(S, A),
  "Tidslinje": (S, A) => timelineView(S, A),
  "Selskapets datomer": (S, A) => companyDatomsPage( S, A ),
  "Selskapets entiteter": (S, A) => companyDocPage( S, A ),
  "Admin/DB": (S, A) => adminPage( S, A ),
  //"Admin/Entitet": (S, A) => adminEntityView( S["UIstate"]["selectedEntity"] ),
}

let sortEntitiesAlphabeticallyByLabel = ( a , b ) => ('' + a.label).localeCompare(b.label)

let sidebar_left = (S, A) => d([
      d( [42, 43, 44, 45, 47, 5030, 5590, 5612, 5687, 5817]
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

let newDatomsView = event => d([
  h3("Nye selskapsdatomer generert av hendelsen:"),
  d( Database.getEvent(event).constructedDatoms.sort( (a,b) => a.entity - b.entity ).map( Datom => {

      let valueType = Database.get(Datom.attribute, "attribute/valueType")
      let valueView = (valueType === 32 && !isUndefined(Datom.value)) 
        ? entityLabel(Number(Datom.value)) 
        : d( JSON.stringify(Datom.value) )

    return d([
      span( `Selskapsentitet ${ Datom.entity }`, ``, {class: "entityLabel", style: `background-color: lightgray;`} ),
      entityLabel(Datom.attribute),
      valueView,
    ], {class: "columns_1_1_1"})

  } ))
])

let eventLogView = (S, A) => {

  let companyEvents = Database.getCompany(S["UIstate"].selectedCompany).events


  return d([
    d([
      d("t"),
      d("Dato"),
      d("Hendelse"),
      d("Prosess"),
      d("Status"),
    ], {class: "columns_1_1_1_1_1"}),
    d(
      companyEvents.map( (event, index) => d([
        d(String(Database.getEvent(event).t)),
        d( moment( Database.getEvent(event).get("event/date") ).format("DD/MM/YYYY") ),
        entityLabel(event),
        entityLabel( Database.get(event, 5708) ),
        Database.getEvent(event).isValid() ? d("Gyldig", {style: "background-color: #269c266e;"}) : d("Ikke gyldig", {style: "background-color: #f94d4d6e;"})
      ], {class: "columns_1_1_1_1_1"})  )
    )
  ], {class: "feedContainer"})
}



let timelineView = (S,A) => {
  let company = Number(S["UIstate"].selectedCompany)
  let Company = Database.get(company)


  let selectedEntity = S["UIstate"].selectedCompanyDocEntity

  







  let tMax = Company.companyDatoms.slice( -1 )[0].t
  let tArray = new Array(tMax+1).fill(0).map( (v, i) => i )
  let companyProcesses = Database.get(company, 6157)
  


  return d([
    d([
      entityLabel(company),
      d( tArray.map( t => d([
                d([
                  span( 
                    `${t}`, 
                    `${t}`, 
                    {
                      class: "entityLabel", 
                      style: `background-color: #9ad2ff;`
                    }),
                  //entityInspectorPopup_Company(company, t)
                ], {class: "popupContainer", style:"display: inline-flex;"})
              ], {style:"display: inline-flex;"} )
        ), {style: `display:grid;grid-template-columns: repeat(${tArray.length}, 1fr);background-color: #8080802b;margin: 5px;`} ),
  
    ], {style: `display:grid;grid-template-columns: 1fr 9fr;`}),
    d(companyProcesses.map( process => processTimelineView(S, A, process) ))

  ])
}


let processTimelineView = (S, A, process) => {

  let company = Number(S["UIstate"].selectedCompany)
  let Company = Database.get(company)
  let tMax = Company.companyDatoms.slice( -1 )[0].t
  let tArray = new Array(tMax+1).fill(0).map( (v, i) => i )


  let processEvents = Database.getAll(46)
    .filter( event => Database.get(event, "event/process") === process )
    .sort(  (a,b) => Database.get(a, "event/date" ) - Database.get(b, "event/date" ) )




  let processEventsTimes = processEvents.map( event => Company.companyDatoms.filter( Datom => Datom.event === event ).slice(-1)[0].t )

  let firstEventTime = processEventsTimes[0]
  let lastEventTime = processEventsTimes.slice( -1 )[0]

  return d([
    entityLabel(process),
    d( tArray.map( t =>   {
      let event = Company.companyDatoms.filter( Datom => Datom.t === t ).length > 0 ? Company.companyDatoms.filter( Datom => Datom.t === t )[0].event : undefined
      return (t < firstEventTime || t > lastEventTime)
        ? d(" ")
        : processEventsTimes.includes(t)
          ? d([
              d([
                span( `${t}`, `${Database.get( event , "entity/label")}`, {class: "entityLabel", style: `background-color:${Database.getCalculatedField(event, 6161) ? "#9ad2ff" : Database.getCalculatedField(event, 6077) ? "#0080004f" : "#c30d0066"   };`}, 
                  "click", e => {
                    A.updateLocalState({ currentPage : "Prosesser", selectedProcess: process })
                    Database.setLocalState(process, {selectedEvent: event })
                  } ),
                  d([
                    singleEventView(S, event)
                  ], {class: "entityInspectorPopup"})
              ], {class: "popupContainer", style:"display: inline-flex;"})
            ], {style:"display: inline-flex;"} )
          : d("-" ) 
        }), {style: `display:grid;grid-template-columns: repeat(${tArray.length}, 1fr);background-color: #8080802b;margin: 5px;`} ),
      
    

  ], {style: `display:grid;grid-template-columns: 1fr 9fr;`})
}


let companyDatomsPage = (S,A) => {

  let Company = Database.getCompany(Number(S["UIstate"].selectedCompany))

  return d([
    d([
      d("Entitet"),
      d("Attributt"),
      d("Verdi"),
      d("Hendelse"),
      d("t"),
    ], {class: "columns_1_1_1_1_1", style: "background-color: #bdbbbb;padding: 5px;" }),
    d(Company.companyDatoms.map( Datom => d([
      d(JSON.stringify( Datom.entity )),
      entityLabel( Datom.attribute ),
      d(JSON.stringify( Datom.value )),
      entityLabel(Datom.event),
      d(JSON.stringify( Datom.t )),
    ], {class: "columns_1_1_1_1_1"}) ) ),
  ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

}


let companyDocPage = (S,A) => {

  let company = Number(S["UIstate"].selectedCompany)

  let Company = Database.get(company)

  Company.get = (entity, attribute) => {

    let matchingDatoms = Company.companyDatoms
    .filter( Datom => Datom.entity === entity )
    .filter( Datom => Datom.attribute === attribute )
    
    let datom = (matchingDatoms.length > 0) 
      ? matchingDatoms.slice( -1 )[0]
      : undefined

    let value = isDefined(datom)
      ? datom.value
      : undefined

    return value

  }

  let selectedEntity = S["UIstate"].selectedCompanyDocEntity

  let entityType = Company.get(selectedEntity, 19)


  return d([
    d([
      d( //Left sidebar
        Database.getAll(47)
        .filter( entity => Database.get(entity, "entity/category") === "Entitetstyper i selskapsdokumentet" )
        .map( entity => entityLabel(entity, e => A.updateLocalState({selectedCompanyDocEntityType: entity, selectedCompanyDocEntity: null} )) )
        ),
      d(
        Company.companyDatoms.map( Datom => Datom.entity ).filter( filterUniqueValues )
          .filter( entity => Company.get(entity, 19) === S["UIstate"]["selectedCompanyDocEntityType"]  )
          .map( entity => d( 
            `Entitet # ${entity}`, 
            {class: entity === S["UIstate"].selectedCompanyDocEntity ? "textButton textButton_selected" : "textButton", style: "background-color: #c9c9c9;" }, 
            "click", 
            e => A.updateLocalState({selectedCompanyDocEntity: entity} )
            )
            )
        )
    ], {class: "columns_1_1"}),
    d([
      Company.companyDatoms.map( Datom => Datom.entity ).filter( filterUniqueValues ).find( entity => entity === S["UIstate"].selectedCompanyDocEntity )
        ? d([
          d(Company.companyDatoms
            .filter( Datom => Datom.entity === S["UIstate"].selectedCompanyDocEntity )
            .map( Datom => Datom.attribute )
            .map( attribute => companyEntityView(Company, S["UIstate"].selectedCompanyDocEntity, attribute) )),
          d( 
            Database.get( entityType, "entityType/calculatedFields" ).map( calculatedField => d([
              entityLabel(calculatedField),
              d(JSON.stringify( Database.getCompanyCalculatedField(company, selectedEntity, calculatedField) ))
            ], {class: "columns_1_1"})    )
            )
        ])
        : d("Ingen entitet valgt.")

    ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
    d("")
  ], {class: "pageContainer"})

}

let companyEntityView = (Company, entity, attribute) => {

  let value = Company.companyDatoms
  .filter( Datom => Datom.entity === entity )
  .filter( Datom => Datom.attribute === attribute )
  .slice(-1)[0].value


  let valueType = Database.get(attribute, "attribute/valueType")
  let valueView = (valueType === 32 && !isUndefined(value)) 
    ? entityLabel(Number(value)) 
    : d( JSON.stringify(value) )

  return d([
    entityLabel(attribute),
    valueView
  ], {class: "columns_1_1"})



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
      dropdown(0, [{value: 0, label: "Legg til prosess"}].concat( Database.getAll(5687).map( e => returnObject({value: e, label: Database.get(e, "entity/label")}) ) ) , async e => await Database.createEntity(5692, [
        newDatom( "newEntity" , "process/company", S["UIstate"].selectedCompany  ),
        newDatom( "newEntity" , "process/processType", Number( submitInputValue(e) ) ),
        newDatom( "newEntity" , "entity/label", `${Database.get(Number( submitInputValue(e) ), "entity/label")} for ${Database.get(S["UIstate"].selectedCompany, "entity/label")}`  ),
      ] ) )
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
    d( Database.get(Database.get(process, "process/processType"), 5926).map( (eventType, index) => d([
          entityLabel( eventType ),
          d( Database.getAll(46)
          .filter( event => Database.get(event).current["event/process"] === process )
          .filter( event => Database.get(event, "event/eventTypeEntity") === eventType  )
          .map( event => d(String(event), {style: event === selectedEvent ? "color: blue;" : ""}, "click", e => Database.setLocalState(process, {selectedEvent: event })  ) ) )
        ], {style: eventType === Database.get(selectedEvent, "event/eventTypeEntity") ? "background-color: #bfbfbf;" : ""})
    ), {style: "display: flex;"} ),
    /* d( [
      selectedEventIndex > 0 ? submitButton("<", e => Database.setLocalState(process, {selectedEvent: processEvents[selectedEventIndex - 1] })) : d("["),
      selectedEventIndex < processEvents.length - 1 ? submitButton(">", e => Database.setLocalState(process, {selectedEvent: processEvents[selectedEventIndex + 1 ] })) : d("]")
    ], {style: "display: flex;"}) */
  ])
} 

let processView =  (S , A, process) => {



  return (isNull(process) || isUndefined( Database.get(process) ) || Object.keys(Database.get(process).current).length === 1 )
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
      d( Database.get(  Database.get(process, "entity/entityType"), "entityType/calculatedFields").map( calculatedField => d([
        entityLabel(calculatedField),
        d( JSON.stringify( Database.getCalculatedField(process, calculatedField) ) )
      ], {class: "columns_1_1"})  ) ),
      br(),
      processActionsView(S, process),
      br(),
      singleEventView(S, Database.get(process, 6137) ),
      
    ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"} )
}

let singleEventView =  (S, event) => {
  
  return (isNull(event) || isUndefined( Database.get(event) )  || Object.keys(Database.get(event).current).length === 1   )
    ? d("Ingen hendelse valgt.", {class: "feedContainer"})
    : d([
        h3( Database.get(Database.get(event, "event/eventTypeEntity"), "entity/label") ),
        d( Database.get(Database.get(event, "event/eventTypeEntity"), "eventType/eventAttributes").map( attribute =>  Database.get(event, 6161 ) ? lockedDatomView( event, attribute ) : editabledDatomView( event, attribute )  )),
        br(),
        d( Database.get( Database.get( event ,"entity/entityType"), "entityType/calculatedFields").map( calculatedField => calculatedFieldView( event, calculatedField ) )),
      ], {class: "feedContainer"} )

}

let processActionsView =  (S, process) => {

  let Process = {
    entity: process,
    getEvents: () => Database.getCalculatedField( process, 6088 )
  }

  let processType =   Database.get(process, "process/processType" )

  let eventsCount = Database.getCalculatedField( process, 6088 ).length

  let selectedEvent = Database.get(process, 6137)

  let actionButtons = Database.get(processType, "processType/actions")
      .map( action => new Function(["Database", "Process"], action[5848])(Database, Process)
        ? actionButton(action[6], async e => new Function(["Database", "Process"], action[5850])(Database, Process) )
        : d(action[6], {class: "actionButton", style: "background-color: gray;"})
      )
    

  return d([
        entityLabel(5922),
        d([
          eventsCount === 0
            ? actionButton("Start prosess", async e => Database.createEvent( Database.get(processType, 5926)[0], process, {1757: Date.now()}) )
            : d("Start prosess", {class: "actionButton", style: "background-color: gray;"}),
          d(actionButtons),
          eventsCount > 0
            ? d([
                actionButton("Slett denne hendelsen", async e => await Database.retractEntity( selectedEvent )),
                actionButton("Slett alle hendelser i prosessen", async e => await Database.retractEntities( Database.getCalculatedField( process, 6088 ) )),
            ])
            : d([
              d("Slett denne hendelsen", {class: "actionButton", style: "background-color: gray;"}),
              d("Slett alle hendelser i prosessen", {class: "actionButton", style: "background-color: gray;"})

            ]),
          eventsCount === 0
            ? actionButton("Slett prosess", async e => await Database.retractEntity( process ))
            : d("Slett prosess", {class: "actionButton", style: "background-color: gray;"})

        ]),
        
      ], {class: "columns_1_1"})

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
      d( Database.get( entityType, "entityType/attributes", Database.getLocalState(entityType).tx).map( attribute => editabledDatomView( entity, attribute, Database.getLocalState(entity).tx ) )),
      d( Database.get( entityType, "entityType/calculatedFields", Database.getLocalState(entityType).tx).map( calculatedField => calculatedFieldView( entity, calculatedField, Database.getLocalState(entity).tx ) )),
      retractEntityButton(entity),
      createEntityButton( entityType ),
    ], {class: "feedContainer"} )
}

let calculatedFieldView = (entity, calculatedField, version) => d([
  entityLabel(calculatedField),
  d(JSON.stringify(Database.get(entity, calculatedField)))
], {class: "columns_1_1"})

let lockedDatomView = (entity, attribute, version) => {

  try {

    return d([
        entityLabel( attribute ),
        d(JSON.stringify( Database.get(entity, attribute) ))
      ], {class: "columns_1_1"})
    
  } catch (error) {return d(error) }
}

let editabledDatomView = (entity, attribute, version) => {

  let genericValueTypeViews = {
    "30": input_text, //Tekst
    "31": input_number, //Tall
    "32": input_Entity, //Entitet
    "33": input_object, //Array
    "37": input_multipleSelect, //Entiteter
    "34": input_function, //Funksjonstekst
    "35": input_object, //Objekt
    "36": input_boolean, //Bool
    "38": input_datomConstructor, //valueTypeView_newDatoms,
    "39": input_eventConstructor, //valueTypeView_newDatoms,
    "40": input_staticDropdown, //valueTypeView_staticDropdown,
    "41": input_singleCompanyEntity, //valueTypeView_companyEntityDropdown,    
    "5721": input_date,
    "5824": input_file,
    "5849": input_eventConstructorsInProcessStep
  } 

  let valueType = Database.get(attribute, "attribute/valueType")
  

  try {

    return isUndefined(Database.get( entity, attribute, version ))
    ? d([
      entityLabel( attribute ),
      input_undefined( entity, attribute )
    ], {class: "columns_1_1"})
    : [37, 38, 39, 5849].includes( valueType )
      ? genericValueTypeViews[ valueType  ]( entity, attribute, version )
      : d([
        entityLabel( attribute ),
        genericValueTypeViews[ valueType ]( entity, attribute, version )
      ], {class: "columns_1_1"})
    
  } catch (error) {return d(error) }
}

let input_undefined = (entity, attribute) => input(
  {value: "", style: `background-color: #de171761;`},
  "change", 
  async e => await Database.updateEntity(entity, attribute, Number.isNaN( Number(submitInputValue(e)) ) ? submitInputValue(e) : Number(submitInputValue(e))  )
)

let input_text = (entity, attribute, version) => input(
  {value: Database.get( entity, attribute, version ), style: ``},
  "change", 
  async e => await Database.updateEntity(entity, attribute,  submitInputValue(e) )
)

let input_number = (entity, attribute, version) => input(
    {value: String(Database.get( entity, attribute, version )), style: `text-align: right;`}, 
    "change", 
    async e => await Database.updateEntity(entity, attribute,  Number(submitInputValue(e)) )
)

let input_date = (entity, attribute, version) => input(
  {value: moment(Database.get( entity, attribute, version )).format("DD/MM/YYYY"), style: `text-align: right;`}, 
  "change", 
  async e => await Database.updateEntity(entity, attribute, Number( moment(submitInputValue(e), "DD/MM/YYYY").format("x") )   )
)

let input_staticDropdown = (entity, attribute, version) => dropdown(
  Database.get( entity, attribute, version ),
  Database.getOptions( entity, attribute, version ),
  async e => await Database.updateEntity(entity, attribute,  submitInputValue(e) )
)

let input_file = (entity, attribute, version) => isArray(Database.get(entity, attribute))
  ? d( Database.get(entity, attribute).map( row => d(JSON.stringify(row)) ) )
  : input(
  {type: "file", style: `text-align: right;`}, 
  "change", 
  e => {

    let file = e.srcElement.files[0]

    Papa.parse(file, {
      header: true,
      complete: results => Database.updateEntity(entity, attribute, results.data )
    })

    

  } 
)

let input_function = (entity, attribute, version) => textArea(
  Database.get( entity, attribute, version ), 
  {class:"textArea_code"}, 
  async e => await Database.updateEntity(entity, attribute,  submitInputValue(e).replaceAll(`"`, `'`) )
)

let input_object = (entity, attribute, version) => textArea(
  JSON.stringify(Database.get( entity, attribute, version )),
  {class:"textArea_code"}, 
  async e => await Database.updateEntity(entity, attribute,  JSON.parse( submitInputValue(e) ) )
)

let input_boolean = (entity, attribute, version) => input(
  {value: Database.get( entity, attribute, version ) ? "1" : "0", style: `text-align: right;`}, 
  "change", 
  async e => await Database.updateEntity(entity, attribute,  submitInputValue(e) === "1" ? true : false )
)

let input_Entity = (entity, attribute, version) => {

  let currentSelection = Database.get(entity, attribute, version)
  return d([
    d([
      entityLabel(currentSelection),
      input(
        {
          id: `searchBox/${entity}/${attribute}`, 
          value: Database.getLocalState(entity)[`searchstring/${attribute}`] ? Database.getLocalState(entity)[`searchstring/${attribute}`] : ""
        }, 
        "input", 
        e => {
  
        Database.setLocalState(entity, {[`searchstring/${attribute}`]: e.srcElement.value  })

        let searchBoxElement = document.getElementById(`searchBox/${entity}/${attribute}`)
        searchBoxElement.focus()
        let val = searchBoxElement.value
        searchBoxElement.value = ""
        searchBoxElement.value = val

  
      })
    ]),
    isDefined( Database.getLocalState(entity)[`searchstring/${attribute}`] )
       ? d([
            d(Database.getLocalState(entity)[`searchstring/${attribute}`] ),
            d(
                new Function( ["Database"] , Database.get(attribute, "attribute/selectableEntitiesFilterFunction") )( Database )
                .map( optionObject => optionObject.value )
                .filter( e => {
                  let searchString = Database.getLocalState(entity)[`searchstring/${attribute}`]
                  let label = Database.get(e, "entity/label")
                  let isMatch = label.toUpperCase().includes(searchString.toUpperCase())
                  return isMatch

                }  )
                .map( ent => d([entityLabel(ent, async e => await Database.updateEntity(entity, attribute,  ent ) )] )  )
                
              , {class: "searchResults"})
          ], {class: "searchResultsContainer"})
      : d("")
  ]) 
} 

let input_datomConstructor = (entity, attribute, version) => {

  

  let datoms = Database.get( entity, attribute, version )

  return d([
    entityLabel(attribute),
    d([
      d("EntitetID"),
      d("Attributt"),
      d("Verdi")
    ], {class: "columns_2_2_2_1"}),
    d(datoms.map( (datom, index) => d([
      dropdown(
        datom.entity, 
        [{value: `return 1;`, label: `Selskapets entitet`}, {value: `return Q.latestEntityID() + 1;`, label: `Ny entitet nr. 1`}, {value: `return Q.latestEntityID() + 2;`, label: `Ny entitet nr. 2`}, {value: `return Q.latestEntityID() + 3;`, label: `Ny entitet nr. 3`}, , {value: `return Q.latestEntityID() + 4;`, label: `Ny entitet nr. 4`}, , {value: `return Q.latestEntityID() + 5;`, label: `Ny entitet nr. 5`}],
        async e => await Database.updateEntity(entity, attribute, mergerino(datoms, {[index]: {entity: submitInputValue(e)}})  )
        ),
      d([
        htmlElementObject("datalist", {id:`entity/${entity}/options`}, optionsElement( Database.getAll(42)
          .filter( attr => attr >= 1000 ).concat(19)
          .filter( attr => Database.get( attr, "entity/label") !== "Ubenyttet hendelsesattributt")
          .map( attr => returnObject({value: attr, label: Database.get( attr, "entity/label")})  )
        )),
        input(
          {value: Database.get(datom.attribute, "entity/label"), list:`entity/${entity}/options`, style: `text-align: right;`}, 
          "change", 
          async e => {
            if(!isUndefined(submitInputValue(e))){
            let updatedValue = mergerino(datoms, {[index]: {attribute: Number(submitInputValue(e)), value: `return Event.get(${Number(submitInputValue(e))})`}})
            await Database.updateEntity(entity, attribute, updatedValue  )
            await Database.updateEntity(entity, "eventType/eventAttributes", Database.get(entity, "eventType/eventAttributes").concat( Number(submitInputValue(e)) ).filter(filterUniqueValues)  )
            }

          } 
        )
      ]),
      textArea(datom.value, {class:"textArea_code"}, async e => await Database.updateEntity(entity, attribute, mergerino(datoms, {[index]: {value: submitInputValue(e)}})  )),
      submitButton("[Slett]", async e => await Database.updateEntity(entity, attribute, datoms.filter( (d, i) => i !== index  )  )),
    ], {class: "columns_2_2_2_1"}) )),
    submitButton("Legg til", async e => await Database.updateEntity(entity, attribute, datoms.concat({entity: `return Q.latestEntityID() + 1;`, attribute: 1001, value: `return ''` })  ))
  ])

}

let input_eventConstructor = (entity, attribute, version) => {

  let processSteps = Database.get( entity, attribute, version )

  return d([
    entityLabel(5690),
    d(processSteps.map( (processStep, index) => d([
      d([
        h3(`Steg ${index}`),
        dropdown(processStep.eventType,  Database.getAll(43).map( e => returnObject({value: e, label: Database.get(e, "entity/label") }) ), async e => {
          let eventType = Number(submitInputValue(e))
          let nextEventsFunction = `return [${eventType}];`
          let updatedEventConstructor = {eventType, nextEventsFunction}
          await Database.updateEntity(entity, attribute, mergerino(processSteps, {[index]:updatedEventConstructor}) )
        } ),
      ]),
      d([
        d("Gammel funksjon"),
        textArea(
          processStep.nextEventsFunction, 
          {class:"textArea_code"}, 
          async e => await Database.updateEntity(entity, attribute, mergerino(processSteps, {[index]: {nextEventsFunction: submitInputValue(e).replaceAll(`"`, `'`)} }) )
        ),
      ]),
      d([
        d("Tillatte neste handlinger:"),
        d([
          d("Kriterium"),
          d("Hendelsestype"),
          d("Funksjon for å opprette"),
        ], {class: "columns_2_2_2_1"}),
        d(processStep[1761].map( (action, actionIndex) => d([
          d([textArea(
            action[5848], 
            {class:"textArea_code"}, 
            //async e => await Database.updateEntity(entity, attribute, mergerino(processSteps, {[index]: {nextEventsFunction: submitInputValue(e).replaceAll(`"`, `'`)} }) )
          )]),
          dropdown(action[5705],  Database.getAll(43).map( e => returnObject({value: e, label: Database.get(e, "entity/label") }) ), async e => {
            let eventType = Number(submitInputValue(e))
            let updatedAction = mergerino(action, {5705: eventType})
            let updatedStepActions = processStep[1761].filter( (step, index) => index !== actionIndex ).concat(updatedAction)
            let updatedStep = mergerino(processStep, {1761: updatedStepActions} )
            let updatedProcessSteps = processSteps.filter( (step, i) => i !== index ).concat(updatedStep)
            await Database.updateEntity(entity, attribute, updatedProcessSteps )
          } ),
          d([textArea(
            action[5850], 
            {class:"textArea_code"}, 
            //async e => await Database.updateEntity(entity, attribute, mergerino(processSteps, {[index]: {nextEventsFunction: submitInputValue(e).replaceAll(`"`, `'`)} }) )
          )]),
        ], {class: "columns_2_2_2_1"}) ))
      ]),
      submitButton("[Slett]", async e => await Database.updateEntity(entity, attribute, processSteps.filter( (d, i) => i !== index  )  )),
      br(),
      br(),
    ]) )),
    submitButton("Legg til steg", async e => await Database.updateEntity(entity, attribute, processSteps.concat({eventType: 5000, nextEventsFunction: "return [5000];" })  ))
  ])
}




let input_eventConstructorsInProcessStep = (entity, attribute, version) => {

  let eventConstructors = Database.get( entity, attribute, version )

  return d([
    entityLabel(attribute),
    d([
      d([
        d("Navn på handling"),
        d("Kriterium"),
        d("Funksjon for å opprette"),
        d("")
      ], {class: "columns_1_3_3_1"}),
      d(eventConstructors.map( (eventConstructor, eventConstructorIndex) => d([
        input(
          {value: eventConstructor[6], style: ``},
          "change", 
          async e => await Database.updateEntity(entity, attribute, eventConstructors.filter( (eventConstructor, i) => i !== eventConstructorIndex ).concat( mergerino(eventConstructor, {6: submitInputValue(e) }) ) )
        ),
        textArea(
          eventConstructor[5848], 
          {class:"textArea_code"}, 
          async e => await Database.updateEntity(entity, attribute, eventConstructors.filter( (eventConstructor, i) => i !== eventConstructorIndex ).concat( mergerino(eventConstructor, {5848: submitInputValue(e).replaceAll(`"`, `'`)}) ) )
        ),
        textArea(
          eventConstructor[5850], 
          {class:"textArea_code"}, 
          async e => await Database.updateEntity(entity, attribute, eventConstructors.filter( (eventConstructor, i) => i !== eventConstructorIndex ).concat( mergerino(eventConstructor, {5850: submitInputValue(e).replaceAll(`"`, `'`)}) ) )
        ),
        submitButton("[Slett]", async e => await Database.updateEntity(entity, attribute, eventConstructors.filter( (d, i) => i !== eventConstructorIndex  )  )),
      ], {class: "columns_1_3_3_1"}) )),
      submitButton("Legg til rad", async e => await Database.updateEntity(entity, attribute, eventConstructors.concat( {5848: "return true;", 5705: 5000, 5850: "Database.createEvent(5000, Process.entity);"} )  )),
    ])
  ])
}


let input_multipleSelect = (entity, attribute, version) => d([
  entityLabel(attribute),
  d([
    d( Database.get( entity, attribute, version ).map( attr => d([
      entityLabel(attr), 
      submitButton("[X]", async e => await Database.updateEntity(entity, attribute, Database.get( entity, attribute, version ).filter( e => e !== attr )  ) )
      ], {class: "columns_3_1"} ) 
    )),


    input(
      {
        id: `searchBox/${entity}/${attribute}`, 
        value: Database.getLocalState(entity)[`searchstring/${attribute}`] ? Database.getLocalState(entity)[`searchstring/${attribute}`] : ""
      }, 
      "input", 
      e => {

      Database.setLocalState(entity, {[`searchstring/${attribute}`]: e.srcElement.value  })

      let searchBoxElement = document.getElementById(`searchBox/${entity}/${attribute}`)
      searchBoxElement.focus()
      let val = searchBoxElement.value
      searchBoxElement.value = ""
      searchBoxElement.value = val


    }),
    isDefined( Database.getLocalState(entity)[`searchstring/${attribute}`] )
        ? d([
            d(Database.getLocalState(entity)[`searchstring/${attribute}`] ),
            d(
                new Function( ["Database"] , Database.get(attribute, "attribute/selectableEntitiesFilterFunction") )( Database )
                .map( optionObject => optionObject.value )
                .filter( e => {
                  let searchString = Database.getLocalState(entity)[`searchstring/${attribute}`]
                  let label = Database.get(e, "entity/label")
                  let isMatch = label.toUpperCase().includes(searchString.toUpperCase())
                  return isMatch

                }  )
                .map( ent => d([entityLabel(ent, async e => await Database.updateEntity(entity, attribute,  Database.get( entity, attribute, version ).concat( ent ) ) )] )  )
                
              , {class: "searchResults"})
          ], {class: "searchResultsContainer"})
      : d(""),
  ])
], {class: "columns_1_1"})

let input_singleCompanyEntity = (entity, attribute, version) => {
  let Company = Database.getCompany(Number(Database.S["UIstate"].selectedCompany))

  let t =  Company.events.findIndex( e => e === entity ) // 5 // Database.get(entity, 1000)

  let optionObjects = Company.getOptions( attribute, t )
  let selectedOption = optionObjects.find( Option => Option.value === Database.get( entity, attribute, version ))
  let value = isDefined(selectedOption)
  ? selectedOption.value
  : "Ingen entitet valgt"

  return d([
    
    dropdown( Number(value), optionObjects, async e => optionObjects.map( Option => Number(Option.value) ).includes( Number(e.srcElement.value) ) 
    ? await Database.updateEntity(entity, attribute,  Number(submitInputValue(e)))
    : log("Selected option not valid: ", {entity, attribute, version}, Number(e.srcElement.value))  )
    /* 
    htmlElementObject("datalist", {id:`entity/${entity}/options`}, optionsElement( optionObjects ) ),
    input(
      {value: value, list:`entity/${entity}/options`, style: `text-align: right;`}, 
      "change", 
      async e => optionObjects.map( Option => Number(Option.value) ).includes( Number(e.srcElement.value) ) 
        ? await Database.updateEntity(entity, attribute,  Number(submitInputValue(e)))
        : log("Selected option not valid: ", Datom, Number(e.srcElement.value))
    ) */
  ])
} 
