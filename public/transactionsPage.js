
//--- Transaction views

const TransactionsPage = {
    initial: DB => returnObject({ 
      "TransactionsPage/selectedAccountingYear": DB.get(6829, 10061).slice(-1)[0],
      "TransactionsPage/selectedTransaction": undefined
    }),
    Actions: State => returnObject({
      "TransactionsPage/selectAccountingYear": accountingYear => updateState( State, {S: {"TransactionsPage/selectedAccountingYear": accountingYear}}),
      "TransactionsPage/selectTransaction": transaction => updateState( State, {S: {selectedPage: 7882, "TransactionsPage/selectedTransaction": transaction}}),
      "TransactionsPage/retractTransaction": async transaction => updateState( State, { DB: await Transactor.retractEntity(State.DB, transaction), S: {"TransactionsPage/selectedTransaction": undefined } } ),
        splitTransaction: transaction => State.Actions.postDatoms([
          newDatom( "newTransaction", "entity/entityType", State.DB.get( transaction , "entity/entityType") ),
          newDatom( "newTransaction", "entity/company", State.DB.get( transaction , "entity/company") ),
          newDatom( "newTransaction", "event/date", State.DB.get( transaction , "event/date") ),
          newDatom( "newTransaction", "transaction/accountingYear", State.DB.get( transaction , "transaction/accountingYear") ),
          newDatom( "newTransaction", "transaction/transactionType", State.DB.get( transaction , "transaction/transactionType") ),
          State.DB.get( transaction , "transaction/transactionType") === 8850 
            ? newDatom( "newTransaction", "transaction/destinationNode", State.DB.get( transaction , "transaction/destinationNode") ) 
            : newDatom( "newTransaction", "transaction/originNode", State.DB.get( transaction , "transaction/originNode") ),
          newDatom( "newTransaction", "transaction/parentTransaction", transaction ),
          newDatom( "newTransaction", 1139, "" ),
          newDatom( "newTransaction", 1083, 0 ),
        ])
    })
  }


let transactionValueView = (State, companyTransaction) => d( formatNumber( State.DB.get(companyTransaction, 10047) ), {style: `text-align: right;`} )

let transactionRowView = (State, companyTransaction) => d([
    transactionLabel( State, companyTransaction ),
    d( moment( State.DB.get( companyTransaction, 1757 ) ).format("DD.MM.YYYY") , {style: `text-align: right;`}),
    d([
      isDefined( State.DB.get(companyTransaction, 7867) ) ? nodeLabel(State, State.DB.get(companyTransaction, 7867) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}),
      d(" --> "),
      isDefined( State.DB.get(companyTransaction, 7866) ) ? nodeLabel(State, State.DB.get(companyTransaction, 7866) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}) ,
    ], {style: gridColumnsStyle("3fr 1fr 3fr") + "padding-left: 3em;"} ),
    transactionValueView( State, companyTransaction )
  ], {style: gridColumnsStyle("1fr 1fr 3fr 1fr 1fr ")})
  

let allTransactionsView = State => {

    return d([
      h3("Transaksjoner"),
      d([
        entityLabelWithPopup( State, 7403 ),
        d( State.DB.get(State.S.selectedCompany, 10061).map( e => entityLabelWithPopup(State, e, () => State.Actions["TransactionsPage/selectAccountingYear"](e)) ), {display: "flex"} )
      ], {class: "feedContainer", style: gridColumnsStyle("1fr 3fr")}),
      br(),
      d( State.DB.get(State.S["TransactionsPage/selectedAccountingYear"], 9715).map( companyTransaction => transactionRowView(State, companyTransaction)  ), {class: "feedContainer"} ),
    ])
  } 

  
  let transactionsView = State => isDefined( State.S["TransactionsPage/selectedTransaction"] ) 
    ? transactionView2( State ) 
    : allTransactionsView( State )
  
  let prevNextTransactionView = State => {
  
    let prevTransaction = State.DB.get( State.S["TransactionsPage/selectedTransaction"], 10054 )
    let nextTransaction = State.DB.get( State.S["TransactionsPage/selectedTransaction"], 10055 )
  
    return d([
      submitButton( " <---- Tilbake ", () => State.Actions["TransactionsPage/selectTransaction"]( undefined )  ),
      br(),
      d([
        d([
          isDefined( prevTransaction ) ? submitButton("<", () => State.Actions["TransactionsPage/selectTransaction"](prevTransaction) ) : d(""),
          isDefined( nextTransaction ) ? submitButton(">", () => State.Actions["TransactionsPage/selectTransaction"](nextTransaction) ) : d(""),
        ], {style: gridColumnsStyle("3fr 1fr")})
      ], {style: gridColumnsStyle("3fr 1fr")}),
    ])
  }
  
  let balanceChangeView = ( State, balanceObject, companyTransaction ) => d([
    d([
      entityLabelWithPopup(State, 10045 ),
      d([
        d( formatNumber( State.DB.get( balanceObject, 10045 )( State.DB.get( companyTransaction, 8354 ) - 1 ) ), {class: "redlineText", style: `text-align: right;`} ),
        d( formatNumber( State.DB.get( balanceObject, 10045 )( State.DB.get( companyTransaction, 8354 ) ) ), {style: `text-align: right;`} ),
      ]),
    ], {style: gridColumnsStyle("1fr 1fr")}),
  ])
  
  let transactionFlowView = (State, companyTransaction) => d([
    d([
      d([ isDefined( State.DB.get(companyTransaction, 7867) ) ? nodeLabel(State, State.DB.get(companyTransaction, 7867) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}) ]),
      isDefined( State.DB.get(companyTransaction, 7867) ) 
        ? balanceChangeView( State, State.DB.get( companyTransaction, 7867 ), companyTransaction ) 
        : d("")
    ]),
    d([
      d(""),
      d([
        d( moment( State.DB.get( companyTransaction, 1757, State.S.selectedCompanyEventIndex ) ).format("DD.MM.YYYY") ),
        transactionLabel( State, companyTransaction ),
        transactionValueView( State, companyTransaction ),
        d(" --------------> "),
      ]),
      d(""),
    ], {style: gridColumnsStyle("3fr 2fr 3fr")}),
    d([
      d([ isDefined( State.DB.get(companyTransaction, 7866) ) ? nodeLabel(State, State.DB.get(companyTransaction, 7866) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}), ]) ,
      isDefined( State.DB.get(companyTransaction, 7866) ) 
        ? balanceChangeView( State, State.DB.get( companyTransaction, 7866 ), companyTransaction ) 
        : d("")
    ])
  ], {class: "feedContainer", style: gridColumnsStyle("2fr 3fr 2fr")})
  
  // Outgoing transactions
  
  
  let transactionLabelText = (State, companyTransaction) => d([d(`Transaksjon ${ State.DB.get(companyTransaction, 8354) }`, {class: "entityLabel", style: `background-color:${State.DB.get( State.DB.get(companyTransaction, "transaction/transactionType"), 20  )};`}, "click", () => State.Actions["TransactionsPage/selectTransaction"](companyTransaction) )], {style:"display: flex;"})
  
  let transactionLabel = (State, companyTransaction) => d([
    d([
      transactionLabelText( State, companyTransaction ),
      transactionPopUp( State, companyTransaction ),
    ], {class: "popupContainer", style:"display: inline-flex;"})
    ], {style:"display: inline-flex;"} )
  
    let transactionPopUp = (State, companyTransaction) => d([
      d([
        transactionLabelText( State, companyTransaction ),
        d( moment( State.DB.get( companyTransaction, 1757, State.S.selectedCompanyEventIndex ) ).format("DD.MM.YYYY") ),
      ], {style: gridColumnsStyle("1fr 1fr")}),
      br(),
      d([
        entityLabelWithPopup( State, 10047 ),
        transactionValueView( State, companyTransaction ),
      ], {style: gridColumnsStyle("1fr 1fr")}),
      d(`Entitet: ${companyTransaction}`)
      
    ], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;width: 400px;"})
  
  
  let transactionView2 = State => d([
    prevNextTransactionView( State ),
    br(),
    transactionFlowView( State, State.S["TransactionsPage/selectedTransaction"] ),
    br(),
    d([
      h3("Kilde"),
      entityAttributeView(State, State.S["TransactionsPage/selectedTransaction"], 9104, true),
      entityAttributeView( State, State.S["TransactionsPage/selectedTransaction"], 7935, true ),
    ], {class: "feedContainer"}),
    br(),
    d([
      h3("Transaksjosoutput"),
      d([
        d([
          entityLabelWithPopup( State, 10047 ),
          d( formatNumber( State.DB.get(State.S["TransactionsPage/selectedTransaction"], 10047) ), {style: `text-align: right;`} ),
        ], {style: gridColumnsStyle("1fr 1fr")}),
        isNumber( State.DB.get(State.S["TransactionsPage/selectedTransaction"], 10394) ) 
          ? d([
            entityLabelWithPopup( State, 10394 ),
            d( formatNumber( State.DB.get(State.S["TransactionsPage/selectedTransaction"], 10394) ), {style: `text-align: right;`} ),
          ], {style: gridColumnsStyle("1fr 1fr")})
          : d("")
      ])
    ], {class: "feedContainer"})
  ])
  
  //----

  