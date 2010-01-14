var sys = require("sys"),
    tcp = require("tcp"),
    c = require("./bash_colors");

var oputs = sys.puts;
sys.puts = function(msg){
	oputs(msg+c["rst"]);
};

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

function inArray(arr, value){
	for(var i=0, a=arr.length; i<a; ++i){
		if(arr[i] == value){
			return true;
			break;
		}
	}
	return false;
}

var Response = function(status, data){
	this.status = parseInt(status);
	this.data = data;
	this.success = status.substr(0,1) == 2;
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
		sys.puts(c["ylw"]+"NEW: "+item);
		this.queue.push(item);
	}
};
	
PacketParser.prototype.parse = function(){
	this.parsing = true;
	
	var parsed = {
		status: 0,
		data: []
	};
	var packet, flag, loop=true;
	
	while(this.queue.length && (packet=this.queue.shift())){
		flag = packet.substr(3,1);
		sys.puts("parse: "+JSON.stringify(packet));

		
		if(parsed.status == 0){
			parsed.status = packet.substr(0,3);
		}
		parsed.data.push(packet.substr(4));
		
		if(flag == " "){
			break;
		}
	}
	
	this.emit("packet", new Response(parsed["status"], parsed["data"]));

	if(this.queue.length > 0){
		this.parse();
	} else {
		this.parsing = false;
	}
};


var SMTPClient = function(port, address){
	var client = this;
	this.initialized = false;
	this.capabilities = {};

	this.port  = port || smtp.defaults.port;
	this.address = address;
	this.options = {
		debug: true
	};
	
	this.queue = new PacketParser();
	
	this.queue.addListener("packet", function(packet){
		client.receive(packet);
	});
	
	this.log(c["pur"]+"== New SMTPClient: "+this.address+":"+this.port);
};

process.inherits(SMTPClient, process.EventEmitter);

SMTPClient.prototype.log = function(data){
	if(this.options.debug){
		sys.puts(data+"\033[0;0m");
	}
};
SMTPClient.prototype.debug = function(data){
	if(this.options.debug){
		sys.debug(c["red"]+JSON.stringify(arguments)+"\033[0;0m");
	}
};

SMTPClient.prototype.connect = function(helo, user, secret, authtype){
	var client = this;
	
	this.options.helo = helo;
	this.options.user = user;
	this.options.secret = secret;
	this.options.authtype = authtype.toUpperCase();
	
	this.socket = new tcp.createConnection(this.port, this.address);
	this.socket.setEncoding("ascii");
	
	client.log(c["grn"]+"Connecting..."+this.address+":"+this.port);
	
	this.socket.addListener("connect", function(){
		client.log(c["grn"]+"Connected");
	});
	
	this.socket.addListener("receive", function (data) {
		client.queue.push(data);
		if( ! client.queue.parsing){
			client.queue.parse();
		}
	});
	
	this.socket.addListener("close", function (has_error) {
		client.debug("--" +has_error);
	});
	
	this.socket.addListener("error", function (data) {
		client.debug("!!" + JSON.stringify(data));
	});
	
	this.socket.addListener("timeout", function(){
		client.debug("timeout");
	});
};

SMTPClient.prototype.send = function(cmd, data){
	var data = data || "";
	if(data){
		data = " "+data;
	}
	cmd = cmd+data;
	
	this.lastSend = [cmd, data];
	this.log(">>> "+cmd);
	this.socket.send(cmd+"\r\n");
}


SMTPClient.prototype.receive = function(packet){
	this.emit("packet", packet);
	this.debug("<<< "+JSON.stringify(packet));
	
	if(packet.success){
		switch(packet.status){
			case 220:
				
				if(packet.data[0].search(/SMTP/i) > -1){
					this.esmtp = (packet.data[0].split(" ")[1].toUpperCase() == "ESMTP" ? true : false);
					this.handshake();
				} else {
					this.emit("okay", packet);
				}
	//		case 220:
	//			if(this.initialized){
	//				this.emit("okay", packet);
	//			} else {
	//				this.esmtp = (packet.data[0].split(" ")[1].toUpperCase() == "ESMTP" ? true : false);
	//				this.initialized = true;
	//				this.handshake();
	//			}
				break;
			case 250:
			case 354:
				this.emit("okay", packet);
				break;
			default: 
				this.debug("<<< "+JSON.stringify(packet));
				break;
		}
	} else {
		this.debug("!! "+JSON.stringify(packet));
	}
	
	
};

SMTPClient.prototype.getok = function(cmd, callback){
	var client = this;
	this.addListener("okay", function(packet){
		client.log(c["grn"]+cmd+" OKAY");
		callback.apply(client, [packet]);
		client.removeListener("okay", arguments.callee);
	});
	
	this.send(cmd);
};

SMTPClient.prototype.wait = function(cmd, callback){
	var client = this;
	this.addListener("packet", function(packet){
		client.log(c.blu+"PACKET: "+sys.inspect(packet).replace(/\s/gi, ""));
		callback.apply(client, [packet]);
		client.removeListener("packet", arguments.callee);
	});
	this.send(cmd);
};

SMTPClient.prototype.handshake = function(){
	var client = this;
	if(this.esmtp){
		this.getok("EHLO "+this.options.helo, function(packet){
			for(var i=1, l=packet.data.length, datum; i<l; i++){
				datum = packet.data[i].split(" ");
				client.capabilities[datum.shift()] = datum.join(" ") || true;
			}
			client.emit("ready");
		});
	} else {
		this.send("HELO", this.options.helo);
	}
};

SMTPClient.prototype.starttls = function(){
	var client = this;
	
	client.wait("AUTH", function(packet){
		client.getok("STARTTLS", function(pkt){
			client.socket.setSecure("X509_PEM", null, 0, null, null);
			client.wait("AUTH", function(){});
		});
	});
};




smtp.create = function(port, address){
	return new SMTPClient(port, address);
}