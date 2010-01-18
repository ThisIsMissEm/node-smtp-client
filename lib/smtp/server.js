/*
  File: server.js

  Author: Kenneth Kalmer
  Description:
    This file implements an SMTP server as defined in RFC2821.

  Implements:
    ESMTP: RFC2821

  Issues:
    Plenty, have patience.

*/

// Global
var tcp = require('tcp');
var sys = require('sys');

// Local
var enable_debug = true;
var eol = "\r\n";

/*
  RFC2821 defines an SMTP Session
*/
var SMTPSession = function() {

  this.fromAddress = null;
  this.recipientAddress = null;
  this.callbacks = [];
  this.socket = null;
  this.buffer = "";
  this.data = null;
  this.in_data = false;
}

process.inherits( SMTPSession, process.EventEmitter );

SMTPSession.prototype.connect = function( socket ) {

  var session = this;
  this.socket = socket;

  // callbacks first
  socket.addListener( 'receive', function(packet) {
    session.receive( packet )
  });
  socket.addListener( 'eol', session.eol );
  socket.addListener( 'close', session.close );

  sys.puts( 'Listeners for connect: ' + sys.inspect( this.listeners('connect') ) );
  if ( this.listeners('connect').length <= 0 ) {
    session.greeting();

  } else {
    var promise = new process.Promise();
    promise.addCallback( function() {
      session.greeting();
    });
    promise.addErrback( function( message, quit ) {
      session.error( message );
      if( quit ) session.close();
    });

    this.emit( 'connect', socket.remoteAddress, promise );
  }

}

// patterns for commands
SMTPSession.prototype.command_patterns = {
  helo: /^HELO\s*/i,
  ehlo: /^EHLO\s*/i,
  quit: /^QUIT/i,
  from: /^MAIL FROM:\s*/i,
  rcpt: /^RCPT TO:\s*/i,
  data: /^DATA/i,
  noop: /^NOOP/i,
  rset: /^RSET/i,
  vrfy: /^VRFY\s+/i,
  expn: /^EXPN\s+/,
  help: /^HELP/i,
  tls: /^STARTTLS/i,
  auth: /^AUTH\s+/i
}

// Events emitted
SMTPSession.prototype.events = [
  'connect'
]

// Replies

SMTPSession.prototype.send = function( s ) {
  sys.print("SENDING: " + s + eol);
  this.socket.send( s + eol );
}

SMTPSession.prototype.greeting = function() {
  this.send("220 <hostname> ESMTP node.js");
}

SMTPSession.prototype.notSupported = function(){
  this.send( "500 not supported" );
}

SMTPSession.prototype.sendOk = function() {
  this.send( "250 OK" );
}
SMTPSession.prototype.error = function( message ) {
  this.send( "500 " + message );
}

// Commands
SMTPSession.prototype.ehlo = function() {
  var hostname = this.extractArguments( 'EHLO' );
  this.send('250-<hostname> Hello ' + this.socket.remoteAddress );
  this.send('250 8BITMIME');
}

SMTPSession.prototype.helo = function() {
  var hostname = this.extractArguments( 'HELO' );
  this.send('250<hostname> Hello ' + this.socket.remoteAddress );
}

SMTPSession.prototype.receiver = function() {
  this.recipientAddress = this.extractArguments( 'RCPT TO:' ).replace(/[<>]/g, '');
  this.sendOk();
}

SMTPSession.prototype.sender = function() {
  this.fromAddress = this.extractArguments( 'MAIL FROM:' ).replace(/[<>]/g, '');
  this.sendOk();
}

SMTPSession.prototype.startData = function() {
  this.in_data = true;
  this.send("354 Terminate with line containing only '.'");
}

SMTPSession.prototype.quit = function() {
  this.send( '221 <hostname> closing connection' );
  this.socket.close();
}

// Handlers
SMTPSession.prototype.receive = function( packet ) {
  sys.puts('Received data: ' + packet);

  this.buffer += packet;

  if ( this.in_data ) {
    this.dataReceived();

  } else if ( this.buffer.indexOf( eol ) != 1 ) {
    var command = null;

    for( var cmd in this.command_patterns ) {
      if (this.command_patterns[ cmd ].test( this.buffer ) ) {

          command = cmd;
          break;
      }
    }

    sys.puts( 'Command: ' + sys.inspect(command) );
    switch( cmd ) {
      case 'ehlo':
        this.ehlo();
        break;
      case 'helo':
        this.helo();
        break;
      case 'rcpt':
        this.receiver();
        break;
      case 'from':
        this.sender();
        break;
      case 'data':
        this.startData();
        break;
      case 'quit':
        this.quit();
        break;
      default:
        this.notSupported();
    }

    this.buffer = "";
  }
}

SMTPSession.prototype.dataReceived = function(){
  var re = new RegExp( eol + "." + eol );
  if( re.test( this.buffer ) ) {
    this.data = this.buffer.substr( 0, this.buffer.length - 5 ); // \r\n.\r\n
    this.buffer = "";
    this.in_data = false;
    sys.puts("End of data");
    this.sendOk();
  }
}

// Utilities

SMTPSession.prototype.extractArguments = function( command ) {
  return this.buffer.replace( command, '' ).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

var Server = exports.Server = function() {
  process.EventEmitter.call( this );

  this.host = 'localhost';
  this.port = 10025;
  this.callbacks = [];
  this.server = null;

  return this;
}

process.inherits( Server, process.EventEmitter );

Server.prototype.runServer = function() {
  var self = this;
  this.server = tcp.createServer( function( socket ){

    var session = new SMTPSession();

    // Only add listeners to the session if folks are listening to us.
    for( var i = 0; i < session.events.length; i++ ) {
      var e = session.events[i];
      if( self.listeners( e ).length > 0 ) {
        session.addListener('connect', function() {
          self.emit('connect', arguments);
        });
      }
    }

    session.connect( socket );

    return session;
  });

  this.server.listen( this.port, this.host );
}
