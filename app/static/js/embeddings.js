async function load_embeddings() {
    let embeddings = await fetch("/embeddings");
    embeddings = await embeddings.json();

    return embeddings;
}

async function draw_embeddings(width, height) {
    // Fetching embeddings
    let embeddings = await fetch("/embeddings");
    embeddings = await embeddings.json();


    // Set up SVG
    let svg = d3.select("#embeddings").append("svg")
        .attr("width", width)
        .attr("height", height);


    // Computing scale
    let xs = [];
    let ys = [];

    embeddings.forEach(emb => {
        xs.push(emb[1]);
        ys.push(emb[2]);
    });

    let x = d3.scaleLinear()
        .domain([Math.min(...xs), Math.max(...xs)])
        .range([0, width]);

    let y = d3.scaleLinear()
        .domain([Math.min(...ys), Math.max(...ys)])
        .range([height, 0]);


    // Add nodes
    svg.selectAll("nodes")
        .data(embeddings)
        .enter()
        .append("circle")
        .attr("cx", d => x(d[1]))
        .attr("cy", d => y(d[2]))
        .attr("r", 4);
}

// load_embeddings().then(res => console.table(res));
draw_embeddings(400, 400);