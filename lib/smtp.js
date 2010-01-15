/*===============================================
	File:      smtp.js
	
	Author:    Micheil Smith
	Description:
		Implements two wrappers around the 
		submodules, currently provides an SMTP 
		Client, may in the future include an 
		SMTP Server.
===============================================*/

/*-----------------------------------------------
	SMTP Client
-----------------------------------------------*/
var Client = function(){
	var SMTPClient = require("./smtp/client").Client;
	return new SMTPClient(arguments);
};


/*-----------------------------------------------
	SMTP Server (unimplemented, but possible)
-----------------------------------------------*/
var Server = function(){
	throw new Error("SMTP Server Not Implemented");
};

/*-----------------------------------------------
	Exports
-----------------------------------------------*/
exports.Client = Client;
exports.Server = Server;

