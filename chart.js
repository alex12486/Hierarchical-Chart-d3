var diameter = 900, radius = diameter / 2, innerRadius = radius - 100;	
var request = new XMLHttpRequest();

request.open('GET', './libs/information.json');

request.onload = function () {
	var dataset = request.responseText;
	render(dataset);
};

request.send();

function render (dataset) {

var data = JSON.parse(dataset);
console.log(data)

var cluster = d3.layout.cluster()
    .size([360, innerRadius])
    .sort(null)
    .value(function(d) { return d.size; });

var bundle = d3.layout.bundle();

var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.85)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

var svg = d3.select(".diagram").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
		.append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")");


  var nodes = cluster.nodes(packageHierarchy(data)),
      links = packageImports(nodes);


svg.selectAll(".link")
	.data(bundle(links))
	.enter().append("path")
	.attr("class", "link")
	.attr("d", line);

  svg.selectAll(".node")
      .data(nodes.filter(function(n) { return !n.children; }))
    	.enter()
    	.append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
    	.append("text")
    	.attr("class", "text")
      .attr("dx", function(d) { console.log(d); return d.x < 180 ? 8 : -8; })
      .attr("dy", ".31em")
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
      .text(function(d) { return d.key; });

d3.select(self.frameElement).style("height", diameter + "px");
}



function packageHierarchy(classes) {
  var map = {};

  function find(name, data) {
    var node = map[name], i;
    if (!node) {
      node = map[name] = data || {name: name, children: []};
      if (name.length) {
        node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
        node.parent.children.push(node);
        node.key = name.substring(i + 1);
      }
    }
    return node;
  }

  classes.forEach(function(d) {
    find(d.name, d);
  });

  return map[""];
}


function packageImports(nodes) {
  var map = {},
      imports = [];

  nodes.forEach(function(d) {
    map[d.name] = d;
  });

  nodes.forEach(function(d) {
    if (d.imports) d.imports.forEach(function(i) {
      imports.push({source: map[d.name], target: map[i]});
    });
  });

  return imports;
}
