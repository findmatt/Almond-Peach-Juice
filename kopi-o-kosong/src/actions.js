//Global var
// ABAP system RFC connection parameters
var abapSystem = {
	user: 'A_JESMONDLEE',
	passwd: 'Jessy1',
	ashost: '172.16.4.4',
	sysnr: '01',
	client: '148',
	lang: 'EN',
};
var result = null
/**
 * Check leave
 * @param  {string} name - userID
 */
async function SAP_INTERFACE_LEAVE_CHK(state, event, {name}) {
	result: null //clear flag
	var rfc = require('node-rfc'); //required node module
	// table structure definition
	var client = new rfc.Client(abapSystem); // create new client
	console.log('RFC client lib version: ', client.get_version()); // echo SAP NW RFC SDK and nodejs/RFC binding version
	client.connect(function(err) { // open connection
		if (err) { // check for login/connection errors
			return {...state, result: "Error", msg: "Could not connect to server"}
		}
		// invoke function module
		client.invoke('Z_TEST_VEN_RFC',	{ IMPORTSTRUCT: importStruct, ECHOSTRUCT: echoStruct},
		function(err, res) { // check for function module error
			if (err) {
				return {...state, result: "Error", msg: "Error in SAP action"}
			}
			while (res.RESPTEXT == null){
				if (res.RESPTEXT == "Leave Applied"){ // return from function module
					return {...state, result: "OK", msg: res.RESPTEXT}
				}
			}
		});
	});
	client.close(); // close connection
}
/**
 * Update applied leave
 * @param  {string} name - userID
 * @param  {string} dateRange - begda and endda
 */
async function SAP_INTERFACE_LEAVE_UPD(state, event, {name, begda, endda}) {
	result: null //clear flag
	var rfc = require('node-rfc'); //required node module
	// table structure definition
	var client = new rfc.Client(abapSystem); // create new client
	console.log('RFC client lib version: ', client.get_version()); // echo SAP NW RFC SDK and nodejs/RFC binding version
	client.connect(function(err) { // open connection
		if (err) { // check for login/connection errors
			return {...state, result: "Error", msg: "Could not connect to server"}
		}
		// invoke function module
		client.invoke('Z_TEST_VEN_RFC',	{ IMPORTSTRUCT: importStruct, ECHOSTRUCT: echoStruct},
		function(err, res) { // check for function module error
			if (err) {
				return {...state, result: "Error", msg: "Error in SAP action"}
			}
			while (res.RESPTEXT == null){
				if (res.RESPTEXT == "Leave Applied"){ // return from function module
					return {...state, result: "OK", msg: res.RESPTEXT}
				}
			}
		});
	});
	client.close(); // close connection
}
/**
 * Apply leave
 * @param  {string} name - userID
 * @param  {string} dateRange - begda and endda
 */
async function SAP_INTERFACE_LEAVE_INS(state, event, {name, begda, endda}) {
	result: null //clear flag
	var rfc = require('node-rfc'); //required node module
	//convert date
	var begda_s = begda.split(".");
	begda = begda_s[2]+begda_s[1]+begda_s[0];
	var endda_s = endda.split(".");
	endda = endda_s[2]+endda_s[1]+endda_s[0];
	// IMPORTSTRUCT table attributes
	var importStruct = {
		USERID: name,
		BEGDA: begda,
		ENDDA: endda,
		ACTION: 'INS',
		REMARKS: 'NA',
	};
	// ECHOSTRUCT table attributes
	var echoStruct = {
		BEGDA: '',
		ENDDA: '',
		REMARKS: '',
		RET_STATUS: '',
	};
	var client = new rfc.Client(abapSystem); // create new client
	console.log('RFC client lib version: ', client.get_version()); // echo SAP NW RFC SDK and nodejs/RFC binding version
	
	client.connect(function(err) { // open connection
		if (err) { // check for login/connection errors
			// console.error('could not connect to server', err);
			return {...state, result: "Error", msg: "Could not connect to server"}
		}
		
	// invoke Z_TEST_VEN_REC function module
		client.invoke('Z_TEST_VEN_RFC',	{ IMPORTSTRUCT: importStruct, ECHOSTRUCT: echoStruct},
		function(err, res) {
			if (err) {
				console.error('Error invoking Z_TEST_VEN_RFC:', err);
				return {...state, result: "Error", msg: "Error in SAP action"}
			}
			console.log('Result Z_TEST_VEN_RFC:', res);
				while (res.RESPTEXT == null){
					if (res.RESPTEXT == "Leave Applied"){
						return {...state, result: "OK", msg: res.RESPTEXT}
					}
				}
			});
	});
	client.close();
}

module.exports = { SAP_INTERFACE_LEAVE_CHK, SAP_INTERFACE_LEAVE_UPD, SAP_INTERFACE_LEAVE_INS,
  /**
   * set user id
   * @param {string} name - Name of the tag.
   * @param {string} value - Value of the tag.
   */
  setUserTag: async (state, event, { name, value }) => {
    await event.bp.users.tag(event.user.id, name, value)
	
	if (event.nlu.intent.is('name')){
		result = "OK";
	}
	else{
		result = "ERROR";
	}
	return { ...state, result}
  },
  /**
   * get user id
   * @param {string} name - Name of the tag.
   * @param {string} into - Value of the tag.
   */
  getUserTag: async (state, event, { name, into }) => {
    const value = await event.bp.users.getTag(event.user.id, name)
    return { ...state, [into]: value }
  },
  
  /**
   * @param {string} date - name of the tag.
   * @param {string} value - date range of the tag.
   */
  setDateTag: async (state, event, { date, value }) => {
    await event.bp.users.tag(event.user.id, date, value)
	result: null //clear flag
	// validation on date format
	var dates = value.split(".");
	if (dates[2] > 2017 && dates [2] < 2030){
		if (dates[1] > 0 && dates[1] <13){ //valid month
			if (dates[0] > 0){ //valid days
				if ((dates [0] < 32 && (dates[1] == 1 || dates[1] == 3 || dates[1] == 5 || dates[1] == 7 || dates[1] == 8 || dates[1] == 10 || dates[1] == 12)) || (dates [0] < 31 && (dates[1] == 2 || dates[1] == 4 || dates[1] == 6 || dates[1] == 9 || dates[1] == 11))){ 
					return { ...state, result: "OK" }
				}
			}
			return {...state, result: "Error", msg: "Invalid date, aqccepts between 01 to 31"}
		}
		return {...state, result: "Error", msg: "Invalid month, accepts between 01 to 12"}
	}
	return {...state, result: "Error", msg: "Invalid year, accpets between 2018 to 2029"}
  },
  /**
   * @param {string} date - name of the tag.
   * @param {string} into - Value of the tag.
   */
  getDateTag: async (state, event, { date, into }) => {
    const value = await event.bp.users.getTag(event.user.id, date)
    return { ...state, [into]: value }
  },
 
}