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
    
    }
}

let getRetractionDatomsWithoutChildren = (Entities) => Entities.map( Entity =>  Object.entries( Entity ).map( e => newDatom(Entity["entity"], e[0], e[1], false) ).filter( d => d["attribute"] !== "entity" ) ).flat() //Need to also get children

let getUserActions = (S) => returnObject({
    updateLocalState: (patch) => update( mergerino(S, patch) ),
    updateEntityAttribute: async (entityID, attribute, value) => {

        let datoms = [newDatom(entityID, attribute, value)]

        console.log(datoms)

        let apiResponse = S.attributeValidators[attribute](value)
        ? await sideEffects.APIRequest("POST", "transactor", JSON.stringify( [newDatom(entityID, attribute, value)] ) )
        : null

        let isInvalid = (apiResponse === null)

        if(isInvalid){console.log("ERROR: Attribute value is not valid: ", entityID, attribute, value)}

        let newS = isInvalid ? S : mergerino(S, apiResponse)

        update( newS )
    },
    createEvent: async ( appliedEvent, newEventType ) => {




        let datoms = [
            newDatom("newEvent", "type", "process"),
            newDatom("newEvent", "entity/type", "event"),
            newDatom("newEvent", "event/eventType", newEventType),
            newDatom("newEvent", "event/incorporation/orgnumber", appliedEvent["event/incorporation/orgnumber"] ), //TBU..
            newDatom("newEvent", "event/index", appliedEvent["event/index"] + 1 ),
            newDatom("newEvent", "event/date", appliedEvent["event/date"] ),
            newDatom("newEvent", "event/currency", "NOK")
        ]
        

        let apiResponse = await sideEffects.APIRequest("POST", "transactor", JSON.stringify( datoms ))
        let newS = mergerino(S, apiResponse)
        update( newS )
    },
    retractEvent: async entityID => {
        let storedEntity = S.Events.filter( e => e.entity === entityID  )[0]
        let retractionDatoms = getRetractionDatomsWithoutChildren([storedEntity])
        let apiResponse = retractionDatoms.length < 20 ? await sideEffects.APIRequest("POST", "transactor", JSON.stringify( retractionDatoms )) : console.log("ERROR: >20 retraction datoms submitted: ", retractionDatoms)
        let newS = mergerino(S, apiResponse)
        update( newS )
    },
    createAttribute: async attributeName => {

        let datoms = [
            newDatom("newAttr", "attr/name", attributeName),
            newDatom("newAttr", "attr/label", "[attributeName]")
        ]

        let apiResponse = attributeName.startsWith("event/") ? await sideEffects.APIRequest("POST", "transactor", JSON.stringify( datoms )) : console.log("ERROR: new Attribtue not valid", attributeName)

        let newS = mergerino(S, apiResponse)
        update( newS )

    },
    createEventType: async eventTypeName => {

        let datoms = [
            newDatom("newEventType", "type", "eventType"),
            newDatom("newEventType", "eventType/name", eventTypeName),
            newDatom("newEventType", "eventType/label", "[label]"),
            newDatom("newEventType", "eventType/attributes", ["event/index", "event/date", "event/currency", "event/description", "event/incorporation/orgnumber"] ),
            newDatom("newEventType", "eventType/eventValidators", ["eventValidator/currencyIsNOK"] ),
            newDatom("newEventType", "eventType/doc", "[doc]"),
        ]

        let apiResponse = eventTypeName.startsWith("eventType/") ? await sideEffects.APIRequest("POST", "transactor", JSON.stringify( datoms )) : console.log("ERROR: new eventType not valid", eventTypeName)

        let newS = mergerino(S, apiResponse)
        update( newS )

    },
    createEventValidator: async eventValidatorName => {

        let datoms = [
            newDatom("newEventType", "type", "eventValidator"),
            newDatom("newEventType", "eventValidator/name", eventValidatorName),
            newDatom("newEventType", "eventValidator/label", "[label]"),
            newDatom("newEventType", "eventValidator/errorMessage", "[errorMessage]" ),
            newDatom("newEventType", "eventValidator/doc", "[doc]"),
        ]

        let apiResponse = eventValidatorName.startsWith("eventValidator/") ? await sideEffects.APIRequest("POST", "transactor", JSON.stringify( datoms )) : console.log("ERROR: new eventValidator not valid", eventValidatorName)

        let newS = mergerino(S, apiResponse)
        update( newS )

    },

    
})

let update = (S) => {

    const eventConstructors = {
    "eventType/incorporation": Event => {
        let shareCapital = (typeof Event["event/incorporation/shareholders"] === "object") ? Object.values( Event["event/incorporation/shareholders"] ).reduce( (shareCapital, shareholder) => shareCapital + shareholder["shareCount"] * shareholder["sharePrice"]  , 0) : 0
        return {
            "event/:accountBalance": {"1576": shareCapital, "2000": -shareCapital, "2036": Event["event/incorporation/incorporationCost"], "2400": -Event["event/incorporation/incorporationCost"] },
            "event/:shareholders": (typeof Event["event/incorporation/shareholders"] === "object") ? Object.keys(Event["event/incorporation/shareholders"]) : [],
            "event/:supplier": Event["event/supplier"]
        }
    },
    "eventType/operatingCost/supplierDebt": Event => mergerino(  
        {"event/:accountBalance": {"7790": -Event["event/amount"], "2400": Event["event/amount"]} },
        {"event/:supplier": Event["event/supplier"]}
    ),
    "eventType/operatingCost/shareholderDebt": Event => mergerino(
        {"event/:accountBalance": {"7790": -Event["event/amount"], "2910": Event["event/amount"]}},
        {"event/:supplier": Event["event/supplier"]}
    ),
    "eventType/operatingCost/bank": Event => mergerino(
        {"event/:accountBalance": {"7790": -Event["event/amount"], "1920": Event["event/amount"]}},
        {"event/:supplier": Event["event/supplier"]}
    ),
    "eventType/payments/shareCapital": Event => returnObject({"event/:accountBalance": {"1576": -Event["event/amount"], "1920": Event["event/amount"]}}),
    "eventType/payments/supplierDebt": Event => mergerino(
            {"event/:accountBalance": {"2400": -Event["event/amount"], "1920": Event["event/amount"]}},
            {"event/:supplier": Event["event/supplier"]}
    ),
    "eventType/shareholderLoan/increase": Event => returnObject({"event/:accountBalance": {"2250": -Event["event/amount"], "1920": Event["event/amount"]}}),
    "eventType/investments/new/unlisted/bank": Event => returnObject({"event/:accountBalance": {"1350": -Event["event/amount"], "1920": Event["event/amount"]}}),
    }

    Object.keys(S.eventTypes).forEach( eventType => S.eventTypes[ eventType ]["eventConstructor"] = eventConstructors[ eventType ] )

    const attributeValidators = {
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
        "eventValidator/name": v => [
        v => typeof v === "string",
        v => v.startsWith("eventValidator/")
        ].every( f => f(v) ),
        "eventValidator/doc": v => typeof v === "string",
        "eventValidator/label": v => typeof v === "string",
        "eventValidator/errorMessage": v => typeof v === "string",
        "entity/type": v => [
        v => typeof v === "string",
        v => ["process", "event"].includes(v)
        ].every( f => f(v) ),
        "event/eventType": v => [
            v => typeof v === "string", 
            v => Object.keys(eventTypes).includes(v)
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

    Object.keys(S.eventAttributes).forEach( eventAttributeName => S.eventAttributes[ eventAttributeName ]["validator"] = attributeValidators[ eventAttributeName ] )

    const eventValidators = {
        "eventValidator/test": {
          validator: ( companyDoc, Event ) => Event["event/currency"] === "NOK" 
        },
        "eventValidator/currencyIsNOK": {
          validator: ( companyDoc, Event ) => Event["event/currency"] === "NOK" 
        },
        "eventValidator/shareholderRequired": {
          validator: ( companyDoc, Event ) => typeof Event === "object",
        },
        "eventValidator/minimumShareCapital": {
          validator: ( companyDoc, Event ) => Event["event/incorporation/shareholders"] ? Object.values( Event["event/incorporation/shareholders"] ).reduce( (shareCapital, shareholder) => shareCapital + shareholder["shareCount"] * shareholder["sharePrice"]  , 0) >= 30000 : false,
        },
        "eventValidator/negativeAmount": {
          validator: ( companyDoc, Event ) => Event["event/amount"] < 0,
        },
        "eventValidator/positiveAmount": {
          validator: ( companyDoc, Event ) => Event["event/amount"] > 0,
        },
        "eventValidator/isExistingSupplier": {
          validator: ( companyDoc, Event ) => companyDoc["company/:suppliers"].includes( Event["event/supplier"] ),
        },
        "eventValidator/isExistingShareholder": {
          validator: ( companyDoc, Event ) => companyDoc["company/:shareholders"].includes( Event["event/shareholder"] ) ,
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

    S.selectedEvents = S.Events.filter( Event => Event["event/incorporation/orgnumber"] === S.selectedOrgnumber ).sort( (a, b) => a["event/index"] - b["event/index"]  )
    S.companyDoc = prepareCompanyDoc(S, S.selectedEvents)
    console.log("companyDoc", S.companyDoc)

    S.elementTree = generateHTMLBody(S, getUserActions(S) )
    
    console.log("State: ", S)

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
