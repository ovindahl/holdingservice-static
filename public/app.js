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

const Database = {
  tx: null,
  Entities: [],
  entities: [],
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
    return serverResponse
  },
  submitDatoms: async datoms => {
    let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( datoms ) )
    return serverResponse
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
          if(isUndefined(Datom)){return undefined}
          else{ return Datom.value}
        }else if( Database.isCalculatedField(attribute) ){return log(undefined, `[ Database.get(${entity}, ${attribute}, ${version}) ]: Calculated fields for non-company entities not supported`) } //returns calculatedField
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
    Entity.tx = Entity.Datoms.slice( -1 )[ 0 ].tx
    Entity.get = (attr, version) => Database.get(entity, attr, version)
    Entity.entityType = Entity.get("entity/entityType")
    Entity.color = Database.get( Entity.entityType, "entityType/color") ? Database.get( Entity.entityType, "entityType/color") : "#bfbfbf"

    Entity.label = () => (Entity.entityType === 5692)
      ? `[${entity}] Prosess ${ClientApp.Company.processes.findIndex( p => p === entity ) + 1}: ${Database.get( Database.get(entity, "process/processType"), "entity/label")} `
      : (Entity.entityType === 46)
        ? `[${entity}] Hendelse ${ClientApp.Company.events.findIndex( e => e === entity ) + 1}: ${Database.get( Database.get(entity, "event/eventTypeEntity"), "entity/label")} `
        : Entity.get("entity/label") ? Entity.get("entity/label") : "Mangler visningsnavn."

    
    
    Entity.getOptions = attr => Database.getOptions(attr)
    Entity.replaceValue = async (attribute, newValue) => Database.updateEntity(entity, attribute, newValue )
    Entity.addValueEntry = async (attribute, newValue) => await Entity.replaceValue( attribute,  Entity.get(attribute).concat( newValue )  )
    Entity.removeValueEntry = async (attribute, index) => await Entity.replaceValue( attribute,  Entity.get(attribute).filter( (Value, i) => i !== index  ) )

    Entity.replaceValueEntry = async (attribute, index, newValue) => {
      let Values = Entity.get(attribute)
      await Entity.replaceValue( attribute,  Values.slice(0, index ).concat( newValue ).concat( Values.slice(index + 1, Values.length ) ) )
    } 

    Entity.getActions = () =>  [
      {label: "Slett", isActionable: true, actionFunction: async e => await Database.retractEntity(entity) },
      {label: "Legg til", isActionable: true, actionFunction: async e => await Database.createEntity(Entity.entityType)  },
      {label: "Lag kopi", isActionable: true, actionFunction: async e => {

        let entityType = Entity.get("entity/entityType")
        let entityTypeAttributes = Database.get( entityType, "entityType/attributes" )
        let newEntityDatoms = entityTypeAttributes.map( attr => newDatom("newEntity", Database.attrName(attr), Entity.get(attr) ) ).filter( Datom => Datom.attribute !== "entity/label" ).concat( newDatom("newEntity", "entity/label", `Kopi av ${Entity.get(6)}` ) )
        if(entityType === 42){ newEntityDatoms.push( newDatom( "newEntity", "attr/name", "attr/" + Date.now() )  ) }
        let newEntity = await Database.createEntity(entityType, newEntityDatoms)
        AdminApp.updateState({selectedEntity: newEntity.entity})

      }   },
    ]

    Entity.getView = () => entityView( Entity )

    return Entity
  },
  getEntityAttribute: (entity, attribute, version) => {

    let Entity = Database.getEntity( entity )
    let EntityAttributeDatoms = Entity.Datoms.filter( Datom => Datom.attribute === Database.attrName(attribute) )
    let valueType = Database.get(attribute, "attribute/valueType")
    let isArray = Database.get(attribute, "attribute/isArray")

    let EntityAttribute = {
      entity, attribute, valueType, isArray,
      Datoms: EntityAttributeDatoms,
    }

    EntityAttribute.getView = () => entityAttributeView( EntityAttribute )

    return EntityAttribute
  },
  getAll: entityType => Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === entityType ).map(E => E.entity), //Kan bli sirkulær med isAttribute
  getOptions: (attribute, tx ) => {
    let options = [];
    try {options = new Function( ["Database"] , Database.get(attribute, "attribute/selectableEntitiesFilterFunction", tx) )( Database )}
    catch (error) { log(error, {info: "Could not get options for DB attribute", attribute, tx }) }
    return options
  },
  getGlobalFunction: functionEntity => {

    let argumentObjects = Database.get(functionEntity, "function/arguments")
    let arguments = argumentObjects.map( argumentObject => argumentObject["argument/name"] )
    let statementObjects = Database.get(functionEntity, "function/statements")
    let statements = statementObjects.filter( statementObject => statementObject["statement/isEnabled"] ).map( statementObject => statementObject["statement/statement"] )
    let functionString = statements.join(";")
    let globalFunction = new Function( arguments, functionString  )    

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
  getCompanyOptionsFunction: attr => new Function(["Company", "Entity"], Database.get( attr, "attribute/selectableEntitiesFilterFunction"  )), 
  getCompany: company => {

    let Company = constructCompanyDocument( Database, company )


    Company.getAction = ( actionEntity, Event, Process, Wildcard ) => {


      let asyncFunction = Database.getGlobalAsyncFunction( actionEntity )
      let argumentObjects = Database.get(actionEntity, "function/arguments")
      let arguments = argumentObjects.map( argumentObject => argumentObject["argument/name"] )

      let criteriumStatementObjects = Database.get(actionEntity, "function/criteriumStatements") ? Database.get(actionEntity, "function/criteriumStatements") : []
      let criteriumStatements = criteriumStatementObjects.filter( statementObject => statementObject["statement/isEnabled"] ).map( statementObject => statementObject["statement/statement"] )

      let criteriumFunctionString = criteriumStatements.join(";")
      let criteriumFunction = new Function( arguments, criteriumFunctionString  )    

      let isActionable = criteriumFunction( Database, Company, Process, Event  )

      let updateCallback = selectedEntity => {
        ClientApp.recalculateCompany( company )
        ClientApp.updateState( {selectedEntity } )
        log( "Handling gjennomført" )
      } 

      

      let Action = {
          entity: actionEntity,
          label: Database.getEntity(actionEntity).label(),
          isActionable,
          execute: async () => {
            if( isActionable ) {
              try {  await asyncFunction( Database, Company, Process, Event, Wildcard ).then( updateCallback  )  } catch (error) { return log(error, {info: "ERROR: Action.execute() failed" } ) }
            } else { ClientApp.update( log({info: "Action is not actionable:", actionEntity}) )  }

          }
    }


    return Action
    }

    Company.getActions = () => Database.getAll(5687)
      .map( processType => returnObject({
        isActionable: Database.get(processType, "processType/creationCriteria")
        .filter( statement =>  statement["statement/isEnabled"] )
        .every( statement => new Function( ["Database", "Company" ], statement["statement/statement"] )( Database, Company )  ),
        label: "Opprett prosess: " + Database.getEntity(processType).label() ,
        execute: async () => {
          let newEntity = await Database.createEntity(5692, [ newDatom( 'newEntity' , 'process/company', Company.entity  ), newDatom( 'newEntity' , 'process/processType', processType ) ] )
          ClientApp.recalculateCompany( company )
          ClientApp.updateState( {selectedEntity: newEntity.entity } )
        }
      })  )

    Company.getProcessActions = process => {

      let processActions = [6628].map( actionEntity => Company.getAction( actionEntity, undefined, Company.getProcess( process ) ) )

      let newEventActions = Database.get( Database.get( process , "process/processType") , "processType/eventTypes").map( eventType => returnObject({
        isActionable: true,
        label: "Opprett hendelse: " + Database.getEntity(eventType).label(),
        execute: async () => {
          let newEvent = await Database.createEntity(46, [ newDatom( 'newEntity' , 'event/process', process  ), newDatom( 'newEntity' , 'event/eventTypeEntity', eventType ), newDatom( 'newEntity' , "event/date", Date.now() ) ])
          ClientApp.recalculateCompany( company )
          }
      })   )

      return processActions.concat( newEventActions )
    } 
    
    Company.getEventActions = event => [
      Company.getAction(6635, Company.getEvent(event), Company.getProcess( Database.get(event, "event/process") )  ),
      returnObject({isActionable: true, label: "Oppdatter selskapsdokumentet", execute: () => ClientApp.recalculateCompany( company )  }),
      Company.getAction(7090, Company.getEvent(event), Company.getProcess( Database.get(event, "event/process") )  ),
    ]

    return Company
  },
}






const ClientApp = {
  isActive: false,
  Company: undefined,
  S: {
    t0: Date.now()
  },
  updateState: patch => ClientApp.S = mergerino( ClientApp.S, patch ),
  replaceState: newState => ClientApp.S = newState,
  recalculateCompany: company => ClientApp.Company = Database.getCompany( company ),
  update: () => {
    AdminApp.isActive = false
    ClientApp.isActive = true
    D = Database
    Company = ClientApp.Company 
    
    let startTime = Date.now()
    let elementTree = [clientPage(Company)]
    sideEffects.updateDOM( elementTree )
    console.log(`generateHTMLBody finished in ${Date.now() - startTime} ms`)
}
}

const AdminApp = {
  isActive: false,
  S: {
    selectedPage: "Admin",
    selectedEntity: 1,  
  },
  updateState: patch => AdminApp.S = mergerino( AdminApp.S, patch ),
  replaceState: newState => AdminApp.S = newState,
  update: () => {
    ClientApp.isActive = false
    AdminApp.isActive = true
    
    D = Database
    Company = ClientApp.Company 
    
    let startTime = Date.now()
    let elementTree = [ adminPage( Company ) ]
    sideEffects.updateDOM( elementTree )
    console.log(`generateHTMLBody finished in ${Date.now() - startTime} ms`)
}
}

let D = Database
let Company = {}

let newDatom = (entity, attribute, value, isAddition) => returnObject({entity, attribute, value, isAddition: isAddition === false ? false : true })

let update = () => {
    D = Database
    Company = ClientApp.Company 
    
    let startTime = Date.now()
    let elementTree = AdminApp.isActive ? [ adminPage( Company ) ] : [ clientPage(Company) ]
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

  let company = 6829
  ClientApp.recalculateCompany( company )
  ClientApp.updateState( {selectedEntity: company } )
  ClientApp.update(  )
}

sideEffects.configureClient();

//Archive