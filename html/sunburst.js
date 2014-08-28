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

// Set up a scale with colors based on http://bl.ocks.org/mbostock/5577023
var color = d3.scale.ordinal().range(colorbrewer.YlGn[6]);

// Set up a partition layout based on budget amounts
var partition = d3.layout.partition()
    .value(function(d) { return d.appropriation; });

// Set up the parameters for drawing arcs
var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

function initChart() {
  // Create and position an SVG element for the graph
  var svg = d3.select('#chart').insert('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + width / 2 + ',' + (height / 2) + ')')
      .attr('id', 'sunburst');
}

function chart(source) {
  var svg = d3.selectAll('#sunburst');

  // Load the JSON data and set up the chart
  d3.json(source, function(error, root) {
    updateSidebar(root);

    svg.selectAll('path').remove();
    svg.selectAll('path')
      .data(partition.nodes(root))
      .enter().append('path')
      .attr('d', arc)
      .style('fill', arcfill)
      .on('click', click)
      .on('mouseover', highlight)
      .on('mouseout', lowlight);
  });
}

function click(d) {
  var path = d3.selectAll('#sunburst').selectAll('path');
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
  var year = d3.select('#year').property('value');

  d3.select('dd#name').html(item.name);
  d3.select('dd#report').html(formatAmount(item.report) + ' million');
  d3.select('dd#budget').html(formatAmount(item.budget) + ' million');
  d3.select('dd#appropriation').html(formatAmount(item.appropriation) + ' million');

  d3.select('dt#label-a').text('Appropriation ' + year);
  year--;
  d3.select('dt#label-b').text('Budget ' + year);
  year--;
  d3.select('dt#label-r').text('Report ' + year);
}

function updateChart() {
  var year = d3.select('#year').property('value');
  chart('./data/' + year + '.json');
}

d3.selectAll('#year').on('change', updateChart);

// Go!
initChart();
updateChart();
