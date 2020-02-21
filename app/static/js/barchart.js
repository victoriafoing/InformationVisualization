function get_info_on_var(variable) {
    var rel_meta = meta_data.find(function (d) {
        return d.Variabele == variable;
    })

    var label = rel_meta['Label_1'];
    var definition = rel_meta['Definition'];

    return [label, definition]
}

var width = 1000;
var height = 700;
var MOUSEOVER = false;

var svgContainer = d3.select("#barchart").append("svg")
    .attr("height", height)
    .attr("width", width);

var chart_height = 400,
    chart_width = 700;

// Code for vertical bar chart
var x = d3.scaleBand().rangeRound([0, chart_width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([chart_height, 0]);

// var x = d3.scaleLinear().rangeRound([0, chart_width]),
//     y = d3.scaleBand().rangeRound([chart_height, 0]).padding(0.1);

var chart_group = svgContainer.append("g")
    .attr("id", "chart_group")
    .attr("transform", "translate(" + 100 + "," + 50 + ")");

// Code for vertical bar chart
x.domain(x_variables);
y.domain([0, 100]);

console.log('x_variables : ', x_variables);

// x.domain([0, 100]);
// y.domain(x_variables);

chart_group.append("g")
    .attr("transform", "translate(" + 0 + "," + chart_height + ")")
    .call(d3.axisBottom(x));
// Code for vertical bar chart
chart_group.selectAll("text")
    .attr("y", 0)
    .attr("x", 9)
    .attr("transform", "rotate(90)")
    .style("text-anchor", "start");

chart_group.append("g")
    .call(d3.axisLeft(y));

var map = d3.map(data[0]);
console.log('map.entries() : ', map.entries())


// text label for the y axis
svgContainer.append("text")
    .attr("transform",
        "translate(" + 35 + "," + (height / 2 - 100) + ")")
    .style("text-anchor", "middle")
    .style("font-size", "13px")
    .text("Percentage");

chart_group.append("text")
    .attr("class", "title")
    .attr("id", "chart-title")
    .attr("y", -25)
    .attr("x", chart_width / 2)
    .style("font-weight", "bold")
    .style("text-anchor", "middle")
    .text("Rental statistics of " + selected_area);

// Code for vertical circle chart
chart_group.selectAll(".circle")
    .data(map.entries())
    .enter()
    .append("circle")
    .attr("class", "circle")
    .attr("cx", function (d) {
        console.log(x(d.key));
        return (x(d.key) + (x.bandwidth()/2));
    })
    .attr("cy", y(0))
    .attr("r", 15)
    .attr("fill", "#29e354")
    .on("mouseover", function (d, i) {
        var x_var = d.key;
        var value = d.value;
        var info = get_info_on_var(x_var);
        var label = info[0]
        var definition = info[1];

        displayTooltip("<b>Variable: </b>" + label + "<br /><b>Percentage: </b>" +
            value + "%<br /><b>Explanation: </b>" + definition)

        //d3.select(this).attr("fill", "DarkOrange");
    })
    .on("mousemove", function (d, i) {
        var x_var = d.key;
        var value = d.value;
        var info = get_info_on_var(x_var);
        var label = info[0]
        var definition = info[1];

        displayTooltip("<b>Variable: </b>" + label + "<br /><b>Percentage: </b>" +
            value + "%<br /><b>Explanation: </b>" + definition)

        //d3.select(this).attr("fill", "DarkOrange");
    })
    .on("mouseout", function (d) {
        hideTooltip();
        //d3.select(this).attr("fill", "steelblue");
    });

var circle_transition = d3.transition()
    .duration(750)
    .ease(d3.easeLinear);

chart_group.selectAll(".circle")
    .transition(circle_transition)
    .attr("cy", function (d) {
        return y(d.value);
    });