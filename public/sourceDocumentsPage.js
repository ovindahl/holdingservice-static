
const SourceDocumentsPage = {
    entity: 11474,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({}),
  }

let sourceDocumentsView = State => { try {return isDefined( State.S.selectedEntity ) ? singleSourceDocumentView( State ) : allSourceDocumentsView( State ) } catch (error) { return entityErrorView( State, error ) } }
  
  let allSourceDocumentsView = State => d([
    h3("Alle bilagsdokumenter"),
    br(),
    d([
      d([
        d( "#" ),
        d( "Bilag" ),
        d( "Bilagstype" ),
      ], {style: gridColumnsStyle("1fr 3fr 2fr")}), 
    ], {class: "feedContainer"}),
    State.DB.get( State.S.selectedCompany, 11475 ).filter( sourceDocument => isDefined(State.S.selectedAccountingYear) ? State.DB.get(sourceDocument, 7512 ) === State.S.selectedAccountingYear : true  ).length > 0
      ? d( State.DB.get( State.S.selectedCompany, 11475 ).filter( sourceDocument => isDefined(State.S.selectedAccountingYear) ? State.DB.get(sourceDocument, 7512 ) === State.S.selectedAccountingYear : true  ).map( sourceDocument => d([
          d( `${State.DB.get(sourceDocument, 12509 )}` ),
          entityLabelWithPopup( State, sourceDocument, () => State.Actions.selectEntity(  sourceDocument, SourceDocumentsPage.entity  ) ),
          lockedSingleValueView( State, sourceDocument, 11688 ),
        ], {style: gridColumnsStyle("1fr 3fr 2fr") } ) ), {class: "feedContainer"} )
    : d("Ingen bilag i valgt regnskapsår.", {class: "feedContainer"}),
  br(),
  d([
    h3("Last opp nytt bilag"),
    d( State.DB.getAll( 11686 ).map( sourceDocumentType => entityLabelWithPopup( State, sourceDocumentType, () => State.Actions.createAndSelectEntity( [
      newDatom( 'newEntity', 'entity/entityType', 11472 ),
      newDatom( 'newEntity', "sourceDocument/sourceDocumentType", sourceDocumentType ),
      newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
      newDatom( 'newEntity' , 6, 'Bilagsdokument uten navn' ), 
      newDatom( 'newEntity' , 1139, '' ), 
      newDatom( 'newEntity' , 7512, 7407), 
      ] ) )  ) )
  ], {class: "feedContainer"})
  ]) 

  
  let singleSourceDocumentView = State => d([
    submitButton( " <---- Tilbake ", () => State.Actions.selectEntity(  undefined, SourceDocumentsPage.entity )  ),
    br(),
    entityAttributeView( State, State.S.selectedEntity, 11688, true ),
    entityAttributeView( State, State.DB.get( State.S.selectedEntity, 11688  ), 12556, true ),
    entityAttributeView( State, State.S.selectedEntity, 7512, false ),
    entityAttributeView( State, State.S.selectedEntity, 6, false ),
    entityAttributeView( State, State.S.selectedEntity, 1139, false ),
    br(),
    isDefined(State.DB.get( State.S.selectedEntity, 11688  )) 
      ? d( State.DB.get( State.DB.get( State.S.selectedEntity, 11688  ), 7942 ).map( attribute => entityAttributeView( State, State.S.selectedEntity, attribute ) )   )
      : d(""),
    isDefined(State.DB.get( State.S.selectedEntity, 11688  )) 
      ? d( State.DB.get( State.DB.get( State.S.selectedEntity, 11688  ), 10433 ).map( attribute => entityAttributeView( State, State.S.selectedEntity, attribute, true ) )   )
      : d(""),
    br(),
    eventActionsView( State, State.S.selectedEntity ),
    
  ])

  







