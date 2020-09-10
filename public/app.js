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
        let S = await getInitialS()
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
    updateEventAttribute: async (Event, attribute, value) => {
        let attributeValidators = sharedConfig.inputAttributes[ attribute ].validators //Attribute level validation
        let eventValidators = sharedConfig.eventTypes[ Event["process/identifier"] ] //Event level validation TBD

        if( attributeValidators.every( validator => validator(value) ) ){
            let datoms = [newDatom(Event["entity"], attribute, value)]

            let apiResponse = await APIRequest("POST", "transactor", JSON.stringify( datoms ))

            let newS = mergerino(S, apiResponse)

            update( newS )

        }else{
            console.log("Datom validation error: ", Event, attribute, value)
            update(S)
        }
    },
    createEvent: async ( CompanyDoc, eventType ) => {
        let datoms = sharedConfig.eventTypes[ eventType ]["newEventDatoms"](CompanyDoc)
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

let getInitialS = async () => {

    S = await APIRequest("GET", "userContent", null)
    S.currentPage = "overview"
    S.selectedOrgnumber = "999999999"
    return S

}


let updateDOM = (containerID, htmlBody) => {

    document.getElementById(containerID).innerHTML = htmlBody.map( element => element.html ).join('')
    htmlBody.map( element => Array.isArray(element.eventListeners) ? element.eventListeners : [] ).flat().forEach( eventListener => document.getElementById( eventListener.id ).addEventListener(eventListener.eventType, eventListener.action) )
  
}

let update = async (S) => {
    
    let A = getUserActions(S)

    let selectedEvents = S.Events.filter( Event => Event["company/orgnumber"] === S.selectedOrgnumber )

    S.CompanyDoc = generateCompanyDocument( selectedEvents )

    S.CompanySnapshots = selectedEvents.map( (event, index) => generateCompanyDocument( selectedEvents.slice(0, index + 1) ) ).filter( CompanySnapshot => CompanySnapshot["company/rejectedEvents"].length === 0 )

    console.log("State: ", S)
    
    let htmlBody = generateHTMLBody(S, A)
    updateDOM("appContainer", htmlBody)
}



let submitTransaction = async (datoms, receivedS) => {

    let validatedDatoms = []

    let isRetractionDatoms = datoms.every( datom => datom.isAddition === false  )

    //Validation to be improved....

    if(isRetractionDatoms){
        validatedDatoms = datoms.filter( datom => Object.keys(H.inputAttributes).includes(datom.attribute)  ).map( datom => {
            let validators = H.inputAttributes[ datom.attribute ].validators
            let validationResult = validators.every( validator => validator(datom.value) )
            console.log(datom, validationResult)
            return validationResult === true ? datom : validationResult
        }  )

    }else{
        validatedDatoms = datoms.filter( datom => Object.keys(H.inputAttributes).includes(datom.attribute)  ).map( datom => {
            let validators = H.inputAttributes[ datom.attribute ].validators
            let validationResult = validators.every( validator => validator(datom.value) )
            console.log(datom, validationResult)
            return validationResult === true ? datom : validationResult
        }  )

    }


    

    console.log("Datoms sent to Transactor: ", validatedDatoms)


    let userContent = await APIRequest("POST", "transactor", JSON.stringify( validatedDatoms ))

    let updatedS = mergerino(receivedS, userContent)

    let S = await getLocalState( updatedS  )

    update( S )
}

configureClient();


let updateClientRelease = (newVersion) => {

    submitTransaction([newDatom(2829, "transaction/records", {"serverVersion":"0.3.2","clientVersion":newVersion})], null)
}

let resetServer = async () => {
    await APIRequest("GET", "resetServer", null)
}