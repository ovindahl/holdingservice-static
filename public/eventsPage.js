
  
let eventPageView = State => isDefined( State.S.selectedEntity ) ? singleEventView( State ) : allEventsView( State )

let createEventButton = State => d([
  d( "Ny hendelse 📅", {style: "padding:1em; margin-left:2em; background-color: #79554852;"}),
    d([
      br(),
      d("Velg hendelsestype:"),
      d(State.DB.getAll( 10063   ).map( entity =>State.DB.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).map( category => d([
        h3(category),
        d(State.DB.getAll(10063).filter( e => State.DB.get(e, "entity/category") === category ).sort( (a,b) => a-b ).map( eventType => entityLabelWithPopup( State, eventType, () => State.Actions.createEvent( eventType ) ) ) ),
      ])  ) ),
    ], {class: "createButtonPopup_right", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
    
], {class: "createButtonPopupContainer_right", style:"display: inline-flex;"})

let createEventFromEventButton = State => d([
  d( "Ny hendelse fra denne 📅", {style: "padding:1em; margin-left:2em; background-color: #03a9f445;"}),
    d([
      d("Kopierer dato og beløp fra:"),
      entityLabelWithPopup( State, State.S.selectedEntity ),
      br(),
      d("Velg hendelsestype:"),
      d(State.DB.getAll( 10063   ).map( entity =>State.DB.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).map( category => d([
        h3(category),
        d(State.DB.getAll(10063).filter( e => State.DB.get(e, "entity/category") === category ).sort( (a,b) => a-b ).map( eventType => entityLabelWithPopup( State, eventType, () => State.Actions.createEventFromEvent( eventType, State.DB.get( State.S.selectedEntity, 19 ) === 10062 ? State.S.selectedEntity : undefined ) ) ) ),
      ])  ) ),
    ], {class: "createButtonPopup_right", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
    
], {class: "createButtonPopupContainer_right", style:"display: inline-flex;"})


let prevNextEventView = State => {
  
    let prev = State.DB.get( State.S.selectedEntity, 12100 )
    let next = State.DB.get( State.S.selectedEntity, 12101 )
  
    return d([
      d([
        d([
          isDefined( prev ) ? submitButton("<", () => State.Actions.selectEntity(  prev ) ) : d(""),
          isDefined( next ) ? submitButton(">", () => State.Actions.selectEntity(  next ) ) : d(""),
        ], {style: gridColumnsStyle("3fr 1fr")})
      ], {style: gridColumnsStyle("3fr 1fr")}),
    ])
}

let debuggingPanel = State => d([
  entityAttributeView(State, State.S.selectedEntity, 13278, true ),
  entityAttributeView(State, State.S.selectedEntity, 13279, true ),
  entityAttributeView(State, State.S.selectedEntity, 13280, true ),
  entityAttributeView(State, State.S.selectedEntity, 13281, true ),
  entityAttributeView(State, State.S.selectedEntity, 11975, true ),
  entityAttributeView(State, State.S.selectedEntity, 13184, true )
], {class: "feedContainer"})

let fixedEventAttributes = State => d([
  entityAttributeView(State, State.S.selectedEntity, 11975, true ),
  State.DB.get(State.S.selectedEntity, 13280)
      ? entityAttributeView(State, State.S.selectedEntity, 13184, true )
      : d([
          entityAttributeView(State, State.S.selectedEntity, 13184, true ),
          State.DB.get( State.S.selectedEntity, 13280 ) === false
            ? d( State.DB.get(State.DB.get(State.S.selectedEntity, 10070), 12547)
                .map( criterium => d([
                  criteriumIsValid(State, State.S.selectedEntity, criterium) ? d("✔️") : d("❌"),
                  d(State.DB.get(criterium, 11568))
                ], {style: gridColumnsStyle("1fr 3fr") })  ), {style: "padding-left: 3em;" } )
            : d("")
      ]),
      br(),
      entityAttributeView(State, State.S.selectedEntity, 12986, true ),
      entityAttributeView(State, State.S.selectedEntity, 11477, State.DB.get(State.S.selectedEntity, 13281) ),
      entityAttributeView(State, State.S.selectedEntity, 1757, State.DB.get(State.S.selectedEntity, 13281) ),
      entityAttributeView(State, State.S.selectedEntity, 6, State.DB.get(State.S.selectedEntity, 13281) ),
      entityAttributeView(State, State.S.selectedEntity, 1139, State.DB.get(State.S.selectedEntity, 13281) ),
], {class: "feedContainer"})

let eventTypeView = State => d([
  entityAttributeView(State, State.S.selectedEntity, 10070, true ),
  d( State.DB.get( State.DB.get( State.S.selectedEntity, 10070 ), 7942).map( attribute => entityAttributeView(State, State.S.selectedEntity, attribute, State.DB.get(State.S.selectedEntity, 13281) ) ) ),
  br(),
  d( State.DB.get( State.DB.get( State.S.selectedEntity, 10070 ), 10433).map( calculatedField => State.DB.get( calculatedField, 12805 ) === true
      ? temporalEntityAttributeView( State, State.S.selectedEntity, calculatedField,  State.DB.get( State.S.selectedCompany, 12385 ) )
      : entityAttributeView(State, State.S.selectedEntity, calculatedField, true ) 
      ) ),
], {class: "feedContainer"})

let singleEventView = State => d([
    fixedEventAttributes( State ),
    br(),
    eventTypeView( State ),
    br(),
    d([
      h3("Bokføring"),
      State.DB.get(State.S.selectedEntity, 13280 ) === true 
      ? State.DB.get(State.S.selectedEntity, State.DB.get( State.DB.get(State.S.selectedEntity, 10070), 12355)).length > 0
        ? calculatedTransactionView( State )
        : d("Bokføres ikke.")
      : d("Ikke bokført."),
    ], {class: "feedContainer"}),
    br(),
    d([
      h3("Handlinger"),
      createEventFromEventButton( State ),
      d( State.DB.get( State.DB.get(State.S.selectedEntity, 10070 )  , 11583).map( action =>  eventActionButton( State, State.S.selectedEntity, action ) )  )
    ], {class: "feedContainer"}),
])

let calculatedTransactionView = State => d( State.DB.get(State.S.selectedEntity, State.DB.get( State.DB.get(State.S.selectedEntity, 10070), 12355)).map( transaction => d([
  d([
    d([
      entityLabelWithPopup(State, transaction.originNode ),
    ]),
    d([
      d( formatNumber( State.DB.get( State.S.selectedCompany, 12392 )([transaction.originNode], State.DB.get( transaction.event, 11975 ) - 1) ), {class: "redlineText", style: `text-align: right;`} ),
      d( formatNumber( State.DB.get( State.S.selectedCompany, 12392 )([transaction.originNode], State.DB.get( transaction.event, 11975 ) ) ), {style: `text-align: right;`} ),
    ])
  ],{class: "feedContainer", style: gridColumnsStyle("1fr 1fr")}),
  d([
    d(""),
    d([
      d( `NOK ${formatNumber( transaction.amount, 2 )}` ),
      isNumber( transaction.count) ? d( `${formatNumber( transaction.count, 0 )} stk`) : d(""),
      d(" --------------> "),
      d( moment( State.DB.get( transaction.event, 1757) ).format("DD.MM.YYYY") ),
    ]),
    d(""),
  ], {style: gridColumnsStyle("2fr 4fr 2fr")}),
  d([
    d([
      entityLabelWithPopup(State, transaction.destinationNode ),
    ]),
    d([
      d( formatNumber( State.DB.get( State.S.selectedCompany, 12392 )([transaction.destinationNode], State.DB.get( transaction.event, 11975 ) - 1) ), {class: "redlineText", style: `text-align: right;`} ),
      d( formatNumber( State.DB.get( State.S.selectedCompany, 12392 )([transaction.destinationNode], State.DB.get( transaction.event, 11975 ) ) ), {style: `text-align: right;`} ),
    ])
  ],{class: "feedContainer", style: gridColumnsStyle("1fr 1fr")}),
], {style: gridColumnsStyle("1fr 1fr 1fr")}) ) )

let eventRowView = (State, event) => d([
    d( `${State.DB.get(event, 11975 )}` ),
    d( moment( State.DB.get( event, 1757 ) ).format("DD.MM.YYYY") ),
    entityLabel( State, event, () => State.Actions.selectEntity( event ) ),
    isDefined( State.DB.get(event, 1083) ) ? valueView( State, event, 1083, true ) : d(" - ", {style: `text-align: right;`} ),
    d([ valueView( State, event, 13184, true) ], {style: `text-align: right;`})
], {style: gridColumnsStyle("1fr 1fr 3fr 1fr 1fr")})

let allEventsView = State => d([
    h3( getEntityLabel( State.DB, State.S.selectedPage) ),
    d([
      d("Filter på hendelsestype:"),
      d( State.DB.getAll(10063).map( eventType => State.S.selectedFilters.includes( eventType )
          ? span(  State.DB.get(eventType, 6), "", {style: "padding: .25rem;margin: .25rem;background-color: #289df1b3;" }, "click", () => State.Actions.removeFilter( eventType )  ) 
          : entityLabelWithPopup( State, eventType, () => State.Actions.addFilter( eventType ) )  ).concat( span( "X", "", {}, "click", () => State.Actions.removeFilters( undefined ) ) )
        )
    ], {class: "feedContainer"}),
    br(),
    createEventButton( State ),
    br(),
    d([
      d([
          d( "#" ),
          d( "Hendelsesdato" ),
          d( "Hendelse" ),
          d( "Beløp", {style: `text-align: right;`} ),
          d( "Status", {style: `text-align: right;`} ),
      ], {style: gridColumnsStyle("1fr 1fr 3fr 1fr 1fr")}),
    ], {class: "feedContainer"}),
    d([
    State.DB.get( State.S.selectedCompany, 10073  ).filter( event => Database.get(event, 12986) === State.S.selectedAccountingYear  ).length > 0 
        ? d( State.DB.get( State.S.selectedCompany, 10073  ).filter( event => Database.get(event, 12986) === State.S.selectedAccountingYear  )
              .filter( event => State.S.selectedFilters.length > 0 ? State.S.selectedFilters.includes( State.DB.get(event, 10070 ) )  : true )
              .map( event => eventRowView(State, event)  ) 
          )
        : d("Ingen hendelser i valgt regnskapsår"),
    ], {class: "feedContainer"}),
    br(),
])


let newTransaction = (event, originNode, destinationNode, amount, count) => returnObject({event, originNode, destinationNode, amount, count}) //NB: Brukes av kalkulerte felter