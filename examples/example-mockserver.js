/* -*- Mode: JavaScript; tab-width: 2; indent-tabs-mode: nil -*- */
/*===============================================
	File:      example-mockserver.js
	
	Author:    Micheil Smith
	Description:
		Example of a mock server
===============================================*/
var sys = require("sys");
var mockServer = require("../lib/mock/server").Server;

var server = mockServer(3125, "localhost");
