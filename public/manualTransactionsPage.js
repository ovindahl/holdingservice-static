const ManualTransactionsPage = {
    initial: DB => returnObject({ 
      "ManualTransactionsPage/selectedSourceDocument": undefined
    }),
    Actions: State => returnObject({
        "ManualTransactionsPage/selectSourceDocument": entity => updateState( State, {S: {selectedPage: 10042, "ManualTransactionsPage/selectedSourceDocument": entity}}),
        "ManualTransactionsPage/new": () => State.Actions.postDatoms([
            newDatom( "newEntity", "entity/entityType", 10062 ),
            newDatom( "newEntity", "sourceDocument/sourceDocumentType", 10317 ),
            newDatom( "newEntity", 1757, Date.now() ),
            newDatom( "newEntity",  'transaction/accountingYear', State.DB.get(State.S.selectedCompany, 10061).slice(-1)[0] ),
            newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
            newDatom( 'newEntity' , "eventAttribute/1139", "Fri postering" ), 
        ] ),
        "ManualTransactionsPage/recordSharePurchase": sourceDocument => State.Actions.postDatoms( [
            newDatom( "newEntity" , 'entity/entityType', 7948 ),
            newDatom( "newEntity" , 'entity/company', State.S.selectedCompany ), 
            newDatom( "newEntity" , 'transaction/accountingYear',  State.DB.get( sourceDocument, 10300) ), 
            newDatom( "newEntity" , "transaction/transactionType", 8019 ), 
            newDatom( "newEntity" , "entity/sourceDocument", sourceDocument ), 
            newDatom( "newEntity" , "transaction/originNode", State.DB.get( sourceDocument, 7867) ),
            newDatom( "newEntity" , "transaction/destinationNode", State.DB.get( sourceDocument, 7866) ),
            newDatom( "newEntity" , "event/date", State.DB.get( sourceDocument, 1757) ), 
            newDatom( "newEntity" , "eventAttribute/1139",  State.DB.get( sourceDocument, 1139) )
        ])
            
    })
  }


  
  let manualTransactionsView = State => isDefined( State.S["ManualTransactionsPage/selectedSourceDocument"]) ? singleManualTransactionView( State ) : allManualTransactionsView( State )
  
  let allManualTransactionsView = State => d([
    h3("Alle fri posteringer"),
    d([
        entityLabelWithPopup( State, 1757 ),
        entityLabelWithPopup( State, 7867 ),
        entityLabelWithPopup( State, 7866 ),
        entityLabelWithPopup( State, 1083 ),
        entityLabelWithPopup( State, 10401 ),
    ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr")}),
    d( State.DB.get( State.S.selectedCompany, 10073 )
        .filter( sourceDocument => [10317].includes( State.DB.get(sourceDocument, 10070 ) )   )
        .map( sourceDocument => d([
        lockedSingleValueView( State, sourceDocument, 1757 ),
        lockedSingleValueView( State, sourceDocument, 7867 ),
        lockedSingleValueView( State, sourceDocument, 7866 ),
        lockedSingleValueView( State, sourceDocument, 1083 ),
        d(State.DB.get(sourceDocument, 10401) ? "✅" : "🚧"),
        submitButton( "Vis", () => State.Actions["ManualTransactionsPage/selectSourceDocument"]( sourceDocument ))
    ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr")}) )),
  br(),
  submitButton( "Ny fri postering", () => State.Actions["ManualTransactionsPage/new"]( ))
  ]) 

  
  let singleManualTransactionView = State => {


    

    return d([
        submitButton( " <---- Tilbake ", () => State.Actions["ManualTransactionsPage/selectSourceDocument"]( undefined )  ),
        prevNextSourceDocumentView( State ),
        br(),
        entityAttributeView(State, State.S["ManualTransactionsPage/selectedSourceDocument"], 10070, true),
        br(),
        isDefined( State.DB.get( State.S["ManualTransactionsPage/selectedSourceDocument"], "sourceDocument/sourceDocumentType") ) 
            ? d( State.DB.get( State.DB.get( State.S["ManualTransactionsPage/selectedSourceDocument"], "sourceDocument/sourceDocumentType"), 7942 ).map( attribute => entityAttributeView(State, State.S["ManualTransactionsPage/selectedSourceDocument"], attribute, State.DB.get(State.S["ManualTransactionsPage/selectedSourceDocument"], 10401) ) ) ) 
            : d(""),
        br(),
        d([
            State.DB.get(State.S["ManualTransactionsPage/selectedSourceDocument"], 10401)
                ? d([
                    d("Tilknyttede transaksjoner"),
                    d( State.DB.get(State.S["ManualTransactionsPage/selectedSourceDocument"], 10402).map( transaction => transactionFlowView( State, transaction) ) ),
                    submitButton("Tilbakestill bokføring", () => State.Actions.retractEntities( State.DB.get(State.S["ManualTransactionsPage/selectedSourceDocument"], 10402) )  )
                ]) 
                : d([
                    submitButton("Bokfør", () => State.Actions["ManualTransactionsPage/recordSharePurchase"]( State.S["ManualTransactionsPage/selectedSourceDocument"] )   ),
                    br(),
                    submitButton("Slett", e => State.Actions["SourceDocumentsPage/retractSourceDocument"]( State.S["ManualTransactionsPage/selectedSourceDocument"] ) )
                ]) 
    ]) 
      ])
  } 



