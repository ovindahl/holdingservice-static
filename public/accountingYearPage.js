const AccountingYearPage = {
    initial: DB => returnObject({ 
      "AccountingYearPage/selectedAccountingYear": undefined,
      "AccountingYearPage/selectedReportType": undefined,
    }),
    Actions: State => returnObject({
        "AccountingYearPage/selectAccountingYear": accountingYear => updateState( State, {S: {"AccountingYearPage/selectedAccountingYear": accountingYear}}),
        "AccountingYearPage/selectReportType": reportType => updateState( State, {S: {"AccountingYearPage/selectedReportType": reportType}}),
        "AccountingYearPage/retractAccountingYear": async accountingYear => updateState( State, { DB: await Transactor.retractEntity(State.DB, accountingYear), S: {"TransactionsPage/selectedTransaction": undefined } } ),
    })
  }

let accountingYearLabel = (State, entity, onClick ) => d([ d(State.DB.get(entity,6), {class: "entityLabel", style: `background-color: ${ entity === State.S["AccountingYearPage/selectedAccountingYear"] ? State.DB.get( State.DB.get( entity, "entity/entityType"), "entityType/color") : "gray" } ;`}, "click", onClick) ], {style:"display: inline-flex;"})



let accountingYearsView = State => isDefined(State.S["AccountingYearPage/selectedAccountingYear"])
? singleAccountingYearView( State )
: allAccountingYearsView( State )

let singleAccountingYearView = State => d([
    submitButton( " <---- Tilbake ", () => isDefined(State.S["AccountingYearPage/selectedReportType"]) ? State.Actions["AccountingYearPage/selectReportType"]( undefined ) : State.Actions["AccountingYearPage/selectAccountingYear"]( undefined )  ),
    isDefined(State.S["AccountingYearPage/selectedReportType"])
        ? singleReportView( State )
        : State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], "accountingYear/accountingYearType") === 8263 || State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], "accountingYear/accountingYearType") === 9903
        ? openingBalannceOverviewView( State )
        : State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], "accountingYear/accountingYearType") === 9892
            ? closedAccountingYearView( State )
            : openAccountingYearView( State )
]) 

let allAccountingYearsView = State => d([
h3("Alle regnskapsår"),
d( getAllAccountingYears(State.DB, State.S.selectedCompany).map( accountingYear => d([
  entityLabelWithPopup( State, accountingYear, () => State.Actions["AccountingYearPage/selectAccountingYear"]( accountingYear ) ),
  entityLabelWithPopup( State, State.DB.get( accountingYear, "accountingYear/accountingYearType")  ),
], {style: gridColumnsStyle("1fr 1fr 4fr")}) ), {class: "feedContainer"} ),
br(),
getAllAccountingYears(State.DB, State.S.selectedCompany).every( accYear => State.DB.get(accYear, 9753) )
  ? submitButton("Legg til", () => State.Actions.postDatomsAndUpdateCompany([
        newDatom( "newEntity", "entity/entityType", 7403 ),
        newDatom( "newEntity", "entity/company", State.S.selectedCompany ),
        newDatom( "newEntity", "accountingYear/accountingYearType", 8254 ),
        newDatom( "newEntity", "accountingYear/firstDate", Number( moment( State.DB.get( getAllAccountingYears(State.DB, State.S.selectedCompany).slice(-1)[0], "accountingYear/firstDate" ) ).add(1, "y").format("x") )    ),
        newDatom( "newEntity", "accountingYear/lastDate", Number(  moment( State.DB.get( getAllAccountingYears(State.DB, State.S.selectedCompany).slice(-1)[0], "accountingYear/lastDate" ) ).add(1, "y").format("x") ) ),
        newDatom( "newEntity", 9629, getAllAccountingYears(State.DB, State.S.selectedCompany).slice(-1)[0] ),
        newDatom( "newEntity", "entity/label", moment( State.DB.get( getAllAccountingYears(State.DB, State.S.selectedCompany).slice(-1)[0], "accountingYear/firstDate" ) ).add(1, "y").format("YYYY") ),
      ]) )
  : d("")
]) 

let openingBalannceOverviewView = State => d([
d([
  h3("Åpningsbalanse"),
], {class: "feedContainer"}),
d([
  h3("Transaksjoner i åpningsbalansen"),
  d( State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9715).map( t => transactionRowView( State, t) ) ),
], {class: "feedContainer"}),
br(),
d([
  h3("Årets utgående balanse"),
  balanceSheetView( State, State.DB.get( State.S["AccountingYearPage/selectedAccountingYear"], 9814 ) )
], {class: "feedContainer"}),
])

let getYearCloseDatoms = (State, accountingYear) => {

let company = State.S.selectedCompany

let taxDebtNode = State.DB.get( State.S.selectedCompany , 10052)( 5231 )[0]
let taxCostNode = State.DB.get( State.S.selectedCompany , 10052)( 8746 )[0]
let taxCostAmount = State.DB.get( State.S.selectedCompany, 8774 )
let lastDate = State.DB.get( accountingYear, "accountingYear/lastDate" )

let taxDatoms = [
  newDatom( "newEntity_tax", "entity/entityType", 7948 ),
  newDatom( 'newEntity_tax' , 'entity/company', company ), 
  newDatom( 'newEntity_tax' , 'transaction/accountingYear', accountingYear ), 
  newDatom( 'newEntity_tax' , "transaction/transactionType", 9286 ), 
  newDatom( 'newEntity_tax' , "transaction/originNode", taxDebtNode ), 
  newDatom( 'newEntity_tax' , "transaction/destinationNode", taxCostNode ), 
  newDatom( 'newEntity_tax' , "eventAttribute/1083", taxCostAmount ), 
  newDatom( 'newEntity_tax' , "event/date", lastDate ), 
  newDatom( 'newEntity_tax' , "eventAttribute/1139", "Årets skattekostnad"  ),
]

let annualResultNode = State.DB.get( State.S.selectedCompany , 10052)( 8784 )[0]
let retainedProfitsNode = State.DB.get( State.S.selectedCompany , 10052)( 8741 )[0]

let annualResultAmount = Math.abs( State.DB.get( State.S.selectedCompany , 8781 ) ) + taxCostAmount

let annualResultDatoms = [
  newDatom( "newTransaction_EK", "entity/entityType", 7948 ),
  newDatom( "newTransaction_EK", "entity/company", company ),
  newDatom( "newTransaction_EK", "event/date", lastDate ),
  newDatom( "newTransaction_EK", "transaction/accountingYear", accountingYear ),
  newDatom( "newTransaction_EK", "transaction/transactionType", 9384 ),
  newDatom( "newTransaction_EK", "transaction/originNode", retainedProfitsNode ),
  newDatom( "newTransaction_EK", "transaction/destinationNode", annualResultNode ),
  newDatom( "newTransaction_EK", 1083, annualResultAmount ),
  newDatom( "newTransaction_EK", 1139, "Bokføring av resultatdisponering" ),
 /*  newDatom( "newTransaction_resultat", "entity/entityType", 7948 ),
  newDatom( "newTransaction_resultat", "entity/company", company ),
  newDatom( "newTransaction_resultat", "event/date", lastDate ),
  newDatom( "newTransaction_resultat", "transaction/accountingYear", accountingYear ),
  newDatom( "newTransaction_resultat", "transaction/transactionType", 9723 ),
  newDatom( "newTransaction_resultat", "transaction/originNode", retainedProfitsNode ),
  newDatom( "newTransaction_resultat", "transaction/destinationNode", resultDisposalNode ),
  newDatom( "newTransaction_resultat", 1083, annualResultAmount  ),
  newDatom( "newTransaction_resultat", 1139, "Bokføring av resultatdisponering" ), */
]
  
  
let resetPnLAccountsDatoms = State.DB.get( State.S.selectedCompany , 10052)( 8788 )
  .filter( PnLnode => State.DB.get(PnLnode, 7433) !== 0 )
  .map( (PnLnode, index) => [
    newDatom( "newTransaction_"+index, "entity/entityType", 7948 ),
    newDatom( "newTransaction_"+index, "entity/company", company ),
    newDatom( "newTransaction_"+index, "event/date", lastDate ),
    newDatom( "newTransaction_"+index, "transaction/accountingYear", accountingYear ),
    newDatom( "newTransaction_"+index, "transaction/transactionType", 9716 ),
    newDatom( "newTransaction_"+index, "transaction/originNode", State.DB.get(PnLnode, 7433) >= 0 ? PnLnode : State.DB.get( State.S.selectedCompany , 10052)( 8784 )[0] ),
    newDatom( "newTransaction_"+index, "transaction/destinationNode", State.DB.get(PnLnode, 7433) < 0 ? PnLnode : State.DB.get( State.S.selectedCompany , 10052)( 8784 )[0] ),
    newDatom( "newTransaction_"+index, 1083, Math.abs( State.DB.get(PnLnode, 7433 ) )  ),
    newDatom( "newTransaction_"+index, 1139, "Bokføring av årsresultat" ),
] ).flat()


let lockYearDatom = newDatom(accountingYear, "accountingYear/accountingYearType", 9892)

return [
  taxDatoms,
  annualResultDatoms,
  resetPnLAccountsDatoms,
  lockYearDatom
].flat()

}

let accountingYearPnLView = (State, accountingYear) => d([
h3("Resultatregnskap"),
br(),
d([8743, 8744, 8745, 9878].map( node => d([
  entityLabelWithPopup( State, node ),
  d( formatNumber( State.DB.get(State.S.selectedCompany, 10053)( [node], State.DB.get( accountingYear, 9814 ) ) ), {style: `text-align: right;`} )
], {style: gridColumnsStyle("repeat(4, 1fr)")}) ) ),
d([10057, 10058].map( companyCalculatedField => d([
  entityLabelWithPopup( State, companyCalculatedField ),
  d( formatNumber( State.DB.get(State.S.selectedCompany, companyCalculatedField)( State.DB.get( accountingYear, 9814 ) ) ), {style: `text-align: right;`} )
], {style: gridColumnsStyle("repeat(4, 1fr)")}) ) )
], {class: "feedContainer"})

let closedAccountingYearView = State => d([
d([
  h3("Status på året"),
  lockedValueView(State, State.S["AccountingYearPage/selectedAccountingYear"], 8257),
  br(),
  getAllAccountingYears( State.DB, State.S.selectedCompany ).some( accountingYear => State.DB.get(accountingYear, "accountingYear/prevAccountingYear") === State.S["AccountingYearPage/selectedAccountingYear"] )
    ? d("Alle senere år må slettes for å gjøre endirnger")
    : submitButton("Tilbakestill årsavslutning", () => State.Actions.postDatomsAndUpdateCompany( getEntitiesRetractionDatoms( State.DB, State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9715).filter( transaction => [9286, 9384, 9716, 9723].includes( State.DB.get(transaction, "transaction/transactionType") )  ) ).concat(newDatom(State.S["AccountingYearPage/selectedAccountingYear"], "accountingYear/accountingYearType", 8254))   )  )
], {class: "feedContainer"}),
accountingYearPnLView( State, State.S["AccountingYearPage/selectedAccountingYear"] ),
/* d([
  h3("Balanse"),
  balanceSheetView( State, State.DB.get( State.S["AccountingYearPage/selectedAccountingYear"], 9814 ), State.DB.get( State.S["AccountingYearPage/selectedAccountingYear"], 9813 ) )
], {class: "feedContainer"}),*/
d([
  h3("Altinn-skjemaer"),
  d( State.DB.getAll( 7976 ).map( reportType => entityLabelWithPopup( State, reportType, () => State.Actions["AccountingYearPage/selectReportType"]( reportType ) ) ) )
], {class: "feedContainer"}), 
])

let singleReportView = State => State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], "accountingYear/accountingYearType") === 9892
? d([
entityLabelWithPopup( State, State.S["AccountingYearPage/selectedReportType"] ),
d(  State.DB.getAll( 8359 )
  .filter( reportField => State.DB.get(reportField, 8363) === State.S["AccountingYearPage/selectedReportType"] )
  .sort( (a,b) => a-b )
  .map( reportField => reportFieldView( State, State.S["AccountingYearPage/selectedAccountingYear"], reportField, State.DB.get( accountingYear, 9814 ) ) ) )
])
: d("Kan kun generere rapporter for avsluttede regnskapsår")

let reportFieldView = ( State, accountingYear, reportField, transactionIndex ) => d([
entityLabelWithPopup( State, reportField ),
d( new Function(["storedValue"], State.DB.get(State.DB.get(reportField, "attribute/valueType"), "valueType/formatFunction") )( getReportFieldValue( State.DB, State.S.selectedCompany, accountingYear, reportField, transactionIndex )  ), {style: State.DB.get(reportField, "attribute/valueType") === 31 ? `text-align: right;` : ""}  )
], {style: gridColumnsStyle("3fr 1fr")})

let openAccountingYearView = State => d([
d([
  h3("Status på året"),
  lockedValueView(State, State.S["AccountingYearPage/selectedAccountingYear"], 8257),
  br(),
  d( [9813, 9814, 9753].map( calculatedField => d([
    entityLabelWithPopup( State, calculatedField),
    d( String( State.DB.get( State.S["AccountingYearPage/selectedAccountingYear"], calculatedField ) ) )
  ], {style: gridColumnsStyle("1fr 1fr")}) ) ),
  br(),
  submitButton("Slett året og alle årets transaksjoner", () => State.Actions.postDatomsAndUpdateCompany( getEntitiesRetractionDatoms( State.DB, [State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9715), State.S["AccountingYearPage/selectedAccountingYear"]].flat() ) )  )
], {class: "feedContainer"}),
d([
  h3("Årets åpningsbalanse"),
  br(),
  balanceSheetView( State, State.DB.get( State.S["AccountingYearPage/selectedAccountingYear"], 9813 ) )
], {class: "feedContainer"}), 
br(),
d([
  h3("Bank"),
  br(),
  d([
    d([
      entityLabelWithPopup( State, 8737 ),
      entityLabelWithPopup( State, 7433 ),
      d("Importer")
    ], {style: gridColumnsStyle("1fr 1fr 1fr")}),
    d( State.DB.get( State.S.selectedCompany , 10052)(8737).map( bankAccount => d([
      entityLabelWithPopup( State, bankAccount ),
      lockedValueView( State, bankAccount, 7433 ),
      input({type: "file", style: `text-align: right;`}, "change", e => State.Actions.importBankTransactions( bankAccount, e ) ),
    ], {style: gridColumnsStyle("1fr 1fr 1fr")}) ) )
  ]),
  entityAttributeView( State, State.S["AccountingYearPage/selectedAccountingYear"], 8750, true ),
], {class: "feedContainer"}),
br(),
d([
  h3("Verdijustering"),
  entityAttributeView( State, State.S["AccountingYearPage/selectedAccountingYear"], 8751, true ),
], {class: "feedContainer"}),
br(),
d([
  d([
    h3("Foreløpig resultat"),
    nodeBalanceView( State, 8743, State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9886) ),
    entityAttributeView( State, State.S.selectedCompany,  9632, State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9886), true ),
    nodeBalanceView( State, 8744, State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9886) ),
    nodeBalanceView( State, 8745, State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9886) ),
    nodeBalanceView( State, 9878, State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9886) ),
    entityAttributeView( State, State.S.selectedCompany,  9633, State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9886), true ),
    entityAttributeView( State, State.S.selectedCompany,  8769, State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9886), true ),
  ]),
  br(),
  d([
    h3("Skatt"),
    entityAttributeView( State, State.S.selectedCompany,  8770, State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9886), true ),
    entityAttributeView( State, State.S.selectedCompany,  8771, State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9886), true ),
    entityAttributeView( State, State.S.selectedCompany,  8772, State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9886), true ),
    entityAttributeView( State, State.S.selectedCompany,  8773, State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9886), true ),
    entityAttributeView( State, State.S.selectedCompany,  8774, State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9886), true ),
    entityAttributeView( State, State.S.selectedCompany,  8775, State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9886), true ),
  ]),
  br(),
  d([
    h3("Resultatdisponering"),
    entityAttributeView( State, State.S.selectedCompany,  8781, State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9886), true ),
  ]),
  br(),
  (State.DB.get( State.S["AccountingYearPage/selectedAccountingYear"], 8750 ) && State.DB.get( State.S["AccountingYearPage/selectedAccountingYear"], 8751 ) ) 
    ? submitButton("Bokfør skattekostnad og årsresultat, og lås året", () => State.Actions.postDatomsAndUpdateCompany( getYearCloseDatoms( State, State.S["AccountingYearPage/selectedAccountingYear"] ) )  )
    :  d("Fullfør årets oppgaver for å lukke året")
], {class: "feedContainer"})
]) 
