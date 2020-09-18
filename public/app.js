let auth0 = null;

const configureClient = async () => {
  
    auth0 = await createAuth0Client({
      domain: "holdingservice.eu.auth0.com",
      client_id: "3BjA7O8H2dGx2g2nhssoFie0vWWx7ne5",
      audience: "localhost:3000/api"
    }); //This call is for some reason never resolved..

    let isAuthenticated = await auth0.isAuthenticated();


    if(isAuthenticated){
        console.log("Authenticated");
        let S = await APIRequest("GET", "userContent", null)
        S.currentPage = "overview"
        S.selectedOrgnumber = "999999999"
        update(S)
    }else{
        try{
            await auth0.handleRedirectCallback();
            window.history.replaceState({}, document.title, "/");
            configureClient()
          } catch (error) {
            console.log("Not logged in.");
            auth0.loginWithRedirect({redirect_uri: window.location.origin})
          }
    }
    return true

};

let getRetractionDatomsWithoutChildren = (Entities) => Entities.map( Entity =>  Object.entries( Entity ).map( e => newDatom(Entity["entity"], e[0], e[1], false) ).filter( d => d["attribute"] !== "entity" ) ).flat() //Need to also get children

let getUserActions = (S) => returnObject({
    updateLocalState: (patch) => update( mergerino(S, patch) ),
    updateEventAttribute: async (Event, attribute, e) => {

        let value = Attribute.isNumber(attribute) ? Number(e.srcElement.value) : e.srcElement.value

        let apiResponse = Attribute.validate(attribute, value) //Only attribute validation, not event level.
        ? await APIRequest("POST", "transactor", JSON.stringify( [newDatom(Event["entity"], attribute, value)] ) )
        : null

        let isInvalid = (apiResponse === null)

        if(isInvalid){console.log("ERROR: Attribute value is not valid: ", Event, attribute, e)}

        let newS = isInvalid ? S : mergerino(S, apiResponse)
        
        update( newS )
    },
    createEvent: async ( eventCycle, eventType ) => {

        //let datoms = sharedConfig.eventTypes[ eventType ]["newEventDatoms"](CompanyDoc)
        let datoms = [
            newDatom("newEvent", "type", "process"), //TBU..
            newDatom("newEvent", "entity/type", "event"),
            newDatom("newEvent", "event/eventType", eventType),
            newDatom("newEvent", "event/incorporation/orgnumber", eventCycle["inputEvent"]["event/incorporation/orgnumber"]), //TBU..
            newDatom("newEvent", "event/index", eventCycle["inputEvent"]["event/index"] + 1),
            newDatom("newEvent", "entity/type", "event"),
        ]
        console.log(datoms)
        let apiResponse = await APIRequest("POST", "transactor", JSON.stringify( datoms ))
        let newS = mergerino(S, apiResponse)
        update( newS )
    },
    retractEvent: async Event => {
        let storedEntity = S.Events.filter( e => e.entity === Event.entity  )[0]
        let retractionDatoms = getRetractionDatomsWithoutChildren([storedEntity])
        let apiResponse = retractionDatoms.length < 20 ? await APIRequest("POST", "transactor", JSON.stringify( retractionDatoms )) : console.log("ERROR: >20 retraction datoms submitted: ", retractionDatoms)
        let newS = mergerino(S, apiResponse)
        update( newS )
    }
})

let APIRequest = async (type, endPoint, stringBody) => {

    let startTime = Date.now()

    let APIendpoint = `https://holdingservice.appspot.com/api/${endPoint}`

    let authToken = await auth0.getTokenSilently()
    let headers = {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken}
    let response = (type === "GET") ? await fetch(APIendpoint, {method: "GET", headers: headers })
                                    : (type === "POST") ? await fetch(APIendpoint, {method: "POST", headers: headers, body: stringBody })
                                    : console.log("ERROR: Invalid HTTP method: ", type, endPoint, body )
    let parsedResponse = await response.json()
    
    let duration = Date.now() - startTime;
    console.log(`Executed ${type} request to '/${endPoint}' in ${duration} ms.`, parsedResponse)

    return parsedResponse;
}


const sideEffects = {
    appContainer: "appContainer",
    updateDOM: elementTree => [
        sideEffects.applyHTML,
        sideEffects.applyEventListeners
    ].forEach( stepFunction => stepFunction(elementTree) ),
    applyHTML: elementTree => document.getElementById(sideEffects.appContainer).innerHTML = elementTree.map( element => element.html ).join(''),
    applyEventListeners: elementTree => elementTree.map( element => Array.isArray(element.eventListeners) ? element.eventListeners : [] ).flat().forEach( eventListener => document.getElementById( eventListener.id ).addEventListener(eventListener.eventType, eventListener.action) )
}


// COMPANY DOCUMENT CREATION PIPELINE



let getInitialEventCycle = () =>  returnObject({"company/:allEventsAreValid": true})
  
let getAccumulatedOutputs = (Events) => Events.reduce( (accumulatedVariables_before, eventAttributes) => mergerino(accumulatedVariables_before, mergeArray( outputFunction.calculateAllDependencies( accumulatedVariables_before, eventAttributes  ) ) ), getInitialEventCycle() )

let getValidationReport = (accumulatedVariables_before, eventAttributes) => {

    let eventType = eventAttributes["event/eventType"]

    let validationResults = eventTypes[ eventType ][ "validators" ].map(  eventValidator => {


        let argumentsSwitch = {
            "attributeValidator": eventAttributes[ eventValidator["attribute"] ],
            "companyVariableValidator": accumulatedVariables_before[ eventValidator["companyVariable"] ],
            "eventValidator": eventAttributes,
            "companyValidator": accumulatedVariables_before,
        }

        let validatorArgument = argumentsSwitch[ eventValidator["type"] ]

        let isValid = eventValidator["type"] === "combinedValidator" ? Validators["validators"][ eventValidator[ "validator" ]  ]( accumulatedVariables_before, eventAttributes ) : Validators["validators"][ eventValidator[ "validator" ]  ]( validatorArgument )

        let validationResult = mergerino( eventValidator, {validatorArgument: validatorArgument, isValid: isValid} )

        return validationResult

    }  )


    let isValid = validationResults.every( validationResult => validationResult.isValid )

    let validationReport = {eventType, isValid, validationErrors: validationResults.filter( validationResult => !validationResult.isValid ) }

    return validationReport
}

let prepareEventCycles = (Events) => Events.map( (eventAttributes, index) => {

    let eventType = eventAttributes["event/eventType"]
    let accumulatedVariables_before = getAccumulatedOutputs( Events.slice( 0, index ) )
    
    /* let validationReport = getValidationReport( accumulatedVariables_before, eventAttributes )
    let validationErrors = validationReport.validationErrors
    let isValid = validationReport.isValid */

    let eventPatch = mergeArray( outputFunction.calculateAllDependencies( accumulatedVariables_before, eventAttributes  ) )
    let accumulatedVariables_after = mergerino( accumulatedVariables_before, eventPatch )


    return {index,eventType, accumulatedVariables_before,eventAttributes,eventPatch,accumulatedVariables_after}
}   )

// COMPANY DOCUMENT CREATION PIPELINE - END

let update = (S) => {


    S.selectedEvents = S.Events.filter( Event => Event["event/incorporation/orgnumber"] === S.selectedOrgnumber ).sort( (a, b) => a["event/index"] - b["event/index"]  )
    S.eventCycles = prepareEventCycles(S.selectedEvents)
    S.elementTree = generateHTMLBody(S, getUserActions(S) )
    
    console.log("State: ", S)

    sideEffects.updateDOM( S.elementTree )
}

configureClient();

let Admin = {
    updateClientRelease: (newVersion) => submitDatoms([newDatom(2829, "transaction/records", {"serverVersion":"0.3.2","clientVersion":newVersion})], null),
    resetServer: () => APIRequest("GET", "resetServer", null),
    submitDatoms: async (datoms) => datoms.length < 20 
    ? await APIRequest("POST", "transactor", JSON.stringify( logThis(datoms, "Datoms submitted to Transactor.") )) 
    : console.log("ERROR: Too many datoms: ", datoms)
}


