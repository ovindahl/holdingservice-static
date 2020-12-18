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

// CLIENT PAGE VIEWS

let companyEntityLabel = (Company, companyEntity) => d([
    d( Company.get(companyEntity).label(), {class: "entityLabel", style: `background-color:${Database.get( Company.get(companyEntity, 6781), "entityType/color")};`}, "click", e => ClientApp.update( ClientApp.updateState({selectedEntity: companyEntity}) ) ),
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


let clientPage = Company => d([
  d([d('<header><h1>Holdingservice Beta</h1></header>'),d([
    d([dropdown( Company.entity, Database.getAll( 5722 ).map( company => returnObject({value: company, label: Database.get(company, "entity/label")  })  ), e => {
      let company = Number( submitInputValue(e) )
      ClientApp.recalculateCompany( company )
      ClientApp.updateState( {selectedEntity: company } )
      ClientApp.update(  )
    })]),
    submitButton("Bytt til admin", e => AdminApp.update(  ) )
  ], {style: "display:flex;"} ),], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
  //dropdown( Company.entity, Database.getAll( 5722 ).map( company => returnObject({value: company, label: Database.get(company, "entity/label")  })  ), e => update( ClientApp.selectCompany( Number(submitInputValue(e))  ) )   ),
  navBar(Company),
  d([
    d(""),
    isDefined( ClientApp.S.selectedEntity )
      ? isCompany( ClientApp.S.selectedEntity ) 
        ? companyView( Company )
        : isEvent( ClientApp.S.selectedEntity )
          ? eventView( Company )
          : isProcess( ClientApp.S.selectedEntity )
            ? processView( Company )
            : Database.get( ClientApp.S.selectedEntity, "entity/entityType" ) === 6778
                ? multipleCompanyEntitiesView( Company, ClientApp.S.selectedEntity )
                :  companyEntitiyPageView( Company )
      : companyView( Company )
  ], {class: "pageContainer"})
  
])

let multipleCompanyEntitiesView = (Company, entityType) => {

  let eventTypeAttributes = D.get( entityType,  6779)

  return d([
    d([
      d(""),
      d( eventTypeAttributes.map( attr => entityLabelWithPopup(attr)  ), {style: `display:grid;grid-template-columns: repeat(${eventTypeAttributes.length}, 1fr);`} )
    ], {style: `display:grid;grid-template-columns: 1fr 7fr; margin: 5px;border: 1px solid #80808052;`}),
    entityLabelWithPopup(entityType),
    d( Company.getAll(entityType).map( companyEntity => d([
      companyEntityLabelWithPopup(Company, companyEntity),
      d( eventTypeAttributes.map( attr => valueView(Company.get(companyEntity) , attr, false)   ), {style: `display:grid;grid-template-columns: repeat(${eventTypeAttributes.length}, 1fr);`} )
    ], {style: `display:grid;grid-template-columns: 1fr 7fr; margin: 5px;border: 1px solid #80808052;`}),
   ) )
  ],{class: "feedContainer"})
} 

let isEvent = entity => Database.get(entity).entityType === 46
let isProcess = entity => Database.get(entity).entityType === 5692
let isCompany = entity => Database.get(entity).entityType === 5722

let navBar = Company => d([
  entityLabelWithPopup( Company.entity, e => ClientApp.update(  ClientApp.updateState({selectedEntity: Company.entity}) )),
  isDefined( ClientApp.S.selectedEntity )
    ? isCompany( ClientApp.S.selectedEntity )
        ? d("")
        : isProcess( ClientApp.S.selectedEntity )
          ? d([
            span(" / "  ),
            entityLabelWithPopup( 5692 ),
            span(" / "  ),
            entityLabelWithPopup( ClientApp.S.selectedEntity  )
          ])
          : isEvent( ClientApp.S.selectedEntity )
            ? d([
              span(" / "  ),
              entityLabelWithPopup( 5692 ),
              span(" / "  ),
              entityLabelWithPopup( Company.getEvent( ClientApp.S.selectedEntity ).get( "event/process" )  ),
              span(" / "  ),
              entityLabelWithPopup( 46 ),
              span(" / "  ),
              entityLabelWithPopup( ClientApp.S.selectedEntity  )
            ])
            : Database.get( ClientApp.S.selectedEntity, "entity/entityType" ) === 6778
              ? d([
                span(" / "  ),
                companyEntityLabelWithPopup( Company, ClientApp.S.selectedEntity, e => ClientApp.update( ClientApp.updateState({selectedEntity: ClientApp.S.selectedEntity }) ) ),
              ])
              : d([
                span(" / "  ),
                entityLabelWithPopup( Company.get( ClientApp.S.selectedEntity, 6781 ), e => ClientApp.update( ClientApp.updateState({selectedEntity: Company.get( ClientApp.S.selectedEntity, 6781 ) }) ) ),
                span(" / "  ),
                companyEntityLabelWithPopup( Company, ClientApp.S.selectedEntity )
              ])
    : d("")
], {style: "display: flex;"})

let companyView = Company => d([
    br(),
    processesTimelineView( Company ),
    br(),
    companyActionsView( Company ),
    br(),
    d([
      h3("Selskapets saldobalanse"),
      d( Company.get(1, 6212 ).map( Account => d([
        entityLabelWithPopup(Account.account),
        d( String(Account.amount) ),
      ], {class: "columns_1_1"}) ))
    ], {class: "feedContainer"}),
    br(),
    d([
      h3("Selskapets entiteter"),
      d( Database.getAll(6778).map( entityType => d([
        entityLabelWithPopup( entityType, e => ClientApp.update( ClientApp.updateState({selectedEntity: entityType }) ) ),
        d( Company.getAll(entityType).map( companyEntity => companyEntityLabelWithPopup(Company, companyEntity) ) ),
        br()
      ])))
    ], {class: "feedContainer"}),
  ])

let companyActionsView = Company => d([
  h3("Handlinger på selskapsnivå"),
  d( Company.getActions().map(  companyAction => actionButton(companyAction) , {style: "display: flex;"}) )
], {class: "feedContainer"}) 
  

let timelineHeaderView = () => d([
  d( `${2018}`, {class: "entityLabel", style: `background-color: black;color: white;`}),
  d( ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"].map( month => d(month)  ), {style: `display:grid;grid-template-columns: repeat(${12}, 1fr);background-color: #8080802b;margin: 5px;`} ),
], {style: `display:grid;grid-template-columns: 4fr 12fr 1fr;`})

let processView = Company => d([
  d([
    entityLabelWithPopup(5692),
    entityLabelWithPopup(ClientApp.S.selectedEntity, e => ClientApp.update( ClientApp.updateState({selectedEntity: ClientApp.S.selectedEntity}) )),
  ], {class: "columns_1_1"}),
  d([
    entityLabelWithPopup(5687),
    entityLabelWithPopup( Company.getProcess( ClientApp.S.selectedEntity ).get("process/processType") )
  ], {class: "columns_1_1"}),
  br(),
  timelineHeaderView(),
  processTimelineView(Company, ClientApp.S.selectedEntity ),
  d( Company.getProcess( ClientApp.S.selectedEntity ).events.map( event => eventTimelineView(Company, ClientApp.S.selectedEntity, event)  ) ),
  br(),
  processActionsView(Company,  ClientApp.S.selectedEntity ),
],{class: "feedContainer"})

let processesTimelineView = Company => d([
  h3("Selskapets prosesser"),
  timelineHeaderView(),
  d( Company.processes.map( process => processTimelineView(Company, process) ) ), 
], {class: "feedContainer"})


let processTimelineView = (Company, process) => {

  let Process = Company.getProcess( process )

  let processEventsTimes = Process.events.map( event => Company.getEvent(event).t )


  return d([
    entityLabelWithPopup(process, e => ClientApp.update( ClientApp.updateState({selectedEntity: process}) )),
    d( Company.events.map( (event, i) => ((i+1) < processEventsTimes[0] || (i+1) > processEventsTimes.slice( -1 )[0])
    ? d(" ")
    : Company.getProcess(process).events.includes(event)
      ? d([
          d([
              d( `●`, {style: `color:${ Company.getEvent(event).isValid ? "green" : "red"}; ${event === ClientApp.S.selectedEntity ? "border: 1px solid black;background-color: gray;" : "" } `} ),
              entityPopUp( event ),
            ], {class: "popupContainer", style:"display: inline-flex;"}, "click", e => ClientApp.update(  ClientApp.updateState({selectedEntity: event}) ))
        ], {style:"display: inline-flex;"} )
      : d("-" ) ), {style: `display:grid;grid-template-columns: repeat(${Company.events.length}, 1fr);background-color: #8080802b;margin: 5px;`} ),
    actionButton( mergerino(Company.getAction(6628, undefined, Process  ), {label: "[ X ]"})  ) 
  ], {style: `display:grid;grid-template-columns: 4fr 12fr 1fr;`})
}

let eventTimelineView = (Company, process, event) => {

  let Process = Company.getProcess( process )

  let Event = Company.getEvent( event )

  let processEventsTimes = Process.events.map( event => Company.getEvent(event).t )


  return d([
    entityLabelWithPopup( Event.get("event/eventTypeEntity"), e => ClientApp.update(  ClientApp.updateState({selectedEntity: event}) )  ),
    d( Company.events.map( (processEvent, i) => ((i+1) < processEventsTimes[0] || (i+1) > processEventsTimes.slice( -1 )[0])
    ? d(" ")
    : processEvent === event
      ? d([
          d([
              d( `●`, {style: `color:${ Company.getEvent(event).isValid ? "green" : "red"}; ${event === ClientApp.S.selectedEntity ? "border: 1px solid black;background-color: gray;" : "" } `} ),
              entityPopUp( event ),
            ], {class: "popupContainer", style:"display: inline-flex;"}, "click", e => ClientApp.update(  ClientApp.updateState({selectedEntity: event}) ))
        ], {style:"display: inline-flex;"} )
      : d(" ") ), {style: `display:grid;grid-template-columns: repeat(${Company.events.length}, 1fr);background-color: #8080802b;margin: 5px;`} ),
      actionButton( mergerino(Company.getAction(6635, Event, Process  ), {label: "[ X ]"})  ) 
  ], {style: `display:grid;grid-template-columns: 4fr 12fr 1fr;`})
}

let processActionsView = (Company, process) => d([
  h3( "Handlinger på prosessnivå" ),
  d( Company.getProcessActions( process ).map( companyAction => actionButton(companyAction)  ) )
], {class: "feedContainer"})

let companyEntitiyPageView = Company => d([
  submitButton(" <- Tilbake ", e => ClientApp.update( ClientApp.updateState({selectedEntity: Company.entity }) ) ),
  br(),
  companyEntityView(Company, ClientApp.S.selectedEntity )
  ])

let eventView =  Company => {

  let Event = Company.getEvent( ClientApp.S.selectedEntity )

  return d([
    submitButton(" <- Tilbake ", e => ClientApp.update( ClientApp.updateState({selectedEntity: Company.entity }) ) ),
    br(),
    d([
      h3( "Prosess" ),
      processTimelineView(Company, Event.process )
    ], {class: "feedContainer"}),
    br(),
    d([
      h3( "Hendelse" ),
      d([
        entityLabelWithPopup(46),
        entityLabelWithPopup(ClientApp.S.selectedEntity, e => ClientApp.update( ClientApp.updateState({selectedEntity: ClientApp.S.selectedEntity}) )),
      ], {class: "columns_1_1"}),
      d([
        entityLabelWithPopup(43),
        entityLabelWithPopup( Event.get("event/eventTypeEntity") )
      ], {class: "columns_1_1"}),
      br(),
      d( Database.get( Event.get("event/eventTypeEntity"), "eventType/eventAttributes").map( attribute =>  fullDatomView( Event , attribute, true )  )),
      
      eventActionsView(Company, ClientApp.S.selectedEntity ),
      //br(),
      
    ], {class: "feedContainer"} ),
    br(),
    d([
      h3("Output fra hendelsen:"),
      d(Company.getEvent( ClientApp.S.selectedEntity ).entities.map( companyEntity => companyEntityView( Company, companyEntity ) )),
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



let balanceSheetView = Company => d([
  h3("Balanse"),
  d([
    d([
      h3("Eiendeler"),
      d("Anleggsmidler"),
      fullDatomView(Company.get(1), 6238),
      fullDatomView(Company.get(1), 6241),
      fullDatomView(Company.get(1), 6253),
      d( Company.getAll(5812).map( security => companyEntityLabelWithPopup(Company, security))   ),
      fullDatomView(Company.get(1), 6254),
      fullDatomView(Company.get(1), 6255),
      fullDatomView(Company.get(1), 6256),
      fullDatomView(Company.get(1), 6260),
      fullDatomView(Company.get(1), 6262),
      fullDatomView(Company.get(1), 6270),
      fullDatomView(Company.get(1), 6240),
      fullDatomView(Company.get(1), 6275),
      fullDatomView(Company.get(1), 6277),
      fullDatomView(Company.get(1), 6279),
      fullDatomView(Company.get(1), 6286),
      br(),

      d("Omløpsmidler"),
      fullDatomView(Company.get(1), 6248),
      fullDatomView(Company.get(1), 6274),
      fullDatomView(Company.get(1), 6276),

      fullDatomView(Company.get(1), 6287),

      br(),
      fullDatomView(Company.get(1), 6288),
      br(),
    ], {style: "margin: 5px;border: 1px solid #80808052;"}),
    d([
      h3("Gjeld og egenkapital"),
      d("Egenkapital"),
      fullDatomView(Company.get(1), 6237),
      fullDatomView(Company.get(1), 6246),
      fullDatomView(Company.get(1), 6278),
      fullDatomView(Company.get(1), 6281),
      fullDatomView(Company.get(1), 6295),
      br(),
      d("Gjeld"),
      fullDatomView(Company.get(1), 6247),
      fullDatomView(Company.get(1), 6259),
      fullDatomView(Company.get(1), 6280),
      fullDatomView(Company.get(1), 6257),
      fullDatomView(Company.get(1), 6258),
      fullDatomView(Company.get(1), 6264),
      d( Company.getAll(5811).map( loan => companyEntityLabelWithPopup(Company, loan))   ),
      fullDatomView(Company.get(1), 6269),
      fullDatomView(Company.get(1), 6272),
      fullDatomView(Company.get(1), 6273),
      fullDatomView(Company.get(1), 6275),
      fullDatomView(Company.get(1), 6294),
      br(),
      fullDatomView(Company.get(1), 6296),
    ], {style: "margin: 5px;border: 1px solid #80808052;"}),
  ], {class: "columns_1_1"})
], {class: "feedContainer"})

 */