function sample_post(full_data) {

	console.log(full_data)

    sample(d3.select('#select_sent').property('value'));

    function sample(sent) {

        data = full_data[sent]
        console.log(data)

        var myDiv = document.getElementById("comment_box");
        var div_open = "<div class=\"comment\" id=\"comment\">"
        var div_close = "</div>"
        var html_block = ""

        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {

                var sample = data[i]
                var post_url = sample.url + ""
                var subreddit_url = "https://www.reddit.com/r/"+sample.source

                html_block += "<div style=\"border-top:5px solid grey;\">"
                html_block += "<div style=\"padding:10px; font-size:15px;\"><p style=\"text-align:center;padding-top:10px;\"><b>Date:</b> "+sample.date+"&nbsp&nbsp&nbsp&nbsp<b>Source:</b> "+sample.source+"&nbsp&nbsp&nbsp&nbsp<b>Target:</b> "+sample.target+"&nbsp&nbsp&nbsp&nbsp<b>Sentiment:</b> "+sample.sent+"</p></div>"
                html_block += "<div><blockquote class=\"reddit-card\" data-card-created=\"1582734801\"><a id=\"post\" href="+post_url+"></a><a href="+subreddit_url+"></a></blockquote></div></div>"
            }
        } else {
            html_block = "<p style=\"padding:10px;margin:auto;\">No samples found.</p>"
        }

        myDiv.innerHTML = div_open + html_block + div_close;
    }

   	var selectbox = d3.select("#select_sent")
		.on("change", function() {
			sample(this.value);
		})

}
