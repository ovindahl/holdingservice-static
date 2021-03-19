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
              sideEffects.updateDOM( [ publicPage(  ) ] )

              
            }
      }
      return true
  
  }
}

var State = {} //Consle access to State
var S = {} //Consle access to localState
var D = {} //Consle access to DB
var Database = {} //Consle access to DB
var Entity = {}
var E = {}
var Company = {}
var C = {}
var A = {} //Consle access to Actions

let addShortcuts = newState => {

  
      
  State = newState
  S = newState.S
  D = newState.DB
  Database = newState.DB
  if( isDefined(newState.DB) && isDefined(State.S.selectedCompany) ){ 
    Company = newState.DB.get( State.S.selectedCompany ) 
    C = Company
  }
  if( isDefined(newState.DB) && isDefined(State.S.selectedEntity) ){ 
    Entity = newState.DB.get( State.S.selectedEntity ) 
    Entity.retract = () => newState.Actions.retractEntity( State.S.selectedEntity  )
    Entity.update = (attribute, value, isAddition) => newState.Actions.updateEntity( State.S.selectedEntity, attribute, value, isAddition )
    E = Entity
  }
  
  A = newState.Actions




}

//COMPONENTS

let getActions = State => returnObject({
    selectPage: pageEntity => updateState( State, {S: mergerino({selectedPage: pageEntity, selectedEntity: undefined, selectedFilters: [] }) }),
    selectEntity: (entity, pageEntity) => updateState( State, {S: mergerino({selectedEntity: entity}, isDefined(pageEntity) ? {selectedPage: pageEntity, selectedFilters: []} : {}) }),
    selectEventIndex: eventIndex => updateState( State, {S:  {selectedEventIndex: eventIndex, selectedAccountingYear: Database.get( Database.get(State.S.selectedCompany, 12783)(eventIndex), 10542)} }),
    selectAccountingYear: accountingYear => updateState( State, {S: {selectedAccountingYear: accountingYear, selectedEntity: undefined } }),
    addFilter: newFilter => updateState( State, {S: {selectedFilters: State.S.selectedFilters.concat( newFilter ) } }),
    removeFilter: removedFilter => updateState( State, {S: {selectedFilters: State.S.selectedFilters.filter( f => f !== removedFilter ) } }),
    removeFilters: () => updateState( State, {S: {selectedFilters: [] } } ),
    retractEntity: async entity => updateState( State, { DB: await Transactor.retractEntities(State.DB, [entity]), S: {selectedEntity: undefined } } ),
    selectCompany: company => updateState( State, { S: {selectedCompany: company, selectedEntity: undefined, selectedFilters: [] } } ),
    postDatoms: async newDatoms => {

      let updatedDB = await Transactor.postTransaction( State.DB, newDatoms)

      if( updatedDB !== null ){ updateState( State, {DB: updatedDB } ) }else{ log({ERROR: updatedDB}) }

    },
    createEvent: ( eventType, sourceEntity ) => {

      let basicDatoms = [
        newDatom( 'newEntity', 'entity/entityType', 10062 ),
        newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
        newDatom( 'newEntity', attrName( State.DB, 10070 ), eventType ),
        newDatom( 'newEntity' , 'event/accountingYear', State.S.selectedAccountingYear ), 
        newDatom( 'newEntity' , 'entity/label', State.DB.get( eventType, 6 ) ), 
        newDatom( 'newEntity' , attrName( State.DB, 1139 ), "" )
      ]

      let sourceEntityDatoms = isDefined(sourceEntity) ? [
        newDatom( 'newEntity', attrName( State.DB, 1757 ), isDefined( State.DB.get( sourceEntity, 1757 )  ) 
          ? State.DB.get( sourceEntity, 1757 ) 
          :  State.DB.get( State.S.selectedAccountingYear, "accountingYear/lastDate" ) 
          ),
        State.DB.get( eventType, 7942 ).includes( 1083 )
          ? newDatom( 'newEntity' , attrName( State.DB, 1083 ), isDefined( State.DB.get( sourceEntity, 1083 ) ) ? State.DB.get( sourceEntity, 1083 ) : 0  )
          : null,
      ].filter( Datom => Datom !== null ) : []

      let newEventDatoms = basicDatoms.concat( sourceEntityDatoms )


      State.Actions.createAndSelectEntity( newEventDatoms )

    },
    createEventFromEvent: ( eventType, sourceEntity ) => {

      let basicDatoms = [
        newDatom( 'newEntity', 'entity/entityType', 10062 ),
        newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
        newDatom( 'newEntity', attrName( State.DB, 10070 ), eventType ),
        newDatom( 'newEntity' , 'event/accountingYear', State.S.selectedAccountingYear ), 
        newDatom( 'newEntity' , 'entity/label', State.DB.get( eventType, 6 ) ), 
        newDatom( 'newEntity' , attrName( State.DB, 1139 ), "" )
      ]

      let sourceEntityDatoms = isDefined(sourceEntity) ? [
        newDatom( 'newEntity', attrName( State.DB, 1757 ), isDefined( State.DB.get( sourceEntity, 1757 )  ) 
          ? State.DB.get( sourceEntity, 1757 ) 
          :  State.DB.get( State.S.selectedAccountingYear, "accountingYear/lastDate" ) 
          ),
        State.DB.get( eventType, 7942 ).includes( 1083 )
          ? newDatom( 'newEntity' , 1083, isDefined( State.DB.get( sourceEntity, 1083 ) ) ? State.DB.get( sourceEntity, 1083 ) : 0  )
          : null,
      ].filter( Datom => Datom !== null ) : []

      let newEventDatoms = basicDatoms.concat( sourceEntityDatoms )


      State.Actions.createAndSelectEntity( newEventDatoms )

    },
    createEventFromSourceDocument: ( eventType, sourceDocument ) => {

      let basicDatoms = [
        newDatom( 'newEntity', 'entity/entityType', 10062 ),
        newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
        newDatom( 'newEntity', attrName( State.DB, 10070 ), eventType ),
        newDatom( 'newEntity' , 'event/accountingYear', State.DB.get( sourceDocument, 7512 ) ), 
        newDatom( 'newEntity' , attrName( State.DB, 1757 ), State.DB.get( State.DB.get( sourceDocument, 7512 ), "accountingYear/lastDate" )  ), 
        newDatom( 'newEntity' , 'entity/label', State.DB.get( eventType, 6 ) ), 
        newDatom( 'newEntity' , attrName( State.DB, 1139 ), "" ),
        newDatom( 'newEntity' , attrName( State.DB, 11477 ), sourceDocument ),
      ]

      State.Actions.createAndSelectEntity( basicDatoms )

    },
    createSourceDocument: sourceDocumentType => State.Actions.createAndSelectEntity( [
      newDatom( 'newEntity', 'entity/entityType', 11472 ),
      newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
      newDatom( 'newEntity', attrName( State.DB, 11688 ) , sourceDocumentType ),
      newDatom( 'newEntity' , attrName( State.DB, 6 ), 'Bilagsdokument uten navn' ), 
      newDatom( 'newEntity' , attrName( State.DB, 1139 ), '' ), 
      newDatom( 'newEntity' , attrName( State.DB, 7512 ), State.S.selectedAccountingYear), 
    ] ),
    createActor: actorType => State.Actions.createAndSelectEntity( [
      newDatom( 'newEntity', 'entity/entityType', 7979 ),
      newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ),  
      newDatom( 'newEntity' , "actor/actorType", actorType ),  
      newDatom( 'newEntity' , "entity/label", 'Aktør uten navn' )
    ] ),
    createAndSelectEntity: async newDatoms => {

      if( newDatoms.every( Datom => Datom.entity === newDatoms[0].entity ) ){
        let updatedDB = await Transactor.postTransaction( State.DB, newDatoms)
        let newEntity = updatedDB.Entities.slice( -1 )[0].entity
        updateState( State, {DB: updatedDB, S: { selectedEntity: newEntity, selectedPage: updatedDB.get( updatedDB.get(newEntity, 19), 7930) } } )
      }else{ log({ERROR: "createAndSelectEntity: Received datoms refer to > 1 entity"}) }

      
    },
    submitUserMessage: async message => updateState( State, {DB: await Transactor.createEntity( State.DB, 13471, [ 
      newDatom( "newEntity", attrName( State.DB, 8849 ), State.S.selectedCompany ), 
      newDatom( "newEntity", attrName( State.DB, 13472 ), State.S.selectedUser ),
      newDatom( "newEntity", attrName( State.DB, 1757 ), Date.now() ), 
      newDatom( "newEntity", attrName( State.DB, 13474 ), message ),
    ] ) } ),
    createEntity: async (entityType, entityDatoms) => updateState( State, {DB: await Transactor.createEntity( State.DB, entityType, entityDatoms )  } ),
    retractEntities: async entities => updateState( State, {DB: await Transactor.retractEntities(State.DB, entities)} ),
    duplicateEntity: async entity => {
      let entityType = State.DB.get( entity, "entity/entityType")
      let newEntityDatoms = State.DB.get( entityType, "entityType/attributes" ).filter( attr => State.DB.get( entity, attr ) ).map( attr => newDatom("newEntity", attrName( State.DB, attr ), State.DB.get( entity, attr) ) ).filter( Datom => Datom.attribute !== "entity/label" ).concat( newDatom("newEntity", "entity/label", `Kopi av ${State.DB.get( entity, 6)}` ) )
      if(entityType === 42){ newEntityDatoms.push( newDatom( "newEntity", "attr/name", "attr/" + Date.now() )  ) }
      let updatedDB = await Transactor.createEntity( State.DB, entityType, newEntityDatoms)
      updateState( State, {DB: updatedDB, S: {selectedEntity: updatedDB.Entities.slice(-1)[0].entity}} )
    },
    updateEntity: async (entity, attribute, newValue, isAddition) => updateState( State, {DB: await Transactor.updateEntity( State.DB, entity, attribute, newValue, isAddition )  } ),
    "adminpage/retractEntity": async entity => updateState( State, { DB: await Transactor.retractEntities(State.DB, [entity]), S: {selectedEntity: State.DB.get(entity, 19) } } )
})


let importDNBtransactions = (State, sourceDocument) => {

  let allRows = State.DB.get( sourceDocument, 1759 ).filter( row => row.length > 1 )

  let headersRowIndex = allRows.findIndex( row => row.includes("Forklarende tekst") && row.includes("Transaksjonstype") && row.includes("Transaksjonstype") )
  let headerRow = allRows[ headersRowIndex ]

  let accountNumberColumnIndex = headerRow.findIndex( header => header === "Kontonummer" )
  let dateColumnIndex = headerRow.findIndex( header => header === "Bokf�rt dato" )
  let description1ColumnIndex = headerRow.findIndex( header => header === "Transaksjonstype" )
  let description2ColumnIndex = headerRow.findIndex( header => header === "Forklarende tekst" )
  let paidAmountColumnIndex = headerRow.findIndex( header => header === "Ut" )
  let receivedAmountColumnIndex = headerRow.findIndex( header => header === "Inn" )
  let referenceNumberColumnIndex = headerRow.findIndex( header => header === "Arkivref." )

  let transactionRows = allRows.slice( headersRowIndex + 1 )

  let newEventDatoms = transactionRows.map( (row, index) => {

    let txDate = Number( moment( row[ dateColumnIndex ], "DD.MM.YYYY" ).format("x") )

    let parseDNBamount = stringAmount => Number( stringAmount.replaceAll(".", "").replaceAll(",", ".") ) 

    let paidAmount = row[ paidAmountColumnIndex ] === ""
      ? undefined
      : parseDNBamount( row[ paidAmountColumnIndex ] ) * -1

    let receivedAmount = row[ receivedAmountColumnIndex ] === ""
      ? undefined
      : parseDNBamount( row[ receivedAmountColumnIndex ] ) 

    let isPayment = isNumber( paidAmount )

    let amount = isPayment ? paidAmount : receivedAmount


      
    let eventType = isPayment ? 13186 : 13187


    return [
      newDatom( "newDatom_"+ index, "entity/company", State.S.selectedCompany  ),
      newDatom( "newDatom_"+ index, 'event/accountingYear', State.DB.get( sourceDocument, 7512 ) ),
      newDatom( "newDatom_"+ index, "entity/selectSourceDocument", sourceDocument ),
      newDatom( "newDatom_"+ index, "entity/entityType", 10062  ),
      newDatom( "newDatom_"+ index, attrName( State.DB, 1139 ) , "" ),

      newDatom( "newDatom_"+ index, attrName( State.DB, 8831 ), `[${accountNumberColumnIndex === -1 ? "Konto" : row[ accountNumberColumnIndex ] }]  ${ row[ description1ColumnIndex ]}: ${ row[ description2ColumnIndex ]}`  ),
      newDatom( "newDatom_"+ index, attrName( State.DB, 1757 ), txDate ),
      newDatom( "newDatom_"+ index, attrName( State.DB, 10070 ), eventType ),
      newDatom( "newDatom_"+ index, attrName( State.DB, 1083 ),  amount ),
      newDatom( "newDatom_"+ index, "bankTransaction/referenceNumber", row[ referenceNumberColumnIndex ]  ),
      newDatom( "newDatom_"+ index, "entity/label", `[${moment(txDate).format('DD/MM/YYYY')}] ${State.DB.get( eventType, 6 )} på NOK ${ formatNumber( amount, amount > 100 ? 0 : 2 ) }`.replaceAll(`"`, `'`) ),
    ]
  }  ).flat()

    return newEventDatoms
}

var States = []
var Patches = []

let updateState = (prevState, patch) => {



  let newState = {
      created: Date.now(),
      DB: Object.keys(patch).includes( "DB" ) ? patch.DB : prevState.DB,
      S: mergerino(prevState.S, patch.S),
    }

    newState.Actions = getActions( newState )

    addShortcuts( newState )

  States.push( newState )
  Patches.push( patch )
  
  sideEffects.updateDOM( [clientPage( State )] )

}



var serverDB = {}

let init = async () => {

  updateState( {}, {} )


  let dbSnapshot = await sideEffects.APIRequest("GET", "serverDB", null)

  if( dbSnapshot.Entities.length > 0 ){

    let initialDatabase = constructDatabase( dbSnapshot )

    D = initialDatabase

    let userProfile = await sideEffects.auth0.getUser()
    let userEntity = initialDatabase.getAll( 5612 ).find( e => initialDatabase.get(e, 11501) === userProfile.name )
    let initialCompany = initialDatabase.get(userEntity, "user/companies")[0]

    updateState( {}, {
      DB: initialDatabase,
      S: {
        userProfile,
        selectedUser: userEntity,
        selectedPage: 9951,
        selectedCompany: initialCompany,
        selectedAccountingYear: 7407,
        selectedFilters: []
      }
      } )
    
  }else{ updateState( {}, {S: {isError: true, error: "ERROR: Mottok ingen data fra serveren. Last på nytt om 30 sek." }} ) }
  
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