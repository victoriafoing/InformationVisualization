var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var formatDateM = d3.timeFormat("%m %Y");
var date2fetch = d3.timeFormat("/top/%y/%m")
var parseDate = d3.timeParse("%m/%d/%y");

var startDate = new Date("2013-01-01"),
    endDate = new Date("2017-01-01");

var margin = {top:200, right:110, bottom:0, left:110},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#vis")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);  

////////// slider //////////

var moving = false;
var currentValue = 0;
var targetValue = width;

var playButton = d3.select("#play-button");
    
var x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, targetValue, 48])
    .clamp(true);

var slider = svg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + margin.left + "," + height/5 + ")");

slider.append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { slider.interrupt(); })
        .on("start drag", function() {
          currentValue = d3.event.x;
          update(x.invert(currentValue)); 
        })
    );

slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
  .selectAll("text")
    .data(x.ticks(10))
    .enter()
    .append("text")
    .attr("x", x)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatDateIntoYear(d); });

var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9)
    .style("fill", "steelblue");

var label = slider.append("text")  
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(formatDate(startDate))
    .attr("transform", "translate(0," + (-25) + ")")

 
////////// plot //////////

var dataset;

var plot = svg.append("g")
    .attr("class", "plot")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("static/js/circles.csv", prepare, function(data) {
  dataset = data;
  // drawPlot(dataset);

  playButton
    .on("click", function() {
    var button = d3.select(this);
    if (button.text() == "Pause") {
      moving = false;
      clearInterval(timer);
      // timer = 0;
      button.text("Play");
    } else {
      moving = true;
      timer = setInterval(step, 100);
      button.text("Pause");
    }
    console.log("Slider moving: " + moving);
  })
})

function prepare(d) {
  d.id = d.id;
  d.date = parseDate(d.date);
  return d;
}
  
function step() {
  update(x.invert(currentValue));
  currentValue = currentValue + (targetValue/151);
  if (currentValue > targetValue) {
    moving = false;
    currentValue = 0;
    clearInterval(timer);
    // timer = 0;
    playButton.text("Play");
    console.log("Slider moving: " + moving);
  }
}

// function drawPlot(data) {
//   var locations = plot.selectAll(".location")
//     .data(data);

//   // if filtered dataset has more circles than already existing, transition new ones in
//     locations.enter()
//         .append("circle")
//         .attr("class", "location")
//         .attr("cx", function(d) { return x(d.date); })
//         .attr("cy", height/2)
//         .style("fill", function(d) { return d3.hsl(d.date/1000000000, 0.8, 0.8)})
//         .style("stroke", function(d) { return d3.hsl(d.date/1000000000, 0.7, 0.7)})
//         .style("opacity", 0.5)
//         .attr("r", 8)
//         .transition()
//         .duration(400)
//         .attr("r", 25)
//             .transition()
//             .attr("r", 8);

//     locations.exit()
//         .remove();
// }

         
function update(h) {
  // update position and text of label according to slider scale
  handle.attr("cx", x(h));
  label
    .attr("x", x(h))
    .text(formatDate(h));

  // filter data set and redraw plot
//   var newData = dataset.filter(function(d) {return d.date < h ? this : null; })
//   newDData = fetch(date2fetch(h)).then(function (response) { return response.json(); })

//   bar_chart(newDData);
//   var Mmatrix = [
//     [11975,  5871, 8916, 2868],
//     [ 1951, 10048, 2060, 6171],
//     [ 8010, 16145, 8090, 8045],
//     [ 1013,   990,  940, 6907]
//   ];
  // drawPlot(newData);
//   drawChord(Mmatrix);
}
