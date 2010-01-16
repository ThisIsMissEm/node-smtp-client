/*===============================================
	File:      queue.js
	
	Author:    Micheil Smith
	Description:
		Handles the parsing and sorting of 
		messages in a stack / queue loop.
===============================================*/

/*-----------------------------------------------
	Queue
-----------------------------------------------*/
exports.Queue = function(){
	this._stack = [];
	this._processing = false;
};

process.inherits(exports.Queue, process.EventEmitter);

exports.Queue.prototype.push = function(item){
	this._stack.push(item);
	this.emit("push", item);
	
	if( !this._processing ){
		this._processor();
	}
};

exports.Queue.prototype.pop = function(){
	var item = this._stack.pop();
	this.emit("pop", item);
	
	return item;
};

exports.Queue.prototype.unshift = function(item){
	this._stack.unshift(item);
	this.emit("unshift", item);
	
	if( !this._processing ){
		this._processor();
	}
};

exports.Queue.prototype.shift = function(){
	var item  = this._stack.shift();
	this.emit("shift", item);
	
	return item;
};

exports.Queue.prototype._processor = function(){
	this._processing = true;
	
	this.process.call(this);
	
	if(this._stack.length > 0){
		this._processor();
	} else {
		this._processing = false;
	}
};

exports.Queue.prototype.process = function(){
	var item = this._stack.shift();
	this.emit("processed", item);
};
