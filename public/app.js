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
                "attributesPage/selectedAttribute": 3172,
                "attributesPage/selectedAttributeCategory": "",
                "eventTypesPage/selectedEventType": 4113,
                "eventFieldsPage/selectedEventField": 4372,
                "companyFieldsPage/selectedCompanyField": 4380,
                "eventValidatorsPage/selectedEntity": 4194,
              }

              let S = updateS({}, serverResponse, initialUIstate)

              update(S)
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
    submitDatomsWithValidation: async (S, Datoms) => sideEffects.isIdle 
      ? Datoms.every( datom => validateAttributeValue(S, getAttributeEntityFromName(S, datom.attribute), datom.value) ) 
        ? update( updateS(S, await sideEffects.APIRequest("POST", "transactor", JSON.stringify( Datoms )), null ) )
        : update( logThis( updateS(S, null, null ), "ERROR: Datoms not valid" ) ) 
      : update( logThis(updateS(S, null, null ), "ERROR: HTTP request already in progress" ) ),
    submitNewAttributeDatoms: async (S, Datoms) => sideEffects.isIdle 
    ? Datoms.filter( datom => datom.attribute === "attr/name" && datom.value.startsWith("event/") ).length > 0
      ? update( updateS(S, await sideEffects.APIRequest("POST", "transactor", JSON.stringify( Datoms )), null ) )
      : update( logThis( updateS(S, null, null ), "ERROR: Datoms not valid" ) ) 
    : update( logThis( updateS(S, null, null ), "ERROR: HTTP request already in progress" ) ),
}


let updateS = (S, serverResponse, UIstatePatch) => mergerino( S, 
  serverResponse === null ? {} : {"sharedData": {
    "E": serverResponse["E"],
    attributes: serverResponse["attributes"],
    allCompanyFields: serverResponse["companyFields"].map( e => e.entity ),
    "allEventTypes": serverResponse["eventTypes"].map( e => e.entity ),
    "allEventAttributes": serverResponse["attributes"].filter( attr => attr["attr/name"] ).filter( attr => attr["attr/name"].startsWith("event/")  ).map( attribute => attribute.entity ),
    "allEventValidators": serverResponse["eventValidators"].map( e => e.entity ),
    "allEventFields": serverResponse["eventFields"].map( e => e.entity ),
    "Accounts": getAccounts(),
    "userEvents": serverResponse["Events"]
  }},
  UIstatePatch === null ? {} : {"UIstate": mergerino(S["UIstate"], UIstatePatch)}
)

let getRetractionDatomsWithoutChildren = (Entities) => Entities.map( Entity =>  Object.entries( Entity ).map( e => newDatom(Entity["entity"], e[0], e[1], false) ).filter( d => d["attribute"] !== "entity" ) ).flat() //Need to also get children

let getUserActions = (S) => returnObject({
    updateLocalState: (patch) => update( updateS(S, null, patch ) ),
    updateEntityAttribute: async (entityID, attribute, value) => await sideEffects.submitDatomsWithValidation(S, [newDatom(entityID, attribute, value)] ),
    createEvent: async ( prevEvent, newEventTypeEntity ) => await sideEffects.submitDatomsWithValidation(S, [
      newDatom("newEvent", "entity/type", "event"),
      newDatom("newEvent", "event/eventTypeEntity", newEventTypeEntity),
      newDatom("newEvent", "event/incorporation/orgnumber", prevEvent["eventAttributes"]["event/incorporation/orgnumber"] ),
      newDatom("newEvent", "event/index", prevEvent["eventAttributes"]["event/index"] + 1 ),
      newDatom("newEvent", "event/date", prevEvent["eventAttributes"]["event/date"] ),
      newDatom("newEvent", "event/currency", "NOK")
    ] ),
    retractEvent: async entity => S["sharedData"]["E"][entity]["entity/type"] === "event" 
      ? await sideEffects.submitDatomsWithValidation(S, getRetractionDatomsWithoutChildren([ S["sharedData"]["E"][entity] ]) ) 
      : logThis(null, "ERROR: Not event"),
    retractEntity: async entity => await sideEffects.submitDatomsWithValidation(S,  getRetractionDatomsWithoutChildren( [S["sharedData"]["E"][entity] ])
    ),
    createAttribute: async () => await sideEffects.submitNewAttributeDatoms(S, [
      newDatom("newAttr", "entity/type", "attribute"),
      newDatom("newAttr", "attr/name", "event/attribute" + S["sharedData"]["attributes"].length ),
      newDatom("newAttr", "entity/category", "Mangler kategori"),
      newDatom("newAttr", "entity/label", "[Attributt uten navn]"),
      newDatom("newAttr", "attribute/validatorFunctionString", `return (typeof inputValue !== "undefined");`),
    ] ),
    createEventType: async () => await sideEffects.submitDatomsWithValidation(S, [
      newDatom("newEventType", "entity/type", "eventType"),
      newDatom("newEventType", "entity/label", "label"),
      newDatom("newEventType", "entity/doc", "[doc]"),
      newDatom("newEventType", "entity/category", "Mangler kategori"),
      newDatom("newEventType", "eventType/eventAttributes", [] ),
      newDatom("newEventType", "eventType/requiredCompanyFields", [] ),
      newDatom("newEventType", "eventType/eventValidators", [] ),
      newDatom("newEventType", "eventType/eventFieldConstructors", {} ),
    ]),
    createEventValidator: async () => await sideEffects.submitDatomsWithValidation(S, [
        newDatom("newEventType", "entity/type", "eventValidator"),
        newDatom("newEventType", "entity/label", "label"),
        newDatom("newEventType", "entity/doc", "[doc]"),
        newDatom("newEventType", "entity/category", "Mangler kategori"),
        newDatom("newEventType", "eventValidator/validatorFunctionString", "return true;" ),
        newDatom("newEventType", "eventValidator/errorMessage", "[errorMessage]" ),
    ]),
    createEventField: async () => await sideEffects.submitDatomsWithValidation(S, [
            newDatom("eventField", "entity/type", "eventField"),
            newDatom("eventField", "entity/label", "Ny hendelsesoutput"),
            newDatom("eventField", "entity/doc", "[doc]"),
            newDatom("eventField", "entity/category", "Mangler kategori"),
            newDatom("eventField", "eventField/companyFields", [] ),
    ]),
    createCompanyField: async () => await sideEffects.submitDatomsWithValidation(S, [
        newDatom("companyField", "entity/type", "companyField"),
        newDatom("companyField", "entity/label", "label" ),
        newDatom("companyField", "entity/doc", "[doc]"),
        newDatom("companyField", "entity/category", "Mangler kategori"),
        newDatom("companyField", "companyField/constructorFunctionString", `return 0;`),
    ]),
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

let validateAttributeValue = (S, attributeEntity, value) =>  new Function(`inputValue`, S["sharedData"]["E"][ attributeEntity ]["attribute/validatorFunctionString"] )( value )


let eventAttributesAreValid = (S, eventAttributes) => S["sharedData"]["E"][ eventAttributes["event/eventTypeEntity"] ]["eventType/eventAttributes"]
  .every( attributeEntity =>  
    validateAttributeValue(S, attributeEntity, eventAttributes[ S["sharedData"]["E"][ attributeEntity ]["attr/name"] ] )
  )

let combinedEventIsValid = (S, eventAttributes, companyVariables) => S["sharedData"]["E"][ eventAttributes["event/eventTypeEntity"] ]["eventType/eventValidators"]
  .every( entity =>  
    new Function([`eventAttributes`, `companyFields`], S["sharedData"]["E"][entity]["eventValidator/validatorFunctionString"])( eventAttributes, companyVariables )
  )
    
    

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
      let eventType = S["sharedData"]["E"][ eventAttributes["event/eventTypeEntity"] ]
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
            let companyFieldsToUpdate = eventFieldsToUpdate.map( eventFieldEntity => S["sharedData"]["E"][eventFieldEntity]["eventField/companyFields"]  ).flat()
            let companyFieldsToKeep = existingCompanyFields.filter( entity => !companyFieldsToUpdate.includes(entity) )
            
            let updatedFields = companyFieldsToUpdate.reduce( (updatedCompanyFields, entity) => mergerino( updatedCompanyFields, createObject(
              entity, //NB: Need better approach for undefined prevValue
              new Function([`prevValue` , `calculatedEventAttributes`, `companyFields`], S["sharedData"]["E"][entity]["companyField/constructorFunctionString"])( ((typeof updatedCompanyFields[entity] === "undefined") ? 0 : updatedCompanyFields[entity]), Event.eventFields, updatedCompanyFields ) 
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

let update = (S) => {

    //To be fixed...
    S["sharedData"]["E"] = Array.isArray(S["sharedData"]["E"]) ?  mergeArray( S["sharedData"]["E"] ) : S["sharedData"]["E"] 
    S["userEvents"] = S["sharedData"]["userEvents"]

    S["selectedCompany"] = constructCompanyDoc(S, S.userEvents
      .filter( eventAttributes => eventAttributes["event/incorporation/orgnumber"] === S["UIstate"].selectedOrgnumber )
      .sort( (a, b) => a["event/index"] - b["event/index"]  ) )

    console.log(S["selectedCompany"])

    /* let datoms = S["sharedData"]["allEventFields"]
      .map( e => S["sharedData"]["E"][e] )
      .filter( eventField => !S["sharedData"]["allCompanyFields"].map( e => S["sharedData"]["E"][e]["entity/label"] ).includes(eventField["entity/label"]) )
      .filter( eventField => eventField["entity/category"] === "Altinn-skjemaer"  )
      .map( eventField => [
        newDatom(eventField["entity/label"], "entity/type", "companyField"),
        newDatom(eventField["entity/label"], "entity/label", eventField["entity/label"] ),
        newDatom(eventField["entity/label"], "entity/doc", eventField["entity/label"]),
        newDatom(eventField["entity/label"], "entity/category", "Altinn-skjemaer"),
        newDatom(eventField["entity/label"], "companyField/constructorFunctionString", `return calculatedEventAttributes[${eventField.entity}];`),
      ] ).flat()


    console.log(datoms) */

    Admin.S = S;

    S.getEntity = e => S["sharedData"]["E"][e]
    S.findEntities = filterFunction => Object.values(S["sharedData"]["E"]).filter( filterFunction )

    console.log("State: ", S)
    let A = getUserActions(S)
    //A.retractEntity(5860) //KBankinnskudd
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
    findEntities: filterFunction => Object.values(Admin["S"]["sharedData"]["E"]).filter( filterFunction )
    //retractEntity: async entityAttributes => await sideEffects.submitDatomsWithValidation(S,  getRetractionDatomsWithoutChildren( entityAttributes )
    //)
}


let demoConstructor = (eventAttributes, companyFields ) => {

    let annualResult = Object.keys(companyFields)
      .filter( e => ["S"]["sharedData"]["E"][e]["entity/category"] === "Kontoplan" )
      .filter( e => Number( ["S"]["sharedData"]["E"][e]["entity/category"].slice(0,1) ) >= 3 )
      .reduce( (sum, companyField) => sum + companyFields[companyField], 0 )

    console.log(annualResult)


  return annualResult;
} 






//Archive

const Reports = {
    "rf_1028": {
      accountMapping: {'406': ['1320' , '1340' , '1370' , '1375' , '1380' , '1399' , '1576' , '1579' , '1749'], '408': ['1920'], '440': ['2220' , '2250' , '2260' , '2290' , '2390' , '2400' , '2510' , '2910' , '2920' , '2990']},
      prepare: ( accountBalance ) => mergeArray( 
        Object.keys(Reports["rf_1028"]["accountMapping"]).map( reportKey => 
          createObject(
            reportKey, 
            Reports["rf_1028"]["accountMapping"][ reportKey ].reduce( (sum, account) => sum + accountBalance[account] ? accountBalance[account] : 0, 0 ) 
          ) 
        )  
      )
    },
    "rf_1167": {
      accountMapping: {'8300': ['8300', '0620'], '8320': ['8320, 0620'], '8140': ['8179, 0621'], '8100': ['8100, 0631'], '8110': ['8115, 0632'], '8120': ['8115, 0632'], '8178': ['8174, 0633'], '6726': ['6700, 0640'], '7791': ['7700, 0640'], '8071': ['8090, 0815'], '8000': ['8005, 0830'], '8020': ['8005, 0830'], '8080': ['8080, 0831'], '8078': ['8074, 0833'], '1320': ['0440, 1320'], '1340': ['0440, 1340'], '1370': ['0440, 1370'], '1375': ['0440, 1370'], '1380': ['0440, 1380'], '1399': ['0440, 1390'], '1576': ['0440, 1565'], '1579': ['0440, 1570'], '1749': ['0440, 1570'], '1070': ['1070'], '1300': ['1313'], '1330': ['1332'], '1350': ['1350'], '1360': ['1360'], '1800': ['1800'], '1810': ['1810'], '1820': ['1800'], '1830': ['1830'], '1870': ['1880'], '1880': ['1880'], '1920': ['1920'], '2000': ['2000'], '2020': ['2020'], '2030': ['2030'], '2050': ['2059'], '2080': ['2080'], '2120': ['2120'], '2220': ['2220'], '2250': ['2250'], '2260': ['2260'], '2290': ['2290'], '2390': ['2380'], '2400': ['2400'], '2500': ['2500'], '2510': ['2510'], '2800': ['2800'], '2910': ['2910'], '2920': ['2920'], '2990': ['2990'], '6540': ['6500'], '6551': ['6500'], '6552': ['6500'], '6580': ['6500'], '6701': ['6700'], '6702': ['6700'], '6705': ['6700'], '6720': ['6700'], '6725': ['6700'], '6790': ['6700'], '6890': ['6995'], '6900': ['6995'], '7770': ['7700'], '7790': ['7700'], '8030': ['8030'], '8050': ['8050'], '8055': ['8050'], '8060': ['8060'], '8070': ['8079'], '8090': ['8090'], '8130': ['8130'], '8150': ['8150'], '8155': ['8150'], '8160': ['8160'], '8170': ['8179']},
      prepare: ( accountBalance ) => mergeArray( 
        Object.keys(Reports["rf_1167"]["accountMapping"]).map( reportKey => 
          createObject(
            reportKey, 
            Reports["rf_1167"]["accountMapping"][ reportKey ].reduce( (sum, account) => sum + accountBalance[account] ? accountBalance[account] : 0, 0 ) 
          ) 
        )  
      )
    },
    "rf_1086": {
      prepare: ( accumulatedVariables ) => returnObject({TBD: "TBD"})
    },
    "annualReport": {
      accountMapping: {"9000":[],"9010":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791"],"9050":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791"],"9060":["8000","8020","8030","8050","8055","8060","8070","8071","8078","8080","8090"],"9070":["8100","8110","8120","8130","8140","8150","8155","8160","8170","8178"],"9100":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791","8000","8020","8030","8050","8055","8060","8070","8071","8078","8080","8090","8100","8110","8120","8130","8140","8150","8155","8160","8170","8178"],"9150":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791","8000","8020","8030","8050","8055","8060","8070","8071","8078","8080","8090","8100","8110","8120","8130","8140","8150","8155","8160","8170","8178","8300","8320"],"9200":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791","8000","8020","8030","8050","8055","8060","8070","8071","8078","8080","8090","8100","8110","8120","8130","8140","8150","8155","8160","8170","8178","8300","8320"],"9300":["1070","1300","1320","1330","1340","1350","1360","1370","1375","1380","1399"],"9350":["1576","1579","1749","1800","1810","1820","1830","1870","1880","1920"],"9400":["1070","1300","1320","1330","1340","1350","1360","1370","1375","1380","1399","1576","1579","1749","1800","1810","1820","1830","1870","1880","1920"],"9450":["2000","2020","2030","2050","2080"],"9500":["2120","2220","2250","2260","2290"],"9550":["2390","2400","2500","2510","2800","2910","2920","2990"],"9650":["2000","2020","2030","2050","2080","2120","2220","2250","2260","2290","2390","2400","2500","2510","2800","2910","2920","2990"]},
      prepare: ( accountBalance ) => mergeArray( 
        Object.keys(Reports["annualReport"]["accountMapping"]).map( reportKey => 
          createObject(
            reportKey, 
            Reports["annualReport"]["accountMapping"][ reportKey ].reduce( (sum, account) => sum + accountBalance[account] ? accountBalance[account] : 0, 0 ) 
          ) 
        )  
      ),
      virtualAccounts: [
        {virtualAccount: '9000', label: 'Sum driftsinntekter', firstAccount: "3000", lastAccount: "3999"},
        {virtualAccount: '9010', label: 'Sum driftskostnader', firstAccount: "4000", lastAccount: "7999"},
        {virtualAccount: '9050', label: 'Driftsresultat', firstAccount: "3000", lastAccount: "7999"},
        {virtualAccount: '9060', label: 'Sum finansinntekter', firstAccount: "8000", lastAccount: "8099"},
        {virtualAccount: '9070', label: 'Sum finanskostnader', firstAccount: "8100", lastAccount: "8199"},
        {virtualAccount: '9100', label: 'Ordinært resultat før skattekostnad', firstAccount: "3000", lastAccount: "8199"},
        {virtualAccount: '9150', label: 'Ordinært resultat', firstAccount: "3000", lastAccount: "8399"},
        {virtualAccount: '9200', label: 'Årsresultat', firstAccount: "3000", lastAccount: "8699"},
        {virtualAccount: '9300', label: 'Sum anleggsmidler', firstAccount: "1000", lastAccount: "1399"},
        {virtualAccount: '9350', label: 'Sum omløpsmidler', firstAccount: "1400", lastAccount: "1999"},
        {virtualAccount: '9400', label: 'Sum eiendeler', firstAccount: "1000", lastAccount: "1999"},
        {virtualAccount: '9450', label: 'Sum egenkapital', firstAccount: "2000", lastAccount: "2099"},
        {virtualAccount: '9500', label: 'Sum langsiktig gjeld', firstAccount: "2100", lastAccount: "2299"},
        {virtualAccount: '9550', label: 'Sum kortsiktig gjeld', firstAccount: "2300", lastAccount: "2999"},
        {virtualAccount: '9650', label: 'Sum egenkapital og gjeld', firstAccount: "2000", lastAccount: "2999"}
    ]
    },
    "notesText": {
      prepare: ( companyDoc ) => {
  
        let openingBalance = companyDoc["company/:openingBalance"]
        let accountBalance = companyDoc["company/:accountBalance"]
      
        let shareholders = companyDoc["company/:shareholders"]
        let shareCount = companyDoc["company/:shareCount"]
    
        let nominalSharePrice = companyDoc["company/:nominalSharePrice"]
    
        let em = (content) => String('<span class="emphasizedText">' + content + '</span>')
      
        return `
      <h4>Note 1: Regnskapsprinsipper</h4>
      Regnskapet er utarbeidet i henhold til norske regnskapsregler/-standarder for små foretak.
      <br>
      <h5>Klassifisering og vurdering av balanseposter</h5>
      Omløpsmidler og kortsiktig gjeld omfatter poster som forfaller til betaling innen ett år etter anskaffelsestidspunktet, samt poster som knytter seg til varekretsløpet. Øvrige poster er klassifisert som anleggsmiddel/langsiktig gjeld.
      <br>
      Omløpsmidler vurderes til laveste av anskaffelseskost og virkelig verdi. Kortsiktig gjeld balanseføres til nominelt beløp på opptakstidspunktet.
      <br>
      Anleggsmidler vurderes til anskaffelseskost, men nedskrives til gjenvinnbart beløp dersom dette er lavere enn balanseført verdi. Gjenvinnbart beløp er det høyeste av netto salgsverdi og verdi i bruk. Langsiktig gjeld balanseføres til nominelt beløp på etableringstidspunktet.
      Markedsbaserte finansielle omløpsmidler som inngår i en handelsportefølje vurderes til virkelig verdi, mens andre markedsbaserte finansielle omløpsmidler vurderes til laveste av anskaffelseskost og virkelig verdi.
      <br>
      <h5>Skatt</h5>
      Skattekostnaden i resultatregnskapet omfatter både betalbar skatt for perioden og endring i utsatt skatt. Utsatt skatt er beregnet med ${em("TBD")} på grunnlag av de midlertidige forskjeller som eksisterer mellom regnskapsmessige og skattemessige verdier, samt ligningsmessig underskudd til fremføring ved utgangen av regnskapsåret. Skatteøkende og skattereduserende midlertidige forskjeller som reverserer eller kan reversere i samme periode er utlignet og nettoført.
      <br>
      <h4>Note 2: Aksjekapital og aksjonærinformasjon</h4>
      Foretaket har ${em( shareCount ) } aksjer, pålydende kr ${em(  nominalSharePrice )}, noe som gir en samlet aksjekapital på kr ${em( accountBalance["2000"] )}. Selskapet har én aksjeklasse.
      <br><br>
      Aksjene eies av: 
      <br>
      ${shareholders.map( (shareholder, index) => em(`${index}: ${shareholder} <br>`)).join("")}
      
      <h4>Note 3: Egenkapital</h4>
      
      <table>
      <tbody>
        <tr>
          <td class="numberCell"></td>
          <td class="numberCell">Aksjekapital</td>
          <td class="numberCell">Overkurs</td>
          <td class="numberCell">Annen egenkapital</td>
          <td class="numberCell">Sum</td>
        </tr>
        <tr>
          <td>Egenkapital 1.1 </td>
          <td class="numberCell">${em( openingBalance["2000"] ) }</td>
          <td class="numberCell">${em( openingBalance["2020"] ) }</td>
          <td class="numberCell">${em( openingBalance["2030"] ) }</td>
          <td class="numberCell">${em( openingBalance["2000"] + openingBalance["2020"] + openingBalance["2030"] ) }</td>
        </tr>
        <tr>
          <td>Endring ila. året </td>
          <td class="numberCell">${em( accountBalance["2000"] - openingBalance["2000"] ) }</td>
          <td class="numberCell">${em( accountBalance["2020"] - openingBalance["2020"] ) }</td>
          <td class="numberCell">${em( accountBalance["2030"] - openingBalance["2030"] ) }</td>
          <td class="numberCell">${em( accountBalance["2000"] - openingBalance["2000"] + accountBalance["2020"] - openingBalance["2020"] + accountBalance["2030"] - openingBalance["2030"] ) }</td>
        </tr>
        <tr>
          <td>Egenkapital 31.12 </td>
          <td class="numberCell">${em( accountBalance["2000"] ) }</td>
          <td class="numberCell">${em( accountBalance["2020"] ) }</td>
          <td class="numberCell">${em( accountBalance["2030"] ) }</td>
          <td class="numberCell">${em( accountBalance["2000"] + accountBalance["2020"] + accountBalance["2030"] ) }</td>
        </tr>
      </tbody>
      </table>
      <br>
      <h4>Note 5: Skatt</h4>
      ${"[TBD]" }
      
      <h4>Note 4: Lønnskostnader, antall ansatte, godtgjørelser, revisjonskostnader mm.</h4>
      Selskapet har i ${em( companyDoc["company/:currentYear"] ) } ikke hatt noen ansatte og er således ikke pliktig til å ha tjenestepensjon for de ansatte etter Lov om obligatoriske tjenestepensjon. Det er ikke utdelt styrehonorar.
      <br><br>
      Kostnadsført revisjonshonorar for ${em( companyDoc["company/:currentYear"] ) } utgjør kr ${em( 0 ) }. Honorar for annen bistand fra revisor utgjør kr ${em( 0 ) }.
      
      
      
      <h4>Note 6: Bankinnskudd</h4>
      Posten inneholder kun frie midler.
      
      <h4>Note 7: Gjeld til nærstående, ledelse og styre</h4>
      Selskapet har gjeld til følgende nærstående personer: <br>
      ${shareholders.map( (shareholder, index) => em(`${index}: ${shareholder} <br>`)).join("")}
      
      `}
    } 
}

//WIP

let getTaxRecords = (accounts, taxRate) => {

  let accountingResultBeforeTax = Object.entries(accounts).filter( entry => Number(entry[0]) >= 3000 ).reduce( (sum, entry) => sum + entry[1].closingBalance.amount - entry[1].openingBalance.amount, 0 )

  let nonDeductibleAccounts = ['2030' , '5901' , '6726' , '7360' , '7410' , '7430' , '7791' , '8000' , '8002' , '8005' , '8006' , '8010' , '8020' , '8040' , '8071' , '8078' , '8080' , '8100' , '8110' , '8120' , '8140' , '8178'] //NB: changed 2036 to 2030. Which to  use for Stiftelseskost?

  let permanentDifferences = Object.entries(accounts).filter( entry => nonDeductibleAccounts.includes( entry[0] ) ).reduce( (sum, entry) => sum + entry[1].closingBalance.amount - entry[1].openingBalance.amount, 0 )

  let temporaryDifferences = 0

  let taxEstimateCorrection = accounts["8300"] ? accounts["8300"].closingBalance.amount : 0

  let taxResultBeforeUtilizedLosses = accountingResultBeforeTax + permanentDifferences + temporaryDifferences + taxEstimateCorrection

  let accumulatedLosses = accounts["2510"] ? accounts["2510"].closingBalance.amount : 0 //Må velge riktig konto

  let utilizedLosses = taxResultBeforeUtilizedLosses < 0 ? Math.max( taxResultBeforeUtilizedLosses * taxRate, accumulatedLosses ) : 0

  let taxResultAfterUtilizedLosses = taxResultBeforeUtilizedLosses + utilizedLosses

  let taxCost = taxResultAfterUtilizedLosses * - taxRate

  let taxRecords = [
      {"transaction/generic/account": "8300", "transaction/amount": taxCost, accountingResultBeforeTax, permanentDifferences, temporaryDifferences, taxEstimateCorrection, taxResultBeforeUtilizedLosses, accumulatedLosses, utilizedLosses, taxRate, taxCost, taxResultAfterUtilizedLosses},
      {"transaction/generic/account": "2500", "transaction/amount": -taxCost}, //Burde være eiendel hvis negativ
      {"transaction/generic/account": "2510", "transaction/amount": utilizedLosses}
  ]

  let taxTransaction = {
      type: "transactions",
      records: taxRecords
  }

  

  return taxTransaction
}

let getYearEndRecords = (accountsPostTax) => {

  let accountingResultAfterTax = Object.entries(accountsPostTax).filter( entry => Number(entry[0]) >= 3000 ).reduce( (sum, entry) => sum + entry[1].closingBalance.amount - entry[1].openingBalance.amount, 0 )

  let uncoveredLosses_before = accountsPostTax["2080"] ? accountsPostTax["2080"].openingBalance.amount : 0
  let otherEquity_before = accountsPostTax["2050"] ? accountsPostTax["2050"].openingBalance.amount : 0
  let sharePremium_before = accountsPostTax["2020"] ? accountsPostTax["2020"].openingBalance.amount : 0

  let uncoveredLosses = 0
  let otherEquity = 0
  let sharePremium = 0

  if( accountingResultAfterTax < 0 ){
      //Overskudd

      if( uncoveredLosses_before === 0 ){
          
          otherEquity = accountingResultAfterTax
          
  
      }else{
          
          if( uncoveredLosses_before > -accountingResultAfterTax ){

              uncoveredLosses = accountingResultAfterTax


          }else{

              uncoveredLosses = -uncoveredLosses_before
              otherEquity = accountingResultAfterTax + uncoveredLosses_before

          }

          
          
      }

      

  }else{
      //Underskudd

      if( otherEquity_before === 0 ){
          
          uncoveredLosses = accountingResultAfterTax //Overkurs bør også være med
          
  
      }else{
          
          if( otherEquity_before < -accountingResultAfterTax ){

              otherEquity = accountingResultAfterTax


          }else{

              otherEquity = -otherEquity_before
              uncoveredLosses = accountingResultAfterTax + otherEquity_before

          }

          
          
      }


  }


  let yearEndRecords = [
      {"transaction/generic/account": "8800", "transaction/amount": -accountingResultAfterTax},
      {"transaction/generic/account": "2050", "transaction/amount": otherEquity},
      {"transaction/generic/account": "2080", "transaction/amount": uncoveredLosses},
  ]

  let yearEndTransaction = {
      type: "transactions",
      records: yearEndRecords
  }

  

  return yearEndTransaction
}

let taxCostView = (financialYear) => {

  let taxCostRecord = financialYear.accounts["8300"].accountRecords[0]


  return d([
    d([ d( "Ordinært resultat før skattekostnad" ), d( format.amount( taxCostRecord.accountingResultBeforeTax ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    "<br>",
    d([ d( "Permanente forskjeller" ), d( format.amount( taxCostRecord.permanentDifferences ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Endring i midlertidige forskjeller" ), d( format.amount( taxCostRecord.temporaryDifferences ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Estimatavvik på feilberegnet skatt forrige år" ), d( format.amount( taxCostRecord.taxEstimateCorrection ), {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Skattegrunnlag før bruk av fremførbart underskudd" ), d( format.amount( taxCostRecord.taxResultBeforeUtilizedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    "<br>",
    d([ d( "Inngående fremførbart underskudd" ), d( format.amount( taxCostRecord.accumulatedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Benyttet fremførbart underskudd" ), d( format.amount( taxCostRecord.utilizedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Utgående fremførbart underskudd" ), d( format.amount( taxCostRecord.accumulatedLosses + taxCostRecord.utilizedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    "<br>",
    d([ d( "Skattegrunnlag etter bruk av fremførbart underskudd" ), d( format.amount( taxCostRecord.taxResultAfterUtilizedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    "<br>",
    d([ d( "Årets skattekostnad" ), d( format.amount( taxCostRecord.taxCost ) , {class: "numberCell"})], {class: "financialStatementsRow"})
  ])
}
