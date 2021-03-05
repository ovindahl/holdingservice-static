
//--- Transaction views

const TransactionsPage = {
    entity: 7882,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({})
  }



let transactionsView = State => newAllTransasctionsVew( State )

let newAllTransasctionsVew = State => d([
  h3("Bokførte transaksjoner"),
  br(),  
  d([
    d([
        d( "#" ),
        d( "Hendelse" ),
        d( "Dato" ),
        d( "Kontoer", {style: `text-align: center;`} ),
        d( "Beløp", {style: `text-align: right;`} ),
    ], {style: gridColumnsStyle("1fr 4fr 2fr 4fr 2fr")}),
  ], {class: "feedContainer"}),
  d( State.DB.get( State.S.selectedCompany, 12351)().map( (Transaction, index) => transactionRowView( Transaction, index ) ), {class: "feedContainer"} ) 
]) 


let transactionRowView = (Transaction, index) => d([
  d( String( index + 1 ) ),
  entityLabelWithPopup(State, Transaction.event  ),
  d( moment( State.DB.get( Transaction.event, 1757 ) ).format("DD.MM.YYYY") , {style: `text-align: right;`}),
  d([
    isDefined( Transaction.originNode ) ? entityLabelWithPopup(State, Transaction.originNode ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}),
    d(" --> "),
    isDefined( Transaction.destinationNode ) ? entityLabelWithPopup(State, Transaction.destinationNode ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"}) ,
  ], {style: gridColumnsStyle("3fr 1fr 3fr") + "padding-left: 3em;"} ),
  d( `NOK ${formatNumber( Transaction.amount, 0 )}`, {style: "text-align: right;"} ),
], {style: gridColumnsStyle("1fr 4fr 2fr 4fr 2fr")})