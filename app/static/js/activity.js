function activity_timeline(data, subreddit) {

    // Get sentiment categories
    var keys = Object.keys(data[0]).slice(1)

	var parseTime = d3.timeParse("%Y-%m"),
		formatDate = d3.timeFormat("%b %Y"),
		bisectDate = d3.bisector(d => d.date).left,
		formatValue = d3.format(",.0f");

    // Convert to Date object
	data.forEach(function(d) {
		d.date = parseTime(d.date);
		return d;
	})

	var svg = d3.select("#activity"),
		margin = {top: 35, right: 35, bottom: 15, left: 35},
		width = +svg.attr("width") - margin.left - margin.right,
		height = +svg.attr("height") - margin.top - margin.bottom;

    // Define X-axis
	var x = d3.scaleTime()
		.range([margin.left, width - margin.right])
		.domain(d3.extent(data, d => d.date))

    // Define Y-axis
	var y = d3.scaleLinear()
		.rangeRound([height - margin.bottom, margin.top + 10]);

    // Colour scheme
	var z = d3.scaleOrdinal(d3.schemeCategory10);

	var line = d3.line()
		.curve(d3.curveCardinal)
		.x(data => x(data.date))
		.y(data => y(data.count));

    // Add and format x-axis
	svg.append("g")
		.attr("class","x-axis")
		.attr("transform", "translate(0," + (height - margin.bottom) + ")")
		.call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%Y")));

	svg.append("g")
		.attr("class", "y-axis")
		.attr("transform", "translate(" + margin.left + ",0)");

	var focus = svg.append("g")
		.attr("class", "focus")
		.style("display", "none");

	focus.append("line").attr("class", "lineHover")
		.style("stroke", "#999")
		.attr("stroke-width", 1)
		.style("shape-rendering", "crispEdges")
		.style("opacity", 0.5)
		.attr("y1", -height)
		.attr("y2",0);

	focus.append("text").attr("class", "lineHoverDate")
		.attr("text-anchor", "middle")
		.attr("font-size", 12);

	var overlay = svg.append("rect")
		.attr("class", "overlay")
		.attr("x", margin.left)
		.attr("width", width - margin.right - margin.left)
		.attr("height", height)

    var title = svg.selectAll(".myText").data([subreddit])
    title.exit().remove();
    title.enter().append("text")
        .attr("class","myText")
        .attr("x",width/4)
        .attr("y",margin.top)
    title.text(function(d) { return d; });

    // Update activity timeline based on selection box
	update(d3.select('#selectbox').property('value'), 0);

	function update(input, speed) {

        // Outgoing or Incoming Categories
		var filtered = keys.filter(f => f.includes(input))

        // Filter data
		var sentiments = filtered.map(function(id) {
			return {
				id: id,
				values: data.map(d => {return {date: d.date, count: +d[id]}})
			};
		});


        // Format Y-axis based on filtered data
		y.domain([
	        d3.min(sentiments, d => d3.min(d.values, c => c.count)),
			d3.max(sentiments, d => d3.max(d.values, c => c.count))
		]).nice();

		svg.selectAll(".y-axis").transition()
			.duration(speed)
			.call(d3.axisLeft(y).tickSize(-width + margin.right + margin.left))

		var sentiment = svg.selectAll(".sentiments")
			.data(sentiments);

		sentiment.exit().remove();

		sentiment.enter().insert("g", ".focus").append("path")
			.attr("class", "line sentiments")
			.style("stroke", d => z(d.id))
			.merge(sentiment)
		.transition().duration(speed)
			.attr("d", d => line(d.values))

        var activity_type = ""
        if (input == "_source") {
            activity_type = "Outgoing"
        }
        else if (input == "_target") {
            activity_type = "Incoming"
        }

        // Update title of plot
        var title = svg.selectAll(".myText").data([activity_type+" Activity for r/"+subreddit])
        title.exit().remove();
        title.enter().append("text")
            .attr("class","myText")
            .attr("x",width/4)
            .attr("y",margin.top)
        title.text(function(d) { return d; });

		tooltip(filtered, input);

	}

	function tooltip(filtered, input) {

		var labels = focus.selectAll(".lineHoverText")
			.data(filtered)

		labels.enter().append("text")
			.attr("class", "lineHoverText")
			.style("fill", d => z(d))
			.attr("text-anchor", "start")
			.attr("font-size",12)
			.attr("dy", (_, i) => 1 + i * 2 + "em")
			.merge(labels);

		var circles = focus.selectAll(".hoverCircle")
			.data(filtered)

		circles.enter().append("circle")
			.attr("class", "hoverCircle")
			.style("fill", d => z(d))
			.attr("r", 2.5)
			.merge(circles);

		svg.selectAll(".overlay")
			.on("mouseover", function() { focus.style("display", null); })
			.on("mouseout", function() { focus.style("display", "none"); })
			.on("mousemove", mousemove)
			.on("click", click_event);

        function click_event() {

			var x0 = x.invert(d3.mouse(this)[0]),
				i = bisectDate(data, x0, 1),
				d0 = data[i - 1],
				d1 = data[i],
				d = x0 - d0.date > d1.date - x0 ? d1 : d0;

			var month = d.date.getMonth()+1
			var year = d.date.getUTCFullYear()
            var fetch_url = '/sample/'+subreddit + '/' + month + '/' + year + '/'+input;
                    fetch(fetch_url)
                        .then(function (response) {
                            return response.json();
                        })
                        .then((data) => {
                            sample_post(data)
                        });

        }

		function mousemove() {

			var x0 = x.invert(d3.mouse(this)[0]),
				i = bisectDate(data, x0, 1),
				d0 = data[i - 1],
				d1 = data[i],
				d = x0 - d0.date > d1.date - x0 ? d1 : d0;

			focus.select(".lineHover")
				.attr("transform", "translate(" + x(d.date) + "," + height + ")");

			focus.select(".lineHoverDate")
				.attr("transform",
					"translate(" + x(d.date) + "," + (height + margin.bottom) + ")")
				.text(formatDate(d.date));

			focus.selectAll(".hoverCircle")
				.attr("cy", e => y(d[e]))
				.attr("cx", x(d.date));

			focus.selectAll(".lineHoverText")
				.attr("transform",
					"translate(" + (x(d.date)) + "," + height / 2.5 + ")")
				.text(e => e + ": " + formatValue(d[e]));

			x(d.date) > (width - width / 4)
				? focus.selectAll("text.lineHoverText")
					.attr("text-anchor", "end")
					.attr("dx", -10)
				: focus.selectAll("text.lineHoverText")
					.attr("text-anchor", "start")
					.attr("dx", 10)
		}
	}

	var selectbox = d3.select("#selectbox")
		.on("change", function() {
			update(this.value, 750);
		})
}
