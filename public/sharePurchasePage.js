const SharePurchasesPage = {
    initial: DB => returnObject({ 
      "SharePurchasesPage/selectedSourceDocument": undefined
    }),
    Actions: State => returnObject({
        "SharePurchasesPage/selectSourceDocument": entity => updateState( State, {S: {selectedPage: 10041, "SharePurchasesPage/selectedSourceDocument": entity}}),
        "SharePurchasesPage/newSharePurchase": () => State.Actions.postDatoms([
            newDatom( "newEntity", "entity/entityType", 10062 ),
            newDatom( "newEntity", "sourceDocument/sourceDocumentType", 10096 ),
            newDatom( "newEntity", 1757, Date.now() ),
            newDatom( "newEntity", 10300, State.DB.get(State.S.selectedCompany, 10061).slice(-1)[0] ),
            newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
            newDatom( 'newEntity' , "eventAttribute/1139", "Nytt aksjekjøp" ), 
        ] ),
        "SharePurchasesPage/newShareSale": () => State.Actions.postDatoms([
            newDatom( "newEntity", "entity/entityType", 10062 ),
            newDatom( "newEntity", "sourceDocument/sourceDocumentType", 10111 ),
            newDatom( "newEntity", 1757, Date.now() ),
            newDatom( "newEntity", 10300, State.DB.get(State.S.selectedCompany, 10061).slice(-1)[0] ),
            newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
            newDatom( 'newEntity' , "eventAttribute/1139", "Nytt aksjesalg" ), 
        ] ),
        "SharePurchasesPage/recordSharePurchase": sourceDocument => State.Actions.postDatoms( [
            newDatom( "newEntity" , 'entity/entityType', 7948 ),
            newDatom( "newEntity" , 'entity/company', State.S.selectedCompany ), 
            newDatom( "newEntity" , 'transaction/accountingYear', State.DB.get(State.S.selectedCompany, 10061).slice(-1)[0] ), 
            newDatom( "newEntity" , "transaction/transactionType", 10105 ), 
            newDatom( "newEntity" , "entity/sourceDocument", sourceDocument ), 
            newDatom( "newEntity" , "transaction/originNode", 10110 ),
            newDatom( "newEntity" , "transaction/destinationNode", State.DB.get( sourceDocument, 7048) ),
            newDatom( "newEntity" , "event/date", State.DB.get( sourceDocument, 1757) ), 
            newDatom( "newEntity" , "eventAttribute/1139",  "Aksjekjøp" )
        ]),
        "SharePurchasesPage/recordShareSale": sourceDocument => State.Actions.postDatoms( [
            newTransactionDatoms( 
                8976, 
                sourceDocument, 
                State.DB.get( sourceDocument, 7048),
                10155, 
                State.DB.get( sourceDocument, 1757), 
                "Salgsvederlag",
                1 ),
            newTransactionDatoms( 
                9035, 
                sourceDocument, 
                State.DB.get(State.S.selectedCompany, 10052)(8744)[0],
                State.DB.get( sourceDocument, 7048), 
                State.DB.get( sourceDocument, 1757), 
                "Gevinst ved salg av verdipapir",
                2 ),
        ].flat()),
        
            
    })
  }


  
  let sharePurchaseView = State => isDefined( State.S["SharePurchasesPage/selectedSourceDocument"]) 
    ? singleShareTransactionView( State )
    : allSharePurchasesView( State )
  
  let allSharePurchasesView = State => d([
    h3("Alle verdipapirtransaksjoner"),
    d([
        entityLabelWithPopup( State, 1757 ),
        entityLabelWithPopup( State, 10070 ),
        entityLabelWithPopup( State, 7048 ),
        entityLabelWithPopup( State, 10103 ),
        entityLabelWithPopup( State, 1100 ),
        entityLabelWithPopup( State, 1083 ),
        entityLabelWithPopup( State, 10401 ),
        d("")
    ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr")}),
    d( State.DB.get( State.S.selectedCompany, 10073 )
        .filter( sourceDocument => [10096, 10111].includes( State.DB.get(sourceDocument, 10070 ) )   )
        .map( sourceDocument => d([
        lockedSingleValueView( State, sourceDocument, 1757 ),
        lockedSingleValueView( State, sourceDocument, 10070 ),
        lockedSingleValueView( State, sourceDocument, 7048 ),
        lockedSingleValueView( State, sourceDocument, 10103 ),
        lockedSingleValueView( State, sourceDocument, 1100 ),
        lockedSingleValueView( State, sourceDocument, 1083 ),
        d(State.DB.get(sourceDocument, 10401) ? "✅" : "🚧"),
        submitButton( "Vis", () => State.Actions["SharePurchasesPage/selectSourceDocument"]( sourceDocument ))
    ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr")}) )),
  br(),
  submitButton( "Registrer nytt aksjekjøp", () => State.Actions["SharePurchasesPage/newSharePurchase"]( )),
  submitButton( "Registrer nytt aksjesalg", () => State.Actions["SharePurchasesPage/newShareSale"]( )),
  ]) 

  
  let singleShareTransactionView = State => d([
    submitButton( " <---- Tilbake ", () => State.Actions["SharePurchasesPage/selectSourceDocument"]( undefined )  ),
    //prevNextSourceDocumentView( State ),
    br(),
    entityAttributeView(State, State.S["SharePurchasesPage/selectedSourceDocument"], 10070, true ),
    br(),
    d( State.DB.get( State.DB.get( State.S["SharePurchasesPage/selectedSourceDocument"], "sourceDocument/sourceDocumentType"), 7942 )
        .map( attribute => entityAttributeView(State, State.S["SharePurchasesPage/selectedSourceDocument"], attribute, State.DB.get(State.S["SharePurchasesPage/selectedSourceDocument"], 10401) ) ) 
    ),
    br(),
    d([
        State.DB.get(State.S["SharePurchasesPage/selectedSourceDocument"], 10401)
            ? d([
                d( State.DB.get(State.S["SharePurchasesPage/selectedSourceDocument"], 10402).map( transaction => transactionFlowView( State, transaction) ) ),
                submitButton("Tilbakestill bokføring", () => State.Actions.retractEntities( State.DB.get(State.S["SharePurchasesPage/selectedSourceDocument"], 10402) )  )
            ]) 
            : d([
                State.DB.get(State.S["SharePurchasesPage/selectedSourceDocument"], "sourceDocument/sourceDocumentType") === 10096
                    ? submitButton("Bokfør aksjekjøp", () => State.Actions["SharePurchasesPage/recordSharePurchase"]( State.S["SharePurchasesPage/selectedSourceDocument"] )   )
                    : submitButton("Bokfør aksjesalg", () => State.Actions["SharePurchasesPage/recordShareSale"]( State.S["SharePurchasesPage/selectedSourceDocument"] )   ),
                br(),
                submitButton("Slett", State.DB.get(State.S["SharePurchasesPage/selectedSourceDocument"], e => State.Actions["SourceDocumentsPage/retractSourceDocument"]( State.S["SharePurchasesPage/selectedSourceDocument"] )) )
            ]) 
    ]) 
  ])

  



