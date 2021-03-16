
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
        
        let retractedEntities = serverResponse.filter( Entity => Entity.isActive === false ).map( updatedEntity => updatedEntity.entity )
        
        let changedEntities = serverResponse.filter( Entity => Entity.entity <= DB.getlatestActiveEntityID() ).filter( Entity => Entity.isActive === true ).map( updatedEntity => updatedEntity.entity )

        let newEntities = serverResponse.filter( Entity => Entity.entity > DB.getlatestActiveEntityID() ).map( updatedEntity => updatedEntity.entity )

        if( serverResponse.length !== (retractedEntities.length + changedEntities.length + newEntities.length) ){return log( null, {error: `length mismatch`, serverResponse, retractedEntities, changedEntities, newEntities} ) } 

        let Entities = DB.Entities
          .filter( Entity => Entity.isActive === true )
          .map( Entity => changedEntities.includes( Entity.entity ) 
            ? serverResponse.find( changedEntity => changedEntity.entity === Entity.entity )
            : Entity 
          )
          .concat( serverResponse.filter( newEntity => newEntities.includes( newEntity.entity )  ) )

        let entities = Entities.map( serverEntity => serverEntity.entity )

        let attributes = Entities.filter( Entity => Entity.entityType === 42 ).map( Datom => Datom.entity ).filter( filterUniqueValues ).sort( ( a,b ) => a - b )

        let attrNames = mergerino( {}, attributes.map( attribute => returnObject({ [ Entities.find( Entity => Entity.entity === attribute ).Datoms.filter( Datom => Datom.attribute === "attr/name" ).slice( -1 )[0].value ]: attribute })  ) )

        let calculatedDatoms = []

        let updatedDBsnapshot = mergerino( DB, {Entities, entities, attributes, attrNames, calculatedDatoms} )
        
        

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
      ? mergerino( 
        {label: DB.get( entity, 6 ) },  
        {typeLabel: DB.get( DB.get( entity, "entity/entityType" ), 6) },  
        DB.Entities.find( Entity => Entity.entity === entity ) ) 
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

    

    return DB
}


let calculateGlobalCalculatedValue = ( DB, calculatedField ) => tryFunction( () => new Function( [`Database`] , DB.get(calculatedField, 6792 ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") )( DB ) )
let calculateEntityCalculatedValue = ( DB, entity, calculatedField ) => tryFunction( () => new Function( [`Database`, `Entity`] , DB.get(calculatedField, 6792 ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") )( DB, {entity: entity,get: attr => DB.get(entity, attr)} ) )

let getReportFieldValue = ( DB, company, reportField, yearEndEvent ) => DB.get( reportField, 8361 ) === 8662
  ? tryFunction( () => new Function( [`Database`, `Company`, `Entity`], DB.get(reportField, 8662).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") )( DB, mergerino( DB.get(company), {t: State.DB.get(yearEndEvent, 10502) }), DB.get(yearEndEvent) ) )
  : DB.get( reportField, 8361 ) === 5030
    ? DB.get(company, 12392)( DB.get(reportField, 13150), State.DB.get(yearEndEvent, 11975) - 1 )
    : null



//Pure DB functions ( TBD )


let addDatomsToDBSnapshot = (DB, newDatoms) => {


  let datomEntities = newDatoms.map( Datom => Datom.entity ).filter( filterUniqueValues )

  let updatedEntities = DB.Entities
      .map( Entity => datomEntities.includes( Entity.entity )
          ? constructEntity( Entity.Datoms.concat( newDatoms.filter( Datom => Datom.entity === Entity.entity ) ), Entity.entity  )
          : Entity )

  let newEntities = datomEntities.filter( entity => entity > DB.latestEntityID  ).map( entity => constructEntity( newDatoms.filter( Datom => Datom.entity === entity ), entity  ) )

  let Entities = updatedEntities.concat( newEntities ).filter( Entity => Entity.isActive === true )
      
  let computedTx = newDatoms.slice( -1 )[ 0 ].tx

  let tx = computedTx > DB.tx ? computedTx : DB.tx

  let newDatoms_latestEntityID = datomEntities.reduce( (max, element) => Math.max(max, element), 0 );

  let latestEntityID = newDatoms_latestEntityID > DB.latestEntityID ? newDatoms_latestEntityID : DB.latestEntityID
  
  let updatedDBSnapshot = { Entities, tx, latestEntityID, created: Date.now(), label: "Snapshot av alle datomer per valgt tx." }
  updatedDBSnapshot.entities = Entities.map( Entity => Entity.entity )
  updatedDBSnapshot.attributes = updatedDBSnapshot.Entities.filter( Entity => Entity.entityType === 42 ).map( Datom => Datom.entity ).filter( filterUniqueValues ).sort( ( a,b ) => a - b )
  updatedDBSnapshot.attrNames = mergerino( {}, updatedDBSnapshot.attributes.map( attribute => returnObject({[getDatomValue( updatedDBSnapshot, attribute, "attr/name" )]: attribute })  ) )
  updatedDBSnapshot.calculatedDatoms = []
  
  return updatedDBSnapshot

}


let isEntity = (dbSnapshot, entity) => isDefined( dbSnapshot.Entities.find( Entity => Entity.entity === entity ) )

let isActiveEntity = (dbSnapshot, entity, version) => isEntity( dbSnapshot, entity )
        ? dbSnapshot.Entities.find( Entity => Entity.entity === entity ).isActive
        : false

let getEntityDatoms = (dbSnapshot, entity, version) => isActiveEntity( dbSnapshot, entity, version )
  ? dbSnapshot.Entities.find( Entity => Entity.entity === entity ).Datoms.filter( Datom => isDefined(version) ? Datom.tx <= version : true )
  : undefined

let getEntityAttributeDatoms = (dbSnapshot, entity, attrName, version) => getEntityDatoms( dbSnapshot, entity, version ).filter( Datom => Datom.attribute === attrName )

let getDatom = (dbSnapshot, entity, attrName, version) => getEntityAttributeDatoms( dbSnapshot, entity, attrName, version ).slice(-1)[0]

let getDatomValue = (dbSnapshot, entity, attrName, version) => {
  let Datom = getDatom( dbSnapshot, entity, attrName, version )
  if( isUndefined(Datom) || Datom.isAddition === false ){ return undefined }
  else{ return Datom.value }
}

let getEntity = (dbSnapshot, entity, version) => isActiveEntity( dbSnapshot, entity, version ) ? dbSnapshot.Entities.find( Entity => Entity.entity === entity ) : undefined

let isAttribute = (dbSnapshot, attribute) => dbSnapshot.attributes.includes( attribute )
let isEntityCalculatedField = (dbSnapshot, calculatedField, version) => getAllFromDB(dbSnapshot, 9815 ).includes( calculatedField )
let isGlobalCalculatedField = (dbSnapshot, calculatedField, version) => getAllFromDB(dbSnapshot, 12551 ).includes( calculatedField )


let isAttrName = (dbSnapshot, attrName, version) => isNumber( dbSnapshot.attrNames[ attrName ] )

let attrName = (dbSnapshot, attribute, version) => isAttribute( dbSnapshot, attribute, version )
      ? getDatomValue( dbSnapshot, attribute, "attr/name", version )
      : isAttrName( dbSnapshot, attribute )
          ? attribute
          : undefined
  
let attr = (dbSnapshot, attrName, version) => isAttrName( dbSnapshot, attrName ) 
      ? dbSnapshot.attrNames[ attrName ]
      : isAttribute( dbSnapshot, attrName, version ) 
          ? attrName 
          : undefined

let getAllFromDB = ( dbSnapshot, entityType ) => dbSnapshot.Entities.filter( Entity => Entity.entityType === entityType )

let getEntityType = ( dbSnapshot, entity, version) => getDatomValue( dbSnapshot, entity, "entity/entityType", version )

let getFromDB = ( dbSnapshot, entity, attribute, version) => {
  if( isNull(entity) && isGlobalCalculatedField( dbSnapshot, attribute, version ) ){ return "TBD" }
  else if( isEntity( dbSnapshot, entity ) ){
      if( isUndefined( attribute ) ){ return getEntity( dbSnapshot, entity, version) }
      else { 
          if( isAttribute(  dbSnapshot, attr( dbSnapshot, attribute ) ) ){ return getDatomValue( dbSnapshot, entity, attrName( dbSnapshot, attribute, version ) , version ) }
          else if ( isEntityCalculatedField( dbSnapshot, attribute ) ){ 
              if( getEntityType( dbSnapshot, entity, version ) === getDatomValue( dbSnapshot, attribute, "calculatedField/entityType", version ) ) { return "TBD" }
              else{ return log(undefined, `DB.getEntityCalculatedValue ERROR: ${entity} does not have the type required by ${attribute}.`) }
          }
      }
      }else{ return log(undefined, `[ DB.get(${entity}, ${attribute}, ${version}) ]: Entity does not exist`) }

}

