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


const templateDatoms = {
    complexTransaction: (S) => [
      newDatom("process", "type", "process"),
      newDatom("process", "date", S.selectedCompany["h/Events"][1]["date"]),
      newDatom("process", "process/identifier", "complexTransaction"),
      newDatom("process", "company/orgnumber", S.selectedCompany["company/orgnumber"]),
      newDatom("complexTransaction", "type", "transactions"),
      newDatom("complexTransaction", "parent", "process"),
      newDatom("complexTransaction", "date", S.selectedCompany["h/Events"][1]["date"]),
      newDatom("complexTransaction", "company/orgnumber", S.selectedCompany["company/orgnumber"]),
      newDatom("complexTransaction", "transaction/description", "Fri postering"),
      newDatom("record", "type", "records"),
      newDatom("record", "parent", "complexTransaction"),
      newDatom("record", "transaction/generic/account", "1920"),
      newDatom("record", "transaction/amount", -10000),
      newDatom("record2", "type", "records"),
      newDatom("record2", "parent", "complexTransaction"),
      newDatom("record2", "transaction/generic/account", "1920"),
      newDatom("record2", "transaction/amount", 10000),
    ],
    newRecord: (S, eventEntity) => [
      newDatom("record", "type", "records"),
      newDatom("record", "parent", eventEntity.Documents[0]["entity"]),
      newDatom("record", "transaction/generic/account", "1920"),
      newDatom("record", "transaction/amount", 0),
    ],
    newCompany: (S, orgnumber) => [
      newDatom("process", "type", "process"),
      newDatom("process", "date", "2020-01-01"),
      newDatom("process", "process/identifier", "incorporation"),
      newDatom("process", "company/orgnumber", String( orgnumber) ),
    ],
    addFounder: (incorporationEvent) => [
      newDatom(incorporationEvent.entity, "transaction/records", Array.isArray(incorporationEvent["transaction/records"]) ? incorporationEvent["transaction/records"].concat({"company/orgnumber":"010120123456","transaction/investment/quantity":0,"transaction/investment/unitPrice":0}) : [{"company/orgnumber":"010120123456","transaction/investment/quantity":0,"transaction/investment/unitPrice":0}] )
    ]
  }


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
    },
    updateEventAttribute: async (Event, attribute, value) => {


        let validators = H.inputAttributes[ attribute ].validators

        let validationResult = validators.map( validator => validator(value)  )

        


        let datom = [newDatom(Event["entity"], attribute, e.srcElement.value)]

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