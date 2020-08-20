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
            S.selectedOrgnumber = userContent.Companies[0]["company/orgnumber"]
            S.selectedYear = S.Companies.filter( C => C["company/orgnumber"] === S.selectedOrgnumber)[0]["h/Events"][0]["date"].slice(0,4)

        }

    }

    S.selectedCompany = S.Companies.filter( C => C["company/orgnumber"] === S.selectedOrgnumber)[0]
    

    return S
}

let update = async (receivedS) => {
    
        
    let S = await getLocalState(receivedS)
    console.log("State: ", S)
    let A = getUserActions(S)

    renderUI( S, A )    
}

let submitTransaction = async (datoms, receivedS) => {
    let userContent = await APIRequest("POST", "transactor", JSON.stringify( datoms ))

    let S = userContent
    S.currentPage = receivedS.currentPage
    S.selectedCompany = S.Companies.filter( C => C["company/orgnumber"] === receivedS.selectedCompany["company/orgnumber"] )[0]
    S.selectedYear = receivedS.selectedYear

    update( S )
}

configureClient();



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

/* 
const dbAdmin = {       
    Q: async () => await fetchEntities(),
    newAttribute: (entityID, name, valueType, doc) => [
        newDatom( entityID, "attr/name", name),
        newDatom( entityID, "attr/valueType", valueType),
        newDatom( entityID, "attr/doc", doc ? doc : "No documentation provided")
    ],
    dbInit: async () => await dbAdmin.postDatoms([
        dbAdmin.newAttribute(1, "type", "string", "Selection between a defined set of object types, such as 'transactions', 'records' etc. "),
        dbAdmin.newAttribute(2, "date", "string", "Date string, formatted as YYYY-MM-DD"),
        dbAdmin.newAttribute(3, "parent", "ref", "The parent entity containing this entity as a sub-component."),
        dbAdmin.newAttribute(4, "transaction/description", "string", "Short description of accounting transaction for the record."),
        dbAdmin.newAttribute(5, "transaction/amount", "number", "Positive or negative amount for the bank record of a transaction. Positive amount implies increase of an account, ie. debit for asset/cost accounts and credit for equity/revenue accounts."),
        dbAdmin.newAttribute(6, "record/amount", "number", "Positive or negative amount for an accounting record. Positive amount implies increase of an account, ie. debit for asset/cost accounts and credit for equity/revenue accounts."),
        dbAdmin.newAttribute(7, "record/account", "string", "Four digit account number, specifying the account for a record."),
        dbAdmin.newAttribute(8, "company/orgnumber", "string"),
        dbAdmin.newAttribute(9, "company/name", "string"),
        dbAdmin.newAttribute(10, "user/email", "string"),
        dbAdmin.newAttribute(11, "user/companies", "ref"),
        dbAdmin.newAttribute(12, "tx/tx", "number"),
        dbAdmin.newAttribute(13, "security/securityType", "string"),
        dbAdmin.newAttribute(14, "security/ticker", "string"),
        dbAdmin.newAttribute(15, "transaction/investment/security", "ref"),
        dbAdmin.newAttribute(16, "transaction/investment/quantity", "number"),
        dbAdmin.newAttribute(17, "transaction/investment/unitPrice", "number"),
        dbAdmin.newAttribute(18, "transaction/investment/fees", "number"),
        dbAdmin.newAttribute(19, "transaction/type", "string", "Type of transaction (investment, equity etc)"),
        dbAdmin.newAttribute(20, "transaction/generic/account", "string", "Four digit account number, specifying the account for a transaction (in addition to 1920)."),
        dbAdmin.newAttribute(214, "transaction/bankTransactionReference", "string", "The bank's reference number for a given transaction, to avoid duplicated imports."), //NB: check entity ID
        dbAdmin.newAttribute(215, "transaction/bank", "string", "The bank the transaction is imported from"), //NB: check entity ID
        dbAdmin.newAttribute(241, "transaction/objectReference", "ref", "The entity which is referred to as a 'sub-account' of a transaction"), //NB: check entity ID
        dbAdmin.newAttribute(365, "transaction/records", "object", "Object containing child objects with an unspecified number of records belonging to a (non-simple) transaction."), //NB: check entity ID
        dbAdmin.newAttribute(387, "bankAccount/bank", "string", "Name of the bank."), //NB: check entity ID
        dbAdmin.newAttribute(388, "bankAccount/accountNumber", "string", "Bank account number."), //NB: check entity ID
        dbAdmin.newAttribute(402, "transaction/bankAccount", "ref", "Link to the bank account the transaction is connected to."), //NB: check entity ID
        dbAdmin.newAttribute(727, "transaction/shareholder", "ref", "The shareholder associated with a transaction (for a shareholder loan or similar)."), //NB: check entity ID
        dbAdmin.newAttribute(1896, "process/identifier", "string", "Unique identifier for a defined process, eg. companyFounding."), //NB: check entity ID
        dbAdmin.newAttribute(2064, "company/AoA/nominalSharePrice", "number", "The nominal share price, as described in the company's articles of association (Aksjens pålydende"),
        ].flat())



//Auth.onPageLoad()

const Auth = {
    auth0: null,
    user: null,
    authenticate: async () => {
        try{
          await Auth.auth0.handleRedirectCallback();
          window.history.replaceState({}, document.title, "/");
          Auth.onPageLoad();
        } catch (error) {
          console.log("Not logged in.");
          Auth.login()
        }
    },
    login: () => Auth.auth0.loginWithRedirect({redirect_uri: window.location.origin}),
    logout: () => Auth.auth0.logout({returnTo: window.location.origin}),
    getAuth0Client: async function () {
      return await createAuth0Client({
        domain: "holdingservice.eu.auth0.com",
        client_id: "3BjA7O8H2dGx2g2nhssoFie0vWWx7ne5",
        audience: "localhost:3000/api" //Is this needed?
      });
    },
    onPageLoad: async () => {
        Auth.auth0 = await Auth.getAuth0Client();
        let isAuthenticated = await Auth.auth0.isAuthenticated();
        if(await isAuthenticated){
            Auth.user = await Auth.auth0.getUser();
            console.log("Already authenticated as :", Auth.user);
            update(null)
        }else{
            Auth.authenticate()
        }
    }
}
} 






let updateCompany = (prevCompany, eventEntities) => {

    let eventController = {
        "AoA": (prevCompany, event) => {

            let company = mergerino({}, prevCompany )

            company["orgnumber"] = event["company/orgnumber"]
            company["name"] = event["company/name"]
            company["nominalSharePrice"] = event["company/AoA/nominalSharePrice"]

            return company
        },
        "transactions": (prevCompany, event) => {

            let company = mergerino({}, prevCompany )

            let eventYear = moment(event["date"]).format("YYYY")

            event.records.forEach( record => {

                let account = record["transaction/generic/account"]

                if(Number(account) < 3000 ){

                    if( typeof company["years"][eventYear]["accountBalance"][account] === "undefined" ){
                    
                        company["years"][eventYear]["accountBalance"][account] = record["transaction/amount"]
    
                    }else{
    
                        company["years"][eventYear]["accountBalance"][account] += record["transaction/amount"]
    
                    }

                    if(Number(account) === 2000){

                        company["years"][eventYear]["shareCount"] += record["transaction/investment/quantity"]

                        if( !company["years"][eventYear]["shareholders"].includes([ record["company/orgnumber"] ])  ){

                            company["years"][eventYear]["shareholders"] = company["years"][eventYear]["shareholders"].concat(record["company/orgnumber"])

                        }

                    }


                }else{

                    if( typeof company["years"][eventYear]["accountBalance"][account] === "undefined" ){
                    
                        company["years"][eventYear]["periodAccounts"][account] = record["transaction/amount"]
    
                    }else{
    
                        company["years"][eventYear]["periodAccounts"][account] += record["transaction/amount"]
    
                    }

                    let periodAccounts = company["years"][eventYear]["periodAccounts"]


                    let EBIT = Object.values(periodAccounts).reduce( (sum, accountAmount) => sum + accountAmount, 0)

                    let taxAmount = EBIT < 0 ? 1000 : 0

                    company["years"][eventYear]["yearEndAccounts"] = {
                        "8300": taxAmount,
                        "2500": taxAmount,
                        "8800": EBIT,
                        "2080": EBIT
                    }

                    let incomeStatementAccounts = {
                        "9000": 1000,
                        "9010": 1000
                    }

                    company["years"][eventYear]["incomeStatementAccounts"] = {
                        "8300": taxAmount,
                        "2500": taxAmount,
                        "8800": EBIT,
                        "2080": EBIT
                    }


                    
                }
                
            } )

            


            return company

        },
    }

    let company = eventEntities.reduce( (prevCompany, event) => {

        let eventYear = moment(event["date"]).format("YYYY")

        let company = (prevCompany === null) ? {index: 0, years: {} } : mergerino({}, prevCompany )

        company["index"] = company["index"] + 1
        company["date"] = event["date"]

        if(company["years"][eventYear]){
            company["years"][eventYear]["events"] = company["years"][eventYear]["events"].concat(event)
            
        }else{

            let openingBalance = company["years"][eventYear - 1] ? company["years"][eventYear - 1]["accountBalance"] : {}
            let shareCount = company["years"][eventYear - 1] ? company["years"][eventYear - 1]["shareCount"] : 0
            let shareholders = company["years"][eventYear - 1] ? company["years"][eventYear - 1]["shareholders"] : []

            

            company["years"][eventYear] = {
                company_before: prevCompany,
                events: [event],
                openingBalance: openingBalance,
                accountBalance: openingBalance,
                periodAccounts: {},
                yearEndAccounts: {},
                incomeStatementAccounts: {},
                shareCount: shareCount,
                shareholders: shareholders
            }
        }

        let companyAfterEvent = eventController[ event.type ](company, event)

        return companyAfterEvent

    }, prevCompany )
  
    return company
}

let createQ = (Entities) => returnObject({
    tx: Entities.tx,
    Entities: () => Entities.Entities,
    filter: (filter) => Entities.Entities.filter( filter ),
    getEntity: (id) => Entities.Entities.filter( e => e["entity"] === id )[0],
    getChildren: (id) => Object.values(Entities.Entities).filter( e => e["parent"] == id ),
    getTrialBalance: (orgnumber, year) => {
        let accountKeys = Object.keys(Accounts)

        let allTransactions = Q_object.Entities.filter( e => e.type == "transactions" && e["company/orgnumber"] === orgnumber  && Number( moment(e["date"]).format("YYYY") ) <= Number(year) )
        let allTransactionIDs = allTransactions.map( t => t.entity)
        let historicalTransactionsIDs = allTransactions.filter( transaction => Number( moment(transaction["date"]).format("YYYY") ) < Number(year) ).map( transaction => transaction.entity)
        
        let [historicalRecords, periodRecords] = split( Q_object.Entities.filter( e => e.type == "records" && allTransactionIDs.includes(e.parent) ) , record => historicalTransactionsIDs.includes(record.parent) )

        let accounts = accountKeys.map( account => {
            let openingBalance = historicalRecords.filter( record => record["transaction/generic/account"] === account ).reduce( (sum, record) => sum + record["transaction/amount"], 0)
            let accountRecords = periodRecords.filter( record => record["transaction/generic/account"] === account )
            let recordCount = accountRecords.length
            let debitAmount = accountRecords.filter( record => record["transaction/amount"] > 0 ).reduce( (sum, record) => sum + record["transaction/amount"], 0)
            let creditAmount = accountRecords.filter( record => record["transaction/amount"] < 0 ).reduce( (sum, record) => sum + record["transaction/amount"], 0)
            return {account, openingBalance, debitAmount, creditAmount, recordCount}
        }).filter( account => account.openingBalance !== 0 || account.recordCount !== 0)
        


        return {
            orgnumber: orgnumber,
            firstDate: `${year}-01-01`, 
            lastDate: `${year}-12-31`,
            accounts: accounts,
            totalDebit: accounts.reduce( (sum, account) => sum + account["debitAmount"], 0),
            totalCredit: accounts.reduce( (sum, account) => sum + account["creditAmount"], 0),
            totalRecordCount: accounts.reduce( (sum, account) => sum + account["recordCount"], 0)
          }

    },
    getAllRecords: (orgnumber) => Entities.Entities.filter( e => e.type == "records" && Entities.Entities.filter( e => e.type == "transactions" && e["company/orgnumber"] === orgnumber ).map( t => t.entity).includes(e.parent) ),
    getAccountBalance: (orgnumber, account, date) => {
        let allTransactions = Q_object.Entities.filter( e => e.type == "transactions" && e["company/orgnumber"] === orgnumber )
        let periodTransactions = allTransactions.filter( t => moment(t["date"]).format("X") <= moment(date).format("X") )
        //console.log("periodTransactions", periodTransactions)
        let transactionIDs = periodTransactions.map( t => t.entity)
        let periodRecords = Q_object.Entities.filter( e => e.type == "records" && transactionIDs.includes(e.parent) )
        let accountRecords = periodRecords.filter( record => record["transaction/generic/account"] === account )
        //console.log("accountRecords", accountRecords)
        let accountBalance = accountRecords.reduce( (sum, record) => sum + record["transaction/amount"], 0)
        return accountBalance
    },
    getCompanySnapshot: (orgnumber, date) => {

        let companyEntities = Entities.Entities.filter( e => e["company/orgnumber"] === orgnumber && moment( e["date"] ).format("x") <= moment( date ).format("x") )
        let transactionsWithRecords = companyEntities.filter(e => e.type === "transactions").map( transaction => mergerino(transaction, {records: Entities.Entities.filter( r => r.type === "records" && r.parent === transaction.entity ) } ) )
        let AoA = companyEntities.filter(e => e.type === "AoA")
        let allEvents = [transactionsWithRecords, AoA].flat().sort( sortEntityByDate )
        let company = updateCompany(null, allEvents)
        return company

    }
})


*/