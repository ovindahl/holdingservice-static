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
let dropdown = (value, optionObjects, updateFunction) => htmlElementObject("select", {id: getNewElementID(), style:"border: 1px solid lightgray; max-width: 300px;"}, optionObjects.map( o => `<option value="${o.value}" ${o.value === value ? `selected="selected"` : ""}>${o.label}</option>` ).join(''), "change", e => {
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
  })

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


let generateHTMLBody = Company => Database.selectedPage === "Admin/DB" ? [adminPage( Company )] : [clientPage(Company)]


let adminPage = Company => d([
    d([d('<header><h1>Holdingservice Admin</h1></header>'),d([submitButton("Bytt til klient", e => Database.selectPage("Prosesser") )], {style: "display:flex;"} )], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
    d([
      span( "Holdingservice sin database" ),
      span(" / "  ),
      isDefined(Database.selectedEntity)
        ? entityLabel( Database.get(Database.selectedEntity).entityType   )
        : span(" ... "),
      span(" / "  ),
      isDefined(Database.selectedEntity)
        ? entityLabel( Database.selectedEntity   )
        : span("Ingen entitet valgt.")
    ], {style: "padding: 1em;"}),
    d([
      sidebar_left( Company ),
      adminEntityView( Database.selectedEntity ),
    ], {class: "pageContainer"})
  ])

let clientPage = Company => d([
    d([d('<header><h1>Holdingservice Beta</h1></header>'),d([submitButton("Bytt til admin", e => Database.selectPage("Admin/DB") )], {style: "display:flex;"} ),], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
    navBar(Company),
    clientPageRouter[ Database.selectedPage ]( Company ),
  ])

let navBar = Company => d([
  d("Mine selskaper"),
  span("  /  "  ),
  dropdown(Company.entity, Database.getAll( 5722 ).map( company => returnObject({value: company, label: Database.get(company, "entity/label")} )), e =>  Database.selectCompany( Number( submitInputValue(e) ) )  ),
  span(" / "  ),
  dropdown( Database.selectedPage , ["Prosesser", "Tidslinje", "Selskapets entiteter"].map( pageName => returnObject({value: pageName, label: pageName} )  ), e => Database.selectPage(submitInputValue(e)) ),
  Database.selectedPage === "Prosesser"
    ? d([
      span(" / "  ),
      isDefined( Company.selectedProcess )
        ? entityLabel( Company.selectedProcess  )
        : span(" ... "),
      span(" / "  ),
      isDefined(Company.selectedEvent)
        ? entityLabel( Company.selectedEvent  )
        : span("Ingen hendelse valgt.")
    ])
    : Database.selectedPage === "Selskapets entiteter"
      ? d([
        span(" / "  ),
        isDefined(Company.selectedEntity)
          ? entityLabel( Company.get(Company.selectedEntity, 19)  )
          : span(" ... "),
        span(" / "  ),
        isDefined(Company.selectedEntity)
          ? companyEntityLabelWithoutPopup( Company, Company.selectedEntity )
          : span("Ingen entitet valgt.")
      ])
      : d("...")
], {style: "display: flex;"})

let clientPageRouter = {
  "Prosesser": Company => processesView( Company ),
  "Tidslinje": Company => timelineView( Company ),
  "Selskapets entiteter": Company => companyDocPage( Company )
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

let companyActionsView = Company => d(Company.Actions.map( Action => actionButton( Action ) ), {style: "display: flex; padding: 1em;"} )

let timelineView = Company => d([
  companyActionsView( Company ),
  d([
      entityLabel(Company.entity),
      d( Company.events.map( (event, i) =>  d([d([span( `${i+1 }`, {class: "entityLabel", style: `background-color: #9ad2ff;`})], {class: "popupContainer", style:"display: inline-flex;"})], {style:"display: inline-flex;"} )
        ), {style: `display:grid;grid-template-columns: repeat(${Company.events.length}, 1fr);background-color: #8080802b;margin: 5px;`} ),
  ], {style: `display:grid;grid-template-columns: 1fr 9fr;`}),
  d( Company.processes.map( process => processTimelineView(Company, process) )),
])

let processTimelineView = (Company, process) => {

  let processEventsTimes = Company.getProcess(process).events.map( event => Company.getEvent(event).t )

  return d([
    entityLabel(process, e => {
      Company.selectEvent(  Company.getProcess(process).events[0] )
      Database.selectPage("Prosesser")
    }  ),
    d( Company.events.map( (event, i) => ((i+1) < processEventsTimes[0] || (i+1) > processEventsTimes.slice( -1 )[0])
    ? d(" ")
    : Company.getProcess(process).events.includes(event)
      ? d([
          d([
              span( `${i+1}`, ``, {class: "entityLabel", style: `background-color:${ event === Company.selectedEvent ? "red" : "pink"};`}, "click", e => {
                Company.selectEvent(  event )
                Database.selectPage("Prosesser")
              } ),
              entityInspectorEventTimeline(Company, event)
            ], {class: "popupContainer", style:"display: inline-flex;"})
        ], {style:"display: inline-flex;"} )
      : d("-" ) ), {style: `display:grid;grid-template-columns: repeat(${Company.events.length}, 1fr);background-color: #8080802b;margin: 5px;`} ),
  ], {style: `display:grid;grid-template-columns: 1fr 9fr;`})
}

let entityInspectorEventTimeline = (Company, event) => d([
  entityLabel(event),
  br(),
  d( Company.getEvent(event).entities.map( companyEntity => d([companyEntityView(Company, companyEntity, Company.getEvent(event).t )], {style: "padding:5px; border: solid 1px lightgray;"})  ) )
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

let companyEntityLabel = (Company, companyEntity, t) => d( [
  d([
    span( `[${companyEntity}] ${Database.get( Company.get(companyEntity, 19 ), "entity/label" )}`, ``, {class: "entityLabel", style: `background-color:${Database.get( Company.get(companyEntity, 19 ), Database.attrName(20) )};`}),
    companyEntityInspectorPopup(Company, companyEntity, t)
  ], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"} )

let companyEntityInspectorPopup = (Company, companyEntity, t) => d([ companyEntityView(Company, companyEntity, t) ], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

let companyEntityLabelWithoutPopup = (Company, companyEntity, t) => d( [
  d([
    span( `[${companyEntity}] ${Database.get( Company.get(companyEntity, 19 ), "entity/label" )}`, ``, {class: "entityLabel", style: `background-color:${Database.get( Company.get(companyEntity, 19 ), Database.attrName(20) )};`}),
    d( String( Company.get(companyEntity, 19 ) ), {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
  ], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"} )


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
      d([
      
        isDefined( Company.get(Company.selectedEntity) )
          ? companyEntityView(Company, Company.selectedEntity )
          : d("Ingen entitet valgt.")
  
      ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"}),
      d("")
    ])
    
  ], {class: "pageContainer"})

}

let companyEntityView = (Company, companyEntity ) => d([
  d("<br>"),
  span( `[${companyEntity}] ${Database.get( Company.get(companyEntity, 19 ) , "entity/label" )}`, ``, {class: "entityLabel", style: `background-color:${Database.get( Company.get(companyEntity, 19 ) , Database.attrName(20) )};`}),
  d("<br>"),
  d(`Etter hendelse ${Company.t} (${moment( Company.getEvent( Company.events[ Company.t - 1 ] ).get( "event/date" )).format("DD/MM/YYYY")})`),
  d("<br>"),
  d(Company.get(companyEntity, undefined).companyDatoms.map( companyDatom => companyDatomView(companyDatom) )),
  d( Database.get( Company.get(companyEntity, 19 ), "entityType/calculatedFields" ).map( companyCalculatedField => companyCalculatedFieldView(Company, companyEntity, companyCalculatedField)))
])

let companyDatomView = companyDatom => {
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


let companyCalculatedFieldView = (Company, companyEntity, companyCalculatedField) => {

  let value = Company.get(companyEntity, companyCalculatedField)
  let valueType = Database.get(companyCalculatedField, "attribute/valueType")
  let isArray = Database.get(companyCalculatedField, "attribute/isArray")
  let valueView = (valueType === 41 && !isUndefined(value)) 
    ? isArray
      ? d(value.map( v => companyEntityLabelWithoutPopup(Company, v, Company.t) ))
      : companyEntityLabelWithoutPopup(Company, value, Company.t)
    : d( JSON.stringify(value) )

  return d([
    entityLabel(companyCalculatedField),
    valueView
  ], {class: "columns_1_1"})

}


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
  d(""),
  processView( Company )
  
], {class: "pageContainer"})

let processView =  Company => isNumber( Company.selectedProcess)
? d([
    submitButton(" <- Tilbake til tidslinjen ", e => Database.selectPage("Tidslinje") ),
    entityLabel( Company.selectedEvent ),
    processTimelineView(Company, Company.selectedProcess),
    br(),
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
  d( Database.get(Event.eventType, "eventType/eventAttributes").map( attribute =>  fullDatomView( Event , attribute )  )),
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
? d([
    d([
      span( Database.get(attribute, "entity/label"), "", {class: "entityLabel", style: `background-color:${Database.get( 42, "entityType/color" )};`}, "click", e => Database.selectEntity(attribute) ),
      attributeInspectorPopup(attribute)
    ], {class: "popupContainer", style:"display: inline-flex;"}),
  ], {style:"display: inline-flex;"} )
: d(`[${attribute}] Entiteten finnes ikke`)

let attributeInspectorPopup = attribute => d([
  h3(`[${attribute}] ${Database.get(attribute, "entity/label")}`),
  d([
    entityLabel( 18 ),
    entityLabel( Database.get(attribute, "attribute/valueType") )
  ], {class: "columns_1_1"}),
  d([
    entityLabel( 5823 ),
    span(`${Database.get(attribute, "attribute/isArray") ? "Flertall" : "Entall"}`, "", {style: "background-color:#7676f385;padding: 5px;"})
  ], {class: "columns_1_1"}),
  span("[t TBD]")
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

let positionInArrayView = (Entity, attribute, index) => d([
  d( String(index) ),
  moveUpButton(Entity, attribute, index),
  moveDownButton(Entity, attribute, index)
], {class: "columns_1_1_1"})

let moveUpButton = (Entity, attribute, index) => index > 0 ? submitButton( "↑", async e => {
  let Values = Entity.get(attribute)
  let stillBefore = Values.filter( (Value, i) => i < (index - 1) )
  let movedUp = Values[index]
  let movedDown = Values[index - 1]
  let stillAfter = Values.filter( (Value, i) => i > index )
  let newArray = stillBefore.concat( movedUp ).concat( movedDown ).concat( stillAfter )
  update( await Entity.replaceValue( attribute,  newArray ) )
}   ) : d("")

let moveDownButton = (Entity, attribute, index) => index < Entity.get(attribute).length - 1 ? submitButton( "↓", async e => {
  let Values = Entity.get(attribute)
  let stillBefore = Values.filter( (Value, i) => i < index )
  let movedUp = Values[index + 1]
  let movedDown = Values[index]
  let stillAfter = Values.filter( (Value, i) => i > index +1 )
  let newArray = stillBefore.concat( movedUp ).concat( movedDown ).concat( stillAfter )
  update( await Entity.replaceValue( attribute,  newArray ) )
}   ) : d("")




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

let fullDatomView = (Entity, attribute) => {

  let valueType = Database.get(attribute, "attribute/valueType")
  let isArray = Database.get(attribute, "attribute/isArray")

  let valueTypeViews = {
    "30": isArray ? multpleSimpleValuesRowView : singleTextView, //Tekst
    "31": isArray ? multpleSimpleValuesRowView : singleNumberView, //Tall
    "34": isArray ? multpleSimpleValuesRowView : functionTextView, //Funksjonstekst
    "36": isArray ? multpleSimpleValuesRowView : booleanView, //Boolean
    "40": isArray ? multpleSimpleValuesRowView : dropdownView, //Velg alternativ
    "32": isArray ? multipleEntitiesReferenceRowView : singleEntityReferenceView,
    "5721": isArray ? multpleSimpleValuesRowView : singleDateView, //Dato
    "38": datomConstructorRowView,
    "5824": fileView, //File
    "41": input_singleCompanyEntity, //Company entity
    "5849": eventConstructorsInProcessStepRowView, //Konstruksjon av ny hendelse
  }



  //TBD:
  //  Non-editable views
  //  Associated Views for calculatedValues (same as non-editable?)
  //  Implement time/versioning/changelog on datom and entity level (or value level?)
  //  Account balance value type?

  let startValuesByType = {
    "30": ``, //Tekst
    "31": 0, //Tall
    "5721": Date.now(), //Dato
    "34": ``, //Funksjonstekst
    "36": false, //Boolean
    "40": 0, //Velg alternativ
    "32": 6,
    "38": {entity: `return Q.latestEntityID() + 1;`, attribute: 1001, value: `return ''` },
    "5824": "", //File
    "41": 0, //Company entity
    "5849":  {6: "Ny handling", 5848: "return true;", 5850: "Company.createEvent(5000, Process.entity);"}, //Konstruksjon av ny hendelse
  }

  

  let startValue = Object.keys(startValuesByType).includes( String(valueType) ) ? startValuesByType[valueType] : ``

  return d([
    attributeLabel( attribute ),
    isArray 
      ? d([
          d([
            d( "#" ),
            d( "Verdi" ),
            d("")
          ], {class: "columns_1_8_1"}),
          d( Entity.get(attribute).map( (Value, index) => d([
              positionInArrayView(Entity, attribute, index),
              valueTypeViews[ Database.get(attribute, "attribute/valueType") ](Entity, attribute, index),
              submitButton( "[ X ]", async e => update( await Entity.removeValueEntry( attribute,  index ) )  )
            ], {class: "columns_1_8_1", style: "margin: 5px;"} )) ),
            submitButton( "[ + ]", async e => update( await Entity.addValueEntry( attribute,  startValue ) )  )
        ])
      : valueTypeViews[ Database.get(attribute, "attribute/valueType") ](Entity, attribute)
  ], isArray ? {style: "margin: 5px;border: 1px solid #80808052;"} : {class: "columns_1_1", style: "margin: 5px;"} )  

}

let singleTextView = (Entity, attribute) => Entity.isLocked ? d( Entity.get(attribute) ) : input( {value: Entity.get(attribute)}, "change", async e => update( await Entity.replaceValue( attribute,  submitInputValue(e) ) )  )

let singleNumberView = (Entity, attribute) => Entity.isLocked ? d( String( Entity.get(attribute) ) ) : input( {value: String( Entity.get(attribute) ), style: `text-align: right;` }, "change", async e => update( await Entity.replaceValue( attribute,  Number( submitInputValue(e) ) ) ) )

let singleDateView = (Entity, attribute) => Entity.isLocked ? d( moment( Entity.get(attribute) ).format("DD/MM/YYYY") ) : input( {value: moment( Entity.get(attribute) ).format("DD/MM/YYYY"), style: `text-align: right;` }, "change", async e => update( await Entity.replaceValue( attribute,  Number( moment( submitInputValue(e) , "DD/MM/YYYY").format("x") ) ) ) )

let multpleSimpleValuesRowView = (Entity, attribute, index) => {

  let valueType = Database.get(attribute, "attribute/valueType")
  let isLocked = Entity.isLocked

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
  let Value = Entity.get(attribute)[index]

  return input( {value: formatFunction(Value) }, "change", async e => update( await Entity.replaceValueEntry( attribute,  index, unFormatFunction( submitInputValue(e) ) ) ) )

}

let datomConstructorRowView = (Entity, attribute, index) => d([
  dropdown(
    Entity.get(attribute)[index].entity, 
    [{value: `return 1;`, label: `Selskapets entitet`}, {value: `return Q.latestEntityID() + 1;`, label: `Ny entitet nr. 1`}, {value: `return Q.latestEntityID() + 2;`, label: `Ny entitet nr. 2`}, {value: `return Q.latestEntityID() + 3;`, label: `Ny entitet nr. 3`}, , {value: `return Q.latestEntityID() + 4;`, label: `Ny entitet nr. 4`}, , {value: `return Q.latestEntityID() + 5;`, label: `Ny entitet nr. 5`}],
    async e => update( await Entity.replaceValueEntry( attribute, index, mergerino( Entity.get(attribute)[index], {entity: submitInputValue(e)} ) ) )
    ),
  d([
    htmlElementObject("datalist", {id:`entity/${Entity.entity}/options`}, optionsElement( Database.getAll(42)
      .filter( attr => attr >= 1000 ).concat(19)
      .filter( attr => Database.get( attr, "entity/label") !== "Ubenyttet hendelsesattributt")
      .map( attr => returnObject({value: attr, label: Database.get( attr, "entity/label")})  )
    )),
    input(
      {value: Database.get(Entity.get(attribute)[index].attribute, "entity/label"), list:`entity/${Entity.entity}/options`, style: `text-align: right;`}, 
      "change", 
      async e => {
        let selectedAttribute = Number( submitInputValue(e) )
        await Entity.replaceValueEntry( attribute, index, mergerino( Entity.get(attribute)[index], {attribute: Number(submitInputValue(e)), value: `return Event.get(${selectedAttribute})`} ) )
        update( await Entity.addValueEntry( 8, selectedAttribute ) )
    }),
  ]),
  textArea(Entity.get(attribute)[index].value, {class:"textArea_code"}, async e => update( await Entity.replaceValueEntry( attribute, index, mergerino( Entity.get(attribute)[index], {value: submitInputValue(e)} ) ) ) )
], {class: "columns_1_1_1"})

let entitySearchBox = (Entity, attribute, updateFunction, index) => d([
  input({id: `searchBox/${Entity.entity}/${attribute}/${index}`, value: Database.getLocalState(Entity.entity)[`searchstring/${attribute}/${index}`] ? Database.getLocalState(Entity.entity)[`searchstring/${attribute}/${index}`] : ""}, "input", 
    e => {
    Database.setLocalState(Entity.entity, {[`searchstring/${attribute}/${index}`]: e.srcElement.value  })
    let searchBoxElement = document.getElementById(`searchBox/${Entity.entity}/${attribute}/${index}`)
    searchBoxElement.focus()
    let val = searchBoxElement.value
    searchBoxElement.value = ""
    searchBoxElement.value = val
  }),
  isDefined( Database.getLocalState(Entity.entity)[`searchstring/${attribute}/${index}`] )
  ? d([
        d( Database.getLocalState(Entity.entity)[`searchstring/${attribute}/${index}`] ),
        d( Entity.getOptions(attribute).map( optionObject => optionObject.value ).filter( e => {
              let searchString = Database.getLocalState(Entity.entity)[`searchstring/${attribute}/${index}`]
              let label = Database.get(e, "entity/label")
              let isMatch = label.toUpperCase().includes(searchString.toUpperCase())
              return isMatch
            }  )
            .map( ent => d([entityLabel(ent, updateFunction(ent) )] )  )
            
          , {class: "searchResults"})
      ], {class: "searchResultsContainer"})
  : d("")

])

let singleEntityReferenceView = (Entity, attribute) => d([ entityLabel( Entity.get(attribute) ), entitySearchBox(Entity, attribute, ent => async e => update( await Entity.replaceValue( attribute,  ent ) ), 1) ])

let multipleEntitiesReferenceRowView = (Entity, attribute, index) => d([
  entityLabel(Entity.get(attribute)[index]),
  entitySearchBox(Entity, attribute, selectedEntity => async e => update( await Entity.replaceValueEntry( attribute, index, selectedEntity ) ), index)
])

let booleanView = (Entity, attribute) => Database.get(attribute, "attribute/isArray") ? d("[TBD]") : submitButton( Entity.get(attribute) ? "Sant" : "Usant", async e => update( await Entity.replaceValue( attribute,  Entity.get(attribute) ? false : true ) ) )

let functionTextView = (Entity, attribute) => Database.get(attribute, "attribute/isArray") ? d("[TBD]") : textArea( Entity.get(attribute), {class:"textArea_code"}, async e => update( await Entity.replaceValue( attribute,  submitInputValue(e).replaceAll(`"`, `'`) ) ) )

let dropdownView = (Entity, attribute) => Database.get(attribute, "attribute/isArray") ? d("[TBD]") : dropdown( Entity.get( attribute ), Database.getOptions( attribute ), async e => update( await Entity.replaceValue( attribute,  submitInputValue(e) ) ))

let fileView = (Entity, attribute) => Database.get(attribute, "attribute/isArray") ? d("[TBD]") : isArray(Database.get(Entity.entity, attribute))
    ? d( Database.get(Entity.entity, attribute).map( row => d(JSON.stringify(row)) ) )
    : input({type: "file", style: `text-align: right;`}, "change", e => {
          let file = e.srcElement.files[0]
          Papa.parse(file, {
            header: true,
            complete: async results => update( await Entity.replaceValue( attribute,  results.data ) ) 
          })
        }
      )

let eventConstructorsInProcessStepRowView = (Entity, attribute, index) => d([
  input( {value: Entity.get(attribute)[index][ 6 ], style: ``}, "change", async e => update( await Entity.replaceValueEntry(attribute, index, mergerino(Entity.get(attribute)[index], {6: submitInputValue(e) }) ) )  ),
  textArea( Entity.get(attribute)[index][5848], {class:"textArea_code"},  async e => update( await Entity.replaceValueEntry(attribute, index, mergerino(Entity.get(attribute)[index], {5848: submitInputValue(e).replaceAll(`"`, `'`)}) ) ) ),
  textArea( Entity.get(attribute)[index][5850],  {class:"textArea_code"},  async e => update( await Entity.replaceValueEntry(attribute, index, mergerino(Entity.get(attribute)[index], {5850: submitInputValue(e).replaceAll(`"`, `'`)}) ) )),
  submitButton("[Slett]", async e => update( await Entity.removeValueEntry(attribute, index ) ) )
], {class: "columns_1_3_3_1"})

let input_singleCompanyEntity = (Entity, attribute) => dropdown( Number(Entity.get( attribute )), ActiveCompany.getCompanyObject(ActiveCompany.company, Database.getEntity(Entity.entity, 6101).t).getOptions(attribute), async e => update( await Entity.replaceValue(attribute, Number(submitInputValue(e))  ) ) )
