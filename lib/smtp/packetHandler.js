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
var Pump = require("../vendor/Pump").Pump;

/*-----------------------------------------------
	PacketHandler
-----------------------------------------------*/
exports.PacketHandler = function(){
	var self = this;
	this.pump = new Pump(this._PumpProcess, this);
	this.pump.addListener("drain", function(){
		self._drain.call(self)
	});
	this.pump.addListener("data", function(data){
		sys.puts(">>> "+data);
	});
	return this;
};

process.inherits(exports.PacketHandler, process.EventEmitter);


exports.PacketHandler.prototype.receive = function(data){
	var lines = data.split("\r\n");
	
	while(lines.length && (line = lines.shift())){
		this.pump.push(line);
	}
};

exports.PacketHandler.prototype._PumpProcess = function(pump){
	var pStatus = null, pContinues = true, pData = [], line;
	
	while(pContinues && pump._stream.length && (line = pump._stream.shift())){
		var packet = /([0-9]{3})([\ \-]{1})(.*)/.exec(line);
		
		pStatus = packet[1];
		pData.push(packet[3]);
		
		pContinues = (packet[2] == "-");
	}
	
	this.emit("packet", {
		status: pStatus,
		data: pData
	});
};

exports.PacketHandler.prototype._drain = function(){
	sys.puts("drain");
	this.emit("drain");
};



//exports.PacketHandler.prototype = new Queue();
/*
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
*/