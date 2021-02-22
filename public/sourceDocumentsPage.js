
const SourceDocumentsPage = {
    entity: 11474,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({}),
  }


  
  let sourceDocumentsView = State => isDefined( State.S.selectedEntity ) 
    ? singleSourceDocumentView( State )
    : allSourceDocumentsView( State )
  
  let allSourceDocumentsView = State => d([
    h3("Alle bilagsdokumenter"),
    d([
      entityLabelWithPopup( State, 7403 ),
      d( State.DB.get(State.S.selectedCompany, 10061).map( e => entityLabelWithPopup(State, e, () => State.Actions["TransactionsPage/selectAccountingYear"](e)) ), {display: "flex"} )
      ], {class: "feedContainer", style: gridColumnsStyle("1fr 3fr")}),
      br(),
    d([
        entityLabelWithPopup( State, 6 ),
        entityLabelWithPopup( State, 11688 ),
        entityLabelWithPopup( State, 1757 ),
    ], {style: gridColumnsStyle("2fr 2fr 1fr 1fr 1fr")}),
    d( State.DB.get( State.S.selectedCompany, 11475 )
        .filter( sourceDocument => State.DB.get(sourceDocument, 7512 ) === State.S.selectedAccountingYear   )
        .map( sourceDocument => d([
        entityLabelWithPopup( State, sourceDocument ),
        lockedSingleValueView( State, sourceDocument, 11688 ),
        lockedSingleValueView( State, sourceDocument, 1757 ),
        submitButton( "Vis", () => State.Actions.selectEntity(  sourceDocument, SourceDocumentsPage.entity ))
    ], {style: gridColumnsStyle("2fr 2fr 1fr 1fr 1fr")}) )),
  br(),
  eventActionButton( State, State.S.selectedCompany, 12062 )
  ]) 

  
  let singleSourceDocumentView = State => d([
    submitButton( " <---- Tilbake ", () => State.Actions.selectEntity(  undefined, SourceDocumentsPage.entity )  ),
    br(),
    d( State.DB.get( 11472, 17  ).map( attribute => entityAttributeView( State, State.S.selectedEntity, attribute ) )   ),
    br(),
    isDefined(State.DB.get( State.S.selectedEntity, 11688  )) 
      ? d( State.DB.get( State.DB.get( State.S.selectedEntity, 11688  ), 7942 ).map( attribute => entityAttributeView( State, State.S.selectedEntity, attribute ) )   )
      : d(""),
    br(),
    entityAttributeView( State, State.S.selectedEntity, 11479, true),
    br(),
    State.DB.get( State.S.selectedEntity, 11479  ).length === 0
        ? submitButton( "Slett bilagsdokument", () => State.Actions.retractEntity( State.S.selectedEntity ) )
        : d("Fjern alle koblinger mot bilagsdokumentet for å slette"),
    br(),
    State.DB.get( State.S.selectedEntity, 11688  ) === 11689 ? eventActionButton( State, State.S.selectedEntity, 11695) : d(""),
    
  ])

  







