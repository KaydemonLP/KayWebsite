var g_BlogID = -1;

function startBlog()
{
    g_BlogID = parseInt(document.title);

    fetch('/data/blog/blogentries.json').then((response) => response.json()).then((json) => loadBlogEntriesIntoPreview(json, blogPreviewPanel));

    await fetch( "/data/blog/" + blog["file"] ).then( (response) => response.json()).then( (json) => blogList.push(json) );
}

window.addEventListener("load", startBlog);