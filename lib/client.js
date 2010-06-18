var sys    = require("sys")
  , net    = require("net")
  , events = require("events")
  , crypto = require("crypto")

module.exports = Client;


/*-----------------------------------------------
  The Client:
-----------------------------------------------*/
var Client = function(port, host, options) {
  this.options = options || {};
  
  this.port = port;
  this.host = host;
  
  events.EventEmitter.call(this);
};

sys.inherits(Client, events.EventEmitter);


/*-----------------------------------------------
  Basic Connection methods.
-----------------------------------------------*/
Client.prototype.connect = function(port, host, callback) {
  
};

Client.prototype.disconnect = function() {
  
};


/*-----------------------------------------------
  Connection Initialization
-----------------------------------------------*/
Client.prototype.handshake = function(callback) {
  
};

Client.prototype.authenticate = function(username, password, callback) {
  
};

Client.prototype.starttls = function(callback) {
  
};


/*-----------------------------------------------
  Mail Sending Methods
-----------------------------------------------*/
Client.prototype.mail = function(from, callback) {
  
};

Client.prototype.recipient = function(to, callback) {
  
};

Client.prototype.data = function(data, callback) {
  
};


/*-----------------------------------------------
  Verify Command
-----------------------------------------------*/
Client.prototype.verify = function(user_or_mailbox, callback) {
  
};

/*-----------------------------------------------
  Expand command
-----------------------------------------------*/
Client.prototype.expand = function(list_id, callback) {
  
};

/*-----------------------------------------------
  Help Command
-----------------------------------------------*/
Client.prototype.help = function(command, callback) {
  if(typeof command == "function") {
    callback = command;
    command  = null;
  }
  
  
};

/*-----------------------------------------------
  Reset Command
-----------------------------------------------*/
Client.prototype.reset = function(callback) {
  
};

/*-----------------------------------------------
  NOOP Command
-----------------------------------------------*/
Client.prototype.noop = function(callback) {
  
};

/*-----------------------------------------------
  Quit Command
-----------------------------------------------*/
Client.prototype.quit = function(callback) {
  
};


/*-----------------------------------------------
  Socket Level Implementation:
-----------------------------------------------*/
function setupSocket() {
  
};

function writeSocket() {
  
};


/*-----------------------------------------------
  Packet Parser
-----------------------------------------------*/
var Parser = function() {
  events.EventEmitter.call(this);
};

// Makes sense in this case for the parser to emit events
// instead of emit on behalf of the client, as the client
// is very callback oriented.
sys.inherits(Parser, events.EventEmitter);

Parser.prototype.write = function(data) {
  
};

