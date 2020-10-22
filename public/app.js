
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
        sideEffects.isIdle = true;
        return parsedResponse;
        
      }else{
        console.log("Declined HTTP request, another in progress:", type, endPoint, stringBody )
      }

        
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
            
            let serverResponse = await sideEffects.APIRequest("GET", "userContent", null)
            if( serverResponse === null){console.log("Received null")}
            else{

              let initialUIstate = {
                "currentPage": "timeline",
                "selectedOrgnumber": "818924232",
                "companyDocPage/selectedVersion": 1,
                "selectedEntityType" : 7684,
                "selectedCategory": "Hendelsesattributter",
                "selectedEntity": 3174,
                "selectedAdminEntity": 3174,
                "currentSearchString": "Søk etter entitet",
              }

              update({
                UIstate: initialUIstate,
                sharedData: updateData( serverResponse )
              })
            }
            
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
    
    },
    submitDatomsWithValidation: async (S, Datoms) => {
      if(sideEffects.isIdle){
        if(Datoms.filter( d => d.attribute !== "attr/name" ).every( datom => validateAttributeValue(S, getAttributeEntityFromName(S, datom.attribute), datom.value) )){
          
          let serverResponse = await sideEffects.APIRequest("POST", "transactor", JSON.stringify( Datoms )) 
          
          return returnObject({
            UIstate: S["UIstate"],
            sharedData: updateData(serverResponse)
          }) }
        else{console.log("ERROR: Datoms not valid: ", Datoms)}
        }
      else{console.log("ERROR: HTTP request already in progress, did not submit datoms.", Datoms)}
    }
}

//Company construction: To be moved to server

let getAttributeEntityFromName = (S, attributeName) => S.findEntities( e => e["entity/entityType"] === 7684 ).filter( a => a["attr/name"] === attributeName )[0]["entity"]

let validateAttributeValue = (S, attributeEntity, value) =>  new Function(`inputValue`, S.getEntity( attributeEntity )["attribute/validatorFunctionString"] )( value )

let eventAttributesAreValid = (S, eventAttributes) => S.getEntity(  eventAttributes["event/eventTypeEntity"] ) === null 
  ? false 
  : S.getEntity(  eventAttributes["event/eventTypeEntity"] )["eventType/eventAttributes"]
    .every( attributeEntity =>  
      validateAttributeValue(S, attributeEntity, eventAttributes[ S.getEntity( attributeEntity )["attr/name"] ] )
    )

let combinedEventIsValid = (S, eventAttributes, companyVariables) => S.getEntity( eventAttributes["event/eventTypeEntity"] )["eventType/eventValidators"]
  .every( entity =>  
    new Function([`eventAttributes`, `companyFields`], S.getEntity(entity)["eventValidator/validatorFunctionString"])( eventAttributes, companyVariables )
  )

let newShareTransaction = (identifier, shareCount) => returnObject({identifier, shareCount})
    
let createRecord = recordObject => returnObject({account: Object.keys(recordObject)[0], amount: Object.values(recordObject)[0]})

let createAccountingTransaction = (companyFields, eventAttributes, records) => returnObject({
  type: "accountingTransaction",
  id: companyFields[9212] + 1, 
  date: eventAttributes['event/date'],
  description: eventAttributes['event/description'],
  records: records.map( createRecord )
})  

let createInvestmentTransaction = (companyFields, eventAttributes) => {
  let investmentObject = companyFields[8538].filter( investmentObject => investmentObject.identifier === eventAttributes['event/investment/orgnumber']  )[0]
  accountNumber = investmentObject.isLongTermHolding === "Anleggsmiddel" ? "1820" : "1350";
  let transaction = createAccountingTransaction(companyFields, eventAttributes, [
    {'1920': eventAttributes['event/amount']},
    {[accountNumber]: -eventAttributes['event/amount']},
  ])
  transaction.type = "investmentTransaction"
  transaction.identifier = eventAttributes['event/investment/orgnumber']
  transaction.shareCount = eventAttributes['event/attribute85']
  
  
  return transaction
}

let createShareholderTransaction = (companyFields, eventAttributes) => {
  let transaction = createAccountingTransaction(companyFields, eventAttributes, [
    {'1579': eventAttributes['event/amount']},
    {"2000": -eventAttributes['event/amount']},
  ])
  transaction.type = "shareholderTransaction"
  transaction.shareholder = eventAttributes['event/selectShareholder']
  transaction.shareCount = eventAttributes['event/attribute85']
  transaction.capitalPerShare = companyFields[6821] + eventAttributes['event/sharePremium']
  
  return transaction
}

let createCreditorTransaction = (companyFields, eventAttributes) => {
  let transaction = createAccountingTransaction(companyFields, eventAttributes, [
    {'1920': eventAttributes['event/amount']}, 
    {'2910': -eventAttributes['event/amount']}
  ])
  transaction.type = "creditorTransaction"
  transaction.identifier = eventAttributes['event/creditorID']
  
  return transaction
}

let createEventOutput = (companyFields, eventAttributes, newEntities, attributeNames) => returnObject({
  Entities: (typeof newEntities == "undefined") ? [] : newEntities,
  attributeUpdates: (typeof attributeNames == "undefined") ? [] : createAttributeUpdates(companyFields, eventAttributes, attributeNames),
});

let createAttributeUpdates = (companyFields, eventAttributes, attributeNames) => mergeArray( attributeNames.map( attributeName => returnObject({attributeName, value: eventAttributes[attributeName], 'event/index': eventAttributes['event/index'], 'event/date': eventAttributes['event/date'] }) ) ) 

let aadsfdsaf = (companyFields) => {

  let allDatoms = companyFields[9384]

  let EntititesObject = allDatoms.reduce( (Entitites, datom) => mergerino(Entitites, createObject(datom.entity, createObject(datom.attribute, datom.value)))    , {} )

  return Object.entries(EntititesObject).map( entry => createObject(entry[0], entry[1])  )

}

let getCompanyAttribute = (companyFields, attributeName) => companyFields[9447][attributeName]

let getAccountBalance = (companyField, accountNumber) => (typeof companyField[ accountNumber ] === "number") ? companyField[ accountNumber ] : 0

let sumAccounts = (companyFields, accountNumbers) => accountNumbers.reduce( (sum, accountNumber) => sum + getAccountBalance(companyFields[7911], accountNumber), 0 )

let sumOpeningBalanceAccounts = (companyFields, accountNumbers) => accountNumbers.reduce( (sum, accountNumber) => sum + getAccountBalance(companyFields[8240], accountNumber), 0 )

let constructCompanyDoc = (S, storedEvents) => {

  let initialCompanyDoc = [{
      index: 0,
      Datoms: [],
      Entities: {},
      companyFields: {
        9438: 1, //EntitetsID for selskapet
        9423: 1, //Høyeste entitetsID 
      },
      isValid: true
    }]

  let companyDoc = storedEvents.reduce( (companyDocVersions, eventAttributes, prevVersionIndex) => {
    let prevCompanyDoc = companyDocVersions[prevVersionIndex]
    if(!prevCompanyDoc.isValid){return prevCompanyDoc}
      let eventType = S.getEntity(  eventAttributes["event/eventTypeEntity"] )
      let attributesAreValid = eventAttributesAreValid(S, eventAttributes)
      if(!attributesAreValid){return mergerino(prevCompanyDoc, {isValid: false}) }
        let eventIsValid = combinedEventIsValid(S, eventAttributes, prevCompanyDoc.companyFields)
        if(!eventIsValid){return mergerino(prevCompanyDoc, {isValid: false}) }
          let eventDatoms = eventType["eventType/newDatoms"].map( datom => newDatom(
            new Function( [`companyFields`, `eventAttributes`, `Entities`], datom["entity"] )( prevCompanyDoc.companyFields, eventAttributes, prevCompanyDoc.Entities ),
            datom.attribute,
            new Function( [`companyFields`, `eventAttributes`, `Entities`], datom["value"] )( prevCompanyDoc.companyFields, eventAttributes, prevCompanyDoc.Entities )
            )
          )
          let updatedCompanyEntities = eventDatoms.reduce( (Entities, datom) => mergerino(
            Entities,
            createObject(datom.entity, createObject(datom.attribute, datom.value ))
          ), prevCompanyDoc.Entities )

          let companyFieldsToUpdate = [9423, 9948, 9953]

          let companyFields = mergeArray( companyFieldsToUpdate.map( entity => createObject(entity, new Function([`companyEntities`], S.getEntity(entity)["companyField/constructorFunctionString"])( updatedCompanyEntities ) ) ) ) 
          
          let index = prevVersionIndex + 1

          let companyDocVersion = {
            index, 
            eventAttributes, 
            eventDatoms,
            Datoms: prevCompanyDoc.Datoms.concat(eventDatoms),
            Entities: updatedCompanyEntities,
            companyFields: companyFields,
            isValid: true
          }
          return companyDocVersions.concat(companyDocVersion)

  } , initialCompanyDoc )

  return companyDoc

}


let getDependencies = (S, entity) => S.getEntity(entity)["companyField/companyFields"].concat( S.getEntity(entity)["companyField/companyFields"].map( e => getDependencies(S, e) ).flat()  )

//Company construction END

let constructInvestmentHoldings = (companyFields) => {

  let investmentObjects = companyFields[8538]
  let investmentTransactions = companyFields[8346]
  let rows = investmentObjects.map( investmentObject => {

    let selectedTransactions = investmentTransactions
      .filter( entry => typeof entry === "object" )
      .filter( entry => entry.identifier === investmentObject.identifier )

      let name = investmentObject.name
      let type = "Aksjer"
      let ISIN = investmentObject.identifier
      let country = investmentObject.country
      let IB = 0;
      let UB = selectedTransactions.filter( t => t.shareCount ).reduce( (sum, transaction) => sum + transaction.shareCount, 0 );
      let gains = selectedTransactions.filter( t => t.unrealizedGain ).reduce( (sum, transaction) => sum + transaction.unrealizedGain, 0 );
      let taxExemptGains = (investmentObject.isTaxExempt === "Innenfor fritaksmetoden") ? gains : 0
      let taxableGains = (investmentObject.isTaxExempt === "Utenfor fritaksmetoden") ? gains : 0

      let dividends = selectedTransactions.filter( t => t.dividend ).reduce( (sum, transaction) => sum + transaction.dividend, 0 );
      let taxExemptDividends = investmentObject.isTaxExempt ? dividends : 0
      let taxableDividends = investmentObject.isTaxExempt ? 0 : dividends


      return {
        "Navn på verdipapir/Finansielt produkt": name, 
        "Type verdipapir/Finansielt produkt": type, 
        "ISIN-nummer / Orgnummer": ISIN, 
        "Land selskapet erhjemmehørende i": country, 
        "IB (antall)": IB,
        "UB (antall)": UB, 
        "Gevinst/tap innenfor fritaksmetoden": taxExemptGains, 
        "Gevinst/tap utenfor fritaksmetoden": taxableGains, 
        "Utbytte/utdeling innenfor fritaksmetoden": taxExemptDividends, 
        "Utbytte/utdeling utenfor fritaksmetoden": taxableDividends
      }



  } )
  return rows



}

/* return mergeArray(
  Object.keys(companyFields[7911])
  .filter( accountNumber => Number(accountNumber) < 3000 )
  .map( accountNumber => createObject(accountNumber, companyFields[7911][accountNumber] ) )
) */

let generateShareholderRegistry = () => {

  //NB: Kopiert inn i selskapsvariabel, denne brukes ikke

  let shareholders = [{"shareholderID":"271089XXXYY","name":"Lene Gridseth","address":"Tollbugata 13, 0152 Oslo"}]
  let shareTransactions = [{"shareCount":300,"shareholder":"271089"}]
  let rows = shareholders.map( shareholder => {

    let shareCount = shareTransactions
    .filter( transaction => transaction.shareholder === shareholder.shareholderID )
    .reduce( (sum, transaction) => sum + transaction.shareCount, 0 )

    let totalPaidInCapital = shareTransactions
    .filter( transaction => transaction.shareholder === shareholder.shareholderID )
    .reduce( (sum, transaction) => sum + transaction.shareCount * transaction.capitalPerShare, 0 )

    return returnObject({
      "Navn": shareholder.name, 
      "Adresse": shareholder.address, 
      "F.dato/Org.nr.": shareholder.shareholderID, 
      "Innbetalt kapital per aksje [snitt]": totalPaidInCapital / shareCount, 
      "Antall aksjer": shareCount,
      "Aksjenr": `1 - ${shareCount}`
    }) 
  })
  return rows
}

let newDatom = (entity, attribute, value, isAddition) => returnObject({entity, attribute, value, isAddition: isAddition === false ? false : true })

let updateData = serverResponse => returnObject({
  "E": serverResponse["E"],
  "latestTxs": serverResponse["latestTxs"].sort( (a, b) => b.tx - a.tx ),
})

let getRetractionDatomsWithoutChildren = Entities => Entities.map( Entity =>  Object.entries( Entity ).map( e => newDatom(Entity["entity"], e[0], e[1], false) ).filter( d => d["attribute"] !== "entity" ) ).flat() //Need to also get children


let getEntityForEntityType = {
  "attribute": 7684,
  "eventType": 7686,
  "eventField": 7780,
  "companyField": 7784,
  "eventValidator": 7728,
  "valueType": 7689,
  "entityType": 7794,
  "event": 7790,
  "tx": 7806
}

let defaultEntityDatoms = (type, label, doc, category) => [
  newDatom("newEntity", "entity/entityType", getEntityForEntityType[type]),
  newDatom("newEntity", "entity/label", label ? label : "[Mangler visningsnavn]"),
  newDatom("newEntity", "entity/doc", doc ? doc : "Mangler kategori" ),
  newDatom("newEntity", "entity/category", category ? category : "Mangler kategori" )
] //Should be added to DB

const datomsByEventType = {
  "eventType": [
    newDatom("newEntity", "eventType/eventAttributes", [] ),
    newDatom("newEntity", "eventType/requiredCompanyFields", [] ),
    newDatom("newEntity", "eventType/eventValidators", [] ),
    newDatom("newEntity", "eventType/eventFieldConstructors", {} ),
  ],
  "eventField": [
    newDatom("newEntity", "eventField/companyFields", [] ),
  ],
  "companyField": [
    newDatom("newEntity", "companyField/constructorFunctionString", `return 0;`),
    newDatom("newEntity", "companyField/companyFields", []),
  ],
  "eventValidator": [
    newDatom("newEntity", "eventValidator/validatorFunctionString", "return true;" ),
    newDatom("newEntity", "eventValidator/errorMessage", "[errorMessage]" ),
  ],
  "valueType": [
    newDatom("newEntity", "valueType/jsType", "string" ),
  ],
  "entityType": [
    newDatom("newEntity", "entityType/attributes", [3171, 4615, 4617, 5712, 4871] ),
  ],
} //Should be added to DB

let getUserActions = (S) => returnObject({
    updateLocalState: (patch) => update( {
      UIstate: mergerino( S["UIstate"], patch ), 
      sharedData: S["sharedData"] 
    }),
    updateEntityAttribute: async (entity, attribute, value) => update( await sideEffects.submitDatomsWithValidation(S, [newDatom(Number(entity), attribute, value)] )),
    retractEntity: async entity => update( await sideEffects.submitDatomsWithValidation(S,  getRetractionDatomsWithoutChildren( [S.getEntity(entity) ]))),
    createAttribute: async () => update( await sideEffects.submitDatomsWithValidation(S, 
      defaultEntityDatoms("attribute", "[Attributt uten navn]", "[Attributt uten dokumentasjon]", S["UIstate"].selectedCategory ).concat([
        newDatom("newEntity", "attr/name", "event/attribute" + S.findEntities( e => e["entity/entityType"] === 7684 ).length ),
        newDatom("newEntity", "attribute/validatorFunctionString", `return (typeof inputValue !== "undefined");`),
      ]) )),
    createEntity: async type => update( await sideEffects.submitDatomsWithValidation(S, 
      defaultEntityDatoms(type, `[${type}] uten navn`, `[${type}] Beskrivelse mangler.`, S["UIstate"].selectedCategory).concat( datomsByEventType[type] ) 
    )),
    createEvent: async ( eventAttributes, newEventTypeEntity ) => update( await sideEffects.submitDatomsWithValidation(S, 
      defaultEntityDatoms("event", `Selskapshendelse for ${eventAttributes["event/incorporation/orgnumber"]}`, `Selskapshendelse for ${eventAttributes["event/incorporation/orgnumber"]}`, null).concat( [
        newDatom("newEntity", "event/eventTypeEntity", newEventTypeEntity),
        newDatom("newEntity", "event/incorporation/orgnumber", eventAttributes["event/incorporation/orgnumber"] ),
        newDatom("newEntity", "event/index", eventAttributes["event/index"] + 1 ),
        newDatom("newEntity", "event/date", eventAttributes["event/date"] ),
        newDatom("newEntity", "event/currency", "NOK")
      ]))),
      undoTx: async (tx) => {

        console.log(tx)

        let txEntity = tx.datoms.filter( datom => datom.attribute === "tx/tx" )[0].entity

        let datoms = tx.datoms
          .filter( datom => datom.entity !== txEntity )
          .map( datom => newDatom(datom.entity, datom.attribute, datom.value, !datom.isAddition) )

        console.log("datoms", datoms)

        update( await sideEffects.submitDatomsWithValidation(S, datoms ))

      }
})

let update = (S) => {

    //To be fixed...
    S.getEntity = entity => S["sharedData"]["E"][entity] ? S["sharedData"]["E"][entity] : logThis(null, `Entitet [${entity}] finnes ikke` )
    S.findEntities = filterFunction => Object.values(S["sharedData"]["E"]).filter( filterFunction )
    S.getUserEvents = () => S.findEntities( e => e["entity/entityType"] === 7790 ) //S["sharedData"]["userEvents"]
    S.getLatestTxs = () => S["sharedData"]["latestTxs"]
    
    S.getAll = entityType => S.findEntities( e => e["entity/entityType"] === getEntityForEntityType[entityType]  )
    S.getAllOrgnumbers = () => S.getUserEvents().map( E => E["event/incorporation/orgnumber"] ).filter( filterUniqueValues )
    S.getEntityLabel = entity => S.getEntity(entity)["entity/label"] ? S.getEntity(entity)["entity/label"] : `[${entity}] Visningsnavn mangler`
    S.getEntityDoc = entity => S.getEntity(entity)["entity/doc"] ? S.getEntity(entity)["entity/doc"] : `[${entity}] Dokumentasjon mangler`
    S.getEntityCategory = entity => S.getEntity(entity)["entity/category"] ? S.getEntity(entity)["entity/category"] : `[${entity}] Kategori mangler`
    S.getEntityNote = entity => S.getEntity(entity)["entity/note"] ? S.getEntity(entity)["entity/note"] : `[${entity}] Ingen notat`

    S["UIstate"].selectedEntity = (S.getEntity(S["UIstate"].selectedEntity) === null) ? 3174 : S["UIstate"].selectedEntity
    S["UIstate"].selectedAdminEntity = (S.getEntity(S["UIstate"].selectedAdminEntity) === null) ? 3174 : S["UIstate"].selectedEntity
    
    try {
      S["selectedCompany"] = constructCompanyDoc(S, S.getUserEvents()
      .filter( eventAttributes => eventAttributes["event/incorporation/orgnumber"] === S["UIstate"].selectedOrgnumber )
      .sort( (a, b) => a["event/index"] - b["event/index"]  ) )

      console.log(S["selectedCompany"])
      
    } catch (error) {
      console.log(error)
    }    

    Admin.S = S;

    console.log("State: ", S)
    let A = getUserActions(S)

    S.elementTree = generateHTMLBody(S, A )
    sideEffects.updateDOM( S.elementTree )
}

sideEffects.configureClient();

let Admin = {
    S: null,
    updateClientRelease: (newVersion) => Admin.submitDatoms([newDatom(2829, "transaction/records", {"serverVersion":"0.3.2","clientVersion":newVersion})], null),
    resetServer: () => sideEffects.APIRequest("GET", "resetServer", null),
    submitDatoms: async (datoms) => datoms.length < 5000
    ? await sideEffects.APIRequest("POST", "transactor", JSON.stringify( logThis(datoms, "Datoms submitted to Transactor.") )) 
    : console.log("ERROR: Too many datoms: ", datoms),
    getEntity: e => Admin.S.getEntity(e),
    findEntities: filterFunction => Admin.S.findEntities(filterFunction),
    updateEntityAttribute: async (entityID, attribute, value) => await Admin.submitDatoms([newDatom(entityID, attribute, value)]),
    retractEntities: async entities => await Admin.submitDatoms( getRetractionDatomsWithoutChildren(entities.map( e => Admin.S.getEntity(e) )) ),
    retractEntity: async entity => await Admin.retractEntities([entity]),
    createAttribute: async (attrName, valueType, label, category, doc) => await Admin.submitDatoms([ 
      newDatom("newAttribute", "attr/name", attrName),
      newDatom("newAttribute", "attr/valueType", valueType),
      newDatom("newAttribute", "entity/label", label),
      newDatom("newAttribute", "entity/category", category),
      newDatom("newAttribute", "attribute/validatorFunctionString", `return (typeof inputValue !== "undefined");`),
      newDatom("newAttribute", "entity/doc", doc)
    ]),
    getServerCache: async () => await sideEffects.APIRequest("GET", "serverCache", null)
}



let a = () => {

  let shareTransactions = [0,{"type":"Aksjer","shareCount":573200,"orgNumber":"916823525"},{"type":"Aksjer","shareCount":1000,"ISIN":"Nigeria123","country":"Nigeria"},{"type":"Aksjer","shareCount":100,"ISIN":"Nigeria123","country":"Nigeria"}]

  let table = shareTransactions.reduce( (accumulator, transaction) => mergerino(accumulator, createObject( )  ) )


  return Object.keys(companyFields)
    .filter( account => Number(account) >= 3000  )
    .reduce( (sum, account) => sum + companyFields[7911][account], 0);


}