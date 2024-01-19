var g_BlogEntries = null;
var g_Tags = null;

function castParallax()
{

	var opThresh = 350;
	var opFactor = 750;

	window.addEventListener("scroll", function(event){

		var top = this.pageYOffset;

		var layers = document.getElementsByClassName("parallax");
		var layer, speed, yPos;
		for (var i = 0; i < layers.length; i++) {
			layer = layers[i];
			speed = layer.getAttribute('data-speed');
			var yPos = -(top * speed / 100);
			layer.style.transform = 'translate3d(0px, ' + yPos + 'px, 0px)';
		}
	});
}

function dispelParallax() {
	$("#nonparallax").css('display','block');
	$("#parallax").css('display','none');
}

function findAndRemoveFromArray(array, element)
{
	const index = array.indexOf(element);
	if (index > -1) { // only splice array when item is found
	  array.splice(index, 1); // 2nd parameter means remove one item only
	}

	return array;
}

async function loadBlogEntriesIntoPreview( blogEntries, blogPreviews )
{
	let blogList = [];
	for( let blog of blogEntries )
	{
		await fetch( "/data/blog/" + blog["file"] ).then( (response) => response.json()).then( 
			function(json){
			json["tags"] = blog["tags"];
			blogList.push(json);
		} );
	}

	let blogTemplate = "";
	await fetch( "/templates/blogpreview.html" ).then( (response) => response.text().then((text) => blogTemplate = text));

	let sortedBlogs = new Array;

	for( let blog of blogList )
	{
		sortedBlogs.push( blog );
	}

	sortedBlogs.sort( (first,second) => Date.parse(second["date"]) - Date.parse(first["date"]) );

	let iBlogIndex = 0;
	for( let blog of sortedBlogs )
	{
		let containerIndex = -1;
		for( let container of blogPreviews )
		{
			containerIndex++;
			let limit = container.dataset.limit;
			let filter = container.dataset.filtertag;

			if( limit != undefined && limit != -1 && iBlogIndex >= container.dataset.limit )
			{
				continue;
			}

			let newTags = Array.from( blog["tags"] );
			if( filter == "blog" )
			{
				for( removeTag of g_Tags["portfolio"] )
					newTags = findAndRemoveFromArray(newTags, removeTag);

				for( removeTag of g_Tags["media"] )
					newTags = findAndRemoveFromArray(newTags, removeTag);
			}
			else if( filter == "portfolio" )
			{
				if( newTags.indexOf("Portfolio") == -1 )
					continue;

				for( removeTag of g_Tags["tags"] )
					newTags = findAndRemoveFromArray(newTags, removeTag);

			}
			else if( filter == "media" )
			{
				if( newTags.indexOf("Media") == -1 )
					continue;

				for( removeTag of g_Tags["tags"] )
					newTags = findAndRemoveFromArray(newTags, removeTag);
			}

			let newEntry = document.createElement("li");
			newEntry.className = "blog_preview_item";
			newEntry.innerHTML = blogTemplate;
			container.appendChild(newEntry);

			newEntry.dataset.tags = "";
			let first = true;
			for( tag of blog["tags"] )
			{
				newEntry.dataset.tags += (first ? "" : ",") + tag;
				first = false;
			}

			blog["tags"] = newTags;

			onBlogRead( blog, newEntry, filter );
		}

		iBlogIndex++;
	}
}

function onBlogRead( json, blogItem, filter )
{
	let id = json["id"];

	blogItem.dataset.title = json["title"];

	let blogEntries = blogItem.getElementsByClassName("blog_preview");

	if( blogEntries.length < 1 )
		return;

	let blog = blogEntries[0];
	blog.getElementsByTagName("a")[0].href = "/blog/post?id=" + id;
	blog.getElementsByTagName("a")[1].href = "/blog/post?id=" + id;

	if( json["image"] != undefined && json["image"].length != 0 )
		blog.getElementsByTagName("img")[0].src = json["image"];
	else
		blog.removeChild(blog.getElementsByTagName("img")[0]);

	if( json["title"] != undefined && json["title"].length != 0 )
		blog.getElementsByTagName("h3")[0].innerHTML = json["title"];
	else
		blog.removeChild(blog.getElementsByTagName("h3")[0]);

	if( json["date"] != undefined && json["date"].length != 0 )
	{
		let date = new Date(json["date"]);
		blog.getElementsByClassName("preview_date")[0].innerHTML = date.toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' });
	}
	else
		blog.removeChild(blog.getElementsByClassName("preview_date")[0]);

	if( json["tags"] != undefined && json["tags"].length != 0 )
	{
		let tagsContainer = blog.getElementsByClassName("preview_tags")[0];
		let tagEntries = "";
		let first = json["tags"][0];
		for( let tag of json["tags"] )
		{
			let link = '<a class="taglink" href="blog?tag=' + tag +'">' + tag + '</a>';

			if( tag == first )
				tagEntries += "<li>" + link + "</li>";
			else
				tagEntries += "<li>" + ", " + link + "</li>";
		}

		tagsContainer.innerHTML = tagEntries;
	}
	else
		blog.removeChild(blog.getElementsByClassName("preview_tags")[0]);

	if( json["content"] != undefined && json["content"].length != 0 )
	{
		let content = json["content"];
		blog.getElementsByClassName("preview_content")[0].innerHTML = content;
	}
	else
		blog.removeChild(blog.getElementsByClassName("preview_content")[0]);

	if( filter == "media" )
	{
		blog.removeChild(blog.getElementsByTagName("h3")[0].parentNode);
		blog.getElementsByClassName("preview_date")[0].parentNode.removeChild(blog.getElementsByClassName("preview_date")[0]);
		blog.removeChild(blog.getElementsByClassName("preview_content")[0]);
	}
	else if( filter == "portfolio" )
	{
		blog.getElementsByClassName("preview_date")[0].parentNode.removeChild(blog.getElementsByClassName("preview_date")[0]);
	}
}

function loadTagsIntoSelect( tagList, tagSelects )
{
	for( let tagSelect of tagSelects )
	{
		let preselected = "";

		let tagPools = tagSelect.dataset.taglist.split(",");
		let tags = "";
		for( let tagPool of tagPools )
		{
			for( let tag of tagList[tagPool] )
			{
				tags+= `<li><input id="${tag}" type="checkbox" name="tags" value="${tag}" onchange="filterTag(event)"><label for="${tag}">${tag}</label></li>`;
			}
		}
		tagSelect.innerHTML = tags;
		console.log(tagSelect);

		if( tagSelect.dataset.preselected != undefined )
		{
			document.getElementById(tagSelect.dataset.preselected).checked = true;
		}
	}

	filterTag();
}

async function loadDatabases()
{
	var blogPreviewPanels = document.getElementsByClassName("blog_previews");

	if( blogPreviewPanels.length > 0 )
	{
		await fetch('/data/blog/blogentries.json').then((response) => response.json()).then((json) => g_BlogEntries = json["blogs"]);
		await fetch('/data/blog/tags.json').then((response) => response.json()).then((json) => g_Tags = json);
		await loadBlogEntriesIntoPreview(g_BlogEntries, blogPreviewPanels);
	}

	var tagSelectPanels = document.getElementsByClassName("tag_select");

	if( tagSelectPanels.length > 0 )
	{
		if( g_Tags == null)
			await fetch('/data/blog/tags.json').then((response) => response.json()).then((json) => g_Tags = json);

		loadTagsIntoSelect(g_Tags, tagSelectPanels);
	}
}

function startSite()
{
	var platform = navigator.platform.toLowerCase();
	var userAgent = navigator.userAgent.toLowerCase();

	// Get the navbar
	g_navbar = document.getElementById("navbar");

	// Get the offset position of the navbar
	if( g_navbar )
	{
		g_sticky = g_navbar.offsetTop;
		fetch( "/templates/navbar.html" ).then( (response) => response.text().then((text) => g_navbar.innerHTML = text));
	}
/*
	Keep paralax everywhere for now
	if ( platform.indexOf('ipad') != -1  ||  platform.indexOf('iphone') != -1 )
	{
		dispelParallax();
	}
	else if( platform.indexOf('win32') != -1 || platform.indexOf('linux') != -1 )
	{
		castParallax();
	}
	else */
	{
		castParallax();
	}

	loadDatabases();

	let firstPagePreviewButtons = document.getElementsByClassName('firstPageButton');

	for( button of firstPagePreviewButtons )
	{
		button.onclick = function () {
			let blog_preview = document.getElementById(button.name);
			if( !blog_preview )
				return;

			blog_preview.scrollLeft = 0;
		}
	}

	let secondPagePreviewButtons = document.getElementsByClassName('secondPageButton');

	for( let button of secondPagePreviewButtons )
	{
		button.onclick = function () {
			let blog_preview = document.getElementById(button.name);
			if( !blog_preview )
				return;

			blog_preview.scrollLeft = blog_preview.scrollWidth;
		}
	}
}

window.addEventListener("load", startSite);