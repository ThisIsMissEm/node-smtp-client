var sys = require("sys");


var group = function(name, tests){
	var self = this;
	
	this.name = name;
	this.tests = tests || [];
	
	this.count = 0;
	this.failures = 0;
	
	this._assert = {
		equal: function(actual, expected, message){
			self.count++;
			if(actual != expected){
				sys.puts("\033[0;31m   FAIL: "+message+" actual: "+JSON.stringify(actual)+" expected: "+JSON.stringify(expected)+"\033[0m");
				self.failures++;
			} else {
				sys.puts("\033[0;32m   PASS: "+message+"\033[0m");
			}
		}
	};
	
	
	sys.puts("\033[1;30mGROUP: "+this.name+"\033[0m");
	
	this.tests.apply(this._assert);
	
	sys.puts("---");
	sys.puts("PASSES: "+(this.count-this.failures));
	sys.puts("FAILURES: "+this.failures);
	sys.puts("---");
};

exports.group = function(name, tests){
	return new group(name, tests);
};