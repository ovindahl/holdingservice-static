
const ReportPage = {
    entity: 10464,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({
        "ReportPage/selectReportType": entity => updateState( State, {S: {selectedPage: 10464, selectedEntity: entity}}),
        "ReportPage/selectAccountingYear": accountingYear => updateState( State, {S: {selectedPage: 10464, selectedAccountingYear: accountingYear}}),
    })
  }



let reportView = State => {


  let accountingYearSourceDocument = State.DB.get( State.S.selectedCompany ,10073).find( sourceDocument => State.DB.get(sourceDocument, "sourceDocument/sourceDocumentType") === 10309 && State.DB.get(sourceDocument, "entity/accountingYear") === State.S.selectedAccountingYear )

  return d([
    h3("Rapporter"),
    d([
        entityLabelWithPopup( State, 10309 ),
        d( State.DB.get( State.S.selectedCompany, 10061 )
          .map( accountingYear => entityLabelWithPopup(State, accountingYear, () => State.Actions["ReportPage/selectAccountingYear"]( accountingYear  )) ), {display: "flex"} )
      ], {class: "feedContainer", style: gridColumnsStyle("1fr 3fr")}),
    d([
    entityLabelWithPopup( State, 7976 ),
    d( State.DB.getAll(7976).map( reportType => entityLabelWithPopup(State, reportType, () => State.Actions["ReportPage/selectReportType"]( reportType )) ), {display: "flex"} )
    ], {class: "feedContainer", style: gridColumnsStyle("1fr 3fr")}),
    br(),
    isNumber( State.S.selectedEntity ) && isNumber( accountingYearSourceDocument )
        ? singleReportView( State, State.S.selectedEntity, accountingYearSourceDocument )
        : d("Velg rapport og regnskapsår")
])
} 


let singleReportView = ( State, reportType, sourceDocument ) => d([
    entityLabelWithPopup( State, reportType ),
    d(  State.DB.getAll( 8359 )
      .filter( reportField => State.DB.get(reportField, 8363) === reportType )
      .sort( (a,b) => a-b )
      .map( reportField => reportFieldView( State, reportField, sourceDocument ) )
    )
    ])

let reportFieldView = ( State, reportField, sourceDocument ) => d([
entityLabelWithPopup( State, reportField ),
d( new Function(["storedValue"], State.DB.get(State.DB.get(reportField, "attribute/valueType"), "valueType/formatFunction") )( getReportFieldValue( State.DB, State.S.selectedCompany, reportField, sourceDocument ) ), {style: State.DB.get(reportField, "attribute/valueType") === 31 ? `text-align: right;` : ""}  )
], {style: gridColumnsStyle("3fr 1fr")})