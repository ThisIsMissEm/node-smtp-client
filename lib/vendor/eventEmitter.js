/*===============================================
	File:      eventEmitter.js
	
	Author:    Micheil Smith
	Description:
		Various enhancements to node's 
		event.eventEmitter
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