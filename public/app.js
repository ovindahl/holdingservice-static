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
var DB = {} //Consle access to DB
var C = {} //Consle access to Company
var Company = {} //Consle access to Company
var A = {} //Consle access to Actions


let getDBActions = State => returnObject({
  createEntity: async (entityType, entityDatoms) => ClientApp.update( State, {DB: await Transactor.createEntity( State.DB, entityType, entityDatoms )  } ),
  retractEntity: async entity => ClientApp.update( State, {DB: await Transactor.retractEntity(State.DB, entity), S: {selectedEntity: undefined }} ),
  retractEntities: async entities => ClientApp.update( State, {DB: await Transactor.retractEntities(State.DB, entities), S: {selectedEntity: undefined }} ),
  duplicateEntity: async entity => {
    let entityType = State.DB.get( entity, "entity/entityType")
    let entityTypeAttributes = State.DB.get( entityType, "entityType/attributes" )
    let newEntityDatoms = entityTypeAttributes.map( attr => newDatom("newEntity", State.DB.attrName(attr), State.DB.get( entity, attr) ) ).filter( Datom => Datom.attribute !== "entity/label" ).concat( newDatom("newEntity", "entity/label", `Kopi av ${State.DB.get( entity, 6)}` ) )
    if(entityType === 42){ newEntityDatoms.push( newDatom( "newEntity", "attr/name", "attr/" + Date.now() )  ) }
    let updatedDB = await Transactor.createEntity( State.DB, entityType, newEntityDatoms)
    ClientApp.update( State, {DB: updatedDB, S: {selectedEntity: updatedDB.Entities.slice(-1)[0].entity}} )
  },
  updateEntity: async (entity, attribute, newValue, isAddition) => ClientApp.update( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, newValue, isAddition )  } ),
  postDatoms: async newDatoms => ClientApp.update( State, {DB: await Transactor.postDatoms( State.DB, newDatoms)  } ),
  //executeCompanyAction: async actionEntity => await DB.getGlobalAsyncFunction( actionEntity )( DB, Company, Process, Event ).then( updateCallback  )
})

let getClientActions = State => returnObject({
  selectPage: pageEntity => ClientApp.update( State, {S: {selectedPage: pageEntity, selectedEntity: undefined}}),
  selectEntity: entity => ClientApp.update( State, {S: {selectedEntity: entity, selectedPage: isDefined(entity) ? State.DB.get( State.DB.get(entity, 19), 7930 ) : State.S.selectedPage }}),
  selectCompanyEventIndex: companyDate => ClientApp.update( State, {S: {selectedCompanyEventIndex: companyDate }}),
  selectAccountingYear: accountingYear => ClientApp.update( State, {S: {selectedAccountingYear: accountingYear }}),
  toggleAdmin: () => ClientApp.update( State, {S: {isAdmin: State.S.isAdmin ? false : true, selectedPage: 7882, selectedEntity: undefined}}),
  selectCompany: (company) => ClientApp.update( State, {
    DB: State.DB,
    companyDatoms: constructCompanyDatoms( State.DB, company ) ,
    S: { selectedCompany: company, selectedPage: 7882, selectedEntity: undefined, selectedCompanyEventIndex: getAllTransactions(State.DB, company).length, selectedAccountingYear: getAllAccountingYears( State.DB, company ).slice(-1)[0] }
  } ),
  updateCompany: company => ClientApp.update( State, {companyDatoms: constructCompanyDatoms( State.DB, company ), S: {selectedCompany: company}} ),
  postDatomsAndUpdateCompany: async newDatoms => {

    let updatedDB = await Transactor.postDatoms( State.DB, newDatoms)
    let updatedCompanyDatoms = constructCompanyDatoms( updatedDB, State.S.selectedCompany )
    ClientApp.update( State, {DB: updatedDB, companyDatoms: updatedCompanyDatoms } )

  },
  createBalanceObject:  async balanceObjectType =>  ClientApp.update( State, {DB: await Transactor.createEntity(State.DB, 7932, [
     newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
     newDatom( 'newEntity' , 'balanceObject/balanceObjectType', balanceObjectType ),
     newDatom( 'newEntity' , "entity/label", State.DB.get( balanceObjectType, 6 ) + " uten navn" ), 
    ] )} ),
  createBlankTransaction:  async ( ) =>  ClientApp.update( State, {DB: await Transactor.createEntity(State.DB, 7948, [
    newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
    newDatom( 'newEntity' , 'transaction/accountingYear', getAllAccountingYears( State.DB, State.S.selectedCompany ).slice(-1)[0] ), 
    newDatom( 'newEntity' , "transaction/transactionType", 8019 ), 
    newDatom( 'newEntity' , "eventAttribute/1083", 0 ), 
    newDatom( 'newEntity' , "event/date", Date.now() ), 
    newDatom( 'newEntity' , "eventAttribute/1139", "" )
  ] )} ),
  createCompanyActor: async ( ) =>  ClientApp.update( State, {DB: await Transactor.createEntity(State.DB, 7979, [ newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany )] )} ),
  createCompanyReport: async reportType =>  ClientApp.update( State, {DB: await Transactor.createEntity(State.DB, 7865, [ newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ),  newDatom( 'newEntity' , 'companyDocument/documentType', reportType ),  newDatom( 'newEntity' , "event/date", Date.now() )] )} ),
})

const ClientApp = {
    States: [],
    Patches: [],
    update: (prevState, patch) => {

      let newState = {
          created: Date.now(),
          DB: Object.keys(patch).includes( "DB" ) ? patch.DB : prevState.DB,
          companyDatoms: Object.keys(patch).includes( "companyDatoms" ) ? patch.companyDatoms : prevState.companyDatoms,
          S: mergerino(prevState.S, patch.S),
        }

      newState.Company = {
        entity: newState.S.selectedCompany,
        companyDatoms: newState.companyDatoms,
        get: (entity, attribute, eventTime) => DB.isAttribute(attribute) ? DB.get(entity, attribute) : getFromCompany( newState.companyDatoms, entity, attribute, eventTime ),
        getBalanceObjects: queryObject => getBalanceObjects( State.DB, State.companyDatoms, newState.S.selectedCompany, queryObject )
      }
      
      newState.Actions = Object.assign( {}, getDBActions(newState), getClientActions(newState) )
      
      State = newState
      S = newState.S
      D = newState.DB
      DB = newState.DB
      C = newState.Company
      Company = newState.Company
      A = newState.Actions

      ClientApp.States.push(newState)
      ClientApp.Patches.push(patch)

      log({prevState, patch, newState})
      
      
      
      
      let startTime = Date.now()
      let elementTree = [newState.S.isAdmin ? adminPage( newState ) : clientPage( newState )]
      sideEffects.updateDOM( elementTree )
      if( State.S.selectedPage === 9338 ){ renderGraph( State ) } 
      console.log(`generateHTMLBody finished in ${Date.now() - startTime} ms`)
  }
}






let init = async () => {

  let firstState = {created: Date.now(), isAdmin: false}

  ClientApp.update( {}, firstState )

  let Entities = await sideEffects.APIRequest("GET", "Entities", null)

  if( Entities.length > 0 ){

    let initialDatabase = constructDatabase( Entities )
    let company = 6829
    let companyDatoms = constructCompanyDatoms( initialDatabase, company ) 
    

    ClientApp.update( firstState, {
      DB: initialDatabase,
      companyDatoms,
      S: { selectedCompany: company, selectedPage: 7882, selectedCompanyEventIndex: getAllTransactions(initialDatabase, company).length, selectedAccountingYear: getAllAccountingYears( initialDatabase, company ).slice(-1)[0] }
    } )
    
  }else{ ClientApp.update( firstState, {S: {isError: true, error: "ERROR: Mottok ingen data fra serveren. Last på nytt om 30 sek." }} ) }
  
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

    ClientApp.update( updatedDB )

    Database.syncDatoms( newDatoms )

  }
} */



//Archive