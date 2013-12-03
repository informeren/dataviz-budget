function chart(source) {

// Define the size of the canvas
var width = 540,
    height = 540,
    radius = Math.min(width, height) / 2;

// Set up a linear scale for the diameter
var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

// Set up an exponential scale for the radius
var y = d3.scale.sqrt()
    .range([0, radius]);

// Set up a scale containing 6 categorical colors (from http://colorbrewer2.org/)
var color = d3.scale.ordinal().range(["#252525","#525252","#737373","#969696","#bdbdbd","#d9d9d9"]);

// Create and position an SVG element for the graph
var svg = d3.select('#chart').insert('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + (height / 2) + ')');

// Set up a partition layout based on budget amounts
var partition = d3.layout.partition()
    .value(function(d) { return d.amount2014; });

// Set up the parameters for drawing arcs
var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

// Load the JSON data and set up the chart
d3.json(source, function(error, root) {
  var path = svg.selectAll('path')
    .data(partition.nodes(root))
    .enter().append('path')
    .attr('d', arc)
    .style('fill', arcfill)
    .on('click', click)
    .on('mouseover', highlight)
    .on('mouseout', lowlight);

  function click(d) {
    path.transition()
      .duration(750)
      .attrTween('d', arcTween(d));
  }

  function arcfill(d) {
    return d.depth ? color((d.children ? d : d.parent).name) : d3.rgb('#f0f0f0');
  }

  function highlight(item) {
    d3.selectAll('path').style('opacity', function(d) {
      if (item.depth > 0 && d.account != item.account && !isChild(d, item.account)) {
        return 0.4;
      } else {
        return 1;
      }
    })
    .style('fill', function(d) {
      if (d.depth > 0 && d.account == item.account) {
        return '#ed1c24';
      }
      else {
        return arcfill(d);
      }
    });

    updateSidebar(item);
  }

  function lowlight(item) {
    d3.selectAll('path').style('opacity', 1).style('fill', arcfill);

    var root = getRoot(item);
    updateSidebar(root);
  }

});

// Interpolate the scales!
function arcTween(d) {
  var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
      yd = d3.interpolate(y.domain(), [d.y, 1]),
      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
  return function(d, i) {
    return i
      ? function(t) { return arc(d); }
      : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
  };
}

function getRoot(child) {
  return getRootHelper(child);
}

function getRootHelper(child) {
  if (child.label == 'ROOT') {
    return child;
  }
  else {
    return getRootHelper(child.parent);
  }
}

function isChild(child, name) {
  var parent = child.parent;
  while (parent != null) {
    if (parent.name == name) {
      return true;
    }
    else {
      parent = parent.parent;
    }
  }
  return false;
}

function formatAmount(amount) {
  amount = amount | 0;
  amount = amount.toString();

  return amount.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.");
}

function updateSidebar(item) {
  $('dd#label > span').html(item.name);
  $('dd#amount2012 > span').html(formatAmount(item.amount2012));
  $('dd#amount2013 > span').html(formatAmount(item.amount2013));
  $('dd#amount2014 > span').html(formatAmount(item.amount2014));
}

}
