const AccountingYearPage = {
    entity: 7509,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({})
  }


let accountingYearsView = State => isDefined(State.S.selectedEntity) ? singleEventView( State ) : allAccountingYearsView( State )


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