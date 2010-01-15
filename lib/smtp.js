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

// Global
var sys = require("sys");
var tcp = require("tcp")
// Local
var PacketHandler = require("./smtp/packetHandler").PacketHandler;

/*-----------------------------------------------
	SMTP Error Definitions
-----------------------------------------------*/
var SMTPError = {
	auth: new Error("SMTP Authentication Error"),
	server: new Error("SMTP Server Error (code: 420, 450 or temporary error)"),
	syntax: new Error("SMTP Syntax Error (code: 500)"),
	fatal: new Error("SMTP Fatal Error (code: all 5xx except for 500)"),
	unknown: new Error("SMTP Unknown reply code returned from server"),
	unsupported: new Error("SMTP Command Unsupported on server"),
	
	
	"504": new Error("Command parameter not implemented"),
	"550": new Error("Requested action not taken: mailbox unavailable")
};

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



/*-----------------------------------------------
	SMTP Server (unimplemented, but possible)
-----------------------------------------------*/
var Server = function(){
	throw new Error("SMTP Server Not Implemented");
	return;
};

exports.Client = Client;
exports.Server = Server;

