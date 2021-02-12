const BalancePage = {
    entity: 7860,
    onLoad: State => returnObject({selectedEntity: undefined, selectedTransactionIndex: State.DB.get( State.S.selectedCompany, 10069 ) }),
    Actions: State => returnObject({
        "BalancePage/selectNode": entity => updateState( State, {S: {selectedPage: 7860, selectedEntity: entity, selectedTransactionIndex: State.DB.get( State.S.selectedCompany, 10069 ) }}),
        "BalancePage/selectTransactionIndex": transactionIndex => updateState( State, {S: {selectedTransactionIndex: transactionIndex}}),
        "BalancePage/retractNode": async node => updateState( State, { DB: await Transactor.retractEntity(State.DB, node), S: {selectedEntity: undefined } } ),
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
  
  let nodeLabelText = (State, node, onclick) => d([d(State.DB.get(node, 6), {class: "entityLabel", style: `background-color:${ State.DB.get(node, "entity/entityType") === 10617 ? "#79554852" : State.DB.get(State.DB.get(node, "balanceObject/balanceObjectType") , 20)};`}, "click", isDefined(onclick) ? onclick : () => State.Actions["BalancePage/selectNode"](node) )], {style:"display: flex;"})
  
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
    submitButton("Slett", e => State.Actions["BalancePage/retractNode"]( State.S.selectedEntity ) )
  ], {class: "feedContainer"})
  
  
  let balanceObjectsView = State => isDefined( State.S.selectedEntity ) 
    ? State.DB.get( State.S.selectedEntity , "entity/entityType" ) === 10617
      ? sharedNodeView( State ) 
      : State.DB.get( State.S.selectedEntity , "balanceObject/balanceObjectType" ) === 9906
        ? undefinedNodeView( State ) 
        : singleBalanceObjectView( State ) 
    : allBalanceObjectsView( State )
  
  let singleBalanceObjectView = State => {
  
    let balanceObject = State.S.selectedEntity
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
            State.DB.get(balanceObject, 11045) ? submitButton("X", () => State.Actions.updateEntity(State.S.selectedEntity, "balanceObject/balanceObjectType", 9906) ) : d("")
          ], {style: gridColumnsStyle("7fr 1fr")}),
          entityAttributeView(State, balanceObject, 6),
          br(),
          d( State.DB.get( balanceObjectType, "companyEntityType/attributes" ).map( attribute => entityAttributeView( State, balanceObject, attribute, !State.DB.get(balanceObject, 11045) ) ) ),
          br(),
          entityAttributeView(State, balanceObject, 8768, true),
          entityAttributeView(State, balanceObject, 8747, true),
          State.DB.get( balanceObject, "balanceObject/balanceObjectType" ) === 8738
            ? d([
              calculatedValueViewWithLabel(State, balanceObject, 10048, State.S.selectedTransactionIndex ),
              calculatedValueViewWithLabel(State, balanceObject, 10049, State.S.selectedTransactionIndex ),
            ])
            : d("")
      ], {class: "feedContainer"})
  
    ]) 
  } 
  

let sharedNodeView = State => {
  
  let balanceObject = State.S.selectedEntity

  return d([
      submitButton( " <---- Tilbake ", () => State.Actions["BalancePage/selectNode"]( undefined )  ),
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
            d( [7537, 7539, 7538, 8788].map( balanceSection =>  d([
            d([
                entityLabelWithPopup( State, balanceSection ),
                submitButton("+", () => State.Actions["BalancePage/createNode"]( 9906 ) ),
            ], {style: "display: flex;"}),
            d( State.DB.get(State.S.selectedCompany, 10052)( balanceSection ).map( balanceObject => d([
                nodeLabel(State, balanceObject),
                calculatedValueView(State, balanceObject, 10045, State.S.selectedTransactionIndex )
            ], {style: gridColumnsStyle("repeat(4, 1fr)") + "padding-left: 1em;"}))),
            br(),
            d([
              d( `${State.DB.get(balanceSection, 6)}, sum` ),
              d( formatNumber( State.DB.get(State.S.selectedCompany, 10053)( balanceSection, State.S.selectedTransactionIndex ) ), {style: `text-align: right;`} )
            ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
            balanceSection === 7538 
              ? d([
                  br(),
                  d( `Egenkapital og gjeld, sum` ),
                  d( formatNumber( State.DB.get(State.S.selectedCompany, 10053)( [7539, 7538], State.S.selectedTransactionIndex ) ), {style: `text-align: right;`} )
              ], {style: gridColumnsStyle("repeat(4, 1fr)")})
              : d(""),
            br(),
            ]),  ) ),
        ], {class: "feedContainer"})
        ])
  } 