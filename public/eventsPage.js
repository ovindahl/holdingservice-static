
const EventPage = {
    entity: 11974,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({})
  }

  
let eventPageView = State => isDefined( State.S.selectedEntity) 
? singleEventView( State )
: allEventsView( State )

let singleEventView = State => d([
    submitButton( " <---- Tilbake ", () => State.Actions.selectEntity(  undefined )  ),
    br(),
    d([
        entityLabelWithPopup( State, State.S.selectedEntity ),
        entityAttributeView(State, State.S.selectedEntity, 10070, true ),
        entityAttributeView(State, State.S.selectedEntity, 11477, State.DB.get(State.S.selectedEntity, 10401) ),
        entityAttributeView(State, State.S.selectedEntity, 1757, State.DB.get(State.S.selectedEntity, 10401) ),
        br(),
        d( State.DB.get( State.DB.get( State.S.selectedEntity, 10070 ), 7942).map( attribute => entityAttributeView(State, State.S.selectedEntity, attribute, State.DB.get(State.S.selectedEntity, 10401) ) ) ),
        br(),
        d( State.DB.get( State.DB.get( State.S.selectedEntity, 10070 ), 10433).map( calculatedField => entityAttributeView(State, State.S.selectedEntity, calculatedField, true ) ) ),
    ], {class: "feedContainer"}),
    br(),
    d( State.DB.get(State.S.selectedEntity, 10402).map( transaction => transactionFlowView( State, transaction) ) ),
    eventActionsView( State, State.S.selectedEntity ),
])


let eventRowView = (State, event) => d([
    d( moment( State.DB.get( event, 1757 ) ).format("DD.MM.YYYY") ),
    entityLabelWithPopup( State, event ),
    isDefined( State.DB.get(event, 1083) ) ? lockedSingleValueView( State, event, 1083 ) : d(" - "),
    d([ isDefined( State.DB.get(event, 11477) ) ? entityLabelWithPopup(State, State.DB.get(event, 11477) ) : d("[tom]", {class: "entityLabel", style: "background-color:#7b7b7b70;text-align: center;"})], {style: "padding-left: 2em;"} ),
], {style: gridColumnsStyle("1fr 3fr 1fr 3fr")})

let allEventsView = State => d([
    h3("Alle hendelser"),
    d([
    entityLabelWithPopup( State, 7403 ),
    d( State.DB.get(State.S.selectedCompany, 10061).map( e => entityLabelWithPopup(State, e, () => State.Actions["TransactionsPage/selectAccountingYear"](e)) ), {display: "flex"} )
    ], {class: "feedContainer", style: gridColumnsStyle("1fr 3fr")}),
    br(),
    d([
    d([
        d( "Hendelsesdato" ),
        d( "Hendelse" ),
        d( "Beløp", {style: `text-align: right;`} ),
        d( "Bilagsdokument", {style: "padding-left: 2em;"} ),
    ], {style: gridColumnsStyle("1fr 3fr 1fr 3fr")}),
    ], {class: "feedContainer"}),
    d([
    State.DB.get( State.S.selectedCompany, 11976 )( State.S.selectedAccountingYear ).length > 0 
        ? d( State.DB.get( State.S.selectedCompany, 11976 )( State.S.selectedAccountingYear )
        .filter( event => State.S.selectedPage === 11974 ? true : State.DB.get( State.DB.get(event, 10070 ), 7930) === State.S.selectedPage   )
        .map( event => eventRowView(State, event)  ) )
        : d("Ingen hendelser i valgt regnskapsår"),
    ], {class: "feedContainer"}),
    br(),
    d([
        h3("Handlinger"),
        d( State.DB.get( State.S.selectedPage, 11956).map( action =>  eventActionButton( State, State.S.selectedCompany, action ) )  )
    ], {class: "feedContainer"}) 

])
