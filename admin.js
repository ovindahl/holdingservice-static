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
        update(null)
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

let getRetractionDatoms = (serverEntities, Entities) => getRetractionDatomsWithoutChildren(Entities).concat( Entities.map( Parent => getRetractionDatoms(serverEntities, serverEntities.filter( e => e["parent"] == Parent["entity"] )   ) ).flat() )

let getUserActions = (S) => returnObject({
    patch: (patch) => update( mergerino(S, patch) ),
    submitDatoms: (datoms) => submitTransaction(datoms, S ),
    retractEntity: async entityID => {

        let EntitiesObject = await APIRequest("GET", "Entities", null)

        let serverEntities = EntitiesObject.Entities

        let Entity = serverEntities.filter( e => e["entity"] === entityID )[0]

        let retractionDatoms = getRetractionDatoms(serverEntities, [Entity] )

        if(retractionDatoms.length < 100){
            submitTransaction( retractionDatoms, S )
        }else{
            console.log("ERRROR: Over 100 retraction datoms submitted:", retractionDatoms)
        }
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

let getLocalState = async (receivedS) => {

    let S = receivedS

    if(S === null){

        let userContent = await APIRequest("GET", "userContent", null)

        S = userContent

        if(userContent !== null){

            S.currentPage = "overview"
            S.selectedCompany = userContent.Companies[0]
            S.selectedYear = S.selectedCompany["h/Events"][0]["date"].slice(0,4)

        }

    }

    return S
}

let update = async (receivedS) => {
    
        
    let S = await getLocalState(receivedS)
    console.log("State: ", S)
    let A = getUserActions(S)

    renderAdminUI( S, A )    
}

let submitTransaction = async (datoms, receivedS) => {
    let userContent = await APIRequest("POST", "transactor", JSON.stringify( datoms ))

    let S = userContent
    S.currentPage = receivedS.currentPage
    S.selectedCompany = S.Companies.filter( C => C["company/orgnumber"] === receivedS.selectedCompany["company/orgnumber"] )[0]
    S.selectedYear = receivedS.selectedYear

    update( S )
}

//Admin views

var adminActionMappings = [] //Temporary global container for actionsmappings, to be made functional

let addActionMapping = (actionMappings) => adminActionMappings = adminActionMappings.concat( actionMappings )

const renderAdminUI = (S, A) => { 
    adminActionMappings = [];
    document.getElementById("appContainer").innerHTML = "Admin view WIP"
    adminActionMappings.forEach( actionMapping => document.getElementById(actionMapping.triggerId).addEventListener(actionMapping.type, actionMapping.action) )
}

configureClient();


