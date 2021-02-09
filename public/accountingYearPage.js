const AccountingYearPage = {
    initial: DB => returnObject({ 
      "AccountingYearPage/selectedAccountingYear": undefined,
      "AccountingYearPage/selectedReportType": undefined,
    }),
    Actions: State => returnObject({
        "AccountingYearPage/selectAccountingYear": accountingYear => updateState( State, {S: {selectedPage: 7509, "AccountingYearPage/selectedAccountingYear": accountingYear}}),
        "AccountingYearPage/selectReportType": reportType => updateState( State, {S: {"AccountingYearPage/selectedReportType": reportType}}),
        "AccountingYearPage/retractAccountingYear": async accountingYear => updateState( State, { DB: await Transactor.retractEntity(State.DB, accountingYear), S: {"TransactionsPage/selectedTransaction": undefined } } ),
        "AccountingYearPage/createAnnualResultSourceDocument": async accountingYear => {

          let lastDate = State.DB.get( accountingYear, "accountingYear/lastDate" )

          let Datoms = [
            newDatom( "newDatom_annualResult", "entity/entityType", 10062  ),
            newDatom( "newDatom_annualResult", "entity/company", State.S.selectedCompany  ),
            newDatom( "newDatom_annualResult", "sourceDocument/sourceDocumentType", 10309 ),
            newDatom( "newDatom_annualResult", "entity/accountingYear", accountingYear ),
            newDatom( "newDatom_annualResult", "event/date", lastDate ),
            newDatom( "newDatom_annualResult", "entity/label", `Bilag for årsavslutning`  ),
          ]

          State.Actions.postDatoms( Datoms )
          },
        "AccountingYearPage/closeAccountingYear": async sourceDocument => {

          let transactionDatoms = [
            newDatom( "newEntity_tax" , 'entity/entityType', 7948 ),
            newDatom( "newEntity_tax" , 'entity/company', State.S.selectedCompany ), 
            newDatom( "newEntity_tax" , 'transaction/accountingYear', State.DB.get( sourceDocument, 10300 ) ), 
            newDatom( "newEntity_tax" , "transaction/transactionType", 9286 ), 
            newDatom( "newEntity_tax" , "entity/sourceDocument", sourceDocument ), 
            newDatom( "newEntity_tax" , "transaction/originNode", State.DB.get(State.S.selectedCompany, 10052)(10302)[0] ),
            newDatom( "newEntity_tax" , "transaction/destinationNode", State.DB.get(State.S.selectedCompany, 10052)(8746)[0] ),
            newDatom( "newEntity_tax" , "event/date", State.DB.get( State.DB.get( sourceDocument, 10300 ), "accountingYear/lastDate")), 
            newDatom( "newEntity_tax" , "eventAttribute/1139", "Årets skattekostnad"  ),
            newDatom( "newEntity_annualResult" , 'entity/entityType', 7948 ),
            newDatom( "newEntity_annualResult" , 'entity/company', State.S.selectedCompany ), 
            newDatom( "newEntity_annualResult" , 'transaction/accountingYear', State.DB.get( sourceDocument, 10300 ) ), 
            newDatom( "newEntity_annualResult" , "transaction/transactionType", 9384 ), 
            newDatom( "newEntity_annualResult" , "entity/sourceDocument", sourceDocument ), 
            newDatom( "newEntity_annualResult" , "transaction/originNode", State.DB.get(State.S.selectedCompany, 10052)(8741)[0] ),
            newDatom( "newEntity_annualResult" , "transaction/destinationNode", State.DB.get(State.S.selectedCompany, 10052)(8784)[0] ),
            newDatom( "newEntity_annualResult" , "event/date", State.DB.get( State.DB.get( sourceDocument, 10300 ), "accountingYear/lastDate")  ), 
            newDatom( "newEntity_annualResult" , "eventAttribute/1139", "Årets resultat"  ),

          ]

          

          State.Actions.postDatoms( transactionDatoms )
          },
    })
  }

let accountingYearLabel = (State, entity, onClick ) => d([ d(State.DB.get(entity,6), {class: "entityLabel", style: `background-color: ${ entity === State.S["AccountingYearPage/selectedAccountingYear"] ? State.DB.get( State.DB.get( entity, "entity/entityType"), "entityType/color") : "gray" } ;`}, "click", onClick) ], {style:"display: inline-flex;"})

let accountingYearsView = State => isDefined(State.S["AccountingYearPage/selectedAccountingYear"]) ? singleAccountingYearView( State ) : allAccountingYearsView( State )

let singleAccountingYearView = State => d([
    submitButton( " <---- Tilbake ", () => isDefined(State.S["AccountingYearPage/selectedReportType"]) ? State.Actions["AccountingYearPage/selectReportType"]( undefined ) : State.Actions["AccountingYearPage/selectAccountingYear"]( undefined )  ),
    State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], "accountingYear/accountingYearType") === 9892
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


let closedAccountingYearView = State => d([
  d([
    h3("Status på året"),
    lockedValueView(State, State.S["AccountingYearPage/selectedAccountingYear"], 8257),
    br(),
    State.DB.get(State.S.selectedCompany, 10061).some( accountingYear => State.DB.get(accountingYear, "accountingYear/prevAccountingYear") === State.S["AccountingYearPage/selectedAccountingYear"] )
      ? d("Alle senere år må slettes for å gjøre endirnger")
      : submitButton("Tilbakestill årsavslutning", () => State.Actions.postDatoms( getEntitiesRetractionDatoms( State.DB, State.DB.get(State.S["AccountingYearPage/selectedAccountingYear"], 9715).filter( transaction => [9286, 9384, 9716, 9723].includes( State.DB.get(transaction, "transaction/transactionType") )  ) ).concat(newDatom(State.S["AccountingYearPage/selectedAccountingYear"], "accountingYear/accountingYearType", 8254))   )  )
  ], {class: "feedContainer"}),
  d([
    h3("Resultatregnskap"),
    br(),
    d([8563, 8564, 8565, 8572, 8578, 8579, 8580, 8581, 8582, 8585].map( reportField => reportFieldView( State, reportField, State.DB.get( State.S["AccountingYearPage/selectedAccountingYear"], 9814 ) ) ) ),
    ], {class: "feedContainer"}),
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

let openAccountingYearView = State => {

  let currentAnnualResultSourceDocument = State.DB.get( State.S.selectedCompany, 10073 ).find( sourceDocument => State.DB.get(sourceDocument,"sourceDocument/sourceDocumentType") === 10309 && State.DB.get(sourceDocument,"entity/accountingYear") === State.S["AccountingYearPage/selectedAccountingYear"]  )


return d([
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
    h3("Årets resultat"),
    h3("Resultatdisponering"),
    isDefined(currentAnnualResultSourceDocument ) 
      ? d([
        d( State.DB.get( State.DB.get( currentAnnualResultSourceDocument, "sourceDocument/sourceDocumentType"), 7942 )
          .map( attribute => entityAttributeView(State, currentAnnualResultSourceDocument, attribute, State.DB.get(currentAnnualResultSourceDocument, 10401) ) ) 
        ),
        d( State.DB.get( State.DB.get( currentAnnualResultSourceDocument, "sourceDocument/sourceDocumentType"), 10433 )
          .map( attribute => entityAttributeView(State, currentAnnualResultSourceDocument, attribute, true ) ) 
        ),
      ])  
      : d(""),
    br(),
    State.DB.get(currentAnnualResultSourceDocument, 10401)
      ? d([
        sourceDocumentLabel( State, currentAnnualResultSourceDocument ),
        d( State.DB.get(currentAnnualResultSourceDocument, 10402).map( transaction => transactionFlowView( State, transaction) ) ),
        submitButton("Tilbakestill bokføring", () => State.Actions.retractEntities( State.DB.get(currentAnnualResultSourceDocument, 10402) )  )
        
      ])
      : d([
        submitButton("Lag bilag for årsresultat", () => State.Actions["AccountingYearPage/createAnnualResultSourceDocument"]( State.S["AccountingYearPage/selectedAccountingYear"] )  ),
        submitButton("Bokfør skattekostnad og årsresultat, og lås året", () => State.Actions["AccountingYearPage/closeAccountingYear"]( currentAnnualResultSourceDocument ) )
      ]) 
  
    
    ], {class: "feedContainer"})
  ]) 
} 