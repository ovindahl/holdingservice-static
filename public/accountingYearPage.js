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

          let Datoms = [
            newDatom( "newDatom_annualResult", "entity/entityType", 10062  ),
            newDatom( "newDatom_annualResult", "entity/company", State.S.selectedCompany  ),
            newDatom( "newDatom_annualResult", "sourceDocument/sourceDocumentType", 10309 ),
            newDatom( "newDatom_annualResult", "entity/label", `Bilag for årsavslutning`  ),
            newDatom( "newDatom_annualResult", 8750, false  ),
            newDatom( "newDatom_annualResult", 8751, false  ),
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

let singleAccountingYearView = State => {

  let currentAnnualResultSourceDocument = State.S["AccountingYearPage/selectedAccountingYear"]


return d([
  submitButton( " <---- Tilbake ", () => isDefined(State.S["AccountingYearPage/selectedReportType"]) ? State.Actions["AccountingYearPage/selectReportType"]( undefined ) : State.Actions["AccountingYearPage/selectAccountingYear"]( undefined )  ),
  d([
    h3("Årets resultat"),
    d([
      d( State.DB.get( State.DB.get( currentAnnualResultSourceDocument, "sourceDocument/sourceDocumentType"), 7942 )
        .map( attribute => entityAttributeView(State, currentAnnualResultSourceDocument, attribute, State.DB.get(currentAnnualResultSourceDocument, 10401) ) ) 
      ),
      d( State.DB.get( State.DB.get( currentAnnualResultSourceDocument, "sourceDocument/sourceDocumentType"), 10433 )
        .map( attribute => entityAttributeView(State, currentAnnualResultSourceDocument, attribute, true ) ) 
      ),
    ]),
    br(),
    State.DB.get(currentAnnualResultSourceDocument, 10401)
      ? d([
        d( State.DB.get(currentAnnualResultSourceDocument, 10402).map( transaction => transactionFlowView( State, transaction) ) ),
        submitButton("Tilbakestill bokføring", () => State.Actions.retractEntities( State.DB.get(currentAnnualResultSourceDocument, 10402) )  )
        
      ])
      : d([
        submitButton("Bokfør skattekostnad og årsresultat, og lås året", () => State.Actions["AccountingYearPage/closeAccountingYear"]( currentAnnualResultSourceDocument ) )
      ]) 
  
    
    ], {class: "feedContainer"})
  ]) 
} 


let allAccountingYearsView = State => d([
  h3("Alle årsavslutninger"),
  d([
      entityLabelWithPopup( State, 10300 ),
      entityLabelWithPopup( State, 10401 ),
  ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr")}),
  d( State.DB.get( State.S.selectedCompany, 10073 )
      .filter( sourceDocument => [10309].includes( State.DB.get(sourceDocument, 10070 ) )   )
      .map( sourceDocument => d([
      entityLabelWithPopup( State,State.DB.get(sourceDocument, 10300 ), () => State.Actions["AccountingYearPage/selectAccountingYear"]( sourceDocument ) ),
      d(State.DB.get(sourceDocument, 10401) ? "✅" : "🚧"),
      submitButton( "Vis", () => State.Actions["AccountingYearPage/selectAccountingYear"]( sourceDocument ))
  ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr")}) )),
br(),
submitButton( "Ny årsavslutning", () => State.Actions["AccountingYearPage/createAnnualResultSourceDocument"]( ))
]) 























