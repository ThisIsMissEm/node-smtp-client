/*===============================================
	File:      client.js
	
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
var tcp = require("tcp");

// Local
var SMTPError = require("./errors").client;
var PacketHandler = require("./packetHandler").PacketHandler;


/*-----------------------------------------------
	SMTP Client
-----------------------------------------------*/
var Client = function(){
	var client = this;
	
	this.socket = null;
	this.packetHandler = new PacketHandler();
	this.esmtp = false;
	this.started = false;
	this.waiting = false;
	
	this.packetHandler.addListener("idle", function(){
		setTimeout(function(){
			if(client.packetHandler._stack.length == 0 && !client.waiting){
				client.emit("idle");
			}
		}, 500);
	})
};

process.inherits(Client, process.EventEmitter);

Client.prototype.connect = function(port, host){
	var client = this;
	
	this.port = port;
	this.host = host;
	
	this.socket = new tcp.createConnection(this.port, this.host);
	this.socket.setEncoding("ascii");
	this.waiting = true;
	
	this.packetHandler.addOnce("packet", function(packet){
		client.waiting = false;
		switch(packet.status){
			case "220":
				if(packet.data[0].indexOf("ESMTP") > -1){
					client.esmtp = true;
				}
				client.handshake();
				break;
			case "554":
				throw SMTPError["554"];
				break;
			default:
				throw SMTPError["unhandled"];
				break;
		}
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
	var client = this;
	
	this.waiting = true;
	
	this.packetHandler.addOnce("packet", function(){
		client.waiting = false;
		callback.apply(this, arguments);
	});
	this.writeline(data);
};

/*-----------------------------------------------
	Handshaking
-----------------------------------------------*/
Client.prototype.handshake = function(){
	if(this.esmtp){
		this.ehlo();
	} else {
		this.helo();
	}
};

Client.prototype.helo = function(){
	var client = this;
	
	this.get("HELO "+this.host, function(packet){
		switch(packet.status){
			case "250":
				client.capabilities = packet.data;
				client.started = true;
				client.emit("started");
				break;
			case "504":
				throw SMTPError["504"];
				break;
			case "550":
				throw SMTPError["550"];
				break;
			default:
				throw SMTPError["unhandled"];
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
				client.emit("started");
				break;
			case "504":
				throw SMTPError["504"];
				break;
			case "550":
				throw SMTPError["550"];
				break;
			default:
				throw SMTPError["unhandled"];
				break;
		}
	});
};

/*-----------------------------------------------
	Authentication
-----------------------------------------------*/
Client.prototype.auth = function(){};

/*-----------------------------------------------
	Sending mail
-----------------------------------------------*/
Client.prototype.mail = function(from_addr){
	var client  = this;
	
	this.get("MAIL FROM:<"+from_addr+">", function(packet){
		switch(packet.status){
			case "250":
				client.mail_from = true;
				break;
			default: 
				throw SMTPError["unhandled"];
				break;
		}
	});
};
Client.prototype.rcpt = function(to_addr){
	var client  = this;
	
	if( ! client.mail_from){
		throw SMTPError["503"];
		return;
	}
	
	this.get("RCPT TO:<"+to_addr+">", function(packet){
		switch(packet.status){
			case "250":
				break;
			default: 
				throw SMTPError["unhandled"];
				break;
		}
	});
};
Client.prototype.data = function(){};

/*-----------------------------------------------
	Other Commands
-----------------------------------------------*/
Client.prototype.rset = function(){};
Client.prototype.vrfy = function(){};
Client.prototype.expn = function(){};
Client.prototype.help = function(){};
Client.prototype.noop = function(){};

/*-----------------------------------------------
	Quit Command
-----------------------------------------------*/
Client.prototype.quit = function(){
	var client = this;
	this.get("QUIT", function(packet){
		client.socket.close();
	});
};





exports.Client = Client;