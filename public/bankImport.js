const BankImportPage = {
    initial: DB => returnObject({
        "BankImportPage/selectedSourceDocument": undefined
    }),
    Actions: State => returnObject({
        "BankImportPage/selectSourceDocument": entity => updateState( State, {S: {"BankImportPage/selectedSourceDocument": entity}}),
        "BankImportPage/createBankImport": () => State.Actions.postDatoms([
            newDatom( "newEntity", "entity/entityType", 10062 ),
            newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
            newDatom( 'newEntity' , "sourceDocument/sourceDocumentType", 10064 ), 
            newDatom( 'newEntity' , 1757, Date.now() ), 
            newDatom( 'newEntity' , "entity/label", " Bankimport opprettet " + moment( Date.now() ).format( "DD.MM.YYYY HH:mm" ) ), 
        ] ),
        "BankImportPage/importBankTransactions": sourceDocument => {

            let importedFile = State.DB.get( sourceDocument, 1759)


            let existingIDs = State.DB.get(State.S.selectedCompany, 9817).map( transaction =>  State.DB.get(transaction, 1080)  ).filter( id => isDefined(id) )

            let unImportedRows = importedFile.filter( row => row.length > 1 ).slice(5).filter( row => !existingIDs.includes(row[7])  )

            let bankAccount = State.DB.get( sourceDocument, 7463 )

            let accountingYear = State.DB.get(State.S.selectedCompany, 10061).slice(-1)[0]

            let newDatoms = unImportedRows.map( (transactionRow, index) => constructTransactionRowDatoms(State, transactionRow, index, bankAccount, sourceDocument, accountingYear)  ).flat()

            State.Actions.postDatoms( newDatoms )


        },
        "BankImportPage/importBankSourceDocuments": sourceDocument => {

            let importedFile = State.DB.get( sourceDocument, 1759)
            let existingIDs = State.DB.get(State.S.selectedCompany, 9817).map( transaction =>  State.DB.get(transaction, 1080)  ).filter( id => isDefined(id) )
            let unImportedRows = importedFile.filter( row => row.length > 1 ).slice(5).filter( row => !existingIDs.includes(row[7])  )
            let bankAccount = State.DB.get( sourceDocument, 7463 )

            let newDatoms = unImportedRows.map( (transactionRow, index) => constructBankTransactionSourceDocumentDatoms(State, transactionRow, index, bankAccount, sourceDocument)  ).flat()

            State.Actions.postDatoms( newDatoms )


        },






        
    })
  }


  


  let bankImportView = State => isDefined( State.S["BankImportPage/selectedSourceDocument"]) ? singleBankImportView( State ) : allBankImportsView( State )
  
  let allBankImportsView = State => d([
    h3("Importer banktransaksjoner"),
    br(),
    d("Her kan du laste opp og bokføre betalinger fra banken på en enkel måte."),
    br(),
    h3("Tidligere importer"),
    d( State.DB.get( State.S.selectedCompany, 10073 )
        .filter( sourceDocument => State.DB.get(sourceDocument, 10070 ) === 10064 )
        .map( sourceDocument => d([
            sourceDocumentLabel( State, sourceDocument, () => State.Actions["BankImportPage/selectSourceDocument"]( sourceDocument ) ),
            entityLabelWithPopup( State, State.DB.get(sourceDocument, 10070) ),
            lockedSingleValueView( State, sourceDocument, 1757 )
        ], {style: gridColumnsStyle("1fr 1fr 1fr 3fr")}) )),
    br(),
    submitButton("Ny import", () => State.Actions["BankImportPage/createBankImport"]( ) )
  ])
  
  let singleBankImportView = State => {

    let importedFile = State.DB.get( State.S["BankImportPage/selectedSourceDocument"], 1759)

    

    let rows = isDefined( importedFile ) ? importedFile.filter( row => row.length > 1 ).slice(5) : undefined

    let rowIDs = isDefined( importedFile ) ? rows.map( row => row[7] ) : undefined

    let existingIDs = isDefined( importedFile ) ? State.DB.get(State.S.selectedCompany, 9817).map( transaction =>  State.DB.get(transaction, 1080)  ).filter( id => isDefined(id) ) : undefined

    let alreadyImportedCount = isDefined( importedFile ) ? rowIDs.filter( rowID => existingIDs.includes( rowID )  ) : undefined

    let newTransactions = isDefined( importedFile ) ? rows.filter( row => !existingIDs.includes(row[7])  ) : undefined



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
                        submitButton("Importer nye transaksjoner", () => State.Actions["BankImportPage/importBankTransactions"]( State.S["BankImportPage/selectedSourceDocument"] ) ),

                        br(),
                        submitButton("Importer hver transaksjon som eget bilag", () => State.Actions["BankImportPage/importBankSourceDocuments"]( State.S["BankImportPage/selectedSourceDocument"] ) ),
                    ])
                    : d(""),
                d( [
                    d("Importerte transaksjoner tilknyttet dette bilaget:"),
                    d( State.DB.get(State.S.selectedCompany, 9817).filter( transaction => State.DB.get(transaction, 9104) === State.S["BankImportPage/selectedSourceDocument"] ).map( transaction => transactionLabel( State, transaction) ) ),
                ] )

            ]) 
            : d("Last opp fil for å importere")
            
            
            
            //submitButton("Slett", e => State.Actions["ActorsPage/retractActor"]( State.S["SourceDocumentsPage/selectedSourceDocument"] ) ),  
      ])
  } 


  let parseDNBamount = stringAmount => Number( stringAmount.replaceAll(".", "").replaceAll(",", ".") ) 




let constructBankTransactionSourceDocumentDatoms = ( State, transactionRow, index, selectedBankAccount, sourceDocument) => {
            
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





  let constructTransactionRowDatoms = ( State, transactionRow, index, selectedBankAccount, sourceDocument, accountingYear) => {
            
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
  
    let transactionDatoms = [
      newDatom( "newDatom_"+ index, "entity/entityType", 7948  ),
      newDatom( "newDatom_"+ index, "entity/company", State.S.selectedCompany  ),
      newDatom( "newDatom_"+ index, 'transaction/accountingYear', accountingYear ), 
      newDatom( "newDatom_"+ index, "transaction/transactionType", isPayment ? 8829 : 8850 ),
      newDatom( "newDatom_"+ index, "transaction/paymentType", isPayment ? 9086 : 9087 ),
      newDatom( "newDatom_"+ index, 8832, date  ),
      newDatom( "newDatom_"+ index, "event/date", date  ), //Denne burde heller være kalkulert verdi?
      newDatom( "newDatom_"+ index, isPayment ? "transaction/originNode" : "transaction/destinationNode", selectedBankAccount),
      newDatom( "newDatom_"+ index, 8830, isPayment ? paidAmount : receivedAmount  ),
      newDatom( "newDatom_"+ index, 8831, description  ),
      newDatom( "newDatom_"+ index, "bankTransaction/referenceNumber", referenceNumber  ),
      newDatom( "newDatom_"+ index, "entity/sourceDocument", sourceDocument ),
      newDatom( "newDatom_"+ index, 1139, ""  ),
    ]
  
    return transactionDatoms
  
  }
