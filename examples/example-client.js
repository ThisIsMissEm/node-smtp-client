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

var message = "Date: "+(new Date()).toString()+"\n\
From: Node-SMTP <"+config.from+">\n\
To: <"+config.to+"\n\
Subject: Node SMTP Works!\n\
So, It looks like node-smtp all works, which is great news!\n\
\n\
Your's Truly,\n\
SMTP Client.";

client.connect(config.port, config.host).addCallback(function(){
  client.mail(config.from).addCallback(function(){
    client.rcpt(config.to).addCallback(function(){
      client.data(message).addCallback(function(){
        client.quit();
      });
    });
  });
});