var g_BlogID = -1;

function loadBlogInfo(blogInfo)
{
    let title = blogInfo["title"];
    let date = new Date(blogInfo["date"]);
    let tags = blogInfo["tags"];
	let image = blogInfo["image"];
	let content = blogInfo["content"];

    document.title = title;
    document.getElementsByClassName("blogTitle")[0].innerHTML = title;
    document.getElementsByClassName("blogDate")[0].innerHTML = date.toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' });

    let tagsString = "Tags: ";
    let first = true;
    for( let tag of tags )
    {
        tagsString += '<b><a href="blog/tag/' + tag +'">' + (!first ? ' | ' : "") + tag + '</a></b>';
        first = false;

        if( tag == "Portfolio" )
            document.getElementsByClassName("blogHeader")[0].innerHTML = "PORTFOLIO";
    }

    if( document.getElementsByClassName("blogHeader")[0].innerHTML == "" )
        document.getElementsByClassName("blogHeader")[0].innerHTML = "BLOG";

    document.getElementsByClassName("blogTags")[0].innerHTML = tagsString;
    document.getElementsByClassName("blogImg")[0].src = image;

    document.getElementsByClassName("blogText")[0].innerHTML = content;
}

async function startBlog()
{
    g_BlogID = parseInt(document.title);

    let blogs;

    await fetch('/data/blog/blogentries.json').then((response) => (response.json())).then((json) => (blogs=json["blogs"]));

    let blog = blogs.filter(function(e){return e["id"] == g_BlogID})[0];

    if( !blog )
    {
        console.log("Not found");
        window.location.replace("/blog");
        return;
    }

    let blogFile = blog["file"];

    let blogInfo;

    await fetch( "/data/blog/" + blogFile ).then(
        (response) => response.json()).then(
            (json) => blogInfo = json );

    if( !blogInfo )
    {
        console.log("Not found");
        window.location.replace("/blog");
        return;
    }

    loadBlogInfo(blogInfo);
}

window.addEventListener("load", startBlog);