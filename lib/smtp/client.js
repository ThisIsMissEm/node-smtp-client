/* -*- Mode: JavaScript; tab-width: 2; indent-tabs-mode: nil -*- */
/*===============================================
	File:	client.js
	Author: Micheil Smith
	
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
	this.capabilities = {};
	
	this.started = false;
	this.waiting = false;
	
	this.debug = true;
	
	this.packetHandler.addListener("idle", function(){
		setTimeout(function(){
			if(client.packetHandler._stack.length == 0 && !client.waiting){
				client.emit("idle");
			}
		}, 1000);
	});
	this.packetHandler.addListener("packet", function(packet){
		if(client.debug){
			sys.puts("\033[0;31m>> "+packet.status+" "+packet.data.join("\n")+"\033[0m")
		}
	});
};

process.inherits(Client, process.EventEmitter);

Client.prototype.connect = function(port, host){
	var client = this;
	var promise = new process.Promise();
	
	this.port = port;
	this.host = host;
	
	this.socket = new tcp.createConnection(this.port, this.host);
	this.socket.setEncoding("ascii");
	
	this.packetHandler.addOnce("packet", function(packet){
		if(packet.status == "220"){
			if(/ESMTP/i.test(packet.data)){
				client.esmtp = true;
			}
			client.handshake().addCallback(function(){
				promise.emitSuccess(packet);
			});
		} else {
			promise.emitError(packet);
		}
	});
	
	this.socket.addListener("receive", function(data){
		if(client.debug){
			sys.puts("\033[0;33m>> "+data.replace(/[\r\n]/gi, "")+"\033[0m")
		}
		client.packetHandler.push(data);
	});
	
	return promise;
};

Client.prototype.writeline = function(line){
	if(this.debug){
		sys.puts("\033[0;32m>> "+line+"\033[0m");
	}
	this.socket.send(line+"\r\n");
};

Client.prototype.get = function(data, callback){
	var client = this;
	
	this.waiting = true;
	
	this.packetHandler.addOnce("packet", function(){
		callback.apply(this, arguments);
		client.waiting = false;
	});
	this.writeline(data);
};

/*-----------------------------------------------
		Handshaking
-----------------------------------------------*/
Client.prototype.handshake = function(){
	if(this.esmtp){
		return this.ehlo();
	} else {
		return this.helo();
	}
};

Client.prototype.helo = function(){
	var client = this;
	var promise = new process.Promise();
	
	this.get("HELO "+this.host, function(packet){
		if(packet.status == "250"){
			for(var i=1, j=packet.data.length, item; i<j; ++i){
				item = packet.data[i].substr(4).split(" ");
				client.capabilities[item.shift()] = item;
			}
			client.connected = true;
			
			promise.emitSuccess(packet);
		} else {
			promise.emitError(packet);
		}
	});
	
	return promise;
};

Client.prototype.ehlo = function(){
	var client = this;
	var promise = new process.Promise();
	
	this.get("EHLO "+this.host, function(packet){
		if(packet.status == "250"){
			for(var i=1, j=packet.data.length, item; i<j; ++i){
				item = packet.data[i].split(" ");
				if(item.length > 1){
					client.capabilities[item[0]] = item.join(" ");
				} else {
					client.capabilities[item[0]] = true;
				}
			}
			client.connected = true;
			
			promise.emitSuccess(packet);
		} else {
			promise.emitError(packet);
		}
	});
	
	return promise;
};

/*-----------------------------------------------
		Authentication
-----------------------------------------------*/
Client.prototype.auth = function(){};

Client.prototype.auth_methods = {
	plain: function(){},
	login: function(){},
	cram_md5: function(){}
};

/*-----------------------------------------------
		Sending mail
-----------------------------------------------*/
Client.prototype.mail = function(from_addr){
	var client	= this;
	var promise = new process.Promise();
	
	this.get("MAIL FROM:<"+from_addr+">", function(packet){
		if(packet.status == "250"){
			promise.emitSuccess(packet);
		} else {
			promise.emitError(packet);
		}
	});
	
	return promise;
};

Client.prototype.rcpt = function(to_addr){
	var client	= this;
	var promise = new process.Promise();
	
	this.get("RCPT TO:<"+to_addr+">", function(packet){
		if(packet.status == "250"){
			promise.emitSuccess(packet);
		} else {
			promise.emitError(packet);
		}
	});
	
	return promise;
};

Client.prototype.data = function(data){
		var client = this;
		/*
		if( ! client.rcpt_to ){
				throw SMTPError["503"];
				return;
		}*/
		
		this.get("DATA", function(packet){
				switch(packet.status){
						case "354":
								client.writeline(data);
								client.get(".", function(packet){
										switch(packet.status){
												case "250":
														break;
												default: 
														sys.puts(packet.status);
														throw SMTPError["unhandled"];
														break;
										}
								});
								break;
						default: 
								throw SMTPError["unhandled"];
								break;
				}
		});
};

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