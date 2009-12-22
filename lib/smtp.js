var sys = require("sys"),
    tcp = require("tcp");

var smtp = exports;

smtp.defaults = {
	// The default SMTP port number, 25
	port: 25,
	// The default mail submission port number, 587.
	submission_port: 587,
	// The default SMTPS port number, 465.
	tls_port: 465,
	ssl_port: 465,
	auth_type: "plain"
};

smtp.errors = {
	"Auth": new Error("SMTP Authentication Error"),
	"Server": new Error("SMTP Server Error (code: 420, 450 or temporary error)"),
	"Syntax": new Error("SMTP Syntax Error (code: 500)"),
	"Fatal": new Error("SMTP Fatal Error (code: all 5xx except for 500)"),
	"Unknown": new Error("SMTP Unknown reply code returned from server"),
	"Unsupported": new Error("SMTP Command Unsupported on server")
};


var PacketParser = function(){
	this.regex = /^([0-9]{3})([\-\ ]{1})(.*)$/;
	this.parsing = false;
	this.queue = [];
};

process.inherits(PacketParser, process.EventEmitter);

PacketParser.prototype.push = function(data){
	var packets = data.split("\r\n");
	for(var item; packets.length && (item = packets.shift());){
		this.queue.push(item);
	}
};
	
PacketParser.prototype.parse = function(){
	this.parsing = true;
	
	var parsed = {
		status: 0,
		data: ""
	};
	var cpkt, packet, loop=true;
	
	while(this.queue.length && (cpkt=this.queue.shift())){
		packet = this.regex.exec(cpkt);
				
		if(loop || parsed.status == 0){
			parsed.status = parseInt(packet[1]);
			parsed.data += packet[3]+" ";
			loop = packet[2] == "-" ? true : false;
		} else {
			this.queue.unshift(cpkt);
			break;
		}
	}
	
	this.emit("packet", parsed);

	if(this.queue.length > 0){
		this.parse();
	} else {
		this.parsing = false;
	}
};


var SMTPClient = function(port, address){
	var client = this;
	
	this.port = port || smtp.defaults.port;
	this.address = address;
	
	
	this.queue = new PacketParser();
	
	this.queue.addListener("packet", function(packet){
		client.handlePacket(packet);
	});
	this.debug = true;
	this.log("== New SMTPClient: "+this.address+":"+this.port);
	this.debug = false;
};

SMTPClient.prototype.log = function(data){
	if(this.debug){
		sys.puts("\033[0;32m"+data+"\033[0;0m");
	}
}

SMTPClient.prototype.connect = function(helo, user, secret, authtype){
	var client = this;
	
	this.socket = new tcp.createConnection(this.port, this.address);
	this.socket.setEncoding("ascii");
	
	client.log("Connecting..."+this.address+":"+this.port);
	
	this.socket.addListener("connect", function(){
		client.log("Connected");
	});
	
	this.socket.addListener("receive", function (data) {
		client.queue.push(data);
		if( ! client.queue.parsing){
			client.queue.parse();
		}
	});
	
	this.socket.addListener("close", function (data) {
		sys.debug("--" + JSON.stringify(data));
	});
	
	this.socket.addListener("error", function (data) {
		sys.debug("!!" + JSON.stringify(data));
	});
	
	this.socket.addListener("timeout", function(){
		sys.puts("timeout");
	});
	
	return this;
};

SMTPClient.prototype.handlePacket = function(packet){
	switch(packet.status){
		case 220:
			var type = packet.data.split(" ")[1].toUpperCase();
			sys.debug(type);
			
			this.esmtp = type == "ESMTP" ? true : false;
			this.handshake();
			break;
		default: 
			sys.debug("<< "+JSON.stringify(packet));
			break;
	}
}

SMTPClient.prototype.handshake = function(helo, user, secret, authtype){
	this.log("Sending "+(this.esmtp ? "EHLO" : "HELO"));
	if(this.esmtp){
		this.socket.send("EHLO "+helo+"\r\n");
	} else {
		this.socket.send("HELO "+helo+"\r\n");
	}
};


smtp.create = function(port, address){
	return new SMTPClient(port, address);
}