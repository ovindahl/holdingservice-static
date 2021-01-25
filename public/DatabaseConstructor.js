let newDatom = (entity, attribute, value, isAddition) => returnObject({entity, attribute, value, isAddition: isAddition === false ? false : true })


const Transactor = {
    submitDatoms: async (DB, Datoms) => {
    let datomsWithStringAttributes = Datoms.map( Datom => isNumber(Datom.attribute) ? newDatom(Datom.entity, DB.attrName(Datom.attribute), Datom.value ) : Datom )
    let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( datomsWithStringAttributes ) )
    let updatedDB = constructDatabase( DB.Entities.concat(serverResponse) )
    return updatedDB
    },
    updateEntity: async (DB, entity, attribute, value) => {
  
      let attr = DB.attr(attribute)
      let valueType = DB.get( attr , "attribute/valueType")
  
      let attributeIsArray = isDefined( DB.get( attr, 5823) )
        ? DB.get(attr, 5823)
        : false
  
  
  
      let valueInArray = attributeIsArray ? value : [value]
      let isValid_existingEntity = DB.isEntity(entity)
      let valueTypeValidatorFunction = new Function("inputValue",  DB.get( valueType, "valueType/validatorFunctionString") )
  
      let isValid_valueType = valueInArray.every( arrayValue => valueTypeValidatorFunction(arrayValue) ) 
      let isValid_attribute = true
      let isValid_notNaN = valueInArray.every( arrayValue => !Number.isNaN(arrayValue) )
  
      //Add checks for whether attribtue is valid for the entity type?
  
      if( isValid_existingEntity && isValid_valueType && isValid_attribute && isValid_notNaN  ){
  
        let Datom = newDatom(entity, DB.attrName(attr), value )
        let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( [Datom] ) )
        let changedEntities = serverResponse.map( updatedEntity => updatedEntity.entity )
        let updatedDB = constructDatabase( DB.Entities.filter( oldEntity => !changedEntities.includes(oldEntity.entity)  ).concat(serverResponse) )
        return updatedDB
  
      }else{
        console.log("DB.updateEntity did not pass validation.", {entity, attr, value, validators: {isValid_existingEntity, isValid_valueType, isValid_attribute, isValid_notNaN }})
        return null;
      }
    },
    addValueEntry: async (DB, entity, attribute, newValue) => await Transactor.updateEntity( DB, entity, attribute, DB.get(entity, attribute).concat( newValue ) ),
    removeValueEntry: async (DB, entity, attribute, index) => await Transactor.updateEntity( DB, entity, attribute, DB.get(entity, attribute).filter( (Value, i) => i !== index  ) ),
    replaceValueEntry: async (DB, entity, attribute, index, newValue) => {
      let Values = DB.get(entity, attribute)
      return await Transactor.updateEntity( DB, entity, attribute, Values.slice(0, index ).concat( newValue ).concat( Values.slice(index + 1, Values.length ) ) )
    },
    createEntity: async (DB, entityType, newEntityDatoms) => {
  
      let D = [newDatom("newEntity", "entity/entityType", entityType )]
      if(Array.isArray(newEntityDatoms)){

        let datomsWithStringAttributes = newEntityDatoms.map( Datom => isNumber(Datom.attribute) ? newDatom(Datom.entity, DB.attrName(Datom.attribute), Datom.value ) : Datom )

        D = D.concat( datomsWithStringAttributes )
      }
  
      let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( D ) )
      let updatedDB = constructDatabase( DB.Entities.concat(serverResponse) )
      return updatedDB
    },
    retractEntities: async (DB, entities) => {    
      let retractionDatoms = entities.map( entity => {
        let Datoms = DB.get(entity).Datoms
        let activeDatoms = Datoms.filter( Datom => Datoms.filter( dat => dat.attribute === Datom.attribute && dat.tx > Datom.tx ).length === 0  )
        let retractionDatoms = activeDatoms.map( Datom => newDatom(entity, Datom.attribute, Datom.value, false) )
        return retractionDatoms
      } ).flat()
      
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
  
    DB.isCalculatedField = calculatedField => DB.getAll(5817).includes( calculatedField )
  
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
  
    DB.getAll = entityType => DB.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === entityType ).map(E => E.entity) //Kan bli sirkulær med isAttribute
  
    DB.getOptions = (attribute, tx ) => tryFunction( () => new Function( ["Database"] , DB.get(attribute, "attribute/selectableEntitiesFilterFunction", tx) )( DB ) );
  
    DB.get = (entity, attribute, version) => {
      if(DB.isEntity(entity)){
        if( isDefined(attribute) ){
          if( DB.isAttribute(attribute) ){
            let Datom = DB.getDatom(entity, attribute, version)
            if(isUndefined(Datom)){return undefined}
            else{ return Datom.value}
          }else if( DB.isCalculatedField(attribute) ){return log(undefined, `[ DB.get(${entity}, ${attribute}, ${version}) ]: Calculated fields for non-company entities not supported`) } //returns calculatedField
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


getEntityLabel = (DB, entity) => DB.get(entity, "entity/entityType") === 7948
  ? `Transaksjon ${ entity }`
  :  DB.get(entity, "entity/entityType") === 7979
    ? DB.get(entity, "actor/actorType") === 8666
      ? `${ DB.get(entity, 1001) }`
      : `${ DB.get(entity, 1113) }`
    : `${ DB.get( entity, "entity/label") ? DB.get( entity, "entity/label") : "Mangler visningsnavn."}`
  
getEntityDescription = (DB, entity) => `${ DB.get( entity, "entity/doc") ? DB.get( entity, "entity/doc") : ""}`


