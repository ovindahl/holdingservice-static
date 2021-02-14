const BankImportPage = {
    entity: 10038,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({
        "BankImportPage/selectSourceDocument": entity => updateState( State, {S: {selectedPage: 10038, selectedEntity: entity}}),
        "BankImportPage/retractSourceDocument": async entity => updateState( State, { DB: await Transactor.retractEntity(State.DB, entity), S: {selectedEntity: undefined } } ),
        "BankImportPage/createBankImport": () => State.Actions.postDatoms([
            newDatom( "newEntity", "entity/entityType", 10062 ),
            newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
            newDatom( 'newEntity' , "sourceDocument/sourceDocumentType", 10064 ), 
            newDatom( 'newEntity' , 1757, Date.now() ), 
            newDatom( 'newEntity' , "entity/label", " Bankimport opprettet " + moment( Date.now() ).format( "DD.MM.YYYY HH:mm" ) ), 
        ] ),
        "BankImportPage/importBankSourceDocuments": sourceDocument => {

            let importedFile = State.DB.get( sourceDocument, 1759)
            let existingIDs = State.DB.get(State.S.selectedCompany, 9817).map( transaction =>  State.DB.get(transaction, 1080)  ).filter( id => isDefined(id) )
            let unImportedRows = importedFile.filter( row => row.length > 1 ).slice(5).filter( row => !existingIDs.includes(row[7])  )
            let bankAccount = State.DB.get( sourceDocument, 7463 )

            let newDatoms = unImportedRows.map( (transactionRow, index) => constructBankTransactionSourceDocumentDatoms(State, transactionRow, index, bankAccount, sourceDocument)  ).flat()

            State.Actions.postDatoms( newDatoms )


        },
        "BankImportPage/splitTransaction": sourceDocument => State.Actions.postDatoms([
            newDatom( "newEntity", "entity/entityType", 10062 ),
            newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
            newDatom( 'newEntity' , "sourceDocument/sourceDocumentType", 10465 ), 
            newDatom( 'newEntity' , 9084, State.DB.get(sourceDocument, 9084) ), 
            newDatom( 'newEntity' , 9011, sourceDocument ), 
            newDatom( 'newEntity' , 7463, State.DB.get(sourceDocument, 7463) ), 
            newDatom( 'newEntity' , 1757, State.DB.get(sourceDocument, 1757) ), 
            newDatom( 'newEntity' , 1083, 0 ), 
            newDatom( 'newEntity' , "entity/label", "Splittet banktransaksjon" ), 
        ] ),
        "BankImportPage/recordSourceDocument": sourceDocument => State.Actions.postDatoms( [
            newDatom( "newEntity" , 'entity/entityType', 7948 ),
            newDatom( "newEntity" , 'entity/company', State.S.selectedCompany ), 
            newDatom( "newEntity" , "transaction/transactionType", State.DB.get( sourceDocument, 9084) === 9086 ? 8955 : 8975 ), 
            newDatom( "newEntity" , "entity/sourceDocument", sourceDocument ), 
            newDatom( "newEntity" , "transaction/originNode", State.DB.get( sourceDocument, 9084) === 9086 ? State.DB.get( sourceDocument, 7463) : State.DB.get( sourceDocument, 10200) ),
            newDatom( "newEntity" , "transaction/destinationNode", State.DB.get( sourceDocument, 9084) === 9086 ? State.DB.get( sourceDocument, 10200) : State.DB.get( sourceDocument, 7463) ),
            newDatom( "newEntity" , "eventAttribute/1139", "Bankbetaling" )
          ])
    })
  }


let bankImportView = State => isDefined( State.S.selectedEntity) 
    ? State.DB.get(State.S.selectedEntity, 10070) === 10064
        ? singleBankImportView( State )
        : State.DB.get(State.S.selectedEntity, "sourceDocument/sourceDocumentType") === 10465
            ? splitTransactionView( State )
            : singleTransactionView( State )
    : allBankImportsView( State )

let allBankImportsView = State => d([
    h3("Importer banktransaksjoner"),
    br(),
    d("Her kan du laste opp og bokføre betalinger fra banken på en enkel måte."),
    br(),
    h3("Tidligerte filer"),
    d( State.DB.get( State.S.selectedCompany, 10073 )
        .filter( sourceDocument => State.DB.get(sourceDocument, 10070 ) === 10064 )
        .map( sourceDocument => d([
            entityLabelWithPopup( State, sourceDocument, () => State.Actions["BankImportPage/selectSourceDocument"]( sourceDocument ) ),
            entityLabelWithPopup( State, State.DB.get(sourceDocument, 10070) ),
            lockedSingleValueView( State, sourceDocument, 1757 )
        ], {style: gridColumnsStyle("1fr 1fr 1fr 3fr")}) )),
    br(),
    submitButton("Importer ny fil", () => State.Actions["BankImportPage/createBankImport"]( ) ),
    br(),
    h3("Importerte transaksjoner"),
    importedTransactionsTableView( State, State.DB.get( State.S.selectedCompany, 10073 ).filter( sourceDocument => [10132, 10465].includes( State.DB.get(sourceDocument, 10070 ) ) ) )
])


let importedTransactionsTableView = (State, transactions) => d([
    d([
        entityLabelWithPopup( State, 7463 ),
        entityLabelWithPopup( State, 9084 ),
        entityLabelWithPopup( State, 1757 ),
        entityLabelWithPopup( State, 8831 ),
        entityLabelWithPopup( State, 10107 ),
        entityLabelWithPopup( State, 11201 ),
        d("")
    ], {style: gridColumnsStyle("1fr 1fr 1fr 3fr 1fr 1fr 1fr")}),
    d( transactions .map( sourceDocument => d([
        lockedSingleValueView( State, sourceDocument, 7463, () => State.Actions["BankImportPage/selectSourceDocument"]( sourceDocument ) ),
        lockedSingleValueView( State, sourceDocument, 9084, () => State.Actions["BankImportPage/selectSourceDocument"]( sourceDocument ) ),
        lockedSingleValueView( State, sourceDocument, 1757 ),
        lockedSingleValueView( State, sourceDocument, 8831 ),
        d( formatNumber( State.DB.get(sourceDocument, 10107) ), {style: `text-align: right;color:${State.DB.get(sourceDocument, 9084) === 9086 ? "red" : "black"} ;`} ),
        d(State.DB.get(sourceDocument, 11201) ? "✅" : "🚧"),
        submitButton( "Vis", () => State.Actions["BankImportPage/selectSourceDocument"]( sourceDocument ))
    ], {style: gridColumnsStyle("1fr 1fr 1fr 3fr 1fr 1fr 1fr")}) ))
]) 
  
let singleBankImportView = State => {

return d([
    submitButton( " <---- Tilbake ", () => State.Actions["BankImportPage/selectSourceDocument"]( undefined )  ),
    br(),
    entityAttributeView(State, State.S.selectedEntity, 10070),
    br(),
    isDefined( State.DB.get( State.S.selectedEntity, "sourceDocument/sourceDocumentType") )
        ? d( State.DB.get( State.DB.get( State.S.selectedEntity, "sourceDocument/sourceDocumentType"), 7942 ).map( attribute => entityAttributeView(State, State.S.selectedEntity, attribute ) ) )
        : d(""),
    br(),
    d([
        entityLabelWithPopup( State, 10536 ),
        State.DB.get(State.S.selectedEntity, 10536).length > 0
        ? d([
                importedTransactionsTableView( State, State.DB.get(State.S.selectedEntity, 10536) ),
                State.DB.get(State.S.selectedCompany, 9817).filter( transaction => State.DB.get(State.S.selectedEntity, 10536).includes( State.DB.get(transaction, 9104) )  ).length > 0
                    ? d("Tilbakestill bokføring av bilagene for å slette")
                    : submitButton("Slett importerte transaksjoner", () => State.Actions.retractEntities( State.DB.get(State.S.selectedEntity, 10536) ) ),
            ]) 
        : d([
                d("Ingen importerte transaksjoner"),
                submitButton(`Importer transaksjoner fra fil`, () => State.Actions["BankImportPage/importBankSourceDocuments"]( State.S.selectedEntity ) ),
            ]) 
    ])
])
} 


let singleTransactionView = State => {

    let sourceDocument = State.S.selectedEntity


    return d([
        submitButton( " <---- Tilbake ", () => State.Actions["BankImportPage/selectSourceDocument"]( undefined )  ),
        br(),
        h3("Importert banktransaksjon"),
        entityAttributeView(State, sourceDocument, 10070, true),
        entityAttributeView(State, sourceDocument, 9104, true),
        br(),
        State.DB.get( sourceDocument, 9030).length > 0
            ? d([
                entityAttributeView(State, sourceDocument, 9030, true ),
                entityAttributeView(State, sourceDocument, 10470, true ),
                br()
                ])
            : d(""),
        d( State.DB.get( State.DB.get( sourceDocument, "sourceDocument/sourceDocumentType"), 7942 ).filter( e => e!== 10200 ).map( attribute => entityAttributeView(State, sourceDocument, attribute, true ) ) ),
        br(),
        h3("Bokføring"),

        isDefined( State.DB.get( sourceDocument, 11201 ) )
                ? d([
                    entityAttributeView(State, sourceDocument, 11201, true),
                    d( State.DB.get(State.DB.get( sourceDocument, 11201 ), 10402).map( transaction => transactionFlowView( State, transaction) ) )
                ])
                : d([
                    entityAttributeView(State, sourceDocument, 10200, State.DB.get(sourceDocument, 10401) ),
                    recordBankTransactionView( State, sourceDocument, true ),
                ])
        
        
    ])


} 



let splitTransactionView = State => {

    let sourceDocument = State.S.selectedEntity

    let recordedTransaction = State.DB.get(State.S.selectedCompany, 9817).find( transaction => State.DB.get(transaction, 9104) === sourceDocument )


    return d([
        submitButton( " <---- Tilbake ", () => State.Actions["BankImportPage/selectSourceDocument"]( undefined )  ),
        br(),
        h3("Splittet banktransaksjon"),
        entityAttributeView(State, sourceDocument, 10070, true),
        entityAttributeView(State, sourceDocument, 9011, true),
        entityAttributeView(State, sourceDocument, 7463, true),
        entityAttributeView(State, sourceDocument, 1757, true),
        br(),
        entityAttributeView(State, sourceDocument, 1083, isDefined(recordedTransaction) ),
        entityAttributeView(State, sourceDocument, 10200, isDefined(recordedTransaction) ),
        recordBankTransactionView( State, sourceDocument, false ),
        isDefined(recordedTransaction) ? d("") : submitButton("Slett", () => State.Actions["BankImportPage/retractSourceDocument"](sourceDocument) )
    ])


} 




let recordBankTransactionView = (State, sourceDocument, canSplit) => d([
    d([
        d("Bokføring:"),
        State.DB.get(sourceDocument, 10401)
            ? d( State.DB.get(sourceDocument, 10402).map( transaction => transactionFlowView( State, transaction) ) )
            : d("Ikke bokført")
        ], {class: "feedContainer"}),
        State.DB.get(sourceDocument, 11012)
            ? d("Regnskapsåret for angitt dato er avsluttet. Tilbakestill årsavslutningen for å endre bilaget.")
            : State.DB.get(sourceDocument, 10401)
                ? submitButton("Tilbakestill bokføring", () => State.Actions.retractEntities( State.DB.get(sourceDocument, 10402) )  )
                : d([
                    isDefined( State.DB.get(sourceDocument, 10200) )
                        ? submitButton("Bokfør", () => State.Actions["BankImportPage/recordSourceDocument"]( sourceDocument )   )
                        : d("Kategoriser betalingen for å bokføre"),
                    canSplit ? submitButton("Splitt i to", () => State.Actions["BankImportPage/splitTransaction"]( sourceDocument )   ) : d(""),

                    State.DB.get(sourceDocument, 9084) === 9086 
                        ? d([
                            submitButton("Bruk til å opprette verdipapirkjøp", () => State.Actions.postDatoms([
                                newDatom( "newEntity", "entity/entityType", 10062 ),
                                newDatom( "newEntity", "sourceDocument/sourceDocumentType", 10096 ),
                                newDatom( "newEntity", "sourceDocument/securityTransactionType", 11170 ),
                                newDatom( "newEntity", 1757, State.DB.get(sourceDocument, 1757) ),
                                newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
                                newDatom( 'newEntity' , "eventAttribute/1139", "Nytt aksjekjøp" ), 
                                newDatom( 'newEntity' , 11177, false ), 
                                newDatom( 'newEntity' , 11180, sourceDocument ), 
                            ] )  ),
                            submitButton("Bruk til å opprette driftskostnad", () => State.Actions.postDatoms([
                                newDatom( "newEntity", "entity/entityType", 10062 ),
                                newDatom( "newEntity", "sourceDocument/sourceDocumentType", 10165 ),
                                newDatom( "newEntity", 1757, State.DB.get(sourceDocument, 1757) ),
                                newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
                                newDatom( 'newEntity' , "eventAttribute/1139", "Ny driftskostnad" ), 
                                newDatom( 'newEntity' , 11177, false ), 
                                newDatom( 'newEntity' , 11180, sourceDocument ), 
                            ] )  )
                        ])
                        : d([
                            submitButton("Bruk til å opprette verdipapirsalg", () => State.Actions.postDatoms([
                                newDatom( "newEntity", "entity/entityType", 10062 ),
                                newDatom( "newEntity", "sourceDocument/sourceDocumentType", 10111 ),
                                newDatom( "newEntity", "sourceDocument/securityTransactionType", 11171 ),
                                newDatom( "newEntity", 1757, State.DB.get(sourceDocument, 1757) ),
                                newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
                                newDatom( 'newEntity' , "eventAttribute/1139", "Nytt aksjesalg" ), 
                                newDatom( 'newEntity' , 11177, false ), 
                                newDatom( 'newEntity' , 11180, sourceDocument ), 
                            ] )  )
                        ])

                    
                ])   
])










let constructBankTransactionSourceDocumentDatoms = ( State, transactionRow, index, selectedBankAccount, sourceDocument) => {

    let parseDNBamount = stringAmount => Number( stringAmount.replaceAll(".", "").replaceAll(",", ".") ) 
            
    let date = Number( moment( transactionRow[0], "DD.MM.YYYY" ).format("x") )
    let description = `${transactionRow[2]}: ${transactionRow[1]}`
  
    let paidAmount = transactionRow[5] === ""
      ? undefined
      : parseDNBamount( transactionRow[5] ) * -1
  
    let receivedAmount = transactionRow[6] === ""
    ? undefined
    :parseDNBamount( transactionRow[6] ) 
  
    let isPayment = isNumber( paidAmount )
  
    let referenceNumber = transactionRow[7]
  
    let Datoms = [
      newDatom( "newDatom_"+ index, "entity/entityType", 10062  ),
      newDatom( "newDatom_"+ index, "entity/company", State.S.selectedCompany  ),
      newDatom( "newDatom_"+ index, 10070, 10132 ),
      newDatom( "newDatom_"+ index, "transaction/paymentType", isPayment ? 9086 : 9087 ),
      newDatom( "newDatom_"+ index, 1757, date  ),
      newDatom( "newDatom_"+ index, 7463, selectedBankAccount),
      newDatom( "newDatom_"+ index, 1083, isPayment ? paidAmount : receivedAmount  ),
      newDatom( "newDatom_"+ index, 8831, description  ),
      newDatom( "newDatom_"+ index, "bankTransaction/referenceNumber", referenceNumber  ),
      newDatom( "newDatom_"+ index, "entity/sourceDocument", sourceDocument ),
      newDatom( "newDatom_"+ index, "entity/label", `[${transactionRow[0]}] Banktransaksjon: ${isPayment ? paidAmount : receivedAmount} `  ),
    ]
  
    return Datoms
  
  }
