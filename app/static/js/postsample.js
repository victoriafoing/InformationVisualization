function sample_post(data) {
	console.log(data)

    var post_url = data.url + ""
    var subreddit_url = "https://www.reddit.com/r/"+data.source

    // Create HTML
    var myDiv = document.getElementById("comment");
    var html = "<blockquote class=\"reddit-card\" data-card-created=\"1582734801\"><a id=\"post\" href="+post_url+"></a><a href="+subreddit_url+"></a></blockquote>"
    myDiv.innerHTML = html;
}
