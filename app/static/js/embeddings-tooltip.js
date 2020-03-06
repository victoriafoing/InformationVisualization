const embeddings_tooltip = d3.select("#embeddings-tooltip");

function show_tooltip(data) {
    embeddings_tooltip.text('r/' + data[0]);
    embeddings_tooltip.style("opacity", "100%");
}

function move_tooltip() {
    embeddings_tooltip.style("left", d3.event.clientX - 50 + "px");
    embeddings_tooltip.style("top", d3.event.clientY + 50 + "px");
}

function hide_tooltip() {
    embeddings_tooltip.style("opacity", "0%");
}