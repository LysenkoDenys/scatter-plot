const dataUrl =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

const svg = d3.select('svg');
const w = 800;
const h = 500;
svg.attr('width', w).attr('height', h);

const padding = 60;

const tooltip = d3
  .select('#tooltip')
  .style('opacity', 0)
  .style('position', 'absolute');

const fetchCyclistData = async () => {
  try {
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const dataset = await response.json();
    const dates = dataset.map((d) => new Date(d['Year'], 0));
    const parseTime = d3.timeParse('%M:%S');
    const times = dataset.map((d) => parseTime(d['Time']));
    const formatTime = d3.timeFormat('%M:%S');

    console.log(times); //
    const minYear = d3.min(dates);
    const maxYear = d3.max(dates);

    const extendedMinYear = new Date(minYear);
    extendedMinYear.setFullYear(extendedMinYear.getFullYear() - 1);

    const extendedMaxYear = new Date(maxYear);
    extendedMaxYear.setFullYear(extendedMaxYear.getFullYear() + 1);

    const extendedMinTime = new Date(d3.min(times));
    extendedMinTime.setMinutes(extendedMinTime.getMinutes() - 1);

    const extendedMaxTime = new Date(d3.max(times));
    extendedMaxTime.setMinutes(extendedMaxTime.getMinutes() + 1);

    const xScale = d3
      .scaleTime()
      .domain([extendedMinYear, extendedMaxYear])
      .range([padding, w - padding]);

    const yScale = d3
      .scaleTime()
      .domain([d3.max(times), d3.min(times)])
      .range([h - padding, padding]);

    svg
      .selectAll('circle')
      .data(dataset)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(new Date(d['Year'], 0)))
      .attr('cy', (d) => yScale(parseTime(d['Time'])))
      .attr('r', (d) => 5)
      .attr('fill', (d) => (d['Doping'] ? 'orange' : 'green'))
      .attr('class', 'dot')
      .attr('data-xvalue', (d) => new Date(d['Year'], 0))
      .attr('data-yvalue', (d) => parseTime(d['Time']))
      // ========================================================
      .on('mouseover', function (event, d) {
        tooltip
          .style('opacity', 1)
          .style('display', 'block')
          .attr('data-year', new Date(d.Year, 0))
          .html(
            `${d.Name}: ${d.Nationality}<br>Year: ${d.Year}, Time: ${d.Time}`
          )
          .style('left', parseInt(xScale(new Date(d['Year'], 0))) + 10 + 'px')
          .style(
            'top',
            parseInt(yScale(parseTime(d['Time']))) + padding / 2 + 'px'
          );

        d3.select(this)
          .attr('fill', 'red')
          .transition()
          .duration(200)
          .attr('r', 7);
      })

      .on('mouseout', function () {
        tooltip.style('opacity', 0);
        d3.select(this)
          .attr('fill', (d) => (d.Doping ? 'orange' : 'green'))
          .attr('r', 5);
      });
    //===========================================================
    drawLegend(svg, w);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).tickFormat(formatTime);

    svg
      .select('#x-axis')
      .attr('transform', `translate(0,${h - padding})`)
      .call(xAxis);

    svg
      .select('#y-axis')
      .attr('transform', `translate(${padding},0)`)
      .call(yAxis);
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

const drawLegend = (svg, w) => {
  const legend = svg.append('g').attr('id', 'legend');

  legend
    .append('rect')
    .attr('x', w - 200)
    .attr('y', 100)
    .attr('width', 15)
    .attr('height', 15)
    .style('fill', 'orange');
  legend
    .append('text')
    .attr('x', w - 180)
    .attr('y', 112)
    .text('Riders with doping allegations')
    .style('font-size', '12px')
    .attr('alignment-baseline', 'middle');

  legend
    .append('rect')
    .attr('x', w - 200)
    .attr('y', 130)
    .attr('width', 15)
    .attr('height', 15)
    .style('fill', 'green');
  legend
    .append('text')
    .attr('x', w - 180)
    .attr('y', 142)
    .text('No doping allegations')
    .style('font-size', '12px')
    .attr('alignment-baseline', 'middle');
};

fetchCyclistData();
