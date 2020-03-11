var socket = io.connect('http://' + document.domain + ':' + location.port);
// verify our websocket connection is established
socket.on('connect', function () {
    console.log('Websocket connected!');
});

var fetch_url = '/top/2017/02';
fetch(fetch_url)
    .then(function (response) {
        return response.json();
    })
    .then((data) => {
        var margin = {
            top: 15,
            right: 100,
            bottom: 15,
            left: 150
        };

        // Create width and height
        // var width = 2 * 960 - margin.left - margin.right + 200,
        //height = 500 - margin.top - margin.bottom;
        var svg = d3.select("#barchart"),
            margin = {top: 35, right: 55, bottom: 15, left: 35},
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
            .on("click", function(d){
                console.log(d.name);
                var fetch_url = '/activity/'+d.name;
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
            .on("click", function(d){
                console.log(d.name);
                var fetch_url = '/activity/'+d.name;
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
    });
