import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 20, right: 20, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoEqualEarth()

let path = d3.geoPath().projection(projection)

Promise.all([
  d3.json(require('./data/world.topojson')),
  d3.csv(require('./data/flights.csv')),
  d3.csv(require('./data/airport-codes-subset.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, flights, airports]) {
  let countries = topojson.feature(json, json.objects.countries)

  let coordsJFK = [-73.78, 40.64]

  let coordinateStore = d3.map()
  airports.forEach(d => {
    let name = d.iata_code
    let coords = [d.longitude, d.latitude]
    coordinateStore.set(name, coords)
  })

  // console.log(coordinateStore)
  projection
    .fitExtent([[0, 0], [width, height], countries])
    .fitSize([width, height], countries)

  svg
    .append('path')
    .datum({ type: 'Sphere' })
    .attr('d', path)
    .attr('fill', '#9ED0EA')

  svg
    .selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('stroke', 'black')
    .attr('stroke-width', 0.5)
    .attr('fill', 'lightgray')

  svg
    .selectAll('.transit')
    .data(flights)
    .enter()
    .append('path')
    .attr('d', d => {
      var geoLine = {
        type: 'LineString',
        coordinates: [coordsJFK, coordinateStore.get(d.code)]
      }

      // console.log(geoLine)
      return path(geoLine)
    })
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', 1.5)
    .attr('stroke-linecap', 'round')
    .attr('opacity', 0.5)

  svg
    .selectAll('.airports')
    .data(airports)
    .enter()
    .append('circle')
    .attr('class', 'airports')
    .attr('r', 2)
    .attr('fill', 'white')
    .attr('transform', d => {
      var coords = [d.longitude, d.latitude]
      return `translate(${projection(coords)})`
    })

  svg
    .append('circle')
    .attr('class', 'jfk')
    .attr('r', 3)
    .attr('fill', 'white')
    .attr('transform', `translate(${projection(coordsJFK)})`)
}
