var socket = io.connect('http://' + document.domain + ':' + location.port);
// verify our websocket connection is established
socket.on('connect', function () {
    console.log('Websocket connected!');
});

var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var formatDateM = d3.timeFormat("%m %Y");
var formatDate4bar = d3.timeFormat("/top/" + "%Y/ %m");
var parseDate = d3.timeParse("%m/%y");

var startDate = new Date("2015-01"),
    endDate = new Date("2015-12");

var margin = {top:150, right:50, bottom:0, left:50},
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
    .range([0, targetValue])
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
    .data(x.ticks(12))
    .enter()
    .append("text")
    .attr("x", x)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatDate(d); });

var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

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
  drawPlot(dataset);
  
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
    console.log("Slider moving: " + moving + currentValue);
  }
}

function drawPlot(data) {
  var locations = plot.selectAll(".location")
    .data(data);

  // if filtered dataset has more circles than already existing, transition new ones in
  locations.enter()
    .append("circle")
    .attr("class", "location")
    .attr("cx", function(d) { return x(d.date); })
    .attr("cy", height/2)
    .style("fill", function(d) { return d3.hsl(d.date/1000000000, 0.8, 0.8)})
    .style("stroke", function(d) { return d3.hsl(d.date/1000000000, 0.7, 0.7)})
    .style("opacity", 0.5)
    .attr("r", 8)
      .transition()
      .duration(400)
      .attr("r", 25)
        .transition()
        .attr("r", 8);

  // if filtered dataset has less circles than already existing, remove excess
  locations.exit()
    .remove();
}


function update(h) {
  // update position and text of label according to slider scale
  handle.attr("cx", x(h));
  label
    .attr("x", x(h))
    .text(formatDate(h));

  console.log(formatDateM(h))
  // filter data set and redraw plot
  //var newData = dataset.filter(function(d) {
    
    //return d.date = h;
  //})
  // var fetch_url = '/top/2015/02';
  var fetch_url = formatDate4bar(h)
  fetch(fetch_url)
    .then(function (response) {
        return response.json();
    })
    .then((data) => bar_chart(data))
  //drawPlot(newData);
}

function bar_chart(data) {
  // Create width and height
  // var width = 2 * 960 - margin.left - margin.right + 200,
  //height = 500 - margin.top - margin.bottom;
  var svg = d3.select("#barchart"),
      margin = { top: 35, right: 55, bottom: 15, left: 35 },
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

  var spread = 40;
  // Create svg
  /*var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
*/
  // X will be a linear scale from 0 to max

  var xLeft = d3.scaleLinear()
      .range([0, width / 2 - spread])
      .domain([0, d3.max(data.hated, function (d) {
          return d.count;
      })]);

  var xRight = d3.scaleLinear()
      .range([0, width / 2 - spread])
      .domain([0, d3.max(data.loved, function (d) {
          return d.count;
      })]);

  // Y will be an ordinal scale with the names
  var yLeft = d3.scaleBand()
      .rangeRound([height, 0])
      .padding(0.1)
      .domain(data.hated.map(function (d) {
          return d.name;
      }));

  var yRight = d3.scaleBand()
      .rangeRound([height, 0])
      .padding(0.1)
      .domain(data.loved.map(function (d) {
          return d.name;
      }));

  var yAxisLeft = d3.axisLeft(yLeft)
      .scale(yLeft)
      .tickSize(0);

  var yAxisRight = d3.axisRight(yRight)
      .scale(yRight)
      .tickSize(0);

  var gy = svg.append("g")
      .attr("class", "y axis")
      .call(yAxisLeft);

  var gy = svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + ", 0)")
      .call(yAxisRight);

  var barsLeft = svg.selectAll(".bar")
      .data(data.hated)
      .enter()
      .append("g")
      .on("click", function (d) {
          console.log(d.name);
          var fetch_url = '/activity/' + d.name;
          fetch(fetch_url)
              .then(function (response) {
                  return response.json();
              })
              .then((data) => activity_timeline(data))
      });


  var barsRight = svg.selectAll(".bar")
      .data(data.loved)
      .enter()
      .append("g")
      .on("click", function (d) {
          console.log(d.name);
          var fetch_url = '/activity/' + d.name;
          fetch(fetch_url)
              .then(function (response) {
                  return response.json();
              })
              .then((data) => activity_timeline(data))
      });


  console.log('appending bars');

  // Append bars
  barsLeft.append("rect")
      .attr("class", "bar")
      .attr("y", function (d) {
          return yLeft(d.name);
      })
      .attr("height", yLeft.bandwidth())
      .attr("x", 0)
      .attr("width", function (d) {
          return xLeft(d.count);
      });

  //add a value label to the right of each bar
  barsLeft.append("text")
      .attr("class", "label")
      //y position of the label is halfway down the bar
      .attr("y", function (d) {
          return yLeft(d.name) + yLeft.bandwidth() / 2 + 4;
      })
      //x position is 3 pixels to the right of the bar
      .attr("x", function (d) {
          return xLeft(d.count) + 3;
      })
      .text(function (d) {
          return d.count;
      });

  barsRight.append("rect")
      .attr("class", "bargood")
      .attr("y", function (d) {
          return yRight(d.name);
      })
      .attr("height", yRight.bandwidth())
      .attr("x", function (d) {
          return width - xRight(d.count);
      })
      .attr("width", function (d) {
          return xRight(d.count);
      });

  //add a value label to the right of each bar
  barsRight.append("text")
      .attr("class", "label")
      //y position of the label is halfway down the bar
      .attr("y", function (d) {
          return yRight(d.name) + yRight.bandwidth() / 2 + 4;
      })
      //x position is 3 pixels to the right of the bar
      .attr("x", function (d) {
          return width - xRight(d.count) - 40;
      })
      .text(function (d) {
          return d.count;
      });

  svg.append("text")
      .attr("class", "title")
      .attr("x", (width / 2))
      .attr("y", margin.top)
      .attr("text-anchor", "middle")
      .text("Interactive timeline");


  console.log("end");

}
