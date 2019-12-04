// Data preparation.
function filterData(data) {
  return data.filter(d => {
    return (
      d.partido !== undefined &&
      d.provincia !== undefined &&
      d.name !== undefined &&
      d.lastname !== undefined &&
      d.email !== undefined
    );
  });
}

function prepareBarChartData(data) {
  const dataMap = d3.rollup(
    data,
    v => v.length,
    d => d.disciplina_principal
  );

  const dataArray = Array.from(dataMap, d => ({
    disciplina: d[0],
    usersTotal: d[1]
  }));

  return dataArray;
}

// Main function.
function ready(users) {
  const usersClean = filterData(users);
  const barChartData = prepareBarChartData(usersClean).sort((a, b) => b.usersTotal - a.usersTotal);

  // Margin convention.
  const margin = {top: 80, right: 40, bottom: 40, left: 150};
  const width = 600 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  // Scales.
  const xMax = d3.max(barChartData, d => d.usersTotal);
  const xScale = d3
    .scaleLinear()
    .domain([0, xMax])
    .range([0, width]);
  
  const yScale = d3
    .scaleBand()
    .domain(barChartData.map(d => d.disciplina))
    .rangeRound([0, height])
    .paddingInner(0.25);

  // Draw base.
  const svg = d3.select('.bar-chart-container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Draw header.
  const header = svg
    .append('g')
    .attr('class', 'bar-header')
    .attr('transform', `translate(0,${-margin.top / 1.5})`)
    .append('text');
  
  header
    .append('tspan')
    .text('Usuarios registrados segun disciplina.');

  header
    .append('tspan')
    .text('Ordenados de mayor a menos convocatoria.')
    .attr('x', 0)
    .attr('y', '1.5em')
    .style('font-style', '0.8em')
    .style('fill', 'gray');

  // Draw bars.
  const bars = svg
    .selectAll('.bar')
    .data(barChartData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('y', d => yScale(d.disciplina))
    .attr('width', d => xScale(d.usersTotal))
    .attr('height', d => yScale.bandwidth())
    .style('fill', 'dodgerblue');

  // Draw axes.
  const xAxis = d3
    .axisTop(xScale)
    .tickFormat(formatTicks)
    .tickSizeInner(-height)
    .tickSizeOuter(0);

  const xAxisDraw = svg
    .append('g')
    .attr('class', 'x axis')
    .call(xAxis);

  const yAxis = d3
    .axisLeft(yScale)
    .tickSize(0);

  const yAxisDraw = svg
    .append('g')
    .attr('class', 'y axis')
    .call(yAxis);

  yAxisDraw
    .selectAll('text')
    .attr('dx', '-0.6em');
}

// Data utilities.
const parseEmpty = string => (string === "") ? undefined : string;
const parseDate = string => d3.timeParse('%Y-%d-%m')(string.substr(0, string.indexOf(" ")));

// Type conversion.
function type(d) {
  const name = parseEmpty(d.name);
  const lastName = parseEmpty(d.lastname);

  return {
    disciplina_principal: parseEmpty(d.disciplina_principal),
    email: parseEmpty(d.email),
    gender: (d.gender),
    idnumber: +d.idnumber,
    last_access: parseDate(d.last_access),
    lastname: lastName,
    name: name,
    partido: parseEmpty(d.partido),
    provincia: parseEmpty(d.provincia),
    full_name: `${name} ${lastName}`
  }
}

// Drawing utilities.
function formatTicks(d) {
  return d3.format('~s')(d)
    .replace('k', 'mil')
}

// Load data.
d3.csv("data/inscripciones_extended.csv", type).then(res => {
  ready(res);
});