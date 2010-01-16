/* -*- Mode: JavaScript; tab-width: 2; indent-tabs-mode: nil -*- */
/*===============================================
	File:      example-client.js
	
	Author:    Micheil Smith
	Description:
		Demonstration of the smtp library.
===============================================*/
var config = require("./config");
var smtp = require("../lib/smtp");

var client = new smtp.Client();

client.connect(config.port, config.host).addCallback(function(){
	client.mail(config.from).addCallback(function(){
		client.rcpt(config.to);
	});
});