var request = require('request');

// Your 123solar API link
var SOLAR_HOST_URL="http://lollo93.no-ip.biz/123solar/programs/programlive.php";

// Your Domoticz ip and port, remember to NOT put trailing slash
var DOMOTICZ_HOST_URL="http://192.168.0.12:8081";

// Inverters Number, how many inverters do you have in 123Solar?
var INV_NUMB=1;

//Power Meter IDX, if you have one, so Domoticz can calculate power usage. 0 if you don't have
var POW_METER = 0;

//Developing variables
var DEBUG = true;
var TEST = true;

//Maybe useless variables
var WH_INVT_1 = 0;
var WH_INVT_2 = 0;
var PRINT_WH_TOT = 0;
var WH_TOT = 0;
var W_TOT = 0;
var W_INVT_1 = 0;
var W_INVT_2 = 0;

var IDX = {};


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

for (var invt=1; invt<=INV_NUMB+1; invt++){
	request(SOLAR_HOST_URL+"?invtnum="+invt, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    var dati = JSON.parse(body)[0];
	    console.log(dati);
	    if(dati.awdate != "--:--"){
	    	console.log("processo i dati");
		    processKWHT(invt, dati[KWHT]);
		    update_domoticz(IDX.I1P[invt], dati[I1P]);
		    update_domoticz(IDX.I2P[invt], dati[I2P]);
		    update_domoticz(IDX.I1V[invt], dati[I1V]);
		    update_domoticz(IDX.I2V[invt], dati[I2V]);
		    update_domoticz(IDX.I1A[invt], dati[I1A]);
		    update_domoticz(IDX.I2A[invt], dati[I2A]);
		    processG1P(invt, dati[G1P]);
		    update_domoticz(IDX.G1V[invt], dati[G1V]);
		    update_domoticz(IDX.G1A[invt], dati[G1A]);
		    update_domoticz(IDX.FRQ[invt], dati[FRQ]);
		    update_domoticz(IDX.EFF[invt], dati[EFF]);
		}
	  }
	});
	if(invt==INV_NUMB+1){
		if (TEST) {
	console.log("WH_TOT: "+WH_TOT);
	console.log("W_TOT: "+W_TOT);
}

if (PRINT_WH_TOT != INV_NUMB || WH_TOT == 0){
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
	if (TEST){
		console.log("WH_INVT_1: "+WH_INVT_1);
		console.log("WH_INVT_2: "+WH_INVT_2);
		console.log("WH_TOT: "+WH_TOT);
	}
}

update_domoticz(153, WH_TOT+P1_WH);
update_domoticz(154, W_TOT+";"+WH_TOT);
update_domoticz(155, W_INVT_1+";"+WH_INVT_1);
update_domoticz(156, W_INVT_2+";"+WH_INVT_2);

	}
};


function processG1P(invt, value){
    if (invt==1) {
        W_INVT_1=value;
    } else {
		W_INVT_2=value;
    }
    W_TOT+= value;
}

function processKWHT(invt, value){
    if (value > 0){
    	if (invt == 1) {
	        WH_INVT_1 = value*1000;
    	} else {
	        WH_INVT_2= value*1000;
    	}
	    WH_TOT += value;
	    PRINT_WH_TOT++;
    } else {
    	PRINT_WH_TOT=0;
    }
}

function update_domoticz(idx, dat) {
	if (typeof(dat)!='undefined' && dat.length!=0 && typeof(idx)!= 'undefined' &&idx!=0) {
    	if (TEST) {
		    console.log("Updating: IDX: "+idx+" DAT: "+dat);
    	} else {
		    if (DEBUG) {
		    	var string = "$(date '+%y-%m-%d %H:%M') Update: IDX:${IDX} DAT:${DAT} : ";
		    	request(DOMOTICZ_HOST_URL+"/json.htm?type=command&param=udevice&idx="+idx+"&nvalue=0&svalue="+dat, function (error, response, body) {
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
		    	request(DOMOTICZ_HOST_URL+"/json.htm?type=command&param=udevice&idx="+idx+"&nvalue=0&svalue="+dat);
		    }
		}
	} else {
    	if (DEBUG) {
    		console.log("NOT Updated: IDX: "+idx+" DAT: "+dat);
  		}
  	}
}