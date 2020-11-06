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

let entityLabel = (entity, onClick) => d( [
  d([
    span( `${Database.get(entity, "entity/label")}`, `[${entity}] ${Database.get(entity, "entity/category")}`, {class: "entityLabel", style: `background-color:${Database.getEntityColor(entity)};`}, "click", isUndefined(onClick) ? e => Database.selectEntity(entity) : onClick ),
    entityInspectorPopup(entity),], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"} )


let entityInspectorPopup = entity => d([
  h3(`[${entity}] ${Database.get(entity, "entity/label")}`, {style: `background-color: {Entity.color}; padding: 3px;`}),
  d("<br>"),
  d(`Type: ${Database.get(entity, "entity/entityType")}`),
  d(`Kategori: ${Database.get(entity, "entity/category")}`),
  //d("Rediger", {class: "textButton"}, "click", e => A.updateLocalState({currentPage: "Admin/DB", selectedEntityType: Database.get(entity, "entity/entityType"), selectedCategory:  Database.get(entity, "entity/category"), selectedEntity: entity }))
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

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
  "Admin/Entitet": (S, A) => adminEntityView( S["UIstate"]["selectedEntity"] ),
}

let sortEntitiesAlphabeticallyByLabel = ( a , b ) => ('' + a.label).localeCompare(b.label)

let sidebar_left = (S, A) => d([
      d( S.EntityTypes
        .sort( sortEntitiesAlphabeticallyByLabel )
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

let timelineView = (S, A) => d([
  d(""),
  (S.selectedCompany.Events.length > 0)
  ? d( S.selectedCompany.Events.map( Event => newEventView( S, Event.entity ) ))
  : d("Noe er galt med selskapets tidslinje"),
  d("")
], {class: "pageContainer"})


let newEventView =  (S, entity) => {
  let eventType = Database.get(entity, "event/eventTypeEntity")

  return d([
    h3( Database.get(eventType, "entity/label") ),
    entityView(entity),
    d([
      entityLabel(27),
      entityLabel(eventType),
    ], {class: "columns_1_1"}),
    d( Database.get(eventType, "eventType/eventAttributes").map( attribute => datomView( entity, attribute, Database.getLocalState(entity).tx ))),
    d("<br>"),
    S["selectedCompany"]["t"] >= Database.get(entity, "eventAttribute/1000")
      ? newDatomsView( S["selectedCompany"].Datoms.filter( datom => datom.t === Database.get(entity, "eventAttribute/1000") ) ) 
      : d("Kan ikke vise hendelsens output"),
    d("<br>"),
    retractEntityButton(entity),
    dropdown( 0, 
    Database.getAll(43).map( entity => returnObject({value: entity, label: Database.get(entity, "entity/label") }) ).concat({value: 0, label: "Legg til hendelse etter denne"}),
    e => Database.createEvent( 
      Number(submitInputValue(e)), 
      Database.get(entity, "eventAttribute/1005"),  
      Database.get(entity, "eventAttribute/1000") + 1 
      )
    )
  ], {class: "feedContainer"} )

}

let reportsPage = (S, A) => d([
  d( //Left sidebar
    S.Reports.map( entity => d([
      entityLabel(entity, e => A.updateLocalState({selectedReport: entity} ))
    ])  )
    ),
  genericReportView(S, A, S["UIstate"]["selectedReport"]),
  d("")
], {class: "pageContainer"})

//Report view

let genericReportView = (S, A, selectedReport) => {
  let companyReport = S["selectedCompany"].getReport(selectedReport, S["UIstate"].selectedCompanyDocVersion )
  return d([
    d([
      submitButton("<<", e => A.updateLocalState({"selectedCompanyDocVersion": 0}) ),
      submitButton("<", e => A.updateLocalState({"selectedCompanyDocVersion": Math.max(S["UIstate"].selectedCompanyDocVersion - 1, 0) })),
      d(`${S["UIstate"].selectedCompanyDocVersion} / ${S["selectedCompany"]["t"]}`),
      submitButton(">", e => A.updateLocalState({"selectedCompanyDocVersion": Math.min(S["UIstate"].selectedCompanyDocVersion + 1, S["selectedCompany"]["t"])})),
      submitButton(">>", e => A.updateLocalState({"selectedCompanyDocVersion": S["selectedCompany"]["t"]})),
    ], {class: "columns_1_1_1_1_1"}),
    h3(Database.get(selectedReport, "entity/label")),
    companyReport 
      ? d( Database.get(selectedReport, "report/reportFields").map( reportField => reportFieldView(reportField.attribute, companyReport[reportField.attribute]) ) ) 
      : d("Rapporten er ikke tilgjengelig")
  ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
} 

let reportFieldView = (attribute, value) => {

  let customReportFieldViews = {
    "5578": reportFieldView_Datoms, //Tekst
    "5579": reportFieldView_Entities,
    "5648": reportFieldView_accountingTransactions,
    "5651": reportFieldView_actors
  }

  return customReportFieldViews[attribute] 
    ? customReportFieldViews[attribute](value) 
    : d([
      entityLabel(attribute),
      d(JSON.stringify(value))
    ], {class: "columns_1_1"}) 
}

let reportFieldView_Datoms = Datoms => d([
  d([
    d( "Entitet" ),
    d( "Attributt" ),
    d( "Verdi" ),
    d( "Hendelse #" ),
  ], {class: "columns_1_1_1_1"}),
  d( isArray(Datoms) 
      ? Datoms.map( Datom => d([
        d( String( Datom.entity ) ),
        entityLabel(Database.attr(Datom.attribute)),
        d( JSON.stringify(Datom.value) ),
        d( String( Datom.t ) ),
      ], {class: "columns_1_1_1_1"}) )
      : d("Error")
    )
])

let reportFieldView_Entities = Entities => d([
  d( isArray(Entities) 
      ? Entities.map( Entity => d([
      d(String( Entity.entity )),
      d(Object.keys(Entity)
        .filter( key => key !== "entity" && key !== "t" )
        .map( attribute => d([
          entityLabel( Number(attribute) ),
          d( JSON.stringify(Entity[attribute] ) ),
      ], {class: "columns_1_1"}) )),
      d("<br>"),
    ]))
  : d("Error")
  )
])

let reportFieldView_accountingTransactions = Entities => d([
  d([
    d( "Transaksjonsnr" ),
    d( "Selskapsentitet" ),
    d( "Konto" ),
    d( "Beløp" ),
    d( "Kilde (Hendelse #)" ),
  ], {class: "columns_1_1_1_1_1"}),
  d( isArray(Entities) 
      ? Entities.map( (Entity, index) => d([
        d( String(index+1) ),
        d( String(Entity.entity) ),
        entityLabel(Entity[1653]),
        d( String(Entity[1083])),
        d( String(Entity["t"]) ),
      ], {class: "columns_1_1_1_1_1"}))
  : d("Error")
  )
])

let reportFieldView_actors = Entities => d([
  d([
    d( "AktørID" ),
    d( "Selskapsentitet" ),
    d( "Navn" ),
    d( "Roller" ),
    d( "Kilde (Hendelse #)" ),
  ], {class: "columns_1_1_1_1_1"}),
  d( isArray(Entities) 
      ? Entities.map( (Entity, index) => d([
        d( String(Entity[1112]) ),
        d( String(Entity.entity) ),
        d( String(Entity[1113]) ),
        d( String(Entity[1113])),
        d( String(Entity["t"]) ),
      ], {class: "columns_1_1_1_1_1"}))
  : d("Error")
  )
])

let adminPage = (S, A) => d([
  sidebar_left(S, A),
  adminEntityView(S["UIstate"]["selectedEntity"]),
  d("")
], {class: "pageContainer"})

let entityView = entity => {

  let versions = Database.getServerEntity(entity).Datoms.map( Datom => Datom.tx ).filter( filterUniqueValues ).filter( tx => isNumber(tx) )
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

//Entity view



let adminEntityView = entity => {

  return (isNull(entity) || isUndefined( Database.getServerEntity(entity) ))
  ? d("Ingen entitet valgt.", {class: "feedContainer"})
  : d([
      h3( Database.get(entity, "entity/label")),
      entityView(entity),
      d( Database.get( Database.get(entity, "entity/entityType"), "entityType/attributes", Database.getLocalState(entity).tx).map( attribute => datomView( entity, attribute, Database.getLocalState(entity).tx ) )),
      retractEntityButton(entity),
      createEntityButton(Database.get(entity, "entity/entityType")),
    ], {class: "feedContainer"} )
}

let datomView = (entity, attribute, version) => {

  let Datom = Database.getDatom( entity, attribute, version )

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
    "39": input_reportFields, //valueTypeView_reportFields,
    "40": input_object, //valueTypeView_staticDropdown,
    "41": input_object, //valueTypeView_companyEntityDropdown,    
  } 



  return isUndefined(Datom)
  ? d("Finner ikke datom")
  : [37, 38, 39].includes(Database.get(Database.attr(Datom.attribute), "attribute/valueType"))
    ? genericValueTypeViews[ Datom.valueType  ]( Datom )
    : d([
      entityLabel( Database.attr(Datom.attribute) ),
      genericValueTypeViews[ Database.get(Database.attr(Datom.attribute), "attribute/valueType")  ]( Datom )
    ], {class: "columns_1_1"})
}

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
  {value: log(Datom, "A").value ? "1" : "0", style: `text-align: right;`}, 
  "change", 
  async e => await Database.updateEntity(Datom.entity, Datom.attribute,  submitInputValue(e) === "1" ? true : false )
)

let input_singleEntity = Datom => d([
  htmlElementObject("datalist", {id:`entity/${Datom.entity}/options`}, optionsElement( Datom.options.map( entity => returnObject({value: entity, label: Database.get(entity, "entity/label") }) )) ),
  input(
    {value: Database.get(Datom.value, "entity/label"), list:`entity/${Datom.entity}/options`, style: `text-align: right;`}, 
    "change", 
    async e => Datom.options.includes(Number(submitInputValue(e))) 
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
        [{value: `return 1;`, label: `Selskapets entitet`}, {value: `return Q.latestEntityID() + 1;`, label: `Ny entitet nr. 1`}, {value: `return Q.latestEntityID() + 2;`, label: `Ny entitet nr. 2`}, , {value: `return Q.latestEntityID() + 3;`, label: `Ny entitet nr. 3`}],
        async e => await Database.updateEntity(Datom.entity, Datom.attribute, mergerino(datoms, {[index]: {entity: submitInputValue(e)}})  )
        ),
      d([
        htmlElementObject("datalist", {id:`entity/${Datom.entity}/options`}, optionsElement( Database.getAll(42)
          .filter( attr => attr >= 1000 ).concat(29)
          .filter( attr => Database.get(attr, "entity/label") !== "Ubenyttet hendelsesattributt")
        )),
        input(
          {value: Database.get( Database.attr(datom.attribute), "entity/label"), list:`entity/${Datom.entity}/options`, style: `text-align: right;`}, 
          "change", 
          async e => {
            if(!isUndefined(submitInputValue(e))){
            let updatedValue = mergerino(datoms, {[index]: {attribute: Number(submitInputValue(e)), value: `return Q.userInput(${Number(submitInputValue(e))})`}})
            await Database.updateEntity(Datom.entity, Datom.attribute, updatedValue  )
            await Database.updateEntity(Datom.entity, "eventType/eventAttributes", Database.get(Datom.entity, "eventType/eventAttributes").concat( Number(submitInputValue(e)) ).filter(filterUniqueValues)  )
            }

          } 
        )
      ]),
      textArea(datom.value, {class:"textArea_code"}, async e => await Database.updateEntity(Datom.entity, Datom.attribute, mergerino(datoms, {[index]: {value: submitInputValue(e)}})  )),
      submitButton("[Slett]", async e => await Database.updateEntity(Datom.entity, Datom.attribute, datoms.filter( (d, i) => i !== index  )  )),
    ], {class: "columns_2_2_2_1"}) )),
    submitButton("Legg til", async e => await Database.updateEntity(Datom.entity, Datom.attribute, datoms.concat({entity: `return Q.latestEntityID() + 1;`, attribute: 1000, value: `return ''` })  ))
  ])

}

let input_reportFields = Datom => {

  let reportFields = Datom.value

  return d([
    entityLabel(Database.attr(Datom.attribute)),
    d([
      d("Attributt"),
      d("Verdi")
    ], {class: "columns_2_2_1"}),
    d(reportFields.map( (reportField, index) => d([
      d([
        htmlElementObject("datalist", {id:`entity/${Datom.entity}/options`}, optionsElement( Database.getAll(42)
          .filter( attr => attr >= 1000 ).concat(29)
          .filter( attr => Database.get(attr, "entity/label") !== "Ubenyttet hendelsesattributt")
          .map( entity => returnObject({value: entity, label: Database.get(entity, "entity/label") }))
        )),
        input(
          {value: Database.get( Database.attr(reportField.attribute), "entity/label"), list:`entity/${Datom.entity}/options`, style: `text-align: right;`}, 
          "change", 
          async e => {
            if(!isUndefined(submitInputValue(e))){
            let updatedValue = mergerino(reportFields, {[index]: {attribute: Number(submitInputValue(e)), value: `return Company.getAttributeValue(${ Number(submitInputValue(e))})`}})
            await Database.updateEntity(Datom.entity, Datom.attribute, updatedValue  )
            }

          } 
        )
      ]),
      textArea(reportField.value, {class:"textArea_code"}, async e => await Database.updateEntity(Datom.entity, Datom.attribute, mergerino(reportFields, {[index]: {value: submitInputValue(e)}})  )),
      submitButton("[Slett]", async e => await Database.updateEntity(Datom.entity, Datom.attribute, reportFields.filter( (d, i) => i !== index  )  )),
    ], {class: "columns_2_2_1"}) )),
    submitButton("Legg til", async e => await Database.updateEntity(Datom.entity, Datom.attribute, reportFields.concat({attribute: 1001, value: `return Company.getAttributeValue(1001)` })  ))
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
      htmlElementObject("datalist", {id:`entity/${Datom.entity}/options`}, optionsElement( Datom.options.map( entity => returnObject({value: entity, label: Database.get(entity, "entity/label") }) )) ),
      input(
        {value: "Legg til (søk)", list:`entity/${Datom.entity}/options`, style: `text-align: right;`}, 
        "change", 
        async e => Datom.options.includes( Number(submitInputValue(e)) ) ? await Database.updateEntity(Datom.entity, Datom.attribute,  Datom.value.concat( Number(submitInputValue(e)) ) ) : console.log("Option not allowed: ", submitInputValue(e) )
      )
    ])
  ], {class: "eventAttributeRow"})
], {class: "columns_1_1"})




