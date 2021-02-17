
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
        entityLabelWithPopup( State, 6 ),
    ], {style: gridColumnsStyle("1fr 1fr 3fr")}),
    d( State.DB.get( State.S.selectedCompany, 11475 )
        .map( sourceDocument => d([
        entityLabelWithPopup( State, sourceDocument ),
        submitButton( "Vis", () => State.Actions.selectEntity(  sourceDocument, SourceDocumentsPage.entity ))
    ], {style: gridColumnsStyle("1fr 1fr 3fr")}) )),
  br(),
  submitButton( "Opprett nytt bilagsdokument", () => State.Actions.postDatoms( State.DB.get(State.S.selectedCompany, 11511) )),
  ]) 

  
  let singleSourceDocumentView = State => d([
    submitButton( " <---- Tilbake ", () => State.Actions.selectEntity(  undefined, SourceDocumentsPage.entity )  ),
    br(),
    d( State.DB.get( 11472, 17  ).map( attribute => entityAttributeView( State, State.S.selectedEntity, attribute ) )   ),
    br(),
    entityAttributeView( State, State.S.selectedEntity, 11479, true),
    br(),
    State.DB.get( State.S.selectedEntity, 11479  ).length === 0
        ? submitButton( "Slett bilagsdokument", () => State.Actions.retractEntity( State.S.selectedEntity ) )
        : d("Fjern alle koblinger mot bilagsdokumentet for å slette")
  ])

  






