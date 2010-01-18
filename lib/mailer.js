/*===============================================
	File:      mailer.js
	
	Author:    Micheil Smith
	Description:
		A simple wrapper for smtp/client.
===============================================*/


var SMTP = require("./smtp");
var Queue = require("./vendor/Queue/lib/Queue").Queue;

var mailFormatter = function(email){
	var promise = new process.Promise();
	var _email = {
		to: null,
		from: null,
		body: null
	};
	
	if(email["to"] != undefined && email["from"] != undefined && email["body"] != undefined && email["subject"] != undefined){
		_email.to = email.to;
		_email.from = email.from;
		_email.body = "Date: "+(new Date()).toString()+"\n\
From: "+email.from+" <"+email.from+">\n\
To: <"+email.to+"\n\
Subject: "+email.subject+"\n\
"+email.body+"";
		promise.emitSuccess(_email);
	} else {
		promise.emitError();
	}
	
	return promise;
};



var Mailer = function(port, host, workers){
	this.port = port || "25";
	this.host = host || "localhost";
	this.workers = workers || 1;
	
	this._workers = [];
};

Mailer.prototype.connectWorker = function(){
	for(var i=0, worker; i<this.workers; i++){
		worker = new Worker(port, host);
		worker.addListener("free", function(){
			
		});
	}
}

Mailer.prototype.send = function(to, from, subject, body){
	
};


var Worker = function(port, host){
	this.port = port;
	this.host = host;
	this.client = new SMTP.client();
	this.emit("free");
};

process.inherits(Worker, process.eventEmitter);

Worker.prototype.send = function(email){
	var worker = this;
	var client = this.client;
	
	mailFormatter(email).addCallback(mail){
		client.connect(this.port, this.host).addCallback(function(){
			client.mail(mail.from).addCallback(function(){
				client.rcpt(mail.to).addCallback(function(){
					client.data(mail.body).addCallback(function(){
						worker.emit("free");
					});
				});
			});
		});
	}).addErrback(function(){
		worker.emit("error");
	});
};