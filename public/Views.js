//Action button


let actionButton = (State, companyAction) => d([
  d([
    d( `${ companyAction.label}`, {class: "entityLabel", style: `background-color:${companyAction.isActionable ? "yellow" : "gray" }`}, "click", companyAction.isActionable ? async e => ClientApp.update( State, await companyAction.execute(State) ) : e => console.log("Not actionable") ),
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

// SESSION PANEL

let sessionStatePanel = (States, Patches) => d( States.map( (State, index) => sessionStateLabel(
  State, 
  Patches[index],
  index, 
  States[index-1] 
    ? States[index-1].DB 
      ? (State.DB.tx > States[index-1].DB.tx )
      : true
    : false,
  )   ), {style: "display: flex;"} )

let sessionStateLabel = (State, Patch, index, dbUpdated ) => {

  let companyIsUpToDate = isDefined(State.DB) && isDefined(State.Company)
    ? (State.DB.tx === State.Company.tx)
    : true

  return d([
    d(` ${dbUpdated ? " ~ " : ""} ${index} ${ companyIsUpToDate ? "" : "*"} `  , {style: `padding: 3px;margin: 5px; ${State.S.isAdmin ? "background-color:black;color: #57ff57;" : "background-color:#2979ff;color: white;"}`} ),
    sessionStatePopup( State, Patch )
  ], {class: "popupContainer"})
} 

let sessionStatePopup = (State, Patch) => {

  return d([
    d([
      d("DB-versjon:"),
      d( State.DB ? String(State.DB.tx) : " - " )
    ], {class: "columns_1_1"}),
    br(),
    d([
      d("Company-versjon:"),
      d( State.Company ? String(State.Company.tx) : " - " )
    ], {class: "columns_1_1"}),
    br(),
    d([
      d("Klient-state:"),
      d( JSON.stringify(State.S) )
    ], {class: "columns_1_1"}),
    br(),
    d([
      d("Siste endring:"),
      d(JSON.stringify(Patch.S))
    ], {class: "columns_1_1"})
    
    ], {class: "entityInspectorPopup", style: "width: 400px;padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})
} 

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

  if(State.S.isError){return d(State.S.error) }
  if(isUndefined(State.DB)){return d("Laster..") }

  let selectedEntityType = isDefined( State.DB.get( State.S.selectedEntity, "entity/entityType" ) ) 
    ? State.DB.get( State.S.selectedEntity, "entity/entityType" )
    : 5722


  let entityTypeViewController = {
    "47": State.S.selectedEntity === 5692 
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

        let constructedCompany = constructCompany( State,  State.DB, company )

        let patch = {
          Company: constructedCompany,
          S: {selectedEntity: company }
        }

        ClientApp.update( State, patch )

      })]),
      submitButton("Bytt til admin", e => ClientApp.update( State, {S: {isAdmin: true, selectedEntity: undefined, selectedCompanyEntity: undefined }  } ) )
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
    "47": () => d([
          entityLabelWithPopup( State, State.S.selectedEntity, e => ClientApp.update( State, {S: {selectedEntity: State.S.selectedEntity }}) ),
        ]),
    "5722": () => d( "" ),
    "7403": () => entityLabelWithPopup( State, State.S.selectedEntity, e => ClientApp.update( State, {S: {selectedEntity: State.S.selectedEntity }} ) ),
    "5692": () => d([
      entityLabelWithPopup( State, State.DB.get( State.S.selectedEntity, "process/accountingYear"), e => ClientApp.update( State, {S: {selectedEntity: State.DB.get( State.S.selectedEntity, "process/accountingYear") }}) ),
      entityLabelWithPopup( State, State.S.selectedEntity, e => ClientApp.update( State, {S: {selectedEntity: State.S.selectedEntity }}) ),
    ]),
    "46": () => d([
      entityLabelWithPopup( State, State.DB.get( State.DB.get(State.S.selectedEntity, "event/process"), "process/accountingYear"), e => ClientApp.update( State, {S: {selectedEntity: State.DB.get( State.DB.get(State.S.selectedEntity, "event/process"), "process/accountingYear") }}) ),
      entityLabelWithPopup( State, State.DB.get(State.S.selectedEntity, "event/process"), e => ClientApp.update( State, {S: {selectedEntity: State.DB.get(State.S.selectedEntity, "event/process")}}) ),
      entityLabelWithPopup( State, State.S.selectedEntity, e => ClientApp.update( State, {S: {selectedEntity: State.S.selectedEntity}})  ),
    ]),
    "6778": () =>  d([
      entityLabelWithPopup( State, 6778, e => ClientApp.update( State, {S: {selectedEntity: 6778}}) ),
      entityLabelWithPopup( State, State.S.selectedEntity, e => ClientApp.update( State, {S: {selectedEntity: State.S.selectedCompanyEntity, selectedCompanyEntity: undefined }}  ) ),
      isDefined(State.S.selectedCompanyEntity) ? companyEntityLabelWithPopup(State, State.S.selectedCompanyEntity) : d("")
    ])
  }

  


  return d([
    entityLabelWithPopup( State, State.Company.entity, e => ClientApp.update( State, {S: {selectedEntity: State.Company.entity }})  ),
    entityTypeViewController[ selectedEntityType ]()
  ], {style: "display: flex;"})
} 

let accountingYearView = State => d([
  entityLabelWithPopup( State, State.S.selectedEntity ),
  d([
    timelineHeaderView( State ),
    d(State.Company.processes
        .filter( process => State.DB.get(process, "process/accountingYear") === State.S.selectedEntity ) 
        .map( process => processTimelineView( State,  process) ) 
      )
  ]),
  br(),
  companyActionsView( State ),
 /*  d([
    h3("Selskapets saldobalanse"),
    d(State.Company.get(1, 6212 ).map( Account => d([
      entityLabelWithPopup( State, Account.account),
      d( String(Account.amount) ),
    ], {class: "columns_1_1"}) ))
  ], {class: "feedContainer"}), */
  br(),
  //balanceSheetView( State ),
], {class: "feedContainer"})

let companyEntitiesPageView = ( State) => d([
  h3("Alle selskapsdokumenter"),
  d(State.DB.getAll(6778).map( entityType => d([
    entityLabelWithPopup( State,  entityType, e => ClientApp.update( State, {S: {selectedEntity: entityType }} ) ),
    d(State.Company.getAll(entityType).map( companyEntity => companyEntityLabelWithPopup( State, companyEntity) ) ),
    br()
  ])))
], {class: "feedContainer"})

let multipleCompanyEntitiesView = State => {

  let eventTypeAttributes = State.DB.get( State.S.selectedEntity,  "companyEntityType/attributes")

  return d([
    d( eventTypeAttributes.map( attr => d([entityLabelWithPopup( State, attr, e => console.log("Cannot access AdminPage from here"))])   ), {style: `display:grid;grid-template-columns: repeat(${eventTypeAttributes.length}, 1fr);`} ),
    d(State.Company.getAll(State.S.selectedEntity).map( companyEntity => d( eventTypeAttributes.map( attribute => companyValueView( State, companyEntity, attribute)   ), {style: `display:grid;grid-template-columns: repeat(${eventTypeAttributes.length}, 1fr);`} ) ) )
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
        entityLabelWithPopup( State, accountingYear, e => ClientApp.update( State, {S: {selectedEntity: accountingYear, selectedCompanyEntity: undefined}}  ) ),
        d([
          d([
            entityLabelWithPopup( State, 5692, e => ClientApp.update(State,{S: {selectedEntity: 5692, selectedCompanyEntity: undefined}}   ) ),
            accountingYearProcesses.length > 0 
            ? d([
              d( accountingYearProcesses.slice(0, 5)
                  .map( process => entityLabelWithPopup( State,  process, e => ClientApp.update( State, {S: {selectedEntity: process, selectedCompanyEntity: undefined}}  ) ))),
              d( accountingYearProcesses.length > 5 ? ` + ${accountingYearProcesses.length - 5} andre prosesser` : "" )
            ]) 
            : d("Ingen prosesser")
          ]),
          d([
            entityLabelWithPopup( State, 6778, e => ClientApp.update(State,{S: {selectedEntity: 6778, selectedCompanyEntity: undefined}}   ) ),
            d( [7047, 7079, 7321, 6780, 6820, 6802].map( entityType => entityLabelWithPopup( State,  entityType, e => ClientApp.update( State, {S: {selectedEntity: entityType, selectedCompanyEntity: undefined}} ) )))
          ])
        ], {class: "columns_1_1"}),
        br(),
        br(),
      ])
    } )),
  ], {class: "feedContainer"}),

    
  
  ])

let companyActionsView = State => d([
  h3("Handlinger på selskapsnivå"),
  d(State.Company.getActions().map(  companyAction => actionButton(State, companyAction) , {style: "display: flex;"}) )
], {class: "feedContainer"}) 



let timelineHeaderView = State => d([
  d("")  ,
  d( ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"].map( month => d(month)  ), {style: `display:grid;grid-template-columns: repeat(${12}, 1fr);background-color: #8080802b;margin: 5px;`} ),
], {style: `display:grid;grid-template-columns: 4fr 12fr 1fr;`})

let processView = State => {

  let prevProcess = State.Company.processes[State.Company.processes.findIndex( p => p ===  State.S.selectedEntity ) - 1  ]
  let nextProcess = State.Company.processes[State.Company.processes.findIndex( p => p ===  State.S.selectedEntity ) + 1  ]
  return d([
    entityLabelWithPopup( State,  State.S.selectedEntity, e => ClientApp.update( State, {S: {selectedEntity:  State.S.selectedEntity}} )),
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
    timelineHeaderView( State ),
    processTimelineView( State,   State.S.selectedEntity ),
    d(State.Company.getProcess(  State.S.selectedEntity ).events.map( event => eventTimelineView( State,   State.S.selectedEntity, event)  ) ),
    br(),
    processActionsView( State, State.S.selectedEntity ),
    br(),
    d([
      h3("Output fra prosessen:"),
      d( State.Company.getProcess(  State.S.selectedEntity ).entities.map( companyEntity => companyEntityView( State, companyEntity ) )),
    ], {class: "feedContainer"} )
  ],{class: "feedContainer"})
} 

let processesTimelineView = State => d([
  h3("Alle selskapets prosesser"),
  d([7407, 7406].map( accountingYear => d([
    entityLabelWithPopup( State, accountingYear, e => ClientApp.update( State, {S: {selectedEntity: accountingYear, selectedCompanyEntity: undefined}}  ) ),
    d([
      timelineHeaderView( State ),
      d(State.Company.processes
          .filter( process => State.DB.get(process, "process/accountingYear") === accountingYear ) 
          .map( process => processTimelineView( State,  process) ) 
        )
    ]),
    br()
  ], {style: gridColumnsStyle("1fr 9fr")} )  ))
  
], {class: "feedContainer"})


let processTimelineView = ( State,  process) => {

  let Process = State.Company.getProcess( process )

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
    actionButton(State,  mergerino( State.Company.getAction(6628, undefined, Process  ), {label: "[ X ]"})  ) 
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
    actionButton(State,  mergerino( State.Company.getAction(6635, Event, Process  ), {label: "[ X ]"})  ) 
  ], {style: `display:grid;grid-template-columns: 4fr 12fr 1fr;`})
}

let processActionsView = ( State,  process) => d([
  h3( "Handlinger på prosessnivå" ),
  d(State.Company.getProcessActions( process ).map( companyAction => actionButton(State, companyAction)  ) )
], {class: "feedContainer"})

let companyEntityPageView = State  => d([
  submitButton(" <- Tilbake ", e => ClientApp.update( State, {S:{selectedEntity: State.Company.entity} } ) ),
  br(),
  companyEntityView( State, State.S.selectedCompanyEntity )
  ])

let eventView =  State => {

  let Event = State.Company.getEvent( State.S.selectedEntity )

  let Process = State.Company.getProcess( Event.process )

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
      entityLabelWithPopup( State, State.S.selectedEntity, e => ClientApp.update( State, {S:{selectedEntity: State.S.selectedEntity} } )),
      br(),
      d(State.DB.get( Event.get("event/eventTypeEntity"), "eventType/eventAttributes").map( attribute => entityAttributeView(State, Event.entity, attribute)  )),
      
      eventActionsView( State ),
      //br(),
      
    ], {class: "feedContainer"} ),
    br(),
    d([
      h3("Output fra hendelsen:"),
      d( State.Company.getEvent( State.S.selectedEntity ).entities.map( companyEntity => companyEntityView( State, companyEntity ) )),
    ], {class: "feedContainer"} )
  ])
} 

let eventActionsView = State => d([
      h3("Handlinger på hendelsesnivå"),
      d(State.Company.getEventActions( State.S.selectedEntity ).map(  companyAction => actionButton(State, companyAction)  ) )
  ], {class: "feedContainer"})  

//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------



let CompanyCalculatedFieldView = ( State, calculateField) => d([
  entityLabelWithPopup( State, calculateField, e => console.log("Cannot access AdminPage from here")),
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

let adminPage = State => d([
  d([d('<header><h1>Holdingservice Admin</h1></header>'),d([submitButton("Bytt til klient", e => ClientApp.update( State, {S: {isAdmin: false, selectedEntity: undefined}}) )], {style: "display:flex;"} )], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
  d([
    entityLabelWithPopup( State,  47, e => ClientApp.update( State, {S: {selectedEntity: 47 } }) ),
    span(" / "  ),
    isDefined(State.S.selectedEntity)
      ? entityLabelWithPopup( State, State.DB.get(State.S.selectedEntity, "entity/entityType"), e => ClientApp.update( State, {S: {selectedEntity: State.DB.get(State.S.selectedEntity, "entity/entityType")}})   )
      : span(" ... "),
    span(" / "  ),
    isDefined(State.S.selectedEntity)
      ? entityLabelWithPopup( State,  State.S.selectedEntity, e => ClientApp.update( State, {S: {selectedEntity: State.S.selectedEntity}})   )
      : span("Ingen entitet valgt.")
  ], {style: "padding: 1em;"}),

  d([
    d(""),
   State.DB.get( State.S.selectedEntity, "entity/entityType" ) === 47
      ? d([
        multipleEntitiesView( State, State.S.selectedEntity ),
        br(),
        entityView( State, State.S.selectedEntity )
      ]) 
      : entityView( State, State.S.selectedEntity )
  ], {class: "pageContainer"})

])

let multipleEntitiesView = (State, entityType) => d([
  entityLabelWithPopup( State, entityType),
  d(State.DB.getAll( entityType   ).map( entity =>State.DB.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).map( category => d([
    h3(category),
    d(State.DB.getAll(entityType).filter( e => State.DB.get(e, "entity/category") === category ).map( entity => entityLabelWithPopup( State, entity, e => ClientApp.update( State, {S: {selectedEntity: entity}})  ) ) ),
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