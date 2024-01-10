const { count } = require("console");
const ds = require("fs");

class rezervacijeHandler {
	dajRezervacije = function(){
		let rezervacije = ds.readFileSync("podaci/rezervacije.csv","utf-8");

		let array = [[]];

		let entries = rezervacije.split("\r\n");
		let bFirst = true;
		for( let entry of entries )
		{
			if( !bFirst )
				array.push( [] );

			bFirst = false;

			let attributes = entry.split(";");
			for( let attribute of attributes )
			{
				array[array.length-1].push(attribute);
			}
		}
		return array;
	}

	zapisi = function(rezervacije) {
		let strCSV = "";
		for( let rezervacija of rezervacije )
		{
			for( let attribute of rezervacija )
			{
				strCSV += attribute + ";"
			}

			strCSV = strCSV.slice(0, -1);

			strCSV += "\r\n";
		}

		strCSV = strCSV.slice(0, -2);

		ds.writeFileSync('podaci/rezervacije.csv',strCSV,{flag: 'w'}, (greska) => { 
		 	if(greska) console.log(greska);
		});
	}

	dodaj = function(rezervacija) {
		let rezervacije = this.dajRezervacije();
		rezervacije.push([]);

		if( rezervacija['email'] == undefined 
		|| rezervacija['Ponuda'] == undefined 
		|| rezervacija['date'] == undefined
		|| rezervacija['time'] == undefined
		|| rezervacija['VrijemeBoravka'] == undefined)
			throw new Exception();

		rezervacije[rezervacije.length-1].push( rezervacija['email'] );
		rezervacije[rezervacije.length-1].push( rezervacija['Usluga1'] == undefined ? "off" : rezervacija['Usluga1'] );
		rezervacije[rezervacije.length-1].push( rezervacija['Usluga2'] == undefined ? "off" : rezervacija['Usluga2'] );
		rezervacije[rezervacije.length-1].push( rezervacija['Usluga3'] == undefined ? "off" : rezervacija['Usluga3'] );
		rezervacije[rezervacije.length-1].push( rezervacija['Usluga4'] == undefined ? "off" : rezervacija['Usluga4'] );
		rezervacije[rezervacije.length-1].push( rezervacija['Usluga5'] == undefined ? "off" : rezervacija['Usluga5'] );
		rezervacije[rezervacije.length-1].push( rezervacija['Usluga6'] == undefined ? "off" : rezervacija['Usluga6'] );
		rezervacije[rezervacije.length-1].push( rezervacija['PosebnaUsluga'] );
		rezervacije[rezervacije.length-1].push( rezervacija['Ponuda'] );
		rezervacije[rezervacije.length-1].push( rezervacija['date'] );
		rezervacije[rezervacije.length-1].push( rezervacija['time'] );
		rezervacije[rezervacije.length-1].push( rezervacija['VrijemeBoravka'] );

		
		this.zapisi(rezervacije);
	}

	brisi = function(id){
		let rezervacije = this.dajRezervacije();
		rezervacije.splice(id, 1);
		this.zapisi(rezervacije);
	}

	azuriraj = function(id,noviPodaci){
		let rezervacije = this.dajRezervacije();

		if( id >= rezervacije.length )
			return;

		rezervacije[id][0] = noviPodaci['email'];
		rezervacije[id][1] = noviPodaci['Usluga1'] == undefined ? "off" : noviPodaci['Usluga1']
		rezervacije[id][2] = noviPodaci['Usluga2'] == undefined ? "off" : noviPodaci['Usluga2'];
		rezervacije[id][3] = noviPodaci['Usluga3'] == undefined ? "off" : noviPodaci['Usluga3'];
		rezervacije[id][4] = noviPodaci['Usluga4'] == undefined ? "off" : noviPodaci['Usluga4'];
		rezervacije[id][5] = noviPodaci['Usluga5'] == undefined ? "off" : noviPodaci['Usluga5'];
		rezervacije[id][6] = noviPodaci['Usluga6'] == undefined ? "off" : noviPodaci['Usluga6'];
		rezervacije[id][7] = noviPodaci['PosebnaUsluga'];
		rezervacije[id][8] = noviPodaci['Ponuda'];
		rezervacije[id][9] = noviPodaci['date'];
		rezervacije[id][10] = noviPodaci['time'];
		rezervacije[id][11] = noviPodaci['VrijemeBoravka'];
		
		this.zapisi(rezervacije);
	}

	dajJSON = function() {
		let rezervacije = this.dajRezervacije();

		let container = [];

		for( let rezervacija of rezervacije )
		{
			if( rezervacija.length < 12 )
				continue;

			let objekt =
			{
				'email': rezervacija[0],
				'Usluga1': rezervacija[1],
				'Usluga2': rezervacija[2],
				'Usluga3': rezervacija[3],
				'Usluga4': rezervacija[4],
				'Usluga5': rezervacija[5],
				'Usluga6': rezervacija[6],
				'PosebnaUsluga': rezervacija[7],
				'Ponuda': rezervacija[8],
				'date': rezervacija[9],
				'time': rezervacija[10],
				'VrijemeBoravka': rezervacija[11]
			};

			container.push(objekt);
		}

		return container;
	}
}

module.exports = rezervacijeHandler;
