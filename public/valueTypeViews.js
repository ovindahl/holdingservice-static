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




let gridColumnsStyle = rowSpecification =>  `display:grid; grid-template-columns: ${rowSpecification};`




//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------

//Basic entity views

let entityLabel = (entity, onClick) => d([
  d( `${ Database.get( entity ) ? Database.get( entity ).label() : "na."}`, {class: "entityLabel", style: `background-color:${Database.get( entity ) ? Database.get( entity ).color : "gray" }`}, "click", isDefined(onClick) ? onClick : e => {
    AdminApp.updateState({selectedEntity: entity})
    AdminApp.update()
  }),
], {style:"display: inline-flex;"})


let entityLabelWithPopup = (entity, onClick) => d([
d([
  entityLabel(entity, onClick),
  entityPopUp( entity ),
], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"} )

let entityPopUp = entity => d([
d([
  entityLabel( 6 ),
  d( Database.get( entity ) ? Database.get( entity ).label() : "na." ),
], {class: "columns_1_1"}),
d([
  d([span( `Entitet`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`})], {style:"display: inline-flex;"}),
  d(String(entity)),
], {class: "columns_1_1"}),
d([
  entityLabel( 47 ),
  entityLabel( Database.get( entity, "entity/entityType" ) ),
], {class: "columns_1_1"}),
br(),
submitButton("Rediger", e => AdminApp.update( AdminApp.updateState({selectedEntity: entity}) )  ),
br(),
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})


let companyDatomView = (Company, companyEntity, attribute) => d([
  entityLabelWithPopup(attribute),
  companyValueView(Company, companyEntity, attribute)
], {class: "columns_1_1"}) 

let companyValueView = (Company, companyEntity, attribute) => {

  try {
    return isDefined( Company.get(companyEntity, attribute) )
    ? attribute === 6777 
      ? companyEntityLabelWithPopup(Company, Company.get(companyEntity, attribute) )
      : [1653, 6781, 1099].includes(attribute)
        ? entityLabel( Company.get(companyEntity, attribute) )
        : d( JSON.stringify(Company.get(companyEntity, attribute) )  )
    : d("na.")
  } catch (error) {
    return d(error)
  }

}


//Entity Views

let companyEntityView = (Company, companyEntity ) => d([
  companyEntityLabelWithPopup(Company, companyEntity),
  d("<br>"),
  d( Company.companyDatoms.filter( companyDatom => companyDatom.entity === companyEntity  ).map( companyDatom => companyDatomView( Company, companyEntity, companyDatom.attribute ) )),
  d( Database.get( Company.get( companyEntity , 6781 ), "companyEntityType/calculatedFields" ).map( companyCalculatedField => companyDatomView( Company, companyEntity, companyCalculatedField ) ) )
], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
    
    //----------------


// VALUE TYPE VIEWS

  let multipleValuesView = (Entity, attribute, isEditable) => {
  
    let valueType = Database.get(attribute, "attribute/valueType")
  
    let valueTypeViews = {
      "6783": companyEntityConstructorRowView,
      "41": (Entity, attribute, index) => d(JSON.stringify(Entity.get(attribute)[index])), //Company entity
      "6553": accountBalanceRowView,
      "6613": argumentRowView,
      "6614": statementRowView,
    }
  
    let startValuesByType = {
      "6783": {companyEntityType: 6780, attributeAssertions: {} },
      "41": 0, //Company entity
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
      ? d( Entity.get(attribute).map( (Value, index) => companyEntityLabelWithPopup(ClientApp.Company, Value) ))
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
  
  
  //Company entities
  
  let input_singleCompanyEntity = (Entity, attribute, isEditable) => isEditable
    ? dropdown( Entity.get( attribute ), Entity.getOptions( attribute ), async e => update( await Entity.replaceValue(attribute, Number(submitInputValue(e))  ) ) )
    : companyEntityLabelWithPopup(ClientApp.Company, Entity.get( attribute ) )
  
    let accountBalanceRowView = (Entity, attribute, index) => {
  
      let Account = Entity.get(attribute)[index]
    
      return d([
        entityLabelWithPopup(Account.account),
        d( String(Account.amount) ),
      ], {class: "columns_1_1"})
    
    
    }



    
  //Multiple valueType views
  
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
  
  


//NEW VIEWS

let entityView = (Entity) => d([
  d([
    d([span( `Entitet`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`})], {style:"display: inline-flex;"}),
    entityLabelWithPopup(Entity.entity),
  ], {class: "columns_1_1"}),
  d( Database.get( Entity.get("entity/entityType"), "entityType/attributes" ).map( attribute => Database.getEntityAttribute( Entity.entity, attribute ).getView() ) ),
  d( Entity.getActions().map( Action => Action.isActionable ? submitButton( Action.label, async e => AdminApp.update(  await Action.actionFunction()  ) ) : d( Action.label, {style: "background-color: gray;"} )  ) )
], {class: "feedContainer"} )

let entityVersionPopup = (entity, attribute, version) => {

  let EntityDatoms = Database.getEntity( entity ).Datoms.filter( Datom => Datom.attribute === Database.attrName(attribute) )

  return d([
    d([
      d( "Endret"),
      d("Tidligere verdi")
    ], {style: gridColumnsStyle("2fr 2fr 1fr")}),
      d( EntityDatoms.reverse().slice(1, 5).map( Datom => d([
        d( moment(Datom.tx).format("YYYY-MM-DD") ),
        d(JSON.stringify(Datom.value)),
        submitButton( "Gjenopprett", Database.get(entity, "entity/entityType") === 46 
          ? async e => ClientApp.update( await Database.updateEntity( entity, Datom.attribute, Datom.value ) )
          : async e => AdminApp.update( await Database.updateEntity( entity,  Datom.attribute, Datom.value ) )  
        )
      ], {style: gridColumnsStyle("2fr 2fr 1fr")})   ) )
    ], {class: "entityInspectorPopup", style: "width: 400px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
} 


let basicInputView_editable = ( formattedValue, updateFunction ) => input( {
  value: formattedValue, style: isDefined( formattedValue )
    ? isNumber(formattedValue) 
      ? `text-align: right;` 
      : "" 
    : "background-color: red;" 
  }, "change", updateFunction  )
let textAreaView = ( formattedValue, updateFunction ) => textArea( formattedValue, {class:"textArea_code"}, updateFunction )
let boolView = ( formattedValue, updateFunction ) => input( {value: formattedValue}, "click", updateFunction )

let optionsViews = ( formattedValue, updateFunction, options )  => dropdown( formattedValue, options , updateFunction )
let entityRefView = ( formattedValue, updateFunction, options ) => {
  let datalistID = getNewElementID()
  return d([
    entityLabelWithPopup( formattedValue ), 
    htmlElementObject("datalist", {id:datalistID}, optionsElement( options ) ),
    input({value: formattedValue, list: datalistID, style: `text-align: right;`}, "change", updateFunction),
    ])
}
let fileuploadView = ( formattedValue, updateFunction ) => isArray( formattedValue ) ? d( formattedValue.map( row => d(JSON.stringify(row)) ) ) : input({type: "file", style: `text-align: right;`}, "change", e => updateFunction)

let functionView = ( formattedValue, updateFunction ) => {

  //TBD
  
  let Value = formattedValue

  


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


let selectCompanyEntityView = ( formattedValue, updateFunction, options, Company ) => {

  let isValidCompanyEntity = Company.events.includes(formattedValue)

  let datalistID = getNewElementID()
  return d([
    isValidCompanyEntity ? companyEntityLabelWithPopup( Company, Company.getEvent(formattedValue).entities[0] ) : d("tom"),

    dropdown(
      isValidCompanyEntity ? formattedValue : "Velg", 
      Company.getAll().map( companyEntity => returnObject({value: Company.get(companyEntity).event, label: Company.get(companyEntity).label() }) ),
      updateFunction 
      )


    //htmlElementObject("datalist", {id:datalistID}, optionsElement( Company.getAll() ) ),
    //input({value: formattedValue, list: datalistID, style: `text-align: right;`}, "change", updateFunction),
    ])
}

let placeholderView = ( formattedValue, updateFunction ) => d( JSON.stringify( formattedValue )  )

const valueTypeViews_single = {
  "30": basicInputView_editable, //Tekst
  "31": basicInputView_editable, //Tall
  "34": textAreaView, //Funksjonstekst
  "36": boolView, //Boolean
  "40": optionsViews, //Velg alternativ
  "32": entityRefView,
  "5721": basicInputView_editable, //Dato
  "5824": fileuploadView, //File
  "41": selectCompanyEntityView, //Company entity, ie. from user selection

  
  "6534": placeholderView, //ExpandedFunction - TBD


  "6553": placeholderView, //Accbal -- only non-editable
  


  "6613": placeholderView, //function statements - only multiple
  "6614": placeholderView, //function arguments - only multiple
  "38": placeholderView, //datomconstructor - only multiple
  "5849": placeholderView, //Konstruksjon av ny hendelse - only multiple

}



let singleValueView = ( entity, attribute, version ) => {


  let valueType = Database.get(attribute, "attribute/valueType")


  let viewFunction = valueTypeViews_single[ valueType ]

  let formatFunction = new Function(["storedValue"], Database.get(valueType, "valueType/formatFunction") )

  let storedValue = Database.get(entity, attribute, version )

  let formattedValue = formatFunction( storedValue  )

  let unFormatFunction = new Function(["submittedValue"], Database.get(valueType, "valueType/unformatFunction") ) 
  

  let updateFunction = async e => {

    let submittedValue = submitInputValue( e )
    let unformattedValue = unFormatFunction( submittedValue )
    let updatedEntity = await Database.updateEntity( entity, attribute, unformattedValue)

    if( Database.get(entity, "entity/entityType") === 46 ){  ClientApp.update( updatedEntity.entity )  }else{ AdminApp.update( updatedEntity.entity ) }

  }


  let options = [32, 40].includes(valueType) ? Database.getOptions( attribute ) : []

  let Company = [41].includes(valueType) ? ClientApp.Company : undefined

  let valueView = viewFunction( formattedValue, updateFunction, options, Company )

  return valueView


}

let multipleEntityRefsRowView = ( formattedValue, updateFunction, options ) => {
  let datalistID = getNewElementID()
  return d([
    htmlElementObject("datalist", {id:datalistID}, optionsElement( options ) ),
    input({value: formattedValue, list: datalistID, style: `text-align: right;`}, "change", updateFunction),
    entityLabelWithPopup( formattedValue ), 
    ])
} 


let newMultipleValuesView = (Entity, attribute ) => {
  

  

  let valueType = Database.get(attribute, "attribute/valueType")

  if( valueType === 6783 ){ return companyEntityConstructorRowView( Entity, attribute, index )  }
  if( valueType === 6613 ){ return argumentRowView( Entity, attribute, index )  }
  if( valueType === 6614 ){ return statementRowView( Entity, attribute, index )  }

  let valueTypeViews_multiple = {
    "32": multipleEntityRefsRowView,
    "6783": placeholderView, // companyEntityConstructorRowView,
    "6613": placeholderView, // argumentRowView,
    "6614": placeholderView, // statementRowView,
  }

  let startValuesByType = {
    "32": 6,
    "6783": {companyEntityType: 6780, attributeAssertions: {} },
    "6613": {"argument/name": "argumentNavn", "argument/valueType": 30},
    "6614": {"statement/statement": "console.log({Company, Process, Event})", "statement/isEnabled": true},
  }


  let viewFunction = valueTypeViews_multiple[ valueType ]
  let formatFunction = new Function(["storedValue"], Database.get(valueType, "valueType/formatFunction") )
  let unFormatFunction = new Function(["submittedValue"], Database.get(valueType, "valueType/unformatFunction") ) 
  let startValue = Object.keys(startValuesByType).includes( String(valueType) ) ? startValuesByType[valueType] : ``

  let entity = Entity.entity

  let storedValues = Database.get( entity, attribute )

  let getUpdateFunction = index => async e => {
    let submittedValue = submitInputValue( e )
    let unformattedValue = unFormatFunction( submittedValue )
    let updatedEntity = await Entity.replaceValue( attribute,  storedValues.slice(0, index ).concat( unformattedValue ).concat( storedValues.slice(index + 1, storedValues.length ) ) )
    return AdminApp.update( updatedEntity )
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

  let options = [ 32 ].includes(valueType) ? Database.getOptions( attribute ) : []

  return d([
    isArray( storedValues )
      ?  d( storedValues.map( (storedValue, index) => d([
            positionInArrayView(Entity, attribute, index),
            viewFunction(  formatFunction( storedValue ), getUpdateFunction( index ) , options  ),
            submitButton( "[ X ]", async e => update(  await Entity.replaceValue( attribute,  storedValues.filter( (Value, i) => i !== index  ) ) )  )
          ], {class: "columns_1_8_1", style: "margin: 5px;"} )) )
      : d("Ingen verdier"),
      submitButton( "[ + ]", async e => update( isArray( Entity.get(attribute) ) 
        ? await Entity.replaceValue( attribute,  storedValues.concat( startValue )  )
        : await Entity.replaceValue( attribute,  [startValue] ) 
        )  )
  ])

}

//--------------