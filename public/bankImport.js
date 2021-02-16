const BankImportPage = {
    entity: 10038,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({
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
            newDatom( 'newEntity' , "sourceDocument/sourceDocumentType", 10132 ), 
            newDatom( 'newEntity' , "transaction/paymentType", State.DB.get(sourceDocument, 9084) ), 
            newDatom( 'newEntity' , 9011, sourceDocument ), 
            newDatom( 'newEntity' , 7463, State.DB.get(sourceDocument, 7463) ), 
            newDatom( 'newEntity' , 1757, State.DB.get(sourceDocument, 1757) ), 
            newDatom( 'newEntity' , 1083, 0 ), 
            newDatom( 'newEntity', 8831, State.DB.get(sourceDocument, 8831)  ),
            newDatom( 'newEntity', "bankTransaction/referenceNumber", State.DB.get(sourceDocument, 1080)  ),
            newDatom( 'newEntity', "entity/sourceDocument", State.DB.get(sourceDocument, 9104) ),
            newDatom( 'newEntity' , "entity/label", "Splittet banktransaksjon" ), 
        ] ),
        "BankImportPage/createSecurityPurchase": sourceDocument => State.Actions.postDatoms([
            newDatom( "newEntity", "entity/entityType", 10062 ),
            newDatom( "newEntity", "sourceDocument/sourceDocumentType", 10096 ),
            newDatom( "newEntity", "sourceDocument/securityTransactionType", 11170 ),
            newDatom( "newEntity", 1757, State.DB.get(sourceDocument, 1757) ),
            newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
            newDatom( 'newEntity' , "entity/label", "Verdipapirkjøp" ), 
            newDatom( 'newEntity' , "eventAttribute/1139", "Nytt aksjekjøp" ), 
            newDatom( 'newEntity' , 11177, false ), 
            newDatom( 'newEntity' , 11180, sourceDocument ), 
        ] ),
        "BankImportPage/createSecuritySale": sourceDocument => State.Actions.postDatoms([
            newDatom( "newEntity", "entity/entityType", 10062 ),
            newDatom( "newEntity", "sourceDocument/sourceDocumentType", 10111 ),
            newDatom( "newEntity", "sourceDocument/securityTransactionType", 11171 ),
            newDatom( "newEntity", 1757, State.DB.get(sourceDocument, 1757) ),
            newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
            newDatom( 'newEntity' , "entity/label", "Verdipapirsalg" ), 
            newDatom( 'newEntity' , "eventAttribute/1139", "Nytt aksjesalg" ), 
            newDatom( 'newEntity' , 11177, false ), 
            newDatom( 'newEntity' , 11180, sourceDocument ), 
        ] ),
        "BankImportPage/createOperatingCost": sourceDocument => State.Actions.postDatoms([
            newDatom( "newEntity", "entity/entityType", 10062 ),
            newDatom( "newEntity", "sourceDocument/sourceDocumentType", 10165 ),
            newDatom( "newEntity", 1757, State.DB.get(sourceDocument, 1757) ),
            newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
            newDatom( 'newEntity' , "entity/label", "Driftskostnad" ), 
            newDatom( 'newEntity' , "eventAttribute/1139", "Ny driftskostnad" ), 
            newDatom( 'newEntity' , 11177, false ), 
            newDatom( 'newEntity' , 11180, sourceDocument ), 
        ] ),
        "BankImportPage/createInterestIncome": sourceDocument => State.Actions.postDatoms([
            newDatom( "newEntity", "entity/entityType", 10062 ),
            newDatom( "newEntity", "sourceDocument/sourceDocumentType", 11395 ),
            newDatom( "newEntity", 1757, State.DB.get(sourceDocument, 1757) ),
            newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
            newDatom( 'newEntity' , "eventAttribute/1139", "Ny renteinntekt" ), 
            newDatom( 'newEntity' , "entity/label", "Renteinntekt" ), 
            newDatom( 'newEntity' , 11396, false ), 
            newDatom( 'newEntity' , 11180, sourceDocument ), 
            
        ] ),
        "BankImportPage/createPayment": sourceDocument => State.Actions.postDatoms([
            newDatom( "newEntity", "entity/entityType", 10062 ),
            newDatom( "newEntity", "sourceDocument/sourceDocumentType", 11350 ),
            newDatom( "newEntity", 1757, State.DB.get(sourceDocument, 1757) ),
            newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
            newDatom( 'newEntity' , "entity/label", "Betaling mot gjeld/fordring" ), 
            newDatom( 'newEntity' , 11180, sourceDocument ), 
        ] ),
    })
  }


let bankImportView = State => isDefined( State.S.selectedEntity) 
    ? State.DB.get(State.S.selectedEntity, 10070) === 10064
        ? singleBankImportView( State )
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
            entityLabelWithPopup( State, sourceDocument, () => State.Actions.selectEntity(  sourceDocument, BankImportPage.entity ) ),
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
        entityLabelWithPopup( State, 1757 ),
        entityLabelWithPopup( State, 8831 ),
        entityLabelWithPopup( State, 10107 ),
        entityLabelWithPopup( State, 11201 ),
        d("")
    ], {style: gridColumnsStyle("1fr 3fr 1fr 3fr 1fr")}),
    d( transactions .map( sourceDocument => d([
        lockedSingleValueView( State, sourceDocument, 1757 ),
        lockedSingleValueView( State, sourceDocument, 8831 ),
        d( formatNumber( State.DB.get(sourceDocument, 10107) ), {style: `text-align: right;color:${State.DB.get(sourceDocument, 9084) === 9086 ? "red" : "black"} ;`} ),
        isDefined( State.DB.get(sourceDocument, 11201) )
            ? entityLabelWithPopup( State, State.DB.get(sourceDocument, 11201) )
            : d([d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"})], {style:"display: inline-flex;"}) ,
        submitButton( "Vis", () => State.Actions.selectEntity(  sourceDocument, BankImportPage.entity ) )
    ], {style: gridColumnsStyle("1fr 3fr 1fr 3fr 1fr")}) ))
]) 
  
let singleBankImportView = State => {

return d([
    submitButton( " <---- Tilbake ", () => State.Actions.selectEntity(  undefined, BankImportPage.entity )  ),
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


let splitView_parent = (State, sourceDocument)  => d([
    h3("Splitting"),
    State.DB.get( sourceDocument, 9030 ).length > 0
        ? d([
            entityAttributeView(State, sourceDocument, 9030, true ),
            entityAttributeView(State, sourceDocument, 10470, true ),
            ])
        : d("Transaksjonen er ikke splittet"),
        State.DB.get( sourceDocument, 11201 )
            ? d("Kan ikke splitte matchet transaksjon")
            : submitButton("Splitt transaksjonen", () => State.Actions["BankImportPage/splitTransaction"]( sourceDocument )   )
    ], {class: "feedContainer"})

let splitView_child = (State, sourceDocument)  => d([
    h3("Splitting"),
    entityAttributeView(State, sourceDocument, 9011, true),
    entityAttributeView(State, sourceDocument, 1083, isDefined( State.DB.get( sourceDocument, 11201 ) ) ),
    isDefined( State.DB.get( sourceDocument, 11201 ) )
        ? d("")
        : submitButton("Slett", () => State.Actions.retractEntity( sourceDocument ) )
], {class: "feedContainer"})

let singleTransactionView = State => {

    return d([
        submitButton( " <---- Tilbake ", () => State.Actions.selectEntity(  undefined, BankImportPage.entity )  ),
        br(),
        entityAttributeView(State, State.S.selectedEntity, 10070, true),
        br(),
        isDefined( State.DB.get(State.S.selectedEntity, 9011) )
            ? splitView_child( State, State.S.selectedEntity )
            : d([
                d([
                    h3("Importerte transaksjonsdata"),
                    d( State.DB.get( State.DB.get( State.S.selectedEntity, "sourceDocument/sourceDocumentType"), 7942 ).filter( e => e!== 10200 ).map( attribute => entityAttributeView(State, State.S.selectedEntity, attribute, true ) ) ),
                ], {class: "feedContainer"}),
                splitView_parent( State, State.S.selectedEntity )
            ]),
        br(),
        matchingView( State, State.S.selectedEntity ),
        isDefined( State.DB.get( State.S.selectedEntity, 11201 ) )
            ? d("")
            : actionsView( State, State.S.selectedEntity )
    ])  

} 

let actionsView = (State, sourceDocument) => d([
    h3("Snarveier:"),
    State.DB.get(sourceDocument, 9084) === 9086 
        ? submitButton("Opprett og match med verdipapirkjøp", () => State.Actions["BankImportPage/createSecurityPurchase"]( sourceDocument )  ) 
        : d("[na.] Opprett og match med verdipapirkjøp" , {style: "background-color: #80808054;"}),
    State.DB.get(sourceDocument, 9084) === 9087 
    ? submitButton("Opprett og match med verdipapirsalg", () => State.Actions["BankImportPage/createSecuritySale"]( sourceDocument )  ) 
    : d("[na.] Opprett og match med verdipapirsalg" , {style: "background-color: #80808054;"}),
    State.DB.get(sourceDocument, 9084) === 9086 
    ? submitButton("Opprett og match med driftskostnad", () => State.Actions["BankImportPage/createOperatingCost"]( sourceDocument )  ) 
    : d("[na.] Opprett og match med driftskostnad" , {style: "background-color: #80808054;"}),
    State.DB.get(sourceDocument, 9084) === 9087 
    ? submitButton("Opprett og match med renteinntekt", () => State.Actions["BankImportPage/createInterestIncome"]( sourceDocument )  )
    : d("[na.] Opprett og match med renteinntekt" , {style: "background-color: #80808054;"}),
    submitButton("Opprett og match med betaling mot gjeld/fordring", () => State.Actions["BankImportPage/createPayment"]( sourceDocument ) )
], {class: "feedContainer"})


let matchingView = (State, sourceDocument) => d([
    h3("Matching av banktransaksjon"),
    isDefined( State.DB.get( sourceDocument, 11201 ) )
    ? d([
        entityAttributeView(State, sourceDocument, 11201, true),
    ])
    : d("Banktransaksjonen er ikke matchet")
], {class: "feedContainer"}) 

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
      newDatom( "newDatom_"+ index, "sourceDocument/sourceDocumentType", 10132 ),
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