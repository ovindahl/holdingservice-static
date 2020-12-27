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

let entityLabel = (State, entity, onClick) => d([
  d( `${ State.DB.get( entity ) ? State.DB.get( entity ).label() : "na."}`, {class: "entityLabel", style: `background-color:${State.DB.get( State.DB.get( entity, "entity/entityType"), "entityType/color") ? State.DB.get( State.DB.get( entity, "entity/entityType"), "entityType/color") : "gray" }`}, "click", isDefined(onClick) ? onClick : e => ClientApp.update( State, {S: {selectedEntity: entity}} ) ),
], {style:"display: inline-flex;"})


let entityLabelWithPopup = ( State, entity, onClick) => d([
d([
  entityLabel( State, entity, onClick),
  entityPopUp( State, entity ),
], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"} )

let entityPopUp = (State, entity) => d([
d([
  entityLabel( State,  6 ),
  d( State.DB.get( entity ) ? State.DB.get( entity ).label() : "na." ),
], {class: "columns_1_1"}),
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


let companyDatomView = (State, companyEntity, attribute) => d([
  entityLabelWithPopup( State, attribute),
  companyValueView(State, companyEntity, attribute)
], {class: "columns_1_1"}) 

let companyValueView = (State, companyEntity, attribute) => {

  try {
    return isDefined( State.Company.get(companyEntity, attribute) )
    ? State.DB.get(attribute, "attribute/valueType") === 41
      ? State.DB.get(attribute, "attribute/isArray")
        ? d( State.Company.get(companyEntity, attribute).map( companyEnt => companyEntityLabelWithPopup(State, companyEnt ) ) )
        : companyEntityLabelWithPopup(State, State.Company.get(companyEntity, attribute) )
      : [1653, 6781, 1099].includes(attribute)
        ? entityLabel( State, State.Company.get(companyEntity, attribute) )
        : d( JSON.stringify( State.Company.get(companyEntity, attribute) )  )
    : d("na.")
  } catch (error) {
    return d(error)
  }

}


//Entity Views

let companyEntityView = (State, companyEntity ) => d([
  companyEntityLabelWithPopup(State, companyEntity),
  d("<br>"),
  d( State.Company.companyDatoms.filter( companyDatom => companyDatom.entity === companyEntity  ).map( companyDatom => companyDatomView( State, companyEntity, companyDatom.attribute ) )),
  d( State.DB.get( State.Company.get( companyEntity , 6781 ), "companyEntityType/calculatedFields" ).map( companyCalculatedField => companyDatomView( State, companyEntity, companyCalculatedField ) ) )
], {style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
    
    //----------------


// VALUE TYPE VIEWS

  let multipleValuesView = (State, entity, attribute, isEditable) => {
  
    let valueType = State.DB.get(attribute, "attribute/valueType")
  
    let valueTypeViews = {
      "6783": companyEntityConstructorRowView,
      "41": (entity, attribute, index) => d(JSON.stringify(State.DB.get(entity, attribute)[index])), //Company entity
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
      isArray( State.DB.get(attribute, "attribute/isArray") )
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

    ]) : ( valueType === 41 )
      ? d( State.DB.get( entity, attribute).map( (Value, index) => companyEntityLabelWithPopup(State, Value) ))
      : d( State.DB.get( entity, attribute).map( (Value, index) => valueTypeViews[ valueType ]( State, Entity, attribute, index) ))
  
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
  
  let accountBalanceRowView = (entity, attribute, index) => {

    let Account = State.DB.get( entity, attribute)[index]
  
    return d([
      entityLabelWithPopup( State, Account.account),
      d( String(Account.amount) ),
    ], {class: "columns_1_1"})
  
  
  }



    
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
  
  let statementRowView = ( State, Entity, attribute, index) => {
  
    let valueType = State.DB.get(attribute, "attribute/valueType") // 6614
  
    let Value = State.DB.get( entity, attribute)[index]
  
    
  
    return d([
      checkBox( Value["statement/isEnabled"] , async e => ClientApp.update( State, {DB: await Transactor.replaceValueEntry(State.DB, entity, attribute, index, mergerino( Value, {"statement/isEnabled": Value["statement/isEnabled"] ? false : true  }))} )),
  
  
      textArea( Value["statement/statement"], {style: "margin: 1em;font: -webkit-control;"} , async e => ClientApp.update( State, {DB: await Transactor.replaceValueEntry(State.DB, entity, attribute, index, mergerino( Value, {"statement/statement": submitInputValue(e).replaceAll(`"`, `'`).replaceAll("/\r?\n|\r/", "")  }))}) )
  
    ], {class: "columns_1_9"}) 
  
  }
  
  let companyEntityConstructorRowView = ( State, Entity, attribute, index) => {
  
    let entityConstructor = State.DB.get( entity, attribute)[index]
    let companyEntityType = entityConstructor.companyEntityType
  
  
    return d([
      dropdown(
        companyEntityType, 
        State.DB.getAll(6778).map( e => returnObject({value: e, label: State.DB.get(e, "entity/label")}) ),
        async e => ClientApp.update( State, {DB: await Transactor.replaceValueEntry(State.DB, entity, attribute, index, mergerino( entityConstructor, {companyEntityType: Number( submitInputValue(e) ), attributeAssertions: {}  } ))} )
        ),
        br(),
        d([
          d( State.DB.get( companyEntityType , "companyEntityType/attributes").map(  attr => {
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
          }  ) )
        ])
      
    ])
  } 
  
  


//NEW VIEWS

let entityView = (State, entity) => isDefined(entity)
  ? d([
      d([
        d([span( `Entitet`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`})], {style:"display: inline-flex;"}),
        entityLabelWithPopup( State, entity),
      ], {class: "columns_1_1"}),
      d( State.DB.get( State.DB.get(entity, "entity/entityType"), "entityType/attributes" ).map( attribute => entityAttributeView(State, entity, attribute) ) ),
      //entityActionsView(State, entity)
    ], {class: "feedContainer"} )
  : d("Ingen entitet valgt", {class: "feedContainer"})



let entityActionsView = (State, entity) => {

  let Actions = [
    {label: "Slett", isActionable: true, actionFunction: async e => ClientApp.update( State, {S: {DB: await Transactor.retractEntity( State.DB, entity) }} ) },
    {label: "Legg til", isActionable: true, actionFunction: async e => ClientApp.update( State, {S: {DB: await Transactor.createEntity( State.DB, State.DB.get(entity, "entity/entityType"))  }} ) },
    {label: "Lag kopi", isActionable: true, actionFunction: async e => {

      let entityType = State.DB.get( entity, "entity/entityType")
      let entityTypeAttributes = State.DB.get( entityType, "entityType/attributes" )
      let newEntityDatoms = entityTypeAttributes.map( attr => newDatom("newEntity", State.DB.attrName(attr), State.DB.get( entity, attr) ) ).filter( Datom => Datom.attribute !== "entity/label" ).concat( newDatom("newEntity", "entity/label", `Kopi av ${State.DB.get( entity, 6)}` ) )
      if(entityType === 42){ newEntityDatoms.push( newDatom( "newEntity", "attr/name", "attr/" + Date.now() )  ) }

      let updatedDB = await Transactor.createEntity( State.DB, entityType, newEntityDatoms)
      ClientApp.update( State, {S: {DB: updatedDB  }} )
    }   },
  ]

  return d( Actions.map( Action => Action.isActionable ? submitButton( Action.label, async e => ClientApp.update( {S: {DB: await Action.actionFunction()  }}   ) ) : d( Action.label, {style: "background-color: gray;"} )  ) )

}



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
    ? (State.DB.get(attribute, "attribute/valueType") === 32) ? newMultipleValuesView(State, entity, attribute) : multipleValuesView(State, entity, attribute, true ) 
    : singleValueView( State, entity, attribute ),
  d([
    d([
      d( "v" + State.DB.getEntityAttribute(entity, attribute).Datoms.length, {style: "padding: 3px;background-color: #46b3fb;color: white;margin: 5px;"} ),
      entityVersionPopup( State, entity, attribute )
    ], {class: "popupContainer"})
    ], {style:"display: inline-flex;"} )
], ( State.DB.get(attribute, "attribute/isArray") || State.DB.get(attribute, "attribute/valueType") === 6534 ) ? {style: "margin: 5px;border: 1px solid #80808052;"} : {style:  gridColumnsStyle("3fr 3fr 1fr") + "margin: 5px;"} )


let basicInputView_editable = ( State, formattedValue, updateFunction ) => input( {
  value: formattedValue, style: isDefined( formattedValue )
    ? isNumber(formattedValue) 
      ? `text-align: right;` 
      : "" 
    : "background-color: red;" 
  }, "change", updateFunction  )
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


let selectCompanyEntityView = ( State, formattedValue, updateFunction ) => {

  let isValidCompanyEntity =State.Company.events.includes(formattedValue)

  return d([
    isValidCompanyEntity ? companyEntityLabelWithPopup( State, State.Company.getEvent(formattedValue).entities[0] ) : d("tom"),

    dropdown(
      isValidCompanyEntity ? formattedValue : "Velg", 
      State.Company.getAll().map( companyEntity => returnObject({value: State.Company.get(companyEntity).event, label: State.Company.get(companyEntity).label() }) ),
      updateFunction 
      )

    ])
}

let placeholderView = ( State, formattedValue, updateFunction ) => d( JSON.stringify( formattedValue )  )

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


  let options = [32, 40].includes(valueType) ? State.DB.getOptions( attribute ) : []


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
    "6783": {companyEntityType: 6780, attributeAssertions: {} },
    "6613": {"argument/name": "argumentNavn", "argument/valueType": 30},
    "6614": {"statement/statement": "console.log({Company, Process, Event})", "statement/isEnabled": true},
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