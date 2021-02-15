
const InterestPage = {
    entity: 10040,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({
        "InterestPage/selectSourceDocument": entity => updateState( State, {S: {selectedPage: InterestPage.entity, selectedEntity: entity}}),
        "InterestPage/retractSourceDocument": async entity => updateState( State, { DB: await Transactor.retractEntity(State.DB, entity), S: {selectedPage: InterestPage.entity, selectedEntity: undefined } } ),
        "InterestPage/newInterestIncome": () => State.Actions.postDatoms([
            newDatom( "newEntity", "entity/entityType", 10062 ),
            newDatom( "newEntity", "sourceDocument/sourceDocumentType", 11395 ),
            newDatom( "newEntity", 1757, Date.now() ),
            newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
            newDatom( 'newEntity' , "eventAttribute/1139", "Ny renteinntekt" ), 
        ] ),
        "InterestPage/recordInterestIncome": sourceDocument => State.Actions.postDatoms( [
            newDatom( "newEntity" , 'entity/entityType', 7948 ),
            newDatom( "newEntity" , 'entity/company', State.S.selectedCompany ), 
            newDatom( "newEntity" , "transaction/transactionType", 11397 ), 
            newDatom( "newEntity" , "entity/sourceDocument", sourceDocument ), 
            newDatom( "newEntity" , "transaction/originNode", 10687 ),
            newDatom( "newEntity" , "transaction/destinationNode", State.DB.get( sourceDocument, 11396) ? State.DB.get( sourceDocument, 10200) : State.DB.get( State.DB.get( sourceDocument, 11180), 7463) ),
            newDatom( "newEntity" , "eventAttribute/1139",  "Renteinntekt" )
        ]) ,
        })
  }


  
  let interestView = State => isDefined( State.S.selectedEntity ) 
    ? singleInterestSourceDocumentView( State )
    : allInterestSourceDocumentsView( State )
  
  let allInterestSourceDocumentsView = State => d([
    h3("Alle driftskostnader"),
    d([
        entityLabelWithPopup( State, 1757 ),
        entityLabelWithPopup( State, 10070 ),
        entityLabelWithPopup( State, 10107 ),
        entityLabelWithPopup( State, 10401 ),
        d("")
    ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr")}),
    d( State.DB.get( State.S.selectedCompany, 10073 )
        .filter( sourceDocument => [11395].includes( State.DB.get(sourceDocument, 10070 ) )   )
        .map( sourceDocument => d([
        lockedSingleValueView( State, sourceDocument, 1757 ),
        lockedSingleValueView( State, sourceDocument, 10070 ),
        lockedSingleValueView( State, sourceDocument, 10107 ),
        d(State.DB.get(sourceDocument, 10401) ? "✅" : "🚧"),
        submitButton( "Vis", () => State.Actions["InterestPage/selectSourceDocument"]( sourceDocument ))
    ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr")}) )),
  br(),
  submitButton( "Registrer ny renteinntekt", () => State.Actions["InterestPage/newInterestIncome"]( )),
  ]) 

  
  let singleInterestSourceDocumentView = State => d([
    submitButton( " <---- Tilbake ", () => State.Actions["InterestPage/selectSourceDocument"]( undefined )  ),
    br(),
    entityAttributeView(State, State.S.selectedEntity, 10070, true ),
    br(),
    entityAttributeView(State, State.S.selectedEntity, 1757, State.DB.get(State.S.selectedEntity, 10401) ),
    entityAttributeView(State, State.S.selectedEntity, 11396, State.DB.get(State.S.selectedEntity, 10401) ),
    br(),
    State.DB.get(State.S.selectedEntity, 11396)
        ? d([
            entityAttributeView(State, State.S.selectedEntity, 10200, State.DB.get(State.S.selectedEntity, 10401) ),
            entityAttributeView(State, State.S.selectedEntity, 1083, State.DB.get(State.S.selectedEntity, 10401) )
        ]) 
        : entityAttributeView(State, State.S.selectedEntity, 11180, State.DB.get(State.S.selectedEntity, 10401) ),
    br(),
    entityAttributeView(State, State.S.selectedEntity, 10107, true ),
    br(),
    d([
        d([
            d("Tilknyttede transaksjoner:"),
            State.DB.get(State.S.selectedEntity, 10401)
                ? d( State.DB.get(State.S.selectedEntity, 10402).map( transaction => transactionFlowView( State, transaction) ) )
                : d("Ingen bokførte transaksjoner")
            ], {class: "feedContainer"}),
        State.DB.get(State.S.selectedEntity, 11012)
        ?  State.DB.get(State.S.selectedEntity, 10401)
            ? d("Regnskapsåret for angitt dato er avsluttet. Tilbakestill årsavslutningen for å endre bilaget.")
            : d("Regnskapsåret for angitt dato er avsluttet. Tilbakestill årsavslutningen først, eller velg en senere dato.")
        : State.DB.get(State.S.selectedEntity, 10401)
            ? submitButton("Tilbakestill bokføring", () => State.Actions.retractEntities( State.DB.get(State.S.selectedEntity, 10402) )  )
            : d([
                [1757, 11396].every( attribute => isDefined( State.DB.get(State.S.selectedEntity, attribute) ) ) && ( isDefined( State.DB.get(State.S.selectedEntity, 11396) ) || isDefined( State.DB.get(State.S.selectedEntity, 1083) ) )
                    ? submitButton("Bokfør", () => State.Actions["InterestPage/recordInterestIncome"]( State.S.selectedEntity )   )
                    : d("Fyll ut alle felter for å bokføre"),
                submitButton("Slett", e => State.Actions["InterestPage/retractSourceDocument"]( State.S.selectedEntity ) )
            ])   
    ])
  ])

  

