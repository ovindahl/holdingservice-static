const BankImportPage = {
    initial: DB => returnObject({
        "BankImportPage/selectedSourceDocument": undefined
    }),
    Actions: State => returnObject({
        "BankImportPage/selectSourceDocument": entity => updateState( State, {S: {"BankImportPage/selectedSourceDocument": entity}}),
        "BankImportPage/retractSourceDocument": async entity => updateState( State, { DB: await Transactor.retractEntity(State.DB, entity), S: {"BankImportPage/selectedSourceDocument": undefined } } ),
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
            newDatom( 'newEntity' , 10300, State.DB.get(sourceDocument, 10300) ), 
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
            newDatom( "newEntity" , 'transaction/accountingYear', State.DB.get( sourceDocument, 10300 ) ), 
            newDatom( "newEntity" , "transaction/transactionType", State.DB.get( sourceDocument, 9084) === 9086 ? 8955 : 8975 ), 
            newDatom( "newEntity" , "entity/sourceDocument", sourceDocument ), 
            newDatom( "newEntity" , "transaction/originNode", State.DB.get( sourceDocument, 9084) === 9086 ? State.DB.get( sourceDocument, 7463) : State.DB.get( sourceDocument, 10200) ),
            newDatom( "newEntity" , "transaction/destinationNode", State.DB.get( sourceDocument, 9084) === 9086 ? State.DB.get( sourceDocument, 10200) : State.DB.get( sourceDocument, 7463) ),
            newDatom( "newEntity" , "event/date", State.DB.get( sourceDocument, 1757)  ), 
            newDatom( "newEntity" , "eventAttribute/1139", "Bankbetaling" )
          ])
    })
  }


let bankImportView = State => isDefined( State.S["BankImportPage/selectedSourceDocument"]) 
    ? State.DB.get(State.S["BankImportPage/selectedSourceDocument"], 10070) === 10064
        ? singleBankImportView( State )
        : State.DB.get(State.S["BankImportPage/selectedSourceDocument"], "sourceDocument/sourceDocumentType") === 10465
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
d([
    entityLabelWithPopup( State, 7463 ),
    entityLabelWithPopup( State, 9084 ),
    entityLabelWithPopup( State, 1757 ),
    entityLabelWithPopup( State, 8831 ),
    entityLabelWithPopup( State, 1083 ),
    entityLabelWithPopup( State, 10401 ),
    d("")
], {style: gridColumnsStyle("1fr 1fr 1fr 3fr 1fr 1fr 1fr")}),
d( State.DB.get( State.S.selectedCompany, 10073 )
    .filter( sourceDocument => [10132, 10465].includes( State.DB.get(sourceDocument, 10070 ) )   )
    .map( sourceDocument => d([
    lockedSingleValueView( State, sourceDocument, 7463, () => State.Actions["BankImportPage/selectSourceDocument"]( sourceDocument ) ),
    lockedSingleValueView( State, sourceDocument, 9084, () => State.Actions["BankImportPage/selectSourceDocument"]( sourceDocument ) ),
    lockedSingleValueView( State, sourceDocument, 1757 ),
    lockedSingleValueView( State, sourceDocument, 8831 ),
    lockedSingleValueView( State, sourceDocument, 1083 ),
    d(State.DB.get(sourceDocument, 10401) ? "✅" : "🚧"),
    submitButton( "Vis", () => State.Actions["BankImportPage/selectSourceDocument"]( sourceDocument ))
], {style: gridColumnsStyle("1fr 1fr 1fr 3fr 1fr 1fr 1fr")}) )),
])
  
let singleBankImportView = State => {

let importedFile = State.DB.get( State.S["BankImportPage/selectedSourceDocument"], 1759)



let rows = isDefined( importedFile ) ? importedFile.filter( row => row.length > 1 ).slice(5) : undefined

let rowIDs = isDefined( importedFile ) ? rows.map( row => row[7] ) : undefined

let existingIDs = isDefined( importedFile ) ? State.DB.get(State.S.selectedCompany, 10073).filter( sourceDocument => State.DB.get(sourceDocument, "sourceDocument/sourceDocumentType") === 10132 ).map( transaction =>  State.DB.get(transaction, 1080)  ).filter( id => isDefined(id) ) : undefined

let alreadyImportedCount = isDefined( importedFile ) ? rowIDs.filter( rowID => existingIDs.includes( rowID )  ) : undefined

let newTransactions = isDefined( importedFile ) ? rows.filter( row => !existingIDs.includes(row[7])  ) : undefined

let sourceDocuments = isDefined( importedFile ) ? State.DB.get(State.S.selectedCompany, 10073).filter( transaction => State.DB.get(transaction, 9104) === State.S["BankImportPage/selectedSourceDocument"] ) : []



return d([
    submitButton( " <---- Tilbake ", () => State.Actions["BankImportPage/selectSourceDocument"]( undefined )  ),
    br(),
    entityAttributeView(State, State.S["BankImportPage/selectedSourceDocument"], 10070),
    br(),
    isDefined( State.DB.get( State.S["BankImportPage/selectedSourceDocument"], "sourceDocument/sourceDocumentType") )
        ? d( State.DB.get( State.DB.get( State.S["BankImportPage/selectedSourceDocument"], "sourceDocument/sourceDocumentType"), 7942 ).map( attribute => entityAttributeView(State, State.S["BankImportPage/selectedSourceDocument"], attribute ) ) )
        : d(""),
    br(),
    isDefined( importedFile )
        ? d([
            d( ` Filen inneholder  ${rows.length} transaksjoner.` ),
            d( ` Av disse er ${alreadyImportedCount.length} allerede importert.` ),
            rows.length > alreadyImportedCount.length
                ? d([
                    br(),
                    d("Uimporterte transaksjoner:"),
                    d( newTransactions.map( row => d( JSON.stringify(row) ) ) ),
                    br(),
                    submitButton("Importer hver transaksjon som eget bilag", () => State.Actions["BankImportPage/importBankSourceDocuments"]( State.S["BankImportPage/selectedSourceDocument"] ) ),
                ])
                : d(""),
            d( [
                d("Importerte transaksjoner tilknyttet dette bilaget:"),
                d( sourceDocuments.map( transaction => entityLabelWithPopup( State, transaction, () => State.Actions["BankImportPage/selectSourceDocument"]( sourceDocument )) ) ),
                submitButton("Slett importerte transaksjoner", () => State.Actions.retractEntities( sourceDocuments.concat( State.DB.get(State.S.selectedCompany, 9817).filter( transaction => sourceDocuments.includes( State.DB.get(transaction, 9104) )  ) ) ) ),
            ] )

        ]) 
        : d("Last opp fil for å importere")
    ])
} 


let singleTransactionView = State => {

    let sourceDocument = State.S["BankImportPage/selectedSourceDocument"]

    let recordedTransaction = State.DB.get(State.S.selectedCompany, 9817).find( transaction => State.DB.get(transaction, 9104) === sourceDocument )


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
        isDefined(recordedTransaction)
            ? d([
                transactionFlowView( State, recordedTransaction),
                submitButton("Tilbakestill bokføring", () => State.Actions.retractEntities( [recordedTransaction] )  )
            ]) 
            : d([
                entityAttributeView(State, sourceDocument, 10200 ),
                submitButton("Splitt i to", () => State.Actions["BankImportPage/splitTransaction"]( sourceDocument )   ),
                submitButton("Bokfør", () => State.Actions["BankImportPage/recordSourceDocument"]( sourceDocument )   ),
            ]) 
    ])


} 



let splitTransactionView = State => {

    let sourceDocument = State.S["BankImportPage/selectedSourceDocument"]

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
        h3("Bokføring"),
        isDefined(recordedTransaction)
            ? d([
                transactionFlowView( State, recordedTransaction),
                submitButton("Tilbakestill bokføring", () => State.Actions.retractEntities( [recordedTransaction] )  )
            ]) 
            : d([
                entityAttributeView(State, sourceDocument, 1083 ),
                entityAttributeView(State, sourceDocument, 10200 ),
                submitButton("Bokfør", () => State.Actions["BankImportPage/recordSourceDocument"]( sourceDocument )   ),
                submitButton("Slett", () => State.Actions["BankImportPage/retractSourceDocument"]( sourceDocument )   ),
            ]) 
    ])


} 


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
      newDatom( "newDatom_"+ index, "event/date", date  ), //Denne burde heller være kalkulert verdi?
      newDatom( "newDatom_"+ index, 7463, selectedBankAccount),
      newDatom( "newDatom_"+ index, 1083, isPayment ? paidAmount : receivedAmount  ),
      newDatom( "newDatom_"+ index, 8831, description  ),
      newDatom( "newDatom_"+ index, "bankTransaction/referenceNumber", referenceNumber  ),
      newDatom( "newDatom_"+ index, "entity/sourceDocument", sourceDocument ),
      newDatom( "newDatom_"+ index, "entity/label", `[${transactionRow[0]}] Banktransaksjon: ${isPayment ? paidAmount : receivedAmount} `  ),
    ]
  
    return Datoms
  
  }
