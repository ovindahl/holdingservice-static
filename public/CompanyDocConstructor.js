



let constructCompany = (DB, company ) => {

    let dbCompany = {
        entity: company,
        tx: DB.tx //Burde være tx fra siste update i selskapets event/prosess/company, da har man en uniform vesionering
      }
    
      dbCompany.t = 0
      dbCompany.companyDatoms = [];
      dbCompany.entities = [];
      dbCompany.calculatedFieldObjects = [];
      dbCompany.events = DB.getAll(46)
        .filter( event => DB.get( DB.get(event, "event/process"), "process/company" ) === company  )
        .sort(  (a,b) => DB.get(a, 'event/date' ) - DB.get(b, 'event/date' ) )
    
        dbCompany.processes = DB.getAll(5692).filter( process => DB.get(process , 'process/company' ) === company  ).sort( (processA, processB) => {
        let processEventsA = dbCompany.events.filter( e => DB.get(e, "event/process") === processA )
        let firstEventA = processEventsA[0]
        let firstEventDateA = isDefined(firstEventA) ? DB.get(firstEventA, 'event/date') : Date.now()
        let processEventsB = dbCompany.events.filter( e => DB.get(e, "event/process") === processB )
        let firstEventB = processEventsB[0]
        let firstEventDateB = isDefined(firstEventB ) ? DB.get(firstEventB , 'event/date') : Date.now()
        return firstEventDateA - firstEventDateB;
      })
    
    
      dbCompany.latestEntityID = 0;
    
      let eventsToConstruct = dbCompany.events.filter( event => DB.get(  DB.get(event, "event/eventTypeEntity"), "eventType/newEntities" ).length > 0 )
  
      let constructedCompany = applyCompanyEvents( DB, dbCompany, eventsToConstruct )
  
      return createCompanyQueryObject( DB, constructedCompany )

}

//Updated Company Construction pipeline

let constructEntity = ( DB, Company, Process, Event, entityConstructor, index) => {

  let processType = Process.get("process/processType" )
  let processTypeSharedStatements = DB.get( processType, "processType/sharedStatements")
    ? DB.get( processType, "processType/sharedStatements" ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] )
    : []

  let eventType = Event.get("event/eventTypeEntity" )
  let eventTypeSharedStatements = DB.get( eventType, "eventType/sharedStatements" ) 
  ? DB.get( eventType, "eventType/sharedStatements" ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] )
  : []



  let sharedStatements = processTypeSharedStatements.concat(eventTypeSharedStatements)

  let sharedStatementsString = (sharedStatements.length > 0) ? sharedStatements.join(";") + ";" : ""

  let companyEntityType = entityConstructor.companyEntityType
  let attributeAssertions = entityConstructor.attributeAssertions

  let entity = Company.latestEntityID + index + 1

  let generatedyDatoms =  DB.get( companyEntityType , "companyEntityType/attributes") 
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

    try {companyDatom.value = new Function( [`Database`, `Company`, `Process`, `Event`], functionString )( DB, Company, Process, Event ) }  //NB: SOme event types are using Database (eg. "Relasjon til selskapet"). Should only go through Company?
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
  
let createCompanyQueryObject = (DB, Company) => {

    Company.getAll = (entityType, t) => {

        let matchingDatoms = Company.companyDatoms
        .filter( companyDatom => companyDatom.attribute === 6781 )
        .filter( companyDatom => companyDatom.value === entityType )
        .filter( companyDatom => isDefined(t) ? companyDatom.t <= t : true )

        let entities = isDefined(entityType)
          ? isDefined( matchingDatoms ) 
            ? matchingDatoms.map(  companyDatom => companyDatom.entity ).filter( filterUniqueValues )
            : []
          : Company.companyDatoms.map(  companyDatom => companyDatom.entity ).filter( filterUniqueValues )

        return entities
    } 
        

    Company.getDatom = ( entity, attribute, t ) => Company.companyDatoms
      .filter( companyDatom => companyDatom.entity === entity )
      .filter( companyDatom => companyDatom.attribute === attribute )
      .filter( companyDatom => isDefined(t) ? companyDatom.t <= t : true )
      .slice( -1 )[0]

    Company.getCalculatedFieldObject = (companyEntity, calculatedField, t ) => Company.calculatedFieldObjects
      .filter( calculatedFieldObject => calculatedFieldObject.companyEntity === companyEntity && calculatedFieldObject.calculatedField === calculatedField  )
      .filter( companyDatom => isDefined(t) ? companyDatom.t <= t : true )
      .slice( -1 )[0]

    Company.getEntity = ( entity, attribute, t ) => {

            let CompanyEntity = {
              entity,
              companyEntityType: Company.companyDatoms[0].value,
              companyDatoms: Company.companyDatoms.filter( companyDatom => companyDatom.entity === entity )
          }



      CompanyEntity.get = attr => {

          if( DB.get(attr, "entity/entityType") === 42 ){

          let matchingDatoms = CompanyEntity.companyDatoms.filter( companyDatom => companyDatom.attribute === attr )

          let latestDatom = matchingDatoms.length > 0 ? matchingDatoms.slice( -1 )[0] : undefined

          let value = isDefined(latestDatom) ?  latestDatom.value : undefined
          return value

          }else if ( DB.get(attr, "entity/entityType") === 5817 ){

          let calculatedFieldObject = Company.getCalculatedFieldObject(CompanyEntity. entity, attr )

          return isDefined( calculatedFieldObject ) 
              ? calculatedFieldObject.value 
              : DB.get(attribute, "attribute/isArray" ) ? [] : undefined

          }else{ return log(undefined, {info: "ERROR: CompanyEntity.get(), attr is not attribute or calculcatedField", CompanyEntity, attr }) }

          

      } 
      CompanyEntity.getOptions = attr => DB.getCompanyOptionsFunction( attr )( Company, CompanyEntity )


      CompanyEntity.event = CompanyEntity.companyDatoms[0].event


      CompanyEntity.companyEntityType = CompanyEntity.get(6781)

      CompanyEntity.label = () => `${DB.get( CompanyEntity.companyEntityType, "entity/label")} # ${Company.getAll(CompanyEntity.companyEntityType).findIndex( e => e === CompanyEntity.entity) + 1}`

      return CompanyEntity
    }


    Company.get = (entity, attribute, t ) => {

      if(isUndefined(attribute)){ return Company.getEntity( entity, attribute, t ) }

      if(DB.get(attribute, "entity/entityType") === 42){
        let companyDatom = Company.getDatom( entity, attribute, t )
        return isDefined( companyDatom ) ? companyDatom.value : undefined
      }else{
        let calculatedFieldObject = Company.getCalculatedFieldObject( entity, attribute, t )
        return isDefined( calculatedFieldObject ) 
            ? calculatedFieldObject.value 
            : DB.get(attribute, "attribute/isArray" ) ? [] : undefined
      }
      
    }



    Company.getProcess = (process, t) => {

        let Process = DB.get( process )
        Process.events = Company.events.filter( event => DB.get(event, "event/process") === process )
        Process.companyDatoms = Company.companyDatoms.filter( companyDatom => companyDatom.process === process ).filter( companyDatom => isDefined(t) ? companyDatom.t <= t : true )
        Process.entities = Process.companyDatoms.map( companyDatom => companyDatom.entity ).filter( filterUniqueValues )

        

        Process.label = () => `[${DB.get( Process.get("process/accountingYear") ).label()}/P-${Company.processes.findIndex( p => p === process ) + 1}] ${DB.get( Process.get("process/processType") ).label()}`

        Process.getFirstEvent = () => Company.getEvent( Process.events[0] )
        
        return Process
    }

    Company.getEvent = event => {

        let Event = DB.get( event )
        Event.t =  Company.events.findIndex( e => e === event ) + 1
        Event.process = Event.get("event/process")
        Event.companyDatoms = Company.companyDatoms.filter( companyDatom => companyDatom.event === event )
        Event.entities = Event.companyDatoms.map( companyDatom => companyDatom.entity ).filter( filterUniqueValues )


        //Event.label = () => `[${DB.get( DB.get( Event.process ).get("process/accountingYear") ).label()}/H-${Company.events.findIndex( e => e === event ) + 1}] ${DB.get( Event.get("event/eventTypeEntity") ).label()}`
        Event.label = () => `${DB.get( Event.get("event/eventTypeEntity") ).label()}`

        let processEvents = Company.events.filter( event => DB.get(event, "event/process") === Event.process )
        let prevEvent = processEvents[  processEvents.findIndex( e => e  === event ) - 1 ]
        Event.getPrevEvent = () => Company.getEvent( prevEvent )

        return Event
    }

    Company.calculateCompanyCalculatedField = (calculatedField, t) => {

      let newValueFunctionString = DB.get( calculatedField, 6792 ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";")
  
      let value;
      try {value = new Function( [`Company`, `Process`, `Event`, `Entity`], newValueFunctionString )( Company, undefined, undefined, undefined ) } 
        catch (error) {value = log(error,{info: " Company.calculateCompanyCalculatedField()", Company, calculatedField, newValueFunctionString}) }
    
      return value;




    }


return Company

}
  
let applyCompanyEvents = ( DB, dbCompany, eventsToConstruct ) => eventsToConstruct.reduce( (prevCompany, event) => {

    let t = prevCompany.t + 1
    let eventType = DB.get( event, "event/eventTypeEntity" )
    let process = DB.get(event, "event/process")

    prevCompany = createCompanyQueryObject( DB, prevCompany)
    
    
  
    let Event = prevCompany.getEvent( event )
    let Process = prevCompany.getProcess( process )
  
  
    ///// Constructiong through events
  
    let eventDatoms = DB.get( eventType, "eventType/newEntities" ) ? DB.get( eventType, "eventType/newEntities" ).map( (entityConstructor, index) => constructEntity( DB, prevCompany, Process, Event, entityConstructor, index ) ).flat() : []

    //log({t, Event, eventDatoms})

    let Company = createCompanyQueryObject( DB, {
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
  
  
    Company.calculatedFieldObjects = getCompanyCalculatedFields( DB, Company, Process, Event ) 
  
  
    return Company
    }, dbCompany )
  
let getCompanyCalculatedFields = (DB, Company, Process, Event) => Company.entities.reduce( ( calculatedFieldObjects, companyEntity ) => {
  
  
    let eventCalculatedFields = calculateCalculatedFieldObjects( DB, Company, Process, Event, companyEntity)
    
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
  
let calculateFieldValue = (DB, Company, Process, Event, CompanyEntity, calculatedField ) => {
  
    let newValueFunctionString = DB.get( calculatedField, 6792 ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";")
  
    let value;
    try {value = new Function( [`Company`, `Process`, `Event`, `Entity`], newValueFunctionString )( Company, Process, Event, CompanyEntity ) } 
      catch (error) {value = log(error,{info: "calculateFieldValue(Company, Process, Event, CompanyEntity, valueFunctionString) failed", Company, Process, Event, CompanyEntity, newValueFunctionString}) }
  
    return value;
}
  
let calculateCalculatedFieldObjects = (DB, Company, Process, Event, companyEntity) => {
  
  
    let CompanyEntity = Company.get( companyEntity )
  
    let entityTypeCalculatedFields = DB.get( CompanyEntity.companyEntityType , "companyEntityType/calculatedFields" )
    
  
    let calculatedFieldObjects = entityTypeCalculatedFields.map( calculatedField => returnObject({
      company: Company.entity, companyEntity, calculatedField, t: Event.t, 
      value: calculateFieldValue( DB, Company, Process, Event, CompanyEntity, calculatedField )
    }) )  
  
    return calculatedFieldObjects;
  
}
  
  //Updated Company Construction pipeline -- END