
const ReportPage = {
    initial: DB => returnObject({ 
      "ReportPage/selectedReportType": undefined
    }),
    Actions: State => returnObject({
        "ReportPage/selectReportType": entity => updateState( State, {S: {selectedPage: 10464, "ReportPage/selectedReportType": entity}}),
        "ReportPage/selectAccountingYear": entity => updateState( State, {S: {selectedPage: 10464, "ReportPage/selectedAccountingYear": entity}}),
    })
  }



let reportView = State => d([
    h3("Rapporter"),
    d([
        entityLabelWithPopup( State, 7403 ),
        d( State.DB.get(State.S.selectedCompany, 10061).map( accountingYear => entityLabelWithPopup(State, accountingYear, () => State.Actions["ReportPage/selectAccountingYear"]( accountingYear )) ), {display: "flex"} )
      ], {class: "feedContainer", style: gridColumnsStyle("1fr 3fr")}),
    d([
    entityLabelWithPopup( State, 7976 ),
    d( State.DB.getAll(7976).map( reportType => entityLabelWithPopup(State, reportType, () => State.Actions["ReportPage/selectReportType"]( reportType )) ), {display: "flex"} )
    ], {class: "feedContainer", style: gridColumnsStyle("1fr 3fr")}),
    br(),
    isNumber( State.S["ReportPage/selectedReportType"] ) && isNumber( State.S["ReportPage/selectedAccountingYear"] )
        ? singleReportView( State, State.S["ReportPage/selectedReportType"], State.S["ReportPage/selectedAccountingYear"] )
        : d("Velg rapport og regnskapsår")
])


let singleReportView = ( State, reportType, accountingYear ) => d([
    entityLabelWithPopup( State, reportType ),
    d(  State.DB.getAll( 8359 )
      .filter( reportField => State.DB.get(reportField, 8363) === reportType )
      .sort( (a,b) => a-b )
      .map( reportField => reportFieldView( State, reportField, State.DB.get( accountingYear, 9814 ) ) ) )
    ])

let reportFieldView = ( State, reportField, transactionIndex ) => d([
entityLabelWithPopup( State, reportField ),
d( new Function(["storedValue"], State.DB.get(State.DB.get(reportField, "attribute/valueType"), "valueType/formatFunction") )( getReportFieldValue( State.DB, State.S.selectedCompany, reportField, transactionIndex )  ), {style: State.DB.get(reportField, "attribute/valueType") === 31 ? `text-align: right;` : ""}  )
], {style: gridColumnsStyle("3fr 1fr")})