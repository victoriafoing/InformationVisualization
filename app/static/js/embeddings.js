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
    svg.selectAll("nodes")
        .data(embeddings)
        .enter()
        .append("circle")
        .attr("class", "embedding-node")
        .attr("cx", d => x(d[1]))
        .attr("cy", d => y(d[2]))
        .attr("r", 8)
        .on("mouseover", show_tooltip)
        .on("mouseout", hide_tooltip);
}

draw_embeddings(600, 600);