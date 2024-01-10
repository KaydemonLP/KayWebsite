const { deepStrictEqual } = require("assert");
const express = require("express");
ds = require("fs");

const server = express();
const putanja = __dirname;

// */
// Posrednik za obradu post parametara
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

var g_aLinks = [
	/^\/(home)?$/,
	"/test",
];

var g_aFiles = [
	"/html/home.html",
	"/html/test.html",
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

server.get(/^\/(home)?$/, (zahtjev, odgovor) => {
	let head = ds.readFileSync("/html/home.html", "utf-8");
	odgovor.type("html");
	odgovor.write(head);
	odgovor.end();
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
