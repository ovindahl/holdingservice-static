const BalancePage = {
    entity: 7860,
    onLoad: State => returnObject({selectedEntity: undefined, selectedEventIndex: State.DB.get( State.S.selectedCompany, 12385 ) }),
    Actions: State => returnObject({})
  }


let undefinedNodeView = State => d([
  h3( State.DB.get(State.DB.get( State.S.selectedEntity, "balanceObject/balanceObjectType" ), 6) ),
  entityAttributeView(State, State.S.selectedEntity, 6, true),
  br(),
  d("Velg type:"),
  br(),
  d( [7537, 7539, 7538].map( balanceSection =>  d([
    h3( State.DB.get(balanceSection, 6) ),
    d( State.DB.getAll(7531)
      .filter( nodeType => State.DB.get( nodeType, 7540 ) === balanceSection )
      .filter( nodeType => nodeType !== 9906 )
      .map( nodeType => entityLabelWithPopup( State, nodeType, () => State.Actions.updateEntity(State.S.selectedEntity, "balanceObject/balanceObjectType", nodeType) ) ) 
      ),
    br()
  ])), {class: "feedContainer"} ),
  submitButton("Slett", e => State.Actions.retractEntity( State.S.selectedEntity ) )
], {class: "feedContainer"})
  
  
let balanceObjectsView = State => trialBalanceView( State )

let singleBalanceObjectView = State => {

  let balanceObject = State.S.selectedEntity
  let balanceObjectType = State.DB.get( balanceObject, "balanceObject/balanceObjectType" )


  return d([
    submitButton( " <---- Tilbake ", () => State.Actions.selectEntity( undefined, BalancePage.entity )  ),
      br(),
      transactionIndexSelectionView( State ),
      br(),
      d([
        h3( State.DB.get(balanceObject, 6) ),
        d([
          entityAttributeView( State, balanceObject, 7934, true )
        ], {style: gridColumnsStyle("7fr 1fr")}),
        entityAttributeView(State, balanceObject, 6),
        br(),
        d( State.DB.get( balanceObjectType, "companyEntityType/attributes" ).map( attribute => entityAttributeView( State, balanceObject, attribute, State.DB.get(balanceObject, 11045) ) ) ),
        br(),
        calculatedValueViewWithLabel(State, balanceObject, 10045, State.S.selectedEventIndex ),
        entityAttributeView(State, balanceObject, 8768, true),
        entityAttributeView(State, balanceObject, 8747, true),
        State.DB.get( balanceObject, "balanceObject/balanceObjectType" ) === 8738
          ? d([
            calculatedValueViewWithLabel(State, balanceObject, 10048, State.S.selectedEventIndex ),
            calculatedValueViewWithLabel(State, balanceObject, 10049, State.S.selectedEventIndex ),
          ])
          : d("")
    ], {class: "feedContainer"}),
    br(),
    eventActionButton( State, balanceObject, 11657),

  ]) 
} 
  

let sharedNodeView = State => {
  
  let balanceObject = State.S.selectedEntity

  return d([
      submitButton( " <---- Tilbake ", () => State.Actions.selectEntity( undefined, BalancePage.entity )  ),
      br(),
      transactionIndexSelectionView( State ),
      br(),
      d([
        h3( State.DB.get(balanceObject, 6) ),
        br(),
        entityAttributeView(State, balanceObject, 8768, true),
        entityAttributeView(State, balanceObject, 8747, true),
        calculatedValueViewWithLabel(State, balanceObject, 10045, State.S.selectedEventIndex ),
        br(),
    ], {class: "feedContainer"})

  ]) 
} 





  let transactionIndexSelectionView = State => d([
    entityLabelWithPopup( State, 7929 ),
    d([
      d([
        State.S.selectedEventIndex > 1 ? submitButton("[<<]", () => State.Actions.selectEventIndex( 1 ) ) : d(""),
        State.S.selectedEventIndex > 1 ? submitButton("<", () => State.Actions.selectEventIndex( State.S.selectedEventIndex - 1 ) ) : d(" [ "),
        d( ` ${State.S.selectedEventIndex} / ${State.DB.get( State.S.selectedCompany, 12385 )}` ),
        State.S.selectedEventIndex < State.DB.get( State.S.selectedCompany, 12385 ) ? submitButton(">", () => State.Actions.selectEventIndex( State.S.selectedEventIndex + 1 ) ) : d(" ] "),
        State.S.selectedEventIndex < State.DB.get( State.S.selectedCompany, 12385 ) ? submitButton("[>>]", () => State.Actions.selectEventIndex(State.DB.get( State.S.selectedCompany, 12385 )  ) ) : d("")
      ], {style: gridColumnsStyle("repeat(5, 1fr)")}),
    ], {style: gridColumnsStyle("1fr 1fr")}),
  ], {class: "feedContainer", style: gridColumnsStyle("1fr 3fr")})








  let trialBalanceView = State => d([
    h3("Saldobalanse"),
    transactionIndexSelectionView( State ),
    br(),
    d([
      d( [7537, 7539, 7538, 8788].map( balanceSection =>  d([
        entityLabelWithPopup( State, balanceSection ),
        d( State.DB.get( State.S.selectedCompany, 12380 )()
            .filter( activeNode => State.DB.get(activeNode, 7540) === balanceSection  )
            .sort( (a,b) => Number( State.DB.get( State.DB.get(a, 8747), 6).slice(0,4) ) - Number( State.DB.get( State.DB.get(b, 8747), 6).slice(0,4) )  )
            .map( activeNode => d([
              entityLabelWithPopup( State, activeNode ),
              d( formatNumber( State.DB.get( activeNode, 12352 )( State.S.selectedEventIndex   ) ), {style: `text-align: right;`} ),
            ], {style: gridColumnsStyle("repeat(4, 1fr)")}) )   ),
        d([
          d([
            d("Sum"),
            d( formatNumber( State.DB.get( State.S.selectedCompany, 12380 )().filter( activeNode => State.DB.get(activeNode, 7540) === balanceSection  ).reduce( (sum, node) => sum + State.DB.get( node, 12352 )( State.S.selectedEventIndex   ), 0 ) ), {style: `text-align: right;`} ),
            br(),
          ], {style: gridColumnsStyle("repeat(4, 1fr)")})
          
        ])
      ]),  ) ),
  ], {class: "feedContainer"}),
  ]  ) 


  