const rgb2array = (rgb) => `${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1)}`.split(',');

var g_navbar = null;
var g_sticky = null;

const RGBToHSB = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const v = Math.max(r, g, b),
    n = v - Math.min(r, g, b);
  const h =
    n === 0 ? 0 : n && v === r ? (g - b) / n : v === g ? 2 + (b - r) / n : 4 + (r - g) / n;
  return [60 * (h < 0 ? h + 6 : h), v && (n / v) * 100, v * 100];
};

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

		if( g_navbar )
		{
			if (window.pageYOffset >= g_sticky)
			{
				g_navbar.classList.add("sticky");
			}
			else
			{
				g_navbar.classList.remove("sticky");
			}
		}
	});
}

function dispelParallax() {
	$("#nonparallax").css('display','block');
	$("#parallax").css('display','none');
}

async function loadBlogEntriesIntoPreview( blogEntries, blogPreviews )
{
	let blogList = [];
	for( let blog of blogEntries["blogs"] )
	{
		await fetch( "/data/blog/" + blog["file"] ).then( (response) => response.json()).then( (json) => blogList.push(json) );
	}

	let blogTemplate = "";
	await fetch( "/templates/blogpreview.html" ).then( (response) => response.text().then((text) => blogTemplate = text));

	let iPreviews = 0;

	let sortedBlogs = new Array;

	for( let blog of blogList )
	{
		if( iPreviews >= 6 )
			break;

		sortedBlogs.push( blog );
		iPreviews++;
	}

	sortedBlogs.sort( (first,second) => Date.parse(second["date"]) - Date.parse(first["date"]) );

	for( let blog of sortedBlogs )
	{
		if( iPreviews >= 6 )
			break;

		for( let container of blogPreviews )
		{
			let newEntry = document.createElement("li");
			newEntry.className = "blog_preview_item";
			newEntry.innerHTML = blogTemplate;
			container.appendChild(newEntry);

			onBlogRead( blog, newEntry );
		}
	}
}

function onBlogRead( json, blogItem )
{
	console.log(json["image"]);

	let blogEntries = blogItem.getElementsByClassName("blog_preview");

	if( blogEntries.length < 1 )
		return;

	let blog = blogEntries[0];

	if( json["image"] != undefined && json["image"].length != 0 )
		blog.getElementsByTagName("img")[0].src = json["image"];
	else
		blog.removeChild(blog.getElementsByTagName("img")[0]);

	if( json["title"] != undefined && json["title"].length != 0 )
		blog.getElementsByTagName("h3")[0].innerHTML = json["title"];
	else
		blog.removeChild(blog.getElementsByTagName("h3")[0]);

	if( json["date"] != undefined && json["date"].length != 0 )
		blog.getElementsByClassName("preview_date")[0].innerHTML = json["date"];
	else
		blog.removeChild(blog.getElementsByClassName("preview_date")[0]);

	if( json["tags"] != undefined && json["tags"].length != 0 )
	{
		let tagsContainer = blog.getElementsByClassName("preview_tags")[0];
		let tagEntries = "";
		let first = json["tags"][0];
		for( let tag of json["tags"] )
		{
			if( tag == first )
				tagEntries += "<li>" + tag + "</li>";
			else
				tagEntries += "<li>" + ", " + tag + "</li>";
		}

		tagsContainer.innerHTML = tagEntries;
	}
	else
		blog.removeChild(blog.getElementsByClassName("preview_tags")[0]);

	let bLongerThanExpected = false;

	if( json["content"] != undefined && json["content"].length != 0 )
	{
		let content = json["content"];
		blog.getElementsByClassName("preview_content")[0].innerHTML = content;
	}
	else
		blog.removeChild(blog.getElementsByClassName("preview_content")[0]);

	if( !bLongerThanExpected )
		blog.removeChild(blog.getElementsByClassName("preview_readmore")[0]);
}

function startSite()
{
	var platform = navigator.platform.toLowerCase();
	var userAgent = navigator.userAgent.toLowerCase();
	/*
	var colorableImages = document.getElementsByClassName("colorable-image");

	for( let image of colorableImages )
	{
		let rgb = rgb2array(window.getComputedStyle(image).color);
		let hsb = RGBToHSB( rgb[0], rgb[1], rgb[2] );

		let filter = "invert(0.5) sepia(1) saturate(10000) brightness(10000) hue-rotate(0deg)";

		filter += " hue-rotate(" + hsb[0] + "deg) saturate(" + hsb[1] / 100 + ") brightness(" + hsb[2] / 100 + ")";

		image.style.filter = filter;
	}
*/
	// Get the navbar
	g_navbar = document.getElementById("navbar");

	// Get the offset position of the navbar
	if( g_navbar )
		g_sticky = g_navbar.offsetTop;

	if ( platform.indexOf('ipad') != -1  ||  platform.indexOf('iphone') != -1 )
	{
		dispelParallax();
	}
	else if( platform.indexOf('win32') != -1 || platform.indexOf('linux') != -1 )
	{
		castParallax();
	}
	else
	{
		castParallax();
	}

	var blogPreviewPanel = document.getElementsByClassName("blog_previews");

	if( blogPreviewPanel.length > 0 )
	{
		fetch('/data/blog/blogentries.json').then((response) => response.json()).then((json) => loadBlogEntriesIntoPreview(json, blogPreviewPanel));
	}

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