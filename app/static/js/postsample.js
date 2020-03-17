function sample_post(data) {
	console.log(data)

    var post_url = data.url + ""
    var subreddit_url = "https://www.reddit.com/r/"+data.source

    // Create HTML
    var myDiv = document.getElementById("comment_box");
    var html_stats = "<p style=\"text-align:center;padding-top:10px;\"><b>Date:</b> "+data.date+"&nbsp&nbsp&nbsp&nbsp<b>Source:</b> "+data.source+"&nbsp&nbsp&nbsp&nbsp<b>Target:</b> "+data.target+"&nbsp&nbsp&nbsp&nbsp<b>Sentimnet:</b> "+data.sent+"</p>"
    var div_open = "<div class=\"comment\" id=\"comment\">"
    var html_block = "<blockquote class=\"reddit-card\" data-card-created=\"1582734801\"><a id=\"post\" href="+post_url+"></a><a href="+subreddit_url+"></a></blockquote>"
    var div_close = "</div>"
    myDiv.innerHTML = html_stats + div_open + html_block + div_close;
}
