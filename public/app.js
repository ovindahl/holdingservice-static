const sideEffects = {
  isIdle: true,
  appContainer: "appContainer",
  updateDOM: elementTree => [
      sideEffects.applyHTML,
      sideEffects.applyEventListeners
  ].forEach( stepFunction => stepFunction(elementTree) ),
  applyHTML: elementTree => document.getElementById(sideEffects.appContainer).innerHTML = elementTree.map( element => element.html ).join(''),
  applyEventListeners: elementTree => elementTree.map( element => Array.isArray(element.eventListeners) ? element.eventListeners : [] ).flat().forEach( eventListener => document.getElementById( eventListener.id ).addEventListener(eventListener.eventType, eventListener.action) ),
  APIRequest: async (type, endPoint, stringBody) => {
    if(sideEffects.isIdle){
      sideEffects.isIdle = false;
      let statusDiv = document.getElementById("APISYNCSTATUS")
      if(!isNull(statusDiv)) {
        statusDiv.innerHTML = "Laster";
      }
      let startTime = Date.now()
      let APIendpoint = `https://holdingservice.appspot.com/api/${endPoint}`
      let authToken = await sideEffects.auth0.getTokenSilently()
      let headers = {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken}
      let response = (type === "GET") ? await fetch(APIendpoint, {method: "GET", headers: headers })
                                      : (type === "POST") ? await fetch(APIendpoint, {method: "POST", headers: headers, body: stringBody })
                                      : console.log("ERROR: Invalid HTTP method: ", type, endPoint, body )
      let parsedResponse = await response.json()
      console.log(`Executed ${type} request to '/${endPoint}' in ${Date.now() - startTime} ms.`, parsedResponse)
      sideEffects.isIdle = true;
      if(!isNull(statusDiv)) {
        statusDiv.innerHTML = "Ledig"
      }
      
      return parsedResponse;
    }else{
      log( {type, endPoint, stringBody}, "Declined HTTP request, another in progress:")
      return null;
    }
  },
  auth0: null,
  configureClient: async () => {
      sideEffects.auth0 = await createAuth0Client({
        domain: "holdingservice.eu.auth0.com",
        client_id: "3BjA7O8H2dGx2g2nhssoFie0vWWx7ne5",
        audience: "localhost:3000/api"
      }); //This call is for some reason never resolved..
      if(await sideEffects.auth0.isAuthenticated()){
          console.log("Authenticated");
          init()
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

var State = {} //Consle access to State
var S = {} //Consle access to localState
var D = {} //Consle access to DB
var C = {} //Consle access to Company
var Company = {} //Consle access to Company
var A = {} //Consle access to Actions

//COMPONENTS

const DB = {
  initial: DB => returnObject({ }),
  Actions: State => returnObject({
    //executeCompanyAction: async actionEntity => await DB.getGlobalAsyncFunction( actionEntity )( DB, Company, Process, Event ).then( updateCallback  )
  })
} 


const Components = [DB, ClientApp, AdminPage, TransactionsPage, BalancePage, AccountingYearPage, ActorsPage]

var States = []
var Patches = []

let updateState = (prevState, patch) => {

  let newState = {
      created: Date.now(),
      DB: Object.keys(patch).includes( "DB" ) ? patch.DB : prevState.DB,
      companyDatoms: Object.keys(patch).includes( "companyDatoms" ) ? patch.companyDatoms : prevState.companyDatoms,
      S: mergerino(prevState.S, patch.S),
    }

  newState.Company = {
    entity: newState.S.selectedCompany,
    companyDatoms: newState.S.companyDatoms,
    get: (entity, attribute, transactionIndex) => newState.DB.isAttribute(attribute) 
      ? newState.DB.get(entity, attribute) 
      : getFromCompany( newState.S.companyDatoms, entity, attribute, transactionIndex ),
    getAllTransactions: accountingYear => getAllTransactions(newState.DB, newState.S.selectedCompany, accountingYear),
    getBalanceObjects: queryObject => getBalanceObjects( newState.DB, newState.S.companyDatoms, newState.S.selectedCompany, queryObject ),
    getTransactionByIndex: index => isDefined(index) ? getTransactionByIndex( newState.DB, newState.S.selectedCompany, State.companyDatoms,  index ) : getAllTransactions(newState.DB, newState.S.selectedCompany).slice(-1)[0]
  }
  
  newState.Actions = Components.reduce( (Actions, Component) => Object.assign( Actions, Component.Actions( newState ) ), {} )
      
  State = newState
  S = newState.S
  D = newState.DB
  C = newState.Company
  Company = newState.Company
  A = newState.Actions

  States.push( newState )
  Patches.push( patch )

  log({prevState, patch, newState})
  
  let startTime = Date.now()
  sideEffects.updateDOM( [clientPage( newState )] )
  if( State.S.selectedPage === 9338 ){ renderGraph( State ) } 
  console.log(`generateHTMLBody finished in ${Date.now() - startTime} ms`)
}

let init = async () => {

  let firstState = {created: Date.now(), isAdmin: false}

  updateState( {}, firstState )

  let Entities = await sideEffects.APIRequest("GET", "Entities", null)

  if( Entities.length > 0 ){

    let initialDatabase = constructDatabase( Entities )
    

    updateState( firstState, {
      DB: initialDatabase,
      S: Components.reduce( (Initial, Component) => Object.assign( Initial, Component.initial( initialDatabase ) ), {} )
      } )
    
  }else{ updateState( firstState, {S: {isError: true, error: "ERROR: Mottok ingen data fra serveren. Last på nytt om 30 sek." }} ) }
  
}

sideEffects.configureClient();

/* 
var Stream = {
  update: newDatoms => {

    // new Datoms should first be applied to DB on client side
    // UI should then update
    // THEN  new datoms can sync to DB
    // if sync is unsuccessfull, error should be shown

    // Maybe just separate Transactor from readDB

    console.log( newDatoms )

    let updatedDB = Database.applyDatoms( newDatoms )

    console.log( { Datoms, updatedDB } )

    updateState( updatedDB )

    Database.syncDatoms( newDatoms )

  }
} */



//Archive