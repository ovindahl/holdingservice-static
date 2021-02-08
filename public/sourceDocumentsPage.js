const SourceDocumentsPage = {
    initial: DB => returnObject({ 
      "SourceDocumentsPage/selectedSourceDocument": undefined
    }),
    Actions: State => returnObject({
        "SourceDocumentsPage/selectSourceDocument": entity => updateState( State, {S: {selectedPage: 10072, "SourceDocumentsPage/selectedSourceDocument": entity}}),
        "SourceDocumentsPage/recordSourceDocument": sourceDocument => {


            let sourceDocumentTypeActions = {
                "10096": sourceDocument => newTransactionDatoms( 
                    10105, 
                    sourceDocument, 
                    10110, 
                    State.DB.get( sourceDocument, 7048), 
                    State.DB.get( sourceDocument, 1757), 
                    "Aksjekjøp" ),
                "10123": sourceDocument => newTransactionDatoms( 
                    10130, 
                    sourceDocument, 
                    10110, 
                    State.DB.get(State.S.selectedCompany, 10052)(7857)[0],
                    State.DB.get( sourceDocument, 1757), 
                    "Vedtak av tilleggsutbytte" ),
                "10111": sourceDocument => [
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
                ].flat(),
                "10165": sourceDocument => newTransactionDatoms( 
                    8954, 
                    sourceDocument, 
                    State.DB.get(State.S.selectedCompany, 10052)(10167)[0],
                    State.DB.get(State.S.selectedCompany, 10052)(8743)[0],
                    State.DB.get( sourceDocument, 1757), 
                    "Driftskostnad" ),
                "10132": sourceDocument => newTransactionDatoms( 
                    State.DB.get( sourceDocument, 9084) === 9086 ? 8955 : 8975, 
                    sourceDocument, 
                    State.DB.get( sourceDocument, 9084) === 9086 ? State.DB.get( sourceDocument, 7463) : State.DB.get( sourceDocument, 10200),
                    State.DB.get( sourceDocument, 9084) === 9086 ? State.DB.get( sourceDocument, 10200) : State.DB.get( sourceDocument, 7463),
                    State.DB.get( sourceDocument, 1757), 
                    State.DB.get( sourceDocument, 8831) ),
                    
            }
            
            
            
            let newTransactionDatoms = (transactionType, sourceDocument, originNode, destinationNode, date, description, index) => [
                newDatom( isDefined(index) ? `newEntity_${index}`  : "newEntity" , 'entity/entityType', 7948 ),
                newDatom( isDefined(index) ? `newEntity_${index}`  : "newEntity" , 'entity/company', State.S.selectedCompany ), 
                newDatom( isDefined(index) ? `newEntity_${index}`  : "newEntity" , 'transaction/accountingYear', State.S["TransactionsPage/selectedAccountingYear"] ), 
                newDatom( isDefined(index) ? `newEntity_${index}`  : "newEntity" , "transaction/transactionType", transactionType ), 
                newDatom( isDefined(index) ? `newEntity_${index}`  : "newEntity" , "entity/sourceDocument", sourceDocument ), 
                newDatom( isDefined(index) ? `newEntity_${index}`  : "newEntity" , "transaction/originNode", originNode ),
                newDatom( isDefined(index) ? `newEntity_${index}`  : "newEntity" , "transaction/destinationNode", destinationNode ),
                newDatom( isDefined(index) ? `newEntity_${index}`  : "newEntity" , "event/date", date ), 
                newDatom( isDefined(index) ? `newEntity_${index}`  : "newEntity" , "eventAttribute/1139", description )
              ]


              let sourceDocumentType = State.DB.get( sourceDocument, "sourceDocument/sourceDocumentType")

              let datoms = isDefined( sourceDocumentTypeActions[ sourceDocumentType ] ) ? sourceDocumentTypeActions[ sourceDocumentType ](sourceDocument) : undefined

              State.Actions.postDatoms( datoms )


        }
    })
  }

  
  let sourceDocumentLabel = (State, sourceDocument, onclick) => entityLabelWithPopup( State, sourceDocument, isDefined(onclick) ? onclick : () => State.Actions["SourceDocumentsPage/selectSourceDocument"] )
  
  
  let sourceDocumentsView = State => isDefined( State.S["SourceDocumentsPage/selectedSourceDocument"]) ? singleSourceDocumentView( State ) : allSourceDocumentsView( State )
  
  let allSourceDocumentsView = State => d([
      h3("Bilag"),
    /* d([
      entityLabelWithPopup( State, 1113 ),
      entityLabelWithPopup( State, 10070 ),
    ], {style: gridColumnsStyle("1fr 1fr 3fr")}), */
    d( State.DB.get( State.S.selectedCompany, 10073 ).map( sourceDocument => d([
        sourceDocumentLabel( State, sourceDocument, () => State.Actions["SourceDocumentsPage/selectSourceDocument"]( sourceDocument ) ),
        entityLabelWithPopup( State, State.DB.get(sourceDocument, 10070) ),
        lockedSingleValueView( State, sourceDocument, 1757 ),
        d( State.DB.get(State.S.selectedCompany, 9817).filter( transaction => State.DB.get(transaction, 9104) === sourceDocument ).length > 0 ? "✅" : "🚧" )
    ], {style: gridColumnsStyle("1fr 1fr 1fr 3fr")}) )),
  br(),
  //submitButton("Legg til", () => State.Actions["ActorsPage/createActor"]() ),
  br(),
  ]) 

  let prevNextSourceDocumentView = State => {

    let all = State.DB.get( State.S.selectedCompany, 10073 )

    let currentIndex = all.findIndex( entity => entity === State.S["SourceDocumentsPage/selectedSourceDocument"] )
  
    let prev = all[ currentIndex - 1 ]
    let next = all[ currentIndex + 1 ]
  
    return d([
      d([
        d([
          isDefined( prev ) ? submitButton("<", () => State.Actions["SourceDocumentsPage/selectSourceDocument"](prev) ) : d(""),
          isDefined( next ) ? submitButton(">", () => State.Actions["SourceDocumentsPage/selectSourceDocument"](next) ) : d(""),
        ], {style: gridColumnsStyle("3fr 1fr")})
      ], {style: gridColumnsStyle("3fr 1fr")}),
    ])
  }
  
  let singleSourceDocumentView = State => {


    let sourceDocumentTransactions = State.DB.get(State.S.selectedCompany, 9817).filter( transaction => State.DB.get(transaction, 9104) === State.S["SourceDocumentsPage/selectedSourceDocument"] )

    return d([
        submitButton( " <---- Tilbake ", () => State.Actions["SourceDocumentsPage/selectSourceDocument"]( undefined )  ),
        prevNextSourceDocumentView( State ),
        br(),
        entityAttributeView(State, State.S["SourceDocumentsPage/selectedSourceDocument"], 10070),
        br(),
        isDefined( State.DB.get( State.S["SourceDocumentsPage/selectedSourceDocument"], "sourceDocument/sourceDocumentType") )
            ? d([
                d( State.DB.get( State.DB.get( State.S["SourceDocumentsPage/selectedSourceDocument"], "sourceDocument/sourceDocumentType"), 7942 ).map( attribute => entityAttributeView(State, State.S["SourceDocumentsPage/selectedSourceDocument"], attribute ) ) ),
                    sourceDocumentTransactions.length > 0
                        ? d([
                            d("Tilknyttede transaksjoner"),
                            d( sourceDocumentTransactions.map( transaction => transactionFlowView( State, transaction) ) ),
                            submitButton("Tilbakestill bokføring", () => State.Actions.retractEntities( sourceDocumentTransactions )  )
                        ]) 
                        : submitButton("Bokfør", () => State.Actions["SourceDocumentsPage/recordSourceDocument"]( State.S["SourceDocumentsPage/selectedSourceDocument"] )   )
            ]) 
            : d(""),
        
        //submitButton("Slett", e => State.Actions["ActorsPage/retractActor"]( State.S["SourceDocumentsPage/selectedSourceDocument"] ) ),  
      ])
  } 



