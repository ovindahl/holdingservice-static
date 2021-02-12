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

let arrayUnion = Arrays => Arrays.flat().filter( filterUniqueValues )

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


//---
  
let sourceDocumentLabelText = (State, sourceDocument, onclick) => d([d(
  "Bilag: " + State.DB.get(sourceDocument, 6), 
  {class: "entityLabel", style: `background-color:#ffc10785;`}, 
  "click", 
  isDefined(onclick) 
    ? onclick 
    : () => State.Actions.selectSourceDocument( sourceDocument ) 
  )], {style:"display: flex;"})
  
let sourceDocumentLabel = (State, sourceDocument, onclick) => d([
  d([
    sourceDocumentLabelText( State, sourceDocument, onclick ),
    sourceDocumentPopUp( State, sourceDocument ),
  ], {class: "popupContainer", style:"display: inline-flex;"})
  ], {style:"display: inline-flex;"} )

let sourceDocumentPopUp = (State, sourceDocument) => d([
  sourceDocumentLabelText( State, sourceDocument ),
  entityLabelWithPopup( State, State.DB.get(sourceDocument, 10070) ),
  br(),
  d(`Entitet: ${sourceDocument}`)
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;width: 400px;"})

//--------


let entityLabel = (State, entity, onClick ) => State.DB.isEntity(entity)
  ?  d([d( 
        getEntityLabel(State.DB, entity), 
        {
          class: "entityLabel", 
          style: `background-color:${State.DB.get( State.DB.get( entity, "entity/entityType"), "entityType/color") ? State.DB.get( State.DB.get( entity, "entity/entityType"), "entityType/color") : "gray"}; ${( State.S.selectedEntity === entity || State.S.selectedAccountingYear === entity) ? "border: 2px solid black;" : ""}`
        }, 
        "click", 
        isDefined(onClick) ? onClick : null
      )], {style:"display: inline-flex;"})
  : d(`[${ entity}] na.`, {class: "entityLabel", style: `background-color:gray;`})


let entityLabelWithPopup = ( State, entity, onClick ) => {

  let entityTypeLabelController = {
    "7948": transactionLabel,
    "7979": actorLabel,
    "7932": nodeLabel,
    "10062": sourceDocumentLabel
  }

  return isDefined( entityTypeLabelController[ State.DB.get(entity  , "entity/entityType") ])
  ? entityTypeLabelController[ State.DB.get( entity , "entity/entityType") ]( State, entity, onClick )
  : d([
      d([
        entityLabel( State, entity, onClick ),
        entityPopUp( State, entity ),
      ], {class: "popupContainer", style:"display: inline-flex;"})
    ], {style:"display: inline-flex;"} )
} 

let entityPopUp = (State, entity) => d([
    h3( getEntityLabel( State.DB, entity ) ),
    br(),
    d( getEntityLabel( State.DB, State.DB.get(entity, "entity/entityType") )  ),
    br(),
    d( State.DB.get( entity, "entity/doc") ? State.DB.get( entity, "entity/doc") : "" ),
    br(),
    span(`Entitet: ${ entity}`),
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

// VALUE TYPE VIEWS


let entityAttributeView = (State, entity, attribute, isLocked ) => d([
  entityLabelWithPopup( State, attribute),
  State.DB.get(attribute, "attribute/isArray") 
    ? isLocked
      ? lockedMultipleValuesView( State, entity, attribute )
      : multipleValuesView( State, entity, attribute ) 
    : isLocked
      ? lockedSingleValueView( State, entity, attribute )
      : State.DB.get(attribute, "attribute/valueType") === 32 
        ? selectEntityView( State, entity, attribute )
        : State.DB.get(attribute, "attribute/valueType") === 5824 
          ? CSVuploadView( State, entity, attribute )
          : State.DB.get(attribute, "attribute/valueType") === 40 
            ? selectStaticOptionView( State, entity, attribute )
            : {
              "30": textInputView, //Tekst
              "31": numberInputView, //Tall
              "34": textAreaViewView, //Funksjonstekst
              "36": boolView, //Boolean
              "5721": dateInputView, //Dato
            }[ State.DB.get(attribute, "attribute/valueType") ]( State, entity, attribute ),
    isLocked ? d(""): entityVersionLabel( State, entity, attribute )
], ( State.DB.get(attribute, "attribute/isArray") || State.DB.get(attribute, "attribute/valueType") === 6534 ) ? {style: "margin: 5px;border: 1px solid #80808052;"} : {style:  gridColumnsStyle("3fr 3fr 1fr") + "margin: 5px;"} )

let entityVersionLabel = (State, entity, attribute) => d([
  d([
    d( "v" + State.DB.getEntityAttribute(entity, attribute).Datoms.length, {style: "padding: 3px;background-color: #46b3fb;color: white;margin: 5px;"} ),
    entityVersionPopup( State, entity, attribute )
  ], {class: "popupContainer"})
  ], {style:"display: inline-flex;"} )

let lockedValueView = (State, entity, attribute ) => State.DB.get(attribute, "attribute/isArray") ? lockedMultipleValuesView( State, entity, attribute ) : lockedSingleValueView( State, entity, attribute )
  
let lockedSingleValueView = (State, entity, attribute ) => isDefined( State.DB.get( entity, attribute ) )
  ? State.DB.get(attribute, "attribute/valueType") === 32
    ? State.DB.get( State.DB.get( entity, attribute ) , "entity/entityType") === 7948
      ? transactionLabel( State, State.DB.get( entity, attribute ) )
      : State.DB.get( State.DB.get( entity, attribute ) , "entity/entityType") === 7979
        ? actorLabel( State, State.DB.get( entity, attribute ) )
        : State.DB.get( State.DB.get( entity, attribute ) , "entity/entityType") === 7932
          ? nodeLabel( State, State.DB.get( entity, attribute ) )
          : State.DB.get( State.DB.get( entity, attribute ) , "entity/entityType") === 10062
            ? sourceDocumentLabel( State, State.DB.get( entity, attribute ) )
            : entityLabelWithPopup(State, State.DB.get( entity, attribute ) )


          
    : d( new Function(["storedValue"], State.DB.get(State.DB.get(attribute, "attribute/valueType"), "valueType/formatFunction") )( State.DB.get( entity, attribute )  ) , {style: isNumber(State.DB.get( entity, attribute )) ? `text-align: right;` : ""}  )
  : d("na.")

let lockedMultipleValuesView = (State, entity, attribute ) => isDefined( State.DB.get( entity, attribute ) )
? State.DB.get(attribute, "attribute/valueType") === 32
  ? State.DB.get( entity, attribute ).every( entry => State.DB.get(entry, 19) === 7948 )
    ?  d( State.DB.get( entity, attribute ).map( ent => transactionLabel( State, ent ) ) )
    : d( State.DB.get( entity, attribute ).map( ent => entityLabelWithPopup(State, ent ) ) )
  : d( new Function(["storedValue"], State.DB.get(State.DB.get(attribute, "attribute/valueType"), "valueType/formatFunction") )( State.DB.get( entity, attribute )  ), {style: isNumber(State.DB.get( entity, attribute )) ? `text-align: right;` : ""}  )
: d("na.")



let multipleValuesView = (State, entity, attribute) => {

  let valueType = State.DB.get(attribute, "attribute/valueType")

  let valueTypeViews = {
    "6613": argumentRowView,
    "6614": statementRowView,
    "32": refsView
  }

  let startValuesByType = {
    "6613": {"argument/name": "argumentNavn", "argument/valueType": 30},
    "6614": {"statement/statement": "console.log({Database, Entity})", "statement/isEnabled": true},
    "32": 6
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
            submitButton( "[ X ]", async e => updateState( State, {DB: await Transactor.updateEntity(State.DB, entity, attribute, State.DB.get(entity, attribute).filter( (Value, i) => i !== index  )  )} ) )
          ], {class: "columns_1_8_1", style: "margin: 5px;"} )) )
      : d("Ingen verdier"),
      submitButton( "[ + ]", async e => isArray( State.DB.get( entity, attribute) ) 
        ? updateState( State, {DB: await Transactor.updateEntity(State.DB, entity, attribute, State.DB.get(entity, attribute).concat(startValue)  )} )
        : updateState( State, {DB: await Transactor.updateEntity(State.DB, entity, attribute, [startValue]  )} )
      )

  ])

}

//Multiple valueType views

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


  updateState( State, {DB: await Transactor.updateEntity(State.DB, entity, attribute, newArray  )} )

}   ) : d("")

let moveDownButton = (State, entity, attribute, index) => index < State.DB.get(entity, attribute).length - 1 ? submitButton( "↓", async e => {
  let Values = State.DB.get(entity, attribute)
  let stillBefore = Values.filter( (Value, i) => i < index )
  let movedUp = Values[index + 1]
  let movedDown = Values[index]
  let stillAfter = Values.filter( (Value, i) => i > index +1 )
  let newArray = stillBefore.concat( movedUp ).concat( movedDown ).concat( stillAfter )
  updateState( State, {DB: await Transactor.updateEntity(State.DB, entity, attribute, newArray  )} )
}   ) : d("")


  
let argumentRowView = (State, entity, attribute, index) => {

  let valueType = State.DB.get(attribute, "attribute/valueType") //6613

  let Value = State.DB.get(entity, attribute)[index]

  return d([
    input( {value: Value["argument/name"] }, "change", async e => updateState( State, {DB: await Transactor.replaceValueEntry(State.DB, entity, attribute, index, mergerino( Value, {"argument/name": submitInputValue(e)}))} ) ),
    dropdown( Value["argument/valueType"], State.DB.getAll(44).map( e => returnObject({value: e, label: State.DB.get(e, "entity/label")}) ), async e => updateState( State, {DB: await Transactor.replaceValueEntry(State.DB, entity, attribute, index, mergerino( Value, {"argument/valueType": Number( submitInputValue(e) ) }))} )
    )
  ], {class: "columns_1_1"}) 

}

let statementRowView = ( State, entity, attribute, index) => {

  let valueType = State.DB.get(attribute, "attribute/valueType") // 6614

  let Value = State.DB.get( entity, attribute)[index]

  

  return d([
    checkBox( Value["statement/isEnabled"] , async e => updateState( State, {DB: await Transactor.replaceValueEntry(State.DB, entity, attribute, index, mergerino( Value, {"statement/isEnabled": Value["statement/isEnabled"] ? false : true  }))} )),


    textArea( Value["statement/statement"], {style: "margin: 1em;font: -webkit-control;"} , async e => updateState( State, {DB: await Transactor.replaceValueEntry(State.DB, entity, attribute, index, mergerino( Value, {"statement/statement": submitInputValue(e).replaceAll(`"`, `'`).replaceAll("/\r?\n|\r/", "")  }))}) )

  ], {class: "columns_1_9"}) 

}

let refsView = (State, entity, attribute, index) => {
  
  let storedValues = State.DB.get(entity,attribute)
  let storedValue = storedValues[index]
  let options = State.DB.getOptions( attribute )

  let datalistID = getNewElementID()
  return d([
    htmlElementObject("datalist", {id:datalistID}, optionsElement( options ) ),
    input({value: storedValue, list: datalistID, style: `text-align: right;`}, "change", async e => updateState( State, {DB: await Transactor.updateEntity(State.DB, entity, attribute, storedValues.slice(0, index ).concat( Number( submitInputValue( e ) ) ).concat( storedValues.slice(index + 1, storedValues.length ) ) ) }  ) ),
    entityLabelWithPopup( State,  storedValue ), 
    ])

}










//Single valueType views

let textInputView = ( State, entity, attribute ) => input( {value: State.DB.get( entity, attribute ), style: isDefined( State.DB.get( entity, attribute ) ) ? "" : "background-color: red;" }, "change", async e => updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, submitInputValue( e ) )} )  )
let dateInputView = ( State, entity, attribute ) => input( {value: moment( State.DB.get( entity, attribute ) ).format('DD/MM/YYYY'), style: isDefined( State.DB.get( entity, attribute ) ) ? "" : "background-color: red;" }, "change", async e => updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, Number( moment( submitInputValue( e ) , 'DD/MM/YYYY').format('x') ) )} )  )
let numberInputView = ( State, entity, attribute ) => input( {value: formatNumber( State.DB.get( entity, attribute ) ), style: isNumber( Number(State.DB.get( entity, attribute )) ) ? "text-align: right;" : "background-color: red;" }, "change", async e => updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, Number(submitInputValue( e ).replaceAll(' ', ''))  )} )  )
let textAreaViewView = ( State, entity, attribute ) => textArea( isString(State.DB.get( entity, attribute )) ? State.DB.get( entity, attribute ) : JSON.stringify(State.DB.get( entity, attribute )) , {class:"textArea_code"}, async e => updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, submitInputValue( e ).replaceAll(`"`, `'` ) ) } ) )
let boolView = ( State, entity, attribute ) => input( {value: State.DB.get( entity, attribute ) ? 'Sant' : 'Usant' }, "click", async e => updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, State.DB.get( entity, attribute ) === true ? false : true )} ) )
 
let selectStaticOptionView = ( State, entity, attribute )  => dropdown( State.DB.get( entity, attribute ), State.DB.getOptions( attribute ) , async e => updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, submitInputValue( e ) )} ) )

let selectEntityView = ( State, entity, attribute  ) => {

  let valueType = State.DB.get(attribute, "attribute/valueType")

  let currentSelection = State.DB.get( entity, attribute )
  let options = State.DB.getOptions( attribute )

  let datalistID = getNewElementID()
  return d([
    htmlElementObject("datalist", {id:datalistID}, optionsElement( options ) ),
    isDefined(currentSelection) 
      ? entityLabelWithPopup( State,  currentSelection ) 
      : d([d("[tom]", {class: "entityLabel", style: "display: inline-flex;background-color:#7b7b7b70;text-align: center;"})], {style:"display: inline-flex;"}),
    options.length > 0 
      ? input(
        {value: "", list: datalistID, style: `text-align: right;max-width: 50px;`}
        , "change", 
        async e => options.map( opt => opt.value ).includes( Number( e.srcElement.value ) ) 
          ? updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, Number( e.srcElement.value ) )} ) 
          : null 
        ) 
      : d("Ingen tilgjengelige alternativer"),
  ])
}




let CSVuploadView = ( State, entity, attribute  ) => {

  let valueType = State.DB.get(attribute, "attribute/valueType")


  let updateFunction = async e => Papa.parse( e.srcElement.files[0], {header: false, complete: async results => updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, results.data )} ) }) 
  
  
  
  return d([
    isArray( State.DB.get( entity, attribute ) ) ? d( "[Opplastet fil]" ) : d("Last opp fil"),
    input({type: "file", style: `text-align: right;`}, "change", updateFunction)
  ]) 
} 



//--------------