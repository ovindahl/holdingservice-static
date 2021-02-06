const BalancePage = {
    initial: DB => returnObject({ 
        "BalancePage/selectedNode": undefined,   
        "BalancePage/selectedTransactionIndex": DB.get( 6829, 9817 ).length,
    }),
    Actions: State => returnObject({
        "BalancePage/selectNode": entity => updateState( State, {S: {selectedPage: 7860, "BalancePage/selectedNode": entity}}),
        "BalancePage/selectTransactionIndex": transactionIndex => updateState( State, {S: {"BalancePage/selectedTransactionIndex": transactionIndex}}),
        "BalancePage/retractNode": async node => updateState( State, { DB: await Transactor.retractEntity(State.DB, node), S: {"BalancePage/selectedNode": undefined } } ),
        "BalancePage/createNode": async actor => updateState( State, {DB: await Transactor.createEntity(State.DB, 7932, [
          newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
          newDatom( 'newEntity' , 'balanceObject/balanceObjectType', balanceObjectType ),
          newDatom( 'newEntity' , "entity/label", State.DB.get( balanceObjectType, 6 ) + " uten navn" ), 
      ] )} ),
    })
  }

let calculatedValueViewWithLabel = (State, entity, calculatedField, transactionIndex) => d([
  entityLabelWithPopup( State, calculatedField ),
  calculatedValueView( State, entity, calculatedField, transactionIndex )
], {style: gridColumnsStyle("1fr 1fr")})

let combinedBalanceViewWithLabel = (State, entity, queryObject, transactionIndex) => d([
  entityLabelWithPopup( State, 10053 ),
  d( formatNumber( State.DB.get(entity, 10053)( queryObject, transactionIndex ) ), {style: `text-align: right;`} )
], {style: gridColumnsStyle("1fr 1fr")})



let calculatedValueView = (State, entity, calculatedField, transactionIndex) => d( formatNumber( State.DB.get(entity, calculatedField)( transactionIndex ) ), {style: `text-align: right;`} )

let nodeBalanceView = (State, nodeType, transactionIndex) => d([
    entityLabelWithPopup( State, nodeType),
    d(formatNumber( State.Company.getBalanceObjects(nodeType).reduce( (sum, node) => sum + State.Company.get(node, 7433, transactionIndex), 0 )   ), {style: `text-align: right;`} )
  ], {style: gridColumnsStyle("1fr 1fr")})
  
  
  //---
  
  let nodeLabelText = (State, node, onclick) => d([d(State.Company.get(node, 6), {class: "entityLabel", style: `background-color:${State.DB.get( State.DB.get(node, "balanceObject/balanceObjectType"), 20  )};`}, "click", isDefined(onclick) ? onclick : () => State.Actions["BalancePage/selectNode"](node) )], {style:"display: flex;"})
  
  
  let nodeLabel = (State, node, transactionIndex, onclick) => d([
    d([
      nodeLabelText( State, node, onclick ),
      nodePopUp( State, node, transactionIndex ),
    ], {class: "popupContainer", style:"display: inline-flex;"})
    ], {style:"display: inline-flex;"} )
  
  
  
    let nodePopUp = (State, node, transactionIndex) => d([
      d([
        nodeLabelText( State, node ),
        companyValueView( State, node, 7934 ),
      ], {style: gridColumnsStyle("1fr 1fr")}),
      companyDatomView( State, node, 8747 ),
      br(),
      companyDatomView( State, node, 7433 ),
    ], {class: "entityInspectorPopup", style: "padding:1em; margin-left:1em; background-color: white;border: solid 1px lightgray;width: 400px;"})
  
  
  
  let undefinedNodeView = State => d([
    h3( State.DB.get(State.DB.get( State.S["BalancePage/selectedNode"], "balanceObject/balanceObjectType" ), 6) ),
    entityAttributeView(State, State.S["BalancePage/selectedNode"], 6),
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
  
    let isLocked = isUndefined( State.Company.get(balanceObject, 7885) )
      ? false
      : State.Company.get(balanceObject, 7885).length > 0 || State.Company.get(balanceObject, 7884).length > 0
  
    return d([
      submitButton( " <---- Tilbake ", () => State.Actions["BalancePage/selectNode"]( undefined )  ),
        br(),
        transactionIndexSelectionView( State ),
        br(),
        d([
          h3( State.DB.get(balanceObject, 6) ),
          d([
            companyDatomView( State, balanceObject, 7934 ),
            isLocked ? d("") : submitButton("X", () => State.Actions.updateEntity(State.S["BalancePage/selectedNode"], "balanceObject/balanceObjectType", 9906) )
          ], {style: gridColumnsStyle("7fr 1fr")}),
          entityAttributeView(State, balanceObject, 6),
          br(),
          d( State.DB.get( balanceObjectType, "companyEntityType/attributes" ).map( attribute => isLocked ? companyDatomView( State, balanceObject, attribute ) : entityAttributeView( State, balanceObject, attribute ) ) ),
          br(),
          d( [10045, 10048, 10049].map( calculatedField => calculatedValueViewWithLabel(State, balanceObject, calculatedField, State.S["BalancePage/selectedTransactionIndex"] ) ) ),
          br(),
      ], {class: "feedContainer"})
  
    ]) 
  } 
  
  let balanceSheetView = (State, currentIndex, previousIndex) => d([
    d([
      d(""),
      d( moment( State.Company.get( getTransactionByIndex(State.DB, State.S.selectedCompany, State.S.companyDatoms, currentIndex), 1757  )  ).format("DD.MM.YYYY"), {style: `text-align: right;`} ),
      isDefined(previousIndex) ? d( moment( State.Company.get( getTransactionByIndex(State.DB, State.S.selectedCompany, State.S.companyDatoms, previousIndex), 1757  )  ).format("DD.MM.YYYY"), {style: `text-align: right;`} ) : d(""),
    ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
    d([
      entityLabelWithPopup( State, 7537 ),
      d( State.Company.getBalanceObjects().filter( balanceObject => State.DB.get( State.DB.get( balanceObject, "balanceObject/balanceObjectType" ), 7540 ) === 7537 ).map( balanceObject => d([
        entityLabelWithPopup( State, balanceObject ),
        companyValueView( State, balanceObject,  7433, currentIndex ),
        isDefined( previousIndex) ? companyValueView( State, balanceObject,  7433, previousIndex ) : d("na.", {style: `text-align: right;`}),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}))),
      d([
        entityLabelWithPopup( State, State.DB.get( 7537, 7748 ) ),
        companyValueView( State, State.S.selectedCompany, State.DB.get( 7537, 7748 ), currentIndex ),
        isDefined( previousIndex) ? companyValueView( State, State.S.selectedCompany, State.DB.get( 7537, 7748 ), previousIndex ) : d("na.", {style: `text-align: right;`}),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
    ]),
    br(),
    d([
      entityLabelWithPopup( State, 7539 ),
      d( State.Company.getBalanceObjects().filter( balanceObject => State.DB.get( State.DB.get( balanceObject, "balanceObject/balanceObjectType" ), 7540 ) === 7539 ).map( balanceObject => d([
        entityLabelWithPopup( State, balanceObject ),
        companyValueView( State, balanceObject,  7433, currentIndex ),
        isDefined( previousIndex) ? companyValueView( State, balanceObject,  7433, previousIndex ) : d("na.", {style: `text-align: right;`}),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}))),
      d([
        entityLabelWithPopup( State, State.DB.get( 7539, 7748 ) ),
        companyValueView( State, State.S.selectedCompany, State.DB.get( 7539, 7748 ), currentIndex ),
        isDefined( previousIndex) ? companyValueView( State, State.S.selectedCompany, State.DB.get( 7539, 7748 ), previousIndex ) : d("na.", {style: `text-align: right;`}),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
    ]),
    br(),
    d([
      entityLabelWithPopup( State, 7538 ),
      d( State.Company.getBalanceObjects().filter( balanceObject => State.DB.get( State.DB.get( balanceObject, "balanceObject/balanceObjectType" ), 7540 ) === 7538 ).map( balanceObject => d([
        entityLabelWithPopup( State, balanceObject ),
        companyValueView( State, balanceObject,  7433, currentIndex ),
        isDefined( previousIndex) ? companyValueView( State, balanceObject,  7433, previousIndex ) : d("na.", {style: `text-align: right;`}),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}))),
      d([
        entityLabelWithPopup( State, State.DB.get( 7538, 7748 ) ),
        companyValueView( State, State.S.selectedCompany, State.DB.get( 7538, 7748 ), currentIndex ),
        isDefined( previousIndex) ? companyValueView( State, State.S.selectedCompany, State.DB.get( 7538, 7748 ), previousIndex ) : d("na.", {style: `text-align: right;`}),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
      d([
        entityLabelWithPopup( State, 9647 ),
        companyValueView( State, State.S.selectedCompany, 9647, currentIndex ),
        isDefined( previousIndex) ? companyValueView( State, State.S.selectedCompany, State.DB.get( 7538, 7748 ), previousIndex ) : d("na.", {style: `text-align: right;`}),
      ], {style: gridColumnsStyle("repeat(3, 1fr)")}),
    ])
  ]) 
  
  let transactionIndexSelectionView = State => d([
    entityLabelWithPopup( State, 7929 ),
    d([
      d([
        submitButton("[<<]", () => State.Actions["BalancePage/selectTransactionIndex"]( 0 ) ),
        State.S["BalancePage/selectedTransactionIndex"] >= 1 ? submitButton("<", () => State.Actions["BalancePage/selectTransactionIndex"]( State.S["BalancePage/selectedTransactionIndex"] - 1 ) ) : d(""),
        State.S["BalancePage/selectedTransactionIndex"] < State.DB.get( State.S.selectedCompany, 9817 ).length ? submitButton(">", () => State.Actions["BalancePage/selectTransactionIndex"]( State.S["BalancePage/selectedTransactionIndex"] + 1 ) ) : d(""),
        submitButton("[>>]", () => State.Actions["BalancePage/selectTransactionIndex"]( State.Company.get( State.DB.get( State.S.selectedCompany, 9817 ).slice( - 1 )[0], 8354  )  ) )
      ], {style: gridColumnsStyle("repeat(8, 1fr)")}),
      transactionLabel( State, getTransactionByIndex( State.DB, State.S.selectedCompany, State.S.companyDatoms, State.S["BalancePage/selectedTransactionIndex"] ) ),
      entityLabelWithPopup( State, State.DB.get( getTransactionByIndex( State.DB, State.S.selectedCompany, State.S.companyDatoms, State.S["BalancePage/selectedTransactionIndex"] ), "transaction/accountingYear" )  ),
      d( moment( State.DB.get( getTransactionByIndex( State.DB, State.S.selectedCompany, State.S.companyDatoms, State.S["BalancePage/selectedTransactionIndex"] ), 1757 ) ).format("DD.MM.YYYY")),
    ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
  ], {class: "feedContainer", style: gridColumnsStyle("1fr 3fr")})
  
  let allBalanceObjectsView = State => {
  
    let allBalanceObjects = State.Company.getBalanceObjects().sort( (a,b) => State.DB.get( a, "balanceObject/balanceObjectType" ) - State.DB.get( b, "balanceObject/balanceObjectType" ) )
  
    return d([
        h3( State.DB.get(State.S.selectedPage, 6) ),
        transactionIndexSelectionView( State ),
        br(),
        d([
            d( [7537, 7539, 7538].map( balanceSection =>  d([
            d([
                entityLabelWithPopup( State, balanceSection ),
                submitButton("+", () => State.Actions["BalancePage/createNode"]( D.getAll(7531).find( e => D.get(e, 7540) ===  balanceSection ) ) ),
            ], {style: "display: flex;"}),
            d( allBalanceObjects.filter( balanceObject => State.DB.get( State.DB.get( balanceObject, "balanceObject/balanceObjectType" ), 7540 ) === balanceSection ).map( balanceObject => d([
                nodeLabel(State, balanceObject),
                calculatedValueView(State, balanceObject, 10045, State.S["BalancePage/selectedTransactionIndex"] )
                //companyValueView( State, balanceObject,  7433, State.S["BalancePage/selectedTransactionIndex"] ),
            ], {style: gridColumnsStyle("repeat(4, 1fr)") + "padding-left: 1em;"}))),
            d([
                entityLabelWithPopup( State, State.DB.get( balanceSection, 7748 ) ),
                companyValueView( State, State.S.selectedCompany, State.DB.get( balanceSection, 7748 ), State.S["BalancePage/selectedTransactionIndex"] )   
            ], {style: gridColumnsStyle("repeat(4, 1fr)")}),
            br(),
            combinedBalanceViewWithLabel( State, State.S.selectedCompany, balanceSection, State.S["BalancePage/selectedTransactionIndex"] ),
            ]),  ) ),
        ], {class: "feedContainer"})
        ])
  } 