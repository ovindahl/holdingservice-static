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
        let startTime = Date.now()
    
        let APIendpoint = `https://holdingservice.appspot.com/api/${endPoint}`
    
        let authToken = await sideEffects.auth0.getTokenSilently()
        let headers = {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken}
        let response = (type === "GET") ? await fetch(APIendpoint, {method: "GET", headers: headers })
                                        : (type === "POST") ? await fetch(APIendpoint, {method: "POST", headers: headers, body: stringBody })
                                        : console.log("ERROR: Invalid HTTP method: ", type, endPoint, body )
        let parsedResponse = await response.json()
        
        let duration = Date.now() - startTime;
        console.log(`Executed ${type} request to '/${endPoint}' in ${duration} ms.`, parsedResponse)
        sideEffects.isIdle = true;
        return parsedResponse;
        
      }else{
        console.log("Declined HTTP request, another in progress:", type, endPoint, stringBody )
      }

        
    },
    auth0: null,
    configureClient: async () => {
  
        sideEffects.auth0 = await createAuth0Client({
          domain: "holdingservice.eu.auth0.com",
          client_id: "3BjA7O8H2dGx2g2nhssoFie0vWWx7ne5",
          audience: "localhost:3000/api"
        }); //This call is for some reason never resolved..
    
        let isAuthenticated = await sideEffects.auth0.isAuthenticated();
    
    
        if(isAuthenticated){
            console.log("Authenticated");
            
            let serverResponse = await sideEffects.APIRequest("GET", "userContent", null)
            if( serverResponse === null){console.log("Received null")}
            else{

              let initialUIstate = {
                "currentPage": "timeline",
                "selectedOrgnumber": "818924232",
                "companyDocPage/selectedVersion": 1,
                "currentSubPage" : "attribute",
                "selectedCategory": "Hendelsesattributter",
                "selectedEntity": 3174,
                "selectedAdminEntity": 3174
              }

              update({
                UIstate: initialUIstate,
                sharedData: updateData( serverResponse )
              })
            }
            
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
    
    },
    submitDatomsWithValidation: async (S, Datoms) => {
      if(sideEffects.isIdle){
        if(Datoms.filter( d => d.attribute !== "attr/name" ).every( datom => validateAttributeValue(S, getAttributeEntityFromName(S, datom.attribute), datom.value) )){return returnObject({
            UIstate: S["UIstate"],
            sharedData: updateData(await sideEffects.APIRequest("POST", "transactor", JSON.stringify( Datoms )) )
          }) }
        else{console.log("ERROR: Datoms not valid: ", Datoms)}
        }
      else{console.log("ERROR: HTTP request already in progress, did not submit datoms.", Datoms)}
    }
}

//Company construction: To be moved to server

let getAttributeEntityFromName = (S, attributeName) => S.findEntities( e => e["entity/type"] === "attribute" ).filter( a => a["attr/name"] === attributeName )[0]["entity"]

let validateAttributeValue = (S, attributeEntity, value) =>  new Function(`inputValue`, S.getEntity( attributeEntity )["attribute/validatorFunctionString"] )( value )

let eventAttributesAreValid = (S, eventAttributes) => S.getEntity(  eventAttributes["event/eventTypeEntity"] )["eventType/eventAttributes"]
  .every( attributeEntity =>  
    validateAttributeValue(S, attributeEntity, eventAttributes[ S.getEntity( attributeEntity )["attr/name"] ] )
  )

let combinedEventIsValid = (S, eventAttributes, companyVariables) => S.getEntity( eventAttributes["event/eventTypeEntity"] )["eventType/eventValidators"]
  .every( entity =>  
    new Function([`eventAttributes`, `companyFields`], S.getEntity(entity)["eventValidator/validatorFunctionString"])( eventAttributes, companyVariables )
  )
    
let newTransaction = (date, description, records) => returnObject({date, description, records}) 

let constructCompanyDoc = (S, storedEvents) => {

  let initialCompanyDoc = {}

  let docVersions = [initialCompanyDoc]

  let appliedEvents = []
  let rejectedEvents = []

  storedEvents.forEach( (eventAttributes, index) => {
    let Event = {eventAttributes}
    if(rejectedEvents.length > 0){ rejectedEvents.push( Event ) }
    else{
      let eventType = S.getEntity(  eventAttributes["event/eventTypeEntity"] )
      let attributesAreValid = eventAttributesAreValid(S, eventAttributes)
      if(!attributesAreValid){rejectedEvents.push( Event ) }
      else{
        let companyDoc = docVersions[index]
        let companyVariables = mergeArray( eventType["eventType/requiredCompanyFields"].map( entity => createObject( entity, companyDoc[ entity ] )  ) )  //validation TBD
        Event.companyVariables = companyVariables
        let eventIsValid = combinedEventIsValid(S, eventAttributes, companyVariables)
        if(!eventIsValid){
          Event.errors = eventType["eventType/eventValidators"]
          .map( entity =>  
            new Function([`eventAttributes`, `companyFields`], S.getEntity(entity)["eventValidator/validatorFunctionString"])( eventAttributes, companyVariables )
              ? null
              : S.getEntity(entity)["eventValidator/errorMessage"]
          ).filter( error => error !== null )
          rejectedEvents.push( Event )
        }
        else{

            let eventFieldConstructor = entity => new Function( [`eventAttributes`, `companyFields`, `updatedEventFields`], eventType["eventType/eventFieldConstructors"][entity] )

            let eventFieldsToUpdate = Object.keys(eventType["eventType/eventFieldConstructors"])

            Event.eventFields = eventFieldsToUpdate.reduce( (updatedEventFields, entity) => mergerino( 
              updatedEventFields, 
              createObject(entity, eventFieldConstructor( entity )( eventAttributes, companyVariables, updatedEventFields ) )
            ), {} )

            appliedEvents.push( Event )

            let existingCompanyFields = Object.keys(companyDoc).concat(   ).filter( filterUniqueValues )
            let directDependencies = eventFieldsToUpdate.map( eventFieldEntity => S.getEntity(eventFieldEntity)["eventField/companyFields"]  ).flat()
            let companyFieldsToKeep = existingCompanyFields.filter( entity => !directDependencies.includes(entity) )
            let dependenceisToUpdate = directDependencies.map( e => getDependencies(S, e) ).flat()
            let companyFieldsToUpdate = directDependencies.concat(dependenceisToUpdate)
            
            let updatedFields = companyFieldsToUpdate.reduce( (updatedCompanyFields, entity) => mergerino( updatedCompanyFields, createObject(
              entity, //NB: Need better approach for undefined prevValue
              new Function([`prevValue` , `calculatedEventAttributes`, `companyFields`], S.getEntity(entity)["companyField/constructorFunctionString"])( ((typeof updatedCompanyFields[entity] === "undefined") ? 0 : updatedCompanyFields[entity]), Event.eventFields, updatedCompanyFields ) 
            )), companyDoc )

            //console.log(eventType["entity/label"], companyFieldsToUpdate, updatedFields)

            let newDocVersion =  mergeArray( companyFieldsToKeep.map( entity => createObject(entity, companyDoc[entity] ) ).concat( updatedFields ) )
            docVersions.push(newDocVersion)
        }
      }
    }
  })

  //Change to user-friendly labels?

  let Company = {
    orgnumber: storedEvents[0]["event/incorporation/orgnumber"],
    name: storedEvents[0]["event/attribute83"],
    appliedEvents,
    companyFields: docVersions,
    rejectedEvents
  }

  return Company

}

let getDependencies = (S, entity) => S.getEntity(entity)["companyField/companyFields"].concat( S.getEntity(entity)["companyField/companyFields"].map( e => getDependencies(S, e) ).flat()  )

//Company construction END


let newDatom = (entity, attribute, value, isAddition) => returnObject({entity, attribute, value, isAddition: isAddition === false ? false : true })

let updateData = serverResponse => returnObject({
  "E": serverResponse["E"],
  "latestTxs": serverResponse["latestTxs"].sort( (a, b) => b.tx - a.tx ),
})

let getRetractionDatomsWithoutChildren = Entities => Entities.map( Entity =>  Object.entries( Entity ).map( e => newDatom(Entity["entity"], e[0], e[1], false) ).filter( d => d["attribute"] !== "entity" ) ).flat() //Need to also get children

let defaultEntityDatoms = (type, label, doc, category) => [
  newDatom("newEntity", "entity/type", type),
  newDatom("newEntity", "entity/label", label ? label : "[Mangler visningsnavn]"),
  newDatom("newEntity", "entity/doc", doc ? doc : "Mangler kategori" ),
  newDatom("newEntity", "entity/category", category ? category : "Mangler kategori" )
] //Should be added to DB

const datomsByEventType = {
  "eventType": [
    newDatom("newEntity", "eventType/eventAttributes", [] ),
    newDatom("newEntity", "eventType/requiredCompanyFields", [] ),
    newDatom("newEntity", "eventType/eventValidators", [] ),
    newDatom("newEntity", "eventType/eventFieldConstructors", {} ),
  ],
  "eventField": [
    newDatom("newEntity", "eventField/companyFields", [] ),
  ],
  "companyField": [
    newDatom("newEntity", "companyField/constructorFunctionString", `return 0;`),
    newDatom("newEntity", "companyField/companyFields", []),
  ],
  "eventValidator": [
    newDatom("newEntity", "eventValidator/validatorFunctionString", "return true;" ),
    newDatom("newEntity", "eventValidator/errorMessage", "[errorMessage]" ),
  ],
} //Should be added to DB

let getUserActions = (S) => returnObject({
    updateLocalState: (patch) => update( {
      UIstate: mergerino( S["UIstate"], patch ), 
      sharedData: S["sharedData"] 
    }),
    updateEntityAttribute: async (entity, attribute, value) => update( await sideEffects.submitDatomsWithValidation(S, [newDatom(Number(entity), attribute, value)] )),
    retractEntity: async entity => update( await sideEffects.submitDatomsWithValidation(S,  getRetractionDatomsWithoutChildren( [S.getEntity(entity) ]))),
    createAttribute: async () => update( await sideEffects.submitDatomsWithValidation(S, 
      defaultEntityDatoms("attribute", "[Attributt uten navn]", "[Attributt uten dokumentasjon]", S["UIstate"].selectedCategory ).concat([
        newDatom("newEntity", "attr/name", "event/attribute" + S.findEntities( e => e["entity/type"] === "attribute" ).length ),
        newDatom("newEntity", "attribute/validatorFunctionString", `return (typeof inputValue !== "undefined");`),
      ]) )),
    createEntity: async type => update( await sideEffects.submitDatomsWithValidation(S, 
      defaultEntityDatoms(type, `[${type}] uten navn`, `[${type}] Beskrivelse mangler.`, S["UIstate"].selectedCategory).concat( datomsByEventType[type] ) 
    )),
    createEvent: async ( prevEvent, newEventTypeEntity ) => update( await sideEffects.submitDatomsWithValidation(S, 
      defaultEntityDatoms("event", `Selskapshendelse for ${prevEvent["eventAttributes"]["event/incorporation/orgnumber"]}`, `Selskapshendelse for ${prevEvent["eventAttributes"]["event/incorporation/orgnumber"]}`, null).concat( [
        newDatom("newEntity", "event/eventTypeEntity", newEventTypeEntity),
        newDatom("newEntity", "event/incorporation/orgnumber", prevEvent["eventAttributes"]["event/incorporation/orgnumber"] ),
        newDatom("newEntity", "event/index", prevEvent["eventAttributes"]["event/index"] + 1 ),
        newDatom("newEntity", "event/date", prevEvent["eventAttributes"]["event/date"] ),
        newDatom("newEntity", "event/currency", "NOK")
      ]))),
})

let update = (S) => {

    //To be fixed...
    S.getEntity = entity => S["sharedData"]["E"][entity] ? S["sharedData"]["E"][entity] : logThis(null, `Entitet [${entity}] finnes ikke` )
    S.findEntities = filterFunction => Object.values(S["sharedData"]["E"]).filter( filterFunction )
    S.getUserEvents = () => S.findEntities( e => e["entity/type"] === "event" ) //S["sharedData"]["userEvents"]
    S.getLatestTxs = () => S["sharedData"]["latestTxs"]
    
    S.getAll = entityType => S.findEntities( e => e["entity/type"] === entityType )
    S.getAllOrgnumbers = () => S.getUserEvents().map( E => E["event/incorporation/orgnumber"] ).filter( filterUniqueValues )
    S.getEntityLabel = entity => S.getEntity(entity)["entity/label"] ? S.getEntity(entity)["entity/label"] : `[${entity}] Visningsnavn mangler`
    S.getEntityDoc = entity => S.getEntity(entity)["entity/doc"] ? S.getEntity(entity)["entity/doc"] : `[${entity}] Dokumentasjon mangler`
    S.getEntityType = entity => S.getEntity(entity)["entity/type"] ? S.getEntity(entity)["entity/type"] : `[${entity}] Entitetstype mangler`
    S.getEntityCategory = entity => S.getEntity(entity)["entity/category"] ? S.getEntity(entity)["entity/category"] : `[${entity}] Kategori mangler`
    S.getEntityNote = entity => S.getEntity(entity)["entity/note"] ? S.getEntity(entity)["entity/note"] : `[${entity}] Ingen notat`

    S["UIstate"].selectedEntity = (S.getEntity(S["UIstate"].selectedEntity) === null) ? 3174 : S["UIstate"].selectedEntity
    S["UIstate"].selectedAdminEntity = (S.getEntity(S["UIstate"].selectedAdminEntity) === null) ? 3174 : S["UIstate"].selectedEntity
    
    try {
      S["selectedCompany"] = constructCompanyDoc(S, S.getUserEvents()
      .filter( eventAttributes => eventAttributes["event/incorporation/orgnumber"] === S["UIstate"].selectedOrgnumber )
      .sort( (a, b) => a["event/index"] - b["event/index"]  ) )

      console.log(S["selectedCompany"])
      
    } catch (error) {
      console.log(error)
    }    

    Admin.S = S;

    console.log("State: ", S)
    let A = getUserActions(S)
    //A.retractEntity(7251) //KBankinnskudd
    S.elementTree = generateHTMLBody(S, A )
    sideEffects.updateDOM( S.elementTree )
}

sideEffects.configureClient();

let Admin = {
    S: null,
    updateClientRelease: (newVersion) => Admin.submitDatoms([newDatom(2829, "transaction/records", {"serverVersion":"0.3.2","clientVersion":newVersion})], null),
    resetServer: () => sideEffects.APIRequest("GET", "resetServer", null),
    submitDatoms: async (datoms) => datoms.length < 5000
    ? await sideEffects.APIRequest("POST", "transactor", JSON.stringify( logThis(datoms, "Datoms submitted to Transactor.") )) 
    : console.log("ERROR: Too many datoms: ", datoms),
    getEntity: e => Admin.S.getEntity(e),
    findEntities: filterFunction => Admin.S.findEntities(filterFunction),
    updateEntityAttribute: async (entityID, attribute, value) => await Admin.submitDatoms([newDatom(entityID, attribute, value)]),
    retractEntities: async entities => await Admin.submitDatoms( getRetractionDatomsWithoutChildren(entities.map( e => Admin.S.getEntity(e) )) ),
    retractEntity: async entity => await Admin.retractEntities([entity]),
    createAttribute: async (attrName, valueType, label, category, doc) => await Admin.submitDatoms([ 
      newDatom("newAttribute", "attr/name", attrName),
      newDatom("newAttribute", "attr/valueType", valueType),
      newDatom("newAttribute", "entity/label", label),
      newDatom("newAttribute", "entity/category", category),
      newDatom("newAttribute", "attribute/validatorFunctionString", `return (typeof inputValue !== "undefined");`),
      newDatom("newAttribute", "entity/doc", doc)
    ]),
    getServerCache: async () => await sideEffects.APIRequest("GET", "serverCache", null)
}