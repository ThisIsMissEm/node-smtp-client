/*===============================================
	File:      Pump.js
	
	Author:    Micheil Smith
	Description:
		A simple data pump
===============================================*/

var sys = require("sys");

var Pump = exports.Pump = function(/*Function*/ handler, /*Scope*/ scope){
	this._stream = [];
	this.process = handler || this.defaultProcess;
	this.scope = scope;
	
	var pump = this;
	this.addListener("push", function(){
		pump._process();
	});
};

process.inherits(Pump, process.EventEmitter);

Pump.prototype.push = function(/*Mixed*/ data){
	clearTimeout(this._bufTimer);
	this._stream.push(data);
	
	var scope = this;
	
	this._bufTimer = setTimeout(function(){
		scope.emit("push", data);
	}, 100);
};

Pump.prototype._process = function(ignore){
	if( ! this.running){
		while(this._stream && this._stream.length > 0){
			this.running = true;
			this.process.call(this.scope, this);
		}
		
		if (this._stream && !(this._stream.length > 0)) {
			this.emit("drain");
		}
		
		this.running = false;
	}
};

Pump.prototype.defaultProcess = function(/*Scope*/ pump){
	while(pump._stream.length && (packet = pump._stream.shift())){
		pump.emit("data", pump._stream.shift());
	}
};