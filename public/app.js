
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
                "selectedEntityType" : 7684,
                "selectedCategory": "Hendelsesattributter",
                "selectedEntity": 3174,
                "selectedAdminEntity": 3174,
                "currentSearchString": "Søk etter entitet",
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
        if(Datoms.filter( d => d.attribute !== "attr/name" ).every( datom => validateDatom(S, datom) )){
          
          let serverResponse = await sideEffects.APIRequest("POST", "transactor", JSON.stringify( Datoms )) 

          let newState = {
            UIstate: S["UIstate"],
            sharedData: updateData(serverResponse)
          }
          
          return newState }
        else{return logThis(S,["ERROR: Datoms not valid: ", Datoms])}
        }
      else{return logThis(S,["ERROR: HTTP request already in progress, did not submit datoms.", Datoms])}
    }
}


let validateDatom = (S, datom) => {

  let isExistingEntity = (typeof datom.entity === "number")
  let attribute = (typeof datom.attribute === "string") ? getAttributeEntityFromName(S, datom.attribute) : datom.attribute

  if(isExistingEntity){
    let Entity = S.getEntity(datom.entity)
    let EntityType = S.getEntity(Entity["entity/entityType"])
    let isRetraction = !datom.isAddition
    let isEvent = EntityType.entity === 7790
    let isValidAttributeForEntityType = EntityType["entityType/attributes"].includes(attribute) //Event har varierende attributter...
    let eitherOr = (isEvent || isValidAttributeForEntityType || isRetraction)


    if(eitherOr){
      
      let Attribute = S.getEntity( attribute  )
      let ValueType = S.getEntity(Attribute["attribute/valueType"])
      let isValidValueType = new Function("inputValue", ValueType["valueType/validatorFunctionString"] )(datom.value)
      if(isValidValueType){    
        let isValidAttributeValue = new Function("inputValue", Attribute["attribute/validatorFunctionString"] )(datom.value)
        if(isValidAttributeValue){    
          return true
        }else{return logThis(false, ["Value did not pass global attribute validation", datom])}
        
      }else{return logThis(false, ["Value is not valid for the valueType of the selected attribute", datom])}
      
    }else{return logThis(false, ["Attribute is not valid for the selected entity type", datom])}
    
  }else{
    let Attribute = S.getEntity( attribute  )
    let ValueType = S.getEntity(Attribute["attribute/valueType"])
    let isValidValueType = new Function("inputValue", ValueType["valueType/validatorFunctionString"] )(datom.value)
    if(isValidValueType){    
      let isValidAttributeValue = new Function("inputValue", Attribute["attribute/validatorFunctionString"] )(datom.value)
      if(isValidAttributeValue){    
        return true
      }else{return logThis(false, ["Value did not pass global attribute validation", datom])}
        
    }else{return logThis(false, ["Value is not valid for the valueType of the selected attribute", datom])}
  }


}



//Company construction: To be moved to server

let getAttributeEntityFromName = (S, attributeName) => S.findEntities( e => e["entity/entityType"] === 7684 ).filter( a => a["attr/name"] === attributeName )[0]["entity"]

let validateAttributeValue = (S, attributeEntity, value) =>  new Function(`inputValue`, S.getEntity( attributeEntity )["attribute/validatorFunctionString"] )( value )

let constructCompanyDoc = (S, storedEvents) => {

  let initialCompanyDoc = [{
      index: 0,
      Datoms: [],
      Entities: {
        "1": {}
      },
      Reports: {
        10085: {
          10040: 1, //Høyeste entitetsID 
        } 
      },
      isValid: true
    }]

    

    let companyDoc = storedEvents.reduce( (companyDocVersions, eventAttributes, prevVersionIndex) => {
    let latestCompanyDoc = companyDocVersions[ companyDocVersions.length - 1 ]

    let Q = {
      companyEntities: companyDocVersions[prevVersionIndex]["Entities"],
    }

    Q.getReportField = (reportEntity, attributeEntity) => companyDocVersions[prevVersionIndex]["Reports"][reportEntity][attributeEntity]
    Q.userInput = entity => eventAttributes[ S.getEntity(entity)["attr/name"] ]

    if(!latestCompanyDoc.isValid){return companyDocVersions}
      if(!S.getEntity(  eventAttributes["event/eventTypeEntity"] )){return mergerino(companyDocVersions, {isValid: false}) }
      let eventType = S.getEntity(  eventAttributes["event/eventTypeEntity"] )
      let attributesAreValid = eventType["eventType/eventAttributes"].every( attributeEntity =>  
        validateAttributeValue(S, attributeEntity, eventAttributes[ S.getEntity( attributeEntity )["attr/name"] ] )
      )





      if(!attributesAreValid){return mergerino(companyDocVersions, {isValid: false}) }
        let eventValidators = S.getEntity( eventAttributes["event/eventTypeEntity"] )["eventType/eventValidators"]
        let eventIsValid = eventValidators.every( entity =>  
          new Function([`Q`], S.getEntity(entity)["eventValidator/validatorFunctionString"])( Q ) //To be updated
        )

        if(!eventIsValid){return mergerino(companyDocVersions, {isValid: false}) }

          let eventDatoms = eventType["eventType/newDatoms"].map( datom => newDatom(
            new Function( [`Q`], datom["entity"] )( Q ),
            datom.attribute,
            new Function( [`Q`], datom["value"] )( Q )
            )
          )

          

          let updatedCompanyEntities = eventDatoms.reduce( (Entities, datom) => mergerino(
            Entities,
            createObject(datom.entity, createObject(datom.attribute, datom.value ))
          ), Q.companyEntities )

          Q.latestEntityID = Number( Object.keys(updatedCompanyEntities).pop() )
          Q.companyEntities = updatedCompanyEntities


          let updatedReports = mergeArray( S.findEntities( E => E["entity/entityType"] === 9966 )
            .filter( report => new Function( [`eventDatoms`, `Q`], report["report/triggerFunction"] )( eventDatoms, Q)   )
            //.sort(),
            .map( report => createObject(report.entity, mergeArray(report["report/reportFields"].map( reportField => createObject(reportField.attribute, new Function( [`Q`], reportField["value"] )( Q ) )  ))  ))
          )
          
          let index = prevVersionIndex + 1

          let companyDocVersion = {
            index, 
            eventAttributes, 
            eventDatoms,
            Datoms: latestCompanyDoc.Datoms.concat(eventDatoms),
            Entities: updatedCompanyEntities,
            Reports: updatedReports,
            isValid: true
          }


          return companyDocVersions.concat(companyDocVersion)

  } , initialCompanyDoc )

  return companyDoc

}


let newDatom = (entity, attribute, value, isAddition) => returnObject({entity, attribute, value, isAddition: isAddition === false ? false : true })

let updateData = serverResponse => returnObject({
  "E": serverResponse["E"],
  "latestTxs": serverResponse["latestTxs"].sort( (a, b) => b.tx - a.tx ),
})

let getRetractionDatomsWithoutChildren = Entities => Entities.map( Entity =>  Object.entries( Entity ).map( e => newDatom(Entity["entity"], e[0], e[1], false) ).filter( d => d["attribute"] !== "entity" ) ).flat() //Need to also get children


let getEntityForEntityType = {
  "attribute": 7684,
  "eventType": 7686,
  "eventField": 7780,
  "companyField": 7784,
  "eventValidator": 7728,
  "valueType": 7689,
  "entityType": 7794,
  "event": 7790,
  "tx": 7806,
  "report": 9966
}

let getUserActions = (S) => returnObject({
    updateLocalState: (patch) => update( {
      UIstate: mergerino( S["UIstate"], patch ), 
      sharedData: S["sharedData"] 
    }),
    updateEntityAttribute: async (entity, attribute, value) => {

      let datom = newDatom(Number(entity), attribute, value)
      let serverReponse = await sideEffects.submitDatomsWithValidation(S, [datom] )


      update( serverReponse )
    },
    retractEntity: async entity => update( await sideEffects.submitDatomsWithValidation(S,  getRetractionDatomsWithoutChildren( [S.getEntity(entity) ]))),
    createEntity: async entityTypeEntity => {

      let EntityType = S.getEntity(entityTypeEntity)

      let Datoms = EntityType["entityType/attributes"].map( attribute => {

      let Attribute = S.getEntity(attribute)
      let ValueType = S.getEntity(Attribute["attribute/valueType"])
      let defaultValue = ValueType["valueType/defaultValue"]

      let datom = newDatom("newEntity", Attribute["attr/name"], defaultValue)

      return datom


    } )
      .filter( datom => datom.attribute !== "entity/entityType" )
      .filter( datom => datom.attribute !== "entity/label" )
      .concat( [
        newDatom("newEntity", "entity/entityType", entityTypeEntity ),
        newDatom("newEntity", "entity/label", `[${EntityType["entity/label"]} uten navn]` ),
        newDatom("newEntity", "entity/category", S["UIstate"]["selectedCategory"] )
      ]  )

    let newState = await sideEffects.submitDatomsWithValidation(S, Datoms)

    update( newState )

    },
    createEvent: async ( eventAttributes, newEventTypeEntity ) => update( await sideEffects.submitDatomsWithValidation(S, [
        newDatom("newEntity", "entity/entityType", 7790),
        newDatom("newEntity", "entity/label", `Selskapshendelse for ${eventAttributes["event/incorporation/orgnumber"]}`),
        newDatom("newEntity", "entity/doc", "Mangler beskrivelse" ),
        newDatom("newEntity", "entity/category", "Mangler kategori" ),
        newDatom("newEntity", "event/eventTypeEntity", newEventTypeEntity),
        newDatom("newEntity", "event/incorporation/orgnumber", eventAttributes["event/incorporation/orgnumber"] ),
        newDatom("newEntity", "event/index", eventAttributes["event/index"] + 1 ),
        newDatom("newEntity", "event/date", eventAttributes["event/date"] ),
        newDatom("newEntity", "event/currency", "NOK")
    ])),
    createCompany: async () => update( await sideEffects.submitDatomsWithValidation(S, [
      newDatom("newEntity", "entity/entityType", 7790),
      newDatom("newEntity", "event/index", 1 ),
      newDatom("newEntity", "event/eventTypeEntity", 4113),
      newDatom("newEntity", "event/incorporation/orgnumber", randBetween(800000000, 1000000000) ),
      newDatom("newEntity", "event/date", "2020-01-01" ),
      newDatom("newEntity", 8426, "2020-01-01" ),
      newDatom("newEntity", 3175, 1),
      newDatom("newEntity", 4933, "Selskapet AS"),
      newDatom("newEntity", 10636, "Selskapets forretningsadresse"),
      newDatom("newEntity", 10639, "Selskapets næring"),
      newDatom("newEntity", 10642, "Selskapets postnummer"),
      newDatom("newEntity", 10645, "Selskapets poststed"),
  ])),
      undoTx: async (tx) => {

        console.log(tx)

        let txEntity = tx.datoms.filter( datom => datom.attribute === "tx/tx" )[0].entity

        let datoms = tx.datoms
          .filter( datom => datom.entity !== txEntity )
          .map( datom => newDatom(datom.entity, datom.attribute, datom.value, !datom.isAddition) )

        console.log("datoms", datoms)

        update( await sideEffects.submitDatomsWithValidation(S, datoms ))

      }
})

let update = (S) => {

    //To be fixed...
    S.getEntity = entity => S["sharedData"]["E"][entity] ? S["sharedData"]["E"][entity] : logThis(null, `Entitet [${entity}] finnes ikke` )
    S.findEntities = filterFunction => Object.values(S["sharedData"]["E"]).filter( filterFunction )
    S.getUserEvents = () => S.findEntities( e => e["entity/entityType"] === 7790 ).filter( eventAttributes => eventAttributes["event/incorporation/orgnumber"] === S["UIstate"].selectedOrgnumber ).sort( (a, b) => a["event/index"] - b["event/index"]  ) //S["sharedData"]["userEvents"]
    S.getLatestTxs = () => S["sharedData"]["latestTxs"]
    
    S.getAll = entityType => S.findEntities( e => e["entity/entityType"] === getEntityForEntityType[entityType]  )
    S.getAllOrgnumbers = () => S.findEntities( e => e["entity/entityType"] === 7790 ).map( E => E["event/incorporation/orgnumber"] ).filter( filterUniqueValues )
    S.getEntityLabel = entity => S.getEntity(entity)["entity/label"] ? S.getEntity(entity)["entity/label"] : `[${entity}] Visningsnavn mangler`
    S.getEntityDoc = entity => S.getEntity(entity)["entity/doc"] ? S.getEntity(entity)["entity/doc"] : `[${entity}] Dokumentasjon mangler`
    S.getEntityCategory = entity => S.getEntity(entity)["entity/category"] ? S.getEntity(entity)["entity/category"] : `[${entity}] Kategori mangler`
    S.getEntityNote = entity => S.getEntity(entity)["entity/note"] ? S.getEntity(entity)["entity/note"] : `[${entity}] Ingen notat`

    S["UIstate"].selectedEntity = (S.getEntity(S["UIstate"].selectedEntity) === null) ? 3174 : S["UIstate"].selectedEntity
    S["UIstate"].selectedAdminEntity = (S.getEntity(S["UIstate"].selectedAdminEntity) === null) ? 3174 : S["UIstate"].selectedEntity
    
    try {
      S["selectedCompany"] = constructCompanyDoc(S, S.getUserEvents())
      

      console.log(S["selectedCompany"])
      
    } catch (error) {
      console.log(error)
    }

    Admin.S = S;

    console.log("State: ", S)
    let A = getUserActions(S)

    S.elementTree = generateHTMLBody(S, A )
    sideEffects.updateDOM( S.elementTree )
}

sideEffects.configureClient();

let Admin = {
    S: null,
    updateClientRelease: (newVersion) => Admin.submitDatoms([newDatom(2829, "transaction/records", {"serverVersion":"0.3.2","clientVersion":newVersion})], null),
    resetServer: () => sideEffects.APIRequest("GET", "resetServer", null),
    submitDatoms: async (datoms) => datoms.length < 5200
    ? await sideEffects.APIRequest("POST", "transactor", JSON.stringify( logThis(datoms, "Datoms submitted to Transactor.") )) 
    : console.log("ERROR: Too many datoms: ", datoms),
    getEntity: e => Admin.S.getEntity(e),
    findEntities: filterFunction => Admin.S.findEntities(filterFunction),
    updateEntityAttribute: async (entityID, attribute, value) => await Admin.submitDatoms([newDatom(entityID, attribute, value)]),
    retractEntities: async entities => await Admin.submitDatoms( getRetractionDatomsWithoutChildren(entities.map( e => Admin.S.getEntity(e) )) ),
    retractEntity: async entity => await Admin.retractEntities([entity]),
    getServerCache: async () => await sideEffects.APIRequest("GET", "serverCache", null)
}



let a = () => {

  let shareTransactions = [0,{"type":"Aksjer","shareCount":573200,"orgNumber":"916823525"},{"type":"Aksjer","shareCount":1000,"ISIN":"Nigeria123","country":"Nigeria"},{"type":"Aksjer","shareCount":100,"ISIN":"Nigeria123","country":"Nigeria"}]

  let table = shareTransactions.reduce( (accumulator, transaction) => mergerino(accumulator, createObject( )  ) )


  return Object.keys(companyFields)
    .filter( account => Number(account) >= 3000  )
    .reduce( (sum, account) => sum + companyFields[7911][account], 0);


}