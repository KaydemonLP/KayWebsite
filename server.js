const { deepStrictEqual } = require("assert");
const express = require("express");
const { stringify } = require("querystring");
const showdown = require("showdown");
ds = require("fs");
var converter = new showdown.Converter();

var g_BlogEntries = require("./data/blog/blogentries.json");

const server = express();
const putanja = __dirname;

// */
// Posrednik za obradu post parametara
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

var g_aLinks = [
	/^\/(home)?$/,
	"/portfolio",
	"/media",
	"/blogadmin"
];

var g_aFiles = [
	"/html/home.html",
	"/html/portfolio.html",
	"/html/media.html",
	"/html/blogadmin.html"
];

server.use("/css", express.static(putanja + "/css"));
server.use("/javascript", express.static(putanja + "/javascript"));
server.use("/media", express.static(putanja + "/media"));
server.use("/data", express.static(putanja + "/data"));
server.use("/templates", express.static(putanja + "/templates"));

for( let i in g_aLinks )
{
	server.get(g_aLinks[i], (zahtjev, odgovor) => {
		odgovor.sendFile(putanja + g_aFiles[i]);
	});
}

server.get("/blog/post", (zahtjev, odgovor) => {
	let head = ds.readFileSync(putanja+"/templates/blogtemplate.html", "utf-8");

	let titleIndex = head.search("<title>");
	titleIndex += 7;

	var txt2 = head.slice(0, titleIndex) + (zahtjev.query.id) + head.slice(titleIndex);

	odgovor.type("html");
	odgovor.write(txt2);
	odgovor.end();
});

server.get("/blog", (zahtjev, odgovor) => {
	let head = ds.readFileSync(putanja+"/html/blog.html", "utf-8");

	if( zahtjev.query.tag != undefined )
	{
		let selectIndex = head.search('class="tag_select"');
		selectIndex += 19;

		let preselected = 'data-preselected="';
		preselected +=  (zahtjev.query.tag);
		preselected += '"';

		var txt2 = head.slice(0, selectIndex) + preselected + head.slice(selectIndex);
		head = txt2;
	}
	odgovor.type("html");
	odgovor.write(head);
	odgovor.end();
});

server.post("/api/rezervacije", (zahtjev, odgovor) => {
	let podaci = zahtjev.body;

	odgovor.type("json");

	console.log(podaci["password"]);

	if( podaci["password"] != "6ilvl48t4rH" )
	{
		odgovor.status(200);
		odgovor.send(JSON.stringify({ poruka: "no." }));
		return;
	}

	delete odgovor["password"];
	delete podaci["password"];

	let currentDate = new Date();
	podaci["date"] = currentDate.toDateString();

	if( typeof(podaci["tags"]) != Object )
		podaci["tags"] = [podaci["tags"]];

	let tags = podaci["tags"];

	var html = converter.makeHtml(podaci["markdown"]);
	delete podaci["markdown"];

	podaci["content"] = html;

	console.log(html);

	console.log(podaci);

	let id = g_BlogEntries["blogs"].length;

	podaci["id"] = id;
	delete podaci["tags"];

	ds.writeFile(putanja+'/data/blog/blogentry_'+id+'.json',
	JSON.stringify(podaci),
	{flag: 'w+'},
	(greska) => { if(greska) console.log(greska); });

	let newEntry = {
		"id": id,
		"file": 'blogentry_'+id+".json",
		"tags": tags
	};

	g_BlogEntries["blogs"].push(newEntry);

	ds.writeFile(putanja+'/data/blog/blogentries.json',
	JSON.stringify(g_BlogEntries),
	{flag: 'w+'},
	(greska) => { if(greska) console.log(greska); });

	odgovor.status(200);
	odgovor.redirect( "/blog/post?id=" + id );
});

server.use((zahtjev, odgovor) => {
	// statusni kod
	odgovor.status(404);
	odgovor.sendFile(putanja + "/html/notfound.html");
});

server.listen(80, () => {
	console.log(`Server pokrenut na portu: ${80}`);
});

// sudo npm install express -g
// sudo npm install nodemon -g
// nodemon server.js