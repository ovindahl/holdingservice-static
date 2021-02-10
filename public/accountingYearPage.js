const AccountingYearPage = {
    initial: DB => returnObject({ 
      "AccountingYearPage/selectedAccountingYearSourceDocument": undefined,
    }),
    Actions: State => returnObject({
       "AccountingYearPage/selectAccountingYearSourceDocument": sourceDocument => updateState( State, {S: {selectedPage: 7509, "AccountingYearPage/selectedAccountingYearSourceDocument": sourceDocument}}),
        "AccountingYearPage/retractAccountingYearSourceDocument": async sourceDocument => updateState( State, { DB: await Transactor.retractEntity(State.DB, sourceDocument), S: {"AccountingYearPage/selectedAccountingYearSourceDocument": undefined } } ),
        "AccountingYearPage/createAnnualResultSourceDocument": async () => {

          let Datoms = [
            newDatom( "newDatom_annualResult", "entity/entityType", 10062  ),
            newDatom( "newDatom_annualResult", "entity/company", State.S.selectedCompany  ),
            newDatom( "newDatom_annualResult", "sourceDocument/sourceDocumentType", 10309 ),
            newDatom( "newDatom_annualResult", "entity/label", `Bilag for årsavslutning`  ),
            newDatom( "newDatom_annualResult", 8750, false  ),
            newDatom( "newDatom_annualResult", 8751, false  ),
          ]

          State.Actions.postDatoms( Datoms )
          },
        "AccountingYearPage/closeAccountingYear": async sourceDocument => {

          let taxDatoms = [
            newDatom( "newEntity_tax" , 'entity/entityType', 7948 ),
            newDatom( "newEntity_tax" , 'entity/company', State.S.selectedCompany ), 
            newDatom( "newEntity_tax" , "transaction/transactionType", 9286 ), 
            newDatom( "newEntity_tax" , "entity/sourceDocument", sourceDocument ), 
            newDatom( "newEntity_tax" , "transaction/originNode", State.DB.get(State.S.selectedCompany, 10052)(10302)[0] ),
            newDatom( "newEntity_tax" , "transaction/destinationNode", State.DB.get(State.S.selectedCompany, 10052)(8746)[0] ),
            newDatom( "newEntity_tax" , "event/date", State.DB.get( State.DB.get( sourceDocument, 7512 ), "accountingYear/lastDate")), 
            newDatom( "newEntity_tax" , "eventAttribute/1139", "Årets skattekostnad"  )
          ]

          let resetNodesDatoms = State.DB.get(State.S.selectedCompany, 10052)([8788])
            .filter( PnLnode => State.DB.get(PnLnode, 10045)( State.DB.get(sourceDocument , 10499) ) !== 0 )
            .map( PnLnode => {

            let nodeBalance =  State.DB.get(PnLnode, 10045)( State.DB.get(sourceDocument , 10499) )

            let originNode = nodeBalance < 0 ? State.DB.get(State.S.selectedCompany, 10052)(8784)[0] : PnLnode
            let destinationNode = nodeBalance < 0 ? PnLnode : State.DB.get(State.S.selectedCompany, 10052)(8784)[0]


            return [
              newDatom( "newEntity_node_" + PnLnode , 'entity/entityType', 7948 ),
              newDatom( "newEntity_node_" + PnLnode , 'entity/company', State.S.selectedCompany ), 
              newDatom( "newEntity_node_" + PnLnode , "transaction/transactionType", 9716 ), 
              newDatom( "newEntity_node_" + PnLnode , "entity/sourceDocument", sourceDocument ), 
              newDatom( "newEntity_node_" + PnLnode , "transaction/originNode", originNode ),
              newDatom( "newEntity_node_" + PnLnode , "transaction/destinationNode", destinationNode ),
              newDatom( "newEntity_node_" + PnLnode , "event/date", State.DB.get( State.DB.get( sourceDocument, 7512 ), "accountingYear/lastDate")), 
              newDatom( "newEntity_node_" + PnLnode , "eventAttribute/1139", "Tilbakestilling av kostnads- og inntektskonto"  ),
              newDatom( "newEntity_node_" + PnLnode , 1083, Math.abs( nodeBalance )   ),
            ]
          }   ).flat()

          let annualResultDatoms = [
            newDatom( "newEntity_annualResult" , 'entity/entityType', 7948 ),
            newDatom( "newEntity_annualResult" , 'entity/company', State.S.selectedCompany ), 
            newDatom( "newEntity_annualResult" , "transaction/transactionType", 9384 ), 
            newDatom( "newEntity_annualResult" , "entity/sourceDocument", sourceDocument ), 
            newDatom( "newEntity_annualResult" , "transaction/originNode", State.DB.get(State.S.selectedCompany, 10052)(8741)[0] ),
            newDatom( "newEntity_annualResult" , "transaction/destinationNode", State.DB.get(State.S.selectedCompany, 10052)(8784)[0] ),
            newDatom( "newEntity_annualResult" , "event/date", State.DB.get( State.DB.get( sourceDocument, 7512 ), "accountingYear/lastDate")  ), 
            newDatom( "newEntity_annualResult" , "eventAttribute/1139", "Årets resultat"  ),
          ]

          let yearEndDatoms = [
            taxDatoms,
            resetNodesDatoms,
            annualResultDatoms
          ].flat()

          log({yearEndDatoms})
          
          State.Actions.postDatoms( yearEndDatoms )
          },
    })
  }


let accountingYearsView = State => isDefined(State.S["AccountingYearPage/selectedAccountingYearSourceDocument"]) ? singleAccountingYearView( State ) : allAccountingYearsView( State )

let singleAccountingYearView = State => {

  let currentAnnualResultSourceDocument = State.S["AccountingYearPage/selectedAccountingYearSourceDocument"]


return d([
  submitButton( " <---- Tilbake ", () => State.Actions["AccountingYearPage/selectAccountingYearSourceDocument"]( undefined )  ),
  d([
    h3("Årets resultat"),
    d([
      d( State.DB.get( State.DB.get( currentAnnualResultSourceDocument, "sourceDocument/sourceDocumentType"), 7942 )
        .map( attribute => entityAttributeView(State, currentAnnualResultSourceDocument, attribute, State.DB.get(currentAnnualResultSourceDocument, 10401) ) ) 
      ),
      d( State.DB.get( State.DB.get( currentAnnualResultSourceDocument, "sourceDocument/sourceDocumentType"), 10433 )
        .map( attribute => entityAttributeView(State, currentAnnualResultSourceDocument, attribute, true ) ) 
      ),
    ]),
    br(),
    State.DB.get(currentAnnualResultSourceDocument, 10401)
      ? d([
        d( State.DB.get(currentAnnualResultSourceDocument, 10402).map( transaction => transactionFlowView( State, transaction) ) ),
        submitButton("Tilbakestill bokføring", () => State.Actions.retractEntities( State.DB.get(currentAnnualResultSourceDocument, 10402) )  )
        
      ])
      : d([
        submitButton("Bokfør skattekostnad og årsresultat, og lås året", () => State.Actions["AccountingYearPage/closeAccountingYear"]( currentAnnualResultSourceDocument ) )
      ]) 
  
    
    ], {class: "feedContainer"})
  ]) 
} 


let allAccountingYearsView = State => d([
  h3("Alle årsavslutninger"),
  d([
      entityLabelWithPopup( State, 7512 ),
      entityLabelWithPopup( State, 10401 ),
  ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr")}),
  d( State.DB.get( State.S.selectedCompany, 10073 )
      .filter( sourceDocument => [10309].includes( State.DB.get(sourceDocument, 10070 ) )   )
      .map( sourceDocument => d([
      entityLabelWithPopup( State,State.DB.get(sourceDocument, 7512 ), () => State.Actions["AccountingYearPage/selectAccountingYearSourceDocument"]( sourceDocument ) ),
      d(State.DB.get(sourceDocument, 10401) ? "✅" : "🚧"),
      submitButton( "Vis", () => State.Actions["AccountingYearPage/selectAccountingYearSourceDocument"]( sourceDocument ))
  ], {style: gridColumnsStyle("1fr 1fr 1fr 1fr 1fr 1fr")}) )),
br(),
submitButton( "Ny årsavslutning", () => State.Actions["AccountingYearPage/createAnnualResultSourceDocument"]( ))
]) 























