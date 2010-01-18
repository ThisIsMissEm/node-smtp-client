/* -*- Mode: JavaScript; tab-width: 2; indent-tabs-mode: nil -*- */
/*===============================================
	File:      PacketHandler.js
	
	Author:    Micheil Smith
	Description:
		Handles the parsing and processing of 
		incoming SMTP packets.
		
		We use the vendor Queue runner, 
		although, we replace certain parts to 
		make it's use cleaner.
===============================================*/
// Global
var sys = require("sys");
// Local
var EventEmitter = require("../vendor/eventEmitter");
var Queue = require("../vendor/Queue/lib/Queue").Queue;

/*-----------------------------------------------
	PacketHandler
-----------------------------------------------*/
exports.PacketHandler = function(){};
exports.PacketHandler.prototype = new Queue();

exports.PacketHandler.prototype.push = function(data){
	var packets = data.split("\r\n");
	while(packets.length && (packet = packets.shift())){
		this._stack.push(packet);
	}
	
	if( !this._processing ){
		this._processor();
	}
};

exports.PacketHandler.prototype.process = function(){
	var status = 0, data = [], continued = false;
	
	for(var continued = false; this._stack.length && (packet = this._stack.shift());){
		if( !continued ){
			status = packet.substr(0,3); // not a number, strings are easier to work with as status codes.
		}
		
		data.push(packet.substr(4));
		
		if( ! (continued = (/[0-9]{3}\-/i.test(packet))) ){
			break;
		}
	}
	
	this.emit("packet", {
		status: status,
		data: data
	});

	if(this._stack.length == 0){
		this.emit("drain");
	}
	
};