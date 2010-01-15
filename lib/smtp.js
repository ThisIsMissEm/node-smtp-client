/*===============================================
	File:      smtp.js
	
	Author:    Micheil Smith
	Description:
		This files implements the raw protocol 
		that is SMTP. The version of SMTP used 
		is as defined in RFC2821.
		
		Implements:
			- SMTP: RFC821
			- ESMTP: RFC2821
			- SMTP Authentication: RFC4954
			- SMTP 8Bit-Mime: RFC1652
			- SMTP over SSL/TLS: RFC2487
		
		Issues:
			- SMTP over SSL/TLS does not work, 
			due to lack of TCP Client SSL/TLS 
			negotiation within node.js
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

