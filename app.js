var request = require('request');
var CronJob = require('cron').CronJob;
var config = require('./settings');

var P1_WH = 0;
var WH_TOT = [];
WH_TOT[0] = 0;
var W_TOT = 0;
var invtOffline = [];


var job = new CronJob({
  cronTime: config.cron,
  onTick: function() {
  	restartCycle(function(){
    	getPowerUsage();
		ciclo(1);
	});
  },
  start: false,
});
job.start();

function restartCycle(cb){
	P1_WH = 0;
	WH_TOT = [];
	WH_TOT[0] = 0;
	W_TOT = 0;
	cb();
}

function getPowerUsage(){
	// Getting power usage
	if(typeof(config.pow_Meter_IDX) != 'undefined' && config.pow_Meter_IDX!=0) {
		request(config.DOMOTICZ_HOST_URL+"/json.htm?type=devices&rid="+config.Pow_Meter_IDX, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				P1_WH = JSON.parse(body)["result"]["Data"];
			}
		});
	}
}

function ciclo(invNumb){
	if(invNumb<Object.keys(config.IDX).length+1){
		request(config.SOLAR_HOST_URL+"?invtnum="+invNumb, function (error, response, body) {
			if (!error && response.statusCode == 200) {
		    	var dati = JSON.parse(body)[0];
		    	if(config.DEBUG){
			    	console.log(dati);
				}
			    if(dati.awdate != "--:--"){
			    	invtOffline[invNumb] = false;
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
				}  else {
					if(config.DEBUG) {
			  			console.log("ERROR, the inverter "+invNumb+" is offline!");
			  		}
					if(!invtOffline[invNumb]){
						invtOffline[invNumb] = true;
						processKWHT(invNumb, 0);
					    update_domoticz(config.IDX[invNumb].I1P, 0);
					    update_domoticz(config.IDX[invNumb].I2P, 0);
					    update_domoticz(config.IDX[invNumb].I1V, 0);
					    update_domoticz(config.IDX[invNumb].I2V, 0);
					    update_domoticz(config.IDX[invNumb].I1A, 0);
					    update_domoticz(config.IDX[invNumb].I2A, 0);
					    processGP(invNumb, 0);
					    update_domoticz(config.IDX[invNumb].GV, 0);
					    update_domoticz(config.IDX[invNumb].GA, 0);
					    update_domoticz(config.IDX[invNumb].FRQ, 0);
					    update_domoticz(config.IDX[invNumb].EFF, 0);
					    update_domoticz(config.IDX[invNumb].INVT, 0);
					    if(config.DEBUG) {
			  				console.log("First time the inverter "+invNumb+" is offline, pushing 0!");
			  			}
					}			

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

// get the latest data in case of connection problems to one of the inverters, it might be down
function checkWH(index){
	if(index<=Object.keys(config.IDX).length) {
		if(typeof(WH_TOT[index]) == 'undefined' || WH_TOT[index] == 0){
			request(config.DOMOTICZ_HOST_URL+"/json.htm?type=devices&rid="+config.IDX[index].Total_Power, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					var data = JSON.parse(body);
					if(data["status"]=="OK"){
						WH_TOT[index] = Number(data["result"][0]["Data"].slice(0, -4));
						if(config.DEBUG){
							console.log("Retrived data from Domoticz! Inverter numb " + index + " dat= "+WH_TOT[index]);
						}
					} else {
						if(config.DEBUG){
							console.log("Error retriving data from Domoticz! Inverter numb " + index);
						}
					}
				} else {
					if(config.DEBUG){
						console.log("Error retriving data from Domoticz, maybe offline!");
					}
				}
				checkWH(index+1);
			});
		}
	} else {
		if (config.DEBUG){
			console.log("WH_TOT: "+WH_TOT.reduce((pv, cv) => pv+cv, 0));
		}

		update_domoticz(config.power_Consumption_IDX, (WH_TOT.reduce((pv, cv) => pv+cv, 0))+P1_WH);
		update_domoticz(config.solar_Power_IDX, W_TOT+";"+(WH_TOT.reduce((pv, cv) => pv+cv, 0)));
	}
}


function fine(){
	if (config.DEBUG) {
		console.log("WH_TOT: "+WH_TOT.reduce((pv, cv) => pv+cv, 0));
		console.log("W_TOT: "+W_TOT);
	}

	checkWH(1);
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
	if (typeof(dat)!='undefined' && dat.length!=0 && typeof(actualIdx)!= 'undefined' && actualIdx!=0) {
    	if (config.TEST) {
		    console.log("Updating: IDX: "+actualIdx+" DAT: "+dat);
    	} else {
		    if (config.DEBUG) {
		    	var string = "Update: IDX:"+actualIdx+" DAT:"+dat+" : ";
		    	request(config.DOMOTICZ_HOST_URL+"/json.htm?type=command&param=udevice&idx="+actualIdx+"&nvalue=0&svalue="+dat, function (error, response, body) {
					if (!error && response.statusCode == 200 && JSON.parse(body)["status"] == 'OK') {
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