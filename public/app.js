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

        console.log("Retracting: ", retractionDatoms)

        if(retractionDatoms.length < 100){
            submitTransaction( retractionDatoms, S )
        }else{
            console.log("ERRROR: Over 100 retraction datoms submitted:", retractionDatoms)
        }
    },
    retractSingleEntity: async Entity => {

        let retractionDatoms = getRetractionDatomsWithoutChildren([Entity])

        console.log("Retracting: ", retractionDatoms)

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
            S.Events = userContent.Events
            S.selectedOrgnumber = "999999999" //S.Events[0]["company/orgnumber"]
            S.selectedYear = S.Events.filter( C => C["company/orgnumber"] === S.selectedOrgnumber)[0]["date"].slice(0,4)

        }


    }

    //S.selectedCompany = S.Companies.filter( C => C["company/orgnumber"] === S.selectedOrgnumber)[0]

    S.selectedEvents = S.Events.filter( Event => Event["company/orgnumber"] === S.selectedOrgnumber ).filter( Event => Event.date.substr(0,4) === S.selectedYear )
    

    return S
}

let update = async (receivedS) => {
    
        
    let S = await getLocalState(receivedS)
    console.log("State: ", S)
    let A = getUserActions(S)

    renderUI( S, A )    
}

let submitTransaction = async (datoms, receivedS) => {


    /* let validatedDatoms = datoms.map( datom => {
        let validator = H.inputAttributes[ datom.attribute ].validator
        let validationResult = validator(datom.value)
        console.log(datom, validationResult)
        return validationResult === true ? datom : validationResult
    }  ) 

    console.log(validatedDatoms) */


    let userContent = await APIRequest("POST", "transactor", JSON.stringify( datoms ))

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


//Archive

/* let parseFile = (file) => Papa.parse(file, {complete: results => update(mergerino(S, createObject(`bankImport/parsedFile`, results.data.slice(1, results.data.length ).map( row => returnObject({ date: moment( row[0], "DD.MM.YYYY").format("YYYY-MM-DD"), description: row[1], amount: Number(row[2]), transactionReference: row[3] })  ) )))})

let importBankTransactions = () => Transactor.submit(
    S["bankImport/parsedFile"].map( (row, i) => [
        newDatom( `P${i}`, "type", "process"),
        newDatom( `P${i}`, "parent", S.selectedCompany ),
        newDatom( `P${i}`, "process/identifier", "simpleTransaction"),
        newDatom( `P${i}`, "date", row["date"] ), 
        newDatom( `T${i}`, "type", "transactions"),
        newDatom( `T${i}`, "parent", `P${i}` ),
        newDatom( `T${i}`, "date", row["date"] ), //Redundant?
        newDatom( `T${i}`, "transaction/description", row["description"] ),
        newDatom( `R1${i}`, "type", "records" ),
        newDatom( `R1${i}`, "parent", `T${i}` ),
        newDatom( `R1${i}`, "transaction/generic/account", "1920"),
        newDatom( `R1${i}`, "transaction/bankAccount", S["bankImport/selectedBank"] ),
        newDatom( `R1${i}`, "transaction/bankTransactionReference", row["transactionReference"] ),
        newDatom( `R1${i}`, "transaction/amount", row["amount"] ),
        newDatom( `R2${i}`, "type", "records" ),
        newDatom( `R2${i}`, "parent", `T${i}` ),
        newDatom( `R2${i}`, "transaction/amount", -row["amount"] )
    ]).flat(),
    S
) */