var request = require('request');

var config = require('./settings');

//Code starts from here, DO NOT touch code after this line if you don't know that you are doing
var P1_WH = 0;
var WH_TOT = [];
WH_TOT[0] = 0;
var W_TOT = 0;

// Getting power usage
if(config.Pow_Meter_IDX!=0) {
	request(config.DOMOTICZ_HOST_URL+"/json.htm?type=devices&rid="+config.Pow_Meter_IDX, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			P1_WH = JSON.parse(body)["result"]["Data"];
		}
	});
}
ciclo(1);

function ciclo(invNumb){
	if(invNumb<Object.keys(config.IDX).length+1){
		request(config.SOLAR_HOST_URL+"?invtnum="+invNumb, function (error, response, body) {
			if (!error) {
		    	var dati = JSON.parse(body)[0];
		    	if(config.DEBUG){
			    	console.log(dati);
				}
			    if(dati.awdate != "--:--"){
				    processKWHT(invNumb, dati.KWHT);
				    update_domoticz(config.IDX[invNumb].I1P, dati.I1P);
				    update_domoticz(config.IDX[invNumb].I2P, dati.I2P);
				    update_domoticz(config.IDX[invNumb].I1V, dati.I1V);
				    update_domoticz(config.IDX[invNumb].I2V, dati.I2V);
				    update_domoticz(config.IDX[invNumb].I1A, dati.I1A);
				    update_domoticz(config.IDX[invNumb].I2A, dati.I2A);
				    processGP(invNumb, dati.GP);
				    update_domoticz(config.IDX[invNumb].GV, dati.GV);
				    update_domoticz(config.IDX[invNumb].GA, dati.GA);
				    update_domoticz(config.IDX[invNumb].FRQ, dati.FRQ);
				    update_domoticz(config.IDX[invNumb].EFF, dati.EFF);
				    update_domoticz(config.IDX[invNumb].INVT, dati.INVT);
				    update_domoticz(config.IDX[invNumb].Total_Power, dati.GP+";"+(dati.KWHT*1000));
				}
			} else {
				invNumb = Object.keys(config.IDX).length+200;
				if(config.DEBUG) {
		  			console.log("ERROR, your 123Solar setup is offline!");
		  		}
		 	}
			ciclo(invNumb+1);
		});
	} else {
		fine();
	}
}


function fine(){
	if (config.TEST) {
		console.log("WH_TOT: "+WH_TOT.reduce((pv, cv) => pv+cv, 0));
		console.log("W_TOT: "+W_TOT);
		console.log("WH_TOT is "+WH_TOT.length+" long!");
	}

	if (WH_TOT.length != Object.keys(config.IDX).length+1 || WH_TOT.reduce((pv, cv) => pv+cv, 0) == 0){
		// get the latest date in case of connection problems to 1 of the inverters, it might be down, don't forget to chage the right IDX numbers
		request(config.DOMOTICZ_HOST_URL+"/json.htm?type=devices&rid="+155, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				WH_INVT_1 = JSON.parse(body)["result"]["Data"];
			}
		});
		request(config.DOMOTICZ_HOST_URL+"/json.htm?type=devices&rid="+156, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				WH_INVT_2 = JSON.parse(body)["result"]["Data"];
			}
		});
		WH_TOT[1] = WH_INVT_1;
		WH_TOT[2] = WH_INVT_2;
	}
	if (config.TEST){
		console.log("WH_TOT: "+WH_TOT.reduce((pv, cv) => pv+cv, 0));
	}

	update_domoticz(config.Power_Consumption_IDX, (WH_TOT.reduce((pv, cv) => pv+cv, 0))+P1_WH);
	update_domoticz(config.Solar_Power_IDX, W_TOT+";"+(WH_TOT.reduce((pv, cv) => pv+cv, 0)));
}


function processGP(invt, value){
    W_TOT+= value;
}

function processKWHT(invt, value){
    if (value > 0){
	    WH_TOT[invt] = value;
    }
}

function update_domoticz(actualIdx, dat) {
	if (typeof(dat)!='undefined' && dat.length!=0 && typeof(actualIdx)!= 'undefined' &&actualIdx!=0) {
    	if (config.TEST) {
		    console.log("Updating: IDX: "+actualIdx+" DAT: "+dat);
    	} else {
		    if (config.DEBUG) {
		    	var string = "$(date '+%y-%m-%d %H:%M') Update: IDX:${IDX} DAT:${DAT} : ";
		    	request(config.DOMOTICZ_HOST_URL+"/json.htm?type=command&param=udevice&idx="+actualIdx+"&nvalue=0&svalue="+dat, function (error, response, body) {
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
		    	request(config.DOMOTICZ_HOST_URL+"/json.htm?type=command&param=udevice&idx="+actualIdx+"&nvalue=0&svalue="+dat);
		    }
		}
	} else {
    	if (config.DEBUG) {
    		console.log("NOT Updated: IDX: "+actualIdx+" DAT: "+dat);
  		}
  	}
}