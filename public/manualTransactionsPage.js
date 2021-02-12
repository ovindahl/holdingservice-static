const ManualTransactionsPage = {
    entity: 10042,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({
        "ManualTransactionsPage/selectSourceDocument": entity => updateState( State, {S: {selectedPage: 10042, selectedEntity: entity}}),
        "ManualTransactionsPage/retractSourceDocument": async entity => updateState( State, { DB: await Transactor.retractEntity(State.DB, entity), S: {selectedEntity: undefined } } ),
        "ManualTransactionsPage/new": () => State.Actions.postDatoms([
            newDatom( "newEntity", "entity/entityType", 10062 ),
            newDatom( "newEntity", "sourceDocument/sourceDocumentType", 10317 ),
            newDatom( "newEntity", 1757, Date.now() ),
            newDatom( 'newEntity' , 'entity/company', State.S.selectedCompany ), 
            newDatom( 'newEntity' , "eventAttribute/1139", "Fri postering" ), 
        ] ),
        "ManualTransactionsPage/recordTransaction": sourceDocument => State.Actions.postDatoms( [
            newDatom( "newEntity" , 'entity/entityType', 7948 ),
            newDatom( "newEntity" , 'entity/company', State.S.selectedCompany ), 
            newDatom( "newEntity" , "transaction/transactionType", 8019 ), 
            newDatom( "newEntity" , "entity/sourceDocument", sourceDocument ), 
            newDatom( "newEntity" , "transaction/originNode", State.DB.get( sourceDocument, 7867) ),
            newDatom( "newEntity" , "transaction/destinationNode", State.DB.get( sourceDocument, 7866) ),
            newDatom( "newEntity" , "eventAttribute/1139",  State.DB.get( sourceDocument, 1139) )
        ])
            
    })
  }


  
  let manualTransactionsView = State => isDefined( State.S.selectedEntity) ? singleManualTransactionView( State ) : allManualTransactionsView( State )
  
  let allManualTransactionsView = State => d([
    h3("Alle fri posteringer"),
    d([
        entityLabelWithPopup( State, 1757 ),
        entityLabelWithPopup( State, 7867 ),
        entityLabelWithPopup( State, 7866 ),
        entityLabelWithPopup( State, 10107 ),
        entityLabelWithPopup( State, 10401 ),
    ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr  1fr 1fr")}),
    d( State.DB.get( State.S.selectedCompany, 10073 )
        .filter( sourceDocument => [10317].includes( State.DB.get(sourceDocument, 10070 ) )   )
        .map( sourceDocument => d([
        lockedSingleValueView( State, sourceDocument, 1757 ),
        lockedSingleValueView( State, sourceDocument, 7867 ),
        lockedSingleValueView( State, sourceDocument, 7866 ),
        lockedSingleValueView( State, sourceDocument, 10107 ),
        d(State.DB.get(sourceDocument, 10401) ? "✅" : "🚧"),
        submitButton( "Vis", () => State.Actions["ManualTransactionsPage/selectSourceDocument"]( sourceDocument ))
    ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr  1fr 1fr")}) )),
  br(),
  submitButton( "Ny fri postering", () => State.Actions["ManualTransactionsPage/new"]( ))
  ]) 

  
  let singleManualTransactionView = State => {

    return d([
        submitButton( " <---- Tilbake ", () => State.Actions["ManualTransactionsPage/selectSourceDocument"]( undefined )  ),
        br(),
        entityAttributeView(State, State.S.selectedEntity, 10070, true),
        br(),
        isDefined( State.DB.get( State.S.selectedEntity, "sourceDocument/sourceDocumentType") ) 
            ? d( State.DB.get( State.DB.get( State.S.selectedEntity, "sourceDocument/sourceDocumentType"), 7942 ).map( attribute => entityAttributeView(State, State.S.selectedEntity, attribute, State.DB.get(State.S.selectedEntity, 10401) ) ) ) 
            : d(""),
        br(),
        recordManualTransactionView( State, State.S.selectedEntity )
      ])
  } 



let recordManualTransactionView = (State, sourceDocument) => d([
    d([
        d("Tilknyttede transaksjoner:"),
        State.DB.get(sourceDocument, 10401)
            ? d( State.DB.get(sourceDocument, 10402).map( transaction => transactionFlowView( State, transaction) ) )
            : d("Ingen bokførte transaksjoner")
        ], {class: "feedContainer"}),
    State.DB.get(sourceDocument, 11012)
    ? State.DB.get(sourceDocument, 10401)
        ? d("Regnskapsåret for angitt dato er avsluttet. Tilbakestill årsavslutningen for å endre bilaget.")
        : d("Regnskapsåret for angitt dato er avsluttet. Tilbakestill årsavslutningen først, eller velg en senere dato.")
    : State.DB.get(sourceDocument, 10401)
        ? submitButton("Tilbakestill bokføring", () => State.Actions.retractEntities( State.DB.get(sourceDocument, 10402) )  )
        : d([
            State.DB.get( State.DB.get( sourceDocument, "sourceDocument/sourceDocumentType"), 7942 ).every( attribute => isDefined( State.DB.get(sourceDocument, attribute) ) )
                ? submitButton("Bokfør", () => State.Actions["ManualTransactionsPage/recordTransaction"]( sourceDocument )   )
                : d("Fyll ut alle felter for å bokføre"),
            submitButton("Slett", e => State.Actions["ManualTransactionsPage/retractSourceDocument"]( sourceDocument ) )
        ])   
])