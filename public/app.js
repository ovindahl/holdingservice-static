


const Database = {
  tx: null,
  Entities: [],
  companyDatoms: [],
  setLocalState: (entity, newState) => {
    let updatedEntity = Database.get(entity)
    updatedEntity.localState = mergerino(updatedEntity.localState, newState) 
    Database.Entities = Database.Entities.filter( Entity => Entity.entity !== updatedEntity.entity ).concat( updatedEntity )
    update( Database.S )
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
    let valueType = Database.get( Database.attr(attribute), "attribute/valueType")
    let attributeIsArray = isDefined( Database.get(attribute, 5823) )
      ? Database.get(attribute, 5823)
      : false
    let valueInArray = attributeIsArray ? value : [value]
    let isValid_existingEntity = Database.Entities.map( E => E.entity).includes(entity)
    let valueTypeValidatorFunction = new Function("inputValue",  Database.get( valueType, "valueType/validatorFunctionString") )
    let isValid_valueType = valueInArray.every( arrayValue => log(valueTypeValidatorFunction)(arrayValue) ) 

    let isValid_attribute = new Function("inputValue",  Database.get( Database.attr(attribute), "attribute/validatorFunctionString") ) ( value )
    let isValid_notNaN = !Number.isNaN(value)


    //Add checks for whether attribtue is valid for the entity type?

    if( isValid_existingEntity && isValid_valueType && isValid_attribute && isValid_notNaN  ){

      let Datom = newDatom(entity, Database.attrName(attribute), value )
      let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( [Datom] ) )

      let updatedEntity = serverResponse[0]

      let latestTx = serverResponse[0].Datoms.map( Datom => Datom.tx ).filter( tx => !isUndefined(tx) ).sort().reverse()[0]

      updatedEntity.localState = {tx: latestTx }

      Database.Entities = Database.Entities.filter( Entity => Entity.entity !== updatedEntity.entity ).concat( updatedEntity )
      Database.tx = Database.Entities.map( Entity => Entity.Datoms.slice( -1 )[0].tx ).sort( (a,b) => a-b ).filter( v => isDefined(v) ).slice(-1)[0]

      if( updatedEntity.current["entity/entityType"] === 46  ){ Database.recalculateCompanies() }

      update( Database.S )

    }else{

      console.log("Database.updateEntity did not pass validation.", {isValid_existingEntity, isValid_valueType, isValid_attribute, isValid_notNaN })
      update(Database.S)

    }
    

  },
  updateEntityInBackground: async (entity, attribute, value) => {

    let valueType = Database.get( Database.attr(attribute), "attribute/valueType")
    let isValid_existingEntity = Database.Entities.map( E => E.entity).includes(entity)
    let isValid_valueType = new Function("inputValue",  Database.get( valueType, "valueType/validatorFunctionString") ) ( value )
    let isValid_attribute = new Function("inputValue",  Database.get( Database.attr(attribute), "attribute/validatorFunctionString") ) ( value )
    let isValid_notNaN = !Number.isNaN(value)


    //Add checks for whether attribtue is valid for the entity type?

    if( isValid_existingEntity && isValid_valueType && isValid_attribute && isValid_notNaN  ){

      let Datom = newDatom(entity, Database.attrName(attribute), value )
      let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( [Datom] ) )
      if( isNull(serverResponse) ){ return log({entity, attribute, value}, "Background sync unsuccesfull due to ongoning http request.") }
      let updatedEntity = serverResponse[0]
      let latestTx = serverResponse[0].Datoms.map( Datom => Datom.tx ).filter( tx => !isUndefined(tx) ).sort().reverse()[0]
      updatedEntity.localState = {tx: latestTx }
      Database.Entities = Database.Entities.filter( Entity => Entity.entity !== updatedEntity.entity ).concat( updatedEntity )
      Database.tx = Database.Entities.map( Entity => Entity.Datoms.slice( -1 )[0].tx ).sort( (a,b) => a-b ).filter( v => isDefined(v) ).slice(-1)[0]
      Database.recalculateCompanies()
    }else{

      console.log("Database.updateEntity did not pass validation.", {isValid_existingEntity, isValid_valueType, isValid_attribute, isValid_notNaN })

    }
  },
  createEntity: async (entityType, newEntityDatoms) => {

    let Datoms = Database.get( entityType, "entityType/attributes")
      .map( attribute => newDatom("newEntity", Database.attrName(attribute), new Function("S", Database.get(attribute, "attribute/startValue") )( Database )))
      .filter( datom => datom.attribute !== "entity/entityType" )
      .filter( datom => datom.attribute !== "entity/label" )
      .concat([
        newDatom("newEntity", "entity/entityType", entityType ),
        newDatom("newEntity", "entity/label", `[${Database.get(entityType, "entity/label")} uten navn]` ),
        newDatom("newEntity", "entity/category", `Mangler kategori` )
      ])


      log(Datoms)

    if(Array.isArray(newEntityDatoms)){Datoms = Datoms.concat(newEntityDatoms)}
    let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( Datoms ) )
    let updatedEntity = serverResponse[0]
    Database.Entities = Database.Entities.filter( Entity => Entity.entity !== updatedEntity.entity ).concat( updatedEntity )
    Database.recalculateCompanies()

    update( Database.S )
    return updatedEntity
  },
  createEvent: (eventType, parentProcess, attributeAssertions) => Database.createEvents(eventType, parentProcess, [ isDefined(attributeAssertions) ? attributeAssertions : {} ]),
  createEvents: async (eventType, parentProcess, attributeAssertions) => {

    

    let eventTypeAttributes = Database.get(eventType, "eventType/eventAttributes" )
    
    let Datoms = attributeAssertions.map( (attributeAssertion, index) => [
      newDatom(`newEntity ${index}`, "entity/entityType", 46 ),
      newDatom(`newEntity ${index}`, "event/eventTypeEntity", eventType),
      newDatom(`newEntity ${index}`, "event/process", parentProcess),
    ].concat(
      eventTypeAttributes
      .map( attribute => newDatom(`newEntity ${index}`, Database.attrName(attribute), Object.keys(attributeAssertion).includes( String( attribute ) ) 
        ? attributeAssertion[attribute]
        : new Function( ["Database"], Database.get(attribute, "attribute/startValue" ) )(Database) )   
      ))  ).flat()


    console.log("createEvents:", {attributeAssertions, Datoms})

    if(Datoms.every( Datom => isString(Datom.entity) && isString(Datom.attribute) && !isUndefined(Datom.value) )){

      let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( Datoms ) )
      let updatedEntities = serverResponse
      Database.Entities = Database.Entities.filter( Entity => !updatedEntities.map( updatedEntity => updatedEntity.entity  ).includes(Entity.entity) ).concat( updatedEntities )
      Database.tx = Database.Entities.map( Entity => Entity.Datoms.slice( -1 )[0].tx ).sort( (a,b) => a-b ).filter( v => isDefined(v) ).slice(-1)[0]
      Database.recalculateCompanies()
      update( Database.S )

    }else{log("Datoms not valid: ", Datoms)}
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
    Database.Entities = Database.Entities.filter( Entity => !entities.includes(Entity.entity) ).concat( serverResponse )
    Database.tx = Database.Entities.map( Entity => Entity.Datoms.slice( -1 )[0].tx ).sort( (a,b) => a-b ).filter( v => isDefined(v) ).slice(-1)[0]
    Database.recalculateCompanies()
    update( Database.S )
  },
  submitDatoms: async datoms => {
    let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( datoms ) )
    update( Database.S )
  },
  init: async () => { 
    Database.Entities = await sideEffects.APIRequest("GET", "Entities", null)
    Database.attrNames = mergeArray(Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 ).map( serverEntity => createObject(serverEntity.current["attr/name"], serverEntity.entity) ))
    Database.tx = Database.Entities.map( Entity => Entity.Datoms.slice( -1 )[0].tx ).sort( (a,b) => a-b ).filter( v => isDefined(v) ).slice(-1)[0]
    Database.companyDatoms = [];
    Database.calculatedFields = [];
    Database.getAll( 5722 ).forEach( company => Database.reconstructCompany(company) )
    return;
  },
  reconstructCompany: company => {
    let processes = Database.getAll(5692).filter( e => Database.get(e, "process/company" ) === company ) // [TBD] Change to calculatedField??
    let events = Database.getAll(46).filter( event => processes.includes( Database.get(event, "event/process") )  ).sort(  (a,b) => Database.get(a, "event/date" ) - Database.get(b, "event/date" ) ) // [TBD] Change to calculatedField??
    //let initialDatom = {company, entity: 1, attribute: 19, value: 5679, t: 1, event: events[0]}
    Database.companyDatoms = Database.companyDatoms.filter( Datom => Datom.company !== company ) //.concat([initialDatom]) 
    Database.calculatedFields = Database.calculatedFields.filter( Datom => Datom.company !== company )
    let companyDatoms = events.forEach( (event, index) => {
      let t = index + 1
      let eventType = Database.get( event, "event/eventTypeEntity" )
      let currentCompanyDatoms = Database.companyDatoms
      .filter( Datom => Datom.company === company )
      let latestEntityID = currentCompanyDatoms.length > 0
        ? currentCompanyDatoms.map( Datom => Datom.entity ).sort( (a,b) => a-b ).slice(-1)[0]
        : 0
      let eventDatoms = Database.get( eventType, "eventType/newDatoms" )
        .map( datomConstructor => {

          let entity;

            try {entity = new Function( [`Q`], datomConstructor.entity )( {latestEntityID: () => latestEntityID} )}
            catch (error) {entity = log("ERROR",{info: "entity calculation for datomconstructor failed", event, datomConstructor, error}) }

          let attribute = datomConstructor.attribute

          let fakeDatabase = {
            get: (entity, attribute) => log( Database.get(entity, attribute), {info: "hendelsestype bruker Database.get(), bør endres til Event/Process/Company", eventType, event} ),
            account: (accountNumber) => log( 5196, {info: "Database.account() brukes i hendelsestype, bør endres til kalkulert verdi", eventType, event} ),
          }

          let Company = {
            get: (entity, attribute) => {

              let matchingDatoms = companyDatoms
              .filter( Datom => Datom.entity === entity )
              .filter( Datom => Datom.attribute === attribute )
              
              let datom = (matchingDatoms.length > 0) 
                ? matchingDatoms.slice( -1 )[0]
                : undefined

              let value = isDefined(datom)
                ? datom.value
                : undefined

              return value

            },
            getEntityValueFromID: () => log( "ERROR", {info: "Company.getEntityValueFromID() brukes i hendelsestype, bør endres til kalkulert verdi", eventType, event} ),
            sumAccountBalance: () => log( 0, {info: "Company.sumAccountBalance() brukes i hendelsestype, bør endres til kalkulert verdi", eventType, event} ),

          }

          let Event = {
            get: attribute => Database.get(event, attribute),
          }

          let process = Database.get(event, "event/process")

          let Process = {
              get: attribute => Database.get(process, attribute),
              getEvents: () => Database.getCalculatedField( process, 6088 ).map( event => Database.get(event) )
          }

          let value;
          let error = "No errors";
            try {value = new Function( [`Database`, `Company`, `Event`, `Process`], datomConstructor.value )( fakeDatabase, Company, Event, Process ) } 
            catch (error) {value = log("ERROR",{info: "Value calculation for datomconstructor failed", event, datomConstructor, error}) } 
          let Datom = {company, entity, attribute, value, event, t, error}
          return Datom
        }  )
        .sort( (datomA, datomB) => datomA.entity - datomB.entity )
      Database.companyDatoms = Database.companyDatoms.concat(eventDatoms)
      
      let companyEntitiesToUpdate = Database.companyDatoms.map( companyDatom => companyDatom.entity ).filter(filterUniqueValues)

      let calculatedFieldDatoms = companyEntitiesToUpdate.map( companyEntity => {

        let entityType = Database.getFromCompany(company, companyEntity, 19)

        

        let calculatedFieldDatoms_event = isDefined(entityType)
          ? Database.get( entityType , "entityType/calculatedFields" ).map( calculatedField => {

          let Company = {
            entity: company
          }
      
          Company.get = (entity, attribute) => Database.getFromCompany(company, entity, attribute)
          Company.getAll = entityType => Database.companyDatoms
            .filter( companyDatom => companyDatom.company === company )
            .filter( companyDatom => companyDatom.attribute === 19 )
            .filter( companyDatom => companyDatom.value === entityType )
            .map(companyDatom => companyDatom.entity)
            .filter(filterUniqueValues)
      
          let Entity = {
            entity: companyEntity,
            event: Database.companyDatoms
            .filter( companyDatom => companyDatom.company === company )
            .filter( companyDatom => companyDatom.entity === companyEntity )
            [0].event,
          }
          Entity.get = attribute => Company.get(entity, attribute)
          
      
      
            let value;
            let error = "No error";
            try {
              let calculatedFieldFunction = new Function( ["Entity", "Company", "Database"],  Database.get(calculatedField, 6048) )
              value =  calculatedFieldFunction(Entity, Company, Database) 
            } 
            catch (err) {
              value = log("ERROR",{info: "CompanycalculatedValue calculation  failed", company, companyEntity, calculatedField, err}) 
              error = err;
            }

          
          let Datom = {company, entity: companyEntity, calculatedField, value, event, t, error}

          return Datom
        }) : []
        return calculatedFieldDatoms_event
      } ).flat()

      console.log({event, eventDatoms, calculatedFieldDatoms})

      Database.calculatedFields = Database.calculatedFields.concat(calculatedFieldDatoms)

    })
    let Company = Database.get(company)
    Company.t = Database.companyDatoms.slice(-1)[0].t;
    Database.Entities = Database.Entities.filter( Entity => Entity.entity !== company ).concat(Company)
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
  get: (entity, attribute, version) => {
    if(isUndefined(entity)){return log(undefined, `[ Database.get(${entity}, ${attribute}, ${version}) ]: received entity argument is undefined`)}
    let serverEntity = Database.Entities.find( serverEntity => serverEntity.entity === entity  )
    if(isUndefined(serverEntity)){return log(undefined, `[ Database.get(${entity}, ${attribute}, ${version}) ]: Entity does not exist`)}
    if(isDefined(attribute)){
      if( Database.getAll(42).includes( Database.attr(attribute) ) ){
        let Datom = serverEntity.Datoms
        .filter( Datom => Datom.attribute === Database.attrName(attribute) )
        .map( serverDatom => isUndefined(serverDatom.tx) ? mergerino(serverDatom, {tx: 0}) : serverDatom ) //NB: Some early datoms lacks tx.....
        .filter( serverDatom => isDefined(version) ? serverDatom.tx <= version : true )
        .slice(-1)[0]
        if(isUndefined(Datom)){return log(undefined, `[ Database.get(${entity}, ${attribute}, ${version}) ]: No attribute ${attribute} datoms exist for entity ${entity}`)}
        else{ return Datom.value}
      }else if(Database.getAll(5817).includes( attribute )){return Database.getCalculatedField(entity, attribute) } //returns calculatedField
    }else{
      let Entity = serverEntity;
      Entity.get = (attr, version) => Database.get(entity, attr, version)
      return Entity
    }
  },
  getFromCompany: (company, companyEntity, attribute, t) => {
    if(isUndefined(company)){return log(undefined, `[ Database.getFromCompany(${company}, ${companyEntity}, ${attribute}, ${t}) ]: received company argument is undefined`)}
    if(isUndefined(companyEntity)){return log(undefined, `[ Database.getFromCompany(${company}, ${companyEntity}, ${attribute}, ${t}) ]: received companyEntity argument is undefined`)}
    let matchingDatoms = Database.companyDatoms
      .filter( companyDatom => companyDatom.company === company  )
      .filter( companyDatom => companyDatom.entity === companyEntity  )
    if(matchingDatoms.length === 0){return log(undefined, `[ Database.getFromCompany(${company}, ${companyEntity}, ${attribute}, ${t}) ]: No matching company datoms`)}
    if(isDefined(attribute) ){
      if( Database.getAll(42).includes( Database.attr(attribute) ) ){
        let companyDatom = matchingDatoms
        .filter( companyDatom => companyDatom.attribute === attribute )
        .filter( companyDatom => isDefined(t) ? companyDatom.t <= t : true )
        .slice(-1)[0]
        if(isUndefined(companyDatom)){return log(undefined, `[ Database.getFromCompany(${company}, ${companyEntity}, ${attribute}, ${t}) ]: No attribute ${attribute} datoms exist for companyEntity ${companyEntity}`)}
        else{ return companyDatom.value}
      }else if(Database.getAll(5817).includes( attribute )){return Database.getCompanyCalculatedField(company, companyEntity, attribute, t) } //returns calculatedField
    }else{
      let CompanyEntity = {
        company: company,
        entity: companyEntity,
        companyDatoms: matchingDatoms
      };
      CompanyEntity.get = (attr, t) => {
        let matchingDatoms = CompanyEntity.companyDatoms
        .filter( companyDatom => companyDatom.attribute === attr )
        .filter( companyDatom => isDefined(t) ? companyDatom.t <= t : true )
        return matchingDatoms.length > 0 ? matchingDatoms.slice(-1)[0] : undefined
      } 

      return CompanyEntity
    }
  },
  getAll: entityType => Database.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === entityType ).map(E => E.entity),
  selectEntity: entity => update( mergerino(Database.S, {"UIstate": {"selectedEntity": entity}})  ),
  recalculateCompanies: () => Database.getAll( 5722 ).map( company => Database.reconstructCompany( company) ),
  getCompany: company => Database.get(company),
  getCalculatedField: (entity, eventField) => {

    let entityType = Database.get(entity, "entity/entityType")

    let systemEntityTypes = [42, 43, 44, 45, 47, 48, 5030, 5590, 5612, 5687, 5817];
    let realEntityTypes = [46, 5722, 5692]
    let companyEntityTypes = [5672, 5673, 5674, 5679, 5714, 5810, 5811, 5812]

    let Entity = Database.get(entity)


    
    

    let calculatedValue;
      try {calculatedValue = new Function( ["Entity", "Company"],  Database.get(eventField, 6048) ) (Entity) } 
      catch (error) {calculatedValue = log("ERROR",{info: "calculatedValue calculation  failed", entity, eventField, error}) }
      

    return calculatedValue




  },
  getCompanyCalculatedField: (company, companyEntity, calculatedField, t) => {

    let matchingDatoms = Database.calculatedFields
      .filter( companyDatom => companyDatom.company === company  )
      .filter( companyDatom => companyDatom.entity === companyEntity  )


    let companyDatom = matchingDatoms
        .filter( companyDatom => companyDatom.calculatedField === calculatedField )
        .filter( companyDatom => isDefined(t) ? companyDatom.t <= t : true )
        .slice(-1)[0]
        if(isUndefined(companyDatom)){return log(undefined, `[ Database.getCompanyCalculatedField(${company}, ${companyEntity}, ${calculatedField}, {t}) ]: No calculatedField ${calculatedField} datoms exist for companyEntity ${companyEntity}`)}
        else{ return companyDatom.value}




    let Company = {
      entity: company
    }

    Company.get = (entity, attribute) => Database.getFromCompany(company, entity, attribute)
    Company.getAll = entityType => Database.companyDatoms
      .filter( companyDatom => companyDatom.company === company )
      .filter( companyDatom => companyDatom.attribute === 19 )
      .filter( companyDatom => companyDatom.value === entityType )
      .map(companyDatom => companyDatom.entity)
      .filter(filterUniqueValues)

    let Entity = Database.getFromCompany(company, companyEntity)
    Entity.get = attribute => Company.get(entity, attribute)
    


      let calculatedValue;
      try {
        let eventFieldFunction = new Function( ["Entity", "Company", "Database"],  Database.get(eventField, 6048) )
        calculatedValue =  eventFieldFunction(Entity, Company, Database) 
      } 
      catch (error) {calculatedValue = log("ERROR",{info: "CompanycalculatedValue calculation  failed", company, companyEntity, eventField, error}) }

    return calculatedValue

  }
}

let D = Database


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

let getUserActions = (S, Database) => returnObject({
    updateLocalState: (patch) => update({
      UIstate: mergerino( S["UIstate"], patch )
    })
})


let update = ( S ) => {

  
    
    S.selectedCategories = Database.Entities
      .filter( serverEntity => serverEntity.current["entity/entityType"] === S["UIstate"].selectedEntityType )
      .map( serverEntity => Database.get(serverEntity.entity, "entity/category" ) )
      .filter(filterUniqueValues)
    
    S.selectedEntities = Database.Entities
      .filter( serverEntity => serverEntity.current["entity/entityType"] === S["UIstate"].selectedEntityType )
      .filter( serverEntity => serverEntity.current["entity/category"] === S["UIstate"].selectedCategory )
      .map( serverEntity => serverEntity.entity )
    
    Database.S = S;
    Admin.S = S;
    Admin.DB = Database
    D = Database

    console.log("State: ", S)
    let A = getUserActions(S, Database)
    Admin.A = A;

    let startTime = Date.now()

    
    
    S.elementTree = generateHTMLBody(S, A )
    sideEffects.updateDOM( S.elementTree )
    
    console.log(`generateHTMLBody finished in ${Date.now() - startTime} ms`)


    

    //backgroundDataSync(S)

    

}

let backgroundDataSync = S => {
  let userEntity = S.UIstate.user === "ovindahl@gmail.com" ? 5614 : 5613
  let savedState = Database.get(userEntity, 5615)
  let hasChanged = JSON.stringify(savedState) !== JSON.stringify(S.UIstate)
  if( hasChanged ){Database.updateEntityInBackground( userEntity, 5615, S.UIstate )}
}

sideEffects.configureClient();

let Admin = {
    S: null,
    A: null,
    updateClientRelease: (newVersion) => sideEffects.APIRequest("POST", "updateClientRelease", JSON.stringify({"clientVersion": newVersion})),
    resetServer: () => sideEffects.APIRequest("GET", "resetServer", null),
}

//Archive


let init = async () => {

  await Database.init();
  let user = await sideEffects.auth0.getUser()
  let userEntity = user.name === "ovindahl@gmail.com" ? 5614 : 5613
  let userState = Database.get(userEntity, 5615 )

  let S = {
    UIstate: userState ? userState : {
      "user": user.name,
      "currentPage": "Prosesser",
      "selectedEntityType" : 42,
      "selectedCategory": undefined,
      "selectedEntity": 6,
    }
  }

    update( S )



}






/* 
createCompany: company => {


    let companyProcesses = Database.getAll(5692)
    .filter( e => Database.get(e, "process/company" ) === company )

    let events = Database.getAll(46)
    .filter( event => companyProcesses.includes( Database.get(event, "event/process") )  )
    .sort(  (a,b) => Database.get(a, "event/date" ) - Database.get(b, "event/date" ) )


    let Company = events.reduce( (Company, event, index) => {
        let Event = Database.getEvent(event);
        let t = index + 1
        Company.t = t;
        let Q = {latestEntityID: () => Company.latestEntityID}
        
        let eventDatoms = Database.get( Database.get(event, "event/eventTypeEntity") , "eventType/newDatoms").map( datomConstructor => {
          let datom;
          try {
            datom = {"entity": new Function( [`Q`, `Database`, `Company`, `Event`], datomConstructor["entity"] )( Q, Database, Company, Event ), "attribute": datomConstructor.attribute, "value": new Function( [`Q`, `Database`, `Company`, `Event`], datomConstructor["value"] )( Q, Database, Company, Event ),"t": t }
            
          
          }
          catch (error) {datom = {"entity": new Function( [`Q`, `Database`, `Company`, `Event`], datomConstructor["entity"] )( Q, Database, Company, Event ),"attribute": datomConstructor.attribute,"value": "ERROR" ,"t": t, "error": String(error)}}
          finally{return datom}
        }).sort( (datomA, datomB) => datomA.entity - datomB.entity )
        
        
        Company.Datoms = Company.Datoms.concat(eventDatoms)

        Company.Entities = Object.values(Company.Datoms.reduce( (Entities, Datom) => mergerino(
          Entities,
          createObject(Datom.entity, {entity: Datom.entity, t: Datom.t}),
          createObject(Datom.entity, createObject(Datom.attribute, Datom.value ))
        ), [] ));

        

        Company.getDatom = (entity, attribute, t) => Company.Datoms
          .filter( Datom => Datom.entity === entity )
          .filter( Datom => Datom.attribute === attribute )
          .filter( Datom => isDefined(t) ? Datom.t <= t : true )
          .slice( -1 )[0]

        Company.get = (entity, attribute, t) => isDefined(Company.getDatom(entity, attribute, t))
          ? Company.getDatom(entity, attribute, t).value
          : undefined

        Company.getAll = (entityType, t) => Company.Entities
          .filter( companyEntity => companyEntity["19"] === entityType )
          .filter( Datom => isDefined(t) ? Datom.t <= t : true )
          .map( companyEntity => companyEntity.entity )

        Company.getOptions = (attribute, t) => {

          let options = [];

          try {options = new Function( ["Database", "Company", "t"] , Database.get(attribute, "attribute/selectableEntitiesFilterFunction") )( Database, Company, t )} 
          catch (error) { log(error) }

          return options

        }

        Company.id = id => {

          let matchingDatoms = Company.Datoms
          .filter( Datom => isDefined( Company.getDatom(Datom.entity, 19) ) )
          .filter( Datom => [1112, 1131, 1080, 1086, 1097, 1137, 5811, 5812].includes( Datom.attribute ) )
          .filter( Datom => Datom.value === id )

          return matchingDatoms.length > 0
            ? matchingDatoms[ 0 ].entity
            : undefined
        } 
          

        Company.getEntityValueFromID = (id, attribute) => Company.get( Company.id(id), attribute )

        Company.getAccountBalance = accountNumber => Company.getAll( 5672 )
          .filter( e => isNumber( Company.get(e, 1653) ) )
          .filter( e => Company.get(e, 1653) === Database.account(accountNumber) )
          .reduce( (sum, e) => sum + Company.get(e, 1083), 0 )


        Company.sumAccountBalance = accountNumbers => Company.getAll( 5672 )
        .filter( e => isNumber( Company.get(e, 1653) ) )
        .filter( e => accountNumbers.map( accountNumber => Database.account(accountNumber)  ).includes( Company.get(e, 1653) )  )
        .reduce( (sum, e) => sum + Company.get(e, 1083), 0 )

        Company.latestEntityID = Company.Datoms
            .map( Datom => Datom.entity )
            .sort( (a, b) => a - b )
            .slice( -1 )[0]

        return Company
      } , {
        entity: company,
        events: events,
        Datoms: [],
        Entities: [],
        latestEntityID: 0
      }  )
    
    return Company;
  },
*/

//let newAttributes = []
    //let datoms = prepareImportDatoms(newAttributes)
    //let serverResponse = Database.submitDatoms(datoms)
    //console.log("serverResponse", serverResponse)

  //let prepareImportDatoms = newAttributesArray => newAttributesArray.map( attrObject =>  Object.entries(attrObject).filter(entry => entry[0] !== "entity" ).map( entry => newDatom(attrObject.entity, entry[0], entry[1] ) )   ).flat()

