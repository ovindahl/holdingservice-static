//Action button

//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------


// SVG
let svg = (width, height, innerhtml) => htmlElementObject("svg", {width, height}, innerhtml)
let rect = (attributesObject, onclick) => htmlElementObject( "rect", attributesObject, "", "click", onclick )
let circle = (attributesObject, onclick) => htmlElementObject( "circle", attributesObject, "", "click", onclick )
let svgText = (attributesObject, innerHTML, onclick) => htmlElementObject( "text", attributesObject, innerHTML, "click", onclick )

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


let clientPage = State => {

  if(State.S.isError){return d(State.S.error) }
  if(isUndefined(State.DB)){return d("Laster..") }

  let selectedEntityType = isDefined( State.DB.get( State.S.selectedEntity, "entity/entityType" ) ) 
    ? State.DB.get( State.S.selectedEntity, "entity/entityType" )
    : 5722

  let entityTypeViewController = {
    "47": State.S.selectedEntity === 5692 
      ? accountingYearView 
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
      d([dropdown(State.Company.entity, State.DB.getAll( 5722 ).map( company => returnObject({value: company, label: State.DB.get(company, "entity/label")  })  ), e => State.Actions.updateCompany( Number( submitInputValue(e) ) ))]),
      submitButton("Bytt til admin", e => State.Actions.toggleAdmin() )
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
          entityLabelWithPopup( State, State.S.selectedEntity ),
        ]),
    "5722": () => d( "" ),
    "7403": () => entityLabelWithPopup( State, State.S.selectedEntity ),
    "5692": () => d([
      entityLabelWithPopup( State, State.DB.get( State.S.selectedEntity, "process/accountingYear"), e => State.Actions.selectEntity( State.DB.get( State.S.selectedEntity, "process/accountingYear")) ),
      entityLabelWithPopup( State, State.S.selectedEntity ),
    ]),
    "46": () => d([
      entityLabelWithPopup( State, State.DB.get( State.DB.get(State.S.selectedEntity, "event/process"), "process/accountingYear"), e => State.Actions.selectEntity( State.DB.get( State.DB.get(State.S.selectedEntity, "event/process"), "process/accountingYear")) ),
      entityLabelWithPopup( State, State.DB.get(State.S.selectedEntity, "event/process"), e => State.Actions.selectEntity( State.DB.get(State.S.selectedEntity, "event/process")) ),
      entityLabelWithPopup( State, State.S.selectedEntity ),
    ]),
    "6778": () =>  d([
      entityLabelWithPopup( State, 6778, e => State.Actions.selectEntity( 6778 ) ),
      entityLabelWithPopup( State, State.S.selectedEntity ),
      isDefined(State.S.selectedCompanyEntity) ? companyEntityLabelWithPopup(State, State.S.selectedCompanyEntity) : d("")
    ])
  }

  


  return d([
    entityLabelWithPopup( State, State.Company.entity, e => State.Actions.selectEntity( State.Company.entity )  ),
    entityTypeViewController[ selectedEntityType ]()
  ], {style: "display: flex;"})
} 

let companyEntitiesPageView = ( State) => d([
  h3("Alle selskapsdokumenter"),
  d(State.DB.getAll(6778).map( entityType => d([
    entityLabelWithPopup( State,  entityType ),
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


// Company entity view   -------------------------------------------------------------

let companyView = State => d([
  balanceSheetView( State ),
  br(),
  d([
    h3("Registrerte regnskapsår"),
    d( [7407, 7406].map( accountingYear => {

      let accountingYearProcesses =State.Company.processes
      .filter( p => State.Company.getProcess(p).get("process/accountingYear") === accountingYear )

      return d([
        entityLabelWithPopup( State, accountingYear ),
        d([
          d([
            entityLabelWithPopup( State, 5692 ),
            accountingYearProcesses.length > 0 
            ? d([
              d( accountingYearProcesses.slice(0, 5)
                  .map( process => entityLabelWithPopup( State,  process ))),
              d( accountingYearProcesses.length > 5 ? ` + ${accountingYearProcesses.length - 5} andre prosesser` : "" )
            ]) 
            : d("Ingen prosesser")
          ]),
          d([
            entityLabelWithPopup( State, 6778 ),
            d( [7047, 7079, 7321, 6780, 6820, 6802].map( entityType => entityLabelWithPopup( State,  entityType )))
          ])
        ], {class: "columns_1_1"}),
        br(),
        br(),
      ])
    } )),
  ], {class: "feedContainer"}),

    
  
  ])




let balanceSheetView = State => d([
  h3("Selskapets balanse"),
  d(`Siste registrerte hendelse: ${ moment(State.Company.getEvent(State.Company.events.slice(-1)[0]).get("event/date"), "x").format("YYYY-MM-DD")  }`),
  d([
    d([
      h3("Eiendeler"),
      d([
        entityLabelWithPopup( State, 6785, e => State.Actions.selectEntity( 6785 )  ),
        d( State.Company.getAll(6785).map( security => d([
          companyEntityLabelWithPopup( State, security),
        d( String(State.Company.get(security, 7433) ) , {style: `text-align: right;`})
        ], {class: "columns_1_1"})  ) )
      ], {style: gridColumnsStyle("1fr 3fr") }),
      d([
        entityLabelWithPopup( State, 7310 ),
        d(State.Company.getAll(7310).map( bankAccount => d([
          companyEntityLabelWithPopup( State, bankAccount),
          d( String(State.Company.get(bankAccount, 6108).reduce( (sum, t) => sum +State.Company.get(t, 1083), 0 ) ) , {style: `text-align: right;`})
        ], {class: "columns_1_1"}) ) )
      ], {style: gridColumnsStyle("1fr 3fr") }),
    ], {style: `padding: 1em;`}),
    d([
      h3("Egenkapital"),
      d([
        entityLabelWithPopup( State, 6790 ),
        d(State.Company.getAll(6790).map( actor => d([
          companyEntityLabelWithPopup( State, actor),
          d( String(State.Company.get(actor, 6108).reduce( (sum, t) => sum +State.Company.get(t, 1083), 0 ) ) , {style: `text-align: right;`}),
          //d("1000", {style: `text-align: right;`})
        ], {class: "columns_1_1"})  ) )
      ], {style: gridColumnsStyle("1fr 3fr") }),
      br(),
      h3("Gjeld"),
      d([
        entityLabelWithPopup( State, 6791),
        d(State.Company.getAll(6791).map( loan => d([
          companyEntityLabelWithPopup( State, loan),
          d( String(State.Company.get(loan, 6108).reduce( (sum, t) => sum +State.Company.get(t, 1083), 0 ) ) , {style: `text-align: right;`}),
          //d("1000", {style: `text-align: right;`})
        ], {class: "columns_1_1"})  ) )
      ], {style: gridColumnsStyle("1fr 3fr") }),
    ], {style: `padding: 1em;`}),

  ], {class: "columns_1_1"})
  
], {class: "feedContainer"})


// Company entity view END -------------------------------------------------------------

let timelineHeaderView = width => d( ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"].map( month => d(month)  ), {style: `width:${width};display:grid;grid-template-columns: repeat(${12}, 1fr);background-color: #8080802b;`} )

let processView = State => {

  let process = State.S.selectedEntity
  let Process = State.Company.getProcess(process)

  let prevProcess = State.Company.processes[State.Company.processes.findIndex( p => p ===  process ) - 1  ]
  let nextProcess = State.Company.processes[State.Company.processes.findIndex( p => p ===  process ) + 1  ]
  return d([
    d([
      isDefined(prevProcess) ? submitButton("<--- forrige prosess", e => State.Actions.selectEntity(  prevProcess ) ) : d(""),
      d(`[ ${State.Company.processes.findIndex( p => p ===  process ) + 1} / ${State.Company.processes.length} ]`),
      isDefined(nextProcess) ? submitButton("neste prosess --->", e => State.Actions.selectEntity(  nextProcess ) ) : d(""),
      ], {class: "columns_1_1_1"}),
    br(),
    d([
      h3( Process.label() ),
      timelineHeaderView( "1000px" ),
      processTimelineView( State,   process ),
      br(),
      d(Process.events.map( event => eventTimelineView( State, event)  ) ),
      br(),
      submitButton("Slett prosess", e => State.Actions.retractEntity(process) ),
    ],{class: "feedContainer"}),
    br(),
    d([
      h3("Selskapsdokumenter generert av prosessen:"),
      d( Process.entities.map( companyEntity => companyEntityLabelWithPopup( State, companyEntity, e => State.Actions.selectEntity( process, companyEntity ), (companyEntity === State.S.selectedCompanyEntity) ) )),
      br(),
      isDefined( State.S.selectedCompanyEntity ) 
        ? d([
            d( State.DB.get( State.Company.get( State.S.selectedCompanyEntity, 6781 ), 6779 ).map( attribute => companyDatomView( State, State.S.selectedCompanyEntity, attribute, isDefined( State.S.selectedCompanyEntityVersion ) ? State.S.selectedCompanyEntityVersion : State.Company.getEvent( Process.events.slice(-1)[0] ).t ) )),
            br(),
            submitButton("Åpne selskapsdokument", e => State.Actions.selectCompanyEntity(  State.S.selectedCompanyEntity ) )
        ]) 
        : d("")
    ], {class: "feedContainer"} )
  ]) 
} 

let accountingYearView = State => {

  let accountingYear = State.DB.get(State.S.selectedEntity, "entity/entityType") === 7403
    ? State.S.selectedEntity
    : 7407

  return d([
    d( State.DB.getAll(7403).map( accYear => entityLabelWithPopup(State, accYear, undefined, (accYear === accountingYear) ) ), {style: "display: flex;"}),
    d([
      timelineHeaderView( "1000px" ),
      d(State.Company.processes
          .filter( process => State.DB.get(process, "process/accountingYear") === accountingYear ) 
          .map( process => processTimelineView( State,  process) ) 
        )
    ]),
    h3("Opprett ny prosess:"),
    d( State.DB.getAll(5687).map( processType => entityLabelWithPopup(State, processType, e => State.Actions.createProcess(processType, accountingYear)  )  ) ),
  ], {style: "width: 1200px;padding:1em;margin-left:1em;margin-bottom: 1em;background-color: white;border: solid 1px lightgray;"})
} 

let processTimelineView = ( State,  process) => {

  let Process = State.Company.getProcess( process )

  let firstDate = moment( "2020-01-01", "YYYY-MM-DD" )

  let width = 1200;


  let height = 20;

  let daysInYear = 365
  let leftPadding = 10;
  let rightPadding = 200;

  let dayWidth = ( width - leftPadding - rightPadding)  / daysInYear;


  let firstProcessEvent = Process.events[0]

  let firstEventX = dayWidth * moment(State.DB.get(firstProcessEvent, "event/date"), "x" ).diff(firstDate, 'days')

  let lastProcessEvent = Process.events.slice(-1)[0]

  let lastEventX = dayWidth * moment(State.DB.get(lastProcessEvent, "event/date"), "x" ).diff(firstDate, 'days')

  let processWidth = lastEventX - firstEventX + 5

  let processRect = rect({x: leftPadding + firstEventX, y: height / 4, width: isNaN(processWidth) ? 10 : processWidth, height: height * 0.75, class: "processRect"}, e => State.Actions.selectEntity(  process ) )

  let processNameLabel = svgText({x: leftPadding + firstEventX,  y:  height / 2 + 5}, Process.label(), e => State.Actions.selectEntity(  process ) )


  return svg(width, height, [processRect, processNameLabel]  )

}

let eventTimelineView = ( State,  event) => {

  let Event = State.Company.getEvent( event )

  let firstDate = moment( "2020-01-01", "YYYY-MM-DD" )

  let width = 1200;
  let height = 20;

  let daysInYear = 365
  let leftPadding = 10;
  let rightPadding = 200;

  let dayWidth = ( width - leftPadding - rightPadding)  / daysInYear;

  let eventX = dayWidth * moment(State.DB.get(event, "event/date"), "x" ).diff(firstDate, 'days')

  let circleRadius = 5

  let eventCirc = circle({cx: leftPadding + eventX, cy: height * 0.75, r: circleRadius, class: "eventCircle"}, e => State.Actions.selectEntity(  event ) )

  let dateLabel = svgText({x: Math.max(eventX - 20, 0) ,  y:  15 , fill: "gray" }, moment(State.DB.get(event, "event/date"), "x").format( "D/M" ) )

  let eventNameLabel = svgText({x: leftPadding + eventX + 7,  y:  height * 0.75 + 3}, Event.label(), e => State.Actions.selectEntity(  event ) )


  return svg(width, height, [eventCirc, dateLabel, eventNameLabel]  )
}


let companyEntityPageView = State  => d([
  submitButton(" <- Tilbake ", e => State.Actions.selectEntity(  State.Company.entity )  ),
  br(),
  companyEntityView( State, State.S.selectedCompanyEntity, State.S.selectedCompanyEntityVersion )
])

let eventView =  State => {

  let event = State.S.selectedEntity
  let Event = State.Company.getEvent( event )

  let Process = State.Company.getProcess( Event.process )

  let prevEvent = Process.events[ Process.events.findIndex( e => e === Event.entity ) - 1  ]
  let nextEvent = Process.events[ Process.events.findIndex( e => e === Event.entity ) + 1  ]

  return d([
    submitButton(" <- Tilbake til prosess ", e => State.Actions.selectEntity(  Event.process ) ),
    br(),
    d([
      isDefined(prevEvent) ? submitButton("<--- forrige hendelse", e => State.Actions.selectEntity(  prevEvent ) ) : d(""),
      d(`[ ${Process.events.findIndex( e => e === Event.entity ) + 1} / ${Process.events.length} ]`),
      isDefined(nextEvent) ? submitButton("neste hendelse --->", e => State.Actions.selectEntity(  nextEvent ) ) : d(""),
      ], {class: "columns_1_1_1"}),
    br(),
    d([
      h3( Event.label() ),
      br(),
      d(State.DB.get( Event.get("event/eventTypeEntity"), "eventType/eventAttributes").map( attribute => entityAttributeView(State, Event.entity, attribute)  )),
      br(),
      submitButton("Slett hendelse", e => State.Actions.retractEntity(Event.entity) ),
    ], {class: "feedContainer"} ),
    br(),
    d([
      h3("Selskapsdokumenter generert av hendelsen:"),
      d( Event.entities.map( companyEntity => companyEntityLabelWithPopup( State, companyEntity, e => State.Actions.selectEntity( event, companyEntity ), (companyEntity === State.S.selectedCompanyEntity) ) )),
      br(),
      isDefined(State.S.selectedCompanyEntity) 
        ? companyEntityView( State, State.S.selectedCompanyEntity )
        : d("")
    ], {class: "feedContainer"} )
  ])
}

//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------



let CompanyCalculatedFieldView = ( State, calculateField) => d([
  entityLabelWithPopup( State, calculateField, e => console.log("Cannot access AdminPage from here")),
  d( String( Math.round(State.Company.calculateCompanyCalculatedField(calculateField) )  ), {style: `text-align: right;` } )
], {class: "columns_1_1"})




// ADMIN PAGE VIEWS

let adminPage = State => d([
  d([d('<header><h1>Holdingservice Admin</h1></header>'),d([submitButton("Bytt til klient", e => State.Actions.toggleAdmin() )], {style: "display:flex;"} )], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
  d([
    entityLabelWithPopup( State,  47 ),
    span(" / "  ),
    isDefined(State.S.selectedEntity)
      ? entityLabelWithPopup( State, State.DB.get(State.S.selectedEntity, "entity/entityType")   )
      : span(" ... "),
    span(" / "  ),
    isDefined(State.S.selectedEntity)
      ? entityLabelWithPopup( State,  State.S.selectedEntity )
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
    d(State.DB.getAll(entityType).filter( e => State.DB.get(e, "entity/category") === category ).map( entity => entityLabelWithPopup( State, entity ) ) ),
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