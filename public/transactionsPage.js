
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
      importBankTransactions: (bankAccount, e) => Papa.parse( e.srcElement.files[0], {header: false, complete: async results => {
      
        let parseDNBamount = stringAmount => Number( stringAmount.replaceAll(".", "").replaceAll(",", ".") ) 
        
        let constructTransactionRowDatoms = ( State, transactionRow, index, selectedBankAccount) => {
        
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
        
          let accountingYear = State.DB.get(State.S.selectedCompany, 10061).slice(-1)[0]
        
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
            newDatom( "newDatom_"+ index, "entity/sourceDocument", "[TBD] Bankimport lastet opp " + moment( Date.now() ).format("DD/MM/YYYY HH:mm")  ),
            newDatom( "newDatom_"+ index, 1139, ""  ),
          ]
        
          return transactionDatoms
        
        }
        
          State.Actions.postDatomsAndUpdateCompany( results.data.filter( row => row.length > 1 ).slice(5, results.data.length-1).map( (transactionRow, index) => constructTransactionRowDatoms(State, transactionRow, index, bankAccount)  ).flat()   )
        
          } }),
        splitTransaction: transaction => State.Actions.postDatomsAndUpdateCompany([
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
        d( State.DB.get(State.S.selectedCompany, 10061).map( e => accountingYearLabel(State, e, () => State.Actions["TransactionsPage/selectAccountingYear"](e)) ), {display: "flex"} )
      ], {class: "feedContainer", style: gridColumnsStyle("1fr 3fr")}),
      br(),
      d([
        d( State.DB.get(State.S["TransactionsPage/selectedAccountingYear"], 9715).map( companyTransaction => transactionRowView(State, companyTransaction)  ) ),
        br(),
        submitButton("Legg til fri postering", () => State.Actions.postDatomsAndUpdateCompany([
          newDatom( 'newEntity' , 'entity/entityType', 7948 ),
          newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
          newDatom( 'newEntity' , 'transaction/accountingYear', State.S["TransactionsPage/selectedAccountingYear"] ), 
          newDatom( 'newEntity' , "transaction/transactionType", 8019 ), 
          newDatom( 'newEntity' , "eventAttribute/1083", 0 ), 
          newDatom( 'newEntity' , "event/date", Date.now() ), 
          newDatom( 'newEntity' , "eventAttribute/1139", "" )
        ]) ),
      ], {class: "feedContainer"})
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
      h3("Transaksjonstype"),
      entityAttributeView( State, State.S["TransactionsPage/selectedTransaction"], 7935, true ),
      br(),
      State.DB.get( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType" ) === 8829 
      ? categorizePaymentView( State )
      : State.DB.get( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType" ) === 8850 
        ? categorizeReceiptView( State )
        : (State.DB.get( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType" ) === 8019 || State.DB.get( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType" ) === 9035 )
            ? d("")
            : submitButton("Tilbakestill kategori", e => State.Actions.postDatoms(
              State.DB.get( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType" ) === 8976
                ? [
                  newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType", 8850 ),
                  newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/originNode", State.DB.get(State.S["TransactionsPage/selectedTransaction"], "transaction/originNode") , false ),
                ].concat( getEntityRetractionDatoms( State.DB, State.DB.get( State.S["TransactionsPage/selectedTransaction"], 9253) ) )
                : State.DB.get( State.S["TransactionsPage/selectedTransaction"], "transaction/paymentType") === 9086
                ? [
              newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType", 8829 ),
              newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/destinationNode", State.DB.get(State.S["TransactionsPage/selectedTransaction"], "transaction/destinationNode") , false ),
                ]
              : [
                newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType", 8850 ),
                newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/originNode", State.DB.get(State.S["TransactionsPage/selectedTransaction"], "transaction/originNode") , false ),
              ]
              
            ))
    ], {class: "feedContainer"}),
    br(),
    d([
      h3("Kilde"),
      State.DB.get( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType" ) === 8019 
        ? d("Fri postering")
        : isNumber( State.DB.get(State.S["TransactionsPage/selectedTransaction"], 9011) ) 
          ? entityAttributeView( State, State.S["TransactionsPage/selectedTransaction"],  9011, true )
          : State.DB.get( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType" ) === 9035 
            ? d([
              entityAttributeView( State, State.S["TransactionsPage/selectedTransaction"],  9041, true ),
              transactionValueView( State, State.DB.get( State.S["TransactionsPage/selectedTransaction"],  9041 ) ),
            ]) 
            : d([
                entityAttributeView( State, State.S["TransactionsPage/selectedTransaction"],  9104, true ),
                entityAttributeView( State, State.S["TransactionsPage/selectedTransaction"],  9084, true ),
                entityAttributeView( State, State.S["TransactionsPage/selectedTransaction"],  8832, true ),
                entityAttributeView( State, State.S["TransactionsPage/selectedTransaction"], 8830, true ),
                entityAttributeView( State, State.S["TransactionsPage/selectedTransaction"],  8831, true ),
                entityAttributeView( State, State.S["TransactionsPage/selectedTransaction"],  1080, true ),
                br(),
                d([
                  h3("Splitt"),
                  d([
                    (State.DB.get( State.S["TransactionsPage/selectedTransaction"] , "transaction/transactionType") === 8829 || State.DB.get( State.S["TransactionsPage/selectedTransaction"] , "transaction/transactionType") === 8850) ? submitButton("Splitt transaksjon", () => State.Actions.splitTransaction( State.S["TransactionsPage/selectedTransaction"]) ) : d("Tilbakestill kategori for å splitte"),
                    State.DB.get(State.S["TransactionsPage/selectedTransaction"], 9030).length > 0 
                      ? d([
                        entityLabelWithPopup( State, 9030 ),
                        d( State.DB.get(State.S["TransactionsPage/selectedTransaction"], 9030).map( t => d([
                          transactionLabel( State, t ),
                          entityAttributeView( State, t, 1083, true),
                          submitButton("X", () => State.Actions.retractEntity( t ))
                        ], {style: gridColumnsStyle("6fr 3fr 1fr") + "padding-left: 1em;"} ) ) ),
                        entityAttributeView( State, State.S["TransactionsPage/selectedTransaction"], 9040, true) 
                      ]) 
                      : d("Transaksjonen er ikke splittet")
                  ])
                ]),
        ]),
    ], {class: "feedContainer"}),
    br(),
    d([
      h3("Brukerinput"),
      State.DB.get( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType" ) === 8019 
      ? d([
        h3("Fri postering"),
        d( [7867, 7866, 1757, 1139, 1083, 7450].map( attribute => State.DB.get(attribute, "entity/entityType") === 42 ? entityAttributeView( State, State.S["TransactionsPage/selectedTransaction"], attribute, true ) : entityAttributeView( State, State.S["TransactionsPage/selectedTransaction"], attribute, true) ) ),
        br(),
        State.DB.get(State.S["TransactionsPage/selectedTransaction"], 8355) ? d("🔒") : submitButton("Slett", e => State.Actions["TransactionsPage/retractTransaction"](State.S["TransactionsPage/selectedTransaction"]) )
      ])
      : d( State.DB.get( State.DB.get( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType" ), 7942 ).map( inputAttribute => entityAttributeView( State, State.S["TransactionsPage/selectedTransaction"] , inputAttribute ) ) ),
    ], {class: "feedContainer"}),
    d([
      h3("Transaksjosoutput"),
      d([
        d([
          entityLabelWithPopup( State, 10047 ),
          d( formatNumber( State.DB.get(State.S["TransactionsPage/selectedTransaction"], 10047) ), {style: `text-align: right;`} ),
        ], {style: gridColumnsStyle("1fr 1fr")})
      ])
    ], {class: "feedContainer"})
  ])
  
  let categorizePaymentView = State => d([
    d([
      h3(`Kostnad`),
      d( State.DB.get( State.S.selectedCompany, 10052)( 8743 ).map(  selectedCostNode => nodeLabel( State, selectedCostNode, () => State.Actions.postDatoms([
        newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType", 8954 ),
        newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/destinationNode", selectedCostNode ),
      ]) ) ) ),
    ]),
    br(),
    d([
      h3(`Kjøp av verdipapir`),
      d([
        d( State.DB.get( State.S.selectedCompany, 10052)( 8738 ).map(  security => nodeLabel( State, security, () => State.Actions.postDatoms([
          newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType", 8908 ),
          newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/destinationNode", security ),
          newDatom( State.S["TransactionsPage/selectedTransaction"], 7450, 0 ),
        ]) ) ) ),
      ], {style:"display: inline-flex;"})
    ]),
    br(),
    d([
      h3(`Overføring`),
      d([
        d( State.DB.get( State.S.selectedCompany, 10052)( [8742, 8739, 8737] ).map(  selectedDebtNode => nodeLabel( State, selectedDebtNode, () => State.Actions.postDatoms([
          newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType", 8955 ),
          newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/destinationNode", selectedDebtNode ),
        ]) ) ) ),
      ], {style:"display: inline-flex;"})
    ]),
    br(),
    d([
      h3(`Utbytte`),
      d([
        d( State.DB.get( State.S.selectedCompany, 10052)( 7857 ).map(  selectedDebtNode => nodeLabel( State, selectedDebtNode, () => State.Actions.postDatoms([
          newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType", 8955 ),
          newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/destinationNode", selectedDebtNode ),
        ]) ) ) ),
      ], {style:"display: inline-flex;"})
    ]),
  ])
  
  let  categorizeReceiptView = State => d([
    d([
      h3(`Inntekt`),
      d(  State.DB.get( State.S.selectedCompany, 10052)( 8745 ).map(  selectedCostNode => nodeLabel( State, selectedCostNode, () => State.Actions.postDatoms([
        newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType", 8974 ),
        newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/originNode", selectedCostNode ),
      ]) ) ) ),
    ]),
    br(),
    d([
      h3(`Salg av verdipapir`),
      d([
        d( State.DB.get( State.S.selectedCompany, 10052)( 8738 ).map(  security => nodeLabel( State, security, async () => State.Actions.postDatoms([
          newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType", 8976 ),
          newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/originNode", security ),
          newDatom( State.S["TransactionsPage/selectedTransaction"], 7450, 0 ),
          newDatom( "newTransaction", "entity/entityType", State.DB.get( State.S["TransactionsPage/selectedTransaction"] , "entity/entityType") ),
          newDatom( "newTransaction", "entity/company", State.DB.get( State.S["TransactionsPage/selectedTransaction"] , "entity/company") ),
          newDatom( "newTransaction", "event/date", State.DB.get( State.S["TransactionsPage/selectedTransaction"] , "event/date") ),
          newDatom( "newTransaction", "transaction/accountingYear", State.DB.get( State.S["TransactionsPage/selectedTransaction"] , "transaction/accountingYear") ),
          newDatom( "newTransaction", "transaction/transactionType", 9035 ),
          newDatom( "newTransaction", "transaction/destinationNode", security ),
          newDatom( "newTransaction", "transaction/originNode", State.DB.get( State.S.selectedCompany, 10052)( 8744 )[0] ),
          newDatom( "newTransaction", "transaction/sourceTransactionForProfitCalculation", State.S["TransactionsPage/selectedTransaction"] ),
          newDatom( "newTransaction", 1139, "" ),
        ])  ) ) )
      ], {style:"display: inline-flex;"})
    ]),
    br(),
    d([
      h3(`Overføring`),
      d([
        d( State.DB.get( State.S.selectedCompany, 10052)( [8742, 8739, 8737] ).map(  selectedDebtNode => nodeLabel( State, selectedDebtNode, () => State.Actions.postDatoms([
          newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType", 8975 ),
          newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/originNode", selectedDebtNode ),
        ]) ) ) ),
      ], {style:"display: inline-flex;"})
    ])
  ], {class: "feedContainer"})
  
  //----