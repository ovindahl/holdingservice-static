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
let line = (x1, x2, y1, y2, stroke, strokeWidth, onclick) => htmlElementObject( "line", {x1, x2, y1, y2, stroke, "stroke-width": strokeWidth}, "", "click", onclick )
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
    "47": [7531, 6778, 7535].includes( State.S.selectedEntity ) ? companyEntitiesPageView : companyView,
    "5722": companyView,
    "5692": processView,
    "46": eventView,
    "6778": isDefined( State.S.selectedCompanyEntity ) ? State => companyEntityView( State, State.S.selectedCompanyEntity ) : multipleCompanyEntitiesView,
    "7531": isDefined( State.S.selectedCompanyEntity ) ? State => companyEntityView( State, State.S.selectedCompanyEntity ) : multipleCompanyEntitiesView,
    "7535": isDefined( State.S.selectedCompanyEntity ) ? State => companyEntityView( State, State.S.selectedCompanyEntity ) : multipleCompanyEntitiesView,
    "7487": companyView,
  }

  
  
  return d([
    d([d('<header><h1>Holdingservice Beta</h1></header>'),d([
      d([dropdown(State.Company.entity, State.DB.getAll( 5722 ).map( company => returnObject({value: company, label: State.DB.get(company, "entity/label")  })  ), e => State.Actions.updateCompany( Number( submitInputValue(e) ) ))]),
      submitButton("Bytt til admin", e => State.Actions.toggleAdmin() )
    ], {style: "display:flex;"} ),], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
    getEntityNavBar( State ),
    d([
      d(""),
      d([
        dateSelectionView( State ),
        entityTypeViewController[ selectedEntityType ]( State )
      ])
    ], {class: "pageContainer"})
    
  ])
}

let getEntityNavBar = State => d([
  entityLabelWithPopup( State, State.Company.entity, e => State.Actions.selectEntity( State.Company.entity )  ),
  entityLabelWithPopup( State, State.S.selectedEntity ),
  isDefined(State.S.selectedCompanyEntity) ? companyEntityLabelWithPopup(State, State.S.selectedCompanyEntity) : d("")
], {style: "display: flex;"})

let companyEntitiesPageView = ( State) => d([
  h3("Alle selskapsdokumenter"),
  d(State.DB.getAll( State.S.selectedEntity ).map( entityType => d([
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

let dateSelectionView = State => {
  let companyEvents = getCompanyEvents(State.DB, State.Company.entity)

  

  let selectedTimeStamp = State.DB.get(State.S.selectedCompanyEvent, 1757)

  let selectedEventDate = moment( selectedTimeStamp ).format( "DD/MM/YYYY" )

  let dateEvents = companyEvents.filter( event => moment( State.DB.get(event, 1757) ).format( "DD/MM/YYYY" ) === selectedEventDate )

  let dateIndex = dateEvents.findIndex( event => event === State.S.selectedCompanyEvent )

  let prevEvent = dateEvents[ dateIndex - 1 ] 
  let nextEvent = dateEvents[ dateIndex + 1 ] 

  

  let selectedDate_firstEventIndex = companyEvents.findIndex( event => dateEvents.includes( event )  )

  let prevDateEvent = companyEvents[ selectedDate_firstEventIndex - 1 ] 
  let nextDateEvent = companyEvents.find( event => !dateEvents.includes( event ) && State.DB.get(event, 1757) > selectedTimeStamp )
  
  return d([
    h3("Datovelger:"),
    d([
      entityLabelWithPopup( State, 1757 ),
      d( selectedEventDate ),
      d([
        submitButton("[<<]", () => State.Actions.selectCompanyEvent( companyEvents[0] ) ),
        isDefined(prevDateEvent) ? submitButton("<", () => State.Actions.selectCompanyEvent( prevDateEvent ) ) : d(""),
        isDefined(nextDateEvent) ? submitButton(">", () => State.Actions.selectCompanyEvent( nextDateEvent ) ) : d(""),
        submitButton("[>>]", () => State.Actions.selectCompanyEvent( companyEvents.slice(-1)[0] ) )
      ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
    d([
      entityLabelWithPopup( State, 46 ),
      d( `${dateIndex+1} / ${dateEvents.length}` ),
      d([
        submitButton("[<<]", () => State.Actions.selectCompanyEvent( dateEvents[0] ) ),
        isDefined(prevEvent) ? submitButton("<", () => State.Actions.selectCompanyEvent( prevEvent ) ) : d(""),
        isDefined(nextEvent) ? submitButton(">", () => State.Actions.selectCompanyEvent( nextEvent ) ) : d(""),
        submitButton("[>>]", () => State.Actions.selectCompanyEvent( dateEvents.slice(-1)[0] ) )
      ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
    //d( eachDatelastDateTimes.map( dateTime => d( moment( dateTime ).format("DD/MM/YYYY") , {style: dateTime === State.S.selectedCompanyDate  ? "color:blue;" : "" }, "click", () => State.Actions.selectCompanyDate( dateTime ), {style: gridColumnsStyle(`repeat(${companyEvents.length}, 1fr)`) } ) )),
  ], {class: "feedContainer"})
} 


// Company entity view   -------------------------------------------------------------

let companyView = State => {


  let selectedReport = State.S.selectedEntity


  let reportController = {
    "7488": balanceSheetView,
    "7492": processesView,
    "7778": actorsView,
    "7508": transactionsView,
    "7494": singleDateView,
    "7820": bankView
  }


  return d([
    d([
      d( Object.keys(reportController).map( reportType => entityLabelWithPopup( State, Number(reportType) ) ) ),
      isDefined( reportController[ selectedReport ]) ? reportController[ selectedReport ]( State ) : d(""),
    ], {class: "feedContainer"}),
    ])
} 

let singleDateView = State => {

  let companyEvents = getCompanyEvents( State.DB, State.Company.entity )

  let selectedDateEvents = companyEvents.filter( event => moment( State.DB.get(event, 1757) ).format("DD/MM/YYYY") === moment( State.S.selectedCompanyDate ).format("DD/MM/YYYY")  )




  let companyTransactions = State.Company.getAll(7817, State.S.selectedCompanyDate)

  let selectedDateTransactions = companyTransactions.filter( transaction => moment( State.Company.get(transaction, 1757) ).format("DD/MM/YYYY") === moment( State.S.selectedCompanyDate ).format("DD/MM/YYYY")  )

  let changedBalanceObjects = selectedDateTransactions.map( transaction => State.Company.get(transaction, 7533) ).filter( filterUniqueValues )

  let firstEvent = companyEvents[ companyEvents.findIndex( event => selectedDateEvents.includes( event ) ) - 1 ] 
  let firstEventTimeStamp = State.DB.get(firstEvent, 1757)

  let lastEventTimeStamp = State.S.selectedCompanyDate


  return d([
    h3("Balanseendringer"),
    d([
      d("Objekt"),
      d("Bokført verdi, før"),
      d("Bokført verdi, endring"),
      d("Bokført verdi, etter"),
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    d( changedBalanceObjects.map( balanceObject => {

      let value_before = State.Company.get( balanceObject, 7433, firstEventTimeStamp )
      let value_after = State.Company.get( balanceObject, 7433, lastEventTimeStamp )
      let value_change = value_after - value_before

      return d([
        companyEntityLabelWithPopup(State, balanceObject ),
        d( formatNumber( value_before ) , {style: `text-align: right;`}),
        d( formatNumber( value_change ) , {style: `text-align: right;`}),
        d( formatNumber( value_after ) , {style: `text-align: right;`}),
      ], {style: gridColumnsStyle("repeat(4, 1fr)")})
    }  ) ),
    h3("Transaksjoner"),
    d([
      entityLabelWithPopup( State, 7533 ),
      entityLabelWithPopup( State, 1757 ),
      entityLabelWithPopup( State, 1083 ),
      entityLabelWithPopup( State, 1653 ),
      entityLabelWithPopup( State, 1139 ),
    ], {style: gridColumnsStyle("repeat(5, 1fr)")}),
    d( selectedDateTransactions.map( companyTransaction => d([
      companyEntityLabelWithPopup(State, State.Company.get(companyTransaction, 7533) ),
      companyValueView(State, companyTransaction, 1757),
      companyValueView(State, companyTransaction, 1083),
      companyValueView(State, companyTransaction, 1653),
      companyValueView(State, companyTransaction, 1139),
    ], {style: gridColumnsStyle("repeat(5, 1fr)")})  ) ),
  ])
} 

let balanceSheetView = State => d([
  h3(`Selskapets balanse`),
  d([
    d([
      h3("Eiendeler"),
      assetsView( State ),
    ], {style: `padding: 1em;`}), 
    d([
      h3("Egenkapital"),
      equityView( State ),
      br(),
      h3("Gjeld"),
      debtsView( State )
    ], {style: `padding: 1em;`}),
  ], {class: "columns_1_1"}),
  d([
    d([
      entityLabelWithPopup( State, 6288 ),
      d( formatNumber(State.Company.get( null, 6288, State.S.selectedCompanyDate )) , {style: `text-align: right;`}),
    ], {style: gridColumnsStyle("repeat(2, 1fr)")+`padding: 1em;`}),
    d([
      entityLabelWithPopup( State, 6296 ),
      d( formatNumber(State.Company.get( null, 6296, State.S.selectedCompanyDate )) , {style: `text-align: right;`}),
    ], {style: gridColumnsStyle("repeat(2, 1fr)")+`padding: 1em;`})
  ], {class: "columns_1_1", style: `background-color: ${ formatNumber(State.Company.get( null, 6288, State.S.selectedCompanyDate ) + State.Company.get( null, 6296, State.S.selectedCompanyDate )) === "0" ? "" : "#e82b0026" } `}),
  br(),
  entityLabelWithPopup( State, 7535 ),
])

let transactionsView = State => d([
  d([
    entityLabelWithPopup( State, 7533 ),
    entityLabelWithPopup( State, 1757 ),
    entityLabelWithPopup( State, 1083 ),
    entityLabelWithPopup( State, 1653 ),
    entityLabelWithPopup( State, 1139 ),
  ], {style: gridColumnsStyle("repeat(5, 1fr)")}),
  d([
    d( State.Company.getAll(7817, State.S.selectedCompanyDate).map( companyTransaction => d([
      companyEntityLabelWithPopup(State, State.Company.get(companyTransaction, 7533) ),
      companyValueView(State, companyTransaction, 1757),
      companyValueView(State, companyTransaction, 1083),
      companyValueView(State, companyTransaction, 1653),
      companyValueView(State, companyTransaction, 1139),
    ], {style: gridColumnsStyle("repeat(5, 1fr)")})  ) ),
  ]) 
])

let assetsView = State => d( 
  State.DB.getAll(7526)
    .filter( sectionSumField => State.DB.get(sectionSumField, 7540) === 7537 )
    .filter( sectionSumField => State.Company.get( null, sectionSumField, State.S.selectedCompanyDate ) !== 0 )
    .map( sectionSumField => d([
      d(
        State.DB.getAll(7531)
          .filter( balanceObjectType => State.Company.getAll(balanceObjectType, State.S.selectedCompanyDate).length > 0 )
          .filter( e => D.get(e, 7748) === sectionSumField ).map( balanceObjectType => d([
              d( State.Company.getAll(balanceObjectType, State.S.selectedCompanyDate).map( balanceEntity => d([
                companyEntityLabelWithPopup(State, balanceEntity),
                d( formatNumber(State.Company.get(balanceEntity, 7433, State.S.selectedCompanyDate )) , {style: `text-align: right;`}),
              ], {style: gridColumnsStyle("repeat(2, 1fr)")+`padding-left: 1em;`})  ) ),
              d([
                entityLabelWithPopup( State, balanceObjectType ),
                d( formatNumber(State.Company.getAll(balanceObjectType, State.S.selectedCompanyDate).reduce( (sum, balanceEntity) => sum + Company.get(balanceEntity, 7433), 0) ) , {style: `text-align: right;`}),
              ], {style: gridColumnsStyle("repeat(2, 1fr)")+`padding-left: 1em;`})
        ]) 
      )),
      d([
        entityLabelWithPopup( State, sectionSumField ),
        d( formatNumber(State.Company.get( null, sectionSumField, State.S.selectedCompanyDate )) , {style: `text-align: right;`}),
      ], {style: gridColumnsStyle("repeat(2, 1fr)")})
  ]) 
))




let debtsView = State => d( 
  State.DB.getAll(7526)
    .filter( sectionSumField => State.DB.get(sectionSumField, 7540) === 7539 )
    .filter( sectionSumField => State.Company.get( null, sectionSumField, State.S.selectedCompanyDate ) !== 0 )
    .map( sectionSumField => d([
      d(
        State.DB.getAll(7531)
          .filter( balanceObjectType => State.Company.getAll(balanceObjectType, State.S.selectedCompanyDate).length > 0 )
          .filter( e => D.get(e, 7748) === sectionSumField ).map( balanceObjectType => d([
              d( State.Company.getAll(balanceObjectType, State.S.selectedCompanyDate).map( balanceEntity => d([
                companyEntityLabelWithPopup(State, balanceEntity),
                d( formatNumber(State.Company.get(balanceEntity, 7433, State.S.selectedCompanyDate )) , {style: `text-align: right;`}),
              ], {style: gridColumnsStyle("repeat(2, 1fr)")+`padding-left: 1em;`})  ) ),
              d([
                entityLabelWithPopup( State, balanceObjectType ),
                d( formatNumber(State.Company.getAll(balanceObjectType, State.S.selectedCompanyDate).reduce( (sum, balanceEntity) => sum + Company.get(balanceEntity, 7433), 0) ) , {style: `text-align: right;`}),
              ], {style: gridColumnsStyle("repeat(2, 1fr)")+`padding-left: 1em;`})
        ]) 
      )),
      d([
        entityLabelWithPopup( State, sectionSumField ),
        d( formatNumber(State.Company.get( null, sectionSumField, State.S.selectedCompanyDate )) , {style: `text-align: right;`}),
      ], {style: gridColumnsStyle("repeat(2, 1fr)")})
  ]) 
))

let equityView = State => d( 
  State.DB.getAll(7526)
    .filter( sectionSumField => State.DB.get(sectionSumField, 7540) === 7538 )
    .filter( sectionSumField => State.Company.get( null, sectionSumField, State.S.selectedCompanyDate ) !== 0 )
    .map( sectionSumField => d([
      d(
        State.DB.getAll(7531)
          .filter( balanceObjectType => State.Company.getAll(balanceObjectType, State.S.selectedCompanyDate).length > 0 )
          .filter( e => D.get(e, 7748) === sectionSumField ).map( balanceObjectType => d([
              d( State.Company.getAll(balanceObjectType, State.S.selectedCompanyDate).map( balanceEntity => d([
                companyEntityLabelWithPopup(State, balanceEntity),
                d( formatNumber(State.Company.get(balanceEntity, 7433, State.S.selectedCompanyDate )) , {style: `text-align: right;`}),
              ], {style: gridColumnsStyle("repeat(2, 1fr)")+`padding-left: 1em;`})  ) ),
              d([
                entityLabelWithPopup( State, balanceObjectType ),
                d( formatNumber(State.Company.getAll(balanceObjectType, State.S.selectedCompanyDate).reduce( (sum, balanceEntity) => sum + Company.get(balanceEntity, 7433), 0) ) , {style: `text-align: right;`}),
              ], {style: gridColumnsStyle("repeat(2, 1fr)")+`padding-left: 1em;`})
        ]) 
      )),
      d([
        entityLabelWithPopup( State, sectionSumField ),
        d( formatNumber(State.Company.get( null, sectionSumField, State.S.selectedCompanyDate )) , {style: `text-align: right;`}),
      ], {style: gridColumnsStyle("repeat(2, 1fr)")})
  ]) 
))

let actorsView = State => d([
  d([
    entityLabelWithPopup( State, 6790 ),
    entityLabelWithPopup( State, 1113 )
  ], {style: gridColumnsStyle("repeat(2, 1fr)")}),
  d( State.Company.getAll( 6790, State.S.selectedCompanyDate ).map( actor => d([
      companyEntityLabelWithPopup( State, actor ),
      companyValueView( State, actor, 1113)
  ], {style: gridColumnsStyle("repeat(2, 1fr)")}) ) )
])

let processesView = State => {


  let companyProcesses = getCompanyProcesses(State.DB, State.Company.entity )


  return d([
    br(),
    d([
      d([
        d("#"),
        entityLabelWithPopup(State, 5692, () => State.Actions.selectedEntity(7492) ),
        d("Varighet"),
        entityLabelWithPopup(State, 46),
      ], {style: gridColumnsStyle("1fr 3fr 1fr 4fr")}),
      d( companyProcesses
        .map( (process, index) => {

          let processType = State.DB.get(process, "process/processType")

          let processEvents = getProcessEvents( State.DB, process )

          let eventPreviewCount = 5

          return d([
            d( String(index+1) ),
            entityLabelWithPopup( State, processType, () => State.Actions.selectEntity( process ) ),
            d( ` ${moment( State.DB.get(processEvents[0], 1757) ).format("D/M") } - ${ moment( State.DB.get(processEvents.slice(-1)[0], 1757) ).format("D/M") } ` ),
            d( processEvents.slice(0,eventPreviewCount)
                .map( event => collapsedEntityLabelWithPopup( State, event ) )
                .concat( span(processEvents.length > eventPreviewCount ? ` + ${processEvents.length - eventPreviewCount} hendelser` : "") ), 
              {style: "display: flex;"} 
              )
        ], {style: gridColumnsStyle("1fr 3fr 1fr 4fr")})
        }   ) )
    ]),

    h3("Opprett ny prosess:"),
    d( State.DB.getAll(5687).map( processType => entityLabelWithPopup(State, processType, e => State.Actions.createProcess(processType, 7407)  )  ) ),
  ])
}

let bankView = State => d([
  d([
    d("Dato"),
    d("Beløp"),
    d("Prosess"),
    d("Transaksjon"),
  ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
  d( State.Company.getAll( 6248, State.S.selectedCompanyDate )
      .map( bankAccount => State.Company.get( bankAccount, 7448, State.S.selectedCompanyDate ) )
      .flat()
      .map( bankTransaction => d([
        d( moment( State.Company.get( bankTransaction, 1757 ) ).format("DD.MM.YYYY")  , {style: `text-align: right;`}),
        companyValueView( State, bankTransaction, 1083 ),
        entityLabelWithPopup( State, State.DB.get( State.DB.get( State.Company.get(bankTransaction, 7543), "event/process"  ), "process/processType"), () => State.Actions.selectEntity( State.Company.get(bankTransaction, 7543) )  ),
        State.DB.get( State.DB.get( State.Company.get(bankTransaction, 7543), "event/process"  ), "process/processType") === 5713
          ? dropdown(0, [
              {value: 0, label: "Opprett prosess"},
              {value: 1, label: "Ny investering"},
              {value: 2, label: "Driftskostnad"},
          ])
          : companyEntityLabelWithPopup( State, bankTransaction )
      ], {style: gridColumnsStyle("repeat(4, 1fr)")}) ) 
    )
])


// Company entity view END -------------------------------------------------------------

let timelineHeaderView = width => d( ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"].map( month => d(month)  ), {style: `width:${width};display:grid;grid-template-columns: repeat(${12}, 1fr);background-color: #8080802b;`} )

let processView = State => {


  let companyProcesses = getCompanyProcesses(State.DB, State.Company.entity)

  let process = State.S.selectedEntity
  let processType = State.DB.get(process, "process/processType")

  let prevProcess = companyProcesses[companyProcesses.findIndex( p => p ===  process ) - 1  ]
  let nextProcess = companyProcesses[companyProcesses.findIndex( p => p ===  process ) + 1  ]



  let processEvents = getProcessEvents( State.DB, process )

  let processEntities = getProcessEntities(State.DB, State.companyDatoms, process)


  return d([
    d([
      isDefined(prevProcess) ? submitButton("<--- forrige prosess", e => State.Actions.selectEntity(  prevProcess ) ) : d(""),
      d(`[ ${companyProcesses.findIndex( p => p ===  process ) + 1} / ${companyProcesses.length} ]`),
      isDefined(nextProcess) ? submitButton("neste prosess --->", e => State.Actions.selectEntity(  nextProcess ) ) : d(""),
      ], {class: "columns_1_1_1"}),
    br(),
    d([
      h3( State.DB.get( process, "entity/label" ) ),
      d([
        d( processEvents.map( event => d([
          d( moment( State.DB.get(event, "event/date") ).format("DD/MM/YYYY")  ),
          entityLabelWithPopup( State, State.DB.get(event, "event/eventTypeEntity"), e => State.Actions.selectEntity(  event )  )
        ], {class: "columns_1_1_1"})  ) ),
        br(),
        d([
          h3("Ny hendelse:"),
          d( State.DB.get( processType, 5926) .map( eventType => entityLabelWithPopup(State, eventType, e => State.Actions.createEvent( eventType, process, Date.now() ) )  ) ),
        ], {class: "feedContainer"})
      ]),
      br(),
      submitButton("Slett prosess", e => State.Actions.retractEntity(process) ),
    ],{class: "feedContainer"}),
    br(),
    d([
      h3("Selskapsdokumenter generert av prosessen:"),
      d( processEntities.map( companyEntity => companyEntityLabelWithPopup( State, companyEntity, e => State.Actions.selectEntity( process, companyEntity ), (companyEntity === State.S.selectedCompanyEntity) ) )),
      br(),
      isDefined( State.S.selectedCompanyEntity ) 
        ? companyEntityView( State, State.S.selectedCompanyEntity ) 
        : d("")
    ], {class: "feedContainer"} ),
    
  ]) 
} 

 


let eventView =  State => {

  let event = State.S.selectedEntity
  let eventType = State.DB.get( event, "event/eventTypeEntity")
  let eventTypeAttributes = State.DB.get( eventType, "eventType/eventAttributes")
  let Event = State.DB.get( event )

  let companyEntity = getCompanyEntityFromEvent( State.companyDatoms, event )

  let process = State.DB.get( event, "event/process" )

  

  let processEvents = getProcessEvents( State.DB, process )

  let prevEvent = processEvents[ processEvents.findIndex( e => e === event ) - 1  ]
  let nextEvent = processEvents[ processEvents.findIndex( e => e === event ) + 1  ]

  return d([
    //submitButton(" <- Tilbake til prosess ", e => State.Actions.selectEntity(  Event.process ) ),
    br(),
    d([
      isDefined(prevEvent) ? submitButton("<--- forrige hendelse", e => State.Actions.selectEntity(  prevEvent ) ) : d(""),
      d(`[ ${processEvents.findIndex( e => e === event ) + 1} / ${processEvents.length} ]`),
      isDefined(nextEvent) ? submitButton("neste hendelse --->", e => State.Actions.selectEntity(  nextEvent ) ) : d(""),
      ], {class: "columns_1_1_1"}),
    br(),
    d([
      h3( Event.label() ),
      br(),
      d( eventTypeAttributes.map( attribute => entityAttributeView(State, event, attribute)  )),
      br(),
      submitButton("Slett hendelse", e => State.Actions.retractEntity(event) ),
    ], {class: "feedContainer"} ),
    br(),
    d([
      h3("Selskapsdokumenter generert av hendelsen:"),

      companyEntityLabelWithPopup( State, companyEntity, e => State.Actions.selectEntity( event, companyEntity ), (companyEntity === State.S.selectedCompanyEntity) ),

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