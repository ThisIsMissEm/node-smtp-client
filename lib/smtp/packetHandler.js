/*===============================================
	File:      packetHandler.js
	
	Author:    Micheil Smith
	Description:
		Handles the parsing and processing of 
		incoming SMTP packets.
===============================================*/
// Global
var sys = require("sys");
// Local
var Queue = require("../queue").Queue;

/*-----------------------------------------------
	PacketHandler
-----------------------------------------------*/
var PacketHandler = Queue;

PacketHandler.prototype.push = function(data){
	var packets = data.split("\r\n");
	while(packets.length && (packet = packets.shift())){		
		if(packet != ""){
			this._stack.push(packet);
		
			if( !this._processing ){
				this._processor();
			}
		}
	}
};

PacketHandler.prototype.process = function(){
	var status = 0, data = [], continued = false, signal="other";
	
	while(this._stack.length && (packet = this._stack.shift())){
		
		sys.puts(">> "+packet);
		
		if(continued == false){
			// not a number, strings are easier to work with as status codes.
			status = packet.substr(0,3);
		}
		
		data.push(packet.substr(4));
		
		continued = (packet.substr(3,1) == "-");
		if( !continued){
			break;
		}
	}
	
	switch(status.substr(0,1)){
		case "1":
			signal = "confirm";
			break;
		case "2":
			signal = "ok";
			break;
		case "3":
			signal = "continue";
			break;
		case "4":
			signal = "fail";
			break;
		case "5":
			signal = "error";
			break;
	}
	
	this.emit("packet", {
		status: status,
		data: data
	});
	
	this.emit(signal, {
		status: status,
		data: data
	});
};

/*-----------------------------------------------
	The final export.
-----------------------------------------------*/
exports.PacketHandler = PacketHandler;
