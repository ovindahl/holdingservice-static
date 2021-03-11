/* 
//Page views

let graphView = State => {

    return d("", {id: "cy"})
  
  }
  
  let renderGraph = State => {
  
    let allTransactions = State.DB.get( State.S.selectedCompany , 9817)
    
  
    let selectedTransaction = allTransactions.find( t => State.DB.get(t, 8354) === State.S.selectedCompanyEventIndex  )
  
    let nodes = State.DB.get( State.S.selectedCompany , 10052)().map( e => returnObj({data: {
      id: String(e), 
      label: State.DB.get(e, 6),
      col: 1,
      weight: 50,
      color: "black"
    } }  ) )
    let edges = allTransactions
      .filter( t => isNumber( State.DB.get(t, "transaction/originNode") ) && isNumber( State.DB.get(t, "transaction/destinationNode") )   )
      .map( t => returnObj({data: {
        id: String(t), 
        source: String( State.DB.get(t, "transaction/originNode") ), 
        target: String( State.DB.get(t, "transaction/destinationNode") ),
        label: t === selectedTransaction ? formatNumber( State.DB.get(t, 8748), 0 ) : "",
        weight: 3 + State.DB.get(t, 8748) / 1000000
      }}) )
  
    log({nodes, edges})
  
    let elements = nodes.concat(edges)
  
    cytoscape({
  
      container: document.getElementById('cy'), // container to render in
      elements,
      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'label': 'data(label)',
            'width': 'data(weight)',
            'height': 'data(weight)',
          }
        },
    
        {
          selector: 'edge',
          style: {
            'width': 'data(weight)',
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)'
          }
        }
      ],
    
      layout: {
        name: 'grid',
        position: node => returnObj({
          col: node.data('col')
         })
      }
    
    });
  } 
  
   */