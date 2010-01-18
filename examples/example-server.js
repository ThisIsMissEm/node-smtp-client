/*===============================================
	File:      example-server.js

	Author:    Micheil Smith
	Description:
		An example of the node-smtp server.

		(Not Implemented)
===============================================*/

var smtp = require("../lib/smtp");

var server = new smtp.Server();
server.runServer();

var sys = require('sys');
server.addListener('connect', function( args ) {
  var remoteHost = args[0];
  var promise = args[1];
  sys.puts( 'connect callback' );
  promise.emitError("I don't like your type [" + remoteHost +"]");
});
