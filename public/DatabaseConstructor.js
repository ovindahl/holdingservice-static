let newDatom = (entity, attribute, value, isAddition) => returnObject({entity, attribute, value, isAddition: isAddition === false ? false : true })

const Transactor = {
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
    createEntity: async (DB, entityType, newEntityDatoms) => {
  
      let D = [newDatom("newEntity", "entity/entityType", entityType )]
      if(Array.isArray(newEntityDatoms)){D = D.concat(newEntityDatoms)}
  
      let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( D ) )
      let updatedDB = constructDatabase( DB.Entities.concat(serverResponse) )
      return updatedDB
    },
    retractEntity: async (DB, entity) => Transactor.retractEntities(DB, [entity]),
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
    submitDatoms: async datoms => {
      let serverResponse = await sideEffects.APIRequest("POST", "newDatoms", JSON.stringify( datoms ) )
      let updatedDB = constructDatabase( DB.Entities.concat(serverResponse) )
      return updatedDB
    }
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
      Entity.entityType = Entity.get("entity/entityType")
      Entity.color = DB.get( Entity.entityType, "entityType/color") ? DB.get( Entity.entityType, "entityType/color") : "#bfbfbf"
  
      Entity.label = () => (Entity.entityType === 5692)
        ? `[${entity}] Prosess ${ClientApp.Company.processes.findIndex( p => p === entity ) + 1}: ${DB.get( DB.get(entity, "process/processType"), "entity/label")} `
        : (Entity.entityType === 46)
          ? `[${entity}] Hendelse ${ClientApp.Company.events.findIndex( e => e === entity ) + 1}: ${DB.get( DB.get(entity, "event/eventTypeEntity"), "entity/label")} `
          : Entity.get("entity/label") ? Entity.get("entity/label") : "Mangler visningsnavn."
  
      
      
      Entity.getOptions = attr => DB.getOptions(attr)
  
      Entity.replaceValue = async (attribute, newValue) => {
        ClientApp.DB = await Transactor.updateEntity(DB, entity, attribute, newValue )
        if( Entity.get("entity/entityType") === 46 ){  ClientApp.update(  )  }else{ AdminApp.update(  ) }
      } 
      Entity.addValueEntry = async (attribute, newValue) => await Entity.replaceValue( attribute,  Entity.get(attribute).concat( newValue )  )
      Entity.removeValueEntry = async (attribute, index) => await Entity.replaceValue( attribute,  Entity.get(attribute).filter( (Value, i) => i !== index  ) )
  
      Entity.replaceValueEntry = async (attribute, index, newValue) => {
        let Values = Entity.get(attribute)
        await Entity.replaceValue( attribute,  Values.slice(0, index ).concat( newValue ).concat( Values.slice(index + 1, Values.length ) ) )
      } 
  
      Entity.getActions = () =>  [
        {label: "Slett", isActionable: true, actionFunction: async e => {
          ClientApp.DB =  await Transactor.retractEntity(DB, entity)
          AdminApp.updateState({selectedEntity: ClientApp.DB.Entities.slice(-1)[0].entity})
          ClientApp.update()
        } },
        {label: "Legg til", isActionable: true, actionFunction: async e => {
          ClientApp.DB =  await Transactor.createEntity(DB, Entity.entityType) 
          AdminApp.updateState({selectedEntity: ClientApp.DB.Entities.slice(-1)[0].entity})
          AdminApp.update()
        }   },
        {label: "Lag kopi", isActionable: true, actionFunction: async e => {
  
          let entityType = Entity.get("entity/entityType")
          let entityTypeAttributes = DB.get( entityType, "entityType/attributes" )
          let newEntityDatoms = entityTypeAttributes.map( attr => newDatom("newEntity", DB.attrName(attr), Entity.get(attr) ) ).filter( Datom => Datom.attribute !== "entity/label" ).concat( newDatom("newEntity", "entity/label", `Kopi av ${Entity.get(6)}` ) )
          if(entityType === 42){ newEntityDatoms.push( newDatom( "newEntity", "attr/name", "attr/" + Date.now() )  ) }
          ClientApp.DB =  await Transactor.createEntity(DB, entityType, newEntityDatoms)
          AdminApp.updateState({selectedEntity: ClientApp.DB.Entities.slice(-1)[0].entity})
          AdminApp.update()
        }   },
      ]
  
      Entity.getView = DB => entityView( DB, Entity )
  
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
  
      EntityAttribute.getView = DB => entityAttributeView( DB, EntityAttribute )
  
      return EntityAttribute
    }
  
    DB.getAll = entityType => DB.Entities.filter( serverEntity => serverEntity.current["entity/entityType"] === entityType ).map(E => E.entity) //Kan bli sirkulær med isAttribute
  
    DB.getOptions = (attribute, tx ) => {
      let options = [];
      try {options = new Function( ["Database"] , DB.get(attribute, "attribute/selectableEntitiesFilterFunction", tx) )( DB )}
      catch (error) { log(error, {info: "Could not get options for DB attribute", attribute, tx }) }
      return options
    }
  
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