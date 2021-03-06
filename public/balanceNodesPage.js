let balanceObjectsView = State => isDefined( State.S.selectedEntity ) ? singleAccountView( State ) : trialBalanceView( State )

let selectEventIndexView = State => d([
  d("Viser rapport etter hendelse:"),
  dropdown( isDefined( State.S.selectedEventIndex ) 
    ? State.DB.get( State.S.selectedCompany, 12783)( State.S.selectedEventIndex )
    : 0 , State.DB.get( State.S.selectedCompany, 12921 )()().map( e => returnObject({value: e, label: getEntityLabel( State.DB, e ) }) ).concat( isDefined( State.S.selectedEventIndex ) ? [] : [{value: 0, label: "Vis på tidligere tidspunkt" }] ), e => State.Actions.selectEventIndex( State.DB.get(  Number( submitInputValue(e) ), 11975 ) )  ),
    valueView( State, isDefined( State.S.selectedEventIndex ) ? State.DB.get( State.S.selectedCompany, 12783)( State.S.selectedEventIndex ) : State.DB.get( State.S.selectedCompany, 12786) , 1757, true )
], {style: gridColumnsStyle("2fr 2fr 1fr 2fr")})


let trialBalanceView = State => d([
  h3( getEntityLabel( State.DB, State.S.selectedPage) ),
  selectEventIndexView( State ),
  br(),
  d([
    d( [7537, 7539, 7538, 8788].map( balanceSection =>  d([
      entityLabelWithPopup( State, balanceSection ),
      d( State.DB.get( State.S.selectedCompany, 12380 )()
          .filter( activeNode => State.DB.get( activeNode, 7540) === balanceSection  )
          .sort( (a,b) => Number( State.DB.get( a, 6).slice(0,4) ) - Number( State.DB.get( b, 6).slice(0,4) )  )
          .map( activeNode => d([
            entityLabelWithPopup( State, activeNode ),
            d( formatNumber( State.DB.get( State.S.selectedCompany, 12392 )([activeNode], State.S.selectedEventIndex) ), {style: `text-align: right;`} ),
          ], {style: gridColumnsStyle("repeat(4, 1fr)")}) 
          )   ),
      d([
        d([
          d("Sum"),
          d( formatNumber(  State.DB.get( State.S.selectedCompany, 12392 )( State.DB.get( State.S.selectedCompany, 12380 )() , State.S.selectedEventIndex)  ), {style: `text-align: right;`} ),
          br(),
        ], {style: gridColumnsStyle("repeat(4, 1fr)")})
        
      ])
    ]),  ) ),
], {class: "feedContainer"}),
]  ) 


let singleAccountView = State => d([
  selectEventIndexView( State ),
  br(),
  d([
    entityLabelWithPopup( State, State.S.selectedEntity ),
    br(),
    d( formatNumber( State.DB.get( State.S.selectedCompany, 12392 )([State.S.selectedEntity], State.S.selectedEventIndex) ), {style: `text-align: right;`} ),
  ], {class: "feedContainer"})
])