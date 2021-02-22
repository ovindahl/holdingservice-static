const BalancePage = {
    entity: 7860,
    onLoad: State => returnObject({selectedEntity: undefined, selectedTransactionIndex: State.DB.get( State.S.selectedCompany, 10069 ) }),
    Actions: State => returnObject({
        "BalancePage/selectTransactionIndex": transactionIndex => updateState( State, {S: {selectedTransactionIndex: transactionIndex}}),
    })
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
  
  
  let balanceObjectsView = State => isDefined( State.S.selectedEntity ) 
    ? State.DB.get( State.S.selectedEntity , "entity/entityType" ) === 10617
      ? sharedNodeView( State ) 
      : State.DB.get( State.S.selectedEntity , "balanceObject/balanceObjectType" ) === 9906
        ? undefinedNodeView( State ) 
        : singleBalanceObjectView( State ) 
    :  trialBalanceView( State ) //allBalanceObjectsView( State )
  
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
          calculatedValueViewWithLabel(State, balanceObject, 10045, State.S.selectedTransactionIndex ),
          entityAttributeView(State, balanceObject, 8768, true),
          entityAttributeView(State, balanceObject, 8747, true),
          State.DB.get( balanceObject, "balanceObject/balanceObjectType" ) === 8738
            ? d([
              calculatedValueViewWithLabel(State, balanceObject, 10048, State.S.selectedTransactionIndex ),
              calculatedValueViewWithLabel(State, balanceObject, 10049, State.S.selectedTransactionIndex ),
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
        calculatedValueViewWithLabel(State, balanceObject, 10045, State.S.selectedTransactionIndex ),
        br(),
    ], {class: "feedContainer"})

  ]) 
} 





  let transactionIndexSelectionView = State => d([
    entityLabelWithPopup( State, 7929 ),
    d([
      d([
        State.S.selectedTransactionIndex > 1 ? submitButton("[<<]", () => State.Actions["BalancePage/selectTransactionIndex"]( 1 ) ) : d(""),
        State.S.selectedTransactionIndex > 1 ? submitButton("<", () => State.Actions["BalancePage/selectTransactionIndex"]( State.S.selectedTransactionIndex - 1 ) ) : d(" [ "),
        State.S.selectedTransactionIndex < State.DB.get( State.S.selectedCompany, 9817 ).length ? submitButton(">", () => State.Actions["BalancePage/selectTransactionIndex"]( State.S.selectedTransactionIndex + 1 ) ) : d(" ] "),
        State.S.selectedTransactionIndex < State.DB.get( State.S.selectedCompany, 9817 ).length ? submitButton("[>>]", () => State.Actions["BalancePage/selectTransactionIndex"]( State.DB.get( State.DB.get( State.S.selectedCompany, 9817 ).slice( - 1 )[0], 8354  )  ) ) : d("")
      ], {style: gridColumnsStyle("repeat(8, 1fr)")}),
      transactionLabel( State, State.DB.get( State.S.selectedCompany,  10056 )( State.S.selectedTransactionIndex ) ),
      d( moment( State.DB.get( State.DB.get( State.S.selectedCompany,  10056 )( State.S.selectedTransactionIndex ), 10632 ) ).format("DD.MM.YYYY")),
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
  ], {class: "feedContainer", style: gridColumnsStyle("1fr 3fr")})
  
  let allBalanceObjectsView = State => {
  
  
    return d([
        h3( State.DB.get(State.S.selectedPage, 6) ),
        transactionIndexSelectionView( State ),
        br(),
        d([
          eventActionButton( State, State.S.selectedCompany, 11653),
          eventActionButton( State, State.S.selectedCompany, 11655),
        ], {class: "feedContainer"}),
        br(),
        d([
            d( [7537, 7539, 7538, 8788].map( balanceSection =>  d([
            d([
                entityLabelWithPopup( State, balanceSection )
            ], {style: "display: flex;"}),
            d( State.DB.get(State.S.selectedCompany, 10052)( balanceSection ).map( balanceObject => d([
                entityLabelWithPopup(State, balanceObject),
                calculatedValueView(State, balanceObject, 10045, State.S.selectedTransactionIndex )
            ], {style: gridColumnsStyle("repeat(4, 1fr)") + "padding-left: 1em;"}))),
            br(),
            d([
              d( `${State.DB.get(balanceSection, 6)}, sum` ),
              d( formatNumber( State.DB.get(State.S.selectedCompany, 10053)( balanceSection, State.S.selectedTransactionIndex ) ), {style: `text-align: right;`} )
            ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
            balanceSection === 7538 
              ? d([
                  d( `Egenkapital og gjeld, sum` ),
                  d( formatNumber( State.DB.get(State.S.selectedCompany, 10053)( [7539, 7538], State.S.selectedTransactionIndex ) ), {style: `text-align: right;`} )
              ], {style: gridColumnsStyle("repeat(4, 1fr)")})
              : d(""),
            br(),
            ]),  ) ),
        ], {class: "feedContainer"}),
        ])
  } 








  let trialBalanceView = State => d([
    transactionIndexSelectionView( State ),
    br(),
    entityLabelWithPopup( State, 7537 ),
    d( State.DB.get( State.S.selectedCompany, 12176 )
        .filter( e => State.DB.get(State.DB.get(e, 8747), 7540) === 7537 )
        .sort( (a,b) => Number( State.DB.get( State.DB.get(a, 8747), 6).slice(0,4) ) - Number( State.DB.get( State.DB.get(b, 8747), 6).slice(0,4) )  )
        .map( activeNode => d([
      entityLabelWithPopup( State, State.DB.get(activeNode, 8747) ),
      entityLabelWithPopup( State, activeNode ),
      calculatedValueView(State, activeNode, 10045, State.S.selectedTransactionIndex )
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}) )   ),
    d([
      entityLabelWithPopup( State, 7537 ),
      d(""),
      d( formatNumber( State.DB.get(State.S.selectedCompany, 10053)( 7537, State.S.selectedTransactionIndex ) ), {style: `text-align: right;`} )
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    br(),
    br(),
    entityLabelWithPopup( State, 7539 ),
    d( State.DB.get( State.S.selectedCompany, 12176 )
        .filter( e => State.DB.get(State.DB.get(e, 8747), 7540) === 7539 )
        .sort( (a,b) => Number( State.DB.get( State.DB.get(a, 8747), 6).slice(0,4) ) - Number( State.DB.get( State.DB.get(b, 8747), 6).slice(0,4) )  )
        .map( activeNode => d([
      entityLabelWithPopup( State, State.DB.get(activeNode, 8747) ),
      entityLabelWithPopup( State, activeNode ),
      calculatedValueView(State, activeNode, 10045, State.S.selectedTransactionIndex )
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}) )   ),
    d([
      entityLabelWithPopup( State, 7539 ),
      d(""),
      d( formatNumber( State.DB.get(State.S.selectedCompany, 10053)( 7539, State.S.selectedTransactionIndex ) ), {style: `text-align: right;`} )
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    br(),
    br(),
    entityLabelWithPopup( State, 7538 ),
    d( State.DB.get( State.S.selectedCompany, 12176 )
        .filter( e => State.DB.get(State.DB.get(e, 8747), 7540) === 7538 )
        .sort( (a,b) => Number( State.DB.get( State.DB.get(a, 8747), 6).slice(0,4) ) - Number( State.DB.get( State.DB.get(b, 8747), 6).slice(0,4) )  )
        .map( activeNode => d([
      entityLabelWithPopup( State, State.DB.get(activeNode, 8747) ),
      entityLabelWithPopup( State, activeNode ),
      calculatedValueView(State, activeNode, 10045, State.S.selectedTransactionIndex )
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}) )   ),
    d([
      entityLabelWithPopup( State, 7538 ),
      d(""),
      d( formatNumber( State.DB.get(State.S.selectedCompany, 10053)( 7538, State.S.selectedTransactionIndex ) ), {style: `text-align: right;`} )
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    br(),
    br(),
    entityLabelWithPopup( State, 8788 ),
    d( State.DB.get( State.S.selectedCompany, 12176 )
        .filter( e => State.DB.get(State.DB.get(e, 8747), 7540) === 8788 )
        .sort( (a,b) => Number( State.DB.get( State.DB.get(a, 8747), 6).slice(0,4) ) - Number( State.DB.get( State.DB.get(b, 8747), 6).slice(0,4) )  )
        .map( activeNode => d([
      entityLabelWithPopup( State, State.DB.get(activeNode, 8747) ),
      entityLabelWithPopup( State, activeNode ),
      calculatedValueView(State, activeNode, 10045, State.S.selectedTransactionIndex )
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}) )   ),
    d([
      entityLabelWithPopup( State, 8788 ),
      d(""),
      d( formatNumber( State.DB.get(State.S.selectedCompany, 10053)( 8788, State.S.selectedTransactionIndex ) ), {style: `text-align: right;`} )
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
    br(),
  ]  ) 