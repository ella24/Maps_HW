import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoMercator()
let graticule = d3.geoGraticule()
let path = d3.geoPath().projection(projection)

Promise.all([
  d3.json(require('./data/world.topojson')),
  d3.csv(require('./data/world-cities.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, datapoints]) {
  let countries = topojson.feature(json, json.objects.countries)

  var xExtent = d3.extent(datapoints, d => +d.x)
  var yExtent = d3.extent(datapoints, d => +d.y)

  let populationExtent = d3.extent(datapoints, d => d.population)

  var colorScale = d3
    .scaleSequential(d3.interpolateViridis)
    .domain()
    .clamp(true)

  svg
    .selectAll('.cities')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', 'cities')
    .attr('r', 1)
    .attr('transform', d => {
      let coords = projection([d.lng, d.lat])
      return `translate(${coords})`
    })
    .attr('fill', d => {
      return colorScale(d.populationExtent)
    })

  svg
    .selectAll('.countries')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'state')
    .attr('d', path)
    .attr('fill', 'black')
    .attr('stroke', 'black')

  svg
    .append('path')
    .datum(graticule())
    .attr('d', path)
    .attr('stroke', 'lightgrey')
    .lower()
}
