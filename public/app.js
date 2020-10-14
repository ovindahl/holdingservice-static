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
                "selectedEntity": 3174
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

let newDatom = (entity, attribute, value, isAddition) => returnObject({entity, attribute, value, isAddition: isAddition === false ? false : true })


let updateData = serverResponse => returnObject({
  "E": serverResponse["E"],
  "attributes": serverResponse["attributes"],
  "allAttributes": serverResponse["attributes"].map( a => a.entity ),
  "allCompanyFields": serverResponse["companyFields"].map( e => e.entity ),
  "allEventTypes": serverResponse["eventTypes"].map( e => e.entity ),
  "allEventAttributes": serverResponse["attributes"].filter( attr => attr["attr/name"] ).filter( attr => attr["attr/name"].startsWith("event/")  ).map( attribute => attribute.entity ),
  "allEventValidators": serverResponse["eventValidators"].map( e => e.entity ),
  "allEventFields": serverResponse["eventFields"].map( e => e.entity ),
  "latestTxs": serverResponse["latestTxs"].sort( (a, b) => b.tx - a.tx ),
  "Accounts": getAccounts(),
  "userEvents": serverResponse["Events"]
})

let getRetractionDatomsWithoutChildren = (Entities) => Entities.map( Entity =>  Object.entries( Entity ).map( e => newDatom(Entity["entity"], e[0], e[1], false) ).filter( d => d["attribute"] !== "entity" ) ).flat() //Need to also get children

let getUserActions = (S) => returnObject({
    updateLocalState: (patch) => update( {
      UIstate: mergerino( S["UIstate"], patch ), 
      sharedData: S["sharedData"] 
    }),
    updateEntityAttribute: async (entity, attribute, value) => update( await sideEffects.submitDatomsWithValidation(S, [newDatom(Number(entity), attribute, value)] )),
    createEvent: async ( prevEvent, newEventTypeEntity ) => update( await sideEffects.submitDatomsWithValidation(S, [
      newDatom("newEvent", "entity/type", "event"),
      newDatom("newEvent", "event/eventTypeEntity", newEventTypeEntity),
      newDatom("newEvent", "event/incorporation/orgnumber", prevEvent["eventAttributes"]["event/incorporation/orgnumber"] ),
      newDatom("newEvent", "event/index", prevEvent["eventAttributes"]["event/index"] + 1 ),
      newDatom("newEvent", "event/date", prevEvent["eventAttributes"]["event/date"] ),
      newDatom("newEvent", "event/currency", "NOK")
    ] )),
    retractEvent: async entity => update( await sideEffects.submitDatomsWithValidation(S, getRetractionDatomsWithoutChildren([ S.getEntity(entity) ]) ) ),
    retractEntity: async entity => update( await sideEffects.submitDatomsWithValidation(S,  getRetractionDatomsWithoutChildren( [S.getEntity(entity) ]))),
    createAttribute: async () => update( await sideEffects.submitDatomsWithValidation(S, [
      newDatom("newAttr", "entity/type", "attribute"),
      newDatom("newAttr", "attr/name", "event/attribute" + S["sharedData"]["attributes"].length ),
      newDatom("newAttr", "entity/category", S["UIstate"].selectedCategory),
      newDatom("newAttr", "entity/label", "[Attributt uten navn]"),
      newDatom("newAttr", "attribute/validatorFunctionString", `return (typeof inputValue !== "undefined");`),
    ] )),
    createEventType: async () => update( await sideEffects.submitDatomsWithValidation(S, [
      newDatom("newEventType", "entity/type", "eventType"),
      newDatom("newEventType", "entity/label", "label"),
      newDatom("newEventType", "entity/doc", "[doc]"),
      newDatom("newEventType", "entity/category", S["UIstate"].selectedCategory),
      newDatom("newEventType", "eventType/eventAttributes", [] ),
      newDatom("newEventType", "eventType/requiredCompanyFields", [] ),
      newDatom("newEventType", "eventType/eventValidators", [] ),
      newDatom("newEventType", "eventType/eventFieldConstructors", {} ),
    ])),
    createEventValidator: async () => update( await sideEffects.submitDatomsWithValidation(S, [
        newDatom("newEventType", "entity/type", "eventValidator"),
        newDatom("newEventType", "entity/label", "label"),
        newDatom("newEventType", "entity/doc", "[doc]"),
        newDatom("newEventType", "entity/category", S["UIstate"].selectedCategory),
        newDatom("newEventType", "eventValidator/validatorFunctionString", "return true;" ),
        newDatom("newEventType", "eventValidator/errorMessage", "[errorMessage]" ),
    ])),
    createEventField: async () => update( await sideEffects.submitDatomsWithValidation(S, [
            newDatom("eventField", "entity/type", "eventField"),
            newDatom("eventField", "entity/label", "Ny hendelsesoutput"),
            newDatom("eventField", "entity/doc", "[doc]"),
            newDatom("eventField", "entity/category", S["UIstate"].selectedCategory),
            newDatom("eventField", "eventField/companyFields", [] ),
    ])),
    createCompanyField: async () => update( await sideEffects.submitDatomsWithValidation(S, [
        newDatom("companyField", "entity/type", "companyField"),
        newDatom("companyField", "entity/label", "label" ),
        newDatom("companyField", "entity/doc", "[doc]"),
        newDatom("companyField", "entity/category", S["UIstate"].selectedCategory),
        newDatom("companyField", "companyField/constructorFunctionString", `return 0;`),
        newDatom("companyField", "companyField/companyFields", []),
    ])),
})

let getAttributeEntityFromName = (S, attributeName) => S["sharedData"]["attributes"].filter( a => a["attr/name"] === attributeName )[0]["entity"]

let getAccounts = (S) => returnObject({
  '1070': {label: 'Utsatt skattefordel'}, 
  '1300': {label: 'Investeringer i datterselskap'}, 
  '1320': {label: 'Lån til foretak i samme konsern'}, 
  '1330': {label: 'Investeringer i tilknyttet selskap'}, 
  '1340': {label: 'Lån til tilknyttet selskap og felles kontrollert virksomhet'}, 
  '1350': {label: 'Investeringer i aksjer, andeler og verdipapirfondsandeler'}, 
  '1360': {label: 'Obligasjoner'}, 
  '1370': {label: 'Fordringer på eiere'}, 
  '1375': {label: 'Fordringer på styremedlemmer'}, 
  '1380': {label: 'Fordringer på ansatte'}, 
  '1399': {label: 'Andre fordringer'}, 
  '1576': {label: 'Kortsiktig fordring eiere/styremedl. o.l.'}, 
  '1579': {label: 'Andre kortsiktige fordringer'}, 
  '1749': {label: 'Andre forskuddsbetalte kostnader'}, 
  '1800': {label: 'Aksjer og andeler i foretak i samme konsern'}, 
  '1810': {label: 'Markedsbaserte aksjer og verdipapirfondsandeler'}, 
  '1820': {label: 'Andre aksjer'}, 
  '1830': {label: 'Markedsbaserte obligasjoner'}, 
  '1870': {label: 'Andre markedsbaserte finansielle instrumenter'}, 
  '1880': {label: 'Andre finansielle instrumenter'}, 
  '1920': {label: 'Bankinnskudd'}, 
  '2000': {label: 'Aksjekapital'}, 
  '2020': {label: 'Overkurs'}, 
  '2030': {label: 'Annen innskutt egenkapital'}, 
  '2050': {label: 'Annen egenkapital'}, 
  '2080': {label: 'Udekket tap'}, 
  '2120': {label: 'Utsatt skatt'}, 
  '2220': {label: 'Gjeld til kredittinstitusjoner'}, 
  '2250': {label: 'Gjeld til ansatte og eiere'}, 
  '2260': {label: 'Gjeld til selskap i samme konsern'}, 
  '2290': {label: 'Annen langsiktig gjeld'}, 
  '2390': {label: 'Annen gjeld til kredittinstitusjon'}, 
  '2400': {label: 'Leverandørgjeld'}, 
  '2500': {label: 'Betalbar skatt, ikke fastsatt'}, 
  '2510': {label: 'Betalbar skatt, fastsatt'}, 
  '2800': {label: 'Avsatt utbytte'}, 
  '2910': {label: 'Gjeld til ansatte og eiere'}, 
  '2920': {label: 'Gjeld til selskap i samme konsern'}, 
  '2990': {label: 'Annen kortsiktig gjeld'}, 
  '6540': {label: 'Inventar'}, 
  '6551': {label: 'Datautstyr (hardware)'}, 
  '6552': {label: 'Programvare (software)'}, 
  '6580': {label: 'Andre driftsmidler'}, 
  '6701': {label: 'Honorar revisjon'}, 
  '6702': {label: 'Honorar rådgivning revisjon'}, 
  '6705': {label: 'Honorar regnskap'}, 
  '6720': {label: 'Honorar for økonomisk rådgivning'}, 
  '6725': {label: 'Honorar for juridisk bistand, fradragsberettiget'}, 
  '6726': {label: 'Honorar for juridisk bistand, ikke fradragsberettiget'}, 
  '6790': {label: 'Annen fremmed tjeneste'}, 
  '6890': {label: 'Annen kontorkostnad'}, 
  '6900': {label: 'Elektronisk kommunikasjon'}, 
  '7770': {label: 'Bank og kortgebyrer'}, 
  '7790': {label: 'Annen kostnad, fradragsberettiget'}, 
  '7791': {label: 'Annen kostnad, ikke fradragsberettiget'}, 
  '8000': {label: 'Inntekt på investering i datterselskap'}, 
  '8020': {label: 'Inntekt på investering i tilknyttet selskap'}, 
  '8030': {label: 'Renteinntekt fra foretak i samme konsern'}, 
  '8050': {label: 'Renteinntekt (finansinstitusjoner)'}, 
  '8055': {label: 'Andre renteinntekter'}, 
  '8060': {label: 'Valutagevinst (agio)'}, 
  '8070': {label: 'Annen finansinntekt'}, 
  '8071': {label: 'Aksjeutbytte'}, 
  '8078': {label: 'Gevinst ved realisasjon av aksjer'}, 
  '8080': {label: 'Verdiøkning av finansielle instrumenter vurdert til virkelig verdi'}, 
  '8090': {label: 'Inntekt på andre investeringer'}, 
  '8100': {label: 'Verdireduksjon av finansielle instrumenter vurdert til virkelig verdi'}, 
  '8110': {label: 'Nedskrivning av andre finansielle omløpsmidler'}, 
  '8120': {label: 'Nedskrivning av finansielle anleggsmidler'}, 
  '8130': {label: 'Rentekostnad til foretak i samme konsern'}, 
  '8140': {label: 'Rentekostnad, ikke fradragsberettiget'}, 
  '8150': {label: 'Rentekostnad (finansinstitusjoner)'}, 
  '8155': {label: 'Andre rentekostnader'}, 
  '8160': {label: 'Valutatap (disagio)'}, 
  '8170': {label: 'Annen finanskostnad'}, 
  '8178': {label: 'Tap ved realisasjon av aksjer'}, 
  '8300': {label: 'Betalbar skatt'}, 
  '8320': {label: 'Endring utsatt skatt'},
  '8800': {label: 'Årsresultat'}
})

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

  let allCompanyFields = S["sharedData"]["allCompanyFields"]
  let allEventFields = S["sharedData"]["allEventFields"]

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
            let directDependencies = eventFieldsToUpdate.map( eventFieldEntity => S["sharedData"]["E"][eventFieldEntity]["eventField/companyFields"]  ).flat()
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

let update = (S) => {

    //To be fixed...
    S["sharedData"]["E"] = Array.isArray(S["sharedData"]["E"]) ?  mergeArray( S["sharedData"]["E"] ) : S["sharedData"]["E"] 
    S.getEntity = entity => S["sharedData"]["E"][entity]
    S.findEntities = filterFunction => Object.values(S["sharedData"]["E"]).filter( filterFunction )
    S.getAll = entityType => S.findEntities( e => e["entity/type"] === entityType )
    S.getUserEvents = () => S["sharedData"]["userEvents"]
    S.getLatestTxs = () => S["sharedData"]["latestTxs"]
    S.getAllOrgnumbers = () => S.getUserEvents().map( E => E["event/incorporation/orgnumber"] ).filter( filterUniqueValues )
    S.getEntityLabel = entity => S.getEntity(entity)["entity/label"] ? S.getEntity(entity)["entity/label"] : `[${entity}] Visningsnavn mangler`
    S.getEntityDoc = entity => S.getEntity(entity)["entity/doc"] ? S.getEntity(entity)["entity/doc"] : `[${entity}] Dokumentasjon mangler`
    S.getEntityType = entity => S.getEntity(entity)["entity/type"] ? S.getEntity(entity)["entity/type"] : `[${entity}] Entitetstype mangler`
    S.getEntityCategory = entity => S.getEntity(entity)["entity/category"] ? S.getEntity(entity)["entity/category"] : `[${entity}] Kategori mangler`
    S.getEntityNote = entity => S.getEntity(entity)["entity/note"] ? S.getEntity(entity)["entity/note"] : `[${entity}] Ingen notat`
    
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
    submitDatoms: async (datoms) => datoms.length < 3000
    ? await sideEffects.APIRequest("POST", "transactor", JSON.stringify( logThis(datoms, "Datoms submitted to Transactor.") )) 
    : console.log("ERROR: Too many datoms: ", datoms),
    getEntity: e => Admin["S"]["sharedData"]["E"][e],
    findEntities: filterFunction => Object.values(Admin["S"]["sharedData"]["E"]).filter( filterFunction ),
    updateEntityAttribute: async (entityID, attribute, value) => await Admin.submitDatoms([newDatom(entityID, attribute, value)]),
    //retractEntity: async entityAttributes => update( await sideEffects.submitDatomsWithValidation(S,  getRetractionDatomsWithoutChildren( entityAttributes )
    //)
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