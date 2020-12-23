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


let svg = (width, height, innerhtml) => htmlElementObject("svg", {width, height}, innerhtml)


let rect = (attributesObject, onclick) => htmlElementObject( "rect", attributesObject, "", "click", onclick )

let circle = (attributesObject, onclick) => htmlElementObject( "circle", attributesObject, "", "click", onclick )


let isEvent = entity => Database.get(entity).entityType === 46
let isProcess = entity => Database.get(entity).entityType === 5692
let isCompany = entity => Database.get(entity).entityType === 5722


// CLIENT PAGE VIEWS

let companyEntityLabel = (Company, companyEntity) => d([
    d( Company.get(companyEntity).label(), {class: "entityLabel", style: `background-color:${Database.get( Company.get(companyEntity, 6781), "entityType/color")};`}, "click", e => ClientApp.update( ClientApp.updateState({selectedEntity: Company.get(companyEntity, 6781), selectedCompanyEntity: companyEntity}) ) ),
  ], {style:"display: inline-flex;"})

let companyEntityLabelWithPopup = (Company, companyEntity) => d([
  d([
    companyEntityLabel( Company, companyEntity),
    companyEntityPopUp( Company, companyEntity ),
  ], {class: "popupContainer", style:"display: inline-flex;"})
], {style:"display: inline-flex;"}) 


let companyEntityPopUp = (Company, companyEntity) => d([

  d([
    entityLabel( 6 ),
    d(Company.get(companyEntity).label()),
  ], {class: "columns_1_1"}),
  d([
    d([span( `Selskapsentitet`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`})], {style:"display: inline-flex;"}),
    d(String(companyEntity)),
  ], {class: "columns_1_1"}),
  d([
    entityLabel( 47 ),
    entityLabel( 6778 ),
  ], {class: "columns_1_1"}),
  d([
    entityLabel( 6781 ),
    entityLabel( Company.get( companyEntity, 6781 ) ),
  ], {class: "columns_1_1"}),
  d([
    d([span( `Opphavshendelse`, ``, {class: "entityLabel", style: `background-color: #7463ec7a;`})], {style:"display: inline-flex;"}),
    entityLabel( Company.get( companyEntity ).event, e => ClientApp.update( ClientApp.updateState({selectedEntity: Company.get( companyEntity ).event }) ) ),
  ], {class: "columns_1_1"}),
], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;"})


let clientPage = Company => {


  let entityTypeViewController = {
    "47": entityType => entityType === 5692 
      ? processesTimelineView( Company ) 
      : entityType === 6778 
        ? companyEntitiesPageView( Company )
        : d( "error" ),
      
    "5722": () => companyView( Company ),
    "7403": () => accountingYearView( Company, selectedEntity ),
    "5692": () => processView( Company, selectedEntity ),
    "46": () => eventView( Company, selectedEntity ),
    "6778": companyEntityType => isDefined( selectedCompanyEntity )
      ? companyEntityPageView( Company, selectedCompanyEntity )
      : multipleCompanyEntitiesView( Company, companyEntityType )
  }

  let selectedEntity = ClientApp.S.selectedEntity
  

  let selectedEntityType = isDefined( Database.get( selectedEntity, "entity/entityType" ) ) 
    ? Database.get( selectedEntity, "entity/entityType" )
    : 5722

  let selectedCompanyEntity = ClientApp.S.selectedCompanyEntity

  return d([
    d([d('<header><h1>Holdingservice Beta</h1></header>'),d([
      d([dropdown( Company.entity, Database.getAll( 5722 ).map( company => returnObject({value: company, label: Database.get(company, "entity/label")  })  ), e => {
        let company = Number( submitInputValue(e) )
        ClientApp.recalculateCompany( company )
        ClientApp.updateState( {selectedEntity: company } )
        ClientApp.update(  )
      })]),
      submitButton("Bytt til admin", e => AdminApp.update(  ) )
    ], {style: "display:flex;"} ),], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
    getEntityNavBar(selectedEntity, selectedCompanyEntity),
    d([
      d(""),
      entityTypeViewController[ selectedEntityType ](selectedEntity)
    ], {class: "pageContainer"})
    
  ])
}

let getEntityNavBar = (selectedEntity, selectedCompanyEntity) => {

  let entityTypeViewController = {
    "47": entityType => d([
          entityLabelWithPopup(entityType, e => ClientApp.update( ClientApp.updateState({selectedEntity: entityType}) ) ),
        ]),
    "5722": () => d( "" ),
    "7403": accountingYear => entityLabelWithPopup(accountingYear, e => ClientApp.update( ClientApp.updateState({selectedEntity: accountingYear}) ) ),
    "5692": process => d([
      entityLabelWithPopup(Database.get( process, "process/accountingYear"), e => ClientApp.update( ClientApp.updateState({selectedEntity: Database.get( process, "process/accountingYear")}) ) ),
      entityLabelWithPopup(process, e => ClientApp.update( ClientApp.updateState({selectedEntity: process}) ) ),
    ]),
    "46": event => d([
      entityLabelWithPopup(Database.get( Database.get(event, "event/process"), "process/accountingYear"), e => ClientApp.update( ClientApp.updateState({selectedEntity: Database.get( Database.get(event, "event/process"), "process/accountingYear")}) ) ),
      entityLabelWithPopup(Database.get(event, "event/process"), e => ClientApp.update( ClientApp.updateState({selectedEntity: Database.get(event, "event/process")}) ) ),
      entityLabelWithPopup(event, e => ClientApp.update( ClientApp.updateState({selectedEntity: event}) ) ),
    ]),
    "6778": companyEntityType =>  d([
      entityLabelWithPopup(6778, e => ClientApp.update( ClientApp.updateState({selectedEntity: 6778}) ) ),
      entityLabelWithPopup( companyEntityType , e => ClientApp.update( ClientApp.updateState({selectedEntity: companyEntityType, selectedCompanyEntity: undefined }) ) ),
      isDefined(selectedCompanyEntity) ? companyEntityLabelWithPopup(Company, selectedCompanyEntity) : d("")
    ])
  }

  let selectedEntityType = isDefined( Database.get( selectedEntity, "entity/entityType" ) ) 
    ? Database.get( selectedEntity, "entity/entityType" )
    : 5722


  return d([
    entityLabelWithPopup(Company.entity, e => ClientApp.update( ClientApp.updateState({selectedEntity: Company.entity}) ) ),
    entityTypeViewController[ selectedEntityType ](selectedEntity)
  ], {style: "display: flex;"})
} 

let accountingYearView = (Company, accountingYear) => d([
  processesTimelineView( Company ),
  br(),
  companyActionsView(Company),
 /*  d([
    h3("Selskapets saldobalanse"),
    d( Company.get(1, 6212 ).map( Account => d([
      entityLabelWithPopup(Account.account),
      d( String(Account.amount) ),
    ], {class: "columns_1_1"}) ))
  ], {class: "feedContainer"}), */
  br(),
  balanceSheetView(Company),
])

let companyEntitiesPageView = Company => d([
  h3("Alle selskapsdokumenter"),
  d( Database.getAll(6778).map( entityType => d([
    entityLabelWithPopup( entityType, e => ClientApp.update( ClientApp.updateState({selectedEntity: entityType }) ) ),
    d( Company.getAll(entityType).map( companyEntity => companyEntityLabelWithPopup(Company, companyEntity) ) ),
    br()
  ])))
], {class: "feedContainer"})

let multipleCompanyEntitiesView = (Company, entityType) => {

  let eventTypeAttributes = Database.get( entityType,  6779)

  return d([
    d( eventTypeAttributes.map( attr => d([entityLabelWithPopup(attr)])   ), {style: `display:grid;grid-template-columns: repeat(${eventTypeAttributes.length}, 1fr);`} ),
    d( Company.getAll(entityType).map( companyEntity => d( eventTypeAttributes.map( attribute => companyValueView(Company, companyEntity, attribute)   ), {style: `display:grid;grid-template-columns: repeat(${eventTypeAttributes.length}, 1fr);`} ) ) )
  ],{class: "feedContainer"})
} 


let companyView = Company => d([
  d([
    h3("Selskapets balanse"),
    d(`Siste registrerte hendelse: ${ moment(Company.getEvent(Company.events.slice(-1)[0]).get("event/date"), "x").format("YYYY-MM-DD")  }`),
    d([
      d([
        h3("Eiendeler"),
        d([
          entityLabelWithPopup(6785, e => ClientApp.update( ClientApp.updateState({selectedEntity: 6785, selectedCompanyEntity: undefined}) ) ),
          d( Company.getAll(6785).map( security => d([
            companyEntityLabelWithPopup(Company, security),
          d( String( Company.get(security, 6108).reduce( (sum, t) => sum + Company.get(t, 1083), 0 ) ) , {style: `text-align: right;`})
          ], {class: "columns_1_1"})  ) )
        ], {style: gridColumnsStyle("1fr 3fr") }),
        d([
          entityLabelWithPopup(7310, e => ClientApp.update( ClientApp.updateState({selectedEntity: 7310, selectedCompanyEntity: undefined}) )),
          d( Company.getAll(7310).map( bankAccount => d([
            companyEntityLabelWithPopup(Company, bankAccount),
            d( String( Company.get(bankAccount, 6108).reduce( (sum, t) => sum + Company.get(t, 1083), 0 ) ) , {style: `text-align: right;`})
          ], {class: "columns_1_1"}) ) )
        ], {style: gridColumnsStyle("1fr 3fr") }),
      ], {style: `padding: 1em;`}),
      d([
        h3("Egenkapital og gjeld"),
        d([
          entityLabelWithPopup(6790, e => ClientApp.update( ClientApp.updateState({selectedEntity: 6790, selectedCompanyEntity: undefined}) )),
          d( Company.getAll(6790).map( actor => d([
            companyEntityLabelWithPopup(Company, actor),
            d( String( Company.get(actor, 6108).reduce( (sum, t) => sum + Company.get(t, 1083), 0 ) ) , {style: `text-align: right;`}),
            //d("1000", {style: `text-align: right;`})
          ], {class: "columns_1_1"})  ) )
        ], {style: gridColumnsStyle("1fr 3fr") }),
        d([
          entityLabelWithPopup(6791, e => ClientApp.update( ClientApp.updateState({selectedEntity: 6791, selectedCompanyEntity: undefined}) )),
          d( Company.getAll(6791).map( loan => d([
            companyEntityLabelWithPopup(Company, loan),
            d( String( Company.get(loan, 6108).reduce( (sum, t) => sum + Company.get(t, 1083), 0 ) ) , {style: `text-align: right;`}),
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

      let accountingYearProcesses = Company.processes
      .filter( p => Company.getProcess(p).get("process/accountingYear") === accountingYear )

      return d([
        entityLabelWithPopup(accountingYear, e => ClientApp.update( ClientApp.updateState({selectedEntity: accountingYear }) ) ),
        d([
          d([
            entityLabelWithPopup(5692, e => ClientApp.update( ClientApp.updateState({selectedEntity: 5692 }) ) ),
            accountingYearProcesses.length > 0 
            ? d([
              d( accountingYearProcesses.slice(0, 5)
                  .map( process => entityLabelWithPopup( process, e => ClientApp.update( ClientApp.updateState({selectedEntity: process }) ) ))),
              d( accountingYearProcesses.length > 5 ? ` + ${accountingYearProcesses.length - 5} andre prosesser` : "" )
            ]) 
            : d("Ingen prosesser")
          ]),
          d([
            entityLabelWithPopup(6778, e => ClientApp.update( ClientApp.updateState({selectedEntity: 6778 }) ) ),
            d( [7047, 7079, 7321, 6780, 6820, 6802].map( entityType => entityLabelWithPopup( entityType, e => ClientApp.update( ClientApp.updateState({selectedEntity: entityType }) ) )))
          ])
        ], {class: "columns_1_1"}),
        br(),
        br(),
      ])
    } )),
  ], {class: "feedContainer"}),

    
  
  ])

let companyActionsView = Company => d([
  h3("Handlinger på selskapsnivå"),
  d( Company.getActions().map(  companyAction => actionButton(companyAction) , {style: "display: flex;"}) )
], {class: "feedContainer"}) 



let timelineHeaderView = ( Company, accountingYear ) => d([
  entityLabelWithPopup(accountingYear, e => ClientApp.update( ClientApp.updateState({selectedEntity: accountingYear}) )),
  d( ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"].map( month => d(month)  ), {style: `display:grid;grid-template-columns: repeat(${12}, 1fr);background-color: #8080802b;margin: 5px;`} ),
], {style: `display:grid;grid-template-columns: 4fr 12fr 1fr;`})

let processView = (Company, process) => {

  let prevProcess = Company.processes[ Company.processes.findIndex( p => p === process ) - 1  ]
  let nextProcess = Company.processes[ Company.processes.findIndex( p => p === process ) + 1  ]
  return d([
    entityLabelWithPopup(process, e => ClientApp.update( ClientApp.updateState({selectedEntity: process}) )),
    br(),
    d([
      d([
        submitButton("<---", e => ClientApp.update( ClientApp.updateState({selectedEntity: prevProcess }) ) ),
        entityLabel(prevProcess)
      ], {class: "columns_1_1"}),
      d([
        entityLabel(nextProcess),
        submitButton("--->", e => ClientApp.update( ClientApp.updateState({selectedEntity: nextProcess }) ) ),
      ], {class: "columns_1_1"}),
      
    ], {class: "columns_1_1"}),
    br(),
    timelineHeaderView(),
    processTimelineView(Company, process ),
    d( Company.getProcess( process ).events.map( event => eventTimelineView(Company, process, event)  ) ),
    br(),
    processActionsView(Company,  process ),
    br(),
    d([
      h3("Output fra prosessen:"),
      d(Company.getProcess( process ).entities.map( companyEntity => companyEntityView( Company, companyEntity ) )),
    ], {class: "feedContainer"} )
  ],{class: "feedContainer"})
} 

let processesTimelineView = Company => d([
  h3("Selskapets prosesser"),
  timelineHeaderView( Company, ClientApp.S.selectedEntity ),
  d( Company.processes.map( process => processTimelineView(Company, process) ) ), 
], {class: "feedContainer"})


let processTimelineView = (Company, process) => {

  let Process = Company.getProcess( process )

  let firstDate = moment( "2020-01-01", "YYYY-MM-DD" )

  let width = 400;
  let height = 50;

  let daysInYear = 365
  let leftPadding = 10;
  let rightPadding = 10;

  let dayWidth = ( width - leftPadding - rightPadding)  / daysInYear;


  let firstProcessEvent = Process.events[0]

  let firstEventX = dayWidth * moment( Database.get(firstProcessEvent, "event/date"), "x" ).diff(firstDate, 'days')

  let lastProcessEvent = Process.events.slice(-1)[0]

  let lastEventX = dayWidth * moment( Database.get(lastProcessEvent, "event/date"), "x" ).diff(firstDate, 'days')

  let processWidth = lastEventX - firstEventX + 5

  let rectHeigth = 10;

  let processRect = rect({x: firstEventX, y: "50%", width: processWidth, height: rectHeigth, class: "processRect"}, e => ClientApp.update( ClientApp.updateState({selectedEntity: process}) ) )


  return d([
    entityLabelWithPopup(process, e => ClientApp.update( ClientApp.updateState({selectedEntity: process}) )),
    svg(width, height, [processRect]  ),
    actionButton( mergerino(Company.getAction(6628, undefined, Process  ), {label: "[ X ]"})  ) 
  ], {style: `display:grid;grid-template-columns: 4fr 12fr 1fr;`})

}

let eventTimelineView = (Company, process, event) => {

  let Process = Company.getProcess( process )

  let Event = Company.getEvent( event )

  let firstDate = moment( "2020-01-01", "YYYY-MM-DD" )

  

  let width = 400;
  let height = 50;

  let daysInYear = 365
  let leftPadding = 10;
  let rightPadding = 10;

  let dayWidth = ( width - leftPadding - rightPadding)  / daysInYear;

  let eventX = dayWidth * moment( Database.get(event, "event/date"), "x" ).diff(firstDate, 'days')

  let circleRadius = 5

  let eventCirc = circle({cx: eventX, cy: "50%", r: circleRadius, class: "eventCircle"}, e => ClientApp.update( ClientApp.updateState({selectedEntity: event}) ) )


  return d([
    entityLabelWithPopup( Event.get("event/eventTypeEntity"), e => ClientApp.update(  ClientApp.updateState({selectedEntity: event}) )  ),
    svg(width, height, [eventCirc]  ),
    actionButton( mergerino(Company.getAction(6635, Event, Process  ), {label: "[ X ]"})  ) 
  ], {style: `display:grid;grid-template-columns: 4fr 12fr 1fr;`})
}

let processActionsView = (Company, process) => d([
  h3( "Handlinger på prosessnivå" ),
  d( Company.getProcessActions( process ).map( companyAction => actionButton(companyAction)  ) )
], {class: "feedContainer"})

let companyEntityPageView = ( Company, selectedCompanyEntity) => d([
  submitButton(" <- Tilbake ", e => ClientApp.update( ClientApp.updateState({selectedEntity: Company.entity }) ) ),
  br(),
  companyEntityView( Company, selectedCompanyEntity )
  ])

let eventView =  (Company, event) => {

  let Event = Company.getEvent( event )

  let Process = Company.getProcess( Event.process )

  let prevEvent = Process.events[ Process.events.findIndex( e => e === Event.entity ) - 1  ]
  let nextEvent = Process.events[ Process.events.findIndex( e => e === Event.entity ) + 1  ]

  return d([
    submitButton(" <- Tilbake ", e => ClientApp.update( ClientApp.updateState({selectedEntity: Company.entity }) ) ),
    br(),
    d([
      h3( "Prosess" ),
      timelineHeaderView(),
      processTimelineView(Company, Event.process ),
      eventTimelineView(Company, Event.process, Event.entity),
      br(),
      d([
        d([
          submitButton("<---", e => ClientApp.update( ClientApp.updateState({selectedEntity: prevEvent }) ) ),
          entityLabel(prevEvent)
        ], {class: "columns_1_1"}),
        d([
          entityLabel(nextEvent),
          submitButton("--->", e => ClientApp.update( ClientApp.updateState({selectedEntity: nextEvent }) ) ),
        ], {class: "columns_1_1"}),
        
      ], {class: "columns_1_1"})
    ], {class: "feedContainer"}),
    br(),
    d([
      entityLabelWithPopup(event, e => ClientApp.update( ClientApp.updateState({selectedEntity: event}) )),
      br(),
      d( Database.get( Event.get("event/eventTypeEntity"), "eventType/eventAttributes").map( attribute =>  Database.getEntityAttribute( Event.entity, attribute ).getView()  )),
      
      eventActionsView(Company, event ),
      //br(),
      
    ], {class: "feedContainer"} ),
    br(),
    d([
      h3("Output fra hendelsen:"),
      d(Company.getEvent( event ).entities.map( companyEntity => companyEntityView( Company, companyEntity ) )),
    ], {class: "feedContainer"} )
  ])
} 

let eventActionsView = (Company, event) => d([
      h3("Handlinger på hendelsesnivå"),
      d( Company.getEventActions( event ).map(  companyAction => actionButton(companyAction)  ) )
  ], {class: "feedContainer"})  

//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------



let CompanyCalculatedFieldView = (Company, calculateField) => d([
  entityLabelWithPopup(calculateField),
  d( String( Math.round( Company.calculateCompanyCalculatedField(calculateField) )  ), {style: `text-align: right;` } )
], {class: "columns_1_1"})


let balanceSheetView = Company => d([
  h3("Balanse"),
  d([
    d([
      h3("Eiendeler"),
      d("Anleggsmidler"),
      d(
        [6238,  6241, 6253, 6254, 6255, 6256, 6260, 6262, 6270, 6240, 6275, 6277, 6279, 6286]
          .filter( calculateField => Company.calculateCompanyCalculatedField(calculateField) !== 0 )
          .map( calculateField => CompanyCalculatedFieldView(Company, calculateField)  )  
          ),
      br(),
      d("Omløpsmidler"),
      d(
        [6248,  6274, 6276, 6276, 6287, 6288]
          .filter( calculateField => Company.calculateCompanyCalculatedField(calculateField) !== 0 )
          .map( calculateField => CompanyCalculatedFieldView(Company, calculateField)  )  
        )
    ], {style: "margin: 5px;border: 1px solid #80808052;"}),
    d([
      h3("Gjeld og egenkapital"),
      d("Egenkapital"),
      d(
        [6237,  6246, 6278, 6281, 6295]
          .filter( calculateField => Company.calculateCompanyCalculatedField(calculateField) !== 0 )
          .map( calculateField => CompanyCalculatedFieldView(Company, calculateField)  )  
      ),
      br(),
      d("Gjeld"),
      d(
        [6247,  6259, 6280, 6257, 6258, 6264, 6269, 6272, 6273, 6294, 6296]
          .filter( calculateField => Company.calculateCompanyCalculatedField(calculateField) !== 0 )
          .map( calculateField => CompanyCalculatedFieldView(Company, calculateField)  )  
      ),
    ], {style: "margin: 5px;border: 1px solid #80808052;"}),
  ], {class: "columns_1_1"})
], {class: "feedContainer"})

// ADMIN PAGE VIEWS

let adminPage = () => d([
  d([d('<header><h1>Holdingservice Admin</h1></header>'),d([submitButton("Bytt til klient", e => ClientApp.update() )], {style: "display:flex;"} )], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
  d([
    entityLabelWithPopup( 47 ),
    span(" / "  ),
    isDefined(AdminApp.S.selectedEntity)
      ? entityLabelWithPopup( Database.get(AdminApp.S.selectedEntity).entityType   )
      : span(" ... "),
    span(" / "  ),
    isDefined(AdminApp.S.selectedEntity)
      ? entityLabelWithPopup( AdminApp.S.selectedEntity   )
      : span("Ingen entitet valgt.")
  ], {style: "padding: 1em;"}),

  d([
    d(""),
    Database.get( AdminApp.S.selectedEntity, "entity/entityType" ) === 47
      ? d([
        multipleEntitiesView( AdminApp.S.selectedEntity ),
        br(),
        Database.getEntity(AdminApp.S.selectedEntity).getView()
      ]) 
      : Database.getEntity(AdminApp.S.selectedEntity).getView()
  ], {class: "pageContainer"})

])

let multipleEntitiesView = entityType => d([
  entityLabelWithPopup(entityType),
  d( Database.getAll( entityType   ).map( entity => Database.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).map( category => d([
    h3(category),
    d( Database.getAll(entityType).filter( e => Database.get(e, "entity/category") === category ).map( entity => entityLabelWithPopup(entity) ) ),
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