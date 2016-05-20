var config = {};
// Your 123solar API link
config.SOLAR_HOST_URL="http://192.168.0.250/123solar/programs/programlive.php";

// Your Domoticz ip and port, remember to NOT put trailing slash like http://domoticz-ip<:port>
// If your Domoticz need Authentication http://<username:password@>domoticz-ip<:port>
config.DOMOTICZ_HOST_URL="http://192.168.0.12:8081";

// IDX Numbers JSON, replicate all the "1" part if you have more than 1 inverter
config.IDX = {
	"1" : {
		"I1P" : 0, //		Usage		Electric	100.5 Watt
		"I2P" : 0, //		Usage		Electric	100.5 Watt
		"I1V" : 0, //		General		Voltage		170.000 V
		"I2V" : 0, //		General		Voltage		170.000 V
		"I1A" : 0, //		General		Current		0.600 A
		"I2A" : 0, //		General		Current		0.600 A
		"GP" : 0, //		Usage		Electric	100.5 Watt
		"GV" : 0, //		General		Voltage		235.000 V
		"GA" : 0, //		General		Current		0.600 A		
		"FRQ" : 0, //		Power Frequency, I don't know which type!
		"EFF" : 0, //		General		Percentage	81.50%
		"INVT" : 0, //		Temp		TFA 30.3133	60.0°C
		"Total_Power" : 0 //General		kWh			8549.873 kWh
	}
};

config.power_Consumption_IDX = 0; //   RFXMeter    counter     16257.239 kWh
config.solar_Power_IDX = 0; //          General     kWh         12769.776 kWh

//Power Meter IDX, if you have one, so Domoticz can calculate power usage. 0 if you don't have
config.pow_Meter_IDX = 0;

//Developing variables
config.DEBUG = true; //Write to console.log all the datas
config.TEST = true; //Dry-run, it just read from 123Solar, does NOT update any value on Domoticz

module.exports = config;