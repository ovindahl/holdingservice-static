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

let getAttributeEntityFromName = (S, attributeName) => S.findEntities( e => e["entity/entityType"] === 7684 ).filter( a => a["attr/name"] === attributeName )[0]["entity"]

let validateAttributeValue = (S, attributeEntity, value) =>  new Function(`inputValue`, S.getEntity( attributeEntity )["attribute/validatorFunctionString"] )( value )

let eventAttributesAreValid = (S, eventAttributes) => S.getEntity(  eventAttributes["event/eventTypeEntity"] )["eventType/eventAttributes"]
  .every( attributeEntity =>  
    validateAttributeValue(S, attributeEntity, eventAttributes[ S.getEntity( attributeEntity )["attr/name"] ] )
  )

let combinedEventIsValid = (S, eventAttributes, companyVariables) => S.getEntity( eventAttributes["event/eventTypeEntity"] )["eventType/eventValidators"]
  .every( entity =>  
    new Function([`eventAttributes`, `companyFields`], S.getEntity(entity)["eventValidator/validatorFunctionString"])( eventAttributes, companyVariables )
  )
    
let newTransaction = (date, description, records) => records.map( record => returnObject({date, description, account: Object.keys(record)[0], amount: Object.values(record)[0] }) )

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


let getEntityForEntityType = {
  "attribute": 7684,
  "eventType": 7686,
  "eventField": 7780,
  "companyField": 7784,
  "eventValidator": 7728,
  "valueType": 7689,
  "entityType": 7794,
  "event": 7790,
  "tx": 7806
}

let defaultEntityDatoms = (type, label, doc, category) => [
  newDatom("newEntity", "entity/type", type),
  newDatom("newEntity", "entity/entityType", getEntityForEntityType[type]),
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
  "valueType": [
    newDatom("newEntity", "valueType/jsType", "string" ),
  ],
  "entityType": [
    newDatom("newEntity", "entityType/attributes", [3171, 4615, 4617, 5712, 4871] ),
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
        newDatom("newEntity", "attr/name", "event/attribute" + S.findEntities( e => e["entity/entityType"] === 7684 ).length ),
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
    S.getUserEvents = () => S.findEntities( e => e["entity/entityType"] === 7790 ) //S["sharedData"]["userEvents"]
    S.getLatestTxs = () => S["sharedData"]["latestTxs"]
    
    S.getAll = entityType => S.findEntities( e => e["entity/entityType"] === getEntityForEntityType[entityType]  )
    S.getAllOrgnumbers = () => S.getUserEvents().map( E => E["event/incorporation/orgnumber"] ).filter( filterUniqueValues )
    S.getEntityLabel = entity => S.getEntity(entity)["entity/label"] ? S.getEntity(entity)["entity/label"] : `[${entity}] Visningsnavn mangler`
    S.getEntityDoc = entity => S.getEntity(entity)["entity/doc"] ? S.getEntity(entity)["entity/doc"] : `[${entity}] Dokumentasjon mangler`
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

    let accounts = ['1070 Utsatt skattefordel', '1300 Investeringer i datterselskap', '1310 Investeringer i annet foretak i samme konsern', '1320 Lån til foretak i samme konsern', '1330 Investeringer i tilknyttet selskap', '1340 Lån til tilknyttet selskap og felles kontrollert virksomhet', '1350 Investeringer i aksjer, andeler og verdipapirfondsandeler', '1360 Obligasjoner', '1370 Fordringer på eiere', '1375 Fordringer på styremedlemmer', '1380 Fordringer på ansatte', '1576 Kortsiktig fordring eiere/styremedl. o.l.', '1800 Aksjer og andeler i foretak i samme konsern', '1810 Markedsbaserte aksjer og verdipapirfondsandeler', '1820 Andre aksjer', '1830 Markedsbaserte obligasjoner', '1870 Andre markedsbaserte finansielle instrumenter', '1881 Verdijustering andre finansielle instrumenter', '1920 Bankinnskudd', '2000 Aksjekapital', '2020 Overkurs', '2030 Annen innskutt egenkapital', '2036 Stiftelesutgifter', '2050 Annen egenkapital', '2080 Udekket tap', '2120 Utsatt skatt', '2250 Gjeld til ansatte og eiere', '2260 Gjeld til selskap i samme konsern', '2400 Leverandørgjeld', '2500 Betalbar skatt, ikke fastsatt', '2510 Betalbar skatt, fastsatt', '2800 Avsatt utbytte', '2910 Gjeld til ansatte og eiere', '2920 Gjeld til selskap i samme konsern', '6540 Inventar', '6551 Datautstyr (hardware)', '6552 Programvare (software)', '6580 Andre driftsmidler', '6701 Honorar revisjon', '6702 Honorar rådgivning revisjon', '6705 Honorar regnskap', '6720 Honorar for økonomisk rådgivning', '6725 Honorar for juridisk bistand, fradragsberettiget', '6726 Honorar for juridisk bistand, ikke fradragsberettiget', '6890 Annen kontorkostnad', '6900 Elektronisk kommunikasjon', '7770 Bank og kortgebyrer', '7790 Annen kostnad, fradragsberettiget', '7791 Annen kostnad, ikke fradragsberettiget', '8000 Inntekt på investering i datterselskap', '8010 Inntekt på investering i annet foretak i samme konsern', '8020 Inntekt på investering i tilknyttet selskap', '8030 Renteinntekt fra foretak i samme konsern', '8050 Renteinntekt (finansinstitusjoner)', '8055 Andre renteinntekter', '8060 Valutagevinst (agio)', '8070 Annen finansinntekt', '8071 Aksjeutbytte', '8078 Gevinst ved realisasjon av aksjer', '8080 Verdiøkning av finansielle instrumenter vurdert til virkelig verdi', '8090 Inntekt på andre investeringer', '8100 Verdireduksjon av finansielle instrumenter vurdert til virkelig verdi', '8110 Nedskrivning av andre finansielle omløpsmidler', '8120 Nedskrivning av finansielle anleggsmidler', '8130 Rentekostnad til foretak i samme konsern', '8140 Rentekostnad, ikke fradragsberettiget', '8150 Rentekostnad (finansinstitusjoner)', '8155 Andre rentekostnader', '8160 Valutatap (disagio)', '8170 Annen finanskostnad', '8178 Tap ved realisasjon av aksjer', '8300 Betalbar skatt', '8320 Endring utsatt skatt', '8960 Overføringer annen egenkapital', '8990 Udekket tap']
    console.log(accounts)
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



let a = () => {




  return companyFields[7364].reduce( (accountBalance, record) => mergerino(accountBalance, createObject( record.account, prevValue => (typeof prevValue === "number") ? (prevValue + record.amount) : record.amount ), {} ))


}