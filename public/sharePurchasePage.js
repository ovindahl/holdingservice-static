const SharePurchasesPage = {
    entity: 10041,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({
        "SharePurchasesPage/selectSourceDocument": entity => updateState( State, {S: {selectedPage: SharePurchasesPage.entity, selectedEntity: entity}}),
        "SharePurchasesPage/retractSourceDocument": async entity => updateState( State, { DB: await Transactor.retractEntity(State.DB, entity), S: {selectedPage: 10041, selectedEntity: undefined } } ),
        "SharePurchasesPage/newSharePurchase": () => State.Actions.postDatoms([
            newDatom( "newEntity", "entity/entityType", 10062 ),
            newDatom( "newEntity", "sourceDocument/sourceDocumentType", 10096 ),
            newDatom( "newEntity", "sourceDocument/securityTransactionType", 11170 ),
            newDatom( "newEntity", 1757, Date.now() ),
            newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
            newDatom( 'newEntity' , "eventAttribute/1139", "Nytt aksjekjøp" ), 
        ] ),
        "SharePurchasesPage/newShareSale": () => State.Actions.postDatoms([
            newDatom( "newEntity", "entity/entityType", 10062 ),
            newDatom( "newEntity", "sourceDocument/sourceDocumentType", 10111 ),
            newDatom( "newEntity", "sourceDocument/securityTransactionType", 11171 ),
            newDatom( "newEntity", 1757, Date.now() ),
            newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
            newDatom( 'newEntity' , "eventAttribute/1139", "Nytt aksjesalg" ), 
        ] ),
        "SharePurchasesPage/recordSharePurchase": sourceDocument => State.Actions.postDatoms( [
            newDatom( "newEntity" , 'entity/entityType', 7948 ),
            newDatom( "newEntity" , 'entity/company', State.S.selectedCompany ), 
            newDatom( "newEntity" , "transaction/transactionType", 10105 ), 
            newDatom( "newEntity" , "entity/sourceDocument", sourceDocument ), 
            newDatom( "newEntity" , "transaction/originNode", State.DB.get( sourceDocument, 11177) ? 10709 : State.DB.get( State.DB.get( sourceDocument, 11180), 7463) ),
            newDatom( "newEntity" , "transaction/destinationNode", State.DB.get( sourceDocument, 7048) ),
            newDatom( "newEntity" , "eventAttribute/1139",  "Aksjekjøp" )
        ]),
        "SharePurchasesPage/recordShareSale": sourceDocument => State.Actions.postDatoms( [
            newDatom( "newEntity1" , 'entity/entityType', 7948 ),
            newDatom( "newEntity1" , 'entity/company', State.S.selectedCompany ), 
            newDatom( "newEntity1" , "transaction/transactionType", 8976 ), 
            newDatom( "newEntity1" , "entity/sourceDocument", sourceDocument ), 
            newDatom( "newEntity1" , "transaction/originNode", State.DB.get( sourceDocument, 7048)),
            newDatom( "newEntity1" , "transaction/destinationNode", State.DB.get( sourceDocument, 11177) ? 10747 : State.DB.get( State.DB.get( sourceDocument, 11180), 7463) ),
            newDatom( "newEntity1" , "eventAttribute/1139",  "Salgsvederlag" ),

            newDatom( "newEntity2" , 'entity/entityType', 7948 ),
            newDatom( "newEntity2" , 'entity/company', State.S.selectedCompany ), 
            newDatom( "newEntity2" , "transaction/transactionType", 9035 ), 
            newDatom( "newEntity2" , "entity/sourceDocument", sourceDocument ), 
            newDatom( "newEntity2" , "transaction/originNode", 10686),
            newDatom( "newEntity2" , "transaction/destinationNode", State.DB.get( sourceDocument, 7048) ),
            newDatom( "newEntity2" , "eventAttribute/1139",  "Gevinst ved salg av verdipapir" )
        ])
        })
  }


  
  let sharePurchaseView = State => isDefined( State.S.selectedEntity) 
    ? singleShareTransactionView( State )
    : allSharePurchasesView( State )
  
  let allSharePurchasesView = State => d([
    h3("Alle verdipapirtransaksjoner"),
    d([
        entityLabelWithPopup( State, 1757 ),
        entityLabelWithPopup( State, 10070 ),
        entityLabelWithPopup( State, 7048 ),
        entityLabelWithPopup( State, 1100 ),
        entityLabelWithPopup( State, 10107 ),
        entityLabelWithPopup( State, 10401 ),
        d("")
    ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr 1fr")}),
    d( State.DB.get( State.S.selectedCompany, 10073 )
        .filter( sourceDocument => [10096, 10111].includes( State.DB.get(sourceDocument, 10070 ) )   )
        .map( sourceDocument => d([
        lockedSingleValueView( State, sourceDocument, 1757 ),
        lockedSingleValueView( State, sourceDocument, 10070 ),
        lockedSingleValueView( State, sourceDocument, 7048 ),
        lockedSingleValueView( State, sourceDocument, 1100 ),
        lockedSingleValueView( State, sourceDocument, 10107 ),
        d(State.DB.get(sourceDocument, 10401) ? "✅" : "🚧"),
        submitButton( "Vis", () => State.Actions["SharePurchasesPage/selectSourceDocument"]( sourceDocument ))
    ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr 1fr")}) )),
  br(),
  submitButton( "Registrer nytt aksjekjøp", () => State.Actions["SharePurchasesPage/newSharePurchase"]( )),
  submitButton( "Registrer nytt aksjesalg", () => State.Actions["SharePurchasesPage/newShareSale"]( )),
  ]) 

  
  let singleShareTransactionView = State => d([
    submitButton( " <---- Tilbake ", () => State.Actions["SharePurchasesPage/selectSourceDocument"]( undefined )  ),
    br(),
    entityAttributeView(State, State.S.selectedEntity, 10070, true ),
    entityAttributeView(State, State.S.selectedEntity, 11174, true ),
    entityAttributeView(State, State.S.selectedEntity, 11477, State.DB.get(State.S.selectedEntity, 10401) ),
    br(),
    entityAttributeView(State, State.S.selectedEntity, 1757, State.DB.get(State.S.selectedEntity, 10401) ),
    entityAttributeView(State, State.S.selectedEntity, 7048, State.DB.get(State.S.selectedEntity, 10401) ),
    entityAttributeView(State, State.S.selectedEntity, 1100, State.DB.get(State.S.selectedEntity, 10401) ),
    
    entityAttributeView(State, State.S.selectedEntity, 11177, State.DB.get(State.S.selectedEntity, 10401) ),
    br(),
    State.DB.get(State.S.selectedEntity, 11177)
        ? d([
            entityAttributeView(State, State.S.selectedEntity, 1083, State.DB.get(State.S.selectedEntity, 10401) ),
            entityAttributeView(State, State.S.selectedEntity, 10103, State.DB.get(State.S.selectedEntity, 10401) )
        ]) 
        : entityAttributeView(State, State.S.selectedEntity, 11180, State.DB.get(State.S.selectedEntity, 10401) ),
    br(),
    entityAttributeView(State, State.S.selectedEntity, 10107, true ),
    br(),
    State.DB.get(State.S.selectedEntity, "sourceDocument/sourceDocumentType") === 10111
        ? d([
            entityAttributeView(State, State.S.selectedEntity, 10490, true ),
            entityAttributeView(State, State.S.selectedEntity, 10491, true ),
        ])
        : d(""),
    br(),
    recordShareTransactionView(State, State.S.selectedEntity)
  ])

  



let recordShareTransactionView = (State, sourceDocument) => d([
    d([
        d("Tilknyttede transaksjoner:"),
        State.DB.get(sourceDocument, 10401)
            ? d( State.DB.get(sourceDocument, 10402).map( transaction => transactionFlowView( State, transaction) ) )
            : d("Ingen bokførte transaksjoner")
        ], {class: "feedContainer"}),
    State.DB.get(sourceDocument, 11012)
    ?  State.DB.get(sourceDocument, 10401)
        ? d("Regnskapsåret for angitt dato er avsluttet. Tilbakestill årsavslutningen for å endre bilaget.")
        : d("Regnskapsåret for angitt dato er avsluttet. Tilbakestill årsavslutningen først, eller velg en senere dato.")
    : State.DB.get(sourceDocument, 10401)
        ? submitButton("Tilbakestill bokføring", () => State.Actions.retractEntities( State.DB.get(sourceDocument, 10402) )  )
        : d([
            [1757, 7048, 1100, 11177].every( attribute => isDefined( State.DB.get(sourceDocument, attribute) ) ) && ( isDefined( State.DB.get(sourceDocument, 11180) ) || isDefined( State.DB.get(sourceDocument, 10103) ) )
                ? State.DB.get(State.S.selectedEntity, "sourceDocument/sourceDocumentType") === 10096
                    ? submitButton("Bokfør aksjekjøp", () => State.Actions["SharePurchasesPage/recordSharePurchase"]( State.S.selectedEntity )   )
                    : submitButton("Bokfør aksjesalg", () => State.Actions["SharePurchasesPage/recordShareSale"]( State.S.selectedEntity )   )
                : d("Fyll ut alle felter for å bokføre"),
            submitButton("Slett", e => State.Actions["SharePurchasesPage/retractSourceDocument"]( sourceDocument ) )
        ])   
])