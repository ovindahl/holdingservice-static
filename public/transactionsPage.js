
//--- Transaction views

const TransactionsPage = {
    entity: 7882,
    onLoad: State => returnObject({selectedAccountingYear: 7407, selectedEntity: undefined}),
    Actions: State => returnObject({
      "TransactionsPage/selectAccountingYear": accountingYear => updateState( State, {S: {selectedAccountingYear: accountingYear}}),
    })
  }



let transactionsView = State => newAllTransasctionsVew( State )

let newAllTransasctionsVew = State => d([
  h3("Bokførte transaksjoner"),
  d([
    entityLabelWithPopup( State, 7403 ),
    d( State.DB.get(State.S.selectedCompany, 10061).map( e => entityLabelWithPopup(State, e, () => State.Actions["TransactionsPage/selectAccountingYear"](e)) ), {display: "flex"} )
  ], {class: "feedContainer", style: gridColumnsStyle("1fr 3fr")}),
  br(),  
  d( State.DB.get( State.S.selectedCompany, 12351)().map( Transaction => d([
    entityLabelWithPopup(State, Transaction.event, () => State.Actions.selectEntity(Transaction.event, 11974 ) ),
    d( moment( State.DB.get( Transaction.event, 1757 ) ).format("DD.MM.YYYY") , {style: `text-align: right;`}),
    d([
      isDefined( Transaction.originNode ) ? entityLabelWithPopup(State, Transaction.originNode ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}),
      d(" --> "),
      isDefined( Transaction.destinationNode ) ? entityLabelWithPopup(State, Transaction.destinationNode ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}) ,
    ], {style: gridColumnsStyle("3fr 1fr 3fr") + "padding-left: 3em;"} ),
    d( `NOK ${formatNumber( Transaction.amount, 2 )}`, {style: "text-align: right;"} ),
  ], {style: gridColumnsStyle("1fr 1fr 3fr 1fr 1fr ")}) ) ) 
]) 

  
  
let transactionValueView = (State, companyTransaction) => d( formatNumber( State.DB.get(companyTransaction, 10047) ), {style: `text-align: right;`} )

let transactionRowView = (State, companyTransaction) => d([
    entityLabelWithPopup( State, companyTransaction ),
    d( moment( State.DB.get( companyTransaction, 10632 ) ).format("DD.MM.YYYY") , {style: `text-align: right;`}),
    d([
      isDefined( State.DB.get(companyTransaction, 7867) ) ? entityLabelWithPopup(State, State.DB.get(companyTransaction, 7867) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}),
      d(" --> "),
      isDefined( State.DB.get(companyTransaction, 7866) ) ? entityLabelWithPopup(State, State.DB.get(companyTransaction, 7866) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}) ,
    ], {style: gridColumnsStyle("3fr 1fr 3fr") + "padding-left: 3em;"} ),
    transactionValueView( State, companyTransaction )
  ], {style: gridColumnsStyle("1fr 1fr 3fr 1fr 1fr ")})
  

let allTransactionsView = State => d([
  h3("Bokførte transaksjoner"),
  d([
    entityLabelWithPopup( State, 7403 ),
    d( State.DB.get(State.S.selectedCompany, 10061).map( e => entityLabelWithPopup(State, e, () => State.Actions["TransactionsPage/selectAccountingYear"](e)) ), {display: "flex"} )
  ], {class: "feedContainer", style: gridColumnsStyle("1fr 3fr")}),
  br(),  
  State.DB.get(State.S.selectedCompany, 11092)( State.S.selectedAccountingYear ).length > 0 
    ? d( State.DB.get(State.S.selectedCompany, 11092)( State.S.selectedAccountingYear )
      .map( companyTransaction => transactionRowView(State, companyTransaction)  ), {class: "feedContainer"} )
    : d("Ingen transaksjoner i valgt regnskapsår"),
])
  
  let prevNextTransactionView = State => {
  
    let prevTransaction = State.DB.get( State.S.selectedEntity, 10054 )
    let nextTransaction = State.DB.get( State.S.selectedEntity, 10055 )
  
    return d([
      submitButton( " <---- Tilbake ", () => State.Actions.selectEntity(  undefined, TransactionsPage.entity )  ),
      br(),
      d([
        d([
          isDefined( prevTransaction ) ? submitButton("<", () => State.Actions.selectEntity(  prevTransaction, TransactionsPage.entity ) ) : d(""),
          isDefined( nextTransaction ) ? submitButton(">", () => State.Actions.selectEntity(  nextTransaction, TransactionsPage.entity ) ) : d(""),
        ], {style: gridColumnsStyle("3fr 1fr")})
      ], {style: gridColumnsStyle("3fr 1fr")}),
    ])
  }
  
  let balanceChangeView = ( State, balanceObject, companyTransaction ) => isDefined( State.DB.get(companyTransaction, 7867) ) 
  ? d([
    d([
      d([
        entityLabelWithPopup(State, balanceObject ),
      ]),
      d([
        d( formatNumber( State.DB.get( balanceObject, 10045 )( State.DB.get( companyTransaction, 8354 ) - 1 ) ), {class: "redlineText", style: `text-align: right;`} ),
        d( formatNumber( State.DB.get( balanceObject, 10045 )( State.DB.get( companyTransaction, 8354 ) ) ), {style: `text-align: right;`} ),
      ])
    ], {style: gridColumnsStyle("1fr 1fr")}),
    lockedSingleValueView(State, balanceObject, 8747),
  ],{class: "feedContainer"}) 
  
  : d([d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"})])
  
  
  
  let transactionFlowView = (State, companyTransaction) => d([
    balanceChangeView( State, State.DB.get( companyTransaction, 7867 ), companyTransaction ),
    d([
      d(""),
      d([
        d( formatNumber( State.DB.get(companyTransaction, 10047), State.DB.get(companyTransaction, 10047) > 100 ? 0 : 2 ) ),
        d(" --------------> "),
        entityLabelWithPopup( State, companyTransaction ),
        d( moment( State.DB.get( companyTransaction, 10632, State.S.selectedCompanyEventIndex ) ).format("DD.MM.YYYY") ),
      ]),
      d(""),
    ], {style: gridColumnsStyle("2fr 4fr 2fr")}),
    balanceChangeView( State, State.DB.get( companyTransaction, 7866 ), companyTransaction ),
  ], {style: gridColumnsStyle("1fr 1fr 1fr")})
  
  // Outgoing transactions
  
  
  let singleTransactionView = State => d([
    prevNextTransactionView( State ),
    br(),
    transactionFlowView( State, State.S.selectedEntity ),
    br(),
    d([
      h3("Kilde"),
      d([
        entityLabelWithPopup( State, 9104 ),
        entityLabelWithPopup( State, State.DB.get(State.S.selectedEntity, 9104) ),
      ], {style: gridColumnsStyle("1fr 1fr")}),
      //entityAttributeView(State, State.S.selectedEntity, 9104, true),
      entityAttributeView( State, State.S.selectedEntity, 7935, true ),
    ], {class: "feedContainer"}),
    br(),
    d([
      h3("Transaksjosoutput"),
      d([
        d([
          entityLabelWithPopup( State, 10047 ),
          d( formatNumber( State.DB.get(State.S.selectedEntity, 10047) ), {style: `text-align: right;`} ),
        ], {style: gridColumnsStyle("1fr 1fr")}),
        isNumber( State.DB.get(State.S.selectedEntity, 10394) ) 
          ? d([
            entityLabelWithPopup( State, 10394 ),
            d( formatNumber( State.DB.get(State.S.selectedEntity, 10394) ), {style: `text-align: right;`} ),
          ], {style: gridColumnsStyle("1fr 1fr")})
          : d("")
      ])
    ], {class: "feedContainer"})
  ])
  
  //----

  