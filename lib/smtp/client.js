/*===============================================
	File:      client.js
	
	Author:    Micheil Smith
	Description:
		The SMTP Client
===============================================*/


// Global
var sys = require("sys");
var tcp = require("tcp");

// Local
var SMTPError = require("./errors").client;
var PacketHandler = require("./packetHandler").PacketHandler;


/*-----------------------------------------------
	SMTP Client
-----------------------------------------------*/
var Client = function(){
	this.socket = null;
	this.packetHandler = new PacketHandler();
	this.esmtp = false;
	this.started = false;
};

process.inherits(Client, process.EventEmitter);

Client.prototype.connect = function(port, host){
	var client = this;
	
	this.port = port;
	this.host = host;
	
	this.socket = new tcp.createConnection(this.port, this.host);
	this.socket.setEncoding("ascii");
	
	this.packetHandler.addOnce("ok", function(packet){
		if(packet.data[0].indexOf("ESMTP") > -1){
			client.esmtp = true;
		}
		
		client.handshake();
	});
	
	this.socket.addListener("receive", function(data){
		client.packetHandler.push(data);
	});
};

Client.prototype.writeline = function(line){
	sys.puts("\033[0;32m"+line+"\033[0m")
	this.socket.send(line+"\r\n");
};

Client.prototype.get = function(data, callback){
	this.packetHandler.addOnce("packet", callback);
	this.writeline(data);
};

Client.prototype.handshake = function(){
	if(this.esmtp){
		this.ehlo();
	} else {
		this.helo();
	}
};

/* protocol implementation: */
Client.prototype.helo = function(){
	var client = this;
	
	this.get("HELO "+this.host, function(packet){
		switch(packet.status){
			case "250":
				client.capabilities = packet.data;
				client.started = true;
				break;
			case "504":
				throw SMTPError["504"];
				break;
			case "550":
				throw SMTPError["550"];
				break;
		}
	});
};

Client.prototype.ehlo = function(){
	var client = this;
	
	this.get("EHLO "+this.host, function(packet){
		switch(packet.status){
			case "250":
				client.capabilities = packet.data;
				client.started = true;
				break;
			case "504":
				throw SMTPError["504"];
				break;
			case "550":
				throw SMTPError["550"];
				break;
		}
	});
};


exports.Client = Client;