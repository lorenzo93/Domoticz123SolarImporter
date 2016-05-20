var request = require('request');

// Your 123solar API link
var SOLAR_HOST_URL="http://192.168.0.250/123solar/programs/programlive.php";

// Your Domoticz ip and port, remember to NOT put trailing slash
var DOMOTICZ_HOST_URL="http://192.168.0.12:8081";

// IDX Numbers JSON, replicate all the "1" part if you have more than 1 inverter
var IDX = {
	"1" : {
		"I1P" : 0,
		"I1V" : 0,
		"I2V" : 0,
		"I2P" : 0,
		"I1A" : 0,
		"I2A" : 0,
		"GP" : 0,
		"GV" : 0,
		"GA" : 0,
		"FRQ" : 0,
		"EFF" : 0,
		"INVT" : 0,
		"Total_Power" : 0 //   General     kWh          8549.873 kWh
	}
};

var Power_Consumption_IDX = 0; //   RFXMeter    counter     16257.239 kWh
var Solar_Power_IDX = 0; //          General     kWh         12769.776 kWh

//Power Meter IDX, if you have one, so Domoticz can calculate power usage. 0 if you don't have
var POW_METER = 0;

//Developing variables
var DEBUG = true;
var TEST = true;

//Maybe useless variables
var PRINT_WH_TOT = 0;
var WH_TOT = 0;
var W_TOT = 0;


//Code starts from here, DO NOT touch code after this line if you don't know that you are doing
var P1_WH = 0;

// Getting power usage
if(POW_METER!=0) {
	request(DOMOTICZ_HOST_URL+"/json.htm?type=devices&rid="+POW_METER, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			P1_WH = JSON.parse(body)["result"]["Data"];
		}
	});
}
ciclo(1);

function ciclo(invNumb){
	if(invNumb<Object.keys(IDX).length+1){
		request(SOLAR_HOST_URL+"?invtnum="+invNumb, function (error, response, body) {
		  if (!error) {
		    var dati = JSON.parse(body)[0];
		    console.log(dati);
		    if(dati.awdate != "--:--"){
			    processKWHT(invNumb, dati.KWHT);
			    update_domoticz(IDX[invNumb].I1P, dati.I1P);
			    update_domoticz(IDX[invNumb].I2P, dati.I2P);
			    update_domoticz(IDX[invNumb].I1V, dati.I1V);
			    update_domoticz(IDX[invNumb].I2V, dati.I2V);
			    update_domoticz(IDX[invNumb].I1A, dati.I1A);
			    update_domoticz(IDX[invNumb].I2A, dati.I2A);
			    processGP(invNumb, dati.GP);
			    update_domoticz(IDX[invNumb].GV, dati.GV);
			    update_domoticz(IDX[invNumb].GA, dati.GA);
			    update_domoticz(IDX[invNumb].FRQ, dati.FRQ);
			    update_domoticz(IDX[invNumb].EFF, dati.EFF);
			    update_domoticz(IDX[invNumb].INVT, dati.INVT);
			    update_domoticz(IDX[invNumb].Total_Power, dati.GP+";"+(dati.KWHT*1000));
			}
		  } else {
		  	console.log("ERRORE");
		  }
		  ciclo(invNumb+1);
		});
	} else {
		fine();
	}
}


function fine(){
	console.log("Lavoro con i dati");
	if (TEST) {
		console.log("WH_TOT: "+WH_TOT);
		console.log("W_TOT: "+W_TOT);
	}

	if (PRINT_WH_TOT != Object.keys(IDX).length || WH_TOT == 0){
		// get the latest date in case of connection problems to 1 of the inverters, it might be down, don't forget to chage the right IDX numbers
		request(DOMOTICZ_HOST_URL+"/json.htm?type=devices&rid="+155, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				WH_INVT_1 = JSON.parse(body)["result"]["Data"];
			}
		});
		request(DOMOTICZ_HOST_URL+"/json.htm?type=devices&rid="+156, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				WH_INVT_2 = JSON.parse(body)["result"]["Data"];
			}
		});
		WH_TOT = WH_INVT_1+WH_INVT_2;
	}
	if (TEST){
		console.log("WH_TOT: "+WH_TOT);
	}

	update_domoticz(Power_Consumption_IDX, WH_TOT+P1_WH);
	update_domoticz(Solar_Power_IDX, W_TOT+";"+WH_TOT);
	

}


function processGP(invt, value){
    W_TOT+= value;
}

function processKWHT(invt, value){
    if (value > 0){
	    WH_TOT += value;
	    PRINT_WH_TOT++;
    } else {
    	PRINT_WH_TOT=0;
    }
}

function update_domoticz(actualIdx, dat) {
	if (typeof(dat)!='undefined' && dat.length!=0 && typeof(actualIdx)!= 'undefined' &&actualIdx!=0) {
    	if (TEST) {
		    console.log("Updating: IDX: "+actualIdx+" DAT: "+dat);
    	} else {
		    if (DEBUG) {
		    	var string = "$(date '+%y-%m-%d %H:%M') Update: IDX:${IDX} DAT:${DAT} : ";
		    	request(DOMOTICZ_HOST_URL+"/json.htm?type=command&param=udevice&idx="+actualIdx+"&nvalue=0&svalue="+dat, function (error, response, body) {
					if (!error && response.statusCode == 200) {
						string += "OK";
						console.log(string);
					} else {
						string += "ERROR";
						console.log(string);
						console.log(body);
					}
				});
		    } else {
		    	request(DOMOTICZ_HOST_URL+"/json.htm?type=command&param=udevice&idx="+actualIdx+"&nvalue=0&svalue="+dat);
		    }
		}
	} else {
    	if (DEBUG) {
    		console.log("NOT Updated: IDX: "+actualIdx+" DAT: "+dat);
  		}
  	}
}