//Action button

//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------



// CLIENT PAGE VIEWS


let clientPage = State => {

  if(State.S.isError){return d(State.S.error) }
  if(isUndefined(State.DB)){return d("Laster..") }


  let pageRouter = {
    "7509": progressView,
    "7860": balanceObjectsView,
    "7882": transactionsView,
    "7977": actorsView
  }
  
  return d([
    d([d('<header><h1>Holdingservice Beta</h1></header>'),d([
      d([dropdown(State.S.selectedCompany, State.DB.getAll( 5722 ).map( company => returnObject({value: company, label: State.DB.get(company, "entity/label")  })  ), e => State.Actions.updateCompany( Number( submitInputValue(e) ) ))]),
      submitButton("Bytt til admin", e => State.Actions.toggleAdmin() )
    ], {style: "display:flex;"} ),], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
    d([
      d(""),
      d([
        stateView( State ),
        d([
          d( [7509, 7860, 7882, 7977].map( pageEntity => entityLabelWithPopup( State, Number(pageEntity), () => State.Actions.selectPage(pageEntity) ) ), {class: "feedContainer"} ),
          br(),
          d([pageRouter[ State.S.selectedPage ]( State ) ], {class: "feedContainer"} )
        ])
      ])
    ], {class: "pageContainer"})
    
  ])
}

let stateView = State => {

  let companyTransactions = getAllTransactions( State.DB, State.S.selectedCompany )
  
  return d([
    d([
      h3("Nåværende state:"),
      d([
        entityLabelWithPopup( State, 5722),
        isDefined( State.S.selectedCompany ) ? entityLabelWithPopup( State, State.S.selectedCompany ) : d(" MANGLER "),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")} ),,
      d([
        entityLabelWithPopup( State, 7927),
        isDefined( State.S.selectedPage ) ? entityLabelWithPopup( State, State.S.selectedPage ) : d(" MANGLER "),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")} ),
      d([
        entityLabelWithPopup( State, 7929),
        isDefined( State.S.selectedCompanyEventIndex ) ? d( `${formatNumber( State.S.selectedCompanyEventIndex, 0 )} / ${companyTransactions.length} `) : d(" MANGLER "),
        d([
          submitButton("[<<]", () => State.Actions.selectCompanyEventIndex( 0 ) ),
          State.S.selectedCompanyEventIndex >= 1 ? submitButton("<", () => State.Actions.selectCompanyEventIndex( State.S.selectedCompanyEventIndex - 1 ) ) : d(""),
          State.S.selectedCompanyEventIndex < companyTransactions.length ? submitButton(">", () => State.Actions.selectCompanyEventIndex( State.S.selectedCompanyEventIndex + 1 ) ) : d(""),
          submitButton("[>>]", () => State.Actions.selectCompanyEventIndex( State.Company.get( companyTransactions.slice( - 1 )[0], 7916  )  ) )
        ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
      d([
        entityLabelWithPopup( State, 7928),
        isDefined( State.S.selectedEntity ) ? entityLabelWithPopup( State, State.S.selectedEntity ) : d(" - "),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
      
    ])
  ], {class: "feedContainer"})
} 

//Page views


let progressView = State => d([
  d([
    d("Steg 1:"),
    d("Ferdig"),
  ], {style: gridColumnsStyle("repeat(2, 1fr)")}),
  br(),
  d([
    d("Steg 2:"),
    d("WIP"),
  ], {style: gridColumnsStyle("repeat(2, 1fr)")}),
  br(),
  d([
    d("Steg 3: Kontroller balansen"),
    d( 
      [
        State.DB.get(7537, 7751),
        State.DB.get(7538, 7751),
        State.DB.get(7539, 7751)
      ].flat().map( calculatedField => d([
        entityLabelWithPopup( State, calculatedField),
        d( formatNumber( State.Company.get(null, calculatedField, State.S.selectedCompanyEventIndex ) ) )
      ], {style: gridColumnsStyle("repeat(2, 1fr)")}) )
     )
  ]),
  br(),
  d([
    d("Steg 10: Eksporter rapporter"),
    d( State.DB.getAll( 7914 ) .map( report => entityLabelWithPopup( State, report ) ))
  ])
])

//---

let balanceObjectsView = State => isDefined( State.S.selectedEntity ) ? singleBalanceObjectView( State ) : allBalanceObjectsView( State )

let singleBalanceObjectView = State => {

  let balanceObject = State.S.selectedEntity
  let balanceObjectType = State.DB.get( balanceObject, "balanceObject/balanceObjectType" )


  return isDefined(balanceObjectType)
    ? d([
      submitButton( " <---- Tilbake ", () => State.Actions.selectEntity( undefined )  ),
      br(),
      d([
        entityLabelWithPopup( State, 7860 ),
        span( " / " ),
        entityLabelWithPopup( State, State.DB.get( balanceObjectType, 7540 ) ),
        span( " / " ),
        entityLabelWithPopup( State, balanceObjectType ),
        span( " / " ),
        entityLabelWithPopup( State, balanceObject ),
      ]),
      br(),
      d( State.DB.get( balanceObjectType, "companyEntityType/attributes" ).map( attribute => entityAttributeView(State, balanceObject, attribute) ) ),
      br(),
      d( State.DB.get( balanceObjectType, "companyEntityType/calculatedFields" ).map( calculatedField => companyDatomView( State, balanceObject, calculatedField ) ) ),
      submitButton("Slett", e => State.Actions.retractEntity(balanceObject) ),  
    ])
  : d([
    entityAttributeView(State, balanceObject, 7934),
    submitButton("Slett", e => State.Actions.retractEntity(balanceObject) ),  
  ])
} 


let allBalanceObjectsView = State => {

  let allBalanceObjects = State.Company.getBalanceObjects()

  return d([
    d([7537, 7539, 7538].map( balanceSection =>  d([
      entityLabelWithPopup( State, balanceSection ),
      d( allBalanceObjects.filter( balanceObject => State.DB.get( State.DB.get( balanceObject, "balanceObject/balanceObjectType" ), 7540 ) === balanceSection ).map( balanceObject => d([
        entityLabelWithPopup( State, balanceObject ),
        d( formatNumber( State.Company.get( balanceObject, 7433, State.S.selectedCompanyEventIndex  ) ), {style: `text-align: right;`} ),
        submitButton("X", e => State.Actions.retractEntity(balanceObject) )
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}))),
      d([
        entityLabelWithPopup( State, State.DB.get( balanceSection, 7748 ) ),
        d( formatNumber( State.Company.get( null, State.DB.get( balanceSection, 7748 ), State.S.selectedCompanyEventIndex  ) ), {style: `text-align: right;`} )        
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
      br(),
    ]),  ) ),
    
    
    
    br(),
    submitButton("Legg til", () => State.Actions.createBalanceObject() ),
    br(),
    ])
} 


//---

let transactionsView = State => isDefined( State.S.selectedEntity ) ? singleTransactionView( State ) : allTransactionsView( State )

let singleTransactionView = State => isDefined( State.DB.get( State.S.selectedEntity, "transaction/transactionType" ) )
 ? definedTransactionView( State )
 : undefinedTransactionView( State )

 


let definedTransactionView = State => {

  let transactionEntity = State.S.selectedEntity
  let transactionType = State.DB.get( transactionEntity, "transaction/transactionType" )


  let companyTransactions = getAllTransactions(State.DB, State.S.selectedCompany )

  let prevTransaction = companyTransactions[ companyTransactions.findIndex( t => t === transactionEntity ) - 1 ]
  let nextTransaction = companyTransactions[ companyTransactions.findIndex( t => t === transactionEntity ) + 1 ]

  //Attrs

  let inputAttributes = State.DB.get( transactionType, "transactionType/inputAttributes" )
  let outputAttributes = State.DB.get( transactionType, "transactionType/outputAttributes" ).filter( datomConstructor => datomConstructor.isEnabled ).map( datomConstructor => datomConstructor.attribute )

  let inputOnlyAttributes = inputAttributes.filter( attr =>  !outputAttributes.includes(attr) )

  let outputOnlyAttributes = outputAttributes.filter( attr =>  !inputAttributes.includes(attr) )

  let passThroughAttributes = outputAttributes.filter( attr =>  inputAttributes.includes(attr) )

  return d([
    submitButton( " <---- Tilbake ", () => State.Actions.selectEntity( undefined )  ),
    br(),
    d([
      d([
        entityLabelWithPopup( State, 7882 ),
        span( " / " ),
        entityLabelWithPopup( State, transactionType ),
        span( " / " ),
        entityLabelWithPopup( State, transactionEntity ),
      ], {style: "display: inline-flex;"}),
      d([
        isDefined( prevTransaction ) >= 1 ? submitButton("<", () => State.Actions.selectEntity( prevTransaction ) ) : d(""),
        isDefined( nextTransaction ) < companyTransactions.length ? submitButton(">", () => State.Actions.selectEntity( nextTransaction ) ) : d(""),
      ], {style: gridColumnsStyle("3fr 1fr")})
    ], {style: gridColumnsStyle("3fr 1fr")}),
    br(),
    br(),
    transactionFlowView( State, transactionEntity ),
    br(),
    d( inputOnlyAttributes.map( attribute => entityAttributeView( State, transactionEntity, attribute ) ) ),
    br(),
    d( passThroughAttributes.map( attribute => entityAttributeView( State, transactionEntity, attribute ) ) ),
    br(),
    d( outputOnlyAttributes.map( attribute => companyDatomView(State, transactionEntity, attribute, State.S.selectedCompanyEventIndex)  ) ),
    br(),
    submitButton("Slett", e => State.Actions.retractEntity(transactionEntity) ),  
  ])
} 

let undefinedTransactionView = State => d([
  entityAttributeView(State, State.S.selectedEntity, 7935),
  submitButton("Slett", e => State.Actions.retractEntity(State.S.selectedEntity) ),  
])


let transactionFlowView = (State, transactionEntity) => d([
  d([
    d(formatNumber( State.Company.get(State.Company.get(transactionEntity, 7867), 7433, State.Company.get( transactionEntity, 7916, State.S.selectedCompanyEventIndex ) - 1 ) ), {class: "redlineText"}),
    d(formatNumber( State.Company.get(State.Company.get(transactionEntity, 7867), 7433, State.Company.get( transactionEntity, 7916, State.S.selectedCompanyEventIndex ) ) ) ),
    entityLabelWithPopup(State, State.Company.get(transactionEntity, 7867 ) ),
  ] ),
  d([
    d(""),
    d([
      d( moment( State.Company.get( transactionEntity, 1757, State.S.selectedCompanyEventIndex ) ).format("DD.MM.YYYY") ),
      entityLabelWithPopup(State, transactionEntity ),
      d(formatNumber( State.Company.get(transactionEntity, 1083, State.S.selectedCompanyEventIndex ) )),
      d(" --------------> "),
    ]),
    d(""),
  ], {style: gridColumnsStyle("3fr 2fr 3fr")}),
  d([
    d(formatNumber( State.Company.get(State.Company.get(transactionEntity, 7866), 7433, State.Company.get( transactionEntity, 7916, State.S.selectedCompanyEventIndex ) - 1 ) ), {class: "redlineText"}),
    d(formatNumber( State.Company.get(State.Company.get(transactionEntity, 7866), 7433, State.Company.get( transactionEntity, 7916, State.S.selectedCompanyEventIndex ) ) )),
    entityLabelWithPopup(State, State.Company.get(transactionEntity, 7866 ) ),
  ] )
], {class: "feedContainer", style: gridColumnsStyle("1fr 3fr 1fr")})



let allTransactionsView = State => {

  let alltransactions = getAllTransactions( State.DB, State.S.selectedCompany )

  return d([
    d([
      entityLabelWithPopup( State, 7948 ),
      entityLabelWithPopup( State, 7935 ),
      entityLabelWithPopup( State, 1757 ),
      entityLabelWithPopup( State, 1083 ),
    ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 3fr 1fr")}),
    d([
      d( alltransactions.map( companyTransaction => d([
        entityLabelWithPopup(State, companyTransaction ),
        entityLabelWithPopup(State, State.DB.get( companyTransaction, 7935 ) ),
        d( moment( State.DB.get( companyTransaction, 1757 ) ).format("DD.MM.YYYY") , {style: `text-align: right;`}),
        d( formatNumber( State.Company.get( companyTransaction, 1083 ) ) , {style: `text-align: right;`}),
        d([
          entityLabelWithPopup(State, State.Company.get(companyTransaction, 7867, State.S.selectedCompanyEventIndex) ),
          d(" --> "),
          entityLabelWithPopup(State, State.Company.get(companyTransaction, 7866, State.S.selectedCompanyEventIndex) ),
        ], {style: gridColumnsStyle("3fr 1fr 3fr") + "padding-left: 3em;"} ),
        submitButton("X", e => State.Actions.retractEntity(companyTransaction) )
      ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 3fr 1fr")})  ) ),
    ]),
    br(),
    submitButton("Legg til", () => State.Actions.createTransaction() ),
    br(),
    d([
      d("Importer fra:"),
      entityLabelWithPopup( State, 7313),
      input({type: "file", style: `text-align: right;`}, "change", e => Papa.parse(e.srcElement.files[0], {header: false, complete: async results => {
        let transactionRows = results.data.filter( row => row.length > 1 ).slice(5, results.data.length-1)

        let datoms = transactionRows.map( transactionRow => constructTransactionRowDatoms(State, transactionRow)  ).flat()            
        log({datoms})

        State.Actions.importBankDatoms(datoms)

        } }) ),
    ]),
  ])
} 

let parseDNBamount = stringAmount => Number( stringAmount.replaceAll(".", "").replaceAll(",", ".") ) 


let constructTransactionRowDatoms = ( State, transactionRow) => {

  let date = Number( moment( transactionRow[0], "DD.MM.YYYY" ).format("x") )
  let description = `${transactionRow[2]}: ${transactionRow[1]}`

  let paidAmount = transactionRow[5] === ""
    ? undefined
    : parseDNBamount( transactionRow[5] ) 

  let receivedAmount = transactionRow[6] === ""
  ? undefined
  :parseDNBamount( transactionRow[6] ) 

  let isPayment = isNumber( paidAmount )

  let amount = isPayment ? -paidAmount : receivedAmount

  let referenceNumber = transactionRow[7]

  let transactionDatoms = [
    newDatom( referenceNumber, "entity/entityType", 7948  ),
    newDatom( referenceNumber, "event/company", State.S.selectedCompany  ),
    newDatom( referenceNumber, "transaction/transactionType", isPayment ? 7961 : 7962 ),
    newDatom( referenceNumber, "event/date", date  ),
    newDatom( referenceNumber, "attr/1609744480269", 7313),
    newDatom( referenceNumber, "eventAttribute/1083", amount  ),
    newDatom( referenceNumber, "eventAttribute/1139", description  ),
    newDatom( referenceNumber, "bankTransaction/referenceNumber", referenceNumber  ),
  ]

  return transactionDatoms

}

//----

let actorsView = State => isDefined( State.S.selectedEntity ) ? singleActorView( State ) : allActorsView( State )

let allActorsView = State => {

  let allActors = State.DB.getAll(7979) //.filter( e => State.DB.get(e, 7535) === 6790 )

  return d([
    d([
      entityLabelWithPopup( State, 1113 ),
    ], {style: gridColumnsStyle("3fr 1fr")}),
    d( allActors.map( actor => d([
      entityLabelWithPopup( State, actor ),
      submitButton("X", e => State.Actions.retractEntity(actor) )
    ], {style: gridColumnsStyle("3fr 1fr")}) )),
  br(),
  submitButton("Legg til", () => State.Actions.createCompanyDocument() ),
  br(),
  ]) 
} 

let singleActorView = State => {

  let actor = State.S.selectedEntity
  

  return isDefined(actor)
    ? d([
      submitButton( " <---- Tilbake ", () => State.Actions.selectEntity( undefined )  ),
      br(),
      d([
        entityLabelWithPopup( State, 7977 ),
        span( " / " ),
        entityLabelWithPopup( State, 6790 ),
        span( " / " ),
        entityLabelWithPopup( State, actor ),
      ]),
      br(),
      d( State.DB.get( 6790, "companyEntityType/attributes" ).map( attribute => entityAttributeView(State, actor, attribute ) ) ),
      submitButton("Slett", e => State.Actions.retractEntity(actor) ),  
    ])
  : d([
    entityAttributeView(State, actor, 7535),
    submitButton("Slett", e => State.Actions.retractEntity(actor) ),  
  ])
} 


// Company entity view END -------------------------------------------------------------


// ADMIN PAGE VIEWS

let adminPage = State => d([
  d([d('<header><h1>Holdingservice Admin</h1></header>'),d([submitButton("Bytt til klient", e => State.Actions.toggleAdmin() )], {style: "display:flex;"} )], {style: "padding-left:3em; display:flex; justify-content: space-between;"}),
  d([
    adminEntityLabelWithPopup( State,  47 ),
    span(" / "  ),
    isDefined(State.S.selectedEntity)
      ? adminEntityLabelWithPopup( State, State.DB.get(State.S.selectedEntity, "entity/entityType")   )
      : span(" ... "),
    span(" / "  ),
    isDefined(State.S.selectedEntity)
      ? adminEntityLabelWithPopup( State,  State.S.selectedEntity )
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
  adminEntityLabelWithPopup( State, entityType),
  d(State.DB.getAll( entityType   ).map( entity =>State.DB.get(entity, "entity/category" ) ).filter(filterUniqueValues).sort( ( a , b ) => ('' + a).localeCompare(b) ).map( category => d([
    h3(category),
    d(State.DB.getAll(entityType).filter( e => State.DB.get(e, "entity/category") === category ).map( entity => adminEntityLabelWithPopup( State, entity ) ) ),
  ])  ) )
],{class: "feedContainer"})


//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------

