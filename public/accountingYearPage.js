const AccountingYearPage = {
    entity: 7509,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({})
  }


let accountingYearsView = State => isDefined(State.S.selectedEntity) ? singleAccountingYearView( State ) : allAccountingYearsView( State )

let singleAccountingYearView = State => {

  let currentAnnualResultSourceDocument = State.S.selectedEntity

return d([
  submitButton( " <---- Tilbake ", () => State.Actions.selectEntity( undefined, AccountingYearPage.entity )  ),
  d([
    h3("Årsavslutning"),
    d([
      d( State.DB.get( State.DB.get( currentAnnualResultSourceDocument, "sourceDocument/sourceDocumentType"), 7942 )
        .map( attribute => entityAttributeView(State, currentAnnualResultSourceDocument, attribute, State.DB.get(currentAnnualResultSourceDocument, 10401) ) ) 
      ),
      br(),
      h3("Beregnet resultat"),
      d( [10618, 10686, 10687, 10689].map( balanceObject => d([
          nodeLabel(State, balanceObject),
          calculatedValueView(State, balanceObject, 10045, State.DB.get(currentAnnualResultSourceDocument, 10499) )
      ], {style: gridColumnsStyle("repeat(4, 1fr)") + "padding-left: 1em;"}))),
      br(),
      d( State.DB.get( State.DB.get( currentAnnualResultSourceDocument, "sourceDocument/sourceDocumentType"), 10433 ).map( attribute => entityAttributeView(State, currentAnnualResultSourceDocument, attribute, true ) ) ),
    ]),
    br(),
    h3("Bokføring"),
    d([
      d("Tilknyttede transaksjoner:"),
      State.DB.get(State.S.selectedEntity, 10401)
          ? d( State.DB.get(State.S.selectedEntity, 10402).map( transaction => transactionFlowView( State, transaction) ) )
          : d("Ingen bokførte transaksjoner")
  ], {class: "feedContainer"}),
    eventActionsView( State, State.S.selectedEntity ),
    ], {class: "feedContainer"})
  ]) 
} 


let allAccountingYearsView = State => d([
  h3("Alle årsavslutninger"),
  d([
      entityLabelWithPopup( State, 7512 ),
      entityLabelWithPopup( State, 10401 ),
  ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr")}),
  d( State.DB.get( State.S.selectedCompany, 10073 )
      .filter( sourceDocument => [10309].includes( State.DB.get(sourceDocument, 10070 ) )   )
      .map( sourceDocument => d([
      entityLabelWithPopup( State,State.DB.get(sourceDocument, 7512 ), () => State.Actions.selectEntity( sourceDocument, AccountingYearPage.entity ) ),
      d(State.DB.get(sourceDocument, 10401) ? "✅" : "🚧"),
      submitButton( "Vis", () => State.Actions.selectEntity( sourceDocument, AccountingYearPage.entity ) )
  ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr")}) )),
  br(),
  eventActionButton( State, State.S.selectedCompany, 11582),
]) 