let newDatom = (entity, attribute, value, isAddition) => returnObject({entity, attribute, value, isAddition: isAddition === false ? false : true })

let changeToStringAttributes = (DB, Datoms) => Datoms.map( Datom => isNumber(Datom.attribute) ? newDatom(Datom.entity, DB.attrName(Datom.attribute), Datom.value ) : Datom )

let validateDatomAttributeValues = ( DB, Datoms ) => Datoms.every( Datom => {

    let attr = DB.attr(Datom.attribute)
    let isArray = DB.get( attr, 5823)

    let valueType = DB.get( attr , "attribute/valueType")

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

    return isValid

  } )

let getEntityRetractionDatoms = (DB, entity) => DB.get(entity).Datoms.filter( Datom => DB.get(entity).Datoms.filter( dat => dat.attribute === Datom.attribute && dat.tx > Datom.tx ).length === 0  ).map( Datom => newDatom(entity, Datom.attribute, Datom.value, false) )

let getEntitiesRetractionDatoms = (DB, entities) => isArray(entities) ? entities.map( entity => getEntityRetractionDatoms( DB, entity ) ).flat() : log([], {ERROR: "getEntitiesRetractionDatoms did not receive array", entities} )

const Transactor = {
    postValidDatoms: async (DB, validDatoms) => {
      let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( validDatoms ) )
      let changedEntities = serverResponse.map( updatedEntity => updatedEntity.entity )
      let updatedDB = constructDatabase( DB.Entities.filter( oldEntity => !changedEntities.includes(oldEntity.entity)  ).concat(serverResponse) )
      return updatedDB
    },
    postDatoms: async (DB, Datoms) => {
      
      let datomsWithStringAttributes = changeToStringAttributes( DB, Datoms )
      let isValid = validateDatomAttributeValues( DB, datomsWithStringAttributes )

      if( isValid ){

        let updatedDB = await Transactor.postValidDatoms(DB, datomsWithStringAttributes)
        return updatedDB
  
      }else{
        console.log("DB.postDatoms did not pass validation.", {Datoms, datomsWithStringAttributes})
        return null;
      }
    },
    createEntity: async (DB, entityType, newEntityDatoms) => Transactor.postDatoms(DB, [newDatom("newEntity", "entity/entityType", entityType )].concat( Array.isArray(newEntityDatoms)  ? newEntityDatoms : [] ) ),
    updateEntity: async (DB, entity, attribute, value, isAddition) => Transactor.postDatoms(DB, log([newDatom(entity, attribute, value, isAddition)])),
    addValueEntry: async (DB, entity, attribute, newValue) => await Transactor.updateEntity( DB, entity, attribute, DB.get(entity, attribute).concat( newValue ) ),
    removeValueEntry: async (DB, entity, attribute, index) => await Transactor.updateEntity( DB, entity, attribute, DB.get(entity, attribute).filter( (Value, i) => i !== index  ) ),
    replaceValueEntry: async (DB, entity, attribute, index, newValue) => {
      let Values = DB.get(entity, attribute)
      return await Transactor.updateEntity( DB, entity, attribute, Values.slice(0, index ).concat( newValue ).concat( Values.slice(index + 1, Values.length ) ) )
    },
    retractEntities: async (DB, entities) => {    
      let retractionDatoms = getEntitiesRetractionDatoms( DB, entities )
      let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( retractionDatoms ) )
      let retractedEntities = serverResponse.map( retractedEntity => retractedEntity.entity )
      let updatedDB = constructDatabase( DB.Entities.filter( oldEntity => !retractedEntities.includes(oldEntity.entity)  ) )
      return updatedDB
    },
    retractEntity: async (DB, entity) => Transactor.retractEntities(DB, [entity])
}

let constructDatabase = Entities => {

    let DB = {Entities}
  
    DB.entities = DB.Entities.map( serverEntity => serverEntity.entity )
    DB.attributes = DB.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 ).map(E => E.entity)
    DB.attrNames = mergeArray(DB.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === 42 ).map( serverEntity => createObject(serverEntity.current["attr/name"], serverEntity.entity) ))
    DB.tx = DB.Entities.map( Entity => Entity.Datoms.slice( -1 )[0].tx ).sort( (a,b) => a-b ).filter( v => isDefined(v) ).slice(-1)[0]

    DB.calculatedDatoms = []
  
    DB.attrName = attribute => {
      if( isNumber(attribute)  ){
        let serverEntity = DB.Entities.find( serverEntity => serverEntity.entity === attribute  )
        let serverDatoms = serverEntity.Datoms.filter( Datom => Datom.attribute === "attr/name" )
        let latestDatom = serverDatoms.slice( - 1 )[0]
        let value = latestDatom.value
        return value;
      }else if( isDefined( DB.attrNames[attribute] ) ){ return attribute }
      else{ return log(undefined, `[ DB.attrName(${attribute}) ]: Attribute ${attribute} does not exist`) }
    }
  
    DB.attr = attrName => isDefined(attrName) ? isNumber(attrName) ? attrName : DB.attrNames[attrName] : log(undefined, `[ DB.attr(${attrName}) ]: Proveded attribute name is undefined`)
  
    DB.isAttribute = attribute => DB.attributes.includes( DB.attr(attribute) )
  
    DB.isEntity = entity => DB.entities.includes(entity)
  
    DB.isCalculatedField = calculatedField => DB.getAll(9815).includes( calculatedField ) || DB.getAll(12551).includes( calculatedField )
  
    DB.getDatom = (entity, attribute, version) => {

      let serverEntity = DB.Entities.find( serverEntity => serverEntity.entity === entity  )
      let Datom = serverEntity.Datoms
            .filter( Datom => Datom.attribute === DB.attrName(attribute) )
            .map( serverDatom => isUndefined(serverDatom.tx) ? mergerino(serverDatom, {tx: 0}) : serverDatom ) //NB: Some early datoms lacks tx.....
            .filter( serverDatom => isDefined(version) ? serverDatom.tx <= version : true )
            .slice(-1)[0]
      return Datom
    }
  
    DB.getEntity = entity => {
      let serverEntity = DB.Entities.find( serverEntity => serverEntity.entity === entity  )

      let Entity = serverEntity;

      Entity.tx = Entity.Datoms.slice( -1 )[ 0 ].tx
      Entity.get = (attr, version) => DB.get(entity, attr, version)
      
      Entity.label = () => Entity.get("entity/label") ? Entity.get("entity/label") : "Mangler visningsnavn."
      
      Entity.getOptions = attr => DB.getOptions(attr)
    
      return Entity
    }
  
    DB.getEntityAttribute = (entity, attribute, version) => {
  
      let Entity = DB.getEntity( entity )
      let EntityAttributeDatoms = Entity.Datoms.filter( Datom => Datom.attribute === DB.attrName(attribute) )
      let valueType = DB.get(attribute, "attribute/valueType")
      let isArray = DB.get(attribute, "attribute/isArray")
  
      let EntityAttribute = {
        entity, attribute, valueType, isArray,
        Datoms: EntityAttributeDatoms,
      }
  
      return EntityAttribute
    }

    DB.getCalculatedDatom = ( entity, calculatedField ) => {


      let calculatedDatom = DB.calculatedDatoms.find( calculatedDatom => calculatedDatom.entity === entity && calculatedDatom.calculatedField === calculatedField )

        return calculatedDatom

    }

    DB.getGlobalCalculatedValue = (entity, calculatedField) => {

      let cachedCalculatedDatom = DB.getCalculatedDatom( entity, calculatedField )

      if(isDefined(cachedCalculatedDatom)){
        //log("Returning cached version")
        return cachedCalculatedDatom.value
      }else{
        //log("Returning calculated version")
        let value = calculateGlobalCalculatedValue( DB, entity, calculatedField )
        let calculatedDatom = { entity, calculatedField, value }
        DB.calculatedDatoms = DB.calculatedDatoms.filter( calculatedDatom => !(calculatedDatom.entity === entity && calculatedDatom.calculatedField === calculatedField) ).concat( calculatedDatom )

        return value
      }



      
    } 
  
    DB.getAll = entityType => DB.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === entityType ).map(E => E.entity) //Kan bli sirkulær med isAttribute
  
    DB.getOptions = (attribute, tx ) => tryFunction( () => new Function( ["Database"] , DB.get( attribute, "attribute/selectableEntitiesFilterFunction", tx) )( DB ) );
  
    DB.get = (entity, attribute, version) => {
      if(DB.isEntity(entity)){
        if( isDefined(attribute) ){
          if( DB.isAttribute(attribute) ){
            let Datom = DB.getDatom(entity, attribute, version)
            if( isUndefined(Datom) || Datom.isAddition === false ){return undefined}
            else{ return Datom.value}
          }else if( DB.isCalculatedField(attribute) ){return DB.getGlobalCalculatedValue( entity, attribute ) } //returns calculatedField
        }else{return DB.getEntity(entity)}
      }else{return log(undefined, `[ DB.get(${entity}, ${attribute}, ${version}) ]: Entity does not exist`)}
    }
  
    
  
    DB.getGlobalAsyncFunction = functionEntity => {
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      let argumentObjects = DB.get(functionEntity, "function/arguments")
      let arguments = argumentObjects.map( argumentObject => argumentObject["argument/name"] )
      let statementObjects = DB.get(functionEntity, "function/statements")
      let statements = statementObjects.filter( statementObject => statementObject["statement/isEnabled"] ).map( statementObject => statementObject["statement/statement"] )
      let functionString = statements.join(";")
      let GlobalAsyncFunction = new AsyncFunction( arguments ,functionString  )
      return GlobalAsyncFunction
    }

    DB.executeCompanyFunction = (company, entity, functionStatements) => {

      //Not working, TBD.....

      let CompanyEntityQueryObject = { 
        entity, 
        get: attr => CompanyQueryObject.get(entity, attr),
       }

      let functionString = functionStatements.filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";")

      let returnValue = tryFunction( () => new Function( [`Database`, , `Entity`], functionString )( DB, CompanyEntityQueryObject ) )

      return returnValue
    }

  
    return DB
}

getBalanceObjectLabel = (DB, balanceObject) => {


  let entityTypeLabelController = {
    "6253": () => `Aksjepost i ${DB.get( DB.get( balanceObject, 5675), 1113)}`,
    "6248": () => `Bankkonto i ${DB.get( balanceObject, 1809)}`,
    "7828": () => `Fordring på ${DB.get( DB.get( balanceObject, 5675), 1113)}`,
    "6237": () => `Aksjekapitalinnskudd`,
    "6243": () => `Opptjent egenkapital`,
    "6264": () => `Gjeld til ${DB.get( DB.get( balanceObject, 5675), 1113)}`,
    "7858": () => `Foreløpig årsresultat`,
    "7857": () => `Tilleggsutbytte`,
  }


  let balanceObjectType = DB.get( balanceObject, "balanceObject/balanceObjectType" )

  return Object.keys(entityTypeLabelController).includes( String(balanceObjectType) ) ? entityTypeLabelController[ balanceObjectType ]() : `[${balanceObject}] Mangler visningsnavn`

}

getEntityLabel = (DB, entity) => `${ DB.get( entity, "entity/label") ? DB.get( entity, "entity/label") : "Mangler visningsnavn."}`

let calculateGlobalCalculatedValue = ( DB, entity, calculatedField ) => tryFunction( () => new Function( [`Database`, `Entity`] , DB.get(calculatedField, 6792 ).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") )( DB, {entity: entity,get: attr => DB.get(entity, attr)} ) )



let getReportFieldValue = ( DB, company, reportField, yearEndEvent ) => DB.get( reportField, 8361 ) === 8662
  ? tryFunction( () => new Function( [`Database`, `Company`, `Entity`], DB.get(reportField, 8662).filter( statement => statement["statement/isEnabled"] ).map( statement => statement["statement/statement"] ).join(";") )( DB, mergerino( DB.get(company), {t: State.DB.get(yearEndEvent, 10502) }), DB.get(yearEndEvent) ) )
  : DB.get( reportField, 8361 ) === 5030
    ? DB.get(company, 12392)( DB.get(reportField, 7829), State.DB.get(yearEndEvent, 11975) - 1 )
    : null









    //Server boot function:

    
let S_addDatoms = newDatoms => {

  let S = {} // global server state

  let entityIDs = newDatoms.map( Datom => Datom.entity ).filter(filterUniqueValues)
  
  let updatedEntities = entityIDs.reduce( (updatedEntities, entity) => {

      let entityDatoms = newDatoms.filter( Datom => Datom.entity === entity )

      let Entity = S.Entities.filter( Entity => Entity.entity === entity ).length > 0 
          ? updateEntity( S.Entities.filter( Entity => Entity.entity === entity )[0], entityDatoms )
          : createEntity( entityDatoms )

      Entity.get = attribute => Entity.current[S.attrName(attribute)] 
          ? Entity.current[S.attrName(attribute)] 
          : `Entity does not have attribute [${S.attrName(attribute)} ] `

      
      return updatedEntities.concat( Entity )

  }   , [] )

  S.Entities = S.Entities.filter( Entity =>  !entityIDs.includes(Entity.entity) ).concat(updatedEntities)
  S.getEntity = entity => S.Entities.filter( Entity => Entity.entity === entity )[0]
  S.findEntities = filterFunction => S.Entities.filter( filterFunction )

  S.latestEntityID = Math.max.apply(null, [S.latestEntityID].concat( newDatoms.map( Datom => Number( Datom.entity ) )  ) )

  S.attrName = attribute => (typeof attribute === "string") ? attribute : S.getEntity(attribute).get("attr/name")
  S.attrEntity = attrName => (typeof attrName === "number") ? attrName : S.findEntities( Entity => Entity.get("attr/name") === attrName )[0].get("entity")

  return updatedEntities
}