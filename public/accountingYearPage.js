const AccountingYearPage = {
    entity: 7509,
    onLoad: State => returnObject({selectedEntity: undefined}),
    Actions: State => returnObject({
       "AccountingYearPage/selectAccountingYearSourceDocument": sourceDocument => updateState( State, {S: {selectedPage: 7509, selectedEntity: sourceDocument}}),
        "AccountingYearPage/retractAccountingYearSourceDocument": async sourceDocument => updateState( State, { DB: await Transactor.retractEntity(State.DB, sourceDocument), S: {selectedEntity: undefined } } ),
        "AccountingYearPage/createAnnualResultSourceDocument": async () => {

          let Datoms = [
            newDatom( "newDatom_annualResult", "entity/entityType", 10062  ),
            newDatom( "newDatom_annualResult", "entity/company", State.S.selectedCompany  ),
            newDatom( "newDatom_annualResult", "sourceDocument/sourceDocumentType", 10309 ),
            newDatom( "newDatom_annualResult", "entity/label", `Bilag for årsavslutning`  ),
            newDatom( "newDatom_annualResult", 1757, State.DB.get( State.DB.get(State.S.selectedCompany, 10061).slice(-1)[0], 'accountingYear/lastDate' ) ),
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
            newDatom( "newEntity_tax" , "transaction/originNode", 10708),
            newDatom( "newEntity_tax" , "transaction/destinationNode", 10688 ),
            newDatom( "newEntity_tax" , "eventAttribute/1139", "Årets skattekostnad"  )
          ]

          let resetNodesDatoms = State.DB.get(State.S.selectedCompany, 10052)([8788])
            .filter( PnLnode => State.DB.get(PnLnode, 10045)( State.DB.get(sourceDocument , 10499) ) !== 0 )
            .map( PnLnode => {

            let nodeBalance =  State.DB.get(PnLnode, 10045)( State.DB.get(sourceDocument , 10499) )

            let originNode = nodeBalance < 0 ? 10698 : PnLnode
            let destinationNode = nodeBalance < 0 ? PnLnode : 10698

            let nodeDatoms = [
              newDatom( "newEntity_node_" + PnLnode , 'entity/entityType', 7948 ),
              newDatom( "newEntity_node_" + PnLnode , 'entity/company', State.S.selectedCompany ), 
              newDatom( "newEntity_node_" + PnLnode , "transaction/transactionType", 9716 ), 
              newDatom( "newEntity_node_" + PnLnode , "entity/sourceDocument", sourceDocument ), 
              newDatom( "newEntity_node_" + PnLnode , "transaction/originNode", originNode ),
              newDatom( "newEntity_node_" + PnLnode , "transaction/destinationNode", destinationNode ),
              newDatom( "newEntity_node_" + PnLnode , "eventAttribute/1139", "Tilbakestilling av kostnads- og inntektskonto"  ),
              newDatom( "newEntity_node_" + PnLnode , 1083, Math.abs( nodeBalance )   ),
            ]

            return nodeDatoms
          }   ).flat()

          let annualResultOriginNode = State.DB.get(sourceDocument, 10439) < 0 ? 10767 : 10698
          let annualResultDestinationNode = State.DB.get(sourceDocument, 10439) >= 0 ? 10767 : 10698


          let annualResultDatoms = [
            newDatom( "newEntity_annualResult" , 'entity/entityType', 7948 ),
            newDatom( "newEntity_annualResult" , 'entity/company', State.S.selectedCompany ), 
            newDatom( "newEntity_annualResult" , "transaction/transactionType", 9384 ), 
            newDatom( "newEntity_annualResult" , "entity/sourceDocument", sourceDocument ), 
            newDatom( "newEntity_annualResult" , "transaction/originNode", annualResultOriginNode ),
            newDatom( "newEntity_annualResult" , "transaction/destinationNode", annualResultDestinationNode ),
            newDatom( "newEntity_annualResult" , "eventAttribute/1139", "Årets resultat"  ),
          ]

          let yearEndDatoms = [
            taxDatoms,
            annualResultDatoms,
            resetNodesDatoms
          ].flat()

          
          State.Actions.postDatoms( yearEndDatoms )
          },
    })
  }


let accountingYearsView = State => isDefined(State.S.selectedEntity) ? singleAccountingYearView( State ) : allAccountingYearsView( State )

let singleAccountingYearView = State => {

  let currentAnnualResultSourceDocument = State.S.selectedEntity

  log({State})

return d([
  submitButton( " <---- Tilbake ", () => State.Actions["AccountingYearPage/selectAccountingYearSourceDocument"]( undefined )  ),
  d([
    h3("Årsavslutning"),
    d([
      d( State.DB.get( State.DB.get( currentAnnualResultSourceDocument, "sourceDocument/sourceDocumentType"), 7942 )
        .map( attribute => entityAttributeView(State, currentAnnualResultSourceDocument, attribute, State.DB.get(currentAnnualResultSourceDocument, 10401) ) ) 
      ),
      br(),
      h3("Beregnet resultat"),
      d( [10618, 10686, 10687, 10689].map( balanceObject => d([
          nodeLabel(State, balanceObject),
          calculatedValueView(State, balanceObject, 10045, State.DB.get(currentAnnualResultSourceDocument, 10499) )
      ], {style: gridColumnsStyle("repeat(4, 1fr)") + "padding-left: 1em;"}))),
      br(),
      d( State.DB.get( State.DB.get( currentAnnualResultSourceDocument, "sourceDocument/sourceDocumentType"), 10433 ).map( attribute => entityAttributeView(State, currentAnnualResultSourceDocument, attribute, true ) ) ),
      
      
    ]),
    br(),
    h3("Bokføring"),
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























