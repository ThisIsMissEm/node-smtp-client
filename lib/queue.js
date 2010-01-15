/*===============================================
	File:      queue.js
	
	Author:    Micheil Smith
	Description:
		Handles the parsing and sorting of 
		messages in a stack / queue loop.
===============================================*/


/*-----------------------------------------------
	Extension to EventEmitter to allow listeners 
	to automatically be remove after being called.
-----------------------------------------------*/
if(process.EventEmitter.prototype.addOnce == undefined){
	process.EventEmitter.prototype.addOnce = function(signal, callback){
		var EventEmitter = this;
	
		this.addListener(signal, function(){
			EventEmitter.removeListener(signal, arguments.callee);
			callback.apply(this, arguments);
		});
		
		return this;
	};
}


/*-----------------------------------------------
	Queue
-----------------------------------------------*/
var Queue = function(){
	this._stack = [];
	this._processing = false;
};

process.inherits(Queue, process.EventEmitter);

Queue.prototype.push = function(item){
	this._stack.push(item);
	this.emit("push", item);
	
	if( !this._processing ){
		this._processor();
	}
};

Queue.prototype.pop = function(){
	var item = this._stack.pop();
	this.emit("pop", item);
	
	return item;
};

Queue.prototype.unshift = function(item){
	this._stack.unshift(item);
	this.emit("unshift", item);
	
	if( !this._processing ){
		this._processor();
	}
};

Queue.prototype.shift = function(){
	var item  = this._stack.shift();
	this.emit("shift", item);
	
	return item;
};

Queue.prototype._processor = function(){
	this._processing = true;
	
	this.process.call(this);
	
	if(this._stack.length > 0){
		this._processor();
	} else {
		this._processing = false;
	}
};

Queue.prototype.process = function(){
	var item = this._stack.shift();
	this.emit("processed", item);
};

exports.Queue = Queue;