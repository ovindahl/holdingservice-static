
//Annual report docs

let trialBalanceView = (financialYear) => d([
  h3(`1: Foreløpig saldobalanse`),
  d([d("Kontonr."), d("Konto"), d("Åpningsbalanse", {class: "numberCell"} ), d("Endring", {class: "numberCell"} ), d("Utgående balanse", {class: "numberCell"} )], {class: "trialBalanceRow"}),
  Object.keys( financialYear["accounts"] ).map( account =>  {

    let thisAccount = financialYear["accounts"][account]

    let opening = thisAccount.openingBalance.amount
    let closing = thisAccount.closingBalance.amount
    let change = closing - opening


    return d([ 
      d( account ), 
      d(H.Accounts[ account ]["label"] ), 
      d( format.amount( opening ), {class: "numberCell"}), 
      d( format.amount( change  ), {class: "numberCell"}), 
      d( format.amount( closing ), {class: "numberCell"}), 
    ], {class: "trialBalanceRow"})
  } ).join('')
])

let annualResultView = (financialYear) => {

let taxCostRecord = financialYear.accounts["8300"].accountRecords[0]

return d([
  h3(`3: Beregning av årsresultat, overføringer og disponeringer`),
  "<br>",
  d([ d( "Ordinært resultat før skattekostnad" ), d( format.amount( taxCostRecord.accountingResultBeforeTax ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
  d([ d( "Årets skattekostnad" ), d( format.amount( taxCostRecord.taxCost ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
  d([ d( "Årsresultat" ), d( format.amount( financialYear.accounts["8800"].closingBalance.amount ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
  "<br>",
  d([ d( "Overføres til Annen innskutt egenkapital" ), d( format.amount( financialYear.accounts["2050"].closingBalance.amount ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
  d([ d( "Overføres til Udekket tap" ), d( format.amount( financialYear.accounts["2080"].closingBalance.amount ) , {class: "numberCell"})], {class: "financialStatementsRow"}),
])
} 



let yearEndPage = (S, A) => {  

    let financialYear = S.selectedCompany["acc/financialYears"][S.selectedYear]

    return d([
    h3(`Årsavslutning ${S.selectedYear}`),
    "[Fin visualisering med overordnet status på prosessen]",
    "<br>",
    trialBalanceView(financialYear),
    "<br>",
    h3(`2: Beregning av årets skattekostnad og resultat etter skatt`),
      "<br>",
    taxCostView(financialYear),
    "<br>",
      annualResultView(financialYear),
    "<br>",
    annualReportView(S, financialYear),
    "<br>",
    h3("6: Utfylling av offentlige skjemaer"),
    d("RF-1028"),
    Object.entries(financialYear["reports"]["rf_1028"]).map( entry => `[${entry[0]}]: ${format.amount(entry[1])}`).join("<br>"),
    "<br><br>",
    d("RF-1167"),
    Object.entries(financialYear["reports"]["rf_1167"]).map( entry => `[${entry[0]}]: ${format.amount(entry[1])}`).join("<br>"),
    "<br>",
  ])
 }


 
let getAnnualReport = ( S, financialYear ) => {

  let virtualAccounts = [
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

  let headerRow = d([ d(""), d("Kontoer"), d( String(financialYear.year) , {class: "numberCell"} ), d( String( Number(financialYear.year) - 1), {class: "numberCell"} )  ], {class: "financialStatementsRow"} )

  let prevYear = S.selectedCompany["acc/financialYears"][Number(S.selectedYear) - 1] ? S.selectedCompany["acc/financialYears"][Number(S.selectedYear) - 1] : {}

  let prevYearAccounts = prevYear.annualReportAccounts ? prevYear.annualReportAccounts : {}

  let reportLines = [headerRow].concat( Object.keys(financialYear.annualReportAccounts).map( acc => d([
     d(`[${String(acc)}] ${virtualAccounts.filter( vacc => vacc.virtualAccount === acc )[0].label} `), 
     d(`${virtualAccounts.filter( vacc => vacc.virtualAccount === acc )[0].firstAccount} - ${virtualAccounts.filter( vacc => vacc.virtualAccount === acc )[0].lastAccount}`), 
     d( format.amount( Number(financialYear.annualReportAccounts[ acc ])), {class: "numberCell"} ), 
     d( format.amount( prevYearAccounts[acc] ? prevYearAccounts[acc] : "" ), {class: "numberCell"} ), 
    ], {class: "financialStatementsRow"} )
  ).join(''))
    

  return reportLines

}


let annualReportView = (S, financialYear) => {

  return d([
    h3(`5: Årsregnskap`),
    "<br>",
    d(getAnnualReport( S, financialYear ), {class: "borderAndPadding"}),
    "<br>",
    d([h3(`Noter`), notesText( S, financialYear )], {class: "borderAndPadding"}),
    "<br>",
  ])
}

let em = (content) => String('<span class="emphasizedText">' + content + '</span>')

let notesText = ( S, financialYear ) => {

  let shareCapital_openingBalance = financialYear.accounts["2000"] ? financialYear.accounts["2000"].openingBalance.amount : 0
  let shareCapital_closingBalance = financialYear.accounts["2000"] ? financialYear.accounts["2000"].closingBalance.amount : 0
  let shareCapital_change = shareCapital_closingBalance - shareCapital_openingBalance

  let sharePremium_openingBalance = financialYear.accounts["2020"] ? financialYear.accounts["2020"].openingBalance.amount : 0
  let sharePremium_closingBalance = financialYear.accounts["2020"] ? financialYear.accounts["2020"].closingBalance.amount : 0
  let sharePremium_change = sharePremium_closingBalance - sharePremium_openingBalance

  let otherEquity_openingBalance = financialYear.accounts["2030"] ? financialYear.accounts["2030"].openingBalance.amount : 0
  let otherEquity_closingBalance = financialYear.accounts["2030"] ? financialYear.accounts["2030"].closingBalance.amount : 0
  let otherEquity_change = otherEquity_closingBalance - otherEquity_openingBalance

  let taxRecord = financialYear.accounts["8300"].accountRecords[0]

  let taxRate = taxRecord.taxRate * 100 + "%"

  let shareCapitalAccount =  financialYear.accounts["2000"]

  let shareholders = Object.values(shareCapitalAccount.closingBalance.shareholders)

  let shareCount = shareCapitalAccount.closingBalance.shareCount

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
Skattekostnaden i resultatregnskapet omfatter både betalbar skatt for perioden og endring i utsatt skatt. Utsatt skatt er beregnet med ${em(taxRate)} på grunnlag av de midlertidige forskjeller som eksisterer mellom regnskapsmessige og skattemessige verdier, samt ligningsmessig underskudd til fremføring ved utgangen av regnskapsåret. Skatteøkende og skattereduserende midlertidige forskjeller som reverserer eller kan reversere i samme periode er utlignet og nettoført.
<br>
<h4>Note 2: Aksjekapital og aksjonærinformasjon</h4>
Foretaket har ${em( format.amount(shareCount) ) } aksjer, pålydende kr ${em( format.amount( S.selectedCompany["company/AoA/nominalSharePrice"] ) )}, noe som gir en samlet aksjekapital på kr ${em(format.amount( shareCapital_closingBalance ) )}. Selskapet har én aksjeklasse.
<br><br>
Aksjene eies av: 
<br>
${shareholders.map( shareholder => d(em(`${shareholder.id}: ${shareholder.shareCount} <br>`))).join('')}

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
    <td class="numberCell">${em( shareCapital_openingBalance ) }</td>
    <td class="numberCell">${em( sharePremium_openingBalance ) }</td>
    <td class="numberCell">${em( otherEquity_openingBalance ) }</td>
    <td class="numberCell">${em( shareCapital_openingBalance + sharePremium_openingBalance + otherEquity_openingBalance ) }</td>
  </tr>
  <tr>
    <td>Endring ila. året </td>
    <td class="numberCell">${em( shareCapital_change ) }</td>
    <td class="numberCell">${em( sharePremium_change ) }</td>
    <td class="numberCell">${em( otherEquity_change ) }</td>
    <td class="numberCell">${em( shareCapital_change + sharePremium_change + otherEquity_change ) }</td>
  </tr>
  <tr>
    <td>Egenkapital 31.12 </td>
    <td class="numberCell">${em( shareCapital_closingBalance ) }</td>
    <td class="numberCell">${em( sharePremium_closingBalance ) }</td>
    <td class="numberCell">${em( otherEquity_closingBalance ) }</td>
    <td class="numberCell">${em( shareCapital_closingBalance + sharePremium_closingBalance + otherEquity_closingBalance ) }</td>
  </tr>
</tbody>
</table>
<br>
<h4>Note 5: Skatt</h4>
${taxCostView(financialYear)}

<h4>Note 4: Lønnskostnader, antall ansatte, godtgjørelser, revisjonskostnader mm.</h4>
Selskapet har i ${em( S.selectedYear ) } ikke hatt noen ansatte og er således ikke pliktig til å ha tjenestepensjon for de ansatte etter Lov om obligatoriske tjenestepensjon. Det er ikke utdelt styrehonorar.
<br><br>
Kostnadsført revisjonshonorar for ${em( S.selectedYear ) } utgjør kr ${em( 0 ) }. Honorar for annen bistand fra revisor utgjør kr ${em( 0 ) }.



<h4>Note 6: Bankinnskudd</h4>
Posten inneholder kun frie midler.

<h4>Note 7: Gjeld til nærstående, ledelse og styre</h4>
Selskapet har gjeld til følgende nærstående personer: <br>

${shareholders.map( shareholder => d(em(`${shareholder.shareholder}: ${shareholder.creditOutstanding} <br>`))).join('')}

`}

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


