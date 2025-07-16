const dataUrl =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

const svg = d3.select('svg');
const w = 800;
const h = 500;
svg.attr('width', w).attr('height', h);

const padding = 50;

const fetchGDPDataFromApi = async () => {
  try {
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const dataset = await response.json();
    const dates = dataset.map((d) => new Date(d['Year']));
    const parseTime = d3.timeParse('%M:%S');
    const times = dataset.map((d) => parseTime(d['Time']));

    const xScale = d3
      .scaleTime()
      .domain([d3.min(dates), d3.max(dates)])
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
      .attr('cx', (d) => xScale(new Date(d['Year'])))
      .attr('cy', (d) => yScale(parseTime(d['Time'])))
      .attr('r', (d) => 5)
      .attr('fill', (d) => (d['Doping'] ? 'orange' : 'green'));

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
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
fetchGDPDataFromApi();
