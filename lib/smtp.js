/* -*- Mode: JavaScript; tab-width: 2; indent-tabs-mode: nil -*- */
/*===============================================
	File: smtp.js
	Author: Micheil Smith
	
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
  var SMTPServer = require("./smtp/server").Server;
  return new SMTPServer(arguments);
};

/*-----------------------------------------------
	Exports
-----------------------------------------------*/
exports.Client = Client;
exports.Server = Server;

