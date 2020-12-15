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

let actionButton = Action => Action.isActionable ? submitButton( Action.label, async e => update(  await Action.actionFunction()  ) ) : d( Action.label, {style: "background-color: gray;"} ) 



let gridColumnsStyle = rowSpecification =>  `display:grid; grid-template-columns: ${rowSpecification};`

//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------


// VALUE TYPE VIEWS

let fullDatomView = (Entity, attribute, isEditable) => {
  
  //TBD:
  //  Non-editable views
  //  Associated Views for calculatedValues (same as non-editable?)
  //  Implement time/versioning/changelog on datom and entity level (or value level?)
  //  Account balance value type?
  let valueType = Database.get(attribute, "attribute/valueType")
  let isArray = Database.get(attribute, "attribute/isArray")

  let isCalculatedField = Database.get(attribute, "entity/entityType") === 5817

  

  return d([
    entityLabel(attribute),
    valueView(Entity, attribute, isEditable)
  ], (isArray || valueType === 6534 ) ? {style: "margin: 5px;border: 1px solid #80808052;"} : {class: "columns_1_1", style: "margin: 5px;"} )  

}

let valueView = (Entity, attribute, isEditable) => {

  let valueType = Database.get(attribute, "attribute/valueType")
  let isArray = Database.get(attribute, "attribute/isArray")

  let isCalculatedField = Database.get(attribute, "entity/entityType") === 5817

  let valueTypeViews_single = {
    "30": singleTextView, //Tekst
    "31": singleNumberView, //Tall
    "34": functionTextView, //Funksjonstekst
    "36": booleanView, //Boolean
    "40": dropdownView, //Velg alternativ
    "32": singleEntityReferenceView,
    "5721": singleDateView, //Dato
    "38": undefined,
    "5824": fileView, //File
    "41": input_singleCompanyEntity, //Company entity
    "5849": undefined, //Konstruksjon av ny hendelse
    "6534": extendedFunctionView,
    "6553": accountBalanceRowView,
  }

  

  let selectedView = isArray
    ? multipleValuesView(Entity, attribute, isEditable)
    : valueTypeViews_single[valueType](Entity, attribute, isEditable)

  return selectedView
}

let multipleValuesView = (Entity, attribute, isEditable) => {

  let valueType = Database.get(attribute, "attribute/valueType")

  let valueTypeViews = {
    "30": multpleSimpleValuesRowView, //Tekst
    "31": multpleSimpleValuesRowView, //Tall
    "34": multpleSimpleValuesRowView, //Funksjonstekst
    "36": multpleSimpleValuesRowView, //Boolean
    "40": multpleSimpleValuesRowView, //Velg alternativ
    "32": multipleEntitiesReferenceRowView,
    "5721": multpleSimpleValuesRowView, //Dato
    "38": datomConstructorRowView,
    "6783": companyEntityConstructorRowView,
    "5824": fileView, //File
    "41": (Entity, attribute, index) => d(JSON.stringify(Entity.get(attribute)[index])), //Company entity
    "5849": eventConstructorsInProcessStepRowView, //Konstruksjon av ny hendelse
    "6553": accountBalanceRowView,
    "6613": argumentRowView,
    "6614": statementRowView,
  }

  let startValuesByType = {
    "30": ``, //Tekst
    "31": 0, //Tall
    "5721": Date.now(), //Dato
    "34": ``, //Funksjonstekst
    "36": false, //Boolean
    "40": 0, //Velg alternativ
    "32": 6,
    "38": {isNew: true, e: 1, attribute: 1001, value: `return ''` },
    "6783": {companyEntityType: 6780, attributeAssertions: {} },
    "5824": "", //File
    "41": 0, //Company entity
    "5849":  {6: "Ny handling", 5848: "return true;", 5850: "return Company.createEvent(5000, Process.entity);"}, //Konstruksjon av ny hendelse
    "6613": {"argument/name": "argumentNavn", "argument/valueType": 30},
    "6614": {"statement/statement": "console.log({Company, Process, Event})", "statement/isEnabled": true},
  }
  let startValue = Object.keys(startValuesByType).includes( String(valueType) ) ? startValuesByType[valueType] : ``

  return isEditable ? d([
    d([
      d( "#" ),
      d( "Verdi" ),
      d("")
    ], {class: "columns_1_8_1"}),
    isArray( Entity.get(attribute) )
      ?  d( Entity.get(attribute).map( (Value, index) => d([
            positionInArrayView(Entity, attribute, index),
            valueTypeViews[ valueType ](Entity, attribute, index),
            submitButton( "[ X ]", async e => update( await Entity.removeValueEntry( attribute,  index ) )  )
          ], {class: "columns_1_8_1", style: "margin: 5px;"} )) )
      : d("Ingen verdier"),
      submitButton( "[ + ]", async e => update( isArray( Entity.get(attribute) ) ? await Entity.addValueEntry( attribute,  startValue ) : await Entity.replaceValue( attribute,  [startValue] ) )  )
  ]) : ( valueType === 41 )
    ? d( Entity.get(attribute).map( (Value, index) => companyEntityLabel(ClientApp.getCompany(), Value) ))
    : d( Entity.get(attribute).map( (Value, index) => valueTypeViews[ valueType ](Entity, attribute, index) ))

}

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

//Simple single value views

let singleTextView = (Entity, attribute, isEditable) => isEditable 
  ? input( {value: Entity.get(attribute), style: isDefined(Entity.get(attribute)) ? "" : "background-color: red;" }, "change", async e => update( await Entity.replaceValue( attribute,  submitInputValue(e) ) )  ) 
  :  d( Entity.get(attribute) )

let singleNumberView = (Entity, attribute, isEditable) => isEditable
  ? input( {value: String( Entity.get(attribute) ), style: `text-align: right;` }, "change", async e => update( await Entity.replaceValue( attribute,  Number( submitInputValue(e) ) ) ) )
  : d( String( Entity.get(attribute) ), {style: `text-align: right;` } )

let singleDateView = (Entity, attribute, isEditable) => isEditable 
  ? input( {value: moment( Entity.get(attribute) ).format("DD/MM/YYYY"), style: `text-align: right;` }, "change", async e => update( await Entity.replaceValue( attribute,  Number( moment( submitInputValue(e) , "DD/MM/YYYY").format("x") ) ) ) )
  : d( moment( Entity.get(attribute) ).format("DD/MM/YYYY") )

let booleanView = (Entity, attribute, isEditable) => isEditable 
      ? isDefined(Entity.get(attribute))
        ? submitButton( Entity.get(attribute) ? "Sant" : "Usant", async e => update( await Entity.replaceValue( attribute,  Entity.get(attribute) ? false : true ) ) )
        : d("Verdi mangler", {style: "background-color: #ff36366b;" }, "click", async e => update( await Entity.replaceValue( attribute,  Entity.get(attribute) ? false : true ) ) )
    : d( Entity.get(attribute) ? "Sant" : "Usant" )
 
let functionTextView = (Entity, attribute, isEditable) => isEditable 
  ? Database.get(attribute, "attribute/isArray") ? d("[TBD]") : textArea( Entity.get(attribute), {class:"textArea_code"}, async e => update( await Entity.replaceValue( attribute,  submitInputValue(e).replaceAll(`"`, `'`) ) ) )
  : d( JSON.stringify(Entity.get(attribute)) )

let dropdownView = (Entity, attribute, isEditable) => isEditable 
  ? Database.get(attribute, "attribute/isArray") ? d("[TBD]") : dropdown( Entity.get( attribute ), Database.getOptions( attribute ), async e => update( await Entity.replaceValue( attribute,  submitInputValue(e) ) ))
  : d( JSON.stringify(Entity.get(attribute)) )
 
let fileView = (Entity, attribute, isEditable) => isEditable 
  ? Database.get(attribute, "attribute/isArray") ? d("[TBD]") : isArray(Database.get(Entity.entity, attribute))
      ? d( Database.get(Entity.entity, attribute).map( row => d(JSON.stringify(row)) ) )
      : input({type: "file", style: `text-align: right;`}, "change", e => {
            let file = e.srcElement.files[0]
            Papa.parse(file, {
              header: true,
              complete: async results => update( await Entity.replaceValue( attribute,  results.data ) ) 
            })
          }
        )
    : d( JSON.stringify(Entity.get(attribute)) )


let extendedFunctionView = (Entity, attribute, isEditable) => {

      let Value = isDefined(Entity.get(attribute)) ? Entity.get(attribute) : {name: "", arguments: [], statements: []}

      


      return d([
          d([
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
              /* dropdown("string", [
                {value: "string", label: "String"},
                {value: "number", label: "Number"},
                {value: "object", label: "Object"},
              ]), */
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
          ]),
      ])
    }


//Single value entity reference views

let singleEntityReferenceView = (Entity, attribute, isEditable) => isEditable
  ? d([ entityLabel( Entity.get(attribute) ), entitySearchBox(Entity, attribute, ent => async e => update( await Entity.replaceValue( attribute,  ent ) ), 1) ])
  : entityLabel(Entity.get(attribute))

let input_singleCompanyEntity = (Entity, attribute, isEditable) => isEditable
  ? dropdown( Entity.get( attribute ), ClientApp.getCompany()
    .getAll(6785) //To be fixed
    .map( companyEntity => returnObject({value: Company.get(companyEntity).datoms[0].event, label: Company.get(companyEntity, 1101)})  ).concat( {value: 0, label: 'Velg verdipapir'} ) , async e => update( await Entity.replaceValue(attribute, Number(submitInputValue(e))  ) ) )
  : companyEntityLabel(ClientApp.getCompany(), Entity.get( attribute ) )

//Multiple value views

let argumentRowView = (Entity, attribute, index) => {

  let valueType = Database.get(attribute, "attribute/valueType") //6613

  let Value = Entity.get(attribute)[index]

  return d([
    input( {value: Value["argument/name"] }, "change", async e => update( await Entity.replaceValueEntry( attribute,  index, mergerino( Value, {"argument/name": submitInputValue(e)})  ) ) ),
    dropdown( Value["argument/valueType"], Database.getAll(44).map( e => returnObject({value: e, label: Database.get(e, "entity/label")}) ), async e => update( await Entity.replaceValueEntry( attribute,  index, mergerino( Value, {"argument/valueType": Number( submitInputValue(e) ) }) ) ) )
  ], {class: "columns_1_1"}) 

}

let statementRowView = (Entity, attribute, index) => {

  let valueType = Database.get(attribute, "attribute/valueType") // 6614

  let Value = Entity.get(attribute)[index]

  

  return d([
    checkBox( Value["statement/isEnabled"] , async e => update( await Entity.replaceValueEntry( attribute,  index, mergerino( Value, {"statement/isEnabled": Value["statement/isEnabled"] ? false : true  }) ) ) ),


    textArea( Value["statement/statement"], {style: "margin: 1em;font: -webkit-control;"} , async e => update( await Entity.replaceValueEntry( attribute,  index, mergerino( Value, {"statement/statement": submitInputValue(e).replaceAll(`"`, `'`).replaceAll("/\r?\n|\r/", "")  }) ) ) )

  ], {class: "columns_1_9"}) 

}

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
    Entity.get(attribute)[index].isNew ? Entity.get(attribute)[index].e : 0, 
    [{value: 0, label: `Selskapets entitet`}, {value: 1, label: `Ny entitet nr. 1`}, {value: 2, label: `Ny entitet nr. 2`}, {value: 3, label: `Ny entitet nr. 3`}, {value: 4, label: `Ny entitet nr. 4`}, , {value: 5, label: `Ny entitet nr. 5`}],
    async e => update( await Entity.replaceValueEntry( attribute, index, mergerino( Entity.get(attribute)[index], {e: Number(submitInputValue(e)) === 0 ? 1 :  Number(submitInputValue(e)), isNew:  Number(submitInputValue(e)) > 0 } ) ) )
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

let companyEntityConstructorRowView = (Entity, attribute, index) => {

  let entityConstructor = Entity.get(attribute)[index]
  let companyEntityType = entityConstructor.companyEntityType


  return d([
    dropdown(
      companyEntityType, 
      Database.getAll(6778).map( e => returnObject({value: e, label: Database.get(e, "entity/label")}) ),
      async e => update( await Entity.replaceValueEntry( attribute, index, mergerino( entityConstructor, {companyEntityType: Number( submitInputValue(e) ), attributeAssertions: {}  } ) ) )
      ),
      br(),
      d([
        d( JSON.stringify( entityConstructor ) ),
        d( Database.get( companyEntityType , "companyEntityType/attributes").map(  attr => {
          let attributeAssertions = entityConstructor.attributeAssertions

          let attributeAssertion = attributeAssertions[ attr ]

          let isEnabled = isDefined(attributeAssertion) ? attributeAssertion.isEnabled : false
          let valueFunction = isDefined(attributeAssertion) ? attributeAssertion.valueFunction : ""

          let isEnabledUpdateFunction = async e =>  {
            let updatedAssertion = mergerino(attributeAssertion, {isEnabled: isEnabled ? false : true })
            update( await Entity.replaceValueEntry( attribute, index, mergerino( entityConstructor, {attributeAssertions: mergerino(attributeAssertions, {[attr]: updatedAssertion})  } ) ) )
          } 
          let valueFunctionUpdateFunction = async e => {

            let updatedAssertion = mergerino(attributeAssertion, {valueFunction: submitInputValue(e), isEnabled: true })

            update( await Entity.replaceValueEntry( attribute, index, mergerino( entityConstructor, {attributeAssertions: mergerino(attributeAssertions, {[attr]: updatedAssertion}) } ) ) )
          } 
  
  
  
          return d([
            checkBox( isEnabled , isEnabledUpdateFunction ),
            entityLabelWithPopup(attr),
            textArea(valueFunction, {class:"textArea_code"}, valueFunctionUpdateFunction )
          ], {style: gridColumnsStyle("1fr 3fr 6fr") })
        }  ) )
      ])
    
  ])
} 



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

let multipleEntitiesReferenceRowView = (Entity, attribute, index) => d([
  entityLabelWithPopup(Entity.get(attribute)[index]),
  entitySearchBox(Entity, attribute, selectedEntity => async e => update( await Entity.replaceValueEntry( attribute, index, selectedEntity ) ), index)
])

let eventConstructorsInProcessStepRowView = (Entity, attribute, index) => d([
  input( {value: Entity.get(attribute)[index][ 6 ], style: ``}, "change", async e => update( await Entity.replaceValueEntry(attribute, index, mergerino(Entity.get(attribute)[index], {6: submitInputValue(e) }) ) )  ),
  textArea( Entity.get(attribute)[index][5848], {class:"textArea_code"},  async e => update( await Entity.replaceValueEntry(attribute, index, mergerino(Entity.get(attribute)[index], {5848: submitInputValue(e).replaceAll(`"`, `'`)}) ) ) ),
  textArea( Entity.get(attribute)[index][5850],  {class:"textArea_code"},  async e => update( await Entity.replaceValueEntry(attribute, index, mergerino(Entity.get(attribute)[index], {5850: submitInputValue(e).replaceAll(`"`, `'`)}) ) )),
  submitButton("[Slett]", async e => update( await Entity.removeValueEntry(attribute, index ) ) )
], {class: "columns_1_3_3_1"})

let accountBalanceRowView = (Entity, attribute, index) => {

  let Account = Entity.get(attribute)[index]

  return d([
    entityLabel(Account.account),
    d( String(Account.amount) ),
  ], {class: "columns_1_1"})


}



//Basic entity views

let entityLabel = (entity, onClick) => d([
    d( `${ Database.get( entity ) ? Database.get( entity ).label : "na."}`, {class: "entityLabel", style: `background-color:${Database.get( entity ) ? Database.get( entity ).color : "gray" }`}, "click", isDefined(onClick) ? onClick : e => {
      AdminApp.updateState({selectedEntity: entity})
      ClientApp.updateState({selectedPage: "Admin"})
      update(  )
    }),
  ], {style:"display: inline-flex;"})


let entityLabelWithPopup = (entity, onClick) => d([
  d([
    entityLabel(entity, onClick),
    entityPopUp( entity ),
  ], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"} )

let entityPopUp = entity => d([
  d( `[${entity}] ${ Database.get( entity ) ? Database.get( entity ).label : "na."}` ),
  br(),
  d( "Entitet i databasen" ),
  //fullDatomView( Database.getEntity(entity), 6781, false ),
  d( "[ TBD ]" ),
  br(),
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})


//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------







// CLIENT PAGE VIEWS

let companyEntityInspectorPopup = (Company, companyEntity, t) => d([ companyEntityView(Company, companyEntity, t) ], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

let companyEntityLabel = (Company, companyEntity) => d([
    d( `${Database.get( Company.get(companyEntity, 6781), "entity/label")} # ${Company.entities.findIndex( e => e === companyEntity) + 1}`, {class: "entityLabel", style: `background-color:${Database.get( Company.get(companyEntity, 6781), "entityType/color")};`}, "click", e => update( ClientApp.updateState({selectedEntity: companyEntity}) ) ),
  ], {style:"display: inline-flex;"})

let companyEntityLabelWithPopup = (Company, companyEntity) => d([
  d([
    companyEntityLabel(Company, companyEntity),
    companyEntityPopUp( Company, companyEntity ),
  ], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"}) 


let companyEntityPopUp = (Company, companyEntity) => d([
  d( `${Database.get( Company.get(companyEntity, 6781), "entity/label")} # ${Company.entities.findIndex( e => e === companyEntity) + 1}` ),
  br(),
  d( "Entitet i selskapsdokumentet" ),
  br(),
  d( "[ TBD ]" ),
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})

let clientPage = Company => d([
  d([d('<header><h1>Holdingservice Beta</h1></header>'),d([submitButton("Bytt til admin", e => update( ClientApp.updateState({selectedPage: "Admin"}) ) )], {style: "display:flex;"} ),], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
  navBar(Company),
  d([
    d(""),
    isDefined( ClientApp.S.selectedEntity )
      ? isCompany( ClientApp.S.selectedEntity ) 
        ? companyView( Company )
        : isEvent( ClientApp.S.selectedEntity )
          ? eventView( Company )
          : isProcess( ClientApp.S.selectedEntity )
            ? processView( Company )
            : Database.get( ClientApp.S.selectedEntity, "entity/entityType" ) === 6781
                ? multipleCompanyEntitiesView( Company, ClientApp.S.selectedEntity )
                :  companyEntitiyPageView( Company )
      : companyView( Company )
  ], {class: "pageContainer"})
  
])

let multipleCompanyEntitiesView = (Company, entityType) => {

  let eventTypeAttributes = D.get( entityType,  6779)

  return d([
    d([
      d(""),
      d( eventTypeAttributes.map( attr => entityLabel(attr)  ), {style: `display:grid;grid-template-columns: repeat(${eventTypeAttributes.length}, 1fr);`} )
    ], {style: `display:grid;grid-template-columns: 1fr 7fr; margin: 5px;border: 1px solid #80808052;`}),
    entityLabel(entityType),
    d( Company.getAll(entityType).map( companyEntity => d([
      companyEntityLabelWithPopup(Company, companyEntity),
      d( eventTypeAttributes.map( attr => valueView(Company.get(companyEntity) , attr, false)   ), {style: `display:grid;grid-template-columns: repeat(${eventTypeAttributes.length}, 1fr);`} )
    ], {style: `display:grid;grid-template-columns: 1fr 7fr; margin: 5px;border: 1px solid #80808052;`}),
   ) )
  ],{class: "feedContainer"})
} 

let isEvent = entity => Database.get(entity).entityType === 46
let isProcess = entity => Database.get(entity).entityType === 5692
let isCompany = entity => Database.get(entity).entityType === 5722

let navBar = Company => d([
  entityLabelWithPopup( Company.entity, e => update(  ClientApp.updateState({selectedEntity: Company.entity}) )),
  isDefined( ClientApp.S.selectedEntity )
    ? isCompany( ClientApp.S.selectedEntity )
        ? d("")
        : isProcess( ClientApp.S.selectedEntity )
          ? d([
            span(" / "  ),
            entityLabelWithPopup( 5692 ),
            span(" / "  ),
            entityLabelWithPopup( ClientApp.S.selectedEntity  )
          ])
          : isEvent( ClientApp.S.selectedEntity )
            ? d([
              span(" / "  ),
              entityLabelWithPopup( 5692 ),
              span(" / "  ),
              entityLabelWithPopup( Company.getEvent( ClientApp.S.selectedEntity ).get( "event/process" )  ),
              span(" / "  ),
              entityLabelWithPopup( 46 ),
              span(" / "  ),
              entityLabelWithPopup( ClientApp.S.selectedEntity  )
            ])
            : Database.get( ClientApp.S.selectedEntity, "entity/entityType" ) === 6781
              ? d([
                span(" / "  ),
                entityLabelWithPopup( ClientApp.S.selectedEntity, e => update( ClientApp.updateState({selectedEntity: ClientApp.S.selectedEntity }) ) ),
              ])
              : d([
                span(" / "  ),
                entityLabelWithPopup( Company.get( ClientApp.S.selectedEntity, 6781 ), e => update( ClientApp.updateState({selectedEntity: Company.get( ClientApp.S.selectedEntity, 6781 ) }) ) ),
                span(" / "  ),
                companyEntityLabelWithPopup( Company, ClientApp.S.selectedEntity )
              ])
    : d("")
], {style: "display: flex;"})

let companyView = Company => d([
    br(),
    processesTimelineView( Company ),
    br(),
    companyActionsView( Company ),
    //br(),
    //balanceSheetView( Company ),
    br(),
    d([
      h3("Selskapets saldobalanse"),
      fullDatomView(Company.get(1), 6212),
    ], {class: "feedContainer"}),
    br(),
    d([
      h3("Selskapets entiteter"),
      d( Database.getAll(6778).map( entityType => d([
        entityLabelWithPopup(entityType  ),
        d( Company.getAll(entityType).map( companyEntity => companyEntityLabelWithPopup(Company, companyEntity) ) ),
        br()
      ])))
    ], {class: "feedContainer"}),
  ])

let companyActionsView = Company => d([
  h3("Handlinger på selskapsnivå"),
  d( Company.getActions().map(  actionEntity => entityLabelWithPopup( actionEntity, async e => update( await Company.executeActionFromCompanyLevel( actionEntity ) ) ) ), {style: "display: flex;"})
], {class: "feedContainer"}) 
  

let balanceSheetView = Company => d([
      h3("Balanse"),
      d([
        d([
          h3("Eiendeler"),
          d("Anleggsmidler"),
          fullDatomView(Company.get(1), 6238),
          fullDatomView(Company.get(1), 6241),
          fullDatomView(Company.get(1), 6253),
          d( Company.getAll(5812).map( security => companyEntityLabelWithPopup(Company, security))   ),
          fullDatomView(Company.get(1), 6254),
          fullDatomView(Company.get(1), 6255),
          fullDatomView(Company.get(1), 6256),
          fullDatomView(Company.get(1), 6260),
          fullDatomView(Company.get(1), 6262),
          fullDatomView(Company.get(1), 6270),
          fullDatomView(Company.get(1), 6240),
          fullDatomView(Company.get(1), 6275),
          fullDatomView(Company.get(1), 6277),
          fullDatomView(Company.get(1), 6279),
          fullDatomView(Company.get(1), 6286),
          br(),

          d("Omløpsmidler"),
          fullDatomView(Company.get(1), 6248),
          fullDatomView(Company.get(1), 6274),
          fullDatomView(Company.get(1), 6276),

          fullDatomView(Company.get(1), 6287),

          br(),
          fullDatomView(Company.get(1), 6288),
          br(),
        ], {style: "margin: 5px;border: 1px solid #80808052;"}),
        d([
          h3("Gjeld og egenkapital"),
          d("Egenkapital"),
          fullDatomView(Company.get(1), 6237),
          fullDatomView(Company.get(1), 6246),
          fullDatomView(Company.get(1), 6278),
          fullDatomView(Company.get(1), 6281),
          fullDatomView(Company.get(1), 6295),
          br(),
          d("Gjeld"),
          fullDatomView(Company.get(1), 6247),
          fullDatomView(Company.get(1), 6259),
          fullDatomView(Company.get(1), 6280),
          fullDatomView(Company.get(1), 6257),
          fullDatomView(Company.get(1), 6258),
          fullDatomView(Company.get(1), 6264),
          d( Company.getAll(5811).map( loan => companyEntityLabelWithPopup(Company, loan))   ),
          fullDatomView(Company.get(1), 6269),
          fullDatomView(Company.get(1), 6272),
          fullDatomView(Company.get(1), 6273),
          fullDatomView(Company.get(1), 6275),
          fullDatomView(Company.get(1), 6294),
          br(),
          fullDatomView(Company.get(1), 6296),
        ], {style: "margin: 5px;border: 1px solid #80808052;"}),
      ], {class: "columns_1_1"})
  ], {class: "feedContainer"})


let companyEntityView = (Company, companyEntity ) => d([
  companyEntityLabel(Company, companyEntity),
  d("<br>"),
  d(`Etter hendelse ${Company.t} (${moment( Company.getEvent( Company.events[ Company.t - 1 ] ).get( "event/date" )).format("DD/MM/YYYY")})`),
  d("<br>"),

  d( Company.companyDatoms.filter( companyDatom => companyDatom.entity === companyEntity  ).map( companyDatom => fullDatomView( Company.get( companyDatom.entity ), companyDatom.attribute, false  ) )),
  

  //d( Database.get( Company.get(companyEntity, 19 ), "entityType/attributes" ).map( attribute => fullDatomView( Company.get( companyEntity ), attribute, false  ) )),
  d( Database.get( Company.get( companyEntity , 6781 ), "companyEntityType/calculatedFields" ).map( companyCalculatedField => fullDatomView( Company.get( companyEntity ), companyCalculatedField, false  ) ) )
], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})


let timelineHeaderView = () => d([
  d( `${2018}`, {class: "entityLabel", style: `background-color: black;color: white;`}),
  d( ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"].map( month => d(month)  ), {style: `display:grid;grid-template-columns: repeat(${12}, 1fr);background-color: #8080802b;margin: 5px;`} ),
], {style: `display:grid;grid-template-columns: 4fr 12fr 1fr;`})

let processView = Company => d([
  d([
    entityLabel(5692),
    entityLabelWithPopup(ClientApp.S.selectedEntity, e => update( ClientApp.updateState({selectedEntity: ClientApp.S.selectedEntity}) )),
  ], {class: "columns_1_1"}),
  d([
    entityLabel(5687),
    entityLabel( Company.getProcess( ClientApp.S.selectedEntity ).get("process/processType") )
  ], {class: "columns_1_1"}),
  br(),
  timelineHeaderView(),
  processTimelineView(Company, ClientApp.S.selectedEntity ),
  br(),
  processProgressView(Company, ClientApp.S.selectedEntity),
  //br(),
  processActionsView(Company,  ClientApp.S.selectedEntity ),
],{class: "feedContainer"})

let processesTimelineView = Company => d([
  h3("Selskapets prosesser"),
  timelineHeaderView(),
  d( Company.processes.map( process => processTimelineView(Company, process) ) ), 
], {class: "feedContainer"})


let processTimelineView = (Company, process) => {

  let Process = Company.getProcess( process )

  

  let processEventsTimes = Process.events.map( event => Company.getEvent(event).t )


  return d([
    entityLabelWithPopup(process, e => update( ClientApp.updateState({selectedEntity: process}) )),
    d( Company.events.map( (event, i) => ((i+1) < processEventsTimes[0] || (i+1) > processEventsTimes.slice( -1 )[0])
    ? d(" ")
    : Company.getProcess(process).events.includes(event)
      ? d([
          d([
              d( `●`, {style: `color:${ Company.getEvent(event).isValid ? "green" : "red"}; ${event === ClientApp.S.selectedEntity ? "border: 1px solid black;background-color: gray;" : "" } `} ),
              entityPopUp( event ),
            ], {class: "popupContainer", style:"display: inline-flex;"}, "click", e => update(  ClientApp.updateState({selectedEntity: event}) ))
        ], {style:"display: inline-flex;"} )
      : d("-" ) ), {style: `display:grid;grid-template-columns: repeat(${Company.events.length}, 1fr);background-color: #8080802b;margin: 5px;`} ),
    d( Company.getProcess( process ).isValid() ? "✓" : "WIP" )
  ], {style: `display:grid;grid-template-columns: 4fr 12fr 1fr;`})
}

let processProgressView = (Company, process) => d([
  h3( "Kriterier for ferdigstilling av prosess" ),
  d( Company.getProcess( process ).getCriteria().map( criterium => d([
    entityLabel(criterium.criterium),
    d(criterium.isComplete ? "✓" : "✖", {style: `background-color: ${criterium.isComplete? "green" : "#f5a1a170"} ;`})
  ], {class: "columns_1_1"})  )),
  br(),
  d([
    d("Prosessens status"),
    d( Company.getProcess( process ).isValid() ? "Ferdig" : "I arbeid" )
  ], {class: "columns_1_1"})
], {class: "feedContainer"})

let processActionsView = (Company, process) => d([
  h3( "Handlinger på prosessnivå" ),
  d( Company.getProcess( process ).getActions().map( globalFunction =>  entityLabelWithPopup(globalFunction, async e => await Company.getProcess( process ).executeAction(globalFunction) )  ) )
], {class: "feedContainer"})

let companyEntitiyPageView = Company => d([
  submitButton(" <- Tilbake ", e => update( ClientApp.updateState({selectedEntity: Company.entity }) ) ),
  br(),
  companyEntityView(Company, ClientApp.S.selectedEntity )
  ])

let eventView =  Company => {

  let Event = Company.getEvent( ClientApp.S.selectedEntity )

  return d([
    submitButton(" <- Tilbake ", e => update( ClientApp.updateState({selectedEntity: Company.entity }) ) ),
    br(),
    d([
      h3( "Prosess" ),
      processTimelineView(Company, Event.process )
    ], {class: "feedContainer"}),
    br(),
    d([
      h3( "Hendelse" ),
      d([
        entityLabel(46),
        entityLabelWithPopup(ClientApp.S.selectedEntity, e => update( ClientApp.updateState({selectedEntity: ClientApp.S.selectedEntity}) )),
      ], {class: "columns_1_1"}),
      d([
        entityLabel(43),
        entityLabel( Event.get("event/eventTypeEntity") )
      ], {class: "columns_1_1"}),
      br(),
      d( Database.get(Event.get("event/eventTypeEntity"), "eventType/eventAttributes").map( attribute =>  fullDatomView( Event , attribute, true )  )),
      
      eventActionsView(Company, ClientApp.S.selectedEntity ),
      //br(),
      
    ], {class: "feedContainer"} ),
    br(),
    d([
      h3("Output fra hendelsen:"),
      d(Company.getEvent( ClientApp.S.selectedEntity ).entities.map( companyEntity => companyEntityView( Company, companyEntity ) )),
    ], {class: "feedContainer"} )
  ])
} 

let eventActionsView = (Company, event) => d([
      h3("Handlinger på hendelsesnivå"),
      d( Company.getEvent( event ).getActions().map( globalFunction =>  entityLabelWithPopup(globalFunction, async e => await Company.getEvent( event ).executeAction(globalFunction) )  ) )
  ], {class: "feedContainer"})  

//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------



// ADMIN PAGE VIEWS

let adminPage = () => d([
  d([d('<header><h1>Holdingservice Admin</h1></header>'),d([submitButton("Bytt til klient", e => update( ClientApp.updateState({selectedPage: "Prosesser"}) ) )], {style: "display:flex;"} )], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
  d([
    entityLabelWithPopup( 47 ),
    span(" / "  ),
    isDefined(AdminApp.S.selectedEntity)
      ? entityLabelWithPopup( Database.get(AdminApp.S.selectedEntity).entityType   )
      : span(" ... "),
    span(" / "  ),
    isDefined(AdminApp.S.selectedEntity)
      ? entityLabelWithPopup( AdminApp.S.selectedEntity   )
      : span("Ingen entitet valgt.")
  ], {style: "padding: 1em;"}),

  d([
    d(""),
    Database.get( AdminApp.S.selectedEntity, "entity/entityType" ) === 47
      ? d([
        multipleEntitiesView( AdminApp.S.selectedEntity ),
        br(),
        adminEntityView( AdminApp.S.selectedEntity )
      ]) 
      : adminEntityView( AdminApp.S.selectedEntity )
  ], {class: "pageContainer"})

])

let multipleEntitiesView = entityType => d([
  entityLabel(entityType),
  d( Database.getAll( entityType   ).map( entity => Database.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).map( category => d([
    h3(category),
    d( Database.getAll(entityType).filter( e => Database.get(e, "entity/category") === category ).map( entity => entityLabel(entity) ) ),
  ])  ) )
],{class: "feedContainer"})

let adminEntityView = entity => {

  let Entity = Database.getEntity(entity)
  let attributes = Database.get(Entity.entityType, "entityType/attributes", Entity.tx)

  return Database.isEntity(entity)
  ? Entity.isLocked
    ? d("Entity is locked")
    : d([
        d([
          d([span( `Entitet`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`})], {style:"display: inline-flex;"}),
          entityLabelWithPopup(entity),
        ], {class: "columns_1_1"}),
        versionView(entity),
        d( attributes.map( attribute => fullDatomView( Entity, attribute, true ) )),
        br(),
        h3("Tillatte handlinger på entitetsnivå"),
        d( Entity.Actions.map( Action => actionButton(Action) ) ),
      ], {class: "feedContainer"} )
  : d("Ingen entitet valgt.", {class: "feedContainer"})
    
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


//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------





//ARCHIVE


let entityRedlinedValue = (value, prevValue) => d( [
  span( `${JSON.stringify(prevValue)}`, "", {class: "redlineText"}),
  span( `${JSON.stringify(value)}`),
], {style:"display: inline-flex;justify-content: flex-end;"} ) 