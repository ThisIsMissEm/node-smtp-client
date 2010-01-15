var testkit = require("./testkit");
var queue = require("../lib/queue");

testkit.group("Queue", function(){
	var testqueue = new queue.Queue();
	
	this.equal(testqueue._stack.length, 0, "Queue should start empty");

	
});