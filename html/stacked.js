var margin = {top: 0, right: 0, bottom: 0, left: 50},
    width = 580 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear().rangeRound([width, 0]);
var y = d3.scale.ordinal().rangeRoundBands([0, height], .1);

var color = d3.scale.ordinal().range(colorbrewer.YlGn[6]);

var xAxis = d3.svg.axis().scale(x).orient('bottom').tickFormat(d3.format('.0%'));
var yAxis = d3.svg.axis().scale(y).orient('left').tickSize(7, 0);

var svg = d3.select('#chart').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

d3.csv('./data/stacked.csv', function(error, data) {
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== 'Year'; }).sort().reverse());

  data.forEach(function(d) {
    var y0 = 0;
    d.amounts = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name], amount: d[name], year: d['Year']}; }).sort();
    d.amounts.forEach(function(d) { d.y0 /= y0; d.y1 /= y0; });
  });

  y.domain(data.map(function(d) { return d.Year; }));

  var section = svg.selectAll('.section')
    .data(data)
    .enter().append('g')
    .attr('class', 'section')
    .attr('transform', function(d) { return 'translate(0, ' + y(d.Year) + ')'; });

  section.selectAll('rect')
    .data(function(d) { return d.amounts; })
    .enter().append('rect')
    .attr('width', function(d) { return x(d.y0) - x(d.y1); })
    .attr('x', function(d) { return x(d.y1); })
    .attr('height', y.rangeBand())
    .style('fill', function(d) { return color(d.name); })
    .on('mouseover', highlight)
    .on('mouseout', lowlight);

  // svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
  svg.append('g').attr('class', 'y axis').call(yAxis);
});

function formatAmount(amount) {
  amount = amount | 0;
  amount = amount.toString();

  return amount.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.");
}

function highlight(item) {
  d3.selectAll('rect')
    .style('opacity', function(d) {
      if (d.name == item.name && d.year != item.year) {
        return 0.55;
      }
      else {
        return 1;
      }
    })
    .style('fill', function(d) {
      if (d.name == item.name) {
        return '#ed1c24';
      }
      else {
        return color(d.name);
      }
    });

  d3.selectAll('dl').style('display', 'block');

  var name = names['common'][item.name];
  if (names[item.year][item.name] !== undefined) {
    name = names[item.year][item.name];
  }

  d3.select('dd#year').html(item.year);
  d3.select('dd#name').html(name);
  d3.select('dd#appropriation').html(formatAmount(item.amount) + ' million');
}

function lowlight(item) {
  d3.selectAll('rect')
    .style('opacity', 1)
    .style('fill', function(d) { return color(d.name); });
}

var names = {
  common: {
    '01': 'Dronningen',
    '02': 'Medlemmer af det kongelige hus',
    '03': 'Folketinget',
    '05': 'Statsministeriet',
    '06': 'Udenrigsministeriet',
    '07': 'Finansministeriet',
    '08': 'Økonomi- og Erhvervsministeriet',
    '09': 'Skatteministeriet',
    '10': 'Økonomi- og Indenrigsministeriet',
    '11': 'Justitsministeriet',
    '12': 'Forsvarsministeriet',
    '14': 'Ministeriet for By, Bolig og Landdistrikter',
    '15': 'Socialministeriet',
    '16': 'Indenrigs- og Sundhedsministeriet',
    '17': 'Beskæftigelsesministeriet',
    '18': 'Integrationsministeriet',
    '19': 'Videnskabsministeriet',
    '20': 'Undervisningsministeriet',
    '21': 'Kulturministeriet',
    '22': 'Kirkeministeriet',
    '23': 'Miljøministeriet',
    '24': 'Fødevareministeriet',
    '27': 'Ministeriet for Familie- og Forbrugeranl.',
    '28': 'Trafikministeriet',
    '29': 'Klima- og Energiministeriet',
  },
  '2003': {},
  '2004': {},
  '2005': {
    '28': 'Transport- og Energiministeriet',
  },
  '2006': {
    '28': 'Transport- og Energiministeriet',
  },
  '2007': {
    '28': 'Transport- og Energiministeriet',
  },
  '2008': {
    '15': 'Velfærdsministeriet',
    '16': 'Ministeriet for Sundhed og Forebyggelse',
    '28': 'Transportministeriet',
  },
  '2009': {
    '15': 'Indenrigs- og Socialministeriet',
    '16': 'Ministeriet for Sundhed og Forebyggelse',
    '28': 'Transportministeriet',
  },
  '2010': {
    '15': 'Socialministeriet',
    '16': 'Indenrigs- og Sundhedsministeriet',
    '28': 'Transportministeriet',
  },
  '2011': {
    '08': 'Erhvervs- og Vækstministeriet',
    '15': 'Socialministeriet',
    '16': 'Indenrigs- og Sundhedsministeriet',
    '28': 'Transportministeriet',
  },
  '2012': {
    '08': 'Erhvervs- og Vækstministeriet',
    '15': 'Social- og Integrationsministeriet',
    '16': 'Ministeriet for Sundhed og Forebyggelse',
    '20': 'Ministeriet for Børn og Undervisning',
    '28': 'Transportministeriet',
    '29': 'Klima-, Energi- og Bygningsministeriet',
  },
  '2013': {
    '08': 'Erhvervs- og Vækstministeriet',
    '15': 'Social- og Integrationsministeriet',
    '16': 'Ministeriet for Sundhed og Forebyggelse',
    '19': 'Uddannelsesministeriet',
    '20': 'Ministeriet for Børn og Undervisning',
    '22': 'Ministeriet for Ligestilling og Kirke',
    '28': 'Transportministeriet',
    '29': 'Klima-, Energi- og Bygningsministeriet',
  },
  '2014': {
    '08': 'Erhvervs- og Vækstministeriet',
    '15': 'Social-, Børne- og Integrationsministeriet',
    '16': 'Ministeriet for Sundhed og Forebyggelse',
    '19': 'Uddannelsesministeriet',
    '20': 'Undervisningsministeriet',
    '22': 'Ministeriet for Ligestilling og Kirke',
    '28': 'Transportministeriet',
    '29': 'Klima-, Energi- og Bygningsministeriet',
  },
  '2015': {
    '08': 'Erhvervs- og Vækstministeriet',
    '15': 'Ministeriet for Børn, Ligestilling, Integration og Sociale Forhold',
    '16': 'Ministeriet for Sundhed og Forebyggelse',
    '19': 'Uddannelses- og Forskningsministeriet',
    '20': 'Undervisningsministeriet',
    '22': 'Kirkeministeriet',
    '28': 'Transportministeriet',
    '29': 'Klima-, Energi- og Bygningsministeriet',
  },
};
