

const BankImportPage = {
    entity: 10038,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({})
  }


let bankImportView = State => isDefined( State.S.selectedEntity) 
    ? singleBankTransactionView( State ) //singleEventView( State )
    : allBankImportsView( State )

let allBankImportsView = State => d([
    h3("Importerte transaksjoner"),
    d([
        d([
            entityLabelWithPopup( State, 1757 ),
            entityLabelWithPopup( State, 8831 ),
            entityLabelWithPopup( State, 10470 ),
            entityLabelWithPopup( State, 11201 ),
            d("")
        ], {style: gridColumnsStyle("1fr 3fr 1fr 3fr 1fr")}),
        d( State.DB.get( State.S.selectedCompany, 10073 ).filter( sourceDocument => [10132, 10465].includes( State.DB.get(sourceDocument, 10070 ) ) ) .map( sourceDocument => d([
            lockedSingleValueView( State, sourceDocument, 1757 ),
            lockedSingleValueView( State, sourceDocument, 8831 ),
            d( formatNumber( State.DB.get(sourceDocument, 10470) ), {style: `text-align: right;color:${State.DB.get(sourceDocument, 9084) === 9086 ? "red" : "black"} ;`} ),
            isDefined( State.DB.get(sourceDocument, 11201) )
                ? entityLabelWithPopup( State, State.DB.get(sourceDocument, 11201) )
                : d([d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"})], {style:"display: inline-flex;"}) ,
            submitButton( "Vis", () => State.Actions.selectEntity(  sourceDocument, BankImportPage.entity ) )
        ], {style: gridColumnsStyle("1fr 3fr 1fr 3fr 1fr")}) )),
        eventActionButton( State, State.S.selectedCompany, 11988 )
])


])
  
let singleBankTransactionView = State => {

    return d([
        submitButton( " <---- Tilbake ", () => State.Actions.selectEntity(  undefined, BankImportPage.entity )  ),
        br(),
        entityAttributeView(State, State.S.selectedEntity, 10070, true),
        entityAttributeView(State, State.S.selectedEntity, 11477, true),
        br(),
        d([
            h3("Importerte transaksjonsdata"),
            d( State.DB.get( State.DB.get( State.S.selectedEntity, "sourceDocument/sourceDocumentType"), 7942 ).filter( e => e!== 10200 ).map( attribute => entityAttributeView(State, State.S.selectedEntity, attribute, true ) ) ),
        ], {class: "feedContainer"}),
        br(),
        isDefined( State.DB.get(State.S.selectedEntity, 9011) )
            ? d([
                entityAttributeView(State, State.S.selectedEntity, 9011, true),
                entityAttributeView(State, State.S.selectedEntity, 1083, isDefined( State.DB.get( State.S.selectedEntity, 11201 ) ) ),
            ], {class: "feedContainer"})
            : State.DB.get( State.S.selectedEntity, 9030 ).length > 0
            ? d([
                entityAttributeView(State, State.S.selectedEntity, 9030, true ),
                entityAttributeView(State, State.S.selectedEntity, 10470, true ),
                ], {class: "feedContainer"})
            : d(""),
        br(),
        d([
            h3("Matching av banktransaksjon"),
            isDefined( State.DB.get( State.S.selectedEntity, 11201 ) )
            ? d([
                entityAttributeView(State, State.S.selectedEntity, 11201, true),
            ])
            : d("Banktransaksjonen er ikke matchet")
        ], {class: "feedContainer"}),
        br(),
        eventActionsView( State, State.S.selectedEntity ),
    ])  

} 



//I bruk

let constructBankTransactionSourceDocumentDatoms = ( State, transactionRow, index, selectedBankAccount, sourceDocument) => {

    //NB: Denne brukes av entitet 11693: Datomer for import av banktransaksjoner

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
      newDatom( "newDatom_"+ index, "entity/selectSourceDocument", sourceDocument ),
      newDatom( "newDatom_"+ index, "entity/label", `[${transactionRow[0]}] Banktransaksjon: ${isPayment ? paidAmount : receivedAmount} `  ),
    ]
  
    return Datoms
  
  }