const AccountingYearPage = {
    initial: DB => returnObject({ 
      "AccountingYearPage/selectedAccountingYear": undefined,
      "AccountingYearPage/selectedReportType": undefined,
    }),
    Actions: State => returnObject({
        "AccountingYearPage/selectAccountingYear": accountingYear => updateState( State, {S: {selectedPage: 7509, "AccountingYearPage/selectedAccountingYear": accountingYear}}),
        "AccountingYearPage/selectReportType": reportType => updateState( State, {S: {"AccountingYearPage/selectedReportType": reportType}}),
        "AccountingYearPage/retractAccountingYear": async accountingYear => updateState( State, { DB: await Transactor.retractEntity(State.DB, accountingYear), S: {"TransactionsPage/selectedTransaction": undefined } } ),





        "AccountingYearPage/createTaxSourceDocument": async accountingYear => {

          let latestTransactionIndex = State.DB.get( State.S.selectedCompany, 10069 )
          let lastDate = State.DB.get( accountingYear, "accountingYear/lastDate" )
          let index = 1

          let resultBeforeTax = State.DB.get(State.S.selectedCompany, 10053)([8788], latestTransactionIndex)
          let permanentDifferences = State.DB.get(State.S.selectedCompany, 10053)([5509], latestTransactionIndex)
          let tempDifferences = 0
          let taxBasis = resultBeforeTax - permanentDifferences - tempDifferences
          let taxCost = Math.min(taxBasis * 0.22, 0) 


          let Datoms = [
            newDatom( "newDatom_"+ index, "entity/entityType", 10062  ),
            newDatom( "newDatom_"+ index, "entity/company", State.S.selectedCompany  ),
            newDatom( "newDatom_"+ index, "sourceDocument/sourceDocumentType", 10298 ),
            newDatom( "newDatom_"+ index, "entity/accountingYear", accountingYear ),
            newDatom( "newDatom_"+ index, "event/date", lastDate ),
            newDatom( "newDatom_"+ index, "entity/label", `Bilag for årets skattekostnad`  ),
            newDatom( "newDatom_"+ index, 7656, resultBeforeTax ),
            newDatom( "newDatom_"+ index, 1078, permanentDifferences ),
            newDatom( "newDatom_"+ index, 1817, tempDifferences ),
            newDatom( "newDatom_"+ index, 1824, taxBasis ),
            newDatom( "newDatom_"+ index, 7657, taxCost ),
            newDatom( "newDatom_"+ index, 1083, taxCost ),
            
          ]

          State.Actions.postDatoms( Datoms )
          },
          "AccountingYearPage/createAnnualResultSourceDocument": async accountingYear => {

            let latestTransactionIndex = State.DB.get( State.S.selectedCompany, 10069 )
            let lastDate = State.DB.get( accountingYear, "accountingYear/lastDate" )
            let index = 1
  
            let resultBeforeTax = State.DB.get(State.S.selectedCompany, 10053)([8788], latestTransactionIndex)
            let taxCost = State.DB.get(State.S.selectedCompany, 10053)([8776], latestTransactionIndex)
            let annualResult = resultBeforeTax + taxCost
            
  
            let Datoms = [
              newDatom( "newDatom_"+ index, "entity/entityType", 10062  ),
              newDatom( "newDatom_"+ index, "entity/company", State.S.selectedCompany  ),
              newDatom( "newDatom_"+ index, "sourceDocument/sourceDocumentType", 10309 ),
              newDatom( "newDatom_"+ index, "entity/accountingYear", accountingYear ),
              newDatom( "newDatom_"+ index, "event/date", lastDate ),
              newDatom( "newDatom_"+ index, "entity/label", `Bilag for årets resultat`  ),
              newDatom( "newDatom_"+ index, 7656, resultBeforeTax ),
              newDatom( "newDatom_"+ index, 7657, taxCost ),
              newDatom( "newDatom_"+ index, 7661, annualResult ),
              newDatom( "newDatom_"+ index, 7672, annualResult ),
              newDatom( "newDatom_"+ index, 1083, -annualResult ),
              
            ]
  
            State.Actions.postDatoms( Datoms )
            },


        "AccountingYearPage/closeAccountingYear": async accountingYear => {

          let company = State.S.selectedCompany
          
          let taxDebtNode = State.DB.get( State.S.selectedCompany , 10052)( 5231 )[0]
          let taxCostNode = State.DB.get( State.S.selectedCompany , 10052)( 8746 )[0]
          let taxCostAmount = State.DB.get( State.S.selectedCompany, 8774 )
          let lastDate = State.DB.get( accountingYear, "accountingYear/lastDate" )

          let annualResultNode = State.DB.get( State.S.selectedCompany , 10052)( 8784 )[0]
          let retainedProfitsNode = State.DB.get( State.S.selectedCompany , 10052)( 8741 )[0]

          let latestTransactionIndex = State.DB.get( State.S.selectedCompany, 10069 )


          let tax = newTransactionDatoms( 9286, accountingYear, taxDebtNode, taxCostNode, lastDate, "Årets skattekostnad", 1 )
          let annualResults = newTransactionDatoms( 9384, accountingYear, retainedProfitsNode, annualResultNode, lastDate, "Årets Resultat", 2 )

          let PnLreset = State.DB.get( State.S.selectedCompany , 10052)( 8788 )
            .filter( PnLnode => State.DB.get(PnLnode, 7433) !== 0 )
            .map( (PnLnode, index) => {

              let currentBalance =  State.DB.get(PnLnode, 10045)( latestTransactionIndex )

              let orignNode = currentBalance >= 0 ? PnLnode : annualResultNode

              let destinationNode = orignNode === PnLnode ? annualResultNode : PnLnode

              let nodeDatoms = newTransactionDatoms( 7948, accountingYear, orignNode , destinationNode, lastDate, "Tilbakestilling av kostnads- og inntektskontoer", index + 3 )

              return nodeDatoms

            }  )


          let lockYearDatom = newDatom(accountingYear, "accountingYear/accountingYearType", 9892)
          
          let yearCloseDatoms =  [
            tax,
            annualResults,
            PnLreset,
            lockYearDatom
          ].flat()

          State.Actions.postDatoms( yearCloseDatoms )
          },
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
d( State.DB.get(State.S.selectedCompany, 10061).map( accountingYear => d([
  entityLabelWithPopup( State, accountingYear, () => State.Actions["AccountingYearPage/selectAccountingYear"]( accountingYear ) ),
  entityLabelWithPopup( State, State.DB.get( accountingYear, "accountingYear/accountingYearType")  ),
], {style: gridColumnsStyle("1fr 1fr 4fr")}) ), {class: "feedContainer"} ),
br(),
State.DB.get(State.S.selectedCompany, 10061).every( accYear => State.DB.get(accYear, 9753) )
  ? submitButton("Legg til", () => State.Actions.postDatoms([
        newDatom( "newEntity", "entity/entityType", 7403 ),
        newDatom( "newEntity", "entity/company", State.S.selectedCompany ),
        newDatom( "newEntity", "accountingYear/accountingYearType", 8254 ),
        newDatom( "newEntity", "accountingYear/firstDate", Number( moment( State.DB.get( State.DB.get(State.S.selectedCompany, 10061).slice(-1)[0], "accountingYear/firstDate" ) ).add(1, "y").format("x") )    ),
        newDatom( "newEntity", "accountingYear/lastDate", Number(  moment( State.DB.get( State.DB.get(State.S.selectedCompany, 10061).slice(-1)[0], "accountingYear/lastDate" ) ).add(1, "y").format("x") ) ),
        newDatom( "newEntity", 9629, State.DB.get(State.S.selectedCompany, 10061).slice(-1)[0] ),
        newDatom( "newEntity", "entity/label", moment( State.DB.get( State.DB.get(State.S.selectedCompany, 10061).slice(-1)[0], "accountingYear/firstDate" ) ).add(1, "y").format("YYYY") ),
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


let accountingYearPnLView = (State, transactionIndex) => d([
h3("Resultatregnskap"),
br(),
d([8563, 8564, 8565, 8572, 8578, 8579, 8580, 8581, 8582, 8585].map( reportField => reportFieldView( State, reportField, transactionIndex ) ) ),
], {class: "feedContainer"})


let openAccountingYearPnLView = (State, transactionIndex) => d([
  h3("Foreløpig resultatregnskap"),
  d( `Siste transaksjon er Transaksjon ${transactionIndex}, ${ moment(State.DB.get( State.DB.get(State.S.selectedCompany, 10056)(transactionIndex),1757)).format("DD.MM.YYYY")   }` ),
  br(),
  d([8563, 8564, 8565, 8572, 8578, 8579, 8580].map( reportField => reportFieldView( State, reportField, transactionIndex ) ) ),
  ], {class: "feedContainer"})

let accountingYearTaxView = (State, transactionIndex) => {

  let currentTaxSourceDocument = State.DB.get( State.S.selectedCompany, 10073 ).find( sourceDocument => State.DB.get(sourceDocument,"sourceDocument/sourceDocumentType") === 10298 && State.DB.get(sourceDocument,"entity/accountingYear") === State.S["AccountingYearPage/selectedAccountingYear"]  )


  return d([
    h3("Skatteberegning"),
    d( `Siste transaksjon er Transaksjon ${transactionIndex}, ${ moment(State.DB.get( State.DB.get(State.S.selectedCompany, 10056)(transactionIndex),1757)).format("DD.MM.YYYY")   }` ),
    br(),
    d([8580, 8538, 8540, 8542, 8541].map( reportField => reportFieldView( State, reportField, transactionIndex ) ) ),
    br(),
  
    isDefined( currentTaxSourceDocument )
      ? d([
        sourceDocumentLabel( State, currentTaxSourceDocument ),
        submitButton("Slett", () => State.Actions["SourceDocumentsPage/retractSourceDocument"]( currentTaxSourceDocument )  )
      ])
      : submitButton("Lag bilag for skattekostnad", () => State.Actions["AccountingYearPage/createTaxSourceDocument"]( State.S["AccountingYearPage/selectedAccountingYear"] )  )
  
    
    ], {class: "feedContainer"})

} 

let closedAccountingYearView = State => d([
d([
  h3("Status på året"),
  lockedValueView(State, State.S["AccountingYearPage/selectedAccountingYear"], 8257),
  br(),
  State.DB.get(State.S.selectedCompany, 10061).some( accountingYear => State.DB.get(accountingYear, "accountingYear/prevAccountingYear") === State.S["AccountingYearPage/selectedAccountingYear"] )
    ? d("Alle senere år må slettes for å gjøre endirnger")
    : submitButton("Tilbakestill årsavslutning", () => State.Actions.postDatoms( getEntitiesRetractionDatoms( State.DB, State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9715).filter( transaction => [9286, 9384, 9716, 9723].includes( State.DB.get(transaction, "transaction/transactionType") )  ) ).concat(newDatom(State.S["AccountingYearPage/selectedAccountingYear"], "accountingYear/accountingYearType", 8254))   )  )
], {class: "feedContainer"}),
accountingYearPnLView( State, State.DB.get( State.S["AccountingYearPage/selectedAccountingYear"], 9814 ) ),
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
  .map( reportField => reportFieldView( State, State.S["AccountingYearPage/selectedAccountingYear"], reportField, State.DB.get( State.S["AccountingYearPage/selectedAccountingYear"], 9814 ) ) ) )
])
: d("Kan kun generere rapporter for avsluttede regnskapsår")

let reportFieldView = ( State, reportField, transactionIndex ) => d([
entityLabelWithPopup( State, reportField ),
d( new Function(["storedValue"], State.DB.get(State.DB.get(reportField, "attribute/valueType"), "valueType/formatFunction") )( getReportFieldValue( State.DB, State.S.selectedCompany, reportField, transactionIndex )  ), {style: State.DB.get(reportField, "attribute/valueType") === 31 ? `text-align: right;` : ""}  )
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
  submitButton("Slett året og alle årets transaksjoner", () => State.Actions.postDatoms( getEntitiesRetractionDatoms( State.DB, [State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9715), State.S["AccountingYearPage/selectedAccountingYear"]].flat() ) )  )
], {class: "feedContainer"}),
d([
  h3("Årets åpningsbalanse"),
  br(),
  //balanceSheetView( State, State.DB.get( State.S["AccountingYearPage/selectedAccountingYear"], 9813 ) )
], {class: "feedContainer"}), 
br(),
d([
  h3("Bank"),
  entityAttributeView( State, State.S["AccountingYearPage/selectedAccountingYear"], 8750 ),
], {class: "feedContainer"}),
br(),
d([
  h3("Verdijustering"),
  entityAttributeView( State, State.S["AccountingYearPage/selectedAccountingYear"], 8751 ),
], {class: "feedContainer"}),
br(),
d([
  openAccountingYearPnLView( State, State.DB.get( State.S.selectedCompany, 10069 )  ),
  accountingYearTaxView( State, State.DB.get( State.S.selectedCompany, 10069 )  ),
  br(),
  accountingYearResultsView( State, State.DB.get( State.S.selectedCompany, 10069 )  ),
  br(),
  (State.DB.get( State.S["AccountingYearPage/selectedAccountingYear"], 8750 ) && State.DB.get( State.S["AccountingYearPage/selectedAccountingYear"], 8751 ) ) 
    ? submitButton("Bokfør skattekostnad og årsresultat, og lås året", () => State.Actions["AccountingYearPage/closeAccountingYear"]( State.S["AccountingYearPage/selectedAccountingYear"] ) )
    :  d("Fullfør årets oppgaver for å lukke året")
], {class: "feedContainer"})
]) 



let accountingYearResultsView = (State, transactionIndex) => {

  let currentAnnualResultSourceDocument = State.DB.get( State.S.selectedCompany, 10073 ).find( sourceDocument => State.DB.get(sourceDocument,"sourceDocument/sourceDocumentType") === 10309 && State.DB.get(sourceDocument,"entity/accountingYear") === State.S["AccountingYearPage/selectedAccountingYear"]  )


  return d([
    h3("Årets resultat"),
    h3("Resultatdisponering"),
    d([8580, 8581, 8582, 8585].map( reportField => reportFieldView( State, reportField, transactionIndex ) ) ),
    br(),
    isDefined( currentAnnualResultSourceDocument )
      ? d([
        sourceDocumentLabel( State, currentAnnualResultSourceDocument ),
        submitButton("Slett", () => State.Actions["SourceDocumentsPage/retractSourceDocument"]( currentAnnualResultSourceDocument )  )
      ])
      : submitButton("Lag bilag for årsresultat", () => State.Actions["AccountingYearPage/createAnnualResultSourceDocument"]( State.S["AccountingYearPage/selectedAccountingYear"] )  )
  
    
    ], {class: "feedContainer"})

} 