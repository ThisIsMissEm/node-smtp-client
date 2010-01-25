/*===============================================
  File:      example-client.js
  
  Author:    Micheil Smith
  Description:
    Demonstration of the smtp library.
===============================================*/
var sys = require("sys");
var start_mem = process.memoryUsage();

sys.puts(JSON.stringify(start_mem));

var config = require("./config");
var smtp = require("../lib/smtp");

var client = new smtp.Client();

var message = "Date: "+(new Date()).toString()+"\n\
From: Node-SMTP <"+config.from+">\n\
To: "+config.to+"\n\
Subject: Node SMTP Works!\n\
So, It looks like node-smtp all works, which is great news!\n\
\n\
Your's Truly,\n\
SMTP Client.";

client.addListener("packetSent", function(data){
  sys.puts(">>> "+data);
});

client.connect(config.port, config.host).addCallback(function(){
  client.mail(config.from).addCallback(function(){
    client.rcpt(config.to).addCallback(function(){
      client.data(message).addCallback(function(){
        client.quit().addCallback(function(){
          client.disconnect();
          
          var mem = process.memoryUsage();
					sys.puts(JSON.stringify(mem));
					sys.puts(mem["rss"]-start_mem["rss"]);
					sys.puts(mem["vsize"] - start_mem["vsize"]);
					sys.puts(mem["heapTotal"] - start_mem["heapTotal"]);
          sys.puts(mem["heapUsed"] - start_mem["heapUsed"]);
          
        });
      });
    });
  });
});