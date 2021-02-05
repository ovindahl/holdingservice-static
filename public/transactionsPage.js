
//--- Transaction views

const TransactionsPage = {
    initial: DB => returnObject({ 
      "TransactionsPage/selectedAccountingYear": getAllAccountingYears( DB, 6829 ).slice(-1)[0],
      "TransactionsPage/selectedTransaction": undefined
    }),
    Actions: State => returnObject({
      "TransactionsPage/selectAccountingYear": accountingYear => updateState( State, {S: {"TransactionsPage/selectedAccountingYear": accountingYear}}),
      "TransactionsPage/selectTransaction": transaction => updateState( State, {S: {"TransactionsPage/selectedTransaction": transaction}}),
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
        
          let accountingYear = getAllAccountingYears( State.DB, State.S.selectedCompany ).slice(-1)[0]
        
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

let transactionRowView = (State, companyTransaction) => d([
    transactionLabel( State, companyTransaction ),
    d( moment( State.DB.get( companyTransaction, 1757 ) ).format("DD.MM.YYYY") , {style: `text-align: right;`}),
    d([
      isDefined( State.DB.get(companyTransaction, 7867) ) ? nodeLabel(State, State.DB.get(companyTransaction, 7867), State.Company.get(companyTransaction, 8354) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}),
      d(" --> "),
      isDefined( State.DB.get(companyTransaction, 7866) ) ? nodeLabel(State, State.DB.get(companyTransaction, 7866), State.Company.get(companyTransaction, 8354) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}) ,
    ], {style: gridColumnsStyle("3fr 1fr 3fr") + "padding-left: 3em;"} ),
    companyValueView( State, companyTransaction, 8748 ),
  ], {style: gridColumnsStyle("1fr 1fr 3fr 1fr ")})
  

let allTransactionsView = State => {

    let alltransactions = getAllTransactions(State.DB, State.S.selectedCompany, State.S["TransactionsPage/selectedAccountingYear"] )
  
    return d([
      h3("Transaksjoner"),
      d([
        entityLabelWithPopup( State, 7403 ),
        d( getAllAccountingYears(State.DB, State.S.selectedCompany).map( e => accountingYearLabel(State, e, () => State.Actions["TransactionsPage/selectAccountingYear"](e)) ), {display: "flex"} )
      ], {class: "feedContainer", style: gridColumnsStyle("1fr 3fr")}),
      br(),
      d([
        d( alltransactions.map( companyTransaction => transactionRowView(State, companyTransaction)  ) ),
        br(),
        submitButton("Legg til fri postering", () => State.Actions.postDatomsAndUpdateCompany([
          newDatom( 'newEntity' , 'entity/entityType', 7948 ),
          newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
          newDatom( 'newEntity' , 'transaction/accountingYear', State.S.selectedAccountingYear ), 
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
  
    let selectedIndex = State.Company.get( State.S["TransactionsPage/selectedTransaction"], 8354 )
    let prevTransactionDatom = State.S.companyDatoms.find( Datom => Datom.attribute === 8354 && Datom.value === selectedIndex - 1 )
    let prevTransaction = isDefined( prevTransactionDatom ) ? prevTransactionDatom.entity : undefined
    let nextTransactionDatom = State.S.companyDatoms.find( Datom => Datom.attribute === 8354 && Datom.value === selectedIndex + 1 )
    let nextTransaction = isDefined( nextTransactionDatom ) ? nextTransactionDatom.entity : undefined
  
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
      entityLabelWithPopup(State, 7433 ),
      d([
        d( formatNumber( State.Company.get( balanceObject, 7433, State.Company.get( companyTransaction, 8354 ) - 1 ) ), {class: "redlineText", style: `text-align: right;`} ),
        d( formatNumber( State.Company.get( balanceObject, 7433, State.Company.get( companyTransaction, 8354 )  ) ), {style: `text-align: right;`} ),
      ]),
    ], {style: gridColumnsStyle("1fr 1fr")}),
  ])
  
  let transactionFlowView = (State, companyTransaction) => d([
    d([
      d([ isDefined( State.DB.get(companyTransaction, 7867) ) ? nodeLabel(State, State.DB.get(companyTransaction, 7867), State.Company.get(companyTransaction, 8354) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}) ]),
      isDefined( State.DB.get(companyTransaction, 7867) ) 
        ? balanceChangeView( State, State.Company.get( companyTransaction, 7867 ), companyTransaction ) 
        : d("")
    ]),
    d([
      d(""),
      d([
        d( moment( State.Company.get( companyTransaction, 1757, State.S.selectedCompanyEventIndex ) ).format("DD.MM.YYYY") ),
        transactionLabel( State, companyTransaction ),
        companyValueView( State, companyTransaction, 8748 ),
        d(" --------------> "),
      ]),
      d(""),
    ], {style: gridColumnsStyle("3fr 2fr 3fr")}),
    d([
      d([ isDefined( State.DB.get(companyTransaction, 7866) ) ? nodeLabel(State, State.DB.get(companyTransaction, 7866), State.Company.get(companyTransaction, 8354) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}), ]) ,
      isDefined( State.DB.get(companyTransaction, 7866) ) 
        ? balanceChangeView( State, State.Company.get( companyTransaction, 7866 ), companyTransaction ) 
        : d("")
    ])
  ], {class: "feedContainer", style: gridColumnsStyle("2fr 3fr 2fr")})
  
  // Outgoing transactions
  
  
  let transactionLabelText = (State, companyTransaction) => d([d(`Transaksjon ${ State.Company.get(companyTransaction, 8354) }`, {class: "entityLabel", style: `background-color:${State.DB.get( State.DB.get(companyTransaction, "transaction/transactionType"), 20  )};`}, "click", () => State.Actions["TransactionsPage/selectTransaction"](companyTransaction) )], {style:"display: flex;"})
  
  let transactionLabel = (State, companyTransaction) => d([
    d([
      transactionLabelText( State, companyTransaction ),
      transactionPopUp( State, companyTransaction ),
    ], {class: "popupContainer", style:"display: inline-flex;"})
    ], {style:"display: inline-flex;"} )
  
    let transactionPopUp = (State, companyTransaction) => d([
      d([
        transactionLabelText( State, companyTransaction ),
        d( moment( State.Company.get( companyTransaction, 1757, State.S.selectedCompanyEventIndex ) ).format("DD.MM.YYYY") ),
      ], {style: gridColumnsStyle("1fr 1fr")}),
      companyDatomView( State, companyTransaction, 8748 ),
      d([
        entityLabelWithPopup(State, State.DB.get(companyTransaction, 7867) ),
        d([
          companyValueView( State, companyTransaction, 8748 ),
          d(" ---------> "),
        ]),
        entityLabelWithPopup(State, State.DB.get(companyTransaction, 7866) )
      ], {style: gridColumnsStyle("3fr 2fr 3fr")})
    ], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;width: 400px;"})
  
  
  let transactionView2 = State => d([
    prevNextTransactionView( State ),
    br(),
    transactionFlowView( State, State.S["TransactionsPage/selectedTransaction"] ),
    br(),
    d([
      h3("Transaksjonstype"),
      companyDatomView( State, State.S["TransactionsPage/selectedTransaction"], 7935 ),
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
                ].concat( getEntityRetractionDatoms( State.DB, State.Company.get( State.S["TransactionsPage/selectedTransaction"], 9253) ) )
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
        : isNumber( State.Company.get(State.S["TransactionsPage/selectedTransaction"], 9011) ) 
          ? companyDatomView( State, State.S["TransactionsPage/selectedTransaction"],  9011 )
          : State.DB.get( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType" ) === 9035 
            ? d([
              companyDatomView( State, State.S["TransactionsPage/selectedTransaction"],  9041 ),
              companyDatomView( State, State.Company.get( State.S["TransactionsPage/selectedTransaction"],  9041 ),  8748 ),
              companyDatomView( State, State.S["TransactionsPage/selectedTransaction"],  9191 ),
              companyDatomView( State, State.S["TransactionsPage/selectedTransaction"],  9042 ),
            ]) 
            : d([
                companyDatomView( State, State.S["TransactionsPage/selectedTransaction"],  9104 ),
                companyDatomView( State, State.S["TransactionsPage/selectedTransaction"],  9084 ),
                companyDatomView( State, State.S["TransactionsPage/selectedTransaction"],  8832 ),
                companyDatomView( State, State.S["TransactionsPage/selectedTransaction"], 8830 ),
                companyDatomView( State, State.S["TransactionsPage/selectedTransaction"],  8831 ),
                companyDatomView( State, State.S["TransactionsPage/selectedTransaction"],  1080 ),
                br(),
                d([
                  h3("Splitt"),
                  d([
                    (State.DB.get( State.S["TransactionsPage/selectedTransaction"] , "transaction/transactionType") === 8829 || State.DB.get( State.S["TransactionsPage/selectedTransaction"] , "transaction/transactionType") === 8850) ? submitButton("Splitt transaksjon", () => State.Actions.splitTransaction( State.S["TransactionsPage/selectedTransaction"]) ) : d("Tilbakestill kategori for å splitte"),
                    State.Company.get(State.S["TransactionsPage/selectedTransaction"], 9030).length > 0 
                      ? d([
                        entityLabelWithPopup( State, 9030 ),
                        d( State.Company.get(State.S["TransactionsPage/selectedTransaction"], 9030).map( t => d([
                          transactionLabel( State, t ),
                          entityAttributeView( State, t, 1083),
                          submitButton("X", () => State.Actions.retractEntity( t ))
                        ], {style: gridColumnsStyle("6fr 3fr 1fr") + "padding-left: 1em;"} ) ) ),
                        companyDatomView( State, State.S["TransactionsPage/selectedTransaction"], 9040) 
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
        d( [7867, 7866, 1757, 1139, 1083, 7450].map( attribute => State.DB.get(attribute, "entity/entityType") === 42 ? entityAttributeView( State, State.S["TransactionsPage/selectedTransaction"], attribute ) : companyDatomView( State, State.S["TransactionsPage/selectedTransaction"], attribute) ) ),
        br(),
        State.Company.get(State.S["TransactionsPage/selectedTransaction"], 8355) ? d("🔒") : submitButton("Slett", e => State.Actions.retractEntity(State.S["TransactionsPage/selectedTransaction"]) )
      ])
      : d( State.DB.get( State.DB.get( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType" ), 7942 ).map( inputAttribute => entityAttributeView( State, State.S["TransactionsPage/selectedTransaction"] , inputAttribute ) ) ),
    ], {class: "feedContainer"}),
    d([
      h3("Transaksjosoutput"),
      d([
        companyDatomView( State, State.S["TransactionsPage/selectedTransaction"],  8748),
        isNumber( State.DB.get( State.S["TransactionsPage/selectedTransaction"], 7450)   ) ? companyDatomView( State, State.S["TransactionsPage/selectedTransaction"],  8749) : d("")
      ])
    ], {class: "feedContainer"})
  ])
  
  let categorizePaymentView = State => d([
    d([
      h3(`Kostnad`),
      d( State.Company.getBalanceObjects( 8743 ).map(  selectedCostNode => nodeLabel( State, selectedCostNode, undefined, () => State.Actions.postDatoms([
        newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType", 8954 ),
        newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/destinationNode", selectedCostNode ),
      ]) ) ) ),
    ]),
    br(),
    d([
      h3(`Kjøp av verdipapir`),
      d([
        d( State.Company.getBalanceObjects( 8738 ).map(  security => nodeLabel( State, security, undefined, () => State.Actions.postDatoms([
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
        d( State.Company.getBalanceObjects( [8742, 8739, 8737] ).map(  selectedDebtNode => nodeLabel( State, selectedDebtNode, undefined, () => State.Actions.postDatoms([
          newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType", 8955 ),
          newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/destinationNode", selectedDebtNode ),
        ]) ) ) ),
      ], {style:"display: inline-flex;"})
    ]),
    br(),
    d([
      h3(`Utbytte`),
      d([
        d( State.Company.getBalanceObjects( 7857 ).map(  selectedDebtNode => nodeLabel( State, selectedDebtNode, undefined, () => State.Actions.postDatoms([
          newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType", 8955 ),
          newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/destinationNode", selectedDebtNode ),
        ]) ) ) ),
      ], {style:"display: inline-flex;"})
    ]),
  ])
  
  let  categorizeReceiptView = State => d([
    d([
      h3(`Inntekt`),
      d( State.Company.getBalanceObjects( 8745 ).map(  selectedCostNode => nodeLabel( State, selectedCostNode, undefined, () => State.Actions.postDatoms([
        newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType", 8974 ),
        newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/originNode", selectedCostNode ),
      ]) ) ) ),
    ]),
    br(),
    d([
      h3(`Salg av verdipapir`),
      d([
        d( State.Company.getBalanceObjects( 8738 ).map(  security => nodeLabel( State, security, undefined, async () => State.Actions.postDatoms([
          newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType", 8976 ),
          newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/originNode", security ),
          newDatom( State.S["TransactionsPage/selectedTransaction"], 7450, 0 ),
          newDatom( "newTransaction", "entity/entityType", State.DB.get( State.S["TransactionsPage/selectedTransaction"] , "entity/entityType") ),
          newDatom( "newTransaction", "entity/company", State.DB.get( State.S["TransactionsPage/selectedTransaction"] , "entity/company") ),
          newDatom( "newTransaction", "event/date", State.DB.get( State.S["TransactionsPage/selectedTransaction"] , "event/date") ),
          newDatom( "newTransaction", "transaction/accountingYear", State.DB.get( State.S["TransactionsPage/selectedTransaction"] , "transaction/accountingYear") ),
          newDatom( "newTransaction", "transaction/transactionType", 9035 ),
          newDatom( "newTransaction", "transaction/destinationNode", security ),
          newDatom( "newTransaction", "transaction/originNode", State.Company.getBalanceObjects( 8744 )[0] ),
          newDatom( "newTransaction", "transaction/sourceTransactionForProfitCalculation", State.S["TransactionsPage/selectedTransaction"] ),
          newDatom( "newTransaction", 1139, "" ),
        ])  ) ) )
      ], {style:"display: inline-flex;"})
    ]),
    br(),
    d([
      h3(`Overføring`),
      d([
        d( State.Company.getBalanceObjects( [8742, 8739, 8737] ).map(  selectedDebtNode => nodeLabel( State, selectedDebtNode, undefined, () => State.Actions.postDatoms([
          newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/transactionType", 8975 ),
          newDatom( State.S["TransactionsPage/selectedTransaction"], "transaction/originNode", selectedDebtNode ),
        ]) ) ) ),
      ], {style:"display: inline-flex;"})
    ])
  ], {class: "feedContainer"})
  
  //----