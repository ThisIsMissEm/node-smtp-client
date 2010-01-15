/*===============================================
	File:      example-client.js
	
	Author:    Micheil Smith
	Description:
		Demonstration of the smtp library.
===============================================*/
var config = require("./config");
var smtp = require("../lib/smtp");

var client = new smtp.Client();

client.connect(config.port, config.host);