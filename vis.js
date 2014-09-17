
var frontierColor = 'lightblue'
var connectorColor = 'green'

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

  var treeData = {"name": "hi", children: [], depth: 1, last: {awesome: true}}

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

    var colorMe = function (d) {
      return d.last ? "rgb(255, 22, 22)" :
               (d.connector ? connectorColor :
                 (d.frontier ? frontierColor : "#fff"));
    }

    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", colorMe)

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
        .style("fill", colorMe);

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
/*
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
*/

function treeMaker(target, opts) { // upsidedown, total, tracker, height, wait) {
  var data = treeMeUp(target, opts.upsidedown, opts.height)
    , current = data.root
    , total = opts.total
    , frontier = []
    , num = 0


  current.num = 0
  current.final = true
  var ival = setInterval(function () {
    if (!current.children) current.children = []
    var branch = opts.upsidedown ? 2 : children[current.num] // parseInt(Math.random() * 6) + 1
    if (current.children.length >= branch) {
      current.frontier = false
      opts.tracker.incFrontier(-1)
      current = frontier.shift()
      if (!current.children) current.children = []
    }
    var node = {name: 'moon', frontier: true, children: [], depth: current.depth + 1, num: ++num}
    opts.tracker.incFrontier()
    total--;
    opts.tracker.incGrandTotal();
    if (total <= 0) {
      if (opts.connect) {
        node.connector = {awesome: true}
      } else {
        node.last = {awesome: true}
      }
      clearInterval(ival)
    }
    current.children.push(node)
    frontier.push(node)
    data.update(current)
  }, opts.wait || 400)
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

function makeTracker(nodes) {
  var total = 0
  , frontier = 0
  function updateFrontier() {
    nodes.frontier.innerHTML = frontier
  }
  function updateTotal() {
    nodes.total.innerHTML = total
  }
  return {
    resetFrontier: function () {
      frontier = 0
      updateFrontier()
    },
    resetGrandTotal: function () {
      total = 0
      updateTotal()
    },
    incFrontier: function (by) {
      frontier += by || 1
      updateFrontier()
    },
    incGrandTotal: function () {
      total += 1
      updateTotal()
    },
  }
}

function bidirectional() {
  var nodes = container()
  var tracker = makeTracker(nodes)
  var down = div('down')
  var up = div('up')
  nodes.main.appendChild(up)
  nodes.main.appendChild(down)
  treeMaker(down, {
    upsidedown: true,
    total: 15,
    connect: true,
    tracker: tracker
  })
  setTimeout(function () {
    treeMaker(up, {
      upsidedown: false,
      total: 15,
      connect: true,
      tracker: tracker
    })
  }, 200)

  document.body.appendChild(nodes.main)
}

function unidirectional() {
  var nodes = container()
  var node = div('normal')
  nodes.main.appendChild(node)
  var tracker = makeTracker(nodes)
  treeMaker(node, {
    upsidedown: true,
    total: Math.pow(2, 7) + 10,
    tracker: tracker,
    height: 300,
    wait: 200
  })
  document.body.appendChild(nodes.main)
}

// bidirectional()
// unidirectional()
