

const BankImportPage = {
    entity: 10038,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({})
  }

/* 
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
        d([
            h3("Handlinger"),
            d( State.DB.get( State.DB.get(State.S.selectedEntity, 10070 )  , 11583).map( action =>  eventActionButton( State, State.S.selectedEntity, action ) )  )
        ], {class: "feedContainer"}),
    ])  

} 
 */


//I bruk
