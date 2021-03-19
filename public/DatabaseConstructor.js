//Transactor

let newDatom = (entity, attribute, value, isAddition) => validateDatomFormat( returnObject({entity, attribute, value, isAddition: isAddition === false ? false : true }) ) 
  ? returnObject({entity, attribute, value, isAddition: isAddition === false ? false : true }) 
  : log(null, {ERROR: "invalid datom format:", entity, attribute, value, isAddition})

const Transactor = {
    postTransaction: async (dbSnapshot, Datoms) => {

      let preparedDatoms = Datoms

      if( Datoms.some( Datom => isNumber(Datom.attribute) ) ){ log({ERROR: "Attribute is number:", Datom, Datoms}) }

      let isValid = preparedDatoms.length > 0 && preparedDatoms.every( Datom => validateDatom( dbSnapshot, Datom ) === true )

      let isAuthorized = true

      if( isValid && isAuthorized ){ 

        let storedDatoms = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( preparedDatoms ) )
        let updatedDBsnapshot =  addDatomsToDBSnapshot( dbSnapshot, storedDatoms )
        let updatedDB =  constructDatabase( updatedDBsnapshot )

        let isCorrectLength = storedDatoms.length === preparedDatoms.length

        if( !isCorrectLength ){return log( null, {error: `length mismatch`, preparedDatoms, storedDatoms, dbSnapshot, updatedDB} ) }

        return updatedDB
         
        }
      else{
        console.log("Transactor.postTransaction did not pass validation.", {isValid, isAuthorized, Datoms, preparedDatoms})
        return dbSnapshot;
      }
    },
    createEntity: async (dbSnapshot, entityType, newEntityDatoms) => Transactor.postTransaction(dbSnapshot, [newDatom("newEntity", "entity/entityType", entityType )].concat( Array.isArray(newEntityDatoms)  ? newEntityDatoms : [] ) ),
    updateEntity: async (dbSnapshot, entity, attrName, value, isAddition) => Transactor.postTransaction(dbSnapshot, [newDatom(entity, attrName, value, isAddition)]),
    replaceValueEntry: async (dbSnapshot, entity, attrName, index, newValue) => {
      let Values = getDatomValue( dbSnapshot, entity, attrName)
      return await Transactor.updateEntity( dbSnapshot, entity, attrName, Values.slice(0, index ).concat( newValue ).concat( Values.slice(index + 1, Values.length ) ) )
    },
    retractEntities: async (dbSnapshot, entities) => Transactor.postTransaction( dbSnapshot, getEntitiesRetractionDatoms( dbSnapshot, entities ) ),
}

let validateDatomFormat = Datom => [
  Datom => Object.keys( Datom ).length === 4,
  Datom => isNumber( Datom.entity ) || isString( Datom.entity ),
  Datom => isString( Datom.attribute ),
  Datom => isDefined( Datom.value ),
].every( criterium => criterium( Datom )  === true )

let attributeValidatorFunction = (dbSnapshot, attribute) => new Function("inputValue",  getDatomValue( dbSnapshot, getDatomValue( dbSnapshot, attribute , "attribute/valueType"), "valueType/validatorFunctionString") )

let validateDatomValue = (dbSnapshot, Datom) => getDatomValue( dbSnapshot, attr( dbSnapshot, Datom.attribute ), "attribute/isArray" )
  ? Datom.value.every( arrayEntry => attributeValidatorFunction( dbSnapshot, attr( dbSnapshot, Datom.attribute ) )( arrayEntry ) === true )
  : attributeValidatorFunction( dbSnapshot, attr( dbSnapshot, Datom.attribute ) )( Datom.value ) === true

let validateDatom = (dbSnapshot, Datom) => [
  (dbSnapshot, Datom) => validateDatomFormat( Datom ),
  (dbSnapshot, Datom) => isString( Datom.entity ) || Datom.entity <= dbSnapshot.latestEntityID,
  (dbSnapshot, Datom) => Datom.isAddition === true || (Datom.isAddition === false && isEntity( dbSnapshot, Datom.entity ) ),
  (dbSnapshot, Datom) => validateDatomValue( dbSnapshot, Datom ),
].every( criterium => criterium( dbSnapshot, Datom )  === true )


let getEntityRetractionDatoms = (dbSnapshot, entity) => getEntityDatoms( dbSnapshot, entity)
  .map( Datom => Datom.attribute ).filter( filterUniqueValues )
  .filter( attribute => getEntityDatoms( dbSnapshot, entity).filter( Datom => Datom.attribute === attribute ).slice( -1 )[0].isAddition )
  .map( attribute => newDatom(entity, attribute, getDatomValue( dbSnapshot, entity, attribute), false ) )

let getEntitiesRetractionDatoms = (dbSnapshot, entities) => entities.map( entity => getEntityRetractionDatoms( dbSnapshot, entity ) ).flat()

let constructEntity = ( Datoms, entity )  => {

    let entityDatoms = Datoms.filter( Datom => Datom.entity === entity )

    let allAttributes = entityDatoms.map( Datom => Datom.attribute ).filter( filterUniqueValues )

    let activeAttributes = allAttributes.filter( attrName => entityDatoms.filter( Datom => Datom.attribute === attrName ).slice( -1 )[ 0 ].isAddition === true )

    let isActive = activeAttributes.length > 0

    let entityTypeDatom = entityDatoms.filter( Datom => Datom.attribute ===  "entity/entityType" ).slice( -1 )[ 0 ]

    let entityType = isDefined(entityTypeDatom) ? entityTypeDatom.value : undefined

    let Entity = {
        entity,
        entityType,
        Datoms: entityDatoms,
        isActive
    }

    return Entity

}

let addDatomsToDBSnapshot = (dbSnapshot, newDatoms) => {

    let datomEntities = newDatoms.map( Datom => Datom.entity ).filter( filterUniqueValues )

    let updatedEntities = dbSnapshot.Entities
        .map( Entity => datomEntities.includes( Entity.entity )
            ? constructEntity( Entity.Datoms.concat( newDatoms.filter( Datom => Datom.entity === Entity.entity ) ), Entity.entity  )
            : Entity )

    let newEntities = datomEntities.filter( entity => entity > dbSnapshot.latestEntityID  ).map( entity => constructEntity( newDatoms.filter( Datom => Datom.entity === entity ), entity  ) )

    let Entities = updatedEntities.concat( newEntities ).filter( Entity => Entity.isActive === true )
        
    let computedTx = newDatoms.slice( -1 )[ 0 ].tx

    let tx = computedTx > dbSnapshot.tx ? computedTx : dbSnapshot.tx

    let newDatoms_latestEntityID = datomEntities.reduce( (max, element) => Math.max(max, element), 0 );

    let latestEntityID = newDatoms_latestEntityID > dbSnapshot.latestEntityID ? newDatoms_latestEntityID : dbSnapshot.latestEntityID
    
    let updatedDBSnapshot = { Entities, tx, latestEntityID, created: Date.now(), label: "Snapshot av alle datomer per valgt tx." }

    updatedDBSnapshot.entities = updatedDBSnapshot.Entities.map( Entity => Entity.entity ) 
    updatedDBSnapshot.attributes = updatedDBSnapshot.Entities.filter( Entity => Entity.entityType === 42 ).map( Datom => Datom.entity ).filter( filterUniqueValues ).sort( ( a,b ) => a - b )
    updatedDBSnapshot.attrNames = mergerino( {}, updatedDBSnapshot.attributes.map( attribute => returnObject({[getDatomValue( updatedDBSnapshot, attribute, "attr/name" )]: attribute })  ) )
    updatedDBSnapshot.calculatedDatoms = []
    
    return updatedDBSnapshot

}

//Query


//TBD...
let calculateGlobalCalculatedValue = ( DB, calculatedField ) => tryFunction( () => new Function( [`Database`] , DB.get(calculatedField, 6792 ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") )( DB ) )
let calculateEntityCalculatedValue = ( DB, entity, calculatedField ) => tryFunction( () => new Function( [`Database`, `Entity`] , DB.get(calculatedField, 6792 ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") )( DB, {entity: entity,get: attr => DB.get(entity, attr)} ) )


let getReportFieldValue = ( DB, company, reportField, yearEndEvent ) => DB.get( reportField, 8361 ) === 8662
  ? tryFunction( () => new Function( [`Database`, `Company`, `Entity`], DB.get(reportField, 8662).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") )( DB, mergerino( DB.get(company), {t: State.DB.get(yearEndEvent, 10502) }), DB.get(yearEndEvent) ) )
  : DB.get( reportField, 8361 ) === 5030
    ? DB.get(company, 12392)( DB.get(reportField, 13150), State.DB.get(yearEndEvent, 11975) - 1 )
    : null

//TBD...


let constructDatabase = dbSnapshot => {

  let DB = dbSnapshot

  DB.getGlobalCalculatedDatom = calculatedField => DB.calculatedDatoms.find( calculatedDatom => isUndefined(calculatedDatom.entity) && calculatedDatom.calculatedField === calculatedField )

  DB.getGlobalCalculatedValue = calculatedField => {
    let cachedCalculatedDatom = DB.getGlobalCalculatedDatom( calculatedField )
    if(isDefined(cachedCalculatedDatom)){
      return cachedCalculatedDatom.value
    }else{
      let value = calculateGlobalCalculatedValue( DB, calculatedField )
      //let value = calculateGlobalCalculatedValueFromDB( dbSnapshot, calculatedField ) //Needs access to cache to avoid crappy performance
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
      //let value = calculateEntityCalculatedValueFromDB( dbSnapshot, entity, calculatedField ) //Needs access to cache to avoid crappy performance
      let calculatedDatom = { entity, calculatedField, value }
      DB.calculatedDatoms = DB.calculatedDatoms.filter( calculatedDatom => !(calculatedDatom.entity === entity && calculatedDatom.calculatedField === calculatedField) ).concat( calculatedDatom )
      return value
    }
  } 

  DB.getEntity = ( entity, version) => isActiveEntity( dbSnapshot, entity, version ) 
    ? {
      entity,
      label: getDatomValue( dbSnapshot, entity, "entity/label" ),
      entityType: getEntityType( dbSnapshot, entity, version ),
      Datoms: getEntityDatoms( dbSnapshot, entity, version ),
      get: attr => DB.get( entity, attr, version )
    }
    : undefined

  DB.getAll = entityType => getAllFromDB( dbSnapshot, entityType )

  DB.get = (entity, attribute, version) => {
    if( isNull(entity) && isGlobalCalculatedField( dbSnapshot, attribute) ){ return DB.getGlobalCalculatedValue( attribute ) }
    else if( isEntity( dbSnapshot, entity) ){
          if( isDefined(attribute) ){
            if( isAttribute( dbSnapshot, attr( dbSnapshot, attribute ) ) ){ return getDatomValue( dbSnapshot, entity, attrName( dbSnapshot, attribute), version ) }
            else if ( isEntityCalculatedField( dbSnapshot, attribute ) ){ 
              if( getEntityType( dbSnapshot, entity, version ) === getDatomValue(dbSnapshot, attribute, "calculatedField/entityType") ) { return DB.getEntityCalculatedValue( entity, attribute ) }  
              else{ return log(undefined, `DB.getEntityCalculatedValue ERROR: ${entity} does not have the type required by ${attribute}.`) }
            }
            }else { return DB.getEntity( entity, version) }
    }
    else{ return log(undefined, `[ DB.get(${entity}, ${attribute}, ${version}) ]: Entity does not exist`) }
  }

  

  return DB
}


let isEntity = ( dbSnapshot, entity ) => isDefined( dbSnapshot.Entities.find( Entity => Entity.entity === entity ) )

let isActiveEntity = ( dbSnapshot, entity ) => isEntity( dbSnapshot, entity )
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

let getEntity = (dbSnapshot, entity, version) => isActiveEntity( dbSnapshot, entity, version ) 
  ? {
    entity,
    label: getDatomValue( dbSnapshot, entity, "entity/label" ),
    entityType: getEntityType( dbSnapshot, entity, version ),
    Datoms: getEntityDatoms( dbSnapshot, entity, version ),
    get: attr => getFromDB( dbSnapshot, entity, attr, version )
  }
  : undefined

let isAttribute = (dbSnapshot, attribute) => dbSnapshot.attributes.includes( attribute )
let isEntityCalculatedField = (dbSnapshot, calculatedField, version) => getDatomValue( dbSnapshot, calculatedField, "entity/entityType" ) === 9815 
let isGlobalCalculatedField = (dbSnapshot, calculatedField, version) => getDatomValue( dbSnapshot, calculatedField, "entity/entityType" ) === 12551 

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

let getAllFromDB = ( dbSnapshot, entityType ) => dbSnapshot.Entities.filter( Entity => Entity.entityType === entityType ).map( Entity => Entity.entity )

let getEntityType = ( dbSnapshot, entity, version) => getDatomValue( dbSnapshot, entity, "entity/entityType", version )

let getlatestActiveEntityID = dbSnapshot => dbSnapshot.entities.sort( (a,b) => a-b ).slice( -1 )[0]

let getFromDB = ( dbSnapshot, entity, attribute, version) => {
  if( isNull(entity) && isGlobalCalculatedField( dbSnapshot, attribute, version ) ){ return "TBD" } // calculateGlobalCalculatedValueFromDB( dbSnapshot, attribute ) }
  else if( isEntity( dbSnapshot, entity ) ){
      if( isUndefined( attribute ) ){ return getEntity( dbSnapshot, entity, version) }
      else { 
          if( isAttribute(  dbSnapshot, attr( dbSnapshot, attribute ) ) ){ return getDatomValue( dbSnapshot, entity, attrName( dbSnapshot, attribute, version ) , version ) }
          else if ( isEntityCalculatedField( dbSnapshot, attribute ) ){ 
              if( getEntityType( dbSnapshot, entity, version ) === getDatomValue( dbSnapshot, attribute, "calculatedField/entityType", version ) ) { return "TBD" } // calculateEntityCalculatedValueFromDB( dbSnapshot, entity, attribute ) }
              else{ return log(undefined, `DB.getEntityCalculatedValue ERROR: ${entity} does not have the type required by ${attribute}.`) }
          }
      }
      }else{ return log(undefined, `[ DB.get(${entity}, ${attribute}, ${version}) ]: Entity does not exist`) }

}