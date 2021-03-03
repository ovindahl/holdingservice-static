const BalancePage = {
    entity: 7860,
    onLoad: State => returnObject({selectedEntity: undefined, selectedEventIndex: State.DB.get( State.S.selectedCompany, 12385 ) }),
    Actions: State => returnObject({})
  }


  
let balanceObjectsView = State => isDefined( State.S.selectedEntity ) ? singleAccountView( State ) : trialBalanceView( State )




let trialBalanceView = State => d([
  h3("Saldobalanse"),
  d([
    d( [7537, 7539, 7538, 8788].map( balanceSection =>  d([
      entityLabelWithPopup( State, balanceSection ),
      d( State.DB.get( State.S.selectedCompany, 12380 )()
          .filter( activeNode => State.DB.get( activeNode, 7540) === balanceSection  )
          .sort( (a,b) => Number( State.DB.get( a, 6).slice(0,4) ) - Number( State.DB.get( b, 6).slice(0,4) )  )
          .map( activeNode => d([
            entityLabelWithPopup( State, activeNode ),
            temporalValueView( State, activeNode, 12352, State.S.selectedEventIndex )
          ], {style: gridColumnsStyle("repeat(4, 1fr)")}) 
          )   ),
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


let singleAccountView = State => {






  return d([
    submitButton( " <---- Tilbake ", () => State.Actions.selectEntity( undefined, BalancePage.entity )  ),
    br(),
    d([
      entityLabelWithPopup( State, State.S.selectedEntity ),
      br(),
      temporalEntityAttributeView( State, State.S.selectedEntity, 12352, State.S.selectedEventIndex ),
      temporalEntityAttributeView( State, State.S.selectedEntity, 12829, State.S.selectedEventIndex ),
  ], {class: "feedContainer"}),
    
  ])
}











/* 


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
 */