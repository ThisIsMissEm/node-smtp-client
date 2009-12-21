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


var SMTP = function(address, port){
	this.address = address;
	this.port = port || smtp_defaults["port"];
	
	this.connection = 
}

exports.start = function(address, port, hostname, user, password, authtype){
	var port = port || smtp_defaults["port"];
	var hostname = hostname || 'localhost';
	var user = user || null;
	var password = password || null;
	var authtype = authtype || smtp_defaults["auth_type"];
	
	return new SMTP(address, port).start(hostname, user, password, authtype);
};