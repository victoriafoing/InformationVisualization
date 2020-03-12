async function draw_embeddings(width, height) {
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

    embeddings.forEach(emb => {
        xs.push(emb[1]);
        ys.push(emb[2]);
    });

    const x = d3.scaleLinear()
        .domain([Math.min(...xs), Math.max(...xs)])
        .range([margin * width, (1 - margin) * width]);

    const y = d3.scaleLinear()
        .domain([Math.min(...ys), Math.max(...ys)])
        .range([(1 - margin) * height, margin * height]);


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
        .on("mouseout", hide_tooltip);


    // Zoom behaviour
    const scale_attenuation = 5;
    const max_zoom = 8;

    const zoomed = function () {
        const transform = d3.event.transform;
        const tx = transform.x;
        const ty = transform.y;
        const k = transform.k;

        circles.attr("cx", d => k * x(d[1]) + tx);
        circles.attr("cy", d => k * y(d[2]) + ty);
        circles.attr("r", (1 + (k - 1) / scale_attenuation) * circle_radius);
    }

    svg.call(
        d3.zoom()
        .extent([
            [0, 0],
            [width, height]
        ])
        .translateExtent([
            [0, 0],
            [width, height]
        ])
        .scaleExtent([1, max_zoom])
        .on("zoom", zoomed)
    );
}


draw_embeddings(600, 600);