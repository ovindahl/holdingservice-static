//Action button


let actionButton = companyAction => d([
  d([
    d( `${ companyAction.label}`, {class: "entityLabel", style: `background-color:${companyAction.isActionable ? "yellow" : "gray" }`}, "click", companyAction.isActionable ? async e => ClientApp.update( await companyAction.execute() ) : e => console.log("Not actionable") ),
    //entityPopUp( companyAction.entity ),
  ], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"} )


//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------


// SVG
let svg = (width, height, innerhtml) => htmlElementObject("svg", {width, height}, innerhtml)
let rect = (attributesObject, onclick) => htmlElementObject( "rect", attributesObject, "", "click", onclick )
let circle = (attributesObject, onclick) => htmlElementObject( "circle", attributesObject, "", "click", onclick )


// CLIENT PAGE VIEWS

let companyEntityLabel = (State, companyEntity) => d([
    d( State.Company.get(companyEntity).label(), {class: "entityLabel", style: `background-color:${State.DB.get( State.Company.get(companyEntity, 6781), "entityType/color")};`}, "click", e => ClientApp.update( State, {S: {selectedEntity: State.Company.get(companyEntity, 6781), selectedCompanyEntity: companyEntity} } ) ),
  ], {style:"display: inline-flex;"})

let companyEntityLabelWithPopup = (State, companyEntity) => d([
  d([
    companyEntityLabel( State, companyEntity),
    companyEntityPopUp( State, companyEntity ),
  ], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"}) 


let companyEntityPopUp = (State, companyEntity) => d([

  d([
    entityLabel( State,  6 ),
    d(State.Company.get(companyEntity).label()),
  ], {class: "columns_1_1"}),
  d([
    d([span( `Selskapsentitet`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`})], {style:"display: inline-flex;"}),
    d(String(companyEntity)),
  ], {class: "columns_1_1"}),
  d([
    entityLabel( State,  47 ),
    entityLabel( State,  6778 ),
  ], {class: "columns_1_1"}),
  d([
    entityLabel( State,  6781 ),
    entityLabel( State,  State.Company.get( companyEntity, 6781 ) ),
  ], {class: "columns_1_1"}),
  d([
    d([span( `Opphavshendelse`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`})], {style:"display: inline-flex;"}),
    entityLabel( State,  State.Company.get( companyEntity ).event, e => ClientApp.update( State, {S: {selectedEntity: State.Company.get( companyEntity ).event } } ) ),
  ], {class: "columns_1_1"}),
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})


let clientPage = State => {

  let selectedEntityType = isDefined( State.DB.get( State.S.selectedEntity, "entity/entityType" ) ) 
    ? State.DB.get( State.S.selectedEntity, "entity/entityType" )
    : 5722


  let entityTypeViewController = {
    "47": selectedEntityType === 5692 
      ? processesTimelineView 
      : State.S.selectedEntity === 6778 
        ? companyEntitiesPageView
        : d( "error" ),
    "5722": companyView,
    "7403": accountingYearView,
    "5692": processView,
    "46": eventView,
    "6778": isDefined( State.S.selectedCompanyEntity ) ? companyEntityPageView : multipleCompanyEntitiesView
  }

  
  return d([
    d([d('<header><h1>Holdingservice Beta</h1></header>'),d([
      d([dropdown(State.Company.entity, State.DB.getAll( 5722 ).map( company => returnObject({value: company, label: State.DB.get(company, "entity/label")  })  ), e => {
        let company = Number( submitInputValue(e) )

        let constructedCompany = constructCompany( State.DB, company )

        let newState = {
          created: Date.now(),
          DB: State.DB,
          Company: constructedCompany,
          S: {selectedEntity: company }
        }

        ClientApp.update( newState )

      })]),
      submitButton("Bytt til admin", e => AdminApp.update(  ) )
    ], {style: "display:flex;"} ),], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
    getEntityNavBar( State ),
    d([
      d(""),
      entityTypeViewController[ selectedEntityType ]( State )
    ], {class: "pageContainer"})
    
  ])
}

let getEntityNavBar = State => {

  let selectedEntityType = isDefined( State.DB.get( State.S.selectedEntity, "entity/entityType" ) ) 
    ? State.DB.get( State.S.selectedEntity, "entity/entityType" )
    : 5722

  let entityTypeViewController = {
    "47": State => d([
          entityLabelWithPopup( State, State.S.entityType, e => ClientApp.update( State, {S: {selectedEntity: State.S.entityType }}) ),
        ]),
    "5722": () => d( "" ),
    "7403": accountingYear => entityLabelWithPopup( State.DB, accountingYear, e => ClientApp.update( State, {S: {selectedEntity: accountingYear }} ) ),
    "5692": process => d([
      entityLabelWithPopup( State, State.DB.get( process, "process/accountingYear"), e => ClientApp.update( State, {S: {selectedEntity: State.DB.get( process, "process/accountingYear") }}) ),
      entityLabelWithPopup( State, process, e => ClientApp.update( State, {S: {selectedEntity: process }}) ),
    ]),
    "46": event => d([
      entityLabelWithPopup( State, State.DB.get( State.DB.get(event, "event/process"), "process/accountingYear"), e => ClientApp.update( State, {S: {selectedEntity: State.DB.get( State.DB.get(event, "event/process"), "process/accountingYear") }}) ),
      entityLabelWithPopup( State, State.DB.get(event, "event/process"), e => ClientApp.update( State, {S: {selectedEntity: State.DB.get(event, "event/process")}}) ),
      entityLabelWithPopup( State, event, e => ClientApp.update( State, {S: {selectedEntity: event}})  ),
    ]),
    "6778": companyEntityType =>  d([
      entityLabelWithPopup( State, 6778, e => ClientApp.update( State, {S: {selectedEntity: 6778}}) ),
      entityLabelWithPopup( State,  companyEntityType , e => ClientApp.update( State, {S: {selectedEntity: companyEntityType, selectedCompanyEntity: undefined }}  ) ),
      isDefined(State.S.selectedCompanyEntity) ? companyEntityLabelWithPopup(State, State.S.selectedCompanyEntity) : d("")
    ])
  }

  


  return d([
    entityLabelWithPopup( State, State.Company.entity, e => ClientApp.update( State, {S: {selectedEntity: State.Company.entity }})  ),
    entityTypeViewController[ selectedEntityType ](State)
  ], {style: "display: flex;"})
} 

let accountingYearView = ( State,  accountingYear) => d([
  processesTimelineView(State ),
  br(),
  companyActionsView( State),
 /*  d([
    h3("Selskapets saldobalanse"),
    d(State.Company.get(1, 6212 ).map( Account => d([
      entityLabelWithPopup( State, Account.account),
      d( String(Account.amount) ),
    ], {class: "columns_1_1"}) ))
  ], {class: "feedContainer"}), */
  br(),
  balanceSheetView( State),
])

let companyEntitiesPageView = ( State) => d([
  h3("Alle selskapsdokumenter"),
  d(State.DB.getAll(6778).map( entityType => d([
    entityLabelWithPopup( State,  entityType, e => ClientApp.update( State, {S: {selectedEntity: entityType }} ) ),
    d(State.Company.getAll(entityType).map( companyEntity => companyEntityLabelWithPopup( State, companyEntity) ) ),
    br()
  ])))
], {class: "feedContainer"})

let multipleCompanyEntitiesView = ( State,  entityType) => {

  let eventTypeAttributes =State.DB.get( entityType,  6779)

  return d([
    d( eventTypeAttributes.map( attr => d([entityLabelWithPopup( State, attr)])   ), {style: `display:grid;grid-template-columns: repeat(${eventTypeAttributes.length}, 1fr);`} ),
    d(State.Company.getAll(entityType).map( companyEntity => d( eventTypeAttributes.map( attribute => companyValueView(Company, companyEntity, attribute)   ), {style: `display:grid;grid-template-columns: repeat(${eventTypeAttributes.length}, 1fr);`} ) ) )
  ],{class: "feedContainer"})
} 


let companyView = State => d([
  d([
    h3("Selskapets balanse"),
    d(`Siste registrerte hendelse: ${ moment(State.Company.getEvent(State.Company.events.slice(-1)[0]).get("event/date"), "x").format("YYYY-MM-DD")  }`),
    d([
      d([
        h3("Eiendeler"),
        d([
          entityLabelWithPopup( State, 6785, e => ClientApp.update( State, {S: {selectedEntity: 6785} } ) ),
          d( State.Company.getAll(6785).map( security => d([
            companyEntityLabelWithPopup( State, security),
          d( String(State.Company.get(security, 6108).reduce( (sum, t) => sum +State.Company.get(t, 1083), 0 ) ) , {style: `text-align: right;`})
          ], {class: "columns_1_1"})  ) )
        ], {style: gridColumnsStyle("1fr 3fr") }),
        d([
          entityLabelWithPopup( State, 7310, e => ClientApp.update( State, {S: {selectedEntity: 7310, selectedCompanyEntity: undefined}} )),
          d(State.Company.getAll(7310).map( bankAccount => d([
            companyEntityLabelWithPopup( State, bankAccount),
            d( String(State.Company.get(bankAccount, 6108).reduce( (sum, t) => sum +State.Company.get(t, 1083), 0 ) ) , {style: `text-align: right;`})
          ], {class: "columns_1_1"}) ) )
        ], {style: gridColumnsStyle("1fr 3fr") }),
      ], {style: `padding: 1em;`}),
      d([
        h3("Egenkapital og gjeld"),
        d([
          entityLabelWithPopup( State, 6790, e => ClientApp.update( State, {S: {selectedEntity: 6790, selectedCompanyEntity: undefined}}  )),
          d(State.Company.getAll(6790).map( actor => d([
            companyEntityLabelWithPopup( State, actor),
            d( String(State.Company.get(actor, 6108).reduce( (sum, t) => sum +State.Company.get(t, 1083), 0 ) ) , {style: `text-align: right;`}),
            //d("1000", {style: `text-align: right;`})
          ], {class: "columns_1_1"})  ) )
        ], {style: gridColumnsStyle("1fr 3fr") }),
        d([
          entityLabelWithPopup( State, 6791, e => ClientApp.update( State, {S: {selectedEntity: 6791, selectedCompanyEntity: undefined}}  )),
          d(State.Company.getAll(6791).map( loan => d([
            companyEntityLabelWithPopup( State, loan),
            d( String(State.Company.get(loan, 6108).reduce( (sum, t) => sum +State.Company.get(t, 1083), 0 ) ) , {style: `text-align: right;`}),
            //d("1000", {style: `text-align: right;`})
          ], {class: "columns_1_1"})  ) )
        ], {style: gridColumnsStyle("1fr 3fr") }),
      ], {style: `padding: 1em;`}),

    ], {class: "columns_1_1"})
    
  ], {class: "feedContainer"}),
  br(),
  d([
    h3("Registrerte regnskapsår"),
    d( [7407, 7406].map( accountingYear => {

      let accountingYearProcesses =State.Company.processes
      .filter( p =>State.Company.getProcess(p).get("process/accountingYear") === accountingYear )

      return d([
        entityLabelWithPopup( State, accountingYear, e => ClientApp.update(  {S: {selectedEntity: accountingYear, selectedCompanyEntity: undefined}}  ) ),
        d([
          d([
            entityLabelWithPopup( State, 5692, e => ClientApp.update({S: {selectedEntity: 5692, selectedCompanyEntity: undefined}}   ) ),
            accountingYearProcesses.length > 0 
            ? d([
              d( accountingYearProcesses.slice(0, 5)
                  .map( process => entityLabelWithPopup( State,  process, e => ClientApp.update( State, {S: {selectedEntity: process, selectedCompanyEntity: undefined}}  ) ))),
              d( accountingYearProcesses.length > 5 ? ` + ${accountingYearProcesses.length - 5} andre prosesser` : "" )
            ]) 
            : d("Ingen prosesser")
          ]),
          d([
            entityLabelWithPopup( State, 6778, e => ClientApp.update({S: {selectedEntity: 6778, selectedCompanyEntity: undefined}}   ) ),
            d( [7047, 7079, 7321, 6780, 6820, 6802].map( entityType => entityLabelWithPopup( State,  entityType, e => ClientApp.update({S: {selectedEntity: entityType, selectedCompanyEntity: undefined}} ) )))
          ])
        ], {class: "columns_1_1"}),
        br(),
        br(),
      ])
    } )),
  ], {class: "feedContainer"}),

    
  
  ])

let companyActionsView = ( State) => d([
  h3("Handlinger på selskapsnivå"),
  //d(State.Company.getActions().map(  companyAction => actionButton(companyAction) , {style: "display: flex;"}) )
], {class: "feedContainer"}) 



let timelineHeaderView = ( State, accountingYear ) => d([
  entityLabelWithPopup( State, accountingYear, e => ClientApp.update( State, {S: {selectedEntity: accountingYear, selectedCompanyEntity: undefined}}  )),
  d( ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"].map( month => d(month)  ), {style: `display:grid;grid-template-columns: repeat(${12}, 1fr);background-color: #8080802b;margin: 5px;`} ),
], {style: `display:grid;grid-template-columns: 4fr 12fr 1fr;`})

let processView = ( State,  process) => {

  let prevProcess =State.Company.processes[State.Company.processes.findIndex( p => p === process ) - 1  ]
  let nextProcess =State.Company.processes[State.Company.processes.findIndex( p => p === process ) + 1  ]
  return d([
    entityLabelWithPopup( State, process, e => ClientApp.update( State, {S: {selectedEntity: process}} )),
    br(),
    d([
      d([
        submitButton("<---", e => ClientApp.update( State, {S: {selectedEntity:  prevProcess }} ) ),
        entityLabel(State, prevProcess)
      ], {class: "columns_1_1"}),
      d([
        entityLabel(State, nextProcess),
        submitButton("--->", e => ClientApp.update( State, {S: {selectedEntity:  nextProcess }} ) ),
      ], {class: "columns_1_1"}),
      
    ], {class: "columns_1_1"}),
    br(),
    timelineHeaderView( State,  undefined ),
    processTimelineView( State,  process ),
    d(State.Company.getProcess( process ).events.map( event => eventTimelineView( State,  process, event)  ) ),
    br(),
    processActionsView( State,   process ),
    br(),
    d([
      h3("Output fra prosessen:"),
      d(Company.getProcess( process ).entities.map( companyEntity => companyEntityView( State, companyEntity ) )),
    ], {class: "feedContainer"} )
  ],{class: "feedContainer"})
} 

let processesTimelineView = ( State) => d([
  h3("Selskapets prosesser"),
  timelineHeaderView( State, ClientApp.S.selectedEntity ),
  d(State.Company.processes.map( process => processTimelineView( State,  process) ) ), 
], {class: "feedContainer"})


let processTimelineView = ( State,  process) => {

  let Process =State.Company.getProcess( process )

  let firstDate = moment( "2020-01-01", "YYYY-MM-DD" )

  let width = 400;
  let height = 50;

  let daysInYear = 365
  let leftPadding = 10;
  let rightPadding = 10;

  let dayWidth = ( width - leftPadding - rightPadding)  / daysInYear;


  let firstProcessEvent = Process.events[0]

  let firstEventX = dayWidth * moment(State.DB.get(firstProcessEvent, "event/date"), "x" ).diff(firstDate, 'days')

  let lastProcessEvent = Process.events.slice(-1)[0]

  let lastEventX = dayWidth * moment(State.DB.get(lastProcessEvent, "event/date"), "x" ).diff(firstDate, 'days')

  let processWidth = lastEventX - firstEventX + 5

  let rectHeigth = 10;

  let processRect = rect({x: firstEventX, y: "50%", width: processWidth, height: rectHeigth, class: "processRect"}, e => ClientApp.update( State, {S:{selectedEntity: process} } ) )


  return d([
    entityLabelWithPopup( State, process, e => ClientApp.update( State, {S:{selectedEntity: process} } )),
    svg(width, height, [processRect]  ),
    actionButton( mergerino(Company.getAction(6628, undefined, Process  ), {label: "[ X ]"})  ) 
  ], {style: `display:grid;grid-template-columns: 4fr 12fr 1fr;`})

}

let eventTimelineView = ( State,  process, event) => {

  let Process =State.Company.getProcess( process )

  let Event =State.Company.getEvent( event )

  let firstDate = moment( "2020-01-01", "YYYY-MM-DD" )

  

  let width = 400;
  let height = 50;

  let daysInYear = 365
  let leftPadding = 10;
  let rightPadding = 10;

  let dayWidth = ( width - leftPadding - rightPadding)  / daysInYear;

  let eventX = dayWidth * moment(State.DB.get(event, "event/date"), "x" ).diff(firstDate, 'days')

  let circleRadius = 5

  let eventCirc = circle({cx: eventX, cy: "50%", r: circleRadius, class: "eventCircle"}, e => ClientApp.update( State, {S:{selectedEntity: event} } ) )


  return d([
    entityLabelWithPopup( State,  Event.get("event/eventTypeEntity"), e => ClientApp.update( State, {S:{selectedEntity: event} } )  ),
    svg(width, height, [eventCirc]  ),
    actionButton( mergerino(Company.getAction(6635, Event, Process  ), {label: "[ X ]"})  ) 
  ], {style: `display:grid;grid-template-columns: 4fr 12fr 1fr;`})
}

let processActionsView = ( State,  process) => d([
  h3( "Handlinger på prosessnivå" ),
  d(State.Company.getProcessActions( process ).map( companyAction => actionButton(companyAction)  ) )
], {class: "feedContainer"})

let companyEntityPageView = State  => d([
  submitButton(" <- Tilbake ", e => ClientApp.update( State, {S:{selectedEntity: State.Company.entity} } ) ),
  br(),
  companyEntityView( State, State.S.selectedCompanyEntity )
  ])

let eventView =  ( State,  event) => {

  let Event =State.Company.getEvent( event )

  let Process =State.Company.getProcess( Event.process )

  let prevEvent = Process.events[ Process.events.findIndex( e => e === Event.entity ) - 1  ]
  let nextEvent = Process.events[ Process.events.findIndex( e => e === Event.entity ) + 1  ]

  return d([
    submitButton(" <- Tilbake ", e => ClientApp.update( State, {S:{selectedEntity: State.Company.entity} } ) ),
    br(),
    d([
      h3( "Prosess" ),
      timelineHeaderView( State),
      processTimelineView( State, Event.process ),
      eventTimelineView( State, Event.process, Event.entity),
      br(),
      d([
        d([
          submitButton("<---", e => ClientApp.update( State, {S:{selectedEntity: prevEvent} } ) ),
          entityLabel( State, prevEvent)
        ], {class: "columns_1_1"}),
        d([
          entityLabel( State, nextEvent),
          submitButton("--->", e => ClientApp.update( State, {S:{selectedEntity: nextEvent} } ) ),
        ], {class: "columns_1_1"}),
        
      ], {class: "columns_1_1"})
    ], {class: "feedContainer"}),
    br(),
    d([
      entityLabelWithPopup( State, event, e => ClientApp.update( State, {S:{selectedEntity: event} } )),
      br(),
      d(State.DB.get( Event.get("event/eventTypeEntity"), "eventType/eventAttributes").map( attribute => entityAttributeView(State, Event.entity, attribute)  )),
      
      eventActionsView( State, event ),
      //br(),
      
    ], {class: "feedContainer"} ),
    br(),
    d([
      h3("Output fra hendelsen:"),
      d(Company.getEvent( event ).entities.map( companyEntity => companyEntityView( State, companyEntity ) )),
    ], {class: "feedContainer"} )
  ])
} 

let eventActionsView = ( State, event) => d([
      h3("Handlinger på hendelsesnivå"),
      d(State.Company.getEventActions( event ).map(  companyAction => actionButton(companyAction)  ) )
  ], {class: "feedContainer"})  

//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------



let CompanyCalculatedFieldView = ( State, calculateField) => d([
  entityLabelWithPopup( State, calculateField),
  d( String( Math.round(State.Company.calculateCompanyCalculatedField(calculateField) )  ), {style: `text-align: right;` } )
], {class: "columns_1_1"})


let balanceSheetView = ( State) => d([
  h3("Balanse"),
  d([
    d([
      h3("Eiendeler"),
      d("Anleggsmidler"),
      d(
        [6238,  6241, 6253, 6254, 6255, 6256, 6260, 6262, 6270, 6240, 6275, 6277, 6279, 6286]
          .filter( calculateField =>State.Company.calculateCompanyCalculatedField(calculateField) !== 0 )
          .map( calculateField => CompanyCalculatedFieldView( State, calculateField)  )  
          ),
      br(),
      d("Omløpsmidler"),
      d(
        [6248,  6274, 6276, 6276, 6287, 6288]
          .filter( calculateField =>State.Company.calculateCompanyCalculatedField(calculateField) !== 0 )
          .map( calculateField => CompanyCalculatedFieldView( State, calculateField)  )  
        )
    ], {style: "margin: 5px;border: 1px solid #80808052;"}),
    d([
      h3("Gjeld og egenkapital"),
      d("Egenkapital"),
      d(
        [6237,  6246, 6278, 6281, 6295]
          .filter( calculateField =>State.Company.calculateCompanyCalculatedField(calculateField) !== 0 )
          .map( calculateField => CompanyCalculatedFieldView( State, calculateField)  )  
      ),
      br(),
      d("Gjeld"),
      d(
        [6247,  6259, 6280, 6257, 6258, 6264, 6269, 6272, 6273, 6294, 6296]
          .filter( calculateField =>State.Company.calculateCompanyCalculatedField(calculateField) !== 0 )
          .map( calculateField => CompanyCalculatedFieldView( State, calculateField)  )  
      ),
    ], {style: "margin: 5px;border: 1px solid #80808052;"}),
  ], {class: "columns_1_1"})
], {class: "feedContainer"})

// ADMIN PAGE VIEWS

let adminPage = (DB) => d([
  d([d('<header><h1>Holdingservice Admin</h1></header>'),d([submitButton("Bytt til klient", e => ClientApp.update({S: {selectedEntity: undefined}}) )], {style: "display:flex;"} )], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
  d([
    entityLabelWithPopup( State,  47 ),
    span(" / "  ),
    isDefined(AdminApp.S.selectedEntity)
      ? entityLabelWithPopup( State, State.DB.get(AdminApp.S.selectedEntity).entityType   )
      : span(" ... "),
    span(" / "  ),
    isDefined(AdminApp.S.selectedEntity)
      ? entityLabelWithPopup( State,  AdminApp.S.selectedEntity   )
      : span("Ingen entitet valgt.")
  ], {style: "padding: 1em;"}),

  d([
    d(""),
   State.DB.get( AdminApp.S.selectedEntity, "entity/entityType" ) === 47
      ? d([
        multipleEntitiesView( State, AdminApp.S.selectedEntity ),
        br(),
        entityView( State, AdminApp.S.selectedEntity )
      ]) 
      : entityView( State, AdminApp.S.selectedEntity )
  ], {class: "pageContainer"})

])

let multipleEntitiesView = (DB, entityType) => d([
  entityLabelWithPopup( State, entityType),
  d(State.DB.getAll( entityType   ).map( entity =>State.DB.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).map( category => d([
    h3(category),
    d(State.DB.getAll(entityType).filter( e =>State.DB.get(e, "entity/category") === category ).map( entity => entityLabelWithPopup( State, entity) ) ),
  ])  ) )
],{class: "feedContainer"})


//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------



//ARCHIVE

/* 
let entityRedlinedValue = (value, prevValue) => d( [
  span( `${JSON.stringify(prevValue)}`, "", {class: "redlineText"}),
  span( `${JSON.stringify(value)}`),
], {style:"display: inline-flex;justify-content: flex-end;"} ) 





 */