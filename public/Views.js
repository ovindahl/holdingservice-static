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
    "47": State.S.selectedEntity === 6778 ? companyEntitiesPageView : companyView,
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

let dateSelectionView = State => {
  let companyEvents = getCompanyEvents(State.DB, State.Company.entity)

  let uniqueCompanyDates = companyEvents.map( event => moment( State.DB.get(event, 1757) ).format("DD/MM/YYYY") ).filter(filterUniqueValues)
  
  

  return d([
    h3("Datovelger:"),
    d( uniqueCompanyDates.map( date => span(date , "", {style: date === moment( State.S.selectedCompanyDate ).format("DD/MM/YYYY")  ? "color:blue;" : "" }, "click", () => {
      let dateEvents = companyEvents.filter( event => moment( State.DB.get(event, 1757) ).format("DD/MM/YYYY") === date )

      let selectedDate = State.DB.get( dateEvents.slice(-1)[0] ,  1757)

      State.Actions.selectCompanyDate( selectedDate )

    }, {style: gridColumnsStyle(`repeat(${uniqueCompanyDates.length}, 1fr)`) } ) )),
    br(),
  ], {class: "feedContainer"})
} 


// Company entity view   -------------------------------------------------------------

let companyView = State => {


  let selectedReport = State.S.selectedEntity


  let reportController = {
    "7488": balanceSheetView,
    "7490": generalLedgerView,
    "7492": processesView,
    "7493": eventsView,
    //"7494": singleDateView,
  }


  return d([
    d([
      d( Object.keys(reportController).map( reportType => entityLabelWithPopup( State, Number(reportType) ) ) ),
      isDefined( reportController[ selectedReport ]) ? reportController[ selectedReport ]( State ) : d(""),
    ], {class: "feedContainer"}),
    ])
} 

let singleDateView = State => {

  let CompanyVersion = State.Company

  let ledgerEntries = CompanyVersion.get(1, 7486).filter( ledgerEntry => moment( State.DB.get( State.Company.get(ledgerEntry.parent).event  ).t ).format("DD/MM/YYYY") ===  moment( State.S.selectedCompanyDate ).format("DD/MM/YYYY")  )

  return d([
    h3(`Hovedbok`),
    d([
      d("Hendelser på valgt dato:"),
      d([ 
        d("Prosess"),
        d("Hendelse"),
        d("Hendelsens output"),
      ], {class: "columns_1_1_1"}),
      d( getCompanyEvents( State.DB, State.Company.entity )
          .filter( event => moment( State.DB.get(event, 1757) ).format("DD/MM/YYYY") === moment( State.S.selectedCompanyDate ).format("DD/MM/YYYY") )
          .map( event => d([ 
            entityLabelWithPopup( State, State.DB.get( event, "event/process" )  ),
            entityLabelWithPopup( State, State.DB.get( event, "event/eventTypeEntity" ), e => State.Actions.selectedEntity(event)  ),
            d( State.DB.get( event ) .entities.map( companyEntity => companyEntityLabelWithPopup( State, companyEntity ) ) )
          ], {class: "columns_1_1_1"}) ) )
    ]),
    h3(`Hovedbokstransaksjoner`),
    d([
      d( "Dato" ),
      d( "Transaksjon" ),
      d( "Konto" ),
      d( "Beløp" ),
    ], {style: gridColumnsStyle("1fr 2fr 2fr 1fr")}),
    d( ledgerEntries.map( ledgerEntry => d([
      d( moment( CompanyVersion.get(ledgerEntry.parent, 1757) ).format("DD/MM/YYYY") ),
      companyEntityLabelWithPopup(State, ledgerEntry.parent),
      entityLabelWithPopup(State, ledgerEntry.account),
      d( formatNumber(ledgerEntry.amount) )
    ], {style: gridColumnsStyle("1fr 2fr 2fr 1fr")}) ) )
  ])
}

let balanceSheetView = State => {

  let startTime = Date.now()



  let view = d([
    h3(`Selskapets balanse`),
    d([
      d([
        h3("Eiendeler"),
        d([
          entityLabelWithPopup( State, 6785, e => State.Actions.selectEntity( 6785 )  ),
          d( State.Company.getAll( 6785, State.S.selectedCompanyDate ).map( security => d([
            companyEntityLabelWithPopup( State, security),
          d( formatNumber(State.Company.get(security, 7433, State.S.selectedCompanyDate) ) , {style: `text-align: right;`})
          ], {class: "columns_1_1"})  ) )
        ], {style: gridColumnsStyle("1fr 3fr") }),
        d([
          entityLabelWithPopup( State, 6275 ),
          d( formatNumber(State.Company.get(null, 6275, State.S.selectedCompanyDate )) , {style: `text-align: right;`})
        ], {class: "columns_1_1"}),
        br(),
        d([
          entityLabelWithPopup( State, 7310 ),
          d(State.Company.getAll(7310).map( bankAccount => d([
            companyEntityLabelWithPopup( State, bankAccount),
            d( formatNumber(State.Company.get(bankAccount, 7433, State.S.selectedCompanyDate) ) , {style: `text-align: right;`})
          ], {class: "columns_1_1"}) ) )
        ], {style: gridColumnsStyle("1fr 3fr") }),
        d([
          entityLabelWithPopup( State, 6274 ),
          d( formatNumber(State.Company.get(null, 6274, State.S.selectedCompanyDate) ) , {style: `text-align: right;`})
        ], {class: "columns_1_1"}),
      ], {style: `padding: 1em;`}),
      d([
        h3("Gjeld"),
        d([
          entityLabelWithPopup( State, 6791),
          d(State.Company.getAll(6791, State.S.selectedCompanyDate).map( loan => d([
            companyEntityLabelWithPopup( State, loan),
            d( formatNumber(State.Company.get(loan, 7433, State.S.selectedCompanyDate) ) , {style: `text-align: right;`}),
            //d("1000", {style: `text-align: right;`})
          ], {class: "columns_1_1"})  ) )
        ], {style: gridColumnsStyle("1fr 3fr") }),
        d([
          entityLabelWithPopup( State, 6294 ),
          d( formatNumber(State.Company.get(null, 6294, State.S.selectedCompanyDate) ) , {style: `text-align: right;`})
        ], {class: "columns_1_1"}),
        br(),
        h3("Egenkapital"),
        d([
          entityLabelWithPopup( State, 6790 ),
          d(State.Company.getAll(6790, State.S.selectedCompanyDate).map( actor => d([
            companyEntityLabelWithPopup( State, actor),
            d( formatNumber(State.Company.get(actor, 7433, State.S.selectedCompanyDate) ) , {style: `text-align: right;`}),
            //d("1000", {style: `text-align: right;`})
          ], {class: "columns_1_1"})  ) )
        ], {style: gridColumnsStyle("1fr 3fr") }),
        d([
          entityLabelWithPopup( State, 6278 ),
          d( formatNumber(State.Company.get(null, 6278, State.S.selectedCompanyDate) ) , {style: `text-align: right;`})
        ], {class: "columns_1_1"}),
        d([
          entityLabelWithPopup( State, 7507 ),
          d(State.Company.getAll(7507, State.S.selectedCompanyDate).map( companyAccountingYear => d([
            companyEntityLabelWithPopup( State, companyAccountingYear ),
            d( formatNumber( State.Company.get(companyAccountingYear, 7433, State.S.selectedCompanyDate) ) , {style: `text-align: right;`}),
            //d("1000", {style: `text-align: right;`})
          ], {class: "columns_1_1"})  ) )
        ], {style: gridColumnsStyle("1fr 3fr") }),
        d([
          entityLabelWithPopup( State, 6281 ),
          d( formatNumber(State.Company.get(null, 6281, State.S.selectedCompanyDate) ) , {style: `text-align: right;`})
        ], {class: "columns_1_1"}),
        d([
          entityLabelWithPopup( State, 6295 ),
          d( formatNumber(State.Company.get(null, 6295, State.S.selectedCompanyDate) ) , {style: `text-align: right;`})
        ], {class: "columns_1_1"}),
      ], {style: `padding: 1em;`}),
      d([
        entityLabelWithPopup( State, 6288 ),
        d( formatNumber(State.Company.get(null, 6288, State.S.selectedCompanyDate) ) , {style: `text-align: right;`})
      ], {class: "columns_1_1",style: `padding: 1em;`}),
      d([
        entityLabelWithPopup( State, 6296 ),
        d( formatNumber(State.Company.get(null, 6296, State.S.selectedCompanyDate) ) , {style: `text-align: right;`})
      ], {class: "columns_1_1",style: `padding: 1em;`}),
    ], {class: "columns_1_1"}),
    br(),
    entityLabelWithPopup( State, 6778 ),
  ])

  console.log(`balanceSheetView finished in ${Date.now() - startTime} ms`)

  return view
} 


let generalLedgerView = State => {

  let CompanyVersion = State.Company

  let ledgerEntries = CompanyVersion.get(1, 7486)

  return d([
    h3(`Hovedbok`),
    d([
      d( "Dato" ),
      d( "Transaksjon" ),
      d( "Konto" ),
      d( "Beløp" ),
    ], {style: gridColumnsStyle("1fr 2fr 2fr 1fr")}),
    d( ledgerEntries.map( ledgerEntry => d([
      d( moment( CompanyVersion.get(ledgerEntry.parent, 1757) ).format("DD/MM/YYYY") ),
      companyEntityLabelWithPopup(State, ledgerEntry.parent),
      entityLabelWithPopup(State, ledgerEntry.account),
      d( formatNumber(ledgerEntry.amount) )
    ], {style: gridColumnsStyle("1fr 2fr 2fr 1fr")}) ) )
  ])
}


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

let eventsView = State => {

  
  let companyEvents = getCompanyEvents( State.DB, State.Company.entity )

  return d([
    br(),
    d([
      d([
        d("#"),
        d("Dato"),
        entityLabelWithPopup(State, 46),
        d("Hendelsens output")
      ], {style: gridColumnsStyle("3fr 1fr 4fr")}),
      d( companyEvents
          .map( (event, index) => {

            let eventType = State.DB.get(event, "event/eventTypeEntity")

            return d([
              d( String(index+1) ),
              d( ` ${moment( State.DB.get(event, 1757) ).format("DD/MM/YYYY") }` ),
              entityLabelWithPopup( State, eventType, () => State.Actions.selectEntity( event ) ),
              companyEntityLabelWithPopup( State, getCompanyEntityFromEvent( State.companyDatoms, event )  ),
            ], {style: gridColumnsStyle("1fr 1fr 4fr 4fr")})

      }   ) )
    ]),
  ])
}

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