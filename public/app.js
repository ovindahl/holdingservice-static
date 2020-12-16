const Database = {
  tx: null,
  Entities: [],
  entities: [],
  setLocalState: (entity, newState) => {
    let updatedEntity = Database.get(entity)
    updatedEntity.localState = mergerino(updatedEntity.localState, newState) 
    Database.Entities = Database.Entities.filter( Entity => Entity.entity !== updatedEntity.entity ).concat( updatedEntity )
    update( )
    return;
  },
  getLocalState: entity => {
    let serverEntity = Database.get(entity)
    let localState = serverEntity.localState 
      ? serverEntity.localState
      : {tx: serverEntity.Datoms.map( Datom => Datom.tx ).filter( tx => !isUndefined(tx) ).sort().slice(-1)[0]}
    return localState
  },
  updateEntity: async (entity, attribute, value) => {

    let attr = Database.attr(attribute)
    let valueType = Database.get( attr , "attribute/valueType")





    let attributeIsArray = isDefined( Database.get( attr, 5823) )
      ? Database.get(attr, 5823)
      : false



    let valueInArray = attributeIsArray ? value : [value]
    let isValid_existingEntity = Database.isEntity(entity)
    let valueTypeValidatorFunction = new Function("inputValue",  Database.get( valueType, "valueType/validatorFunctionString") )

    let isValid_valueType = valueInArray.every( arrayValue => valueTypeValidatorFunction(arrayValue) ) 
    let isValid_attribute = true
    let isValid_notNaN = valueInArray.every( arrayValue => !Number.isNaN(arrayValue) )

    //Add checks for whether attribtue is valid for the entity type?

    if( isValid_existingEntity && isValid_valueType && isValid_attribute && isValid_notNaN  ){

      let Datom = newDatom(entity, Database.attrName(attr), value )
      let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( [Datom] ) )
      let updatedEntity = serverResponse[0]
      let latestTx = serverResponse[0].Datoms.map( Datom => Datom.tx ).filter( tx => !isUndefined(tx) ).sort().reverse()[0]
      updatedEntity.localState = {tx: latestTx }
      Database.Entities = Database.Entities.filter( Entity => Entity.entity !== updatedEntity.entity ).concat( updatedEntity )
      Database.tx = Database.Entities.map( Entity => Entity.Datoms.slice( -1 )[0].tx ).sort( (a,b) => a-b ).filter( v => isDefined(v) ).slice(-1)[0]
      return updatedEntity;
    }else{
      console.log("Database.updateEntity did not pass validation.", {entity, attr, value, validators: {isValid_existingEntity, isValid_valueType, isValid_attribute, isValid_notNaN }})
      return null;
    }
  },
  createEntity: async (entityType, newEntityDatoms) => {

    /* let Datoms = Database.get( entityType, "entityType/attributes")
      .map( attribute => newDatom("newEntity", Database.attrName(attribute), new Function("S", Database.get(attribute, "attribute/startValue") )( Database )))
      .filter( datom => datom.attribute !== "entity/entityType" )
      .filter( datom => datom.attribute !== "entity/label" )
      .concat([
        newDatom("newEntity", "entity/entityType", entityType ),
        newDatom("newEntity", "entity/label", `[${Database.get(entityType, "entity/label")} uten navn]` ),
        newDatom("newEntity", "entity/category", `Mangler kategori` )
      ])
    if(Array.isArray(newEntityDatoms)){Datoms = Datoms.concat(newEntityDatoms)} */


    let D = [newDatom("newEntity", "entity/entityType", entityType )]
    if(Array.isArray(newEntityDatoms)){D = D.concat(newEntityDatoms)}

    let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( D ) )
    let updatedEntity = serverResponse[0]



    //To be systematized
    Database.Entities = Database.Entities.filter( Entity => Entity.entity !== updatedEntity.entity ).concat( updatedEntity )
    Database.entities = Database.Entities.map( serverEntity => serverEntity.entity )
    Database.attributes = Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 ).map(E => E.entity)
    Database.attrNames = mergeArray(Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 ).map( serverEntity => createObject(serverEntity.current["attr/name"], serverEntity.entity) ))
    Database.tx = Database.Entities.map( Entity => Entity.Datoms.slice( -1 )[0].tx ).sort( (a,b) => a-b ).filter( v => isDefined(v) ).slice(-1)[0]
    //To be systematized ---

    return updatedEntity
  },
  retractEntity: async entity => Database.retractEntities([entity]),
  retractEntities: async entities => {    
    let retractionDatoms = entities.map( entity => {
      let Datoms = Database.get(entity).Datoms
      let activeDatoms = Datoms.filter( Datom => Datoms.filter( dat => dat.attribute === Datom.attribute && dat.tx > Datom.tx ).length === 0  )
      let retractionDatoms = activeDatoms.map( Datom => newDatom(entity, Datom.attribute, Datom.value, false) )
      return retractionDatoms
    } ).flat()
    let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( retractionDatoms ) )


    //To be systematized
    Database.Entities = Database.Entities.filter( Entity => !entities.includes(Entity.entity) ).concat( serverResponse )
    Database.entities = Database.Entities.map( serverEntity => serverEntity.entity )
    Database.attributes = Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 ).map(E => E.entity)
    Database.attrNames = mergeArray(Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 ).map( serverEntity => createObject(serverEntity.current["attr/name"], serverEntity.entity) ))
    Database.tx = Database.Entities.map( Entity => Entity.Datoms.slice( -1 )[0].tx ).sort( (a,b) => a-b ).filter( v => isDefined(v) ).slice(-1)[0]
    //To be systematized ---






    update( )
  },
  submitDatoms: async datoms => {
    let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( datoms ) )
    update( )
  },
  attrName: attribute => {
    if( isNumber(attribute)  ){
      let serverEntity = Database.Entities.find( serverEntity => serverEntity.entity === attribute  )
      let serverDatoms = serverEntity.Datoms.filter( Datom => Datom.attribute === "attr/name" )
      let latestDatom = serverDatoms.slice( - 1 )[0]
      let value = latestDatom.value
      return value;
    }else if( isDefined( Database.attrNames[attribute] ) ){ return attribute }
    else{ return log(undefined, `[ Database.attrName(${attribute}) ]: Attribute ${attribute} does not exist`) }
  },
  attr: attrName => isDefined(attrName)
    ? isNumber(attrName) ? attrName : Database.attrNames[attrName]
    : log(undefined, `[ Database.attr(${attrName}) ]: Proveded attribute name is undefined`),
  isAttribute: attribute => Database.attributes.includes( Database.attr(attribute) ),
  isEntity: entity => Database.entities.includes(entity),
  isCalculatedField: calculatedField => Database.getAll(5817).includes( calculatedField ),
  get: (entity, attribute, version) => {
    if(Database.isEntity(entity)){
      if( isDefined(attribute) ){
        if( Database.isAttribute(attribute) ){
          let Datom = Database.getDatom(entity, attribute, version)
          if(isUndefined(Datom)){return undefined} //, `[ Database.get(${entity}, ${attribute}, ${version}) ]: No attribute ${attribute} datoms exist for entity ${entity}`)}
          else{ return Datom.value}
        }else if( Database.isCalculatedField(attribute) ){return Database.getCalculatedField(entity, attribute) } //returns calculatedField
      }else{return Database.getEntity(entity)}
    }else{return log(undefined, `[ Database.get(${entity}, ${attribute}, ${version}) ]: Entity does not exist`)}
  },
  getDatom: (entity, attribute, version) => {
    let serverEntity = Database.Entities.find( serverEntity => serverEntity.entity === entity  )
    let Datom = serverEntity.Datoms
          .filter( Datom => Datom.attribute === Database.attrName(attribute) )
          .map( serverDatom => isUndefined(serverDatom.tx) ? mergerino(serverDatom, {tx: 0}) : serverDatom ) //NB: Some early datoms lacks tx.....
          .filter( serverDatom => isDefined(version) ? serverDatom.tx <= version : true )
          .slice(-1)[0]
    return Datom
  },
  getEntity: entity => {
    let serverEntity = Database.Entities.find( serverEntity => serverEntity.entity === entity  )
    let Entity = serverEntity;
    Entity.get = (attr, version) => Database.get(entity, attr, version)
    Entity.getOptions = attr => Database.getOptions(attr)
    Entity.entityType = Entity.get("entity/entityType")
    Entity.label = Entity.get("entity/label") ? Entity.get("entity/label") : "Mangler visningsnavn."
    Entity.color = Database.get( Entity.entityType, "entityType/color") ? Database.get( Entity.entityType, "entityType/color") : "#bfbfbf"
    Entity.isLocked = false;
    Entity.tx = Entity.Datoms.slice( -1 )[ 0 ].tx

    Entity.replaceValue = async (attribute, newValue) => Database.updateEntity(entity, attribute, newValue )

    Entity.addValueEntry = async (attribute, newValue) => await Entity.replaceValue( attribute,  Entity.get(attribute).concat( newValue )  )
    Entity.removeValueEntry = async (attribute, index) => await Entity.replaceValue( attribute,  Entity.get(attribute).filter( (Value, i) => i !== index  ) )






    Entity.replaceValueEntry = async (attribute, index, newValue) => {
      let Values = Entity.get(attribute)
      await Entity.replaceValue( attribute,  Values.slice(0, index ).concat( newValue ).concat( Values.slice(index + 1, Values.length ) ) )
    } 

    Entity.Actions = [
      {label: "Slett", isActionable: true, actionFunction: async e => await Database.retractEntity(entity) },
      {label: "Legg til", isActionable: true, actionFunction: async e => await Database.createEntity(Entity.entityType)  },
      {label: "Lag kopi", isActionable: true, actionFunction: async e => {

        let entityType = Entity.get("entity/entityType")
        let entityTypeAttributes = Database.get( entityType, "entityType/attributes" )

        let newEntityDatoms = entityTypeAttributes.map( attr => newDatom("newEntity", Database.attrName(attr), Entity.get(attr) ) ).filter( Datom => Datom.attribute !== "entity/label" ).concat( newDatom("newEntity", "entity/label", `Kopi av ${Entity.get(6)}` ) )


        let newEntity = await Database.createEntity(entityType, newEntityDatoms)

        AdminApp.updateState({selectedEntity: newEntity.entity})


      }   },
    ]

    return Entity
  },
  getCalculatedField: (entity, calculatedField) => {
    let Entity = Database.getEntity(entity)
    let calculatedValue;
    //NB: Outdated
      try {calculatedValue = new Function( ["Entity", "Database"],  Database.get(calculatedField, 6792) ) (Entity, Database) } //NB: Må konverteres til statements
      catch (error) {calculatedValue = log("ERROR",{info: "calculatedValue calculation  failed", entity, calculatedField, error}) }
    return calculatedValue
  },
  getAll: entityType => Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === entityType ).map(E => E.entity), //Kan bli sirkulær med isAttribute
  getOptions: (attribute, tx ) => {
    let options = [];
    try {options = new Function( ["Database"] , Database.get(attribute, "attribute/selectableEntitiesFilterFunction", tx) )( Database )}
    catch (error) { log(error, {info: "Could not get options for DB attribute", attribute, tx }) }
    return options
  },
  getFunction: (entity, attribute) => {
    if(Database.get(attribute, "attribute/valueType") === 6534 ){
      let functionObject = Database.get(entity, attribute)
      let func = new Function( functionObject.arguments , functionObject.statements.join(";")  )
      return func
    }else{return log(undefined, {info: "getFunction ERROR: Valuetype is not function", entity, attribute})}
    
  },
  getGlobalFunction: entity => {


    let globalFunction = Database.globalFunctions.find( globalFunction => globalFunction.entity === entity )

    return isDefined(globalFunction) ? globalFunction.function : undefined
  },
  getGlobalAsyncFunction: functionEntity => {

    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

    let argumentObjects = Database.get(functionEntity, "function/arguments")
    let arguments = argumentObjects.map( argumentObject => argumentObject["argument/name"] )
    let statementObjects = Database.get(functionEntity, "function/statements")
    let statements = statementObjects.filter( statementObject => statementObject["statement/isEnabled"] ).map( statementObject => statementObject["statement/statement"] )
    let functionString = statements.join(";")
    let GlobalAsyncFunction = new AsyncFunction( arguments ,functionString  )


    return GlobalAsyncFunction

  },
  getCompanyOptionsFunction: attr => {

    let functionString = Database.get( attr, "attribute/selectableEntitiesFilterFunction"  )

    let optionsFunction = new Function(["Company", "Entity"], functionString)

    return optionsFunction

  }, 
  getCompany: company => {
  
    let Company = {
      entity: company
    }
  
    Company.t = 0
    Company.companyDatoms = [];
    Company.entities = [];
    Company.calculatedFieldObjects = [];
    Company.events = Database.getAll(46)
      .filter( event => Database.get( Database.get(event, "event/process"), "process/company" ) === company  )
      .sort(  (a,b) => Database.get(a, 'event/date' ) - Database.get(b, 'event/date' ) )
  
    Company.processes = Database.getAll(5692).filter( process => Database.get(process , 'process/company' ) === company  ).sort( (processA, processB) => {
      let processEventsA = Company.events.filter( e => Database.get(e, "event/process") === processA )
      let firstEventA = processEventsA[0]
      let firstEventDateA = isDefined(firstEventA) ? Database.get(firstEventA, 'event/date') : Date.now()
      let processEventsB = Company.events.filter( e => Database.get(e, "event/process") === processB )
      let firstEventB = processEventsB[0]
      let firstEventDateB = isDefined(firstEventB ) ? Database.get(firstEventB , 'event/date') : Date.now()
      return firstEventDateA - firstEventDateB;
    })
  
  
    Company.latestEntityID = 0;
  
    let eventsToConstruct = Company.events.filter( event => Database.get( Database.get(event, "event/eventTypeEntity"), "eventType/newDatoms" ).length > 0 )

    let CompanyWithQueryMethods = createCompanyQueryObject( Database, Company )


    let ConstructedCompany = applyCompanyEvents( Database, CompanyWithQueryMethods, eventsToConstruct )


    return ConstructedCompany
  
  }
}

let Logs = []


const ClientApp = {
  Company: undefined,
  S: {
    selectedPage: "Tidslinje",
    selectedCompany: 5723,
    selectedEntity: 5723
  },
  updateState: patch => ClientApp.S = mergerino( ClientApp.S, patch ),
  replaceState: newState => ClientApp.S = newState,
  getCompany: () => Company, // Brukes i et par valueType views, bør fikses
}

const AdminApp = {
  S: {
    selectedPage: "Admin",
    selectedEntity: 1,  
  },
  updateState: patch => AdminApp.S = mergerino( AdminApp.S, patch ),
  replaceState: newState => AdminApp.S = newState,

}

let D = Database
let Company = {}

const sideEffects = {
    isIdle: true,
    appContainer: "appContainer",
    updateDOM: elementTree => [
        sideEffects.applyHTML,
        sideEffects.applyEventListeners
    ].forEach( stepFunction => stepFunction(elementTree) ),
    applyHTML: elementTree => document.getElementById(sideEffects.appContainer).innerHTML = elementTree.map( element => element.html ).join(''),
    applyEventListeners: elementTree => elementTree.map( element => Array.isArray(element.eventListeners) ? element.eventListeners : [] ).flat().forEach( eventListener => document.getElementById( eventListener.id ).addEventListener(eventListener.eventType, eventListener.action) ),
    APIRequest: async (type, endPoint, stringBody) => {
      if(sideEffects.isIdle){
        sideEffects.isIdle = false;
        let statusDiv = document.getElementById("APISYNCSTATUS")
        if(!isNull(statusDiv)) {
          statusDiv.innerHTML = "Laster";
        }
        let startTime = Date.now()
        let APIendpoint = `https://holdingservice.appspot.com/api/${endPoint}`
        let authToken = await sideEffects.auth0.getTokenSilently()
        let headers = {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken}
        let response = (type === "GET") ? await fetch(APIendpoint, {method: "GET", headers: headers })
                                        : (type === "POST") ? await fetch(APIendpoint, {method: "POST", headers: headers, body: stringBody })
                                        : console.log("ERROR: Invalid HTTP method: ", type, endPoint, body )
        let parsedResponse = await response.json()
        console.log(`Executed ${type} request to '/${endPoint}' in ${Date.now() - startTime} ms.`, parsedResponse)
        sideEffects.isIdle = true;
        if(!isNull(statusDiv)) {
          statusDiv.innerHTML = "Ledig"
        }
        
        return parsedResponse;
      }else{
        log( {type, endPoint, stringBody}, "Declined HTTP request, another in progress:")
        return null;
      }
    },
    auth0: null,
    configureClient: async () => {
        sideEffects.auth0 = await createAuth0Client({
          domain: "holdingservice.eu.auth0.com",
          client_id: "3BjA7O8H2dGx2g2nhssoFie0vWWx7ne5",
          audience: "localhost:3000/api"
        }); //This call is for some reason never resolved..
        if(await sideEffects.auth0.isAuthenticated()){
            console.log("Authenticated");
            init()
        }else{
            try{
                await sideEffects.auth0.handleRedirectCallback();
                window.history.replaceState({}, document.title, "/");
                sideEffects.configureClient()
              } catch (error) {
                console.log("Not logged in.");
                sideEffects.auth0.loginWithRedirect({redirect_uri: window.location.origin})
              }
        }
        return true
    
    }
}

let newDatom = (entity, attribute, value, isAddition) => returnObject({entity, attribute, value, isAddition: isAddition === false ? false : true })

let update = () => {
    D = Database
    Company = applyMethodsToConstructedCompany( Database, ClientApp.Company ) 
    
    let startTime = Date.now()
    let elementTree = ClientApp.S.selectedPage === "Admin" ? [ adminPage( Company ) ] : [ clientPage(Company) ]
    sideEffects.updateDOM( elementTree )
    console.log(`generateHTMLBody finished in ${Date.now() - startTime} ms`)
}

let init = async () => {

  Database.Entities = await sideEffects.APIRequest("GET", "Entities", null)
  Database.entities = Database.Entities.map( serverEntity => serverEntity.entity )
  Database.attributes = Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 ).map(E => E.entity)
  Database.attrNames = mergeArray(Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 ).map( serverEntity => createObject(serverEntity.current["attr/name"], serverEntity.entity) ))
  Database.tx = Database.Entities.map( Entity => Entity.Datoms.slice( -1 )[0].tx ).sort( (a,b) => a-b ).filter( v => isDefined(v) ).slice(-1)[0]
  Database.selectedEntity = 6

  Database.globalFunctions = Database.getAll(6615).map(  e => {

    let argumentObjects = Database.get(e, "function/arguments")
    let arguments = argumentObjects.map( argumentObject => argumentObject["argument/name"] )
    let statementObjects = Database.get(e, "function/statements")
    let statements = statementObjects.filter( statementObject => statementObject["statement/isEnabled"] ).map( statementObject => statementObject["statement/statement"] )
    let functionString = statements.join(";")

    let globalFunction = new Function( arguments ,functionString  )
    return returnObject({entity: e, function: globalFunction})
  } )

  let company = Database.getAll( 5722 )[0]
  ClientApp.Company = Database.getCompany( company )
  update(  )
}

sideEffects.configureClient();





//Updated Company Construction pipeline

let constructEntity = ( receivedDatabase, Company, Process, Event, entityConstructor, index) => {

  let eventType = Event.get("event/eventTypeEntity" )
  let sharedStatements = receivedDatabase.get( eventType, "eventType/sharedStatements" ) 
    ? receivedDatabase.get( eventType, "eventType/sharedStatements" ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") 
    : []

  let sharedStatementsString = (sharedStatements.length > 0) ? sharedStatements + ";" : ""


  let companyEntityType = entityConstructor.companyEntityType
  let attributeAssertions = entityConstructor.attributeAssertions

  let entity = Company.latestEntityID + index + 1

  let generatedyDatoms =  receivedDatabase.get( companyEntityType , "companyEntityType/attributes") 
    .filter( attr => isUndefined( attributeAssertions[ attr ] ) 
      ? false 
      : isUndefined( attributeAssertions[ attr ].isEnabled )
        ? false
        : attributeAssertions[ attr ].isEnabled
       )
    .map(  attr => {

    let companyDatom = {
      entity, company: Company.entity, process: Process.entity , event: Event.entity, t: Event.t,
      attribute: attr
    }

    let valueFunctionString = attributeAssertions[ attr ].valueFunction

    let functionString = sharedStatementsString + valueFunctionString;

    try {companyDatom.value = new Function( [`Company`, `Process`, `Event`], functionString )( Company, Process, Event ) } 
    catch (error) {companyDatom.value = log(error,{info: "constructEntity(Company, Process, Event, entityConstructor) failed", Company, Process, Event, sharedStatements, valueFunctionString, functionString}) }

    return companyDatom
  } )

  let companyEntityTypeDatom = {
    entity, company: Company.entity, process: Process.entity , event: Event.entity, t: Event.t,
    attribute: 6781,
    value: companyEntityType
  }


  let entityDatoms = [companyEntityTypeDatom].concat(generatedyDatoms)

  return entityDatoms
}

let createCompanyQueryObject = (receivedDatabase, Company) => {

  Company.getAll = entityType => {

    let matchingDatoms = Company.companyDatoms
    .filter( companyDatom => companyDatom.attribute === 6781 )
    .filter( companyDatom => companyDatom.value === entityType )

    let entities = isDefined( matchingDatoms ) 
      ? matchingDatoms.filter( filterUniqueValues ).map(  companyDatom => companyDatom.entity )
      : []

    return entities
  } 
    

  Company.getDatom = (entity, attribute ) => Company.companyDatoms
  .filter( companyDatom => companyDatom.entity === entity )
  .filter( companyDatom => companyDatom.attribute === attribute )
  .slice( -1 )[0]

  Company.getCalculatedFieldObject = (companyEntity, calculatedField) => Company.calculatedFieldObjects
    .filter( calculatedFieldObject => calculatedFieldObject.companyEntity === companyEntity && calculatedFieldObject.calculatedField === calculatedField  )
    .slice( -1 )[0]


  Company.get = (entity, attribute ) => {

    if(isUndefined(attribute)){
      let CompanyEntity = {
        entity,
        companyDatoms: Company.companyDatoms.filter( companyDatom => companyDatom.entity === entity )
      }
      

      
      CompanyEntity.get = attr => {

        if( receivedDatabase.get(attr, "entity/entityType") === 42 ){

          let matchingDatoms = CompanyEntity.companyDatoms.filter( companyDatom => companyDatom.attribute === attr )

          let latestDatom = matchingDatoms.length > 0 ? matchingDatoms.slice( -1 )[0] : undefined

          let value = isDefined(latestDatom) ?  latestDatom.value : undefined
          return value

        }else if ( receivedDatabase.get(attr, "entity/entityType") === 5817 ){

          let calculatedFieldObject = Company.getCalculatedFieldObject(CompanyEntity. entity, attr )

          return isDefined( calculatedFieldObject ) 
            ? calculatedFieldObject.value 
            : receivedDatabase.get(attribute, "attribute/isArray" ) ? [] : undefined

        }else{ return log(undefined, {info: "ERROR: CompanyEntity.get(), attr is not attribute or calculcatedField", CompanyEntity, attr }) }

        

      } 
      CompanyEntity.getOptions = attr => receivedDatabase.getCompanyOptionsFunction( attr )( Company, CompanyEntity )




      CompanyEntity.event = CompanyEntity.companyDatoms[0].event


      CompanyEntity.companyEntityType = CompanyEntity.get(6781)

      return CompanyEntity
    }

    if(receivedDatabase.get(attribute, "entity/entityType") === 42){
      let companyDatom = Company.getDatom(entity, attribute )
      return isDefined( companyDatom ) ? companyDatom.value : undefined
    }else{
      let calculatedFieldObject = Company.getCalculatedFieldObject(entity, attribute )
      return isDefined( calculatedFieldObject ) 
        ? calculatedFieldObject.value 
        : receivedDatabase.get(attribute, "attribute/isArray" ) ? [] : undefined
    }
    
  } 



  Company.getProcess = process => {
    let Process = receivedDatabase.get( process )
    Process.events = Company.events.filter( event => Database.get(event, "event/process") === process )
    Process.getFirstEvent = () => Company.getEvent( Process.events[0] )
    Process.isValid = () => true
    Process.getCriteria = () => []
    Process.getActions = () => [6628, 6687]

    Process.createEvent = async eventType => {

      let newEvent = await receivedDatabase.createEntity(46, [
        newDatom(`newEntity`, "event/eventTypeEntity", eventType),
        newDatom(`newEntity`, "event/process", process),
        newDatom(`newEntity`, "event/date", Date.now() )
      ])
  
    }

    Process.executeAction = async functionEntity => {


      let updateCallback = response => {
        ClientApp.updateState({selectedEntity: undefined})
        console.log({response}, "Callback fra Process.executeAction")
        ClientApp.Company = receivedDatabase.getCompany( Company.entity )
        update(  )
      } 


      Company.executeCompanyAction( functionEntity, Process, undefined, updateCallback )
    } 
    


    return Process
  }

  Company.getEvent = event => {

    let Event = receivedDatabase.get( event )
    Event.t =  Company.events.findIndex( e => e === event ) + 1
    Event.process = Event.get("event/process")
    Event.entities = Company.entities.filter( companyEntity => Company.getDatom(companyEntity, 6781).event === event )
    let processEvents = Company.events.filter( event => Database.get(event, "event/process") === Event.process )
    let prevEvent = processEvents[  processEvents.findIndex( e => e  === event ) - 1 ]
    Event.getPrevEvent = () => Company.getEvent( prevEvent )

    Event.getActions = () => receivedDatabase.get( Event.get("event/eventTypeEntity"), "eventType/actionFunctions" )
    Event.executeAction = async functionEntity => await Company.executeCompanyAction(functionEntity, Company.getProcess( Event.process ), Event)

    Event.executeAction = async functionEntity => {


      let updateCallback = response => {
        ClientApp.updateState({selectedEntity: undefined})
        console.log({response}, "Callback fra Event.executeAction")
        ClientApp.Company = receivedDatabase.getCompany( Company.entity )
        update(  )

      } 


      Company.executeCompanyAction( functionEntity, Company.getProcess(Event.process), Event, updateCallback )
    } 

    return Event
  }


  return Company

}


let applyCompanyEvents = ( receivedDatabase, dbCompany, eventsToConstruct ) => eventsToConstruct.reduce( (prevCompany, event) => {

  let t = prevCompany.t + 1
  let eventType = receivedDatabase.get( event, "event/eventTypeEntity" )
  let process = receivedDatabase.get(event, "event/process")

  let Event = prevCompany.getEvent( event ) //TBD
  let Process = prevCompany.getProcess( process ) //TBD

  ///// Constructiong through events

  let eventDatoms = receivedDatabase.get( eventType, "eventType/newEntities" ) ? receivedDatabase.get( eventType, "eventType/newEntities" ).map( (entityConstructor, index) => constructEntity( receivedDatabase, prevCompany, Process, Event, entityConstructor, index ) ).flat() : []

  let Company = {
    entity: prevCompany.entity,
    t,
    events: prevCompany.events,
    processes: prevCompany.processes,
    calculatedFieldObjects: prevCompany.calculatedFieldObjects, //Frem til de oppdateres
    companyDatoms: prevCompany.companyDatoms.concat( eventDatoms ),
    entities: eventDatoms.reduce( (entities, datom) => entities.includes( datom.entity ) ? entities : entities.concat(datom.entity), prevCompany.entities ),
    latestEntityID: eventDatoms.reduce( (maxEntity, eventDatom) => eventDatom.entity > maxEntity ? eventDatom.entity : maxEntity, prevCompany.latestEntityID  ),
  }

  let updatedCompanyQueryObject = createCompanyQueryObject( receivedDatabase, Company )

  Company.calculatedFieldObjects = getCompanyCalculatedFields( receivedDatabase, updatedCompanyQueryObject, Process, Event ) 

  let CompanyWithQueryMethods = createCompanyQueryObject(receivedDatabase, Company )

  return CompanyWithQueryMethods
  }, dbCompany )



let getCompanyCalculatedFields = (receivedDatabase, Company, Process, Event) => Company.entities.reduce( ( calculatedFieldObjects, companyEntity ) => {


  let eventCalculatedFields = calculateCalculatedFieldObjects( receivedDatabase, Company, Process, Event, companyEntity)
  
  let changedFields = eventCalculatedFields.filter( calculatedFieldObject => {

    let prevValueObject = Company.calculatedFieldObjects.find( calculatedField => calculatedField.companyEntity === companyEntity && calculatedField.calculatedField === calculatedField  )

    let noPrevValue = isUndefined( prevValueObject )

    let valueHasChanged = noPrevValue 
      ? true
      : calculatedFieldObject.value !== prevValueObject.value

    return valueHasChanged
  } )

  let updatedCalculatedFields = calculatedFieldObjects.concat(changedFields)
    
  return updatedCalculatedFields
  
} , Company.calculatedFieldObjects )


let calculateFieldValue = (receivedDatabase, Company, Process, Event, CompanyEntity, calculatedField ) => {

  let newValueFunctionString = receivedDatabase.get( calculatedField, 6792 ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";")

  let value;
  try {value = new Function( [`Company`, `Process`, `Event`, `Entity`], newValueFunctionString )( Company, Process, Event, CompanyEntity ) } 
    catch (error) {value = log(error,{info: "calculateFieldValue(Company, Process, Event, CompanyEntity, valueFunctionString) failed", Company, Process, Event, CompanyEntity, newValueFunctionString}) }

  return value;
}

let calculateCalculatedFieldObjects = (receivedDatabase, Company, Process, Event, companyEntity) => {


  let CompanyEntity = Company.get( companyEntity )

  let entityTypeCalculatedFields = receivedDatabase.get( CompanyEntity.companyEntityType , "companyEntityType/calculatedFields" )
  

  let calculatedFieldObjects = entityTypeCalculatedFields.map( calculatedField => returnObject({
    company: Company.entity, companyEntity, calculatedField, t: Event.t, 
    value: calculateFieldValue( receivedDatabase, Company, Process, Event, CompanyEntity, calculatedField )
  }) )  

  return calculatedFieldObjects;

}


let applyMethodsToConstructedCompany = (receivedDatabase, constructedCompany) => {


  let Company = constructedCompany

  Company.events = receivedDatabase.getAll(46)
      .filter( event => receivedDatabase.get( receivedDatabase.get(event, "event/process"), "process/company" ) === Company.entity  )
      .sort(  (a,b) => receivedDatabase.get(a, 'event/date' ) - receivedDatabase.get(b, 'event/date' ) )
  
  Company.processes = receivedDatabase.getAll(5692).filter( process => receivedDatabase.get(process , 'process/company' ) === Company.entity  ).sort( (processA, processB) => {
    let processEventsA = Company.events.filter( e => receivedDatabase.get(e, "event/process") === processA )
    let firstEventA = processEventsA[0]
    let firstEventDateA = isDefined(firstEventA) ? receivedDatabase.get(firstEventA, 'event/date') : Date.now()
    let processEventsB = Company.events.filter( e => receivedDatabase.get(e, "event/process") === processB )
    let firstEventB = processEventsB[0]
    let firstEventDateB = isDefined(firstEventB ) ? receivedDatabase.get(firstEventB , 'event/date') : Date.now()
    return firstEventDateA - firstEventDateB;
  })
  
  
  Company.getActions = () => receivedDatabase.getAll(6615).filter( e => receivedDatabase.get(e, "entity/category") === "Selskapsfunksjoner" )

  

  Company.executeCompanyAction = async (functionEntity, Process, Event, callback) => {
    let asyncFunction = receivedDatabase.getGlobalAsyncFunction(functionEntity)
    try {  asyncFunction( receivedDatabase, Company, Process, Event).then( callback  )  } catch (error) { return error } 
  }

  Company.executeActionFromCompanyLevel = globalFunction => Company.executeCompanyAction(globalFunction, undefined, undefined, response => update( log({response}, "AAAAAA") ) )
  




  //TBD
  Company.createEvent = async (eventType, process) => {

    let newEvent = await receivedDatabase.createEntity(46, [
      newDatom(`newEntity`, "event/eventTypeEntity", eventType),
      newDatom(`newEntity`, "event/process", process),
      newDatom(`newEntity`, "event/date", Date.now() )
    ])

    let updatedCompany = mergerino({}, Company)
    
    updatedCompany.events = Company.events.concat( newEvent.entity ).sort(  (a,b) => receivedDatabase.get(a, 'event/date' ) - receivedDatabase.get(b, 'event/date' ) )
    updatedCompany.companyDatoms = [] // Company.companyDatoms.filter( companyDatom => companyDatom.t <= updatedCompany.events.findIndex(newEvent.entity)  )
    updatedCompany.applyEvents( updatedCompany.events )
    update(  )
  }








  return Company


}


//Updated Company Construction pipeline -- END
























//Archive
