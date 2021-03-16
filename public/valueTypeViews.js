//UTILITIES
//let createObject = (keyName, value) => Object.assign({}, {[keyName]: value} ) 
let returnObject = something => something // a -> a
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
let dropdown = (value, optionObjects, updateFunction) => htmlElementObject("select", {id: getNewElementID(), style:"padding: 0.5em;border: 1px solid lightgray; max-width: 300px;"}, optionObjects.map( o => `<option value="${o.value}" ${o.value === value ? `selected="selected"` : ""}>${o.label}</option>` ).join(''), "change", e => {
  let dropdown = document.getElementById(e.srcElement.id)
  dropdown.style = "background-color: darkgray;"
  updateFunction(e)
}   )

let button = (label, attributesObject ,action) => htmlElementObject("button", attributesObject, label , "click", action )


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

// VALUE TYPE VIEWS



let temporalEntityAttributeView = (State, entity, calculatedField, eventIndex ) => d([
  entityLabelWithPopup( State, calculatedField ),
  d(`(pr. 📅#${ isDefined( eventIndex ) ? eventIndex : State.DB.get( State.S.selectedCompany, 12385 ) })`),
  temporalValueView( State, entity, calculatedField, eventIndex )
], {style:  gridColumnsStyle("2fr 1fr 3fr 1fr") + "margin: 5px;"} )


let temporalValueView = (State, entity, calculatedField, eventIndex ) => d([
  State.DB.get( calculatedField, 18 ) === 32
  ? State.DB.get( calculatedField, "attribute/isArray" )
    ? d( State.DB.get( entity, calculatedField )( eventIndex   ).map( event => State.DB.get(event, 19) === 10062 ? tinyEventLabel( State, event ) : entityLabelWithPopup(State, event) ) )
    : entityLabelWithPopup(State, State.DB.get( entity, calculatedField )( eventIndex   ) )
  : State.DB.get( calculatedField, 18 ) === 31
    ? d( formatNumber( State.DB.get( entity, calculatedField )( eventIndex   ) ), {style: `text-align: right;`} )
    : d( State.DB.get( entity, calculatedField )( eventIndex   ) ),
], {style: "display: contents;"})


//-----------


let entityAttributeView = ( State, entity, attribute, isLocked ) => { try {return backupValidEntityAttributeView( State, entity, attribute, isLocked ) } catch (error) { return entityAttributeErrorView( State,  entity, attribute, error ) } } 


let validEntityAttributeView = (State, entity, attribute, isLocked ) => d([
  d( State.DB.get( attribute, 6 ), {style: "font-weight: bold;"} ),
  d([
    valueView( State, entity, attribute, isLocked )
  ], {style: "padding: 0.5em;" })  
], {style: "padding:0.5em;"} )


let backupValidEntityAttributeView = (State, entity, attribute, isLocked ) => d([
  entityLabel( State, attribute ),
  valueView( State, entity, attribute, isLocked ),
  isLocked ? d(""): entityVersionLabel( State, entity, attribute )
], ( State.DB.get(attribute, "attribute/isArray") || State.DB.get(attribute, "attribute/valueType") === 6534 ) ? {style: "margin: 5px;border: 1px solid #80808052;"} : {style:  gridColumnsStyle("3fr 3fr 1fr") + "margin: 5px;"} )


let valueView = (State, entity, attribute, isLocked ) => State.DB.get(attribute, "attribute/isArray") 
  ? multipleValuesView( State, entity, attribute, isLocked )
  : singleValueView( State, entity, attribute, isLocked )


let entityAttributeErrorView = (State, entity, attribute, error ) => d([
  entityLabel( State, attribute),
  d(`ERROR: entity: ${entity}, attribute: ${attribute} `),
  d(error)
], {style:  gridColumnsStyle("3fr 3fr 1fr") + "margin: 5px;"} )


let entityVersionLabel = (State, entity, attribute) => d([
  d([
    d( "v" + State.DB.getEntityAttributeDatoms(entity, State.DB.attrName( attribute )  ).length, {style: "padding: 3px;background-color: #46b3fb;color: white;margin: 5px;"} ),
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
        submitButton( "Gjenopprett", async e => updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, Datom.attribute, Datom.value )} )
        )
      ], {style: gridColumnsStyle("2fr 2fr 1fr")})   ) )
    ], {class: "entityInspectorPopup", style: "width: 400px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
}

//Html elements

let textInput = (value, styleString, updateFunction) => input( {value, style: styleString}, "change", updateFunction )
let numberInput = (value, updateFunction) => input( {value: isNumber(value) ? formatNumber( value, value === Math.round(value) ? 0 : 2 ) : "", style: isNumber( value ) ? "text-align: right;" : "border: 1px solid red;"}, "change", updateFunction )
let dateInput = (value, updateFunction) => input( {value: isNumber(value) ? moment( value ).format('DD/MM/YYYY') : "", style:isNumber(value) ? "text-align: right;" : "text-align: right;border: 1px solid red;" }, "change", updateFunction )

//Single valueType views

let singleValueView = ( State, entity, attribute, isLocked ) => isLocked && isUndefined( State.DB.get( entity, attribute ) )
  ? d("na.")
  : returnObject({
  "30": textInputView, //Tekst
  "31": numberInputView, //Tall
  "32": State.S.selectedPage === 10025 ? selectEntityView : selectEntityWithDropdownView,
  "34": textAreaViewView,
  "36": boolView,
  "40": selectStaticOptionView,
  "5721": dateInputView, 
  "5824": CSVuploadView, 
  /* "6534": , 
  "6613": , 
  "6614": ,  */
  "11469": sourceDocumentFileuploadView, 
  //"12831": , 
  "12865": htmlStringView
  })[ State.DB.get(attribute, "attribute/valueType") ]( State, entity, attribute, isLocked )





let htmlStringView = ( State, entity, attribute, isLocked ) => d( State.DB.get( entity, attribute ) )

let textInputView = ( State, entity, attribute, isLocked ) => isLocked === true
  ? d( String( State.DB.get( entity, attribute ) ) )
  : textInput( isString( State.DB.get( entity, attribute ) ) ? State.DB.get( entity, attribute ) : ""  , isDefined( State.DB.get( entity, attribute ) ) ? "" : "border: 1px solid red;", async e => updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, submitInputValue( e ) )} ) )

let dateInputView = ( State, entity, attribute, isLocked ) => isLocked === true
  ? d( moment( State.DB.get( entity, attribute ) ).format('DD/MM/YYYY') , {style: `text-align: right;`}  )
  : dateInput( State.DB.get( entity, attribute ), async e => updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, Number( moment( submitInputValue( e ) , 'DD/MM/YYYY').format('x') ) )} ) )

let numberInputView = ( State, entity, attribute, isLocked ) => isLocked === true
  ? d( formatNumber( State.DB.get( entity, attribute ), 2 ) , {style: `text-align: right;`}  )
  : numberInput( State.DB.get( entity, attribute ), async e => updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, Number(submitInputValue( e ).replaceAll(' ', '').replaceAll(',', '.')  )  )} )   )

let textAreaViewView = ( State, entity, attribute, isLocked ) => isLocked === true
  ? d( String( State.DB.get( entity, attribute ) ) )
  : textArea( isString(State.DB.get( entity, attribute )) ? State.DB.get( entity, attribute ) : JSON.stringify(State.DB.get( entity, attribute )) , {class:"textArea_code"}, async e => updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, submitInputValue( e ).replaceAll(`"`, `'` ) ) } ) )

let boolView = ( State, entity, attribute, isLocked ) => isLocked === true
  ? input( mergerino( {type: "checkbox", disabled: "disabled"}, State.DB.get(entity, attribute) === true ? {checked: "checked"} : {} ))
  : checkBox( State.DB.get( entity, attribute ) === true, async e => updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, State.DB.get( entity, attribute ) === true ? false : true )} )   )
 
let selectStaticOptionView = ( State, entity, attribute, isLocked )  => {

  let options = State.DB.get( State.DB.get( State.DB.get( attribute, 12833 ), 19 ) === 9815 ? entity : null, State.DB.get( attribute, 12833 ) )
  let optionObjects = [{value: 0, label:"Velg alternativ"}].concat( options.map( entity => returnObject({value: entity, label: getEntityLabel( State.DB, entity ) })  ) )

  return  isLocked === true
  ? d( String( State.DB.get( entity, attribute ) ) )
  : dropdown( 
    isDefined( State.DB.get( entity, attribute ) ) 
      ? State.DB.get( entity, attribute ) 
      : 0 , 
    isDefined( State.DB.get( entity, attribute ) ) 
      ? optionObjects
      : [{value: 0, label:"Velg alternativ"}].concat( optionObjects ), 
    async e => optionObjects.map( optionObject => optionObject.value ).includes( Number( e.srcElement.value )  ) 
      ? updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, Number( submitInputValue( e ) ) )} ) 
      : log({ERROR: "Selected option not is list of allowed options"}) 
    )
} 

let selectEntityView = ( State, entity, attribute, isLocked ) => {

  if( isLocked === true ){ return entityLabel(State, State.DB.get( entity, attribute ) ) }

  let currentSelection = State.DB.get( entity, attribute )
  let options = State.DB.get( State.DB.get( State.DB.get( attribute, 12833 ), 19 ) === 9815 ? entity : null, State.DB.get( attribute, 12833 ) )
  let optionObjects = [{value: 0, label:"Velg alternativ"}].concat( options.map( entity => returnObject({value: entity, label: getEntityLabel( State.DB, entity ) })  ) )

  let datalistID = getNewElementID()
  return d([
    htmlElementObject("datalist", {id:datalistID}, optionsElement( optionObjects ) ),
    isDefined(currentSelection) 
      ? entityLabelWithPopup( State,  currentSelection ) 
      : d([d("[tom]", {class: "entityLabel", style: "display: inline-flex;background-color:#7b7b7b70;text-align: center;"})], {style:"display: inline-flex;"}),
      optionObjects.length > 0 
      ? input(
        {value: "", list: datalistID, style: `text-align: right;max-width: 50px;`}
        , "change", 
        async e => optionObjects.map( opt => opt.value ).includes( Number( e.srcElement.value ) ) 
          ? updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, Number( e.srcElement.value ) )} ) 
          : null 
        ) 
      : d("Ingen tilgjengelige alternativer"),
  ])
}

let selectEntityWithDropdownView = ( State, entity, attribute, isLocked ) => {

  if( isLocked === true ){ return entityLabel(State, State.DB.get( entity, attribute ) ) }

  let options = State.DB.get( State.DB.get( State.DB.get( attribute, 12833 ), 19 ) === 9815 ? entity : null, State.DB.get( attribute, 12833 ) )
  let optionObjects = [{value: 0, label:"Velg alternativ"}].concat( options.map( entity => returnObject({value: entity, label: getEntityLabel( State.DB, entity ) })  ) )

  return State.DB.isEntity( State.DB.get( entity, attribute ) ) 
    ? d([
      entityLabelWithPopup( State, State.DB.get( entity, attribute ) ),
      submitButton("X", async () => updateState( State, {DB: await Transactor.updateEntity(State.DB, entity, attribute, State.DB.get( entity, attribute ), false ) } ) )
    ], {style: gridColumnsStyle("5fr 1fr") })
    : d([
      dropdown( 
        State.DB.get( entity, attribute ) , 
        optionObjects,
        async e => optionObjects.map( optionObject => optionObject.value ).includes( Number( e.srcElement.value )  ) 
          ? updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, Number( submitInputValue( e ) ) )} ) 
          : log({ERROR: "Selected option not is list of allowed options"}) 
        )
    ], {style: "border: 1px solid red;"} ) 
} 

let sourceDocumentFileuploadView = ( State, entity, attribute, isLocked ) => isLocked === true
  ? d( `<a href="${State.DB.get(entity, attribute)}" target="_blank"> Last ned fil </a> `)
  : isDefined(State.DB.get(entity, attribute)) && State.DB.get(entity, attribute) !== ""
    ? d([
        d( `<a href="${State.DB.get(entity, attribute)}" target="_blank"> Last ned fil </a> `),
        submitButton( "Slett", async e => updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, "" )} ) )
    ]) 
    : input({type: "file", name:"upload-test"}, "change", async e => {
      let file = e.srcElement.files[0]
      const formData = new FormData();
      formData.append("file", file);
      let APIendpoint = `https://holdingservice.appspot.com/api/upload`
      let authToken = await sideEffects.auth0.getTokenSilently()
      let headers = {'Authorization': 'Bearer ' + authToken}
      let response = await fetch(APIendpoint, {method: "POST", headers, body: formData })
      let parsedResponse = await response.json()
      console.log(`Uploaded file. Adding link to entity..`, {parsedResponse})
      updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, parsedResponse.url )} )
    })

let CSVuploadView = ( State, entity, attribute, isLocked ) => isLocked === true
  ? isArray( State.DB.get( entity, attribute ) )
    ? d(`📄 CSV-fil med ${ State.DB.get( entity, 12627 ) } transaksjoner.`)
    : d("Ingen fil lastet opp.")
  : isArray( State.DB.get( entity, attribute ) )
    ? d([
        d(`📄 CSV-fil med ${ State.DB.get( entity, 12627 ) } transaksjoner.`),
        submitButton( "X", async e => updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, State.DB.get( entity, attribute ), false )} )  )
      ], {style: gridColumnsStyle("5fr 1fr")}) 
    : input({type: "file", style: `text-align: right;`}, "change",  async e => Papa.parse( e.srcElement.files[0], {header: false, complete: async results => updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, results.data )} ) })  )


//Multiple valueType views

let multipleValuesView = (State, entity, attribute, isLocked) => {

  if( isLocked === true ){

    return isDefined( State.DB.get( entity, attribute ) )
      ? State.DB.get(attribute, "attribute/valueType") === 32
        ? d( State.DB.get( entity, attribute ).map( ent => entityLabel(State, ent, () => State.Actions.selectEntity(  ent, State.DB.get( State.DB.get( ent, "entity/entityType"), 7930) ) ) ) )
        : d( State.DB.get( entity, attribute ).map( entry => d( JSON.stringify(entry) ) )  )
      : d("na.")

  }

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
    ], {style: gridColumnsStyle("1fr 8fr 1fr")}),
    isArray( Value )
      ?  d( State.DB.get(entity, attribute).map( (Value, index) => d([
            positionInArrayView(State, entity, attribute, index),
            valueTypeViews[ valueType ](State, entity, attribute, index),
            submitButton( "[ X ]", async e => updateState( State, {DB: await Transactor.updateEntity(State.DB, entity, attribute, State.DB.get(entity, attribute).filter( (Value, i) => i !== index  )  )} ) )
          ], {style: gridColumnsStyle("1fr 8fr 1fr") + "margin: 5px;"} )) )
      : d("Ingen verdier"),
      submitButton( "[ + ]", async e => isArray( State.DB.get( entity, attribute) ) 
        ? updateState( State, {DB: await Transactor.updateEntity(State.DB, entity, attribute, State.DB.get(entity, attribute).concat(startValue)  )} )
        : updateState( State, {DB: await Transactor.updateEntity(State.DB, entity, attribute, [startValue]  )} )
      )

  ])

}

let positionInArrayView = (State, entity, attribute, index) => d([
  d( String(index) ),
  moveUpButton(State, entity, attribute, index),
  moveDownButton(State, entity, attribute, index)
], {style: gridColumnsStyle("1fr 1fr 1fr") })

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
  ], {style: gridColumnsStyle("1fr 1fr")}) 

}

let statementRowView = ( State, entity, attribute, index) => {

  let valueType = State.DB.get(attribute, "attribute/valueType") // 6614

  let Value = State.DB.get( entity, attribute)[index]

  

  return d([
    checkBox( Value["statement/isEnabled"] , async e => updateState( State, {DB: await Transactor.replaceValueEntry(State.DB, entity, attribute, index, mergerino( Value, {"statement/isEnabled": Value["statement/isEnabled"] ? false : true  }))} )),


    textArea( Value["statement/statement"], {style: "margin: 1em;font: -webkit-control;width: -webkit-fill-available;"} , async e => updateState( State, {DB: await Transactor.replaceValueEntry(State.DB, entity, attribute, index, mergerino( Value, {"statement/statement": submitInputValue(e).replaceAll(`"`, `'`).replaceAll("/\r?\n|\r/", "")  }))}) )

  ], {class: gridColumnsStyle("1fr 9fr")}) 

}

let refsView = (State, entity, attribute, index) => {
  
  let storedValues = State.DB.get(entity,attribute)
  let storedValue = storedValues[index]

  let options = State.DB.get( State.DB.get( State.DB.get( attribute, 12833 ), 19 ) === 9815 ? entity : null, State.DB.get( attribute, 12833 ) )
  let optionObjects = [{value: 0, label:"Velg alternativ"}].concat( options.map( entity => returnObject({value: entity, label: getEntityLabel( State.DB, entity ) })  ) )

  let datalistID = getNewElementID()
  return d([
    htmlElementObject("datalist", {id:datalistID}, optionsElement( optionObjects ) ),
    input({value: storedValue, list: datalistID, style: `text-align: right;`}, "change", async e => updateState( State, {DB: await Transactor.updateEntity(State.DB, entity, attribute, storedValues.slice(0, index ).concat( Number( submitInputValue( e ) ) ).concat( storedValues.slice(index + 1, storedValues.length ) ) ) }  ) ),
    entityLabelWithPopup( State,  storedValue ), 
    ])

}

