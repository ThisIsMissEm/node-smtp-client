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

client.addOnce("idle", function(){
	client.mail(config.from);
});

client.addOnce("idle", function(){
	client.rcpt(config.to);
	
	client.addOnce("idle", function(){
		client.data("config.to");
	});
});
/*client.addOnce("idle", function(){
	client.quit();
});*/