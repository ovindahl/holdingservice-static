let constructCompanyDocument = (receivedDatabase, company ) => {

    let dbCompany = {
        entity: company,
        tx: receivedDatabase.tx //Burde være tx fra siste update i selskapets event/prosess/company, da har man en uniform vesionering
      }
    
      dbCompany.t = 0
      dbCompany.companyDatoms = [];
      dbCompany.entities = [];
      dbCompany.calculatedFieldObjects = [];
      dbCompany.events = receivedDatabase.getAll(46)
        .filter( event => receivedDatabase.get( receivedDatabase.get(event, "event/process"), "process/company" ) === company  )
        .sort(  (a,b) => receivedDatabase.get(a, 'event/date' ) - receivedDatabase.get(b, 'event/date' ) )
    
        dbCompany.processes = receivedDatabase.getAll(5692).filter( process => receivedDatabase.get(process , 'process/company' ) === company  ).sort( (processA, processB) => {
        let processEventsA = dbCompany.events.filter( e => receivedDatabase.get(e, "event/process") === processA )
        let firstEventA = processEventsA[0]
        let firstEventDateA = isDefined(firstEventA) ? receivedDatabase.get(firstEventA, 'event/date') : Date.now()
        let processEventsB = dbCompany.events.filter( e => receivedDatabase.get(e, "event/process") === processB )
        let firstEventB = processEventsB[0]
        let firstEventDateB = isDefined(firstEventB ) ? receivedDatabase.get(firstEventB , 'event/date') : Date.now()
        return firstEventDateA - firstEventDateB;
      })
    
    
      dbCompany.latestEntityID = 0;
    
      let eventsToConstruct = dbCompany.events.filter( event => receivedDatabase.get(  receivedDatabase.get(event, "event/eventTypeEntity"), "eventType/newEntities" ).length > 0 )
  
      let constructedCompany = applyCompanyEvents( receivedDatabase, dbCompany, eventsToConstruct )
  
      return constructedCompany

}

//Updated Company Construction pipeline

let constructEntity = ( receivedDatabase, Company, Process, Event, entityConstructor, index) => {

  let eventType = Event.get("event/eventTypeEntity" )
  let sharedStatements = receivedDatabase.get( eventType, "eventType/sharedStatements" ) 
    ? receivedDatabase.get( eventType, "eventType/sharedStatements" ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") 
    : []

  let sharedStatementsString = (sharedStatements.length > 0) ? sharedStatements + ";" : ""


  let companyEntityType = entityConstructor.companyEntityType
  let attributeAssertions = entityConstructor.attributeAssertions

  let entity = Company.latestEntityID + index + 1

  let generatedyDatoms =  receivedDatabase.get( companyEntityType , "companyEntityType/attributes") 
    .filter( attr => isUndefined( attributeAssertions[ attr ] ) 
      ? false 
      : isUndefined( attributeAssertions[ attr ].isEnabled )
        ? false
        : attributeAssertions[ attr ].isEnabled
        )
    .map(  attr => {

    let companyDatom = {
      entity, company: Company.entity, process: Process.entity , event: Event.entity, t: Event.t,
      attribute: attr
    }

    let valueFunctionString = attributeAssertions[ attr ].valueFunction

    let functionString = sharedStatementsString + valueFunctionString;

    try {companyDatom.value = new Function( [`Company`, `Process`, `Event`], functionString )( Company, Process, Event ) } 
    catch (error) {companyDatom.value = log(error,{info: "constructEntity(Company, Process, Event, entityConstructor) failed", Company, Process, Event, sharedStatements, valueFunctionString, functionString}) }

    return companyDatom
  } )

  let companyEntityTypeDatom = {
    entity, company: Company.entity, process: Process.entity , event: Event.entity, t: Event.t,
    attribute: 6781,
    value: companyEntityType
  }


  let entityDatoms = [companyEntityTypeDatom].concat(generatedyDatoms)

  return entityDatoms
}
  
let createCompanyQueryObject = (receivedDatabase, Company) => {

    Company.getAll = entityType => {

        let matchingDatoms = Company.companyDatoms
        .filter( companyDatom => companyDatom.attribute === 6781 )
        .filter( companyDatom => companyDatom.value === entityType )

        let entities = isDefined( matchingDatoms ) 
        ? matchingDatoms.filter( filterUniqueValues ).map(  companyDatom => companyDatom.entity )
        : []

        return entities
    } 
        

    Company.getDatom = (entity, attribute ) => Company.companyDatoms
    .filter( companyDatom => companyDatom.entity === entity )
    .filter( companyDatom => companyDatom.attribute === attribute )
    .slice( -1 )[0]

    Company.getCalculatedFieldObject = (companyEntity, calculatedField) => Company.calculatedFieldObjects
        .filter( calculatedFieldObject => calculatedFieldObject.companyEntity === companyEntity && calculatedFieldObject.calculatedField === calculatedField  )
        .slice( -1 )[0]


    Company.get = (entity, attribute ) => {

        if(isUndefined(attribute)){
        let CompanyEntity = {
            entity,
            companyDatoms: Company.companyDatoms.filter( companyDatom => companyDatom.entity === entity )
        }
    

    
    CompanyEntity.get = attr => {

        if( receivedDatabase.get(attr, "entity/entityType") === 42 ){

        let matchingDatoms = CompanyEntity.companyDatoms.filter( companyDatom => companyDatom.attribute === attr )

        let latestDatom = matchingDatoms.length > 0 ? matchingDatoms.slice( -1 )[0] : undefined

        let value = isDefined(latestDatom) ?  latestDatom.value : undefined
        return value

        }else if ( receivedDatabase.get(attr, "entity/entityType") === 5817 ){

        let calculatedFieldObject = Company.getCalculatedFieldObject(CompanyEntity. entity, attr )

        return isDefined( calculatedFieldObject ) 
            ? calculatedFieldObject.value 
            : receivedDatabase.get(attribute, "attribute/isArray" ) ? [] : undefined

        }else{ return log(undefined, {info: "ERROR: CompanyEntity.get(), attr is not attribute or calculcatedField", CompanyEntity, attr }) }

        

    } 
    CompanyEntity.getOptions = attr => receivedDatabase.getCompanyOptionsFunction( attr )( Company, CompanyEntity )




    CompanyEntity.event = CompanyEntity.companyDatoms[0].event


    CompanyEntity.companyEntityType = CompanyEntity.get(6781)

    return CompanyEntity
    }

    if(receivedDatabase.get(attribute, "entity/entityType") === 42){
    let companyDatom = Company.getDatom(entity, attribute )
    return isDefined( companyDatom ) ? companyDatom.value : undefined
    }else{
    let calculatedFieldObject = Company.getCalculatedFieldObject(entity, attribute )
    return isDefined( calculatedFieldObject ) 
        ? calculatedFieldObject.value 
        : receivedDatabase.get(attribute, "attribute/isArray" ) ? [] : undefined
    }
    
    } 



    Company.getProcess = process => {
        let Process = receivedDatabase.get( process )
        Process.events = Company.events.filter( event => receivedDatabase.get(event, "event/process") === process )
        Process.getFirstEvent = () => Company.getEvent( Process.events[0] )
        Process.isValid = () => true
        Process.getCriteria = () => []
        
        return Process
    }

    Company.getEvent = event => {

        let Event = receivedDatabase.get( event )
        Event.t =  Company.events.findIndex( e => e === event ) + 1
        Event.process = Event.get("event/process")
        Event.entities = Company.entities.filter( companyEntity => Company.getDatom(companyEntity, 6781).event === event )
        let processEvents = Company.events.filter( event => receivedDatabase.get(event, "event/process") === Event.process )
        let prevEvent = processEvents[  processEvents.findIndex( e => e  === event ) - 1 ]
        Event.getPrevEvent = () => Company.getEvent( prevEvent )

        return Event
    }


return Company

}
  
let applyCompanyEvents = ( receivedDatabase, dbCompany, eventsToConstruct ) => eventsToConstruct.reduce( (prevCompany, event) => {

    let t = prevCompany.t + 1
    let eventType = receivedDatabase.get( event, "event/eventTypeEntity" )
    let process = receivedDatabase.get(event, "event/process")

    prevCompany = createCompanyQueryObject( receivedDatabase, prevCompany)
    
    
  
    let Event = prevCompany.getEvent( event )
    let Process = prevCompany.getProcess( process )
  
  
    ///// Constructiong through events
  
    let eventDatoms = receivedDatabase.get( eventType, "eventType/newEntities" ) ? receivedDatabase.get( eventType, "eventType/newEntities" ).map( (entityConstructor, index) => constructEntity( receivedDatabase, prevCompany, Process, Event, entityConstructor, index ) ).flat() : []

    //log({t, Event, eventDatoms})

    let Company = createCompanyQueryObject( receivedDatabase, {
      entity: prevCompany.entity,
      tx: prevCompany.tx,
      t,
      events: prevCompany.events,
      processes: prevCompany.processes,
      calculatedFieldObjects: prevCompany.calculatedFieldObjects, //Frem til de oppdateres
      companyDatoms: prevCompany.companyDatoms.concat( eventDatoms ),
      entities: eventDatoms.reduce( (entities, datom) => entities.includes( datom.entity ) ? entities : entities.concat(datom.entity), prevCompany.entities ),
      latestEntityID: eventDatoms.reduce( (maxEntity, eventDatom) => eventDatom.entity > maxEntity ? eventDatom.entity : maxEntity, prevCompany.latestEntityID  ),
    })
  
  
    Company.calculatedFieldObjects = getCompanyCalculatedFields( receivedDatabase, Company, Process, Event ) 
  
  
    return Company
    }, dbCompany )
  
let getCompanyCalculatedFields = (receivedDatabase, Company, Process, Event) => Company.entities.reduce( ( calculatedFieldObjects, companyEntity ) => {
  
  
    let eventCalculatedFields = calculateCalculatedFieldObjects( receivedDatabase, Company, Process, Event, companyEntity)
    
    let changedFields = eventCalculatedFields.filter( calculatedFieldObject => {
  
      let prevValueObject = Company.calculatedFieldObjects.find( calculatedField => calculatedField.companyEntity === companyEntity && calculatedField.calculatedField === calculatedField  )
  
      let noPrevValue = isUndefined( prevValueObject )
  
      let valueHasChanged = noPrevValue 
        ? true
        : calculatedFieldObject.value !== prevValueObject.value
  
      return valueHasChanged
    } )
  
    let updatedCalculatedFields = calculatedFieldObjects.concat(changedFields)
      
    return updatedCalculatedFields
    
  } , Company.calculatedFieldObjects )
  
let calculateFieldValue = (receivedDatabase, Company, Process, Event, CompanyEntity, calculatedField ) => {
  
    let newValueFunctionString = receivedDatabase.get( calculatedField, 6792 ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";")
  
    let value;
    try {value = new Function( [`Company`, `Process`, `Event`, `Entity`], newValueFunctionString )( Company, Process, Event, CompanyEntity ) } 
      catch (error) {value = log(error,{info: "calculateFieldValue(Company, Process, Event, CompanyEntity, valueFunctionString) failed", Company, Process, Event, CompanyEntity, newValueFunctionString}) }
  
    return value;
}
  
let calculateCalculatedFieldObjects = (receivedDatabase, Company, Process, Event, companyEntity) => {
  
  
    let CompanyEntity = Company.get( companyEntity )
  
    let entityTypeCalculatedFields = receivedDatabase.get( CompanyEntity.companyEntityType , "companyEntityType/calculatedFields" )
    
  
    let calculatedFieldObjects = entityTypeCalculatedFields.map( calculatedField => returnObject({
      company: Company.entity, companyEntity, calculatedField, t: Event.t, 
      value: calculateFieldValue( receivedDatabase, Company, Process, Event, CompanyEntity, calculatedField )
    }) )  
  
    return calculatedFieldObjects;
  
}
  
  //Updated Company Construction pipeline -- END
  
  
  
  
  
  
  
  
  
  
  
  
  