const embeddings_tooltip = d3.select('#embeddings-tooltip');
const embeddings_thumbnail = embeddings_tooltip.select('#embeddings-tooltip-thumbnail');
const embeddings_title = embeddings_tooltip.select('#embeddings-tooltip-title');
const embeddings_description = embeddings_tooltip.select('#embeddings-tooltip-description');

function show_tooltip(data) {
    embeddings_title.text('r/' + data[0]);
    embeddings_thumbnail.attr("src", data[3]);
    embeddings_description.text(data[4]);

    embeddings_tooltip.style("opacity", "100%");
}

function move_tooltip() {
    embeddings_tooltip.style("left", d3.event.clientX - 50 + "px");
    embeddings_tooltip.style("top", d3.event.clientY + 50 + "px");
}

function hide_tooltip() {
    embeddings_tooltip.style("opacity", "0%");
}