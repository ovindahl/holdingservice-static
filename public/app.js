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

        let apiResponse = Attribute.validate(attribute, value) //Only attribute validation, not event level.
        ? await sideEffects.APIRequest("POST", "transactor", JSON.stringify( [newDatom(entityID, attribute, value)] ) )
        : null

        let isInvalid = (apiResponse === null)

        if(isInvalid){console.log("ERROR: Attribute value is not valid: ", entityID, attribute, value)}

        let newS = isInvalid ? S : mergerino(S, apiResponse)

        update( newS )
    },
    createEvent: async ( appliedEvent, newEventType ) => {

        let datoms = eventTypes[ newEventType ]["newEventDatoms"](appliedEvent)

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

    Object.keys(eventValidators).forEach( eventValidatorName => eventValidators[eventValidatorName]["errorMessage"] = S["eventValidators"][eventValidatorName]["eventValidator/errorMessage"] )

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
        v => v.every( attr => Object.keys( Attribute.validators ).includes(attr) )
        ].every( f => f(v) ),
        "eventType/eventValidators":  v => [
        v => typeof v === "object",
        v => Array.isArray(v),
        //v => v.every( attr => Object.keys( Attribute.validators ).includes(attr) )
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

    Object.keys(S.eventAttributes).forEach( eventAttributeName => S.eventAttributes[ eventAttributeName ]["validator"] = attributeValidators[ eventAttributeName ] )


    S.selectedEvents = S.Events.filter( Event => Event["event/incorporation/orgnumber"] === S.selectedOrgnumber ).sort( (a, b) => a["event/index"] - b["event/index"]  )    
    S.companyDoc = prepareCompanyDoc(S, S.selectedEvents)
    console.log("companyDoc", S.companyDoc)
/* 
    S.eventAttributes = Array.isArray(S.eventAttributes) ?  mergeArray( S.eventAttributes.map( eventAttribute => createObject(eventAttribute["attr/name"], eventAttribute) ) ) : S.eventAttributes //Ugly.......
    S.eventTypes = Array.isArray(S.eventTypes) ?  mergeArray( S.eventTypes.map( eventType => createObject(eventType["eventType/name"], eventType) ) ) : S.eventTypes */


    

    S.elementTree = generateHTMLBody(S, getUserActions(S) )
    
    console.log("State: ", S)

    sideEffects.updateDOM( S.elementTree )
}

sideEffects.configureClient();

let Admin = {
    updateClientRelease: (newVersion) => Admin.submitDatoms([newDatom(2829, "transaction/records", {"serverVersion":"0.3.2","clientVersion":newVersion})], null),
    resetServer: () => sideEffects.APIRequest("GET", "resetServer", null),
    submitDatoms: async (datoms) => datoms.length < 20
    ? await sideEffects.APIRequest("POST", "transactor", JSON.stringify( logThis(datoms, "Datoms submitted to Transactor.") )) 
    : console.log("ERROR: Too many datoms: ", datoms)
}
