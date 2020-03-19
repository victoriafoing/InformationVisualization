const embeddings_handle = {};

const draw_embeddings = async (width, height) => {
    // Fetching embeddings
    const embeddings = await (await fetch("/embeddings")).json();


    // Set up SVG
    const svg = d3.select("#embeddings").append("svg")
        .attr("width", width)
        .attr("height", height)
        .on("mousemove", move_tooltip);


    // Computing scale
    const xs = [];
    const ys = [];
    const margin = 0.1;

    embeddings.forEach(d => {
        xs.push(d[1]);
        ys.push(d[2]);
    });

    const x = d3.scaleLinear()
        .domain([Math.min(...xs), Math.max(...xs)])
        .range([margin * width, (1 - margin) * width]);

    const y = d3.scaleLinear()
        .domain([Math.min(...ys), Math.max(...ys)])
        .range([(1 - margin) * height, margin * height]);


    // Add labels
    const labels = svg.selectAll()
        .data(embeddings)
        .enter()
        .append("text")
        .attr("class", "embedding-label")
        .attr("x", d => x(d[1]))
        .attr("y", d => y(d[2]))
        .text(d => d[0]);


    // Add nodes
    const circle_radius = 6;

    const circles = svg.selectAll()
        .data(embeddings)
        .enter()
        .append("circle")
        .attr("class", "embedding-node")
        .attr("cx", d => x(d[1]))
        .attr("cy", d => y(d[2]))
        .attr("r", circle_radius)
        .on("mouseover", show_tooltip)
        .on("mouseout", hide_tooltip)
        .on("click", function(d){
            var fetch_url = '/activity/'+d[0];
            fetch(fetch_url)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    activity_timeline(data, d[0])
                });

        });


    // Zoom behaviour
    const scale_attenuation = 5;
    const max_zoom = 8;
    const label_zoom_treshold = 2.5;

    const before_zoom = () => {
        svg.style("cursor", "grabbing");
    };

    const after_zoom = () => {
        svg.style("cursor", "grab");
    };

    const zoomed = () => {
        const transform = d3.event.transform;
        const tx = transform.x;
        const ty = transform.y;
        const k = transform.k;

        // Labels
        if (k > label_zoom_treshold) {
            const label_opacity = Math.min(2 * (k - label_zoom_treshold) / (max_zoom - label_zoom_treshold) * 100, 100);
            labels.attr("x", d => k * x(d[1]) + tx - 4 * d[0].length)
                .attr("y", d => k * y(d[2]) + ty - 20)
                .style("opacity", label_opacity + '%')
                .text(d => d[0]);
        } else {
            labels.text("");
        }

        // Circles
        const new_r = (1 + (k - 1) / scale_attenuation) * circle_radius;
        circles.attr("cx", d => k * x(d[1]) + tx)
            .attr("cy", d => k * y(d[2]) + ty)
            .attr("r", new_r);
    };

    const zoom = d3.zoom()
        .extent([
            [0, 0],
            [width, height]
        ])
        .translateExtent([
            [0, 0],
            [width, height]
        ])
        .scaleExtent([1, max_zoom])
        .on("start", before_zoom)
        .on("zoom", zoomed)
        .on("end", after_zoom);

    svg.call(zoom);

    // Handle
    embeddings_handle.select_node = subreddit_id => {
        const selection_zoom = 6;

        // Select node
        let found = false;
        const node = circles.filter(d => {
            if (d[0] === subreddit_id) {
                found = true;
                return true;
            }
            return false;
        });
        if (!found) {
            return;
        }

        // Update transform
        const node_data = node.data()[0];
        const node_x = selection_zoom * x(node_data[1]);
        const node_y = selection_zoom * y(node_data[2]);

        const translate_x = (width / 2 - node_x) / selection_zoom;
        const translate_y = (height / 2 - node_y) / selection_zoom;

        const new_transform = d3.zoomIdentity
            .scale(selection_zoom)
            .translate(translate_x, translate_y);

        svg.transition().duration(1000).call(zoom.transform, new_transform);
    };
};

draw_embeddings(1000, 600);


// Force-based labelling
// const label_array = [];
// const anchor_array = [];

// embeddings.forEach(d => {
//     label_item = {
//         name: 'r/' + d[0],
//         x: x(d[1]),
//         y: y(d[1])
//     }
//     anchor_item = {
//         x: x(d[1]),
//         y: y(d[1]),
//         r: circle_radius
//     }
//     // console.log(label_item);
// });