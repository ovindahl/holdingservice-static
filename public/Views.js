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
    "6778": isDefined( State.S.selectedCompanyEntity ) ? companyEntityPageView : multipleCompanyEntitiesView,
    "7487": companyView
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

let getEntityNavBar = State => {

  let selectedEntityType = isDefined( State.DB.get( State.S.selectedEntity, "entity/entityType" ) ) 
    ? State.DB.get( State.S.selectedEntity, "entity/entityType" )
    : 5722

  let entityTypeViewController = {
    "47": () => d([
          entityLabelWithPopup( State, State.S.selectedEntity ),
        ]),
    "5722": () => d(""),
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
    ]),
    "7487": () => d([
      entityLabelWithPopup( State, 7487 ),
      entityLabelWithPopup( State, State.S.selectedEntity ),
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

let dateSelectionView = State => {

  let companyDates = State.Company.events
    .map( event => State.Company.getEvent(event).t )
    .map( date => moment( date ).format("DD/MM/YYYY") )
    .filter( filterUniqueValues )
    .map( date => Number( moment( date, "DD/MM/YYYY" ).format("x") ) )


  return d([
    h3("Datovelger:"),
    d( companyDates.map( date => d([
      span(moment( date ).format("D/M"), moment( date ).format("DD/MM/YYYY"), {style: `${moment( date ).format("DD/MM/YYYY") === moment( State.S.selectedCompanyDate ).format("DD/MM/YYYY") ? "background-color: #46b3fb;color: white;" : "" }`}, "click", 
      () =>  State.Actions.selectCompanyDate( State.Company.getEvent( State.Company.events.filter( event => moment( State.Company.getEvent(event).t ).format("DD/MM/YYYY") === moment( date ).format("DD/MM/YYYY") ).slice(-1)[0] ).t )
      )
    ]) ), {style: gridColumnsStyle(`repeat(${companyDates.length}, 1fr)`) } ),
    //companyDateLabel( State,  State.S.selectedCompanyDate ),
    br(),
  ], {class: "feedContainer"})
} 

let companyDateLabel = State => {

  let allCompanyDates = State.Company.events.map( event => State.Company.getEvent(event).t )
  let selectedCompanyDate = isDefined( State.S.selectedCompanyDate ) ? State.S.selectedCompanyDate : State.Company.t
  let prevEventDate = allCompanyDates.filter( eventTime => eventTime < selectedCompanyDate ).slice(-1)[0]
  let nextEventDate = allCompanyDates.find( eventTime => eventTime > selectedCompanyDate )

  return d([
    isDefined( prevEventDate ) ? span("<<", "", {class: "entityLabel"}, "click", e => State.Actions.selectCompanyDate(  allCompanyDates[0] )) : span(""),
    isDefined( prevEventDate ) ? span("<", "", {class: "entityLabel"}, "click", e => State.Actions.selectCompanyDate(  prevEventDate )) : span(""),
    span( moment( selectedCompanyDate ).format("DD/MM/YYYY"), "", {class: "entityLabel"} ),
    isDefined( nextEventDate ) ? span(">", "", {class: "entityLabel"}, "click", e => State.Actions.selectCompanyDate(  nextEventDate )) : span(""),
    isDefined( nextEventDate ) ? span(">>", "", {class: "entityLabel"}, "click", e => State.Actions.selectCompanyDate(  State.Company.t )) : span(""),
  ], {style:"display: inline-flex;padding: 3px;background-color: #46b3fb;color: white;margin: 5px;"})
} 

// Company entity view   -------------------------------------------------------------

let companyView = State => {

  let CompanyVersion = State.Company.getVersion( State.S.selectedCompanyDate )

  let selectedReport = State.S.selectedEntity


  let reportController = {
    "7488": balanceSheetView,
    "7489": PnLView,
    "7490": generalLedgerView,
    "7491": trialBalanceView,
    "7492": processesView,
    "7493": eventsView,
    "7494": singleDateView,
    "7508": securityTransactionsView,
    "7509": companyTimelineView
  }


  return d([
    d([
      d( State.DB.getAll(7487).map( reportType => entityLabelWithPopup( State, reportType) ) ),
      isDefined( reportController[ selectedReport ]) ? reportController[ selectedReport ]( State ) : d(""),
    ], {class: "feedContainer"}),
    ])
} 

let singleDateView = State => {

  let CompanyVersion = State.Company.getVersion( State.S.selectedCompanyDate )

  let ledgerEntries = CompanyVersion.get(1, 7486).filter( ledgerEntry => moment( State.Company.getEvent( State.Company.get(ledgerEntry.parent).event  ).t ).format("DD/MM/YYYY") ===  moment( State.S.selectedCompanyDate ).format("DD/MM/YYYY")  )

  return d([
    h3(`Hovedbok`),
    d([
      d("Hendelser på valgt dato:"),
      d([ 
        d("Prosess"),
        d("Hendelse"),
        d("Hendelsens output"),
      ], {class: "columns_1_1_1"}),
      d( State.Company.events
          .filter( event => moment( State.Company.getEvent(event).t ).format("DD/MM/YYYY") === moment( State.S.selectedCompanyDate ).format("DD/MM/YYYY") )
          .map( event => d([ 
            entityLabelWithPopup( State, State.DB.get( event, "event/process" )  ),
            entityLabelWithPopup( State, State.DB.get( event, "event/eventTypeEntity" ), e => State.Actions.selectedEntity(event)  ),
            d( State.Company.getEvent( event ) .entities.map( companyEntity => companyEntityLabelWithPopup( State, companyEntity ) ) )
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

let companyTimelineView = State => {



  let companyDates = State.Company.events
    .map( event => State.Company.getEvent(event).t )
    .map( date => moment( date ).format("DD/MM/YYYY") )
    .filter( filterUniqueValues )
    .map( date => Number( moment( date, "DD/MM/YYYY" ).format("x") ) )


  return d([
    h3("Tidslinje:"),
    d( [d([6802, 7047, 7079, 7321, 7434, 7475, 7484]
      .map( transactionType => d([entityLabelWithPopup( State, transactionType )])  ))]
        .concat( companyDates.map( date => d([
          span( moment( date ).format("D/M"), moment( date ).format("DD/MM/YYYY") ),
          d( State.Company.events
            .filter( event => moment( State.Company.getEvent(event).t ).format("DD/MM/YYYY") === moment( date ).format("DD/MM/YYYY") )
            .map( event => d( String(State.Company.getEvent(event).entities[0]) )  )
          )
    ]) )), {style: gridColumnsStyle(`repeat(${companyDates.length + 1}, 1fr)`) } ),
    //companyDateLabel( State,  State.S.selectedCompanyDate ),
    br(),
  ])
}



let balanceSheetView = State => {

  let startTime = Date.now()



  let CompanyVersion = State.Company.getVersion( State.S.selectedCompanyDate )

  log({"gate1": Date.now()-startTime})

  let view = d([
    h3(`Selskapets balanse`),
    d([
      d([
        h3("Eiendeler"),
        d([
          entityLabelWithPopup( State, 6785, e => State.Actions.selectEntity( 6785 )  ),
          d( CompanyVersion.getAll(6785).map( security => d([
            companyEntityLabelWithPopup( State, security),
          d( formatNumber(CompanyVersion.get(security, 7433) ) , {style: `text-align: right;`})
          ], {class: "columns_1_1"})  ) )
        ], {style: gridColumnsStyle("1fr 3fr") }),
        d([
          entityLabelWithPopup( State, 6275 ),
          d( formatNumber(CompanyVersion.get(1, 6275) ) , {style: `text-align: right;`})
        ], {class: "columns_1_1"}),
        br(log({"gate2": Date.now()-startTime})),
        d([
          entityLabelWithPopup( State, 7310 ),
          d(CompanyVersion.getAll(7310).map( bankAccount => d([
            companyEntityLabelWithPopup( State, bankAccount),
            d( formatNumber(CompanyVersion.get(bankAccount, 7466) ) , {style: `text-align: right;`})
          ], {class: "columns_1_1"}) ) )
        ], {style: gridColumnsStyle("1fr 3fr") }),
        d([
          entityLabelWithPopup( State, 6274 ),
          d( formatNumber(CompanyVersion.get(1, 6274) ) , {style: `text-align: right;`})
        ], {class: "columns_1_1"}),
      ], {style: `padding: 1em;`}),
      d([
        h3("Gjeld"),
        d([
          entityLabelWithPopup( State, 6791),
          d(CompanyVersion.getAll(6791).map( loan => d([
            companyEntityLabelWithPopup( State, loan),
            d( formatNumber(CompanyVersion.get(loan, 7458) ) , {style: `text-align: right;`}),
            //d("1000", {style: `text-align: right;`})
          ], {class: "columns_1_1"})  ) )
        ], {style: gridColumnsStyle("1fr 3fr") }),
        d([
          entityLabelWithPopup( State, 6294 ),
          d( formatNumber(CompanyVersion.get(1, 6294) ) , {style: `text-align: right;`})
        ], {class: "columns_1_1"}),
        br(log({"gate3": Date.now()-startTime})),
        h3("Egenkapital"),
        d([
          entityLabelWithPopup( State, 6790 ),
          d(CompanyVersion.getAll(6790).map( actor => d([
            companyEntityLabelWithPopup( State, actor),
            d( formatNumber(CompanyVersion.get(actor, 7455) ) , {style: `text-align: right;`}),
            //d("1000", {style: `text-align: right;`})
          ], {class: "columns_1_1"})  ) )
        ], {style: gridColumnsStyle("1fr 3fr") }),
        d([
          entityLabelWithPopup( State, 6278 ),
          d( formatNumber(CompanyVersion.get(1, 6278) ) , {style: `text-align: right;`})
        ], {class: "columns_1_1"}),
        d([
          entityLabelWithPopup( State, 6281 ),
          d( formatNumber(CompanyVersion.get(1, 6281) ) , {style: `text-align: right;`})
        ], {class: "columns_1_1"}),
        d([
          entityLabelWithPopup( State, 6295 ),
          d( formatNumber(CompanyVersion.get(1, 6295) ) , {style: `text-align: right;`})
        ], {class: "columns_1_1"}),
      ], {style: `padding: 1em;`}),
      d([
        entityLabelWithPopup( State, 6288 ),
        d( formatNumber(CompanyVersion.get(1, 6288) ) , {style: `text-align: right;`})
      ], {class: "columns_1_1",style: `padding: 1em;`}),
      d([
        entityLabelWithPopup( State, 6296 ),
        d( formatNumber(CompanyVersion.get(1, 6296) ) , {style: `text-align: right;`})
      ], {class: "columns_1_1",style: `padding: 1em;`}),
    ], {class: "columns_1_1"}),
    br(log({"gate4": Date.now()-startTime})),
    entityLabelWithPopup( State, 6778 ),
  ])

  console.log(`balanceSheetView finished in ${Date.now() - startTime} ms`)

  return view
} 

let PnLView = State => {

  let CompanyVersion = State.Company.getVersion( State.S.selectedCompanyDate )

  let LatestEvent = State.Company.getEvent( State.Company.events.find( event => State.Company.getEvent(event).t === State.S.selectedCompanyDate ) ) 

  return d([
    h3(`Resultatregnskap`),

    d("Driftsresultat"),
    d( [6233, 6234, 6236].map( calculatedField => d([
      entityLabelWithPopup( State, calculatedField ),
      d( formatNumber( CompanyVersion.get(1, calculatedField) ) , {style: `text-align: right;`})
    ], {class: "columns_1_1"}) ) ),
    br(),
    d("Finansposter"),
    d([

      d( CompanyVersion.getAll(7079).filter( securityTransaction => isNumber( CompanyVersion.get(securityTransaction, 7432) )).map( securityTransaction => d([
        companyEntityLabelWithPopup( State, securityTransaction),
        d( formatNumber( CompanyVersion.get(securityTransaction, 7432) ) , {style: `text-align: right;`})
      ], {class: "columns_1_1"}) ) ),

    ], {style: `padding: 1em`}),
    
    d( [6251, 6244, 6245].map( calculatedField => d([
      entityLabelWithPopup( State, calculatedField ),
      d( formatNumber( CompanyVersion.get(1, calculatedField) ) , {style: `text-align: right;`})
    ], {class: "columns_1_1"}) ) ),
    br(),
    d("Årsresultat"),
    d( [6283, 6267, 6285].map( calculatedField => d([
      entityLabelWithPopup( State, calculatedField ),
      d( formatNumber( CompanyVersion.get(1, calculatedField) ) , {style: `text-align: right;`})
    ], {class: "columns_1_1"}) ) ),
    br(),
    br(),

  ])
} 

let generalLedgerView = State => {

  let CompanyVersion = State.Company.getVersion( State.S.selectedCompanyDate )

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

let securityTransactionsView = State => {

  let CompanyVersion = State.Company.getVersion( State.S.selectedCompanyDate )

  let securityTransactions = CompanyVersion.getAll(7079)

  return d([
    h3(`Alle verdipapirtransaksjoner`),
    d([
      d( "Dato" ),
      d( "Verdipapir" ),
      d( "Antall" ),
      d( "Enhetspris" ),
      d( "Beløp" ),
      d( "Hvorav gevinst/tap" ),
      d( "Ny balanse" ),
    ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr 1fr")}),
    d( securityTransactions.map( securityTransaction => d([
      d( moment( CompanyVersion.get(securityTransaction, 1757) ).format("DD/MM/YYYY"), {style: `text-align: right;`} ),
      companyEntityLabelWithPopup(State, CompanyVersion.get(securityTransaction, 6777)),
      d( formatNumber(CompanyVersion.get(securityTransaction, 7450)), {style: `text-align: right;`} ),
      d( formatNumber(CompanyVersion.get(securityTransaction, 1829)), {style: `text-align: right;`} ),
      d( formatNumber(CompanyVersion.get(securityTransaction, 1083)), {style: `text-align: right;`} ),
      d( CompanyVersion.get(securityTransaction, 7432) ? formatNumber(CompanyVersion.get(securityTransaction, 7432)) : " - ", {style: `text-align: right;`} ),
      d( formatNumber( State.Company.getVersion( CompanyVersion.get(securityTransaction, 1757) ).get( CompanyVersion.get(securityTransaction, 6777), 7433 ) ), {style: `text-align: right;`} ),
    ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr 1fr")}) ) )
  ])
}








let trialBalanceView = State => {

  let CompanyVersion = State.Company.getVersion( State.S.selectedCompanyDate )

  let trialBalances = CompanyVersion.get(1, 6212)

  let categories = trialBalances.map( trialBalance => State.DB.get(trialBalance.account, "entity/category")  ).filter( filterUniqueValues )

  return d([
    h3(`Saldobalanse`),
    d( categories.map( category => d([
      d(category),
      d( trialBalances
          .filter( trialBalance => State.DB.get(trialBalance.account, "entity/category") === category )
          .map( trialBalance => d([
            entityLabelWithPopup(State, trialBalance.account),
            d( formatNumber(trialBalance.amount) )
      ], {style: gridColumnsStyle("1fr 2fr 2fr 1fr")}) ) ),
      d([
        d( "Sum" ),
        d( formatNumber(  log(trialBalances)
          .filter( trialBalance => State.DB.get(trialBalance.account, "entity/category") === category )
          .reduce( (sum, trialBalance) => sum + trialBalance.amount, 0 ) )  )
      ], {style: gridColumnsStyle("1fr 2fr 2fr 1fr")}),
      
    ])  ) )
    
  ])
}

let processesView = State => {


  return d([
    br(),
    d([
      d([
        entityLabelWithPopup(State, 5692, () => State.Actions.selectedEntity(7492) ),
        d("Varighet"),
        entityLabelWithPopup(State, 46),
      ], {style: gridColumnsStyle("3fr 1fr 4fr")}),
      d( State.Company.processes
        .filter( process => State.Company.getProcess(process).startDate <= State.S.selectedCompanyDate )
        .map( (process, index) => {

          let processEvents = State.Company.getProcess(process).events
            .filter( event => State.Company.getEvent(event).t <= State.S.selectedCompanyDate )

          let eventPreviewCount = 5

          return d([
            entityLabelWithPopup( State, process ),
            d( ` ${moment( State.Company.getProcess(process).startDate ).format("D/M") } - ${ moment( State.Company.getProcess(process).endDate ).format("D/M") } ` ),
            d( processEvents.slice(0,eventPreviewCount)
                .map( event => collapsedEntityLabelWithPopup( State, event ) )
                .concat( span(processEvents.length > eventPreviewCount ? ` + ${processEvents.length - eventPreviewCount} hendelser` : "") ), 
              {style: "display: flex;"} 
              )
        ], {style: gridColumnsStyle("3fr 1fr 4fr")})
        }   ) )
    ]),

    h3("Opprett ny prosess:"),
    d( State.DB.getAll(5687).map( processType => entityLabelWithPopup(State, processType, e => State.Actions.createProcess(processType, 7407)  )  ) ),
  ])
}

let eventsView = State => {

  


  return d([
    br(),
    d([
      d([
        d("#"),
        d("Dato"),
        entityLabelWithPopup(State, 46),
        d("Hendelsens output")
      ], {style: gridColumnsStyle("3fr 1fr 4fr")}),
      d( State.Company.events
          .filter( event => State.Company.getEvent(event).t <= State.S.selectedCompanyDate )
          .map( (event, index) => {

            let Event = State.Company.getEvent(event)

            return d([
              d( String(index+1) ),
              d( ` ${moment( State.Company.getEvent(event).t ).format("DD/MM/YYYY") }` ),
              entityLabelWithPopup( State, event ),
              companyEntityLabelWithPopup( State, State.Company.getEvent(event).entities[0] ),
            ], {style: gridColumnsStyle("1fr 1fr 4fr 4fr")})

      }   ) )
    ]),
  ])
}

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
      //timelineHeaderView( "1000px" ),
      //processTimelineView( State,   process ),
      br(),
      d([
        entityLabelWithPopup(State, 46),
        d( Process.events.map( event => d([
          d( moment( State.DB.get(event, "event/date") ).format("DD/MM/YYYY")  ),
          entityLabelWithPopup( State, State.DB.get(event, "event/eventTypeEntity"), e => State.Actions.selectEntity(  event )  )
        ], {class: "columns_1_1_1"})  ) ),
        br(),
        d([
          h3("Ny hendelse:"),
          d( State.DB.get( State.DB.get(process, "process/processType"), 5926) .map( eventType => entityLabelWithPopup(State, eventType, e => State.Actions.createEvent( eventType, process, Date.now() ) )  ) ),
        ], {class: "feedContainer"})
      ]),
      //d(Process.events.map( event => eventTimelineView( State, event)  ) ),
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
            d( State.DB.get( State.Company.get( State.S.selectedCompanyEntity, 6781 ), 6779 ).map( attribute => companyDatomView( State, State.S.selectedCompanyEntity, attribute, State.Company.getEvent( Process.events.slice(-1)[0] ).t ) )),
            br(),
            submitButton("Åpne selskapsdokument", e => State.Actions.selectCompanyEntity(  State.S.selectedCompanyEntity ) )
        ]) 
        : d("")
    ], {class: "feedContainer"} ),
    
  ]) 
} 

 
let companyEntityPageView = State  => d([
  submitButton(" <- Tilbake ", e => State.Actions.selectEntity(  State.Company.entity )  ),
  br(),
  companyEntityView( State, State.S.selectedCompanyEntity, State.S.selectedCompanyDate )
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