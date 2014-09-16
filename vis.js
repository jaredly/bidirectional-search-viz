
var frontierColor = 'lightblue'

function treeMeUp(target, upsidedown, fullHeight) {

  fullHeight = fullHeight || 200
  var margin = {top: 20, right: 120, bottom: 20, left: 120},
      width = 960 - margin.right - margin.left,
      height = fullHeight - margin.top - margin.bottom;

  var i = 0,
      duration = 350,
      root;

  var tree = d3.layout.tree()
      .size([width, width]);

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.x, d.y]; });

  var svg = d3.select(target).append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  function init(flare) {
    root = flare;
    root.x0 = height / 2;
    root.y0 = 0;

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    update(root);
  };

  d3.select(self.frameElement).style("height", fullHeight + 'px')

  var treeData = {"name": "hi", children: [], depth: 1}

  init(treeData)

  function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    if (upsidedown) {
      nodes.forEach(function(d) { d.y = height - d.depth * 30; });
    } else {
      nodes.forEach(function(d) { d.y = d.depth * 30; });
    }

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.x0 + "," + source.y0 + ")"; })
        .on("click", click);

    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function(d) { return d.last ? "rgb(255, 22, 22)" : (d.frontier ? frontierColor : "#fff"); });

    /*
    nodeEnter.append("text")
        .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
        .text(function(d) { return d.name; })
        .style("fill-opacity", 1e-6);
    */

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    nodeUpdate.select("circle")
        .attr("r", 15)
        .style("fill", function(d) { return d.last ? "rgb(255, 22, 22)" : (d.frontier ? frontierColor : "#fff"); });

    /*
    nodeUpdate.select("text")
        .style("fill-opacity", 1);
    */

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.x + "," + source.y + ")"; })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    /*
    nodeExit.select("text")
        .style("fill-opacity", 1e-6);
    */

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
          var o = {x: source.x0, y: source.y0};
          return diagonal({source: o, target: o});
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          var o = {x: source.x, y: source.y};
          return diagonal({source: o, target: o});
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }

  return {update: update, root: treeData}
}

var children = [2, 3, 4, 2, 3, 2, 1]
var grandTotal = 0
  , grandisplay = document.getElementById('total')
  , finalFrontier = 0
  , frontierdisplay = document.getElementById('frontier')

function resetFrontier() {
  finalFrontier = 0;
  frontierdisplay.innerHTML = finalFrontier
}

function incFrontier(by) {
  finalFrontier += by || 1;
  frontierdisplay.innerHTML = finalFrontier
}

function resetGrandTotal() {
  grandTotal = 0;
  grandisplay.innerHTML = grandTotal
}

function incGrandTotal() {
  grandTotal += 1;
  grandisplay.innerHTML = grandTotal
}

function treeMaker(target, upsidedown, total, height) {
  var data = treeMeUp(target, upsidedown, height)
    , current = data.root
    , frontier = []
    , num = 0
  current.num = 0
  var ival = setInterval(function () {
    if (!current.children) current.children = []
    var branch = upsidedown ? 2 : children[current.num] // parseInt(Math.random() * 6) + 1
    if (current.children.length >= branch) {
      current.frontier = false
      incFrontier(-1)
      current = frontier.shift()
      if (!current.children) current.children = []
    }
    var node = {name: 'moon', frontier: true, children: [], depth: current.depth + 1, num: ++num}
    incFrontier()
    total--;
    incGrandTotal();
    if (total <= 0) {
      node.last = {awesome: true}
      clearInterval(ival)
    }
    current.children.push(node)
    frontier.push(node)
    data.update(current)
  }, 200)
}

function div(cls, inner) {
  var node = document.createElement('div')
  node.className = cls
  if (inner) node.innerHTML = inner
  return node
}

function container() {
  var node = div('viz')
  var total = div('total')
  var frontier = div('frontier')
  node.appendChild(total)
  node.appendChild(frontier)
  return {
    main: node,
    frontier: frontier,
    total: total,
  }
}

function bidirectional() {
  resetFrontier()
  resetGrandTotal()
  var nodes = container()
  var down = div('down')
  var up = div('up')
  nodes.main.appendChild(up)
  nodes.main.appendChild(down)
  treeMaker(down, true, 15)
  setTimeout(function () {
    treeMaker(up, false, 15)
  }, 100)

  document.body.appendChild(nodes.main)
}

function unidirectional() {
  resetFrontier()
  resetGrandTotal()
  treeMaker('#dumb', true, Math.pow(2, 7) + 10, 300)
}

// bidirectional()
// unidirectional()
