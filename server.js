//                     *********
//   SERVER FOR HOLDINGSERVICE SINGLE-PAGE APPLICATION
//                     *********
//
//   This server will only serve basic html, 
//   as most of the app will be rendered on the client
//

//EXTERNAL DEPENDENCIES
const express = require('express');
const app = express();

//INITIATE INTERNAL MIDDLEWARES
app.use("/static", express.static(__dirname + "/public"));

//SERVE STATIC HTML

app.get("/", (req,res)=>{res.send(`
<!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Holdingservice Beta</title>
      <meta name="description" content="Regnskapssystemet for holdingselskaper">
      <meta name="author" content="Holdingservice AS">
      <link rel="stylesheet" href="/static/styles.css">
    </head>
    <body>
        <div id="appContainer"></div>
        <script src="https://cdn.auth0.com/js/auth0-spa-js/1.2/auth0-spa-js.production.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.1.0/papaparse.min.js"></script>
        <script src="https://momentjs.com/downloads/moment-with-locales.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/cytoscape@3.18.0/dist/cytoscape.min.js"></script>
        <script src="/static/valueTypeViews.js"></script>
        <script src="/static/entityLabel.js"></script>
        <script src="/static/Views.js"></script>
        <script src="/static/adminPage.js"></script>
        <script src="/static/balanceNodesPage.js"></script>
        <script src="/static/transactionsPage.js"></script>
        <script src="/static/sharePurchasePage.js"></script>
        <script src="/static/operatingCostPage.js"></script>
        <script src="/static/dividendPage.js"></script>
        <script src="/static/paymentsPage.js"></script>
        <script src="/static/interestPage.js"></script>
        <script src="/static/sourceDocumentsPage.js"></script>
        <script src="/static/manualTransactionsPage.js"></script>
        <script src="/static/bankImport.js"></script>
        <script src="/static/accountingYearPage.js"></script>
        <script src="/static/reportPage.js"></script>
        <script src="/static/actorsPage.js"></script>
        <script src="/static/DatabaseConstructor.js"></script>
        <script src="/static/app.js"></script>
    </body>
  </html>
`)})

let port = 3000

// Server boot sequence
app.listen(port,  async () => {
    console.log("Static server listening on port: " + port);
})