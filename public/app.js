const sideEffects = {
    appContainer: "appContainer",
    updateDOM: elementTree => [
        sideEffects.applyHTML,
        sideEffects.applyEventListeners
    ].forEach( stepFunction => stepFunction(elementTree) ),
    applyHTML: elementTree => document.getElementById(sideEffects.appContainer).innerHTML = elementTree.map( element => element.html ).join(''),
    applyEventListeners: elementTree => elementTree.map( element => Array.isArray(element.eventListeners) ? element.eventListeners : [] ).flat().forEach( eventListener => document.getElementById( eventListener.id ).addEventListener(eventListener.eventType, eventListener.action) ),
    APIRequest: async (type, endPoint, stringBody) => {

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
    
        return parsedResponse;
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
            
            let S = await sideEffects.APIRequest("GET", "userContent", null)
            S.currentPage = "timeline"
            S.selectedOrgnumber = "999999999"
            S["companyDocPage/selectedVersion"] = 0
            update(S)
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
    submitDatoms: async Datoms => await sideEffects.APIRequest("POST", "transactor", JSON.stringify( Datoms ) ),
    submitDatomsWithValidation: async (S, Datoms) => Datoms.every( datom => S.attributeValidators[ datom.attribute ]( datom.value ) ) 
      ? update( mergerino( await sideEffects.APIRequest("POST", "transactor", JSON.stringify( Datoms )), {currentPage: S.currentPage, selectedOrgnumber: S.selectedOrgnumber}))
      : update( logThis(S, "ERROR: Datoms not valid" ) )
}

let getRetractionDatomsWithoutChildren = (Entities) => Entities.map( Entity =>  Object.entries( Entity ).map( e => newDatom(Entity["entity"], e[0], e[1], false) ).filter( d => d["attribute"] !== "entity" ) ).flat() //Need to also get children

let getUserActions = (S) => returnObject({
    updateLocalState: (patch) => update( mergerino(S, patch) ),
    updateEntityAttribute: async (entityID, attribute, value) => await sideEffects.submitDatomsWithValidation(S, [newDatom(entityID, attribute, value)] ),
    createEvent: async ( appliedEvent, newEventType ) => await sideEffects.submitDatomsWithValidation(S, [
      newDatom("newEvent", "type", "process"),
      newDatom("newEvent", "entity/type", "event"),
      newDatom("newEvent", "event/eventType", newEventType),
      newDatom("newEvent", "event/incorporation/orgnumber", appliedEvent["event/incorporation/orgnumber"] ), //TBU..
      newDatom("newEvent", "event/index", appliedEvent["event/index"] + 1 ),
      newDatom("newEvent", "event/date", appliedEvent["event/date"] ),
      newDatom("newEvent", "event/currency", "NOK")
    ] ),
    retractEvent: async entityID => S.Events.filter( e => e.entity === entityID  )[0]["entity/type"] === "event" ? await sideEffects.submitDatomsWithValidation(S, getRetractionDatomsWithoutChildren([S.Events.filter( e => e.entity === entityID  )[0]]) ) : logThis(null, "ERROR: Not event"),
    createAttribute: async attributeName => attributeName.startsWith("event/") ? await sideEffects.submitDatomsWithValidation(S, [
      newDatom("newAttr", "attr/name", attributeName),
      newDatom("newAttr", "attr/label", "[attributeName]"),
      newDatom("newAttr", "attr/doc", "[doc]"),
    ] ) : console.log("ERROR: new Attribtue not valid", attributeName),
    createEventType: async eventTypeName => eventTypeName.startsWith("eventType/") 
      ? await sideEffects.submitDatomsWithValidation(S, [
        newDatom("newEventType", "type", "eventType"),
        newDatom("newEventType", "entity/type", "eventType"),
        newDatom("newEventType", "eventType/name", eventTypeName),
        newDatom("newEventType", "eventType/label", "[label]"),
        newDatom("newEventType", "eventType/attributes", ["event/index", "event/date", "event/currency", "event/description", "event/incorporation/orgnumber"] ),
        newDatom("newEventType", "eventType/requiredCompanyFields", [] ),
        newDatom("newEventType", "eventType/eventValidators", ["eventValidator/currencyIsNOK"] ),
        newDatom("newEventType", "eventType/eventFields", [] ),
        newDatom("newEventType", "eventType/doc", "[doc]"),
        ]) 
      : console.log("ERROR: new eventType not valid", eventTypeName),
    createEventValidator: async eventValidatorName => eventValidatorName.startsWith("eventValidator/") 
      ? await sideEffects.submitDatomsWithValidation(S, [
        newDatom("newEventType", "type", "eventValidator"),
        newDatom("newEventType", "entity/type", "eventValidator"),
        newDatom("newEventType", "eventValidator/name", eventValidatorName),
        newDatom("newEventType", "eventValidator/label", "[label]"),
        newDatom("newEventType", "eventValidator/errorMessage", "[errorMessage]" ),
        newDatom("newEventType", "eventValidator/doc", "[doc]"),
      ]) : console.log("ERROR: new eventValidator not valid", eventValidatorName),
    createEventField: async eventFieldName => eventValidatorName.startsWith("eventField/") 
      ? await sideEffects.submitDatomsWithValidation(S, [
            newDatom("eventField", "type", "eventField"),
            newDatom("eventField", "entity/type", "eventField"),
            newDatom("eventField", "eventField/name", eventFieldName),
            newDatom("eventField", "eventField/label", "[label]"),
            newDatom("eventField", "eventField/companyFields", ["companyField/:accountBalance"] ),
            newDatom("eventField", "eventField/doc", "[doc]"),
      ]) : console.log("ERROR: new eventFieldName not valid", eventFieldName),
    createCompanyField: async companyFieldName => companyFieldName.startsWith("companyField/") ? await sideEffects.submitDatomsWithValidation(S, [
        newDatom("companyField", "type", "companyField"),
        newDatom("companyField", "entity/type", "companyField"),
        newDatom("companyField", "companyField/name", companyFieldName),
        newDatom("companyField", "companyField/label", "[label]"),
        newDatom("companyField", "companyField/doc", "[doc]"),
      ]) : console.log("ERROR: new companyFieldName not valid", companyFieldName)
})

let update = (S) => {

    const eventConstructors = {
    "eventType/incorporation": ( Event, companyFields_before ) => {
        let shareCapital = (typeof Event["event/incorporation/shareholders"] === "object") ? Object.values( Event["event/incorporation/shareholders"] ).reduce( (shareCapital, shareholder) => shareCapital + shareholder["shareCount"] * shareholder["sharePrice"]  , 0) : 0
        return {
            "eventField/:accountBalance": {"1576": shareCapital, "2000": -shareCapital, "2030": Event["event/incorporation/incorporationCost"], "2400": -Event["event/incorporation/incorporationCost"] },
            "eventField/:newShareholders": Event["event/incorporation/shareholders"],
            "eventField/:supplier": Event["event/supplier"]
        }
    },
    "eventType/operatingCost/supplierDebt": ( Event, companyFields_before ) => mergerino(  
        {"eventField/:accountBalance": {"7790": -Event["event/amount"], "2400": Event["event/amount"]} },
        {"eventField/:supplier": Event["event/supplier"]}
    ),
    "eventType/operatingCost/shareholderDebt": ( Event, companyFields_before ) => mergerino(
        {"eventField/:accountBalance": {"7790": -Event["event/amount"], "2910": Event["event/amount"]}},
        {"eventField/:supplier": Event["event/supplier"]}
    ),
    "eventType/operatingCost/bank": ( Event, companyFields_before ) => mergerino(
        {"eventField/:accountBalance": {"7790": -Event["event/amount"], "1920": Event["event/amount"]}},
        {"eventField/:supplier": Event["event/supplier"]}
    ),
    "eventType/payments/shareCapital": ( Event, companyFields_before ) => returnObject({"eventField/:accountBalance": {"1576": -Event["event/amount"], "1920": Event["event/amount"]}}),
    "eventType/payments/supplierDebt": ( Event, companyFields_before ) => mergerino(
            {"eventField/:accountBalance": {"2400": -Event["event/amount"], "1920": Event["event/amount"]}},
            {"eventField/:supplier": Event["event/supplier"]}
    ),
    "eventType/shareholderLoan/increase": ( Event, companyFields_before ) => returnObject({"eventField/:accountBalance": {"2250": -Event["event/amount"], "1920": Event["event/amount"]}}),
    "eventType/investments/new/unlisted/bank": ( Event, companyFields_before ) => returnObject({"eventField/:accountBalance": {"1350": -Event["event/amount"], "1920": Event["event/amount"]}}),
    "eventType/interest/interestIncomeFromBank": ( Event, companyFields_before ) => returnObject({"eventField/:accountBalance": {"8050": -Event["event/amount"], "1920": Event["event/amount"]}}),
    "eventType/yearEnd": ( Event, companyFields_before ) => {

        let annualResult = -Math.round( Object.entries(companyFields_before["companyField/:accountBalance"]).filter( entry => Number(entry[0] >= 3000 ) ).reduce( (sum, entry) => sum + entry[1], 0 ) )

        return returnObject({"eventField/:accountBalance": {"8300": 0, "8800": annualResult, "2050": -annualResult }})
    },
    "eventType/newYear": ( Event, companyFields_before ) => returnObject({"eventField/:accountBalance": mergeArray( Object.entries(companyFields_before["companyField/:accountBalance"]).filter( entry => Number(entry[0] >= 3000 ) ).map( entry => createObject( entry[0], -entry[1] )  ) )  }),
    }

    Object.keys(S.eventTypes).forEach( eventType => S.eventTypes[ eventType ]["eventType/eventConstructor"] = eventConstructors[ eventType ] )

    const attributeValidators = {
        "type": v => typeof v === "string",
        "attr/doc": v => typeof v === "string",
        "attr/label": v => typeof v === "string",
        "attr/valueType": v => ["string", "number", "object"].includes(v),
        "eventType/name": v => [
        v => typeof v === "string",
        v => v.startsWith("eventType/")
        ].every( f => f(v) ),
        "eventType/doc": v => typeof v === "string",
        "eventType/label": v => typeof v === "string",
        "eventType/attributes":  v => [
        v => typeof v === "object",
        v => Array.isArray(v),
        v => v.every( attr => Object.keys( attributeValidators ).includes(attr) )
        ].every( f => f(v) ),
        "eventType/eventValidators":  v => [
        v => typeof v === "object",
        v => Array.isArray(v),
        ].every( f => f(v) ),
        "eventType/eventFields":  v => [
            v => typeof v === "object",
            v => Array.isArray(v),
        ].every( f => f(v) ),
        "eventType/requiredCompanyFields":  v => [
            v => typeof v === "object",
            v => Array.isArray(v),
        ].every( f => f(v) ),
        "eventValidator/name": v => [
        v => typeof v === "string",
        v => v.startsWith("eventValidator/")
        ].every( f => f(v) ),
        "eventValidator/doc": v => typeof v === "string",
        "eventValidator/label": v => typeof v === "string",
        "eventValidator/errorMessage": v => typeof v === "string",
        "eventField/name": v => [
            v => typeof v === "string",
            v => v.startsWith("eventField/")
            ].every( f => f(v) ),
        "eventField/doc": v => typeof v === "string",
        "eventField/label": v => typeof v === "string",
        "eventField/companyFields":  v => [
            v => typeof v === "object",
            v => Array.isArray(v),
            ].every( f => f(v) ),
        "companyField/name": v => [
            v => typeof v === "string",
            v => v.startsWith("eventField/")
            ].every( f => f(v) ),
        "companyField/doc": v => typeof v === "string",
        "companyField/label": v => typeof v === "string",
        "companyField/eventFields":  v => [
            v => typeof v === "object",
            v => Array.isArray(v),
        ].every( f => f(v) ),
        "entity/type": v => [
        v => typeof v === "string",
        v => ["process", "event"].includes(v)
        ].every( f => f(v) ),
        "event/eventType": v => [
            v => typeof v === "string", 
            v => Object.keys(S.eventTypes).includes(v)
        ].every( f => f(v) ),
        "event/index": v => [ 
            v => typeof v === "number",
            v => v >= 1
        ].every( f => f(v) ),
        "event/description": v => [
            v => typeof v === "string",
        ].every( f => f(v) ),
        "event/currency": v => [
            v => typeof v === "string",
        ].every( f => f(v) ),
        "event/incorporation/orgnumber": v => [
        v => typeof v === "string", 
        v => v.length === 9,
        ].every( f => f(v) ),
        "event/incorporation/shareholders": v => [
        v => typeof v === "object", 
        v => Object.values( v ).every( shareholder => (typeof shareholder["shareholder"] === "string" && typeof shareholder["shareCount"] === "number" && typeof shareholder["sharePrice"] === "number" )  ),
        ].every( f => f(v) ),
        "event/date": v => [
        v => typeof v === "string", 
        v => v.length === 10
        ].every( f => f( v ) ),
        "event/incorporation/nominalSharePrice": v => [
        v => typeof v === "number", 
        v => v > 0
        ].every( f => f(v) ),
        "event/incorporation/incorporationCost": v => [
        v => typeof v === "number", 
        ].every( f => f(v) ),
        "event/account": v => [
        v => typeof v === "string", 
        v => v.length === 4,
        v => Number(v) >= 1000,
        v => Number(v) < 10000,
        ].every( f => f(v) ),
        "event/amount": v => [
        v => typeof v === "number",
        ].every( f => f(v) ),
        "event/bankTransactionReference": v => [
        v => typeof v === "string",
        ].every( f => f(v) ),
        "transaction/records": v => [
        v => typeof v === "object"
        ].every( f => f(v) ),
        "event/supplier": v => [
        v => typeof v === "string"
        ].every( f => f(v) ),
        "event/shareholder": v => [
        v => typeof v === "string"
        ].every( f => f(v) ),
        "event/investment/orgnumber": v => [
        v => typeof v === "string"
        ].every( f => f(v) ),
    }

    S.attributeValidators = attributeValidators

    Object.keys(S.attributes).forEach( attribute => S.attributes[ attribute ]["validator"] = attributeValidators[ attribute ] )
    Object.keys(S.eventAttributes).forEach( eventAttributeName => S.eventAttributes[ eventAttributeName ]["validator"] = attributeValidators[ eventAttributeName ] )

    const eventValidators = {
        "eventValidator/test": {
          validator: ( Event, companyFields_before ) => Event["event/currency"] === "NOK" 
        },
        "eventValidator/currencyIsNOK": {
          validator: ( Event, companyFields_before ) => Event["event/currency"] === "NOK" 
        },
        "eventValidator/shareholderRequired": {
          validator: ( Event, companyFields_before ) => typeof Event === "object",
        },
        "eventValidator/minimumShareCapital": {
          validator: ( Event, companyFields_before ) => Event["event/incorporation/shareholders"] ? Object.values( Event["event/incorporation/shareholders"] ).reduce( (shareCapital, shareholder) => shareCapital + shareholder["shareCount"] * shareholder["sharePrice"]  , 0) >= 30000 : false,
        },
        "eventValidator/negativeAmount": {
          validator: ( Event, companyFields_before ) => Event["event/amount"] < 0,
        },
        "eventValidator/positiveAmount": {
          validator: ( Event, companyFields_before ) => Event["event/amount"] > 0,
        },
        "eventValidator/isExistingSupplier": {
          validator: ( Event, companyFields_before ) => companyFields_before["companyField/:suppliers"].includes( Event["event/supplier"] ),
        },
        "eventValidator/isExistingShareholder": {
          validator: ( Event, companyFields_before ) => typeof companyFields_before["companyField/:shareholders"][ Event["event/shareholder"] ] !== "undefined",
        }
      
    }

    Object.keys(S.eventValidators).forEach( validatorName => S.eventValidators[ validatorName ]["validator"] = eventValidators[ validatorName ]["validator"] )

    const Accounts = {
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
    }

    S.Accounts = Accounts
    
    const companyFieldConstructors =  {
        "companyField/:shareholders": (prevValue, Event, calculatedEventAttributes) => mergerino(prevValue, calculatedEventAttributes["eventField/:newShareholders"] ),
        "companyField/:accountBalance": (prevValue, Event, calculatedEventAttributes) => mergerino( prevValue, Object.entries( calculatedEventAttributes["eventField/:accountBalance"] ).map( entry => createObject(entry[0],  prevValue[ entry[0] ] ?   prevValue[ entry[0] ] + entry[1] : entry[1] )  ) ),
        "companyField/:suppliers": (prevValue, Event, calculatedEventAttributes) => prevValue.includes(calculatedEventAttributes["eventField/:supplier"]) ? prevValue : prevValue.concat( calculatedEventAttributes["eventField/:supplier"] ),
        "companyField/:appliedEvents": (prevValue, Event, calculatedEventAttributes) => prevValue.concat( mergerino(Event, calculatedEventAttributes ) ),
    }

    Object.keys(S.companyFields).forEach( companyField => S.companyFields[ companyField ]["constructor"] = companyFieldConstructors[ companyField ] )

    S.companyDocVersions = [{
        "companyField/:shareholders": {}, 
        "companyField/:suppliers": [],
        "companyField/:accountBalance": {}, 
    }]
    S.appliedEvents = []
    S.rejectedEvents = []

    S.Events.filter( Event => Event["event/incorporation/orgnumber"] === S.selectedOrgnumber ).sort( (a, b) => a["event/index"] - b["event/index"]  ).forEach( (Event, index) => {

            if(S.rejectedEvents.length === 0){

                let eventType = Event["event/eventType"]
                let eventTypeObject = S["eventTypes"][ eventType ]
                let companyDoc = S["companyDocVersions"][index]


                //0: Validate attributes

                let invalidAttributes = eventTypeObject["eventType/attributes"].map( attribute => S["eventAttributes"][attribute]["validator"]( Event[ attribute ] ) ? null : attribute).filter( result => result !== null  )

                if(invalidAttributes.length > 0){

                    S.rejectedEvents.push( mergerino( Event, {"event/:invalidAttributes": invalidAttributes} ) )

                }else{


                //1: Get (and validate?) required historical variables

                let companyFields_before = mergeArray( eventTypeObject["eventType/requiredCompanyFields"].map( variableName => createObject( variableName, companyDoc[ variableName ] )  ) ) 

                //validation TBD

                //2: Validate combined event

                let eventValidators = S.eventTypes[ eventType ]["eventType/eventValidators"].map( validatorName => S.eventValidators[ validatorName ]  )

                let eventErrors = eventValidators.reduce( (Errors, eventValidator) => eventValidator["validator"]( Event, companyFields_before ) ? Errors : Errors.concat(eventValidator["eventValidator/errorMessage"]), [] )


                //3: Calculate event output and generate new company patch

                if(eventErrors.length > 0){

                    S.rejectedEvents.push( mergerino( Event, {"event/:eventErrors": eventErrors} ) )

                }else{

                    let calculatedFields = eventTypeObject["eventType/eventConstructor"]( Event, companyFields_before )

                    let eventTypeEventFields = eventTypeObject["eventType/eventFields"]

                    let companyFields = Object.keys(S.companyFields).filter( companyFieldName => S.companyFields[companyFieldName]["companyField/eventFields"].some( eventField => eventTypeEventFields.includes(eventField)  )  )


                    let companyPatch = companyFields.reduce( (companyPatch, companyField) => mergerino( companyPatch, createObject(companyField, S.companyFields[ companyField ]["constructor"]( companyDoc[ companyField ], Event, calculatedFields) ) ), {} )

                    let constructedEvent = mergerino(Event, companyFields_before, calculatedFields)

                    S.appliedEvents.push( constructedEvent )

                    let newCompanyDocVersion = mergerino(companyDoc, companyPatch)

                    S.companyDocVersions.push( newCompanyDocVersion )

                }

            }

            }else{
                S.rejectedEvents.push( Event )
            }

            
    }  )

    console.log("State: ", S)

    S.elementTree = generateHTMLBody(S, getUserActions(S) )
    
    

    sideEffects.updateDOM( S.elementTree )
}

sideEffects.configureClient();

let Admin = {
    updateClientRelease: (newVersion) => Admin.submitDatoms([newDatom(2829, "transaction/records", {"serverVersion":"0.3.2","clientVersion":newVersion})], null),
    resetServer: () => sideEffects.APIRequest("GET", "resetServer", null),
    submitDatoms: async (datoms) => datoms.length < 2000
    ? await sideEffects.APIRequest("POST", "transactor", JSON.stringify( logThis(datoms, "Datoms submitted to Transactor.") )) 
    : console.log("ERROR: Too many datoms: ", datoms)
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
  
  //var func = new Function("prevCompany, Event", "return prevCompany['company/shareholders'];" )
  //var func2 = new Function("prevCompany, Event", "console.log(prevCompany['company/shareholders']) ;" )
  