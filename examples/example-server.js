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

