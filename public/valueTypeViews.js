//UTILITIES
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

let formatNumber = (num, decimals) => isNumber(num) ? num.toFixed( isNumber(decimals) ? decimals : 0 ).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ') : "NaN"

let tryFunction = Func => {
  let value;
  try {value = Func() }
  catch (error) {value = log(error) }
  return value;
}

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

let checkBox = (isChecked, onClick) => input( mergerino( {type: "checkbox"},  isChecked ? {checked: "checked"} : {}) , "click", onClick)

let submitButton = (label, onClick) => d(label, {class: "textButton"}, "click", e => {
  let button = document.getElementById(e.srcElement.id)
  button.style = "background-color: darkgray;"
  button.innerHTML = "Laster.."
  onClick(e)
}  )




let gridColumnsStyle = rowSpecification =>  `display:grid; grid-template-columns: ${rowSpecification};`


//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------

//Basic entity views

let entityLabel = (State, entity, onClick, isSelected) => State.DB.isEntity(entity)
  ?  d([d( 
        getEntityLabel(State.DB, entity), 
        {
          class: "entityLabel", 
          style: `background-color:${State.DB.get( State.DB.get( entity, "entity/entityType"), "entityType/color") ? State.DB.get( State.DB.get( entity, "entity/entityType"), "entityType/color") : "gray"}; ${(isSelected || State.S.selectedEntity === entity ) ? "border: 2px solid black;" : ""}`
        }, 
        "click", 
        isDefined(onClick) ? onClick : e => State.Actions.selectEntity( entity )
      )], {style:"display: inline-flex;"})
  : d(`[${ entity}] na.`, {class: "entityLabel", style: `background-color:gray;`})


let entityLabelWithPopup = ( State, entity, onClick, isSelected) => d([
d([
  entityLabel( State, entity, onClick, isSelected),
  entityPopUp( State, entity ),
], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"} )




let entityPopUp = (State, entity) => d([
  entityLabel( State, entity ),
  br(),
  d( getEntityLabel( State.DB, State.DB.get(entity, "entity/entityType") )  ),
  br(),
  d( getEntityDescription( State.DB, entity ) ),
  br(),
  span(`Entitet: ${ entity}`),
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

//AdminEntityLabel



let adminEntityLabelWithPopup = ( State, entity, onClick, isSelected) => d([
d([
  entityLabel( State, entity, onClick, isSelected),
  adminEntityPopUp( State, entity ),
], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"} )

let adminEntityPopUp = (State, entity) => d([
h3( `${ State.DB.get( entity, "entity/label") ? State.DB.get( entity, "entity/label") : "Mangler visningsnavn."}` ),
d([
  d([span( `Entitet`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`})], {style:"display: inline-flex;"}),
  d(String(entity)),
], {class: "columns_1_1"}),
d([
  entityLabel( State,  47 ),
  entityLabel( State,  State.DB.get( entity, "entity/entityType" ) ),
], {class: "columns_1_1"}),
br(),
submitButton("Rediger", e => ClientApp.update( State, {S: {isAdmin: true, selectedEntity: entity}} )  ),
br(),
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})




//NEW VIEWS

let entityView = (State, entity) => isDefined(entity)
  ? d([
      d([
        d([span( `Entitet`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`})], {style:"display: inline-flex;"}),
        entityLabelWithPopup( State, entity),
      ], {class: "columns_1_1"}),
      d( State.DB.get( State.DB.get(entity, "entity/entityType"), "entityType/attributes" ).map( attribute => entityAttributeView(State, entity, attribute) ) ),
      d([
        submitButton( "Slett", e => State.Actions.retractEntity(entity) ),
        submitButton( `Opprett ny ${h3( `${ State.DB.get( State.DB.get(entity, "entity/entityType"), "entity/label") ? State.DB.get( State.DB.get(entity, "entity/entityType"), "entity/label") : "Mangler visningsnavn."}` ) } `, e => State.Actions.createEntity( State.DB.get(entity, "entity/entityType") ) ),
        submitButton( "Lag kopi", e => State.Actions.duplicateEntity( entity ) ),
      ])
    ], {class: "feedContainer"} )
  : d("Ingen entitet valgt", {class: "feedContainer"})

let entityVersionLabel = (State, entity, attribute) => d([
  d([
    d( "v" + State.DB.getEntityAttribute(entity, attribute).Datoms.length, {style: "padding: 3px;background-color: #46b3fb;color: white;margin: 5px;"} ),
    entityVersionPopup( State, entity, attribute )
  ], {class: "popupContainer"})
  ], {style:"display: inline-flex;"} )

let entityVersionPopup = (State, entity, attribute) => {

  let EntityDatoms = State.DB.getEntity( entity ).Datoms.filter( Datom => Datom.attribute === State.DB.attrName(attribute) )

  return d([
    d([
      d( "Endret"),
      d("Tidligere verdi")
    ], {style: gridColumnsStyle("2fr 2fr 1fr")}),
      d( EntityDatoms.reverse().slice(1, 5).map( Datom => d([
        d( moment(Datom.tx).format("YYYY-MM-DD") ),
        d(JSON.stringify(Datom.value)),
        submitButton( "Gjenopprett", async e => ClientApp.update( State, {DB: await Transactor.updateEntity( State.DB, entity, Datom.attribute, Datom.value )} )
        )
      ], {style: gridColumnsStyle("2fr 2fr 1fr")})   ) )
    ], {class: "entityInspectorPopup", style: "width: 400px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
}


let entityAttributeView = (State, entity, attribute) => d([
  entityLabelWithPopup( State, attribute),
  State.DB.get(attribute, "attribute/isArray") 
    ? (State.DB.get(attribute, "attribute/valueType") === 32) ? newMultipleValuesView(State, entity, attribute) : multipleValuesView(State, entity, attribute ) 
    : singleValueView( State, entity, attribute ),
  entityVersionLabel( State, entity, attribute )
], ( State.DB.get(attribute, "attribute/isArray") || State.DB.get(attribute, "attribute/valueType") === 6534 ) ? {style: "margin: 5px;border: 1px solid #80808052;"} : {style:  gridColumnsStyle("3fr 3fr 1fr") + "margin: 5px;"} )



//company Entities


let companyEntityLabel = (State, companyEntity, onClick, isSelected) => d([
      d( 
        getCompanyEntityLabel( State.DB, State.companyDatoms, companyEntity),
        {
          class: "entityLabel", 
          style: `background-color:${isDefined(State.Company.get(companyEntity)) ? State.DB.get( State.Company.get(companyEntity, 6781), "entityType/color") : "gray"}; ${ (isSelected || State.S.selectedCompanyEntity === companyEntity) ? "border: 2px solid blue;" : ""}`}, 
        "click", 
        isDefined(onClick) ? onClick : e => State.Actions.selectCompanyEntity(companyEntity) 
        ),
  ], {style:"display: inline-flex;"})
  

let companyEntityLabelWithPopup = (State, companyEntity, onClick, isSelected) => isDefined(companyEntity)
  ? d([
      d([
        companyEntityLabel( State, companyEntity, onClick, isSelected),
        companyEntityPopUp( State, companyEntity ),
      ], {class: "popupContainer", style:`display: inline-flex;`})
    ], {style:"display: inline-flex;"}) 
  : d(`[${companyEntity}] na.`, {class: "entityLabel", style: `background-color:gray;`})


let companyEntityPopUp = (State, companyEntity) => d([

  companyEntityLabel( State, companyEntity ),
  br(),
  d( getEntityLabel( State.DB, State.Company.get(companyEntity, 7861) )  ),
  br(),
  d( getEntityDescription( State.DB, State.Company.get(companyEntity, 6781) ) ),
  br(),
  span(`Selskapsentitet: ${ companyEntity}`),

], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})


let companyEntityView = (State, companyEntity ) => {

  let CompanyEntity = State.Company.get( companyEntity )

  let companyEntityType = State.Company.get( companyEntity, 6781 )

  let companyEntityTypeAttributes = State.DB.get( companyEntityType, 6779 ) ? State.DB.get( companyEntityType, 6779 ) : []
  let companyEntityTypeCalculatedField = State.DB.get( companyEntityType, 6789 )? State.DB.get( companyEntityType, 6789 ) : []



  return d([
    companyEntityLabelWithPopup(State, companyEntity),
    br(),
    isDefined(CompanyEntity)
      ? d([
          d( [7861, 6781, 7543].map( attribute => companyDatomView( State, companyEntity, attribute ) ) ),
          br(),
          d( companyEntityTypeAttributes
              .filter( attribute => isDefined( State.Company.get( companyEntity, attribute) ) )
              .map( attribute => companyDatomView( State, companyEntity, attribute ) )
              ),
          br(),
          d( companyEntityTypeCalculatedField.map( calculatedField => companyDatomView( State, companyEntity, calculatedField ) ) )
      ])
    : d("Entiteten er ikke definert")
    
  ], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
} 


let companyDatomView = (State, companyEntity, attribute, t ) => d([
  entityLabelWithPopup( State, attribute, e => console.log("Cannot access AdminPage from here")),
  companyValueView(State, companyEntity, attribute),
  //State.DB.get(attribute, "entity/entityType") === 5817 ? companyEntityVersionLabel( State, companyEntity, attribute, t ) : d("")
], {class: "columns_1_1"}) 

let companyValueView = (State, companyEntity, attribute) => {

  let valueType = State.DB.get(attribute, "attribute/valueType")

  let Value = State.Company.get( companyEntity, attribute, State.S.selectedCompanyDate )

  try {
    return isDefined( Value )
    ? valueType === 41
      ? State.DB.get(attribute, "attribute/isArray")
        ? d( Value.map( companyEnt => companyEntityLabelWithPopup(State, companyEnt ) ) )
        : companyEntityLabelWithPopup(State, Value )
      : [1653, 6781, 1099].includes(attribute)
        ? entityLabelWithPopup( State, Value , e => console.log("Cannot access AdminPage from here") )
        : valueType === 32
          ? entityLabelWithPopup(State, Value )
          : valueType === 6553
            ? d( Value.map( accountBalance => d([
                entityLabelWithPopup( State, accountBalance.account),
                d( String(accountBalance.amount) ),
              ], {class: "columns_1_1"})
             )  )
            : d( new Function(["storedValue"], State.DB.get(State.DB.get(attribute, "attribute/valueType"), "valueType/formatFunction") )( Value  ), {style: isNumber(Value) ? `text-align: right;` : ""}  )
    : d("na.")
  } catch (error) {
    return d(error)
  }

}

let companyEntityVersionLabel = ( State, companyEntity, attribute, t ) => d([
  d([
    d( moment( t ).format("D/M"), {style: "padding: 3px;background-color: #46b3fb;color: white;margin: 5px;"} ),
    companyEntityVersionPopup( State, companyEntity, attribute, t )
  ], {class: "popupContainer"})
  ], {style:"display: inline-flex;"} )

let companyEntityVersionPopup = ( State, companyEntity, calculatedField, t ) => {

  //let versions = State.Company.getCalculatedFieldversions( companyEntity, calculatedField )

  return d([
    d([
      d("Endret"),
      d("Tidligere verdi")
    ], {style: gridColumnsStyle("2fr 2fr 1fr")}),
      d("TBD")
      /* d( versions.map( version => d([
        submitButton( moment( version ).format("D/M"), e => State.Actions.selectCompanyEntityVersion(  companyEntity, version ) ),
        d(JSON.stringify( State.Company.get(companyEntity, calculatedField, version ) ))
      ], {style: gridColumnsStyle("2fr 2fr 1fr")})   ) ) */
    ], {class: "entityInspectorPopup", style: "width: 400px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
}



    
  


// VALUE TYPE VIEWS

  let multipleValuesView = (State, entity, attribute) => {
  
    let valueType = State.DB.get(attribute, "attribute/valueType")
  
    let valueTypeViews = {
      "6783": companyEntityConstructorRowView,
      "41": (entity, attribute, index) => d(JSON.stringify(State.DB.get(entity, attribute)[index])), //Company entity
      "6613": argumentRowView,
      "6614": statementRowView,
    }
  
    let startValuesByType = {
      "6783": {companyEntityType: 7079, attributeAssertions: {} },
      "41": 0, //Company entity
      "6613": {"argument/name": "argumentNavn", "argument/valueType": 30},
      "6614": {"statement/statement": "console.log({Company, Process, Event})", "statement/isEnabled": true},
    }
    let startValue = Object.keys(startValuesByType).includes( String(valueType) ) ? startValuesByType[valueType] : ``

    let Value = State.DB.get(entity, attribute)
  
    return d([
      d([
        d( "#" ),
        d( "Verdi" ),
        d("")
      ], {class: "columns_1_8_1"}),
      isArray( Value )
        ?  d( State.DB.get(entity, attribute).map( (Value, index) => d([
              positionInArrayView(State, entity, attribute, index),
              valueTypeViews[ valueType ](State, entity, attribute, index),
              submitButton( "[ X ]", async e => ClientApp.update( State, {DB: await Transactor.updateEntity(State.DB, entity, attribute, State.DB.get(entity, attribute).filter( (Value, i) => i !== index  )  )} ) )
            ], {class: "columns_1_8_1", style: "margin: 5px;"} )) )
        : d("Ingen verdier"),
        submitButton( "[ + ]", async e => isArray( State.DB.get( entity, attribute) ) 
          ? ClientApp.update( State, {DB: await Transactor.updateEntity(State.DB, entity, attribute, State.DB.get(entity, attribute).concat(startValue)  )} )
          : ClientApp.update( State, {DB: await Transactor.updateEntity(State.DB, entity, attribute, [startValue]  )} )
        )

    ])
  
  }
  
  let positionInArrayView = (State, entity, attribute, index) => d([
    d( String(index) ),
    moveUpButton(State, entity, attribute, index),
    moveDownButton(State, entity, attribute, index)
  ], {class: "columns_1_1_1"})
  
  let moveUpButton = (State, entity, attribute, index) => index > 0 ? submitButton( "↑", async e => {
    let Values = State.DB.get(entity, attribute)
    let stillBefore = Values.filter( (Value, i) => i < (index - 1) )
    let movedUp = Values[index]
    let movedDown = Values[index - 1]
    let stillAfter = Values.filter( (Value, i) => i > index )
    let newArray = stillBefore.concat( movedUp ).concat( movedDown ).concat( stillAfter )


    ClientApp.update( State, {DB: await Transactor.updateEntity(State.DB, entity, attribute, newArray  )} )

  }   ) : d("")
  
  let moveDownButton = (State, entity, attribute, index) => index < State.DB.get(entity, attribute).length - 1 ? submitButton( "↓", async e => {
    let Values = State.DB.get(entity, attribute)
    let stillBefore = Values.filter( (Value, i) => i < index )
    let movedUp = Values[index + 1]
    let movedDown = Values[index]
    let stillAfter = Values.filter( (Value, i) => i > index +1 )
    let newArray = stillBefore.concat( movedUp ).concat( movedDown ).concat( stillAfter )
    ClientApp.update( State, {DB: await Transactor.updateEntity(State.DB, entity, attribute, newArray  )} )
  }   ) : d("")
  
  
  //Company entities
  
  let input_singleCompanyEntity = ( State, entity, attribute, isEditable) => isEditable
    ? dropdown( State.DB.get( entity,  attribute ), Entity.getOptions( attribute ), async e => ClientApp.update( State, {DB: await Transactor.updateEntity(State.DB, entity, attribute, Number(submitInputValue(e))  )} ) )
    : companyEntityLabelWithPopup(ClientApp.Company, State.DB.get( entity,  attribute ) )
 



    
  //Multiple valueType views
  
  let argumentRowView = (State, entity, attribute, index) => {
  
    let valueType = State.DB.get(attribute, "attribute/valueType") //6613
  
    let Value = State.DB.get(entity, attribute)[index]
  
    return d([
      input( {value: Value["argument/name"] }, "change", async e => ClientApp.update( State, {DB: await Transactor.replaceValueEntry(State.DB, entity, attribute, index, mergerino( Value, {"argument/name": submitInputValue(e)}))} ) ),
      dropdown( Value["argument/valueType"], State.DB.getAll(44).map( e => returnObject({value: e, label: State.DB.get(e, "entity/label")}) ), async e => ClientApp.update( State, {DB: await Transactor.replaceValueEntry(State.DB, entity, attribute, index, mergerino( Value, {"argument/valueType": Number( submitInputValue(e) ) }))} )
      )
    ], {class: "columns_1_1"}) 
  
  }
  
  let statementRowView = ( State, entity, attribute, index) => {
  
    let valueType = State.DB.get(attribute, "attribute/valueType") // 6614
  
    let Value = State.DB.get( entity, attribute)[index]
  
    
  
    return d([
      checkBox( Value["statement/isEnabled"] , async e => ClientApp.update( State, {DB: await Transactor.replaceValueEntry(State.DB, entity, attribute, index, mergerino( Value, {"statement/isEnabled": Value["statement/isEnabled"] ? false : true  }))} )),
  
  
      textArea( Value["statement/statement"], {style: "margin: 1em;font: -webkit-control;"} , async e => ClientApp.update( State, {DB: await Transactor.replaceValueEntry(State.DB, entity, attribute, index, mergerino( Value, {"statement/statement": submitInputValue(e).replaceAll(`"`, `'`).replaceAll("/\r?\n|\r/", "")  }))}) )
  
    ], {class: "columns_1_9"}) 
  
  }
  
  let companyEntityConstructorRowView = ( State, entity, attribute, index) => {
  
    let entityConstructor = State.DB.get( entity, attribute)[index]
    let companyEntityType = entityConstructor.companyEntityType

    let balanceObjects = State.DB.getAll(7531)
    let companyTransactions = State.DB.getAll(6778)
    let companyDocuments = State.DB.getAll(7535)

    let companyEntityTypeSelection = balanceObjects.concat( companyTransactions ).concat( companyDocuments )
  
    return d([
      dropdown(
        companyEntityType, 
        companyEntityTypeSelection.map( e => returnObject({value: e, label: State.DB.get(e, "entity/label")}) ),
        async e => ClientApp.update( State, {DB: await Transactor.replaceValueEntry(State.DB, entity, attribute, index, mergerino( entityConstructor, {companyEntityType: Number( submitInputValue(e) ), attributeAssertions: {}  } ))} )
        ),
        br(),
        d([
          d( isDefined(State.DB.get( companyEntityType , "companyEntityType/attributes")) ? State.DB.get( companyEntityType , "companyEntityType/attributes").map(  attr => {
            let attributeAssertions = entityConstructor.attributeAssertions
  
            let attributeAssertion = attributeAssertions[ attr ]
  
            let isEnabled = isDefined(attributeAssertion) ? attributeAssertion.isEnabled : false
            let valueFunction = isDefined(attributeAssertion) ? attributeAssertion.valueFunction : ""
  
            let isEnabledUpdateFunction = async e =>  {
              let updatedAssertion = mergerino(attributeAssertion, {isEnabled: isEnabled ? false : true })

              ClientApp.update( State, {DB: await Transactor.replaceValueEntry(State.DB, entity, attribute, index, mergerino( entityConstructor, {attributeAssertions: mergerino(attributeAssertions, {[attr]: updatedAssertion})  } ))} )

            } 
            let valueFunctionUpdateFunction = async e => {
  
              let updatedAssertion = mergerino(attributeAssertion, {valueFunction: submitInputValue(e), isEnabled: true })
  
              ClientApp.update( State, {DB: await Transactor.replaceValueEntry(State.DB, entity, attribute, index, mergerino( entityConstructor, {attributeAssertions: mergerino(attributeAssertions, {[attr]: updatedAssertion}) } ))} )
            } 
    
    
    
            return d([
              checkBox( isEnabled , isEnabledUpdateFunction ),
              entityLabelWithPopup( State, attr),
              textArea(valueFunction, {class:"textArea_code"}, valueFunctionUpdateFunction )
            ], {style: gridColumnsStyle("1fr 3fr 6fr") })
          }  ) : "ERROR" )
        ])
      
    ])
  } 
  
  
let textInput = ( State, formattedValue, updateFunction ) => input( {value: formattedValue, style: isDefined( formattedValue ) ? "" : "background-color: red;" }, "change", updateFunction  )
let dateInput = ( State, formattedValue, updateFunction ) => input( {value: formattedValue, style: isDefined( formattedValue ) ? "" : "background-color: red;" }, "change", updateFunction  )
let numberInput = ( State, formattedValue, updateFunction ) => input( {value: formattedValue, style: isNumber( Number(formattedValue) ) ? "text-align: right;" : "background-color: red;" }, "change", updateFunction  )


let textAreaView = ( State, formattedValue, updateFunction ) => textArea( formattedValue, {class:"textArea_code"}, updateFunction )
let boolView = ( State, formattedValue, updateFunction ) => input( {value: formattedValue}, "click", updateFunction )

let optionsViews = ( State, formattedValue, updateFunction, options )  => dropdown( formattedValue, options , updateFunction )
let entityRefView = ( State, formattedValue, updateFunction, options ) => {
  let datalistID = getNewElementID()
  return d([
    entityLabelWithPopup( State,  formattedValue ), 
    htmlElementObject("datalist", {id:datalistID}, optionsElement( options ) ),
    input({value: formattedValue, list: datalistID, style: `text-align: right;`}, "change", updateFunction),
    ])
}
let fileuploadView = ( State, formattedValue, updateFunction ) => isArray( formattedValue ) ? d( formattedValue.map( row => d(JSON.stringify(row)) ) ) : input({type: "file", style: `text-align: right;`}, "change", updateFunction)

let functionView = ( State, formattedValue, updateFunction ) => {

  //TBD
  
  let Value = formattedValue

  


  return d([
        d("TBD")
      /* d([
        d("Navn"),
        input( {value: Value.name}, "change", async e => update( await Entity.replaceValue( attribute, mergerino(Value, {name: submitInputValue(e)})   ) )   ),
      ], {class: "columns_1_1"}),
      br(),
      d([
        d("Argumenter"),
        d( Value.arguments.map( (argument, index) => d([
          d([
            checkBox(true),
            d(String(index)),
            submitButton(" X ", async e => update( await Entity.replaceValue( attribute, mergerino(Value, {arguments: Value.arguments.filter( (argument, i) => i !== index ) }    ) )))
          ], {class: "columns_1_1_1"}),
          input( {value: argument}, "change", async e => update( await Entity.replaceValue( attribute, mergerino(Value, {arguments: Value.arguments.slice(0, index ).concat(submitInputValue(e)).concat(Value.arguments.slice(index + 1, Value.arguments.length))  })   ) ) ),
          //Argument type TBD
          dropdown("string", [
            {value: "string", label: "String"},
            {value: "number", label: "Number"},
            {value: "object", label: "Object"},
          ]),
        ], {class: "columns_1_9"}))),
        submitButton(" + ", async e => update( await Entity.replaceValue( attribute, mergerino(Value, {arguments: Value.arguments.concat("argument") }    ) ))),
      ]),
      br(),
      d([
        d("Statements"),
        d( Value.statements.map( (statement, index) => d([
          
          d([
            checkBox(true),
            d(String(index)),
            submitButton(" X ", async e => update( await Entity.replaceValue( attribute, mergerino(Value, {statements: Value.statements.filter( (argument, i) => i !== index ) }    ) ))),
          ], {class: "columns_1_1_1"}),
          textArea( statement, {style: "margin: 1em;font: -webkit-control;"} , async e => update( await Entity.replaceValue( attribute, mergerino(Value, {statements: Value.statements.slice(0, index ).concat(  submitInputValue(e).replaceAll(`"`, `'`).replaceAll("/\r?\n|\r/", "")  ).concat(Value.statements.slice(index + 1, Value.statements.length))  })   ) ) ),
        ], {class: "columns_1_9"}))),
        submitButton(" + ", async e => update( await Entity.replaceValue( attribute, mergerino(Value, {statements: Value.statements.concat("console.log('!');") }    ) )))
      ]),*/
  ]) 
}


let selectCompanyEntityView = ( State, formattedValue, updateFunction, options ) => {

  let isValidCompanyEntity = getCompanyEvents( State.DB, State.S.selectedCompany ).includes(formattedValue)


  let optionObjects = [{value: 0, label: 'Velg alternativ'}].concat( options.map( companyEntity => returnObject({value: getFromCompany( State.companyDatoms, companyEntity, 7543 ), label: getCompanyEntityLabel(State.DB, State.companyDatoms, companyEntity) })  )  ) 

  return d([
    isValidCompanyEntity ? companyEntityLabelWithPopup( State, State.Company.getCompanyEntityFromEvent( formattedValue ) ) : d("tom"),
    dropdown(
      isValidCompanyEntity ? formattedValue : "Velg", 
      optionObjects,
      updateFunction 
      )

    ])
}

let placeholderView = ( State, formattedValue, updateFunction ) => d( JSON.stringify( formattedValue )  )

const valueTypeViews_single = {
  "30": textInput, //Tekst
  "31": numberInput, //Tall
  "34": textAreaView, //Funksjonstekst
  "36": boolView, //Boolean
  "40": optionsViews, //Velg alternativ
  "32": entityRefView,
  "5721": dateInput, //Dato
  "5824": fileuploadView, //File
  "41": selectCompanyEntityView, //Company entity, ie. from user selection

  
  "6534": placeholderView, //ExpandedFunction - TBD


  "6553": placeholderView, //Accbal -- only non-editable
  


  "6613": placeholderView, //function statements - only multiple
  "6614": placeholderView, //function arguments - only multiple
  "38": placeholderView, //datomconstructor - only multiple
  "5849": placeholderView, //Konstruksjon av ny hendelse - only multiple

}



let singleValueView = ( State, entity, attribute  ) => {


  let valueType = State.DB.get(attribute, "attribute/valueType")


  let viewFunction = valueTypeViews_single[ valueType ]

  let formatFunction = new Function(["storedValue"], State.DB.get(valueType, "valueType/formatFunction") )

  let storedValue = State.DB.get( entity, attribute )

  let formattedValue = formatFunction( storedValue  )

  let unFormatFunction = new Function(["submittedValue"], State.DB.get(valueType, "valueType/unformatFunction") ) 
  

  let updateFunction = (valueType === 5824)
  ? async element => {

    let updateFunction = () => ClientApp.update(  )

    let submitFunction = new Function(["Database", "entity", "attribute", "element", "updateFunction"], State.DB.get(valueType, "valueType/unformatFunction") )

    

    submitFunction(State.DB, entity, attribute, element, updateFunction)
    

    

  }
  : async e => ClientApp.update( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, unFormatFunction( submitInputValue( e ) ) )} )


  let options = [32, 40].includes(valueType)
     ? State.DB.getOptions( attribute ) 
     : valueType === 41
      ? tryFunction( () => new Function( ["Database", "Company"] , State.DB.get(attribute, "attribute/selectableEntitiesFilterFunction") )( State.DB, State.Company )  )
      : []


  let valueView = viewFunction( State, formattedValue, updateFunction, options )

  return valueView


}

let multipleEntityRefsRowView = ( State, formattedValue, updateFunction, options ) => {
  let datalistID = getNewElementID()
  return d([
    htmlElementObject("datalist", {id:datalistID}, optionsElement( options ) ),
    input({value: formattedValue, list: datalistID, style: `text-align: right;`}, "change", updateFunction),
    entityLabelWithPopup( State,  formattedValue ), 
    ])
} 


let newMultipleValuesView = ( State, entity, attribute ) => {
  

  

  let valueType = State.DB.get(attribute, "attribute/valueType")

  if( valueType === 6783 ){ return companyEntityConstructorRowView( State, entity, attribute, index )  }
  if( valueType === 6613 ){ return argumentRowView( State, entity, attribute, index )  }
  if( valueType === 6614 ){ return statementRowView( State, entity, attribute, index )  }

  let valueTypeViews_multiple = {
    "32": multipleEntityRefsRowView,
    "6783": placeholderView, // companyEntityConstructorRowView,
    "6613": placeholderView, // argumentRowView,
    "6614": placeholderView, // statementRowView,
  }

  let startValuesByType = {
    "32": 6,
    "6783": {companyEntityType: 7495, attributeAssertions: {} },
    "6613": {"argument/name": "argumentNavn", "argument/valueType": 30},
    "6614": {"statement/statement": "console.log({Company, Event})", "statement/isEnabled": true},
  }


  let viewFunction = valueTypeViews_multiple[ valueType ]
  let formatFunction = new Function(["storedValue"], State.DB.get(valueType, "valueType/formatFunction") )
  let unFormatFunction = new Function(["submittedValue"], State.DB.get(valueType, "valueType/unformatFunction") ) 
  let startValue = Object.keys(startValuesByType).includes( String(valueType) ) ? startValuesByType[valueType] : ``

  let storedValues = State.DB.get( entity, attribute )

  let getUpdateFunction = index => async e => {
    let submittedValue = submitInputValue( e )
    let unformattedValue = unFormatFunction( submittedValue )

    ClientApp.update( State, {DB: await Transactor.updateEntity(State.DB, entity, attribute, storedValues.slice(0, index ).concat( unformattedValue ).concat( storedValues.slice(index + 1, storedValues.length ) ) ) }  )
  }

  let options = [ 32 ].includes(valueType) ? State.DB.getOptions( attribute ) : []

  return d([
    isArray( storedValues )
      ?  d( storedValues.map( (storedValue, index) => d([
            positionInArrayView(State, entity, attribute, index),
            viewFunction(  State, formatFunction( storedValue ), getUpdateFunction( index ) , options  ),
            submitButton( "[ X ]", async e => ClientApp.update( State, {DB: await Transactor.updateEntity(State.DB, entity, attribute, storedValues.filter( (Value, i) => i !== index  )  )} ) )
          ], {class: "columns_1_8_1", style: "margin: 5px;"} )) )
      : d("Ingen verdier"),
      submitButton( "[ + ]", async e => {
        let newDBversion = await Transactor.updateEntity(State.DB, entity, attribute, isArray( State.DB.get( entity, attribute) ) ? storedValues.concat( startValue ) : [startValue]  )
        ClientApp.update( State, {DB: newDBversion} )
      } )
  ])

}

//--------------