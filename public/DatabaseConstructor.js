
let newDatom = (entity, attribute, value, isAddition) => returnObject({entity, attribute, value, isAddition: isAddition === false ? false : true })

let changeToStringAttributes = (DB, Datoms) => Datoms.map( Datom => isNumber(Datom.attribute) ? newDatom(Datom.entity, DB.attrName(Datom.attribute), Datom.value, Datom.isAddition ) : Datom )

let validateDatomAttributeValues = ( DB, Datoms ) => Datoms.length > 0 && Datoms.every( Datom => {

    let attr = DB.attr(Datom.attribute)
    let isArray = DB.get( attr, 5823)

    let valueType = DB.get( attr , "attribute/valueType")

    if( isUndefined(attr) ){ return  log(true, {ERROR: "attr not defined:", Datom, attr}) }

    let attributeIsArray = isDefined( isArray )
      ? isArray
      : false

    let valueInArray = attributeIsArray ? Datom.value : [Datom.value]
    let valueTypeValidatorFunction = new Function("inputValue",  DB.get( valueType, "valueType/validatorFunctionString") )
    let isValid_entity = isNumber(Datom.entity) || isString(Datom.entity)
    let isValid_valueType = valueInArray.every( arrayValue => valueTypeValidatorFunction(arrayValue) ) 
    let isValid_attribute = true
    let isValid_notNaN = valueInArray.every( arrayValue => !Number.isNaN(arrayValue) )
    let isValid = ( isValid_entity && isValid_valueType && isValid_attribute && isValid_notNaN  )

    

    if( !isValid ){ log({ERROR: "validateDatomAttributeValues Did not pass validation", isValid, valueType, isValid_entity, isValid_valueType, isValid_notNaN, attributeIsArray, Datom}) }

    return isValid

  } )

let getEntityRetractionDatoms = (DB, entity) => {

  let Entity =  DB.get(entity)

  let allAttributes = Entity.Datoms.map( Datom => Datom.attribute ).filter( filterUniqueValues )

  let activeAttributes = allAttributes.filter( attribute => Entity.Datoms.filter( Datom => Datom.attribute === attribute ).slice( -1 )[0].isAddition )

  let retractionDatoms = activeAttributes.map( attribute => newDatom(entity, attribute, DB.get(entity, attribute), false ) )


 return retractionDatoms


}
let getEntitiesRetractionDatoms = (DB, entities) => isArray(entities) ? entities.map( entity => getEntityRetractionDatoms( DB, entity ) ).flat() : log([], {ERROR: "getEntitiesRetractionDatoms did not receive array", entities} )

const Transactor = {
    postTransaction: async (DB, Datoms) => {

      let datomsWithStringAttributes = changeToStringAttributes( DB, Datoms )
      let isValid = validateDatomAttributeValues( DB, datomsWithStringAttributes )

      let isAuthorized = true

      if( isValid && isAuthorized ){ 

        let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( datomsWithStringAttributes ) )
        
        let retractedEntities = serverResponse.filter( Entity => Entity.entity <= DB.getlatestActiveEntityID() )
          .filter( Entity => Entity.isActive === false )
          .map( updatedEntity => updatedEntity.entity )
        
        let changedEntities = serverResponse.filter( Entity => Entity.entity <= DB.getlatestActiveEntityID() )
          .filter( Entity => Entity.isActive === true )
          .map( updatedEntity => updatedEntity.entity )

        let newEntities = serverResponse.filter( Entity => Entity.entity > DB.getlatestActiveEntityID() ).map( updatedEntity => updatedEntity.entity )

        log( `postTransaction received ${serverResponse.length} updated entities`, {serverResponse, retractedEntities, changedEntities, newEntities} )

        if( serverResponse.length !== (retractedEntities.length + changedEntities.length + newEntities.length) ){return log( null, {error: `length mismatch`, serverResponse, retractedEntities, changedEntities, newEntities} ) } 

        let Entities = DB.Entities
          .filter( Entity => !retractedEntities.includes( Entity.entity ) )
          .map( Entity => changedEntities.includes( Entity.entity ) 
            ? serverResponse.find( changedEntity => changedEntity.entity === Entity.entity )
            : Entity 
          )
          .concat( serverResponse.filter( newEntity => newEntities.includes( newEntity.entity )  ) )

        let updatedDBsnapshot = mergerino( DB, {Entities} )
        let updatedDB = constructDatabase( updatedDBsnapshot )

        return updatedDB
         
        }
      else{
        console.log("DB.postTransaction did not pass validation.", {isValid, isAuthorized, Datoms, datomsWithStringAttributes})
        return DB;
      }

    },
    createEntity: async (DB, entityType, newEntityDatoms) => Transactor.postTransaction(DB, [newDatom("newEntity", "entity/entityType", entityType )].concat( Array.isArray(newEntityDatoms)  ? newEntityDatoms : [] ) ),
    updateEntity: async (DB, entity, attribute, value, isAddition) => Transactor.postTransaction(DB, log([newDatom(entity, attribute, value, isAddition)])),
    addValueEntry: async (DB, entity, attribute, newValue) => await Transactor.updateEntity( DB, entity, attribute, DB.get(entity, attribute).concat( newValue ) ),
    removeValueEntry: async (DB, entity, attribute, index) => await Transactor.updateEntity( DB, entity, attribute, DB.get(entity, attribute).filter( (Value, i) => i !== index  ) ),
    replaceValueEntry: async (DB, entity, attribute, index, newValue) => {
      let Values = DB.get(entity, attribute)
      return await Transactor.updateEntity( DB, entity, attribute, Values.slice(0, index ).concat( newValue ).concat( Values.slice(index + 1, Values.length ) ) )
    },
    retractEntities: async (DB, entities) => Transactor.postTransaction( DB, getEntitiesRetractionDatoms( DB, entities ) ),
    retractEntity: async (DB, entity) => Transactor.retractEntities(DB, [entity])
}

let constructDatabase = dbSnapshot => {

    let DB = dbSnapshot

    DB.attrName = (attribute, version) => isString( attribute )
    ? isDefined( DB.attrNames[attribute] )
      ? attribute
      : log(undefined, `[ DB.attrName(${attribute}) ]: Attribute ${attribute} does not exist`)
    : DB.isAttribute( attribute )
      ? DB.getDatomValue( attribute, "attr/name", version )
      : log(undefined, `[ DB.attrName(${attribute}) ]: Attribute ${attribute} does not exist`)
  
    DB.attr = attrName => isDefined(attrName) ? isNumber(attrName) ? attrName : DB.attrNames[attrName] : log(undefined, `[ DB.attr(${attrName}) ]: Proveded attribute name is undefined`)
    DB.isEntity = entity => DB.entities.includes(entity)
    DB.isAttribute = attribute => DB.attributes.includes( DB.attr(attribute) )
    DB.isEntityCalculatedField = calculatedField => DB.getAll(9815).includes( calculatedField )
    DB.isGlobalCalculatedField = calculatedField => DB.getAll(12551).includes( calculatedField )

    DB.getEntityDatoms = (entity, version) => DB.isEntity( entity, version )
      ? DB.Entities
          .find( Entity => Entity.entity === entity )
          .Datoms
          .filter( Datom => isDefined(version) ? Datom.tx <= version : true )
      : undefined

    DB.getEntityAttributeDatoms = (entity, attrName, version) => DB.getEntityDatoms( entity, version ).filter( Datom => Datom.attribute === attrName ).filter( serverDatom => isDefined(version) ? serverDatom.tx <= version : true )
  
    DB.getDatom = (entity, attrName, version) => DB.getEntityAttributeDatoms( entity, attrName, version).slice(-1)[0]

    DB.getDatomValue = (entity, attribute, version) => {
      let Datom = DB.getDatom( entity, attribute, version )
      return isDefined( Datom ) ? Datom.value : undefined
    }

    DB.getEntity = (entity, version) => DB.isEntity( entity )
      ? DB.Entities.find( Entity => Entity.entity === entity )
      : undefined
  

    DB.getlatestActiveEntityID = () => DB.entities.sort( (a,b) => a-b ).slice( -1 )[0]

    DB.getGlobalCalculatedDatom = calculatedField => DB.calculatedDatoms.find( calculatedDatom => isUndefined(calculatedDatom.entity) && calculatedDatom.calculatedField === calculatedField )

    DB.getGlobalCalculatedValue = calculatedField => {
      let cachedCalculatedDatom = DB.getGlobalCalculatedDatom( calculatedField )
      if(isDefined(cachedCalculatedDatom)){
        return cachedCalculatedDatom.value
      }else{
        let value = calculateGlobalCalculatedValue( DB, calculatedField )
        let calculatedDatom = { calculatedField, value }
        DB.calculatedDatoms = DB.calculatedDatoms.filter( calculatedDatom => !( isUndefined( calculatedDatom.entity )  && calculatedDatom.calculatedField === calculatedField) ).concat( calculatedDatom )
        return value
      }
    } 

    DB.getEntityCalculatedDatom = ( entity, calculatedField ) => DB.calculatedDatoms.find( calculatedDatom => calculatedDatom.entity === entity && calculatedDatom.calculatedField === calculatedField )

    DB.getEntityCalculatedValue = (entity, calculatedField) => {
      let cachedCalculatedDatom = DB.getEntityCalculatedDatom( entity, calculatedField )
      if(isDefined(cachedCalculatedDatom)){
        return cachedCalculatedDatom.value
      }else{
        let value = calculateEntityCalculatedValue( DB, entity, calculatedField )
        let calculatedDatom = { entity, calculatedField, value }
        DB.calculatedDatoms = DB.calculatedDatoms.filter( calculatedDatom => !(calculatedDatom.entity === entity && calculatedDatom.calculatedField === calculatedField) ).concat( calculatedDatom )
        return value
      }
    } 
  
    DB.getAll = entityType => DB.Entities.filter( serverEntity => serverEntity.entityType === entityType ).map(E => E.entity)

    DB.get = (entity, attribute, version) => {
      if( isNull(entity) && DB.isGlobalCalculatedField(attribute) ){ return DB.getGlobalCalculatedValue( attribute ) }
      else if( DB.isEntity(entity) ){
            if( isDefined(attribute) ){
              if( DB.isAttribute(attribute) ){ return DB.getDatomValue( entity, DB.attrName(attribute), version ) }
              else if ( DB.isEntityCalculatedField(attribute) ){ 
                if( DB.get(entity, "entity/entityType") === DB.get(attribute, 8357) ) { return DB.getEntityCalculatedValue( entity, attribute ) }  
                else{ return log(undefined, `DB.getEntityCalculatedValue ERROR: ${entity} does not have the type required by ${attribute}.`) }
              }
              }else { return DB.getEntity(entity) }
      }
      else{ return log(undefined, `[ DB.get(${entity}, ${attribute}, ${version}) ]: Entity does not exist`) }
    }



    DB.Entities = DB.Entities.filter( serverEntity => serverEntity.isActive === true )
    DB.entities = DB.Entities.map( serverEntity => serverEntity.entity )
    DB.calculatedDatoms = []
    DB.attributes = DB.Entities
      .filter( Entity => DB.isEntity( Entity.entity ) )
      .filter( Entity => DB.getDatomValue( Entity.entity, "entity/entityType" ) === 42 )
      .map( Datom => Datom.entity ).filter( filterUniqueValues ).sort( ( a,b ) => a - b )
    DB.attrNames = mergerino( {}, DB.attributes.map( attribute => returnObject({[DB.getDatomValue( attribute, "attr/name" )]: attribute })  ) )

    return DB
}


let calculateGlobalCalculatedValue = ( DB, calculatedField ) => tryFunction( () => new Function( [`Database`] , DB.get(calculatedField, 6792 ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") )( DB ) )
let calculateEntityCalculatedValue = ( DB, entity, calculatedField ) => tryFunction( () => new Function( [`Database`, `Entity`] , DB.get(calculatedField, 6792 ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") )( DB, {entity: entity,get: attr => DB.get(entity, attr)} ) )

let getReportFieldValue = ( DB, company, reportField, yearEndEvent ) => DB.get( reportField, 8361 ) === 8662
  ? tryFunction( () => new Function( [`Database`, `Company`, `Entity`], DB.get(reportField, 8662).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") )( DB, mergerino( DB.get(company), {t: State.DB.get(yearEndEvent, 10502) }), DB.get(yearEndEvent) ) )
  : DB.get( reportField, 8361 ) === 5030
    ? DB.get(company, 12392)( DB.get(reportField, 13150), State.DB.get(yearEndEvent, 11975) - 1 )
    : null


//New version: