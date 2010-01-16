/*===============================================
	File:      server.js
	
	Author:    Micheil Smith
	Description:
		A fake server, for use in testing.
===============================================*/

var sys = require("sys");
var tcp = require("tcp");

var MockServer = function(port, host){
	this.server = null;
	this.socket = null;
	this.port = port;
	this.host = host;
	
	this.connect();
};

MockServer.prototype.connect = function(){
	var self = this;
		
	this.server = tcp.createServer(function(socket){
		self.socket = socket;
		
		self.socket.setEncoding("ascii");
		self.socket.addListener("connect", function () {
			setTimeout(function(){
				self.send("hello\r\n");
			}, 10);
		});
		self.socket.addListener("receive", function (data) {
			self.send(data);
		});
		self.socket.addListener("eof", function () {
			self.send("goodbye\r\n");
			self.socket.close();
		});
	}).listen(self.port, self.host);
};

MockServer.prototype.close = function(){
	this.socket.close();
};

MockServer.prototype.send = function(data){
	sys.puts(">> "+data);
	this.socket.send(data);
};

exports.Server = function(port, host){
	return new MockServer(port, host);
};