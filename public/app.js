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
            let E = await sideEffects.APIRequest("GET", "serverCache", null)
            S.eventAttributes = E.Entities.filter( e => e["attr/name"] ).filter( e =>  e["attr/name"].startsWith("event/") )
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
    updateEventAttribute: async (entityID, attribute, value) => {

        //let value = Attribute.isNumber(attribute) ? Number(e.srcElement.value) : e.srcElement.value

        let datoms = [newDatom(entityID, attribute, value)]

        console.log(datoms)

        let apiResponse = Attribute.validate(attribute, value) //Only attribute validation, not event level.
        ? await sideEffects.APIRequest("POST", "transactor", JSON.stringify( [newDatom(entityID, attribute, value)] ) )
        : null

        let isInvalid = (apiResponse === null)

        if(isInvalid){console.log("ERROR: Attribute value is not valid: ", entityID, attribute, value)}

        let newS = isInvalid ? S : mergerino(S, apiResponse)

        newS.eventAttributes = S.eventAttributes
        
        update( newS )
    },
    createEvent: async ( appliedEvent, newEventType ) => {

        let datoms = eventTypes[ newEventType ]["newEventDatoms"](appliedEvent)

        let apiResponse = await sideEffects.APIRequest("POST", "transactor", JSON.stringify( datoms ))
        let newS = mergerino(S, apiResponse)
        newS.eventAttributes = S.eventAttributes
        update( newS )
    },
    retractEvent: async entityID => {
        let storedEntity = S.Events.filter( e => e.entity === entityID  )[0]
        let retractionDatoms = getRetractionDatomsWithoutChildren([storedEntity])
        let apiResponse = retractionDatoms.length < 20 ? await sideEffects.APIRequest("POST", "transactor", JSON.stringify( retractionDatoms )) : console.log("ERROR: >20 retraction datoms submitted: ", retractionDatoms)
        let newS = mergerino(S, apiResponse)
        newS.eventAttributes = S.eventAttributes
        update( newS )
    }
})

let update = (S) => {

    S.selectedEvents = S.Events.filter( Event => Event["event/incorporation/orgnumber"] === S.selectedOrgnumber ).sort( (a, b) => a["event/index"] - b["event/index"]  )    
    S.companyDoc = prepareCompanyDoc(S.selectedEvents)
    console.log("companyDoc", S.companyDoc)

    S.elementTree = generateHTMLBody(S, getUserActions(S) )
    
    console.log("State: ", S)

    sideEffects.updateDOM( S.elementTree )
}

sideEffects.configureClient();

let Admin = {
    updateClientRelease: (newVersion) => submitDatoms([newDatom(2829, "transaction/records", {"serverVersion":"0.3.2","clientVersion":newVersion})], null),
    resetServer: () => sideEffects.APIRequest("GET", "resetServer", null),
    submitDatoms: async (datoms) => datoms.length < 20
    ? await sideEffects.APIRequest("POST", "transactor", JSON.stringify( logThis(datoms, "Datoms submitted to Transactor.") )) 
    : console.log("ERROR: Too many datoms: ", datoms)
}




let ruun = async () => {

    let E = await sideEffects.APIRequest("GET", "serverCache", null)

    let simpleTransactions = E.Entities
        .filter( e => e["type"] === "transactions" )
        .filter( t => E.Entities.filter( e => e["parent"] === t["entity"] ).length === 2  )
        .filter( t => E.Entities.filter( e => e["parent"] === t["entity"] ).map( record => record["transaction/generic/account"] ).includes("1920")  )

    let newEvents = simpleTransactions.map( (simpleTransaction, index) => [
        newDatom(simpleTransaction["entity"], "type", "process"), //TBU..
        newDatom(simpleTransaction["entity"], "entity/type", "event"),
        newDatom(simpleTransaction["entity"], "event/eventType", "operatingCost/bank"),
        newDatom(simpleTransaction["entity"], "event/incorporation/orgnumber", simpleTransaction["company/orgnumber"]  ), //TBU..
        newDatom(simpleTransaction["entity"], "event/index", index + 2 ),
        newDatom(simpleTransaction["entity"], "event/date", simpleTransaction["date"] ),
        newDatom(simpleTransaction["entity"], "event/account", "" ),
        newDatom(simpleTransaction["entity"], "event/amount", E.Entities.filter( e => e["parent"] === simpleTransaction["entity"] && e["transaction/generic/account"] === "1920" )[0]["transaction/amount"]  ) ,
        newDatom(simpleTransaction["entity"], "event/bankTransactionReference", E.Entities.filter( e => e["parent"] === simpleTransaction["entity"] && e["transaction/generic/account"] === "1920" )[0]["transaction/bankTransactionReference"] ? E.Entities.filter( e => e["parent"] === simpleTransaction["entity"] && e["transaction/generic/account"] === "1920" )[0]["transaction/bankTransactionReference"] : "" ),
      ]  ).flat()

    return newEvents



}