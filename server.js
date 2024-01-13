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
	"/blogadmin",
];

var g_aFiles = [
	"/html/home.html",
	"/html/blogadmin.html",
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

server.post("/api/rezervacije", (zahtjev, odgovor) => {
	let podaci = zahtjev.body;
	odgovor.type("json");

	let currentDate = new Date();
	podaci["date"] = currentDate.toLocaleString();

	if( typeof(podaci["tags"]) != Array )
		podaci["tags"] = [podaci["tags"]];

	var html = converter.makeHtml(podaci["markdown"]);
	delete podaci["markdown"];

	podaci["content"] = html;

	console.log(html);

	console.log(podaci);

	let id = g_BlogEntries["blogs"].length;

	ds.writeFile(putanja+'/data/blog/blogentry_'+id+'.json',
	JSON.stringify(podaci),
	{flag: 'w+'},
	(greska) => { if(greska) console.log(greska); });

	let newEntry = {
		"id": id,
		"file": 'blogentry_'+id+".json"
	};

	g_BlogEntries["blogs"].push(newEntry);

	ds.writeFile(putanja+'/data/blog/blogentries.json',
	JSON.stringify(g_BlogEntries),
	{flag: 'w+'},
	(greska) => { if(greska) console.log(greska); });

	odgovor.status(200);
	odgovor.send(JSON.stringify({ poruka: "Podaci dodani" }));

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