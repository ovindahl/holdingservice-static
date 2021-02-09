const SourceDocumentsPage = {
    initial: DB => returnObject({ 
      "SourceDocumentsPage/selectedSourceDocument": undefined
    }),
    Actions: State => returnObject({
        "SourceDocumentsPage/selectSourceDocument": entity => updateState( State, {S: {selectedPage: 10072, "SourceDocumentsPage/selectedSourceDocument": entity}}),
        "SourceDocumentsPage/retractSourceDocument": async entity => updateState( State, { DB: await Transactor.retractEntity(State.DB, entity), S: {"SourceDocumentsPage/selectedSourceDocument": undefined } } ),
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
                    State.DB.get(State.S.selectedCompany, 10052)(10263)[0], 
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
                "10298": sourceDocument => newTransactionDatoms( 
                    9286, 
                    sourceDocument, 
                    State.DB.get(State.S.selectedCompany, 10052)([10302])[0],
                    State.DB.get(State.S.selectedCompany, 10052)([8746])[0],
                    State.DB.get( sourceDocument, 1757), 
                    "Årets skattekostnad"
                ),
                "10309": sourceDocument => newTransactionDatoms( 
                    9384, 
                    sourceDocument, 
                    State.DB.get(State.S.selectedCompany, 10052)([8741])[0],
                    State.DB.get(State.S.selectedCompany, 10052)([8784])[0],
                    State.DB.get( sourceDocument, 1757), 
                    "Årets resultat"
                ),
                "10317": sourceDocument => [
                    newDatom( "newEntity" , 'entity/entityType', 7948 ),
                    newDatom( "newEntity" , 'entity/company', State.S.selectedCompany ), 
                    newDatom( "newEntity" , 'transaction/accountingYear', State.DB.get( sourceDocument, 10300 ) ), 
                    newDatom( "newEntity" , "transaction/transactionType", 8019 ), 
                    newDatom( "newEntity" , "entity/sourceDocument", sourceDocument ), 
                    newDatom( "newEntity" , "transaction/originNode", State.DB.get( sourceDocument, "transaction/originNode") ),
                    newDatom( "newEntity" , "transaction/destinationNode", State.DB.get( sourceDocument, "transaction/destinationNode") ),
                    newDatom( "newEntity" , "event/date", State.DB.get( sourceDocument, 1757),  ), 
                    newDatom( "newEntity" , "eventAttribute/1139", State.DB.get( sourceDocument, 1139)  )
                  ]
            }
            
            
            
            


              let sourceDocumentType = State.DB.get( sourceDocument, "sourceDocument/sourceDocumentType")

              let datoms = isDefined( sourceDocumentTypeActions[ sourceDocumentType ] ) ? sourceDocumentTypeActions[ sourceDocumentType ](sourceDocument) : undefined

              State.Actions.postDatoms( datoms )


        }
    })
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
  
  
  let sourceDocumentLabel = (State, sourceDocument, onclick) => d([d(` ${ State.DB.get(State.S.selectedCompany, 9817).filter( transaction => State.DB.get(transaction, 9104) === sourceDocument ).length > 0 ? "✅" : "🚧" } Bilag ${ State.DB.get(sourceDocument, 6) }`, {class: "entityLabel", style: `background-color:${State.DB.get( State.DB.get(sourceDocument, "sourceDocument/sourceDocumentType"), 20  )};`}, "click", isDefined(onclick) ? onclick : () => State.Actions["SourceDocumentsPage/selectSourceDocument"](sourceDocument) )], {style:"display: flex;"})

  
  
  
  let sourceDocumentsView = State => isDefined( State.S["SourceDocumentsPage/selectedSourceDocument"]) ? singleSourceDocumentView( State ) : allSourceDocumentsView( State )
  
  let allSourceDocumentsView = State => d([
      h3("Bilag"),
    d( State.DB.get( State.S.selectedCompany, 10073 )
        .filter( sourceDocument => ![10132, 10096, 10111, 10317].includes( State.DB.get(sourceDocument, 10070 ) )  )
        .map( sourceDocument => d([
        sourceDocumentLabel( State, sourceDocument, () => State.Actions["SourceDocumentsPage/selectSourceDocument"]( sourceDocument ) ),
        entityLabelWithPopup( State, State.DB.get(sourceDocument, 10070) ),
        lockedSingleValueView( State, sourceDocument, 1757 ),
    ], {style: gridColumnsStyle("1fr 1fr 1fr 3fr")}) )),
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


    

    return d([
        submitButton( " <---- Tilbake ", () => State.Actions["SourceDocumentsPage/selectSourceDocument"]( undefined )  ),
        prevNextSourceDocumentView( State ),
        br(),
        entityAttributeView(State, State.S["SourceDocumentsPage/selectedSourceDocument"], 10070),
        br(),
        isDefined( State.DB.get( State.S["SourceDocumentsPage/selectedSourceDocument"], "sourceDocument/sourceDocumentType") ) ? d( State.DB.get( State.DB.get( State.S["SourceDocumentsPage/selectedSourceDocument"], "sourceDocument/sourceDocumentType"), 7942 ).map( attribute => entityAttributeView(State, State.S["SourceDocumentsPage/selectedSourceDocument"], attribute ) ) ) : d(""),
        br(),
        recordSourceDocumentView( State, State.S["SourceDocumentsPage/selectedSourceDocument"] )
      ])
  } 



let recordSourceDocumentView = (State, sourceDocument) => {

    let sourceDocumentTransactions = State.DB.get(State.S.selectedCompany, 9817).filter( transaction => State.DB.get(transaction, 9104) === State.S["SourceDocumentsPage/selectedSourceDocument"] )


    return isDefined( State.DB.get( sourceDocument, "sourceDocument/sourceDocumentType") )
    ? d([
            sourceDocumentTransactions.length > 0
                ? d([
                    d("Tilknyttede transaksjoner"),
                    d( sourceDocumentTransactions.map( transaction => transactionFlowView( State, transaction) ) ),
                    submitButton("Tilbakestill bokføring", () => State.Actions.retractEntities( sourceDocumentTransactions )  )
                ]) 
                : d([
                    submitButton("Bokfør", () => State.Actions["SourceDocumentsPage/recordSourceDocument"]( sourceDocument )   ),
                    br(),
                    submitButton("Slett", e => State.Actions["SourceDocumentsPage/retractSourceDocument"]( sourceDocument ) )
                ]) 
    ]) 
    : d("")



} 