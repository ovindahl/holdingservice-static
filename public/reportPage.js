
const ReportPage = {
    entity: 10464,
    onLoad: State => returnObj({selectedEntity: undefined}),
    Actions: State => returnObj({
        "ReportPage/selectAccountingYear": accountingYear => updateState( State, {S: {selectedPage: 10464, selectedAccountingYear: accountingYear}}),
    })
  }



let reportView = State => {


  let accountingYearSourceDocument = State.DB.get( State.S.selectedCompany ,10073).find( sourceDocument => State.DB.get(sourceDocument, "sourceDocument/sourceDocumentType") === 10309 && State.DB.get(sourceDocument, 7512) === State.S.selectedAccountingYear )

  return d([
    h3("Rapporter"),
    d([
    entityLabelWithPopup( State, 7976 ),
    d( State.DB.getAll(7976).map( reportType => entityLabelWithPopup(State, reportType, () => State.Actions.selectEntity(  reportType, ReportPage.entity )) ), {display: "flex"} )
    ], {class: "feedContainer", style: gridColumnsStyle("1fr 3fr")}),
    br(),
    isNumber( State.S.selectedEntity ) && isNumber( accountingYearSourceDocument )
        ? singleReportView( State, State.S.selectedEntity, accountingYearSourceDocument )
        : d("Velg rapport.")
])
} 


let singleReportView = ( State, reportType, yearEndEvent ) => d([
    entityLabelWithPopup( State, reportType ),
    d(  State.DB.getAll( 8359 )
      .filter( reportField => State.DB.get(reportField, 8363) === reportType )
      .sort( (a,b) => a-b )
      .map( reportField => reportFieldView( State, reportField, yearEndEvent ) )
    )
    ])

let reportFieldView = ( State, reportField, yearEndEvent ) => d([
entityLabelWithPopup( State, reportField ),
State.DB.get(reportField, "attribute/valueType") === 31
  ? d( formatNumber(  getReportFieldValue( State.DB, State.S.selectedCompany, reportField, yearEndEvent ) ), {style: `text-align: right;`}  )
  : State.DB.get(reportField, "attribute/valueType") === 30
    ? d( getReportFieldValue( State.DB, State.S.selectedCompany, reportField, yearEndEvent ), {style: ""}  )
    : State.DB.get(reportField, "attribute/valueType") === 36
      ? input( mergerino( {type: "checkbox", disabled: "disabled"}, getReportFieldValue( State.DB, State.S.selectedCompany, reportField, yearEndEvent ) === true ? {checked: "checked"} : {} ))
      : d( JSON.stringify( getReportFieldValue( State.DB, State.S.selectedCompany, reportField, yearEndEvent ) )  )

], {style: gridColumnsStyle("3fr 1fr")})