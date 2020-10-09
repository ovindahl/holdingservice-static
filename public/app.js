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
                "selectedOrgnumber": "999999999",
                "companyDocPage/selectedVersion": 1,
                "attributesPage/selectedAttribute": 3172,
                "attributesPage/selectedAttributeCategory": "",
                "eventTypesPage/selectedEventType": 4113,
                "eventFieldsPage/selectedEventField": 4372,
                "companyFieldsPage/selectedCompanyField": 4380
              }

              let S = updateS({}, serverResponse, initialUIstate)

              update(S)
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
    submitDatomsWithValidation: async (S, Datoms) => sideEffects.isIdle 
      ? Datoms.every( datom => validateAttributeValue(S, getAttributeEntityFromName(S, datom.attribute), datom.value) ) 
        ? update( updateS(S, await sideEffects.APIRequest("POST", "transactor", JSON.stringify( Datoms )), null ) )
        : update( logThis( updateS(S, null, null ), "ERROR: Datoms not valid" ) ) 
      : update( logThis(updateS(S, null, null ), "ERROR: HTTP request already in progress" ) ),
    submitNewAttributeDatoms: async (S, Datoms) => sideEffects.isIdle 
    ? Datoms.filter( datom => datom.attribute === "attr/name" && datom.value.startsWith("event/") ).length > 0
      ? update( updateS(S, await sideEffects.APIRequest("POST", "transactor", JSON.stringify( Datoms )), null ) )
      : update( logThis( updateS(S, null, null ), "ERROR: Datoms not valid" ) ) 
    : update( logThis( updateS(S, null, null ), "ERROR: HTTP request already in progress" ) ),
}


let updateS = (S, serverResponse, UIstatePatch) => mergerino( S, 
  serverResponse === null ? {} : {"sharedData": {
    "E": serverResponse["E"],
    attributes: serverResponse["attributes"],
    allCompanyFields: serverResponse["companyFields"].map( e => e.entity ),
    "allEventTypes": serverResponse["eventTypes"].map( e => e.entity ),
    "allEventAttributes": serverResponse["attributes"].filter( attr => attr["attr/name"] ).filter( attr => attr["attr/name"].startsWith("event/")  ).map( attribute => attribute.entity ),
    "allEventValidators": serverResponse["eventValidators"].map( e => e.entity ),
    "allEventFields": serverResponse["eventFields"].map( e => e.entity ),
    "Accounts": getAccounts(),
    "userEvents": serverResponse["Events"]
  }},
  UIstatePatch === null ? {} : {"UIstate": mergerino(S["UIstate"], UIstatePatch)}
)

let getRetractionDatomsWithoutChildren = (Entities) => Entities.map( Entity =>  Object.entries( Entity ).map( e => newDatom(Entity["entity"], e[0], e[1], false) ).filter( d => d["attribute"] !== "entity" ) ).flat() //Need to also get children

let getUserActions = (S) => returnObject({
    updateLocalState: (patch) => update( updateS(S, null, patch ) ),
    updateEntityAttribute: async (entityID, attribute, value) => await sideEffects.submitDatomsWithValidation(S, [newDatom(entityID, attribute, value)] ),
    createEvent: async ( prevEvent, newEventTypeEntity ) => await sideEffects.submitDatomsWithValidation(S, [
      newDatom("newEvent", "entity/type", "event"),
      newDatom("newEvent", "event/eventTypeEntity", newEventTypeEntity),
      newDatom("newEvent", "event/incorporation/orgnumber", prevEvent["eventAttributes"]["event/incorporation/orgnumber"] ),
      newDatom("newEvent", "event/index", prevEvent["eventAttributes"]["event/index"] + 1 ),
      newDatom("newEvent", "event/date", prevEvent["eventAttributes"]["event/date"] ),
      newDatom("newEvent", "event/currency", "NOK")
    ] ),
    retractEvent: async entity => S["sharedData"]["E"][entity]["entity/type"] === "event" 
      ? await sideEffects.submitDatomsWithValidation(S, getRetractionDatomsWithoutChildren([ S["sharedData"]["E"][entity] ]) ) 
      : logThis(null, "ERROR: Not event"),
    retractEntity: async entity => await sideEffects.submitDatomsWithValidation(S,  getRetractionDatomsWithoutChildren( [S["sharedData"]["E"][entity] ])
    ),
    createAttribute: async () => await sideEffects.submitNewAttributeDatoms(S, [
      newDatom("newAttr", "entity/type", "attribute"),
      newDatom("newAttr", "attr/name", "event/attribute" + S["sharedData"]["attributes"].length ),
      newDatom("newAttr", "attribute/category", "Mangler kategori"),
      newDatom("newAttr", "entity/label", "[Attributt uten navn]"),
      newDatom("newAttr", "attribute/validatorFunctionString", `return (typeof inputValue !== "undefined");`),
    ] ),
    createEventType: async () => await sideEffects.submitDatomsWithValidation(S, [
      newDatom("newEventType", "entity/type", "eventType"),
      newDatom("newEventType", "entity/label", "label"),
      newDatom("newEventType", "entity/doc", "[doc]"),
      newDatom("newEventType", "eventType/eventAttributes", [] ),
      newDatom("newEventType", "eventType/requiredCompanyFields", [] ),
      newDatom("newEventType", "eventType/eventValidators", [] ),
      newDatom("newEventType", "eventType/eventFields", [] ), //eventFieldConstructors instead?
    ]),
    createEventValidator: async () => await sideEffects.submitDatomsWithValidation(S, [
        newDatom("newEventType", "entity/type", "eventValidator"),
        newDatom("newEventType", "entity/label", "label"),
        newDatom("newEventType", "entity/doc", "[doc]"),
        newDatom("newEventType", "eventValidator/errorMessage", "[errorMessage]" ),
    ]),
    createEventField: async () => await sideEffects.submitDatomsWithValidation(S, [
            newDatom("eventField", "entity/type", "eventField"),
            newDatom("eventField", "entity/label", "Ny hendelsesoutput"),
            newDatom("eventField", "entity/doc", "[doc]"),
            newDatom("eventField", "eventField/companyFields", [] ),
    ]),
    createCompanyField: async () => await sideEffects.submitDatomsWithValidation(S, [
        newDatom("companyField", "entity/type", "companyField"),
        newDatom("companyField", "entity/label", "label" ),
        newDatom("companyField", "entity/doc", "[doc]"),
    ]),
})

let getAttributeEntityFromName = (S, attributeName) => S["sharedData"]["attributes"].filter( a => a["attr/name"] === attributeName )[0]["entity"]

let getAccounts = (S) => returnObject({
  '1070': {label: 'Utsatt skattefordel'}, 
  '1300': {label: 'Investeringer i datterselskap'}, 
  '1320': {label: 'Lån til foretak i samme konsern'}, 
  '1330': {label: 'Investeringer i tilknyttet selskap'}, 
  '1340': {label: 'Lån til tilknyttet selskap og felles kontrollert virksomhet'}, 
  '1350': {label: 'Investeringer i aksjer, andeler og verdipapirfondsandeler'}, 
  '1360': {label: 'Obligasjoner'}, 
  '1370': {label: 'Fordringer på eiere'}, 
  '1375': {label: 'Fordringer på styremedlemmer'}, 
  '1380': {label: 'Fordringer på ansatte'}, 
  '1399': {label: 'Andre fordringer'}, 
  '1576': {label: 'Kortsiktig fordring eiere/styremedl. o.l.'}, 
  '1579': {label: 'Andre kortsiktige fordringer'}, 
  '1749': {label: 'Andre forskuddsbetalte kostnader'}, 
  '1800': {label: 'Aksjer og andeler i foretak i samme konsern'}, 
  '1810': {label: 'Markedsbaserte aksjer og verdipapirfondsandeler'}, 
  '1820': {label: 'Andre aksjer'}, 
  '1830': {label: 'Markedsbaserte obligasjoner'}, 
  '1870': {label: 'Andre markedsbaserte finansielle instrumenter'}, 
  '1880': {label: 'Andre finansielle instrumenter'}, 
  '1920': {label: 'Bankinnskudd'}, 
  '2000': {label: 'Aksjekapital'}, 
  '2020': {label: 'Overkurs'}, 
  '2030': {label: 'Annen innskutt egenkapital'}, 
  '2050': {label: 'Annen egenkapital'}, 
  '2080': {label: 'Udekket tap'}, 
  '2120': {label: 'Utsatt skatt'}, 
  '2220': {label: 'Gjeld til kredittinstitusjoner'}, 
  '2250': {label: 'Gjeld til ansatte og eiere'}, 
  '2260': {label: 'Gjeld til selskap i samme konsern'}, 
  '2290': {label: 'Annen langsiktig gjeld'}, 
  '2390': {label: 'Annen gjeld til kredittinstitusjon'}, 
  '2400': {label: 'Leverandørgjeld'}, 
  '2500': {label: 'Betalbar skatt, ikke fastsatt'}, 
  '2510': {label: 'Betalbar skatt, fastsatt'}, 
  '2800': {label: 'Avsatt utbytte'}, 
  '2910': {label: 'Gjeld til ansatte og eiere'}, 
  '2920': {label: 'Gjeld til selskap i samme konsern'}, 
  '2990': {label: 'Annen kortsiktig gjeld'}, 
  '6540': {label: 'Inventar'}, 
  '6551': {label: 'Datautstyr (hardware)'}, 
  '6552': {label: 'Programvare (software)'}, 
  '6580': {label: 'Andre driftsmidler'}, 
  '6701': {label: 'Honorar revisjon'}, 
  '6702': {label: 'Honorar rådgivning revisjon'}, 
  '6705': {label: 'Honorar regnskap'}, 
  '6720': {label: 'Honorar for økonomisk rådgivning'}, 
  '6725': {label: 'Honorar for juridisk bistand, fradragsberettiget'}, 
  '6726': {label: 'Honorar for juridisk bistand, ikke fradragsberettiget'}, 
  '6790': {label: 'Annen fremmed tjeneste'}, 
  '6890': {label: 'Annen kontorkostnad'}, 
  '6900': {label: 'Elektronisk kommunikasjon'}, 
  '7770': {label: 'Bank og kortgebyrer'}, 
  '7790': {label: 'Annen kostnad, fradragsberettiget'}, 
  '7791': {label: 'Annen kostnad, ikke fradragsberettiget'}, 
  '8000': {label: 'Inntekt på investering i datterselskap'}, 
  '8020': {label: 'Inntekt på investering i tilknyttet selskap'}, 
  '8030': {label: 'Renteinntekt fra foretak i samme konsern'}, 
  '8050': {label: 'Renteinntekt (finansinstitusjoner)'}, 
  '8055': {label: 'Andre renteinntekter'}, 
  '8060': {label: 'Valutagevinst (agio)'}, 
  '8070': {label: 'Annen finansinntekt'}, 
  '8071': {label: 'Aksjeutbytte'}, 
  '8078': {label: 'Gevinst ved realisasjon av aksjer'}, 
  '8080': {label: 'Verdiøkning av finansielle instrumenter vurdert til virkelig verdi'}, 
  '8090': {label: 'Inntekt på andre investeringer'}, 
  '8100': {label: 'Verdireduksjon av finansielle instrumenter vurdert til virkelig verdi'}, 
  '8110': {label: 'Nedskrivning av andre finansielle omløpsmidler'}, 
  '8120': {label: 'Nedskrivning av finansielle anleggsmidler'}, 
  '8130': {label: 'Rentekostnad til foretak i samme konsern'}, 
  '8140': {label: 'Rentekostnad, ikke fradragsberettiget'}, 
  '8150': {label: 'Rentekostnad (finansinstitusjoner)'}, 
  '8155': {label: 'Andre rentekostnader'}, 
  '8160': {label: 'Valutatap (disagio)'}, 
  '8170': {label: 'Annen finanskostnad'}, 
  '8178': {label: 'Tap ved realisasjon av aksjer'}, 
  '8300': {label: 'Betalbar skatt'}, 
  '8320': {label: 'Endring utsatt skatt'},
  '8800': {label: 'Årsresultat'}
})

let validateAttributeValue = (S, attributeEntity, value) =>  new Function(`inputValue`, S["sharedData"]["E"][ attributeEntity ]["attribute/validatorFunctionString"] )( value )


let eventAttributesAreValid = (S, eventAttributes) => S["sharedData"]["E"][ eventAttributes["event/eventTypeEntity"] ]["eventType/eventAttributes"]
  .every( attributeEntity =>  
    validateAttributeValue(S, attributeEntity, eventAttributes[ S["sharedData"]["E"][ attributeEntity ]["attr/name"] ] )
  )

let combinedEventIsValid = (S, eventAttributes, companyVariables) => S["sharedData"]["E"][ eventAttributes["event/eventTypeEntity"] ]["eventType/eventValidators"]
  .every( entity =>  
    new Function([`eventAttributes`, `companyFields`], S["sharedData"]["E"][entity]["eventValidator/validatorFunctionString"])( eventAttributes, companyVariables )
  )
    
    

let constructCompanyDoc = (S, storedEvents) => {

  let allCompanyFields = S["sharedData"]["allCompanyFields"]
  let allEventFields = S["sharedData"]["allEventFields"]

  let initialCompanyDoc = mergeArray( allCompanyFields.map( companyField => createObject(companyField, {})  ) ) 

  let docVersions = [initialCompanyDoc]

  let appliedEvents = []
  let rejectedEvents = []

  storedEvents.forEach( (eventAttributes, index) => {
    let Event = {eventAttributes}
    if(rejectedEvents.length > 0){ rejectedEvents.push( Event ) }
    else{
      let eventType = S["sharedData"]["E"][ eventAttributes["event/eventTypeEntity"] ]
      let attributesAreValid = eventAttributesAreValid(S, eventAttributes)
      if(!attributesAreValid){rejectedEvents.push( Event ) }
      else{
        let companyDoc = docVersions[index]
        let companyVariables = mergeArray( eventType["eventType/requiredCompanyFields"].map( entity => createObject( entity, companyDoc[ entity ] )  ) )  //validation TBD
        Event.companyVariables = companyVariables
        let eventIsValid = combinedEventIsValid(S, eventAttributes, companyVariables)
        if(!eventIsValid){rejectedEvents.push( Event )}
        else{

            let eventFieldConstructor = entity => (entity === 4372) 
              ? new Function( [`eventAttributes`, `companyFields`], eventType["eventType/accountBalanceConstructorFunctionString"]) 
              : new Function( [`eventAttributes`, `companyFields`, `updatedEventFields`], S["sharedData"]["E"][entity]["eventField/constructorFunctionString"])

            Event.eventFields = eventType["eventType/eventFields"].reduce( (updatedEventFields, entity) => mergerino( 
              updatedEventFields, 
              createObject(entity, eventFieldConstructor(entity)( eventAttributes, companyVariables, updatedEventFields ) )
            ), {} )

            appliedEvents.push( Event )

            let [companyFieldsToUpdate, companyFieldsToKeep] = split( allCompanyFields, companyFieldEntity => eventType["eventType/eventFields"].map( eventFieldEntity => S["sharedData"]["E"][eventFieldEntity]["eventField/companyFields"]  ).flat().includes(companyFieldEntity)   )
            let updatedFields = companyFieldsToUpdate.map( entity =>  createObject(entity, new Function([`prevValue` , `calculatedEventAttributes`], S["sharedData"]["E"][entity]["companyField/constructorFunctionString"])( companyDoc[entity], Event.eventFields ) ) )
            
            let newDocVersion =  mergeArray( companyFieldsToKeep.map( entity => createObject(entity, companyDoc[entity] ) ).concat( updatedFields ) )
            docVersions.push(newDocVersion)
        }
      }
    }
  })

  //Change to user-friendly labels?

  let Company = {
    orgnumber: storedEvents[0]["event/incorporation/orgnumber"],
    name: storedEvents[0]["event/attribute83"],
    appliedEvents,
    companyFields: docVersions,
    rejectedEvents
  }

  return Company

}


let update = (S) => {

    //To be fixed...
    S["sharedData"]["E"] = Array.isArray(S["sharedData"]["E"]) ?  mergeArray( S["sharedData"]["E"] ) : S["sharedData"]["E"] 
    S["userEvents"] = S["sharedData"]["userEvents"]

    S["selectedCompany"] = constructCompanyDoc(S, S.userEvents
      .filter( eventAttributes => eventAttributes["event/incorporation/orgnumber"] === S["UIstate"].selectedOrgnumber )
      .sort( (a, b) => a["event/index"] - b["event/index"]  ) )

    console.log(S["selectedCompany"])

    /* let datoms = S["sharedData"]["allEventFields"]
      .map( e => S["sharedData"]["E"][e] )
      .filter( e => e["entity/label"].startsWith("[RF-1167]") )
      .map( eventField => [
      newDatom("new_"+eventField.entity, "entity/type", "companyField" ),
      newDatom("new_"+eventField.entity, "entity/label", eventField["entity/label"] ),
      newDatom("new_"+eventField.entity, "entity/doc", eventField["entity/doc"]),
      newDatom("new_"+eventField.entity, "companyField/constructorFunctionString", `return calculatedEventAttributes[${eventField.entity}];`),
    ]  ).flat() 

    console.log(datoms) */

    let accounts = ['1000 Forskning og utvikling, ervervet', '1005 Forskning og utvikling, egenutviklet', '1020 Konsesjoner, ervervet', '1025 Konsesjoner, egenutviklet', '1030 Patenter, ervervet', '1035 Patenter, egenutviklet', '1040 Lisenser, ervervet', '1045 Lisenser, egenutviklet', '1050 Varemerker, ervervet', '1055 Varemerker, egenutviklet', '1060 Andre rettigheter, ervervet', '1065 Andre rettigheter, egenutviklet', '1070 Utsatt skattefordel', '1080 Goodwill, ervervet', '1100 Forretningsbygg', '1110 Bygg og anlegg, hotell o.l.', '1117 Elektroteknisk utrustning i kraftforetak', '1120 Fast teknisk installasjon i bygninger', '1130 Anlegg under utførelse', '1140 Jordbrukseiendommer', '1145 Skogbrukseiendommer', '1150 Tomter', '1155 Andre grunnarealer', '1160 Boliger inkl. tomter', '1180 Investeringseiendommer', '1190 Andre anleggsmidler', '1200 Maskiner og anlegg', '1210 Maskiner og anlegg under utførelse', '1220 Skip', '1224 Rigger', '1225 Fly', '1230 Personbiler/stasjonsvogner', '1233 Varebiler', '1236 Lastebiler', '1238 Busser', '1240 Traktorer', '1248 Trucker', '1249 Andre transportmidler', '1250 Inventar', '1260 Fast bygningsinventar, eget bygg', '1265 Fast bygningsinventar, leide bygg', '1270 Verktøy o.l.', '1280 Kontormaskiner', '1290 Andre driftsmidler', '1291 Andre driftsmidler, ikke avskrivbare', '1300 Investeringer i datterselskap', '1310 Investeringer i annet foretak i samme konsern', '1312 Investeringer i deltakerfastsatte datter- og konsernselskap', '1320 Lån til foretak i samme konsern', '1330 Investeringer i tilknyttet selskap', '1340 Lån til tilknyttet selskap og felles kontrollert virksomhet', '1350 Investeringer i aksjer, andeler og verdipapirfondsandeler', '1360 Obligasjoner', '1370 Fordringer på eiere', '1375 Fordringer på styremedlemmer', '1380 Fordringer på ansatte', '1393 Innskuddsfond', '1394 Overfinansiering av pensjonsforpliktelser', '1395 Leietakerinnskudd', '1396 Depositum', '1397 Forskuddsleasing', '1398 Påkostning leide driftsmidler', '1399 Andre fordringer', '1400 Råvarer', '1401 Halvfabrikata', '1405 Hjelpematerialer', '1408 Driftsmaterialer og reservedeler', '1409 Beholdningsendring', '1420 Varer under tilvirkning', '1429 Beholdningsendring', '1440 Ferdig egentilvirkede varer', '1449 Beholdningsendring', '1460 Innkjøpte varer for videresalg', '1465 Demonstrasjonsvarer', '1469 Beholdningsendring', '1480 Forskuddsbetaling til leverandører (varekontrakter/prosjekter)', '1490 Biologiske eiendeler', '1500 Kundefordringer', '1530 Opptjent, ikke fakturert driftsinntekt', '1550 Kundefordringer på selskap i samme konsern', '1560 Andre fordringer på selskap i samme konsern', '1569 Fordringer konsernbidrag, ikke vedtatt', '1570 Reiseforskudd', '1571 Lønnsforskudd', '1572 Andre kortsiktige lån til ansatte', '1576 Kortsiktig fordring eiere/styremedl. o.l.', '1579 Andre kortsiktige fordringer', '1580 Avsetning tap på kundefordringer', '1585 Avsetning tap på andre fordringer', '1590 Andre omløpsmidler', '1600 Utgående merverdiavgift, høy sats', '1601 Utgående merverdiavgift, mellom sats', '1602 Utgående merverdiavgift, råfisk', '1603 Utgående merverdiavgift, lav sats', '1604 Utgående merverdiavgift ved kjøp av tjenester fra utlandet, høy sats', '1605 Utgående innførselsavgift for varer, høy sats', '1606 Utgående innførselsavgift for varer, mellom sats', '1607 Utgående merverdiavgift ved innenlands kjøp med omvendt avgiftsplikt, høy sats', '1610 Inngående merverdiavgift, høy sats', '1611 Inngående merverdiavgift, mellom sats', '1612 Innenlands inngående merverdiavgift, råfisk', '1613 Innenlands inngående merverdiavgift, lav sats', '1614 Inngående merverdiavgift ved kjøp av tjenester fra utlandet, høy sats', '1615 Inngående innførselsavgift for varer, høy sats', '1616 Inngående innførselsavgift for varer, mellom sats', '1620 Grunnlag utgående merverdiavgift, omvendt avgiftsplikt', '1621 Motkonto grunnlag utgående innførselsavgift, omvendt avgiftsplikt', '1640 Oppgjørskonto merverdiavgift', '1650 Kompensert merverdiavgift, høy sats', '1651 Kompensert merverdiavgift, mellom sats', '1652 Kompensert merverdiavgift, lav sats', '1654 Oppgjørskonto kompensert merverdiavgift', '1655 Grunnlag kompensert merverdiavgift, høy sats', '1656 Grunnlag kompensert merverdiavgift, mellom sats', '1657 Grunnlag kompensert merverdiavgift, lav sats', '1659 Motkonto grunnlag kompensert merverdiavgift', '1660 Krav på refusjon av utenlandsk merverdiavgift', '1670 Krav på offentlige tilskudd', '1675 Skattefunn til gode, ikke fastsatt', '1700 Forskuddsbetalt leiekostnad', '1710 Forskuddsbetalt rentekostnad', '1720 Andre depositum', '1740 Forskuddsbetalt, ikke påløpt lønn', '1741 Forskuddsbetalt strøm, varme m.v.', '1742 Forskuddsbetalt forsikring', '1743 Forskuddsbetalt leasing (kortsiktig)', '1749 Andre forskuddsbetalte kostnader', '1750 Påløpt leieinntekt', '1760 Påløpt renteinntekt', '1770 Andre periodiseringer', '1780 Krav på innbetaling av selskapskapital', '1800 Aksjer og andeler i foretak i samme konsern', '1810 Markedsbaserte aksjer og verdipapirfondsandeler', '1820 Andre aksjer', '1830 Markedsbaserte obligasjoner', '1840 Andre obligasjoner', '1850 Markedsbaserte obligasjoner med kort løpetid (sertifikater)', '1860 Andre obligasjoner med kort løpetid (sertifikater)', '1870 Andre markedsbaserte finansielle instrumenter', '1880 Andre finansielle instrumenter', '1881 Verdijustering andre finansielle instrumenter', '1900 Kontanter, NOK', '1905 Kontanter, Euro', '1908 Kontanter, Annen valuta', '1909 Kassedifferanser', '1920 Bankinnskudd', '1925 Bankinnskudd, utland', '1950 Bankinnskudd for skattetrekk', '2000 Aksjekapital', '2010 Egne aksjer', '2020 Overkurs', '2025 Ikke registrert kapitalforhøyelse/ kapitalnedsettelse', '2030 Annen innskutt egenkapital', '2036 Stiftelesutgifter', '2040 Fond for vurderingsforskjeller', '2041 Fond for vurderingsforskjeller i DLS', '2042 Fond for vurderingsforskjeller i andre selskap', '2045 Fond for urealiserte gevinster', '2050 Annen egenkapital', '2080 Udekket tap', '2100 Pensjonsforpliktelser', '2120 Utsatt skatt', '2130 Derivater', '2160 Uopptjent inntekt', '2180 Andre avsetninger for forpliktelser', '2200 Konvertible lån', '2210 Obligasjonslån', '2220 Gjeld til kredittinstitusjoner', '2240 Pantelån', '2250 Gjeld til ansatte og eiere', '2260 Gjeld til selskap i samme konsern', '2270 Andre valutalån', '2280 Stille interessentinnskudd og ansvarlig lånekapital', '2290 Annen langsiktig gjeld', '2300 Konvertible lån', '2320 Obligasjonslån', '2330 Derivater', '2340 Andre valutalån', '2360 Byggelån', '2380 Kassakreditt', '2390 Annen gjeld til kredittinstitusjon', '2400 Leverandørgjeld', '2460 Leverandørgjeld til selskap i samme konsern', '2500 Betalbar skatt, ikke fastsatt', '2510 Betalbar skatt, fastsatt', '2540 Forskuddsskatt', '2600 Forskuddstrekk', '2610 Utleggstrekk', '2620 Bidragstrekk', '2630 Trygdetrekk', '2640 Forsikringstrekk', '2650 Trukket fagforeningskontingent', '2670 Trukket lavtlønnsfond', '2690 Andre trekk', '2700 Utgående merverdiavgift, høy sats', '2701 Utgående merverdiavgift, mellom sats', '2702 Utgående merverdiavgift, råfisk', '2703 Utgående merverdiavgift, lav sats', '2704 Utgående merverdiavgift ved kjøp av tjenester fra utlandet, høy sats', '2705 Utgående innførselsavgift for varer, høy sats', '2706 Utgående innførselsavgift for varer, mellom sats', '2707 Utgående merverdiavgift ved innenlands kjøp med omvendt avgiftsplikt, høy sats', '2710 Innenlands inngående merverdiavgift, høy sats', '2711 Innenlands inngående merverdiavgift, mellom sats', '2712 Innenlands inngående merverdiavgift, råfisk', '2713 Innenlands inngående merverdiavgift, lav sats', '2714 Inngående merverdiavgift ved kjøp av tjenester fra utlandet, høy sats', '2715 Inngående innførselsavgift for varer, høy sats', '2716 Inngående innførselsavgift for varer, mellom sats', '2720 Grunnlag utgående innførselsavgift', '2721 Motkonto grunnlag utgående innførselsavgift', '2740 Oppgjørskonto merverdiavgift', '2770 Skyldig arbeidsgiveravgift', '2780 Påløpt arbeidsgiveravgift på påløpt lønn', '2785 Påløpt arbeidsgiveravgift på ferielønn', '2790 Andre offentlige avgifter', '2800 Avsatt utbytte', '2900 Forskudd fra kunder', '2910 Gjeld til ansatte og eiere', '2920 Gjeld til selskap i samme konsern', '2929 Gjeld konsernbidrag, ikke vedtatt', '2930 Skyldig lønn', '2940 Skyldig feriepenger', '2950 Påløpt rente', '2960 Påløpt kostnad', '2965 Forskuddsbetalt inntekt', '2970 Uopptjent inntekt', '2980 Avsetning styrehonorar', '2981 Avsetning revisjonshonorar', '2982 Avsetning regnskapshonorar', '2989 Avsetning andre forpliktelser', '2990 Annen kortsiktig gjeld', '3000 Salgsinntekt, avgiftspliktig', '3060 Uttak av varer/tjenester', '3061 Motkonto uttak av varer/tjenester', '3080 Rabatt og annen salgsinntektsreduksjon', '3090 Opptjent, ikke fakturert inntekt', '3095 Motkonto, avgiftspliktig salgsinntekt', '3100 Salgsinntekt, avgiftsfri', '3160 Uttak av varer/tjenester', '3180 Rabatt og annen salgsinntektsreduksjon', '3190 Opptjent, ikke fakturert inntekt', '3200 Salgsinntekt, unntatt avgiftsplikt', '3260 Uttak av varer/tjenester', '3280 Rabatt og annen salgsinntektsreduksjon', '3290 Opptjent, ikke fakturert inntekt', '3300 Spesiell offentlig avgift for tilvirkede/solgte varer', '3400 Spesielt offentlig tilskudd for tilvirkede/solgte varer', '3440 Spesielt offentlig tilskudd for tjeneste', '3500 Garanti', '3510 Service', '3550 Annen uopptjent inntekt', '3600 Leieinntekt fast eiendom, unntatt avgiftsplikt', '3605 Leieinntekt fast eiendom, avgiftspliktig', '3610 Leieinntekt andre varige driftsmidler, avgiftspliktig', '3615 Leieinntekt andre varige driftsmidler, avgiftsfri', '3616 Leieinntekt andre varige driftsmidler, unntatt avgiftsplikt', '3620 Annen leieinntekt', '3690 Opptjent, ikke fakturert leieinntekt', '3695 Motkonto, avgiftspliktig leieinntekt', '3700 Provisjonsinntekt, avgiftspliktig', '3705 Provisjonsinntekt, avgiftsfri', '3710 Provisjonsinntekt, unntatt avgiftsplikt', '3790 Opptjent, ikke fakturert provisjon', '3800 Salgssum anleggsmidler, avgiftspliktig', '3805 Salgssum anleggsmidler, avgiftsfri', '3807 Salgssum anleggsmidler, unntatt avgiftsplikt', '3808 Realisasjonsverdi anleggsmidler', '3809 Motkonto, balanseverdi solgte anleggsmidler', '3850 Verdiendringer investeringseiendommer', '3870 Verdiendringer biologiske eiendeler', '3900 Annen driftsinntekt', '4000 Innkjøp av råvarer og halvfabrikater', '4060 Frakt, toll og spedisjon', '4070 Innkjøpsprisreduksjon', '4080 Beregningsgrunnlag for innførselsavgift ved kjøp av råvarer og halvfabrikata', '4081 Motkonto beregningsgrunnlag for innførselsavgift ved kjøp av råvarer og halvfabrikata', '4090 Beholdningsendring', '4100 Innkjøp varer under tilvirkning', '4160 Frakt, toll og spedisjon', '4170 Innkjøpsprisreduksjon', '4190 Beholdningsendring', '4200 Innkjøp ferdig egentilvirkede varer', '4260 Frakt, toll og spedisjon', '4270 Innkjøpsprisreduksjon', '4290 Beholdningsendring', '4300 Innkjøp av varer for videresalg', '4350 Svinn, tap', '4360 Frakt, toll og spedisjon', '4370 Innkjøpsprisreduksjon', '4380 Beregningsgrunnlag for innførselsavgift av varer innkjøpt for videresalg', '4381 Motkonto beregningsgrunnlag for innførselsavgift for varer innkjøpt for videresalg', '4390 Beholdningsendring', '4500 Fremmedytelse og underentreprise', '4520 Under-entreprenører, opplysningspliktige', '4590 Beholdningsendring', '4900 Annen periodisering', '4990 Beholdningsendring, egentilvirkede anleggsmidler', '5000 Lønn til ansatte', '5020 Feriepenger', '5030 Sykepenger', '5090 Påløpt, ikke utbetalt lønn', '5091 Påløpte feriepenger av ikke utbetalt lønn', '5099 Andre lønnsperiodiseringer', '5200 Fri bil', '5210 Fri telefon', '5220 Fri avis', '5230 Fri kost, losji og bolig', '5240 Rentefordel', '5251 Gruppelivsforsikring', '5252 Ulykkesforsikring', '5280 Annen fordel i arbeidsforhold', '5285 Annen fordel i arbeidsforhold - ikke arbeidsgiveravgiftspliktig', '5290 Motkonto for gruppe 52', '5300 Tantieme', '5310 Gruppelivsforsikring', '5320 Annen personalforsikring', '5330 Godtgjørelse til styre- og bedriftsforsamling', '5390 Annen opplysningspliktig godtgjørelse', '5395 Annen opplysningspliktig godtgjørelse - ikke arbeidsgiveravgiftspliktig', '5400 Arbeidsgiveravgift', '5401 Arbeidsgiveravgift av påløpt ferielønn', '5405 Arbeidsgiveravgift av andre påløpte lønnskostnader', '5420 Innberetningspliktig pensjonskostnad', '5500 Annen kostnadsgodtgjørelse', '5510 Trekkpliktig del reise', '5520 Trekkpliktige matpenger', '5700 Lærlingtilskudd', '5720 Annet lønnstilskudd', '5800 Refusjon av sykepenger', '5820 Refusjon av arbeidsgiveravgift', '5830 Refusjon arbeidsmarkedstiltak', '5890 Annen refusjon', '5900 Gave til ansatte, fradragsberettiget', '5901 Gave til ansatte, ikke fradragsberettiget (t.o.m. 2018)', '5910 Kantinekostnad', '5912 Middag ved overtid', '5919 Trekk kantinekostnad ansatte', '5920 Yrkesskadeforsikring', '5930 Annen ikke arbeidsgiveravgiftspliktig forsikring', '5941 LO/NHO ( O & U + sluttvederlag )', '5942 LO/NHO ( AFP )', '5945 Pensjonsforsikring for ansatte', '5946 Pensjonsforsikring for ansatte (uten arbeidsgiveravgift)', '5990 Annen personalkostnad', '6000 Avskrivning på bygninger og annen fast eiendom', '6005 Avskrivning på påkostninger, leid driftsmiddel', '6010 Avskrivning på transportmidler', '6015 Avskrivning på maskiner', '6017 Avskrivning på inventar', '6020 Avskrivning på immaterielle eiendeler', '6050 Nedskrivning av varige driftsmidler og immaterielle eiendeler', '6100 Frakt, transportkostnad og forsikring ved vareforsendelse', '6110 Toll og spedisjonskostnad ved vareforsendelse', '6190 Annen frakt- og transportkostnad ved salg', '6200 Elektrisitet', '6210 Gass', '6220 Fyringsolje', '6230 Kull, koks', '6240 Ved', '6250 Bensin, dieselolje', '6260 Vann', '6290 Annet brensel', '6300 Leie lokale', '6320 Renovasjon, vann, avløp o.l.', '6340 Lys, varme', '6360 Renhold', '6390 Annen kostnad lokaler', '6400 Leie maskiner', '6410 Leie inventar', '6420 Leie datasystemer', '6430 Leie andre kontormaskiner', '6440 Leie transportmidler', '6490 Annen leiekostnad', '6500 Motordrevet verktøy', '6510 Håndverktøy', '6520 Hjelpeverktøy', '6530 Spesialverktøy', '6540 Inventar', '6550 Driftsmateriale', '6551 Datautstyr (hardware)', '6552 Programvare (software)', '6560 Rekvisita', '6570 Arbeidsklær og verneutstyr', '6580 Andre driftsmidler', '6590 Annet driftsmateriale', '6600 Reparasjon og vedlikehold bygninger', '6620 Reparasjon og vedlikehold utstyr', '6690 Reparasjon og vedlikehold annet', '6701 Honorar revisjon', '6702 Honorar rådgivning revisjon', '6705 Honorar regnskap', '6720 Honorar for økonomisk rådgivning', '6725 Honorar for juridisk bistand, fradragsberettiget', '6726 Honorar for juridisk bistand, ikke fradragsberettiget', '6790 Annen fremmed tjeneste', '6800 Kontorrekvisita', '6820 Trykksak', '6840 Aviser, tidsskrifter, bøker o.l.', '6860 Møte, kurs, oppdatering o.l.', '6890 Annen kontorkostnad', '6900 Elektronisk kommunikasjon', '6940 Porto', '7000 Drivstoff', '7020 Vedlikehold bil', '7040 Forsikring og avgifter bil', '7090 Annen kostnad transportmidler', '7100 Bilgodtgjørelse, opplysningspliktig', '7130 Reisekostnad, opplysningspliktig', '7140 Reisekostnad, ikke opplysningspliktig', '7150 Diettkostnad, opplysningspliktig', '7160 Diettkostnad, ikke opplysningspliktig', '7190 Annen kostnadsgodtgjørelse', '7200 Provisjonskostnad, opplysningspliktig', '7210 Provisjonskostnad, ikke opplysningspliktig', '7300 Salgskostnad', '7320 Reklamekostnad', '7350 Representasjon, fradragsberettiget', '7360 Representasjon, ikke fradragsberettiget', '7390 Annen salgskostnad', '7400 Kontingent, fradragsberettiget', '7410 Kontingent, ikke fradragsberettiget', '7420 Gave, fradragsberettiget', '7430 Gave, ikke fradragsberettiget', '7500 Forsikringspremie', '7550 Garantikostnad', '7560 Servicekostnad', '7600 Lisensavgift og royalties', '7610 Patentkostnad ved egen patent', '7620 Kostnad ved varemerke o.l.', '7630 Kontroll-, prøve- og stempelavgift', '7710 Styre- og bedriftsforsamlingsmøter', '7720 Generalforsamling', '7730 Kostnad ved egne aksjer', '7740 Øredifferanser', '7750 Eiendoms- og festeavgift', '7770 Bank og kortgebyrer', '7780 Justering av inngående merverdiavgift', '7790 Annen kostnad, fradragsberettiget', '7791 Annen kostnad, ikke fradragsberettiget', '7820 Innkommet på tidligere nedskrevne fordringer', '7830 Tap på fordringer', '7831 Endring i avsetning tap på fordringer', '7860 Tap på kontrakter', '7880 Tap ved avgang av immaterielle eiendeler og varige driftsmidler', '7900 Annen periodisering', '8000 Inntekt på investering i datterselskap', '8002 Konsernbidrag fra datter', '8005 Netto positiv resultatandel vedr. investering i DS, TS og FKV', '8006 Netto negativ resultatandel vedr. investering i DS, TS og FKV', '8010 Inntekt på investering i annet foretak i samme konsern', '8020 Inntekt på investering i tilknyttet selskap', '8030 Renteinntekt fra foretak i samme konsern', '8040 Renteinntekt, skattefri', '8050 Renteinntekt (finansinstitusjoner)', '8055 Andre renteinntekter', '8060 Valutagevinst (agio)', '8070 Annen finansinntekt', '8071 Aksjeutbytte', '8078 Gevinst ved realisasjon av aksjer', '8080 Verdiøkning av finansielle instrumenter vurdert til virkelig verdi', '8090 Inntekt på andre investeringer', '8100 Verdireduksjon av finansielle instrumenter vurdert til virkelig verdi', '8110 Nedskrivning av andre finansielle omløpsmidler', '8120 Nedskrivning av finansielle anleggsmidler', '8130 Rentekostnad til foretak i samme konsern', '8140 Rentekostnad, ikke fradragsberettiget', '8150 Rentekostnad (finansinstitusjoner)', '8155 Andre rentekostnader', '8160 Valutatap (disagio)', '8170 Annen finanskostnad', '8178 Tap ved realisasjon av aksjer', '8300 Betalbar skatt', '8320 Endring utsatt skatt', '8800 Årsresultat', '8900 Overføringer fond', '8910 Overføringer felleseid andelskapital for samvirkeforetak', '8920 Avsatt utbytte', '8925 Avsatt tilleggsutbytte', '8926 Avsatt ekstraordinært utbytte', '8930 Mottatt konsernbidrag', '8935 Avsatt konsernbidrag', '8950 Fondsemisjon', '8960 Overføringer annen egenkapital', '8990 Udekket tap']

    let datoms = S["sharedData"]["allCompanyFields"]
      .filter( e => !S["sharedData"]["E"][e]["entity/category"] )
      .map( string => newDatom(string, "entity/category", "Altinn-skjemaer")  )

    console.log(datoms) 

    console.log("State: ", S)
    let A = getUserActions(S)
    //A.retractEntity(4168)
    S.elementTree = generateHTMLBody(S, A )
    sideEffects.updateDOM( S.elementTree )
}

sideEffects.configureClient();

let Admin = {
    updateClientRelease: (newVersion) => Admin.submitDatoms([newDatom(2829, "transaction/records", {"serverVersion":"0.3.2","clientVersion":newVersion})], null),
    resetServer: () => sideEffects.APIRequest("GET", "resetServer", null),
    submitDatoms: async (datoms) => datoms.length < 3000
    ? await sideEffects.APIRequest("POST", "transactor", JSON.stringify( logThis(datoms, "Datoms submitted to Transactor.") )) 
    : console.log("ERROR: Too many datoms: ", datoms),
    //retractEntity: async entityAttributes => await sideEffects.submitDatomsWithValidation(S,  getRetractionDatomsWithoutChildren( entityAttributes )
    //)
}


let accBalConstructor = (eventAttributes, companyFields ) => {

    `2036	Stiftelesutgifter
    5901	Gave til ansatte, ikke fradragsberettiget (t.o.m. 2018)
    6726	Honorar for juridisk bistand, ikke fradragsberettiget
    7360	Representasjon, ikke fradragsberettiget
    7410	Kontingent, ikke fradragsberettiget
    7430	Gave, ikke fradragsberettiget
    7791	Annen kostnad, ikke fradragsberettiget
    8000	Inntekt på investering i datterselskap
    8002	Konsernbidrag fra datter
    8005	Netto positiv resultatandel vedr. investering i DS, TS og FKV
    8006	Netto negativ resultatandel vedr. investering i DS, TS og FKV
    8010	Inntekt på investering i annet foretak i samme konsern
    8020	Inntekt på investering i tilknyttet selskap
    8040	Renteinntekt, skattefri
    8071	Aksjeutbytte
    8078	Gevinst ved realisasjon av aksjer
    8080	Verdiøkning av finansielle instrumenter vurdert til virkelig verdi
    8100	Verdireduksjon av finansielle instrumenter vurdert til virkelig verdi
    8110	Nedskrivning av andre finansielle omløpsmidler
    8120	Nedskrivning av finansielle anleggsmidler
    8140	Rentekostnad, ikke fradragsberettiget
    8178	Tap ved realisasjon av aksjer`


  

  let nonDeductibleAccounts = ['5901' , '6726' , '7360' , '7410' , '7430' , '7791' , '8000' , '8002' , '8005' , '8006' , '8010' , '8020' , '8040' , '8071' , '8078' , '8080' , '8100' , '8110' , '8120' , '8140' , '8178'] //NB: changed 2036 to 2030. Which to  use for Stiftelseskost?

  let thisYearIncorporationCost = 5570; //må ha egen attributt fra stiftelse?

  //3% dividendtax TBD

  return mergeArray(nonDeductibleAccounts.map( account => createObject(account, companyFields[4380][account] ? companyFields[4380][account] : 0 ) ));
} 






//Archive

const Reports = {
    "rf_1028": {
      accountMapping: {'406': ['1320' , '1340' , '1370' , '1375' , '1380' , '1399' , '1576' , '1579' , '1749'], '408': ['1920'], '440': ['2220' , '2250' , '2260' , '2290' , '2390' , '2400' , '2510' , '2910' , '2920' , '2990']},
      prepare: ( accountBalance ) => mergeArray( 
        Object.keys(Reports["rf_1028"]["accountMapping"]).map( reportKey => 
          createObject(
            reportKey, 
            Reports["rf_1028"]["accountMapping"][ reportKey ].reduce( (sum, account) => sum + accountBalance[account] ? accountBalance[account] : 0, 0 ) 
          ) 
        )  
      )
    },
    "rf_1167": {
      accountMapping: {'8300': ['8300', '0620'], '8320': ['8320, 0620'], '8140': ['8179, 0621'], '8100': ['8100, 0631'], '8110': ['8115, 0632'], '8120': ['8115, 0632'], '8178': ['8174, 0633'], '6726': ['6700, 0640'], '7791': ['7700, 0640'], '8071': ['8090, 0815'], '8000': ['8005, 0830'], '8020': ['8005, 0830'], '8080': ['8080, 0831'], '8078': ['8074, 0833'], '1320': ['0440, 1320'], '1340': ['0440, 1340'], '1370': ['0440, 1370'], '1375': ['0440, 1370'], '1380': ['0440, 1380'], '1399': ['0440, 1390'], '1576': ['0440, 1565'], '1579': ['0440, 1570'], '1749': ['0440, 1570'], '1070': ['1070'], '1300': ['1313'], '1330': ['1332'], '1350': ['1350'], '1360': ['1360'], '1800': ['1800'], '1810': ['1810'], '1820': ['1800'], '1830': ['1830'], '1870': ['1880'], '1880': ['1880'], '1920': ['1920'], '2000': ['2000'], '2020': ['2020'], '2030': ['2030'], '2050': ['2059'], '2080': ['2080'], '2120': ['2120'], '2220': ['2220'], '2250': ['2250'], '2260': ['2260'], '2290': ['2290'], '2390': ['2380'], '2400': ['2400'], '2500': ['2500'], '2510': ['2510'], '2800': ['2800'], '2910': ['2910'], '2920': ['2920'], '2990': ['2990'], '6540': ['6500'], '6551': ['6500'], '6552': ['6500'], '6580': ['6500'], '6701': ['6700'], '6702': ['6700'], '6705': ['6700'], '6720': ['6700'], '6725': ['6700'], '6790': ['6700'], '6890': ['6995'], '6900': ['6995'], '7770': ['7700'], '7790': ['7700'], '8030': ['8030'], '8050': ['8050'], '8055': ['8050'], '8060': ['8060'], '8070': ['8079'], '8090': ['8090'], '8130': ['8130'], '8150': ['8150'], '8155': ['8150'], '8160': ['8160'], '8170': ['8179']},
      prepare: ( accountBalance ) => mergeArray( 
        Object.keys(Reports["rf_1167"]["accountMapping"]).map( reportKey => 
          createObject(
            reportKey, 
            Reports["rf_1167"]["accountMapping"][ reportKey ].reduce( (sum, account) => sum + accountBalance[account] ? accountBalance[account] : 0, 0 ) 
          ) 
        )  
      )
    },
    "rf_1086": {
      prepare: ( accumulatedVariables ) => returnObject({TBD: "TBD"})
    },
    "annualReport": {
      accountMapping: {"9000":[],"9010":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791"],"9050":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791"],"9060":["8000","8020","8030","8050","8055","8060","8070","8071","8078","8080","8090"],"9070":["8100","8110","8120","8130","8140","8150","8155","8160","8170","8178"],"9100":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791","8000","8020","8030","8050","8055","8060","8070","8071","8078","8080","8090","8100","8110","8120","8130","8140","8150","8155","8160","8170","8178"],"9150":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791","8000","8020","8030","8050","8055","8060","8070","8071","8078","8080","8090","8100","8110","8120","8130","8140","8150","8155","8160","8170","8178","8300","8320"],"9200":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791","8000","8020","8030","8050","8055","8060","8070","8071","8078","8080","8090","8100","8110","8120","8130","8140","8150","8155","8160","8170","8178","8300","8320"],"9300":["1070","1300","1320","1330","1340","1350","1360","1370","1375","1380","1399"],"9350":["1576","1579","1749","1800","1810","1820","1830","1870","1880","1920"],"9400":["1070","1300","1320","1330","1340","1350","1360","1370","1375","1380","1399","1576","1579","1749","1800","1810","1820","1830","1870","1880","1920"],"9450":["2000","2020","2030","2050","2080"],"9500":["2120","2220","2250","2260","2290"],"9550":["2390","2400","2500","2510","2800","2910","2920","2990"],"9650":["2000","2020","2030","2050","2080","2120","2220","2250","2260","2290","2390","2400","2500","2510","2800","2910","2920","2990"]},
      prepare: ( accountBalance ) => mergeArray( 
        Object.keys(Reports["annualReport"]["accountMapping"]).map( reportKey => 
          createObject(
            reportKey, 
            Reports["annualReport"]["accountMapping"][ reportKey ].reduce( (sum, account) => sum + accountBalance[account] ? accountBalance[account] : 0, 0 ) 
          ) 
        )  
      ),
      virtualAccounts: [
        {virtualAccount: '9000', label: 'Sum driftsinntekter', firstAccount: "3000", lastAccount: "3999"},
        {virtualAccount: '9010', label: 'Sum driftskostnader', firstAccount: "4000", lastAccount: "7999"},
        {virtualAccount: '9050', label: 'Driftsresultat', firstAccount: "3000", lastAccount: "7999"},
        {virtualAccount: '9060', label: 'Sum finansinntekter', firstAccount: "8000", lastAccount: "8099"},
        {virtualAccount: '9070', label: 'Sum finanskostnader', firstAccount: "8100", lastAccount: "8199"},
        {virtualAccount: '9100', label: 'Ordinært resultat før skattekostnad', firstAccount: "3000", lastAccount: "8199"},
        {virtualAccount: '9150', label: 'Ordinært resultat', firstAccount: "3000", lastAccount: "8399"},
        {virtualAccount: '9200', label: 'Årsresultat', firstAccount: "3000", lastAccount: "8699"},
        {virtualAccount: '9300', label: 'Sum anleggsmidler', firstAccount: "1000", lastAccount: "1399"},
        {virtualAccount: '9350', label: 'Sum omløpsmidler', firstAccount: "1400", lastAccount: "1999"},
        {virtualAccount: '9400', label: 'Sum eiendeler', firstAccount: "1000", lastAccount: "1999"},
        {virtualAccount: '9450', label: 'Sum egenkapital', firstAccount: "2000", lastAccount: "2099"},
        {virtualAccount: '9500', label: 'Sum langsiktig gjeld', firstAccount: "2100", lastAccount: "2299"},
        {virtualAccount: '9550', label: 'Sum kortsiktig gjeld', firstAccount: "2300", lastAccount: "2999"},
        {virtualAccount: '9650', label: 'Sum egenkapital og gjeld', firstAccount: "2000", lastAccount: "2999"}
    ]
    },
    "notesText": {
      prepare: ( companyDoc ) => {
  
        let openingBalance = companyDoc["company/:openingBalance"]
        let accountBalance = companyDoc["company/:accountBalance"]
      
        let shareholders = companyDoc["company/:shareholders"]
        let shareCount = companyDoc["company/:shareCount"]
    
        let nominalSharePrice = companyDoc["company/:nominalSharePrice"]
    
        let em = (content) => String('<span class="emphasizedText">' + content + '</span>')
      
        return `
      <h4>Note 1: Regnskapsprinsipper</h4>
      Regnskapet er utarbeidet i henhold til norske regnskapsregler/-standarder for små foretak.
      <br>
      <h5>Klassifisering og vurdering av balanseposter</h5>
      Omløpsmidler og kortsiktig gjeld omfatter poster som forfaller til betaling innen ett år etter anskaffelsestidspunktet, samt poster som knytter seg til varekretsløpet. Øvrige poster er klassifisert som anleggsmiddel/langsiktig gjeld.
      <br>
      Omløpsmidler vurderes til laveste av anskaffelseskost og virkelig verdi. Kortsiktig gjeld balanseføres til nominelt beløp på opptakstidspunktet.
      <br>
      Anleggsmidler vurderes til anskaffelseskost, men nedskrives til gjenvinnbart beløp dersom dette er lavere enn balanseført verdi. Gjenvinnbart beløp er det høyeste av netto salgsverdi og verdi i bruk. Langsiktig gjeld balanseføres til nominelt beløp på etableringstidspunktet.
      Markedsbaserte finansielle omløpsmidler som inngår i en handelsportefølje vurderes til virkelig verdi, mens andre markedsbaserte finansielle omløpsmidler vurderes til laveste av anskaffelseskost og virkelig verdi.
      <br>
      <h5>Skatt</h5>
      Skattekostnaden i resultatregnskapet omfatter både betalbar skatt for perioden og endring i utsatt skatt. Utsatt skatt er beregnet med ${em("TBD")} på grunnlag av de midlertidige forskjeller som eksisterer mellom regnskapsmessige og skattemessige verdier, samt ligningsmessig underskudd til fremføring ved utgangen av regnskapsåret. Skatteøkende og skattereduserende midlertidige forskjeller som reverserer eller kan reversere i samme periode er utlignet og nettoført.
      <br>
      <h4>Note 2: Aksjekapital og aksjonærinformasjon</h4>
      Foretaket har ${em( shareCount ) } aksjer, pålydende kr ${em(  nominalSharePrice )}, noe som gir en samlet aksjekapital på kr ${em( accountBalance["2000"] )}. Selskapet har én aksjeklasse.
      <br><br>
      Aksjene eies av: 
      <br>
      ${shareholders.map( (shareholder, index) => em(`${index}: ${shareholder} <br>`)).join("")}
      
      <h4>Note 3: Egenkapital</h4>
      
      <table>
      <tbody>
        <tr>
          <td class="numberCell"></td>
          <td class="numberCell">Aksjekapital</td>
          <td class="numberCell">Overkurs</td>
          <td class="numberCell">Annen egenkapital</td>
          <td class="numberCell">Sum</td>
        </tr>
        <tr>
          <td>Egenkapital 1.1 </td>
          <td class="numberCell">${em( openingBalance["2000"] ) }</td>
          <td class="numberCell">${em( openingBalance["2020"] ) }</td>
          <td class="numberCell">${em( openingBalance["2030"] ) }</td>
          <td class="numberCell">${em( openingBalance["2000"] + openingBalance["2020"] + openingBalance["2030"] ) }</td>
        </tr>
        <tr>
          <td>Endring ila. året </td>
          <td class="numberCell">${em( accountBalance["2000"] - openingBalance["2000"] ) }</td>
          <td class="numberCell">${em( accountBalance["2020"] - openingBalance["2020"] ) }</td>
          <td class="numberCell">${em( accountBalance["2030"] - openingBalance["2030"] ) }</td>
          <td class="numberCell">${em( accountBalance["2000"] - openingBalance["2000"] + accountBalance["2020"] - openingBalance["2020"] + accountBalance["2030"] - openingBalance["2030"] ) }</td>
        </tr>
        <tr>
          <td>Egenkapital 31.12 </td>
          <td class="numberCell">${em( accountBalance["2000"] ) }</td>
          <td class="numberCell">${em( accountBalance["2020"] ) }</td>
          <td class="numberCell">${em( accountBalance["2030"] ) }</td>
          <td class="numberCell">${em( accountBalance["2000"] + accountBalance["2020"] + accountBalance["2030"] ) }</td>
        </tr>
      </tbody>
      </table>
      <br>
      <h4>Note 5: Skatt</h4>
      ${"[TBD]" }
      
      <h4>Note 4: Lønnskostnader, antall ansatte, godtgjørelser, revisjonskostnader mm.</h4>
      Selskapet har i ${em( companyDoc["company/:currentYear"] ) } ikke hatt noen ansatte og er således ikke pliktig til å ha tjenestepensjon for de ansatte etter Lov om obligatoriske tjenestepensjon. Det er ikke utdelt styrehonorar.
      <br><br>
      Kostnadsført revisjonshonorar for ${em( companyDoc["company/:currentYear"] ) } utgjør kr ${em( 0 ) }. Honorar for annen bistand fra revisor utgjør kr ${em( 0 ) }.
      
      
      
      <h4>Note 6: Bankinnskudd</h4>
      Posten inneholder kun frie midler.
      
      <h4>Note 7: Gjeld til nærstående, ledelse og styre</h4>
      Selskapet har gjeld til følgende nærstående personer: <br>
      ${shareholders.map( (shareholder, index) => em(`${index}: ${shareholder} <br>`)).join("")}
      
      `}
    } 
}

//WIP

let getTaxRecords = (accounts, taxRate) => {

  let accountingResultBeforeTax = Object.entries(accounts).filter( entry => Number(entry[0]) >= 3000 ).reduce( (sum, entry) => sum + entry[1].closingBalance.amount - entry[1].openingBalance.amount, 0 )

  let nonDeductibleAccounts = ['2030' , '5901' , '6726' , '7360' , '7410' , '7430' , '7791' , '8000' , '8002' , '8005' , '8006' , '8010' , '8020' , '8040' , '8071' , '8078' , '8080' , '8100' , '8110' , '8120' , '8140' , '8178'] //NB: changed 2036 to 2030. Which to  use for Stiftelseskost?

  let permanentDifferences = Object.entries(accounts).filter( entry => nonDeductibleAccounts.includes( entry[0] ) ).reduce( (sum, entry) => sum + entry[1].closingBalance.amount - entry[1].openingBalance.amount, 0 )

  let temporaryDifferences = 0

  let taxEstimateCorrection = accounts["8300"] ? accounts["8300"].closingBalance.amount : 0

  let taxResultBeforeUtilizedLosses = accountingResultBeforeTax + permanentDifferences + temporaryDifferences + taxEstimateCorrection

  let accumulatedLosses = accounts["2510"] ? accounts["2510"].closingBalance.amount : 0 //Må velge riktig konto

  let utilizedLosses = taxResultBeforeUtilizedLosses < 0 ? Math.max( taxResultBeforeUtilizedLosses * taxRate, accumulatedLosses ) : 0

  let taxResultAfterUtilizedLosses = taxResultBeforeUtilizedLosses + utilizedLosses

  let taxCost = taxResultAfterUtilizedLosses * - taxRate

  let taxRecords = [
      {"transaction/generic/account": "8300", "transaction/amount": taxCost, accountingResultBeforeTax, permanentDifferences, temporaryDifferences, taxEstimateCorrection, taxResultBeforeUtilizedLosses, accumulatedLosses, utilizedLosses, taxRate, taxCost, taxResultAfterUtilizedLosses},
      {"transaction/generic/account": "2500", "transaction/amount": -taxCost}, //Burde være eiendel hvis negativ
      {"transaction/generic/account": "2510", "transaction/amount": utilizedLosses}
  ]

  let taxTransaction = {
      type: "transactions",
      records: taxRecords
  }

  

  return taxTransaction
}

let getYearEndRecords = (accountsPostTax) => {

  let accountingResultAfterTax = Object.entries(accountsPostTax).filter( entry => Number(entry[0]) >= 3000 ).reduce( (sum, entry) => sum + entry[1].closingBalance.amount - entry[1].openingBalance.amount, 0 )

  let uncoveredLosses_before = accountsPostTax["2080"] ? accountsPostTax["2080"].openingBalance.amount : 0
  let otherEquity_before = accountsPostTax["2050"] ? accountsPostTax["2050"].openingBalance.amount : 0
  let sharePremium_before = accountsPostTax["2020"] ? accountsPostTax["2020"].openingBalance.amount : 0

  let uncoveredLosses = 0
  let otherEquity = 0
  let sharePremium = 0

  if( accountingResultAfterTax < 0 ){
      //Overskudd

      if( uncoveredLosses_before === 0 ){
          
          otherEquity = accountingResultAfterTax
          
  
      }else{
          
          if( uncoveredLosses_before > -accountingResultAfterTax ){

              uncoveredLosses = accountingResultAfterTax


          }else{

              uncoveredLosses = -uncoveredLosses_before
              otherEquity = accountingResultAfterTax + uncoveredLosses_before

          }

          
          
      }

      

  }else{
      //Underskudd

      if( otherEquity_before === 0 ){
          
          uncoveredLosses = accountingResultAfterTax //Overkurs bør også være med
          
  
      }else{
          
          if( otherEquity_before < -accountingResultAfterTax ){

              otherEquity = accountingResultAfterTax


          }else{

              otherEquity = -otherEquity_before
              uncoveredLosses = accountingResultAfterTax + otherEquity_before

          }

          
          
      }


  }


  let yearEndRecords = [
      {"transaction/generic/account": "8800", "transaction/amount": -accountingResultAfterTax},
      {"transaction/generic/account": "2050", "transaction/amount": otherEquity},
      {"transaction/generic/account": "2080", "transaction/amount": uncoveredLosses},
  ]

  let yearEndTransaction = {
      type: "transactions",
      records: yearEndRecords
  }

  

  return yearEndTransaction
}

let taxCostView = (financialYear) => {

  let taxCostRecord = financialYear.accounts["8300"].accountRecords[0]


  return d([
    d([ d( "Ordinært resultat før skattekostnad" ), d( format.amount( taxCostRecord.accountingResultBeforeTax ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    "<br>",
    d([ d( "Permanente forskjeller" ), d( format.amount( taxCostRecord.permanentDifferences ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Endring i midlertidige forskjeller" ), d( format.amount( taxCostRecord.temporaryDifferences ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Estimatavvik på feilberegnet skatt forrige år" ), d( format.amount( taxCostRecord.taxEstimateCorrection ), {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Skattegrunnlag før bruk av fremførbart underskudd" ), d( format.amount( taxCostRecord.taxResultBeforeUtilizedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    "<br>",
    d([ d( "Inngående fremførbart underskudd" ), d( format.amount( taxCostRecord.accumulatedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Benyttet fremførbart underskudd" ), d( format.amount( taxCostRecord.utilizedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Utgående fremførbart underskudd" ), d( format.amount( taxCostRecord.accumulatedLosses + taxCostRecord.utilizedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    "<br>",
    d([ d( "Skattegrunnlag etter bruk av fremførbart underskudd" ), d( format.amount( taxCostRecord.taxResultAfterUtilizedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    "<br>",
    d([ d( "Årets skattekostnad" ), d( format.amount( taxCostRecord.taxCost ) , {class: "numberCell"})], {class: "financialStatementsRow"})
  ])
}
