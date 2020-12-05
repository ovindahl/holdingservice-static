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

let actionButton = Action => d(
  Action.label, 
  {class: "actionButton", style: Action.isActionable ? "" : "background-color: darkgray;"}, 
  Action.isActionable ? "click" : undefined,
  e => {
    if(Action.isActionable){Action.actionFunction()}
    update()
  }
  
  )

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
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

let entityRedlinedValue = (value, prevValue) => d( [
  span( `${JSON.stringify(prevValue)}`, "", {class: "redlineText"}),
  span( `${JSON.stringify(value)}`),
], {style:"display: inline-flex;justify-content: flex-end;"} ) 

//Page frame

let adminPanelView = Company => d([
  d([
    d([
      d("Status Database"),
      d("Ledig", {id: "APISYNCSTATUS"}),
    ], {class: "columns_1_1"}),
    d([
      d("Versjon Database"),
      input({value: Database.tx, disabled: "disabled"})
    ], {class: "columns_1_1"}),
  ]),
], {class: "columns_1_1", style: "background-color:gray;"}) 

let headerBarView = Company => d([
  d('<header><h1>Holdingservice Beta</h1></header>'),
  d([
    d("Logg ut", {class: "textButton"}, "click", ),
    d("Innstillinger", {class: "textButton"}, "click", e => console.log("Innstillinger!"))
  ], {style: "display:flex;"} )
], {style: "padding-left:3em; display:flex; justify-content: space-between;"})

let companySelectionMenuRow = Company => d([
  d( Database.getAll( 5722 ).map( company => d([entityLabel(company, e => Database.selectCompany(company))], {style: company === Company.entity ? "background-color: #bfbfbf;" : ""})), {style: "display:flex;"}),
  submitButton( "+", e => console.log("NEW COMPANY") )
], {style: "display:flex;"}) 

let pageSelectionMenuRow = Company => d( ["Prosesser", "Tidslinje", "Selskapets entiteter", "Admin/DB"].map( pageName => d( pageName, {class: pageName === Database.selectedPage ? "textButton textButton_selected" : "textButton"}, "click", e => Database.selectPage(pageName) ) ), {style: "display:flex;"})

let generateHTMLBody = Company => [
  adminPanelView( Company ),
  headerBarView( Company ),
  companySelectionMenuRow( Company ),
  pageSelectionMenuRow( Company ),
  pageRouter[ Database.selectedPage ]( Company ),
]

let pageRouter = {
  "Prosesser": Company => processesView( Company ),
  "Tidslinje": Company => timelineView( Company ),
  "Selskapets entiteter": Company => companyDocPage( Company ),
  "Admin/DB": Company => adminPage( Company ),
}

let sortEntitiesAlphabeticallyByLabel = ( a , b ) => ('' + a.label).localeCompare(b.label)

let sidebar_left = Company => {
  let selectedEntityType = Database.get(Database.selectedEntity, "entity/entityType")
  let selectedCategory = Database.get(Database.selectedEntity, "entity/category")
  return d([
    d( [42, 43, 44, 45, 47, 5030, 5590, 5612, 5687, 5817, 5722].map( entityType => entityLabel(entityType, e => Database.selectEntity(  Database.getAll(entityType)[0]) )) ),
    d( Database.getAll( selectedEntityType   ).map( entity => Database.get(entity, "entity/category" ) ).filter(filterUniqueValues)
      .sort( ( a , b ) => ('' + a).localeCompare(b) )
      .map( category => d( category, {class: category === selectedCategory ? "textButton textButton_selected" : "textButton", style: "background-color: #c9c9c9;" }, "click", 
        e => Database.selectEntity(  Database.getAll( selectedEntityType  ).find( e => Database.get(e, "entity/category") === category  )   )
        ))
    ),
    d( Database.getAll( selectedEntityType ).filter( entity => Database.get(entity, "entity/category" ) === selectedCategory ).sort( sortEntitiesAlphabeticallyByLabel ).map( entity => entityLabel( entity, e => Database.selectEntity(entity) )))
], {style: "display:flex;"})
} 

let timelineView = Company => d([
  d([
    entityLabel(Company.entity),
    d( Company.events.map( (event, i) =>  d([d([span( `${i+1 }`, {class: "entityLabel", style: `background-color: #9ad2ff;`})], {class: "popupContainer", style:"display: inline-flex;"})], {style:"display: inline-flex;"} )
      ), {style: `display:grid;grid-template-columns: repeat(${Company.events.length}, 1fr);background-color: #8080802b;margin: 5px;`} ),
  ], {style: `display:grid;grid-template-columns: 1fr 9fr;`}),
  d( Company.processes.map( process => processTimelineView(Company, process) ))

])

let processTimelineView = (Company, process) => {

  let processEventsTimes = Company.getProcess(process).events.map( event => Company.getEvent(event).t )

  return d([
    entityLabel(process),
    d( Company.events.map( (event, i) => ((i+1) < processEventsTimes[0] || (i+1) > processEventsTimes.slice( -1 )[0])
    ? d(" ")
    : Company.getProcess(process).events.includes(event)
      ? d([
          d([
              span( `${i+1}`, ``, {class: "entityLabel", style: `background-color:${"pink"};`}, "click", e => Company.selectEvent(event)),
              entityInspectorEventTimeline(Company, event)
            ], {class: "popupContainer", style:"display: inline-flex;"})
        ], {style:"display: inline-flex;"} )
      : d("-" ) ), {style: `display:grid;grid-template-columns: repeat(${Company.events.length}, 1fr);background-color: #8080802b;margin: 5px;`} ),
  ], {style: `display:grid;grid-template-columns: 1fr 9fr;`})
}

let entityInspectorEventTimeline = (Company, event) => d([
  d( Company.getEvent(event).entities.map( companyEntity => d([companyEntityView(Company, companyEntity, Company.getEvent(event).t )], {style: "padding:5px; border: solid 1px lightgray;"})  ) )
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

let fullCompanyDatomView = (Company, companyDatom) => {

  let valueType = Database.get(companyDatom.attribute, "attribute/valueType")
  let valueView = (valueType === 32 && !isUndefined(companyDatom.value)) 
    ? entityLabel(Number(companyDatom.value)) 
    : (valueType === 31) 
      ? d( String(companyDatom.value), {style: `text-align: right;`} )
      : d( JSON.stringify(companyDatom.value) )


  return d([
    d( String(companyDatom.t), {style: `text-align: right;`} ),
    entityLabel(companyDatom.event),
    companyEntityLabel(Company, companyDatom.entity, Company.t),
    //d( String(companyDatom.entity), {style: `text-align: right;`} ),
    entityLabel( companyDatom.attribute ),
    valueView,
  ], {class: "columns_1_3_1_3_2"})
}

let companyEntityLabel = (Company, companyEntity, t) => d( [
  d([
    span( `[${companyEntity}] ${Database.get( Company.get(companyEntity, 19 ), "entity/label" )}`, ``, {class: "entityLabel", style: `background-color:${Database.get( Company.get(companyEntity, 19 ), Database.attrName(20) )};`}),
    companyEntityInspectorPopup(Company, companyEntity, t)
  ], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"} )

let companyEntityInspectorPopup = (Company, companyEntity, t) => d([ companyEntityView(Company, companyEntity, t) ], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})


let companyDocPage = Company => {

  return d([
    d([
      d( Company.entityTypes.map( entityType => entityLabel(entityType, e => Company.selectEntity( Company.getAll(entityType)[0] ) ) ) ),
      d( Company.entities
          .filter( entity => Company.get(entity, 19) === Company.get(Company.selectedEntity, 19)  )
          .map( entity => d( 
              `Entitet # ${entity}`, 
              {class: entity === Company.selectedEntity ? "textButton textButton_selected" : "textButton", style: "background-color: #c9c9c9;" }, 
              "click", 
              e => Company.selectEntity(entity)
            )))
    ], {class: "columns_1_1"}),
    d([
      isDefined( Company.get(Company.selectedEntity) )
        ? companyEntityView(Company, Company.selectedEntity, Company.t)
        : d("Ingen entitet valgt.")

    ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
    d("")
  ], {class: "pageContainer"})

}

let companyEntityView = (Company, companyEntity, t) => d([
  d("<br>"),
  span( `[${companyEntity}] ${Database.get( Company.get(companyEntity, 19 ) , "entity/label" )}`, ``, {class: "entityLabel", style: `background-color:${Database.get( Company.get(companyEntity, 19 ) , Database.attrName(20) )};`}),
  d("<br>"),
  d(`Etter hendelse ${t} (${moment( Company.getEvent( Company.events[ t - 1 ] ).get( "event/date" )).format("DD/MM/YYYY")})`),
  d("<br>"),
  d(Company.get(companyEntity, undefined, t).companyDatoms.map( companyDatom => companyDatomView(companyDatom) )),
  d( 
    Database.get( Company.get(companyEntity, 19 ), "entityType/calculatedFields" ).map( calculatedField => d([
      entityLabel(calculatedField),
      d(JSON.stringify( Company.get(companyEntity, calculatedField, t) ))
    ], {class: "columns_1_1"})    )
    )
])

let companyDatomView = (companyDatom) => {
  let valueType = Database.get(companyDatom.attribute, "attribute/valueType")
  let valueView = (valueType === 32 && !isUndefined(companyDatom.value)) 
    ? entityLabel(Number(companyDatom.value)) 
    : (valueType === 31) 
      ? d( String(companyDatom.value), {style: `text-align: right;`} )
      : d( JSON.stringify(companyDatom.value) )

  return d([
    entityLabel(companyDatom.attribute),
    valueView
  ], {class: "columns_1_1"})



}

let adminPage = Company => d([
  sidebar_left( Company ),
  adminEntityView( Database.selectedEntity ),
  d("")
], {class: "pageContainer"})

let versionView = entity => {

  let versions = Database.get(entity).Datoms.map( Datom => Datom.tx ).filter( filterUniqueValues ).filter( tx => isNumber(tx) )
  let selectedVersion = Database.getLocalState(entity).tx
  let firstVersion = versions[0]
  let lastVersion = versions[versions.length - 1]
  let prevVersion = versions.filter( tx => tx < selectedVersion ).length > 0 ? versions.filter( tx => tx < selectedVersion ).reverse()[0] : selectedVersion
  let nextVersion = versions.filter( tx => tx > selectedVersion ).length > 0 ? versions.filter( tx => tx > selectedVersion )[0] : selectedVersion

  
  return d([
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

let processesView = Company => d([
  d([
    d(Company.processes.map( process => entityLabel(process, e => Company.selectProcess(process) ) )),
      br(),
      h3("Tillatte handlinger på selskapsnivå"),
      d(Company.Actions.map( Action => actionButton( Action ) ) ),
  ]),
  processView( Company )
], {class: "pageContainer"})

let processView =  Company => isNumber( Company.selectedProcess)
? d([
    d([
      entityLabel(5692),
      entityLabel(Company.selectedProcess),
    ], {class: "columns_1_1"}),
    d([
      entityLabel(5687),
      entityLabel(Database.get(Company.selectedProcess, "process/processType")),
    ], {class: "columns_1_1"}),
    processProgressView(Company),
    br(),
    isDefined( Company.selectedEvent ) ? singleEventView( Company, Company.getEvent(Company.selectedEvent) ) : d("Ingen hendelse valgt.", {class: "feedContainer"}),
    br(),
    d([
      entityLabel(5922),
      d(Company.getProcess( Company.selectedProcess ).Actions.map( Action => actionButton( Action) 
      ))
    ], {class: "columns_1_1"}),
], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"} )
: d("Ingen prosess valgt.", {class: "feedContainer"})


let processProgressView = Company => d([
  d( Database.get(Database.get(Company.selectedProcess, "process/processType"), 5926).map( (eventType, index) => d([
        entityLabel( eventType ),
        d( Database.getAll(46)
        .filter( event => Database.get(event, "event/process") === Company.selectedProcess )
        .filter( event => Database.get(event, "event/eventTypeEntity") === eventType  )
        .map( event => d(String(event), {style: event === Company.selectedEvent ? "color: blue;" : ""}, "click", 
        e => Company.selectEvent(event)
          ) ) )
      ], {style: eventType === Database.get(Company.selectedEvent, "event/eventTypeEntity") ? "background-color: #bfbfbf;" : ""})
  ), {style: "display: flex;"} ),
])

let singleEventView =  (Company, Event) => d([
  h3( Database.get(Event.eventType, "entity/label") ),
  d( Database.get(Event.eventType, "eventType/eventAttributes").map( attribute =>  Event.get( 6161 ) ? lockedDatomView( Event.entity, attribute ) : fullDatomView( Event , attribute )  )),
  br(),
  d([
    d( "Posisjon i tidslinjen er: " + Event.t  ),
    br(),
    h3("Selskapsentiteter som opprettes eller endres:"),
    d(Event.entities.map( companyEntity => companyEntityLabel(Company, companyEntity, Event.t) )),
  ], {style: "background-color: #f1ecec;padding: 1em;border: 1px solid black;"} ),
], {class: "feedContainer"} )
// End ----

//Entity view

let attributeLabel = attribute => Database.get(attribute) 
? d( [
    d([
      d([
        span( Database.get(attribute, "entity/label"), "", {}, "click", e => Database.selectEntity(attribute) ),
        entityLabel( Database.get(attribute, "attribute/valueType") ),
        span(`${Database.get(attribute, "attribute/isArray") ? "Flertall" : "Entall"}`, "", {style: "background-color:#7676f385;padding: 5px;"}),
        span("[t TBD]")
      ],{class: "entityLabel", style: `background-color:${Database.get( 42, "entityType/color" )};`}),
    ], {class: "popupContainer", style:"display: inline-flex;"})
  ], {style:"display: inline-flex;"} )
: d(`[${attribute}] Entiteten finnes ikke`)



let adminEntityView = entity => {

  let Entity = Database.getEntity(entity)
  let attributes = Database.get(Entity.entityType, "entityType/attributes", Entity.tx)
  let calculatedFields = Database.get(Entity.entityType, "entityType/calculatedFields", Entity.tx)

  return Database.isEntity(entity)
  ? Entity.isLocked
    ? d("Entity is locked")
    : d([
        d([
          d([span( `Entitet`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`})], {style:"display: inline-flex;"}),
          entityLabel(entity),
        ], {class: "columns_1_1"}),
        versionView(entity),
        d( attributes.map( attribute => fullDatomView( Entity, attribute ) )),
        br(),
        isDefined(calculatedFields)
          ? d( calculatedFields.map( calculatedField => calculatedFieldView( entity, calculatedField, Database.getLocalState(entity).tx ) ))
          : d("Ingen kalkulerte felter"),
        h3("Tillatte handlinger på entitetsnivå"),
        d( Entity.Actions.map( Action => actionButton(Action) ) ),
      ], {class: "feedContainer"} )
  : d("Ingen entitet valgt.", {class: "feedContainer"})
    
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



let OLDvalueView = (Entity, attribute) => {

  let genericValueTypeViews = {
    "32": input_Entity, //Entitet
    "37": input_multipleSelect, //Entiteter
    "34": input_function, //Funksjonstekst
    "36": input_boolean, //Bool
    "39": input_eventConstructor, //valueTypeView_newDatoms,
    "40": input_staticDropdown, //valueTypeView_staticDropdown,
    "41": input_singleCompanyEntity, //valueTypeView_companyEntityDropdown,    
    "5824": input_file,
    "5849": input_eventConstructorsInProcessStep
  }

  let valueType = Database.get(attribute, "attribute/valueType")
  let isArray = Database.get(attribute, "attribute/isArray")

  if(isArray){

    let values = Entity.get( attribute )

    return d([
      attributeLabel(attribute),
      d( values.map( (singleValue, index) => {
        let earlierValues = values.slice(0, index )
        let laterValues = values.slice( index + 1, values.length  )
        return d([
          d(String(index+1)),
          input( {value: singleValue}, "change",async e => await Database.updateEntityAndRefreshUI(Entity.entity, attribute, earlierValues.concat( submitInputValue(e) ).concat( laterValues ) )  ),
          d("X")
        ], {class: "columns_1_1_1"}) 
        })
      )
    ], {style: "margin: 1em; padding: 1em; background-color: #8080802e;"})

  }else{


    return d([
      attributeLabel(attribute),
      genericValueTypeViews[ valueType ]( Entity.entity, attribute, Entity.tx )
    ], {class: "columns_1_1"}) 

  }

  

}

let fullDatomView = (Entity, attribute) => {

  let valueTypeController = {
    "30": basicInputView, //Tekst
    "31": basicInputView, //Tall
    "34": functionTextView, //Funksjonstekst
    "36": booleanView, //Boolean
    "40": basicInputView, //Velg alternativ [TBD]
    "32": entityReferenceView,
    "5721": basicInputView, //Dato
    "38": datomConstructorView,
    "41": basicInputView, //Company entity [TBD]
    "5824": basicInputView, //File [TBD]
    "5849": basicInputView, //Konstruksjon av ny hendelse [TBD]
    "fallback": basicInputView
  }

  let valueType = Database.get(attribute, "attribute/valueType")
  let viewFunction = valueTypeController[valueType] ? valueTypeController[valueType] : valueTypeController[ "fallback" ]  
  return viewFunction(Entity, attribute)

}







let basicInputView = (Entity, attribute) => {

  let tempStyle = {style: "border: 1px solid #80808052;padding: 1em;margin: 5px;"}

  let valueType = Database.get(attribute, "attribute/valueType")
  let isArray = Database.get(attribute, "attribute/isArray")
  let isLocked = Entity.isLocked

  let storedValue = Entity.get(attribute)

  let Value = isArray ? undefined : storedValue
  let Values = isArray 
    ? Array.isArray( storedValue )
      ? storedValue
      : []
    : undefined

  let formatting = {
    "30": storedValue => storedValue, //Tekst
    "31": storedValue => String(storedValue), //Tall
    "5721": storedValue => moment(storedValue).format("DD/MM/YYYY"), //Dato
  }

  let unFormatting = {
    "30": storedValue => storedValue, //Tekst
    "31": storedValue => Number( storedValue ), //Tall
    "5721": storedValue => Number( moment(storedValue, "DD/MM/YYYY").format("x") ) , //Dato
  }

  

  let formatFunction = formatting[valueType] ? formatting[valueType] : formatting[ "30" ]
  let unFormatFunction = unFormatting[valueType] ? unFormatting[valueType] : unFormatting[ "30" ]

  

  let inputElementStyle = {
    "30": ``, //Tekst
    "31": `text-align: right;`, //Tall
    "5721": `text-align: right;`, //Dato
  }

  let style = inputElementStyle[ valueType ] ? inputElementStyle[ valueType ] : inputElementStyle[ "30" ]

  let startValuesByType = {
    "30": ``, //Tekst
    "31": 0, //Tall
    "5721": Date.now(), //Dato
  }

  let startValue = Object.keys(startValuesByType).includes( String(valueType) ) ? startValuesByType[valueType] : startValuesByType[ "30" ]


  return isArray
    ? d([
        attributeLabel( attribute ),
        br(),
        d([

          d([
            d( "#" ),
            d( "Verdi" )
          ], {class: "columns_1_1_1"}),

          d( Values.map( (Value, index) => d([
              d( String(index) ),
              input( {value: formatFunction(Value), style}, "change", async e => await Database.updateEntityAndRefreshUI(Entity.entity, attribute,  Values.slice(0, index ).concat( unFormatFunction( submitInputValue(e) ) ).concat( Values.slice( index + 1, Values.length  ) ) ) ),
              submitButton( "[ X ]", async e => await Database.updateEntityAndRefreshUI(Entity.entity, attribute,  Values.filter( (Value, i) => i !== index  ) )  )
            ], mergerino(  {class: "columns_1_1_1"}, tempStyle )) )),


            submitButton( "[ + ]", async e => await Database.updateEntityAndRefreshUI(Entity.entity, attribute,  Values.concat( startValue ) )  )

        ])
      
    ], tempStyle)
    : d([
      attributeLabel( attribute ),
      input( {value: formatFunction(Value), style}, "change", async e => await Database.updateEntityAndRefreshUI(Entity.entity, attribute,  unFormatFunction( submitInputValue(e) ) ) )
    ], mergerino( {class: "columns_1_1"}, tempStyle ) ) 




}

let datomConstructorView = (Entity, attribute) => {

  let isArray = Database.get(attribute, "attribute/isArray")



  let entity = Entity.entity

  let Values = Database.get( entity, attribute )

  return isArray
  ? d([
      attributeLabel( attribute ),
      br(),
        d([
          d("#"),
          d("EntitetID"),
          d("Attributt"),
          d("Verdi")
        ], {class: "columns_1_2_2_2_1"}),
        d(Values.map( (datom, index) => d([
          d( String(index) ),
          dropdown(
            datom.entity, 
            [{value: `return 1;`, label: `Selskapets entitet`}, {value: `return Q.latestEntityID() + 1;`, label: `Ny entitet nr. 1`}, {value: `return Q.latestEntityID() + 2;`, label: `Ny entitet nr. 2`}, {value: `return Q.latestEntityID() + 3;`, label: `Ny entitet nr. 3`}, , {value: `return Q.latestEntityID() + 4;`, label: `Ny entitet nr. 4`}, , {value: `return Q.latestEntityID() + 5;`, label: `Ny entitet nr. 5`}],
            async e => await Database.updateEntityAndRefreshUI(entity, attribute, mergerino(Values, {[index]: {entity: submitInputValue(e)}})  )
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
                let updatedValue = mergerino(Values, {[index]: {attribute: Number(submitInputValue(e)), value: `return Event.get(${Number(submitInputValue(e))})`}})
                await Database.updateEntityAndRefreshUI(entity, attribute, updatedValue  )
                await Database.updateEntityAndRefreshUI(entity, "eventType/eventAttributes", Database.get(entity, "eventType/eventAttributes").concat( Number(submitInputValue(e)) ).filter(filterUniqueValues)  )
                }

              } 
            )
          ]),
          textArea(datom.value, {class:"textArea_code"}, async e => await Database.updateEntityAndRefreshUI(entity, attribute, mergerino(Values, {[index]: {value: submitInputValue(e)}})  )),
          submitButton("[Slett]", async e => await Database.updateEntityAndRefreshUI(entity, attribute, Values.filter( (d, i) => i !== index  )  )),
        ], {class: "columns_1_2_2_2_1"}) )),
        submitButton("Legg til", async e => await Database.updateEntityAndRefreshUI(entity, attribute, Values.concat({entity: `return Q.latestEntityID() + 1;`, attribute: 1001, value: `return ''` })  ))
    ], {style: "border: 1px solid #80808052;padding: 1em;margin: 5px;"})
  : d("ERROR: Not array") 




}

let entityReferenceView = (Entity, attribute) => {

  let valueType = Database.get(attribute, "attribute/valueType")
  let isArray = Database.get(attribute, "attribute/isArray")
  let isLocked = Entity.isLocked

  let storedValue = Entity.get(attribute)

  let Value = isArray ? undefined : storedValue
  let Values = isArray 
    ? Array.isArray( storedValue )
      ? storedValue
      : []
    : undefined


  let entity = Entity.entity

  return isArray
  ? d([
      attributeLabel( attribute ),
      br(),
      d([
        d("#"),
        d("Entitet"),
        d("")
      ], {class: "columns_1_1_1"}),
      d(Values.map( (Value, index) => d([
        d( String(index) ),

        d([
          entityLabel(Value),
          input(
            {
              id: `searchBox/${attribute}/${index}`, 
              value: Database.getLocalState(entity)[`searchstring/${attribute}/${index}`] ? Database.getLocalState(entity)[`searchstring/${attribute}/${index}`] : ""
            }, 
            "input", 
            e => {
      
            Database.setLocalState(entity, {[`searchstring/${attribute}/${index}`]: e.srcElement.value  })
    
            let searchBoxElement = document.getElementById(`searchBox/${attribute}/${index}`)
            searchBoxElement.focus()
            let val = searchBoxElement.value
            searchBoxElement.value = ""
            searchBoxElement.value = val
    
      
          }),
          isDefined( Database.getLocalState(entity)[`searchstring/${attribute}/${index}`] )
            ? d([
                  d(Database.getLocalState(entity)[`searchstring/${attribute}/${index}`] ),
                  d(
                      new Function( ["Database"] , Database.get(attribute, "attribute/selectableEntitiesFilterFunction") )( Database )
                      .map( optionObject => optionObject.value )
                      .filter( e => {
                        let searchString = Database.getLocalState(entity)[`searchstring/${attribute}/${index}`]
                        let label = Database.get(e, "entity/label")
                        let isMatch = label.toUpperCase().includes(searchString.toUpperCase())
                        return isMatch

                      }  )
                      .map( ent => d([entityLabel(ent, async e => await Database.updateEntityAndRefreshUI(Entity.entity, attribute,  Values.filter( (Value, i) => i !== index  ).concat(ent) ) )] )  )
                      
                    , {class: "searchResults"})
                ], {class: "searchResultsContainer"})
            : d("")
        ]),
        
        submitButton( "[ X ]", async e => await Database.updateEntityAndRefreshUI(Entity.entity, attribute,  Values.filter( (Value, i) => i !== index  ) )  )
      ], {class: "columns_1_1_1", style: "border: 1px solid #80808052;padding: 1em;margin: 5px;"}))),
      submitButton("[ + ]", async e => await Database.updateEntityAndRefreshUI(Entity.entity, attribute, Values.concat(42)  ))
    ], {style: "border: 1px solid #80808052;padding: 1em;margin: 5px;"})
  : d([
      attributeLabel( attribute ),
      entityLabel(Value),
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
                .map( ent => d([entityLabel(ent, async e => await Database.updateEntityAndRefreshUI(entity, attribute,  ent ) )] )  )
                
              , {class: "searchResults"})
          ], {class: "searchResultsContainer"})
      : d("")
    ], {style: "border: 1px solid #80808052;padding: 1em;margin: 5px;"}) 

}


let booleanView = (Entity, attribute) => Database.get(attribute, "attribute/isArray")
  ? d("[TBD]")
  : d([
      attributeLabel( attribute ),
      submitButton( Entity.get(attribute) ? "Sant" : "Usant", async e => await Database.updateEntityAndRefreshUI(Entity.entity, attribute, Entity.get(attribute) ? false : true ) ),
    ], {class: "columns_1_1", style: "border: 1px solid #80808052;padding: 1em;margin: 5px;"} )  


let functionTextView = (Entity, attribute) => d([
  attributeLabel( attribute ),
  textArea(
    Entity.get(attribute), 
    {class:"textArea_code"}, 
    async e => await Database.updateEntityAndRefreshUI(Entity.entity, attribute,  submitInputValue(e).replaceAll(`"`, `'`) )
  )
], {class: "columns_1_1", style: "border: 1px solid #80808052;padding: 1em;margin: 5px;"} )  







let input_staticDropdown = (entity, attribute, version) => dropdown(
  Database.get( entity, attribute, version ),
  Database.getOptions( attribute, version ),
  async e => await Database.updateEntityAndRefreshUI(entity, attribute,  submitInputValue(e) )
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
      complete: results => Database.updateEntityAndRefreshUI(entity, attribute, results.data )
    })

    

  } 
)

let input_eventConstructor = (entity, attribute, version) => {

  let processSteps = Database.get( entity, attribute, version )

  return d([
    d(processSteps.map( (processStep, index) => d([
      d([
        h3(`Steg ${index}`),
        dropdown(processStep.eventType,  Database.getAll(43).map( e => returnObject({value: e, label: Database.get(e, "entity/label") }) ), async e => {
          let eventType = Number(submitInputValue(e))
          let nextEventsFunction = `return [${eventType}];`
          let updatedEventConstructor = {eventType, nextEventsFunction}
          await Database.updateEntityAndRefreshUI(entity, attribute, mergerino(processSteps, {[index]:updatedEventConstructor}) )
        } ),
      ]),
      d([
        d("Gammel funksjon"),
        textArea(
          processStep.nextEventsFunction, 
          {class:"textArea_code"}, 
          async e => await Database.updateEntityAndRefreshUI(entity, attribute, mergerino(processSteps, {[index]: {nextEventsFunction: submitInputValue(e).replaceAll(`"`, `'`)} }) )
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
            //async e => await Database.updateEntityAndRefreshUI(entity, attribute, mergerino(processSteps, {[index]: {nextEventsFunction: submitInputValue(e).replaceAll(`"`, `'`)} }) )
          )]),
          dropdown(action[5705],  Database.getAll(43).map( e => returnObject({value: e, label: Database.get(e, "entity/label") }) ), async e => {
            let eventType = Number(submitInputValue(e))
            let updatedAction = mergerino(action, {5705: eventType})
            let updatedStepActions = processStep[1761].filter( (step, index) => index !== actionIndex ).concat(updatedAction)
            let updatedStep = mergerino(processStep, {1761: updatedStepActions} )
            let updatedProcessSteps = processSteps.filter( (step, i) => i !== index ).concat(updatedStep)
            await Database.updateEntityAndRefreshUI(entity, attribute, updatedProcessSteps )
          } ),
          d([textArea(
            action[5850], 
            {class:"textArea_code"}, 
            //async e => await Database.updateEntityAndRefreshUI(entity, attribute, mergerino(processSteps, {[index]: {nextEventsFunction: submitInputValue(e).replaceAll(`"`, `'`)} }) )
          )]),
        ], {class: "columns_2_2_2_1"}) ))
      ]),
      submitButton("[Slett]", async e => await Database.updateEntityAndRefreshUI(entity, attribute, processSteps.filter( (d, i) => i !== index  )  )),
      br(),
      br(),
    ]) )),
    submitButton("Legg til steg", async e => await Database.updateEntityAndRefreshUI(entity, attribute, processSteps.concat({eventType: 5000, nextEventsFunction: "return [5000];" })  ))
  ])
}

let input_eventConstructorsInProcessStep = (entity, attribute, version) => {

  let eventConstructors = Database.get( entity, attribute, version )

  return d([
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
          async e => await Database.updateEntityAndRefreshUI(entity, attribute, eventConstructors.filter( (eventConstructor, i) => i !== eventConstructorIndex ).concat( mergerino(eventConstructor, {6: submitInputValue(e) }) ) )
        ),
        textArea(
          eventConstructor[5848], 
          {class:"textArea_code"}, 
          async e => await Database.updateEntityAndRefreshUI(entity, attribute, eventConstructors.filter( (eventConstructor, i) => i !== eventConstructorIndex ).concat( mergerino(eventConstructor, {5848: submitInputValue(e).replaceAll(`"`, `'`)}) ) )
        ),
        textArea(
          eventConstructor[5850], 
          {class:"textArea_code"}, 
          async e => await Database.updateEntityAndRefreshUI(entity, attribute, eventConstructors.filter( (eventConstructor, i) => i !== eventConstructorIndex ).concat( mergerino(eventConstructor, {5850: submitInputValue(e).replaceAll(`"`, `'`)}) ) )
        ),
        submitButton("[Slett]", async e => await Database.updateEntityAndRefreshUI(entity, attribute, eventConstructors.filter( (d, i) => i !== eventConstructorIndex  )  )),
      ], {class: "columns_1_3_3_1"}) )),
      submitButton("Legg til rad", async e => await Database.updateEntityAndRefreshUI(entity, attribute, eventConstructors.concat( {6: "Ny handling", 5848: "return true;", 5850: "Company.createEvent(5000, Process.entity);"} )  )),
    ])
  ])
}

let input_multipleSelect = (entity, attribute, version) => d([
  d([
    d( Database.get( entity, attribute, version ).map( attr => d([
      entityLabel(attr), 
      submitButton("[X]", async e => await Database.updateEntityAndRefreshUI(entity, attribute, Database.get( entity, attribute, version ).filter( e => e !== attr )  ) )
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
                .map( ent => d([entityLabel(ent, async e => await Database.updateEntityAndRefreshUI(entity, attribute,  Database.get( entity, attribute, version ).concat( ent ) ) )] )  )
                
              , {class: "searchResults"})
          ], {class: "searchResultsContainer"})
      : d(""),
  ])
], {class: "columns_1_1"})

let input_singleCompanyEntity = (entity, attribute, version) => {
  let company = ActiveCompany.company
  let t = Database.get(entity, 6101)
  let Company = ActiveCompany.getCompanyObject(company, t)
  let optionObjects = Company.getOptions(attribute, t).concat({value: 0, label: "Ingen entitet valgt"})

  let selectedOption = optionObjects.find( Option => Option.value === Database.get( entity, attribute, version ))
  let value = isDefined(selectedOption)
  ? selectedOption.value
  : 0

  return d([
    dropdown( Number(value), optionObjects, async e => optionObjects.map( Option => Number(Option.value) ).includes( Number(e.srcElement.value) ) 
    ? await Database.updateEntityAndRefreshUI(entity, attribute,  Number(submitInputValue(e)))
    : log("Selected option not valid: ", {entity, attribute, version}, Number(e.srcElement.value))  )
  ])
} 
