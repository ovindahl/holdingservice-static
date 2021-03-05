

//Archive

const Reports = {
    "rf_1028": {
      accountMapping: {'406': ['1320' , '1340' , '1370' , '1375' , '1380' , '1399' , '1576' , '1579' , '1749'], '408': ['1920'], '440': ['2220' , '2250' , '2260' , '2290' , '2390' , '2400' , '2510' , '2910' , '2920' , '2990']},
      prepare: ( accountBalance ) => mergeArray( 
        Object.keys(Reports["rf_1028"]["accountMapping"]).map( reportKey => 
          createObject(
            reportKey, 
            Reports["rf_1028"]["accountMapping"][ reportKey ].reduce( (sum, account) => sum + accountBalance[account] ? accountBalance[account] : 0, 0 ) 
          ) 
        )  
      )
    },
    "rf_1167": {
      accountMapping: {'8300': ['8300', '0620'], '8320': ['8320, 0620'], '8140': ['8179, 0621'], '8100': ['8100, 0631'], '8110': ['8115, 0632'], '8120': ['8115, 0632'], '8178': ['8174, 0633'], '6726': ['6700, 0640'], '7791': ['7700, 0640'], '8071': ['8090, 0815'], '8000': ['8005, 0830'], '8020': ['8005, 0830'], '8080': ['8080, 0831'], '8078': ['8074, 0833'], '1320': ['0440, 1320'], '1340': ['0440, 1340'], '1370': ['0440, 1370'], '1375': ['0440, 1370'], '1380': ['0440, 1380'], '1399': ['0440, 1390'], '1576': ['0440, 1565'], '1579': ['0440, 1570'], '1749': ['0440, 1570'], '1070': ['1070'], '1300': ['1313'], '1330': ['1332'], '1350': ['1350'], '1360': ['1360'], '1800': ['1800'], '1810': ['1810'], '1820': ['1800'], '1830': ['1830'], '1870': ['1880'], '1880': ['1880'], '1920': ['1920'], '2000': ['2000'], '2020': ['2020'], '2030': ['2030'], '2050': ['2059'], '2080': ['2080'], '2120': ['2120'], '2220': ['2220'], '2250': ['2250'], '2260': ['2260'], '2290': ['2290'], '2390': ['2380'], '2400': ['2400'], '2500': ['2500'], '2510': ['2510'], '2800': ['2800'], '2910': ['2910'], '2920': ['2920'], '2990': ['2990'], '6540': ['6500'], '6551': ['6500'], '6552': ['6500'], '6580': ['6500'], '6701': ['6700'], '6702': ['6700'], '6705': ['6700'], '6720': ['6700'], '6725': ['6700'], '6790': ['6700'], '6890': ['6995'], '6900': ['6995'], '7770': ['7700'], '7790': ['7700'], '8030': ['8030'], '8050': ['8050'], '8055': ['8050'], '8060': ['8060'], '8070': ['8079'], '8090': ['8090'], '8130': ['8130'], '8150': ['8150'], '8155': ['8150'], '8160': ['8160'], '8170': ['8179']},
      prepare: ( accountBalance ) => mergeArray( 
        Object.keys(Reports["rf_1167"]["accountMapping"]).map( reportKey => 
          createObject(
            reportKey, 
            Reports["rf_1167"]["accountMapping"][ reportKey ].reduce( (sum, account) => sum + accountBalance[account] ? accountBalance[account] : 0, 0 ) 
          ) 
        )  
      )
    },
    "rf_1086": {
      prepare: ( accumulatedVariables ) => returnObj({TBD: "TBD"})
    },
    "annualReport": {
      accountMapping: {"9000":[],"9010":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791"],"9050":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791"],"9060":["8000","8020","8030","8050","8055","8060","8070","8071","8078","8080","8090"],"9070":["8100","8110","8120","8130","8140","8150","8155","8160","8170","8178"],"9100":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791","8000","8020","8030","8050","8055","8060","8070","8071","8078","8080","8090","8100","8110","8120","8130","8140","8150","8155","8160","8170","8178"],"9150":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791","8000","8020","8030","8050","8055","8060","8070","8071","8078","8080","8090","8100","8110","8120","8130","8140","8150","8155","8160","8170","8178","8300","8320"],"9200":["6540","6551","6552","6580","6701","6702","6705","6720","6725","6726","6790","6890","6900","7770","7790","7791","8000","8020","8030","8050","8055","8060","8070","8071","8078","8080","8090","8100","8110","8120","8130","8140","8150","8155","8160","8170","8178","8300","8320"],"9300":["1070","1300","1320","1330","1340","1350","1360","1370","1375","1380","1399"],"9350":["1576","1579","1749","1800","1810","1820","1830","1870","1880","1920"],"9400":["1070","1300","1320","1330","1340","1350","1360","1370","1375","1380","1399","1576","1579","1749","1800","1810","1820","1830","1870","1880","1920"],"9450":["2000","2020","2030","2050","2080"],"9500":["2120","2220","2250","2260","2290"],"9550":["2390","2400","2500","2510","2800","2910","2920","2990"],"9650":["2000","2020","2030","2050","2080","2120","2220","2250","2260","2290","2390","2400","2500","2510","2800","2910","2920","2990"]},
      prepare: ( accountBalance ) => mergeArray( 
        Object.keys(Reports["annualReport"]["accountMapping"]).map( reportKey => 
          createObject(
            reportKey, 
            Reports["annualReport"]["accountMapping"][ reportKey ].reduce( (sum, account) => sum + accountBalance[account] ? accountBalance[account] : 0, 0 ) 
          ) 
        )  
      ),
      virtualAccounts: [
        {virtualAccount: '9000', label: 'Sum driftsinntekter', firstAccount: "3000", lastAccount: "3999"},
        {virtualAccount: '9010', label: 'Sum driftskostnader', firstAccount: "4000", lastAccount: "7999"},
        {virtualAccount: '9050', label: 'Driftsresultat', firstAccount: "3000", lastAccount: "7999"},
        {virtualAccount: '9060', label: 'Sum finansinntekter', firstAccount: "8000", lastAccount: "8099"},
        {virtualAccount: '9070', label: 'Sum finanskostnader', firstAccount: "8100", lastAccount: "8199"},
        {virtualAccount: '9100', label: 'Ordinært resultat før skattekostnad', firstAccount: "3000", lastAccount: "8199"},
        {virtualAccount: '9150', label: 'Ordinært resultat', firstAccount: "3000", lastAccount: "8399"},
        {virtualAccount: '9200', label: 'Årsresultat', firstAccount: "3000", lastAccount: "8699"},
        {virtualAccount: '9300', label: 'Sum anleggsmidler', firstAccount: "1000", lastAccount: "1399"},
        {virtualAccount: '9350', label: 'Sum omløpsmidler', firstAccount: "1400", lastAccount: "1999"},
        {virtualAccount: '9400', label: 'Sum eiendeler', firstAccount: "1000", lastAccount: "1999"},
        {virtualAccount: '9450', label: 'Sum egenkapital', firstAccount: "2000", lastAccount: "2099"},
        {virtualAccount: '9500', label: 'Sum langsiktig gjeld', firstAccount: "2100", lastAccount: "2299"},
        {virtualAccount: '9550', label: 'Sum kortsiktig gjeld', firstAccount: "2300", lastAccount: "2999"},
        {virtualAccount: '9650', label: 'Sum egenkapital og gjeld', firstAccount: "2000", lastAccount: "2999"}
    ]
    },
    "notesText": {
      prepare: ( companyDoc ) => {
  
        let openingBalance = companyDoc["company/:openingBalance"]
        let accountBalance = companyDoc["company/:accountBalance"]
      
        let shareholders = companyDoc["company/:shareholders"]
        let shareCount = companyDoc["company/:shareCount"]
    
        let nominalSharePrice = companyDoc["company/:nominalSharePrice"]
    
        let em = (content) => String('<span class="emphasizedText">' + content + '</span>')
      
        return `
      <h4>Note 1: Regnskapsprinsipper</h4>
      Regnskapet er utarbeidet i henhold til norske regnskapsregler/-standarder for små foretak.
      <br>
      <h5>Klassifisering og vurdering av balanseposter</h5>
      Omløpsmidler og kortsiktig gjeld omfatter poster som forfaller til betaling innen ett år etter anskaffelsestidspunktet, samt poster som knytter seg til varekretsløpet. Øvrige poster er klassifisert som anleggsmiddel/langsiktig gjeld.
      <br>
      Omløpsmidler vurderes til laveste av anskaffelseskost og virkelig verdi. Kortsiktig gjeld balanseføres til nominelt beløp på opptakstidspunktet.
      <br>
      Anleggsmidler vurderes til anskaffelseskost, men nedskrives til gjenvinnbart beløp dersom dette er lavere enn balanseført verdi. Gjenvinnbart beløp er det høyeste av netto salgsverdi og verdi i bruk. Langsiktig gjeld balanseføres til nominelt beløp på etableringstidspunktet.
      Markedsbaserte finansielle omløpsmidler som inngår i en handelsportefølje vurderes til virkelig verdi, mens andre markedsbaserte finansielle omløpsmidler vurderes til laveste av anskaffelseskost og virkelig verdi.
      <br>
      <h5>Skatt</h5>
      Skattekostnaden i resultatregnskapet omfatter både betalbar skatt for perioden og endring i utsatt skatt. Utsatt skatt er beregnet med ${em("TBD")} på grunnlag av de midlertidige forskjeller som eksisterer mellom regnskapsmessige og skattemessige verdier, samt ligningsmessig underskudd til fremføring ved utgangen av regnskapsåret. Skatteøkende og skattereduserende midlertidige forskjeller som reverserer eller kan reversere i samme periode er utlignet og nettoført.
      <br>
      <h4>Note 2: Aksjekapital og aksjonærinformasjon</h4>
      Foretaket har ${em( shareCount ) } aksjer, pålydende kr ${em(  nominalSharePrice )}, noe som gir en samlet aksjekapital på kr ${em( accountBalance["2000"] )}. Selskapet har én aksjeklasse.
      <br><br>
      Aksjene eies av: 
      <br>
      ${shareholders.map( (shareholder, index) => em(`${index}: ${shareholder} <br>`)).join("")}
      
      <h4>Note 3: Egenkapital</h4>
      
      <table>
      <tbody>
        <tr>
          <td class="numberCell"></td>
          <td class="numberCell">Aksjekapital</td>
          <td class="numberCell">Overkurs</td>
          <td class="numberCell">Annen egenkapital</td>
          <td class="numberCell">Sum</td>
        </tr>
        <tr>
          <td>Egenkapital 1.1 </td>
          <td class="numberCell">${em( openingBalance["2000"] ) }</td>
          <td class="numberCell">${em( openingBalance["2020"] ) }</td>
          <td class="numberCell">${em( openingBalance["2030"] ) }</td>
          <td class="numberCell">${em( openingBalance["2000"] + openingBalance["2020"] + openingBalance["2030"] ) }</td>
        </tr>
        <tr>
          <td>Endring ila. året </td>
          <td class="numberCell">${em( accountBalance["2000"] - openingBalance["2000"] ) }</td>
          <td class="numberCell">${em( accountBalance["2020"] - openingBalance["2020"] ) }</td>
          <td class="numberCell">${em( accountBalance["2030"] - openingBalance["2030"] ) }</td>
          <td class="numberCell">${em( accountBalance["2000"] - openingBalance["2000"] + accountBalance["2020"] - openingBalance["2020"] + accountBalance["2030"] - openingBalance["2030"] ) }</td>
        </tr>
        <tr>
          <td>Egenkapital 31.12 </td>
          <td class="numberCell">${em( accountBalance["2000"] ) }</td>
          <td class="numberCell">${em( accountBalance["2020"] ) }</td>
          <td class="numberCell">${em( accountBalance["2030"] ) }</td>
          <td class="numberCell">${em( accountBalance["2000"] + accountBalance["2020"] + accountBalance["2030"] ) }</td>
        </tr>
      </tbody>
      </table>
      <br>
      <h4>Note 5: Skatt</h4>
      ${"[TBD]" }
      
      <h4>Note 4: Lønnskostnader, antall ansatte, godtgjørelser, revisjonskostnader mm.</h4>
      Selskapet har i ${em( companyDoc["company/:currentYear"] ) } ikke hatt noen ansatte og er således ikke pliktig til å ha tjenestepensjon for de ansatte etter Lov om obligatoriske tjenestepensjon. Det er ikke utdelt styrehonorar.
      <br><br>
      Kostnadsført revisjonshonorar for ${em( companyDoc["company/:currentYear"] ) } utgjør kr ${em( 0 ) }. Honorar for annen bistand fra revisor utgjør kr ${em( 0 ) }.
      
      
      
      <h4>Note 6: Bankinnskudd</h4>
      Posten inneholder kun frie midler.
      
      <h4>Note 7: Gjeld til nærstående, ledelse og styre</h4>
      Selskapet har gjeld til følgende nærstående personer: <br>
      ${shareholders.map( (shareholder, index) => em(`${index}: ${shareholder} <br>`)).join("")}
      
      `}
    } 
}

//WIP

let getTaxRecords = (accounts, taxRate) => {

  let accountingResultBeforeTax = Object.entries(accounts).filter( entry => Number(entry[0]) >= 3000 ).reduce( (sum, entry) => sum + entry[1].closingBalance.amount - entry[1].openingBalance.amount, 0 )

  let nonDeductibleAccounts = ['2030' , '5901' , '6726' , '7360' , '7410' , '7430' , '7791' , '8000' , '8002' , '8005' , '8006' , '8010' , '8020' , '8040' , '8071' , '8078' , '8080' , '8100' , '8110' , '8120' , '8140' , '8178'] //NB: changed 2036 to 2030. Which to  use for Stiftelseskost?

  let permanentDifferences = Object.entries(accounts).filter( entry => nonDeductibleAccounts.includes( entry[0] ) ).reduce( (sum, entry) => sum + entry[1].closingBalance.amount - entry[1].openingBalance.amount, 0 )

  let temporaryDifferences = 0

  let taxEstimateCorrection = accounts["8300"] ? accounts["8300"].closingBalance.amount : 0

  let taxResultBeforeUtilizedLosses = accountingResultBeforeTax + permanentDifferences + temporaryDifferences + taxEstimateCorrection

  let accumulatedLosses = accounts["2510"] ? accounts["2510"].closingBalance.amount : 0 //Må velge riktig konto

  let utilizedLosses = taxResultBeforeUtilizedLosses < 0 ? Math.max( taxResultBeforeUtilizedLosses * taxRate, accumulatedLosses ) : 0

  let taxResultAfterUtilizedLosses = taxResultBeforeUtilizedLosses + utilizedLosses

  let taxCost = taxResultAfterUtilizedLosses * - taxRate

  let taxRecords = [
      {"transaction/generic/account": "8300", "transaction/amount": taxCost, accountingResultBeforeTax, permanentDifferences, temporaryDifferences, taxEstimateCorrection, taxResultBeforeUtilizedLosses, accumulatedLosses, utilizedLosses, taxRate, taxCost, taxResultAfterUtilizedLosses},
      {"transaction/generic/account": "2500", "transaction/amount": -taxCost}, //Burde være eiendel hvis negativ
      {"transaction/generic/account": "2510", "transaction/amount": utilizedLosses}
  ]

  let taxTransaction = {
      type: "transactions",
      records: taxRecords
  }

  

  return taxTransaction
}

let getYearEndRecords = (accountsPostTax) => {

  let accountingResultAfterTax = Object.entries(accountsPostTax).filter( entry => Number(entry[0]) >= 3000 ).reduce( (sum, entry) => sum + entry[1].closingBalance.amount - entry[1].openingBalance.amount, 0 )

  let uncoveredLosses_before = accountsPostTax["2080"] ? accountsPostTax["2080"].openingBalance.amount : 0
  let otherEquity_before = accountsPostTax["2050"] ? accountsPostTax["2050"].openingBalance.amount : 0
  let sharePremium_before = accountsPostTax["2020"] ? accountsPostTax["2020"].openingBalance.amount : 0

  let uncoveredLosses = 0
  let otherEquity = 0
  let sharePremium = 0

  if( accountingResultAfterTax < 0 ){
      //Overskudd

      if( uncoveredLosses_before === 0 ){
          
          otherEquity = accountingResultAfterTax
          
  
      }else{
          
          if( uncoveredLosses_before > -accountingResultAfterTax ){

              uncoveredLosses = accountingResultAfterTax


          }else{

              uncoveredLosses = -uncoveredLosses_before
              otherEquity = accountingResultAfterTax + uncoveredLosses_before

          }

          
          
      }

      

  }else{
      //Underskudd

      if( otherEquity_before === 0 ){
          
          uncoveredLosses = accountingResultAfterTax //Overkurs bør også være med
          
  
      }else{
          
          if( otherEquity_before < -accountingResultAfterTax ){

              otherEquity = accountingResultAfterTax


          }else{

              otherEquity = -otherEquity_before
              uncoveredLosses = accountingResultAfterTax + otherEquity_before

          }

          
          
      }


  }


  let yearEndRecords = [
      {"transaction/generic/account": "8800", "transaction/amount": -accountingResultAfterTax},
      {"transaction/generic/account": "2050", "transaction/amount": otherEquity},
      {"transaction/generic/account": "2080", "transaction/amount": uncoveredLosses},
  ]

  let yearEndTransaction = {
      type: "transactions",
      records: yearEndRecords
  }

  

  return yearEndTransaction
}

let taxCostView = (financialYear) => {

  let taxCostRecord = financialYear.accounts["8300"].accountRecords[0]


  return d([
    d([ d( "Ordinært resultat før skattekostnad" ), d( format.amount( taxCostRecord.accountingResultBeforeTax ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    "<br>",
    d([ d( "Permanente forskjeller" ), d( format.amount( taxCostRecord.permanentDifferences ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Endring i midlertidige forskjeller" ), d( format.amount( taxCostRecord.temporaryDifferences ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Estimatavvik på feilberegnet skatt forrige år" ), d( format.amount( taxCostRecord.taxEstimateCorrection ), {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Skattegrunnlag før bruk av fremførbart underskudd" ), d( format.amount( taxCostRecord.taxResultBeforeUtilizedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    "<br>",
    d([ d( "Inngående fremførbart underskudd" ), d( format.amount( taxCostRecord.accumulatedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Benyttet fremførbart underskudd" ), d( format.amount( taxCostRecord.utilizedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    d([ d( "Utgående fremførbart underskudd" ), d( format.amount( taxCostRecord.accumulatedLosses + taxCostRecord.utilizedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    "<br>",
    d([ d( "Skattegrunnlag etter bruk av fremførbart underskudd" ), d( format.amount( taxCostRecord.taxResultAfterUtilizedLosses ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
    "<br>",
    d([ d( "Årets skattekostnad" ), d( format.amount( taxCostRecord.taxCost ) , {class: "numberCell"})], {class: "financialStatementsRow"})
  ])
}
