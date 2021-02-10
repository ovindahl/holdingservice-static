const BalancePage = {
    initial: DB => returnObject({ 
        "BalancePage/selectedNode": undefined,   
        "BalancePage/selectedTransactionIndex": DB.get( 6829, 9817 ).length,
    }),
    Actions: State => returnObject({
        "BalancePage/selectNode": entity => updateState( State, {S: {selectedPage: 7860, "BalancePage/selectedNode": entity}}),
        "BalancePage/selectTransactionIndex": transactionIndex => updateState( State, {S: {"BalancePage/selectedTransactionIndex": transactionIndex}}),
        "BalancePage/retractNode": async node => updateState( State, { DB: await Transactor.retractEntity(State.DB, node), S: {"BalancePage/selectedNode": undefined } } ),
        "BalancePage/createNode": balanceObjectType => State.Actions.postDatoms([
          newDatom( "newEntity", "entity/entityType", 7932 ),
          newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
          newDatom( 'newEntity' , "balanceObject/balanceObjectType", balanceObjectType ), 
          newDatom( 'newEntity' , "entity/label", State.DB.get( balanceObjectType, 6 ) + " uten navn" ), 
      ] ),
    })
  }

let calculatedValueViewWithLabel = (State, entity, calculatedField, transactionIndex) => d([
  entityLabelWithPopup( State, calculatedField ),
  calculatedValueView( State, entity, calculatedField, transactionIndex )
], {style: gridColumnsStyle("1fr 1fr")})


let calculatedValueView = (State, entity, calculatedField, transactionIndex) => d( formatNumber( State.DB.get(entity, calculatedField)( transactionIndex ) ), {style: `text-align: right;`} )

  
  //---
  
  let nodeLabelText = (State, node, onclick) => d([d(State.DB.get(node, 6), {class: "entityLabel", style: `background-color:${State.DB.get( State.DB.get(node, "balanceObject/balanceObjectType"), 20  )};`}, "click", isDefined(onclick) ? onclick : () => State.Actions["BalancePage/selectNode"](node) )], {style:"display: flex;"})
  
  let nodeLabel = (State, node, onclick) => d([
    d([
      nodeLabelText( State, node, onclick ),
      nodePopUp( State, node ),
    ], {class: "popupContainer", style:"display: inline-flex;"})
    ], {style:"display: inline-flex;"} )
  
  let nodePopUp = (State, node) => d([
    nodeLabelText( State, node ),
    br(),
    d(`Entitet: ${node}`)
  ], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;width: 400px;"})
  
  
  
  let undefinedNodeView = State => d([
    h3( State.DB.get(State.DB.get( State.S["BalancePage/selectedNode"], "balanceObject/balanceObjectType" ), 6) ),
    entityAttributeView(State, State.S["BalancePage/selectedNode"], 6, true),
    br(),
    d("Velg type:"),
    br(),
    d( [7537, 7539, 7538].map( balanceSection =>  d([
      h3( State.DB.get(balanceSection, 6) ),
      d( State.DB.getAll(7531)
        .filter( nodeType => State.DB.get( nodeType, 7540 ) === balanceSection )
        .filter( nodeType => nodeType !== 9906 )
        .map( nodeType => entityLabelWithPopup( State, nodeType, () => State.Actions.updateEntity(State.S["BalancePage/selectedNode"], "balanceObject/balanceObjectType", nodeType) ) ) 
        ),
      br()
    ])), {class: "feedContainer"} ),
    submitButton("Slett", e => State.Actions["BalancePage/retractNode"]( State.S["BalancePage/selectedNode"] ) )
  ], {class: "feedContainer"})
  
  
  let balanceObjectsView = State => isDefined( State.S["BalancePage/selectedNode"] ) 
    ? State.DB.get( State.S["BalancePage/selectedNode"] , "balanceObject/balanceObjectType" ) === 9906
      ? undefinedNodeView( State ) 
      : singleBalanceObjectView( State ) 
    : allBalanceObjectsView( State )
  
  let singleBalanceObjectView = State => {
  
    let balanceObject = State.S["BalancePage/selectedNode"]
    let balanceObjectType = State.DB.get( balanceObject, "balanceObject/balanceObjectType" )
  
  
    return d([
      submitButton( " <---- Tilbake ", () => State.Actions["BalancePage/selectNode"]( undefined )  ),
        br(),
        transactionIndexSelectionView( State ),
        br(),
        d([
          h3( State.DB.get(balanceObject, 6) ),
          d([
            entityAttributeView( State, balanceObject, 7934, true ),
            submitButton("X", () => State.Actions.updateEntity(State.S["BalancePage/selectedNode"], "balanceObject/balanceObjectType", 9906) )
          ], {style: gridColumnsStyle("7fr 1fr")}),
          entityAttributeView(State, balanceObject, 6),
          br(),
          d( State.DB.get( balanceObjectType, "companyEntityType/attributes" ).map( attribute => entityAttributeView( State, balanceObject, attribute ) ) ),
          br(),
          d( [10045, 10048, 10049].map( calculatedField => calculatedValueViewWithLabel(State, balanceObject, calculatedField, State.S["BalancePage/selectedTransactionIndex"] ) ) ),
          br(),
      ], {class: "feedContainer"})
  
    ]) 
  } 
  
  let balanceSheetView = (State, currentIndex, previousIndex) => d([
    d([
      d(""),
      d( moment( State.DB.get( getTransactionByIndex(State.DB, State.S.selectedCompany, undefined, currentIndex), 1757  )  ).format("DD.MM.YYYY"), {style: `text-align: right;`} ),
      isDefined(previousIndex) ? d( moment( State.DB.get( getTransactionByIndex(State.DB, State.S.selectedCompany, undefined, previousIndex), 1757  )  ).format("DD.MM.YYYY"), {style: `text-align: right;`} ) : d(""),
    ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
    d([
      entityLabelWithPopup( State, 7537 ),
      d( State.DB.getBalanceObjects().filter( balanceObject => State.DB.get( State.DB.get( balanceObject, "balanceObject/balanceObjectType" ), 7540 ) === 7537 ).map( balanceObject => d([
        entityLabelWithPopup( State, balanceObject ),
        lockedValueView( State, balanceObject,  7433, currentIndex ),
        isDefined( previousIndex) ? lockedValueView( State, balanceObject,  7433, previousIndex ) : d("na.", {style: `text-align: right;`}),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}))),
      d([
        entityLabelWithPopup( State, State.DB.get( 7537, 7748 ) ),
        lockedValueView( State, State.S.selectedCompany, State.DB.get( 7537, 7748 ), currentIndex ),
        isDefined( previousIndex) ? lockedValueView( State, State.S.selectedCompany, State.DB.get( 7537, 7748 ), previousIndex ) : d("na.", {style: `text-align: right;`}),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
    ]),
    br(),
    d([
      entityLabelWithPopup( State, 7539 ),
      d( State.DB.getBalanceObjects().filter( balanceObject => State.DB.get( State.DB.get( balanceObject, "balanceObject/balanceObjectType" ), 7540 ) === 7539 ).map( balanceObject => d([
        entityLabelWithPopup( State, balanceObject ),
        lockedValueView( State, balanceObject,  7433, currentIndex ),
        isDefined( previousIndex) ? lockedValueView( State, balanceObject,  7433, previousIndex ) : d("na.", {style: `text-align: right;`}),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}))),
      d([
        entityLabelWithPopup( State, State.DB.get( 7539, 7748 ) ),
        lockedValueView( State, State.S.selectedCompany, State.DB.get( 7539, 7748 ), currentIndex ),
        isDefined( previousIndex) ? lockedValueView( State, State.S.selectedCompany, State.DB.get( 7539, 7748 ), previousIndex ) : d("na.", {style: `text-align: right;`}),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
    ]),
    br(),
    d([
      entityLabelWithPopup( State, 7538 ),
      d( State.DB.getBalanceObjects().filter( balanceObject => State.DB.get( State.DB.get( balanceObject, "balanceObject/balanceObjectType" ), 7540 ) === 7538 ).map( balanceObject => d([
        entityLabelWithPopup( State, balanceObject ),
        lockedValueView( State, balanceObject,  7433, currentIndex ),
        isDefined( previousIndex) ? lockedValueView( State, balanceObject,  7433, previousIndex ) : d("na.", {style: `text-align: right;`}),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}))),
      d([
        entityLabelWithPopup( State, State.DB.get( 7538, 7748 ) ),
        lockedValueView( State, State.S.selectedCompany, State.DB.get( 7538, 7748 ), currentIndex ),
        isDefined( previousIndex) ? lockedValueView( State, State.S.selectedCompany, State.DB.get( 7538, 7748 ), previousIndex ) : d("na.", {style: `text-align: right;`}),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
      d([
        entityLabelWithPopup( State, 9647 ),
        lockedValueView( State, State.S.selectedCompany, 9647, currentIndex ),
        isDefined( previousIndex) ? lockedValueView( State, State.S.selectedCompany, State.DB.get( 7538, 7748 ), previousIndex ) : d("na.", {style: `text-align: right;`}),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
    ])
  ]) 
  
  let transactionIndexSelectionView = State => d([
    entityLabelWithPopup( State, 7929 ),
    d([
      d([
        State.S["BalancePage/selectedTransactionIndex"] > 1 ? submitButton("[<<]", () => State.Actions["BalancePage/selectTransactionIndex"]( 1 ) ) : d(""),
        State.S["BalancePage/selectedTransactionIndex"] > 1 ? submitButton("<", () => State.Actions["BalancePage/selectTransactionIndex"]( State.S["BalancePage/selectedTransactionIndex"] - 1 ) ) : d(" [ "),
        State.S["BalancePage/selectedTransactionIndex"] < State.DB.get( State.S.selectedCompany, 9817 ).length ? submitButton(">", () => State.Actions["BalancePage/selectTransactionIndex"]( State.S["BalancePage/selectedTransactionIndex"] + 1 ) ) : d(" ] "),
        State.S["BalancePage/selectedTransactionIndex"] < State.DB.get( State.S.selectedCompany, 9817 ).length ? submitButton("[>>]", () => State.Actions["BalancePage/selectTransactionIndex"]( State.DB.get( State.DB.get( State.S.selectedCompany, 9817 ).slice( - 1 )[0], 8354  )  ) ) : d("")
      ], {style: gridColumnsStyle("repeat(8, 1fr)")}),
      transactionLabel( State, State.DB.get( State.S.selectedCompany,  10056 )( State.S["BalancePage/selectedTransactionIndex"] ) ),
      d( moment( State.DB.get( State.DB.get( State.S.selectedCompany,  10056 )( State.S["BalancePage/selectedTransactionIndex"] ), 1757 ) ).format("DD.MM.YYYY")),
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
  ], {class: "feedContainer", style: gridColumnsStyle("1fr 3fr")})
  
  let allBalanceObjectsView = State => {
  
  
    return d([
        h3( State.DB.get(State.S.selectedPage, 6) ),
        transactionIndexSelectionView( State ),
        br(),
        d([
            d( [7537, 7539, 7538].map( balanceSection =>  d([
            d([
                entityLabelWithPopup( State, balanceSection ),
                submitButton("+", () => State.Actions["BalancePage/createNode"]( 8742 ) ),
            ], {style: "display: flex;"}),
            d( State.DB.get(State.S.selectedCompany, 10052)( balanceSection ).map( balanceObject => d([
                nodeLabel(State, balanceObject),
                calculatedValueView(State, balanceObject, 10045, State.S["BalancePage/selectedTransactionIndex"] )
            ], {style: gridColumnsStyle("repeat(4, 1fr)") + "padding-left: 1em;"}))),
            d([
              entityLabelWithPopup( State, 10053 ),
              d( formatNumber( State.DB.get(State.S.selectedCompany, 10053)( balanceSection, State.S["BalancePage/selectedTransactionIndex"] ) ), {style: `text-align: right;`} )
            ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
            br(),
            ]),  ) ),
            br(),
            d([
              entityLabelWithPopup( State, 10053 ),
              d( formatNumber( State.DB.get(State.S.selectedCompany, 10053)( [7539, 7538], State.S["BalancePage/selectedTransactionIndex"] ) ), {style: `text-align: right;`} )
            ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
        ], {class: "feedContainer"})
        ])
  } 