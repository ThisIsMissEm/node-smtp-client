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

var message = "Date: "+(new Date()).toString()+" \
From: Node-SMTP <"+config.from+">\
Subject: Node SMTP Works!\
To: micheil@brandedcode.com\
So, It looks like node-smtp all works, which is great news! Time for some sleep I think though.\
\
G'night Micheil.";

client.connect(config.port, config.host).addCallback(function(){
	client.mail(config.from).addCallback(function(){
		client.rcpt(config.to).addCallback(function(){
			client.data(message).addCallback(function(){
				client.quit();
			});
		});
	});
});