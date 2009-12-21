var sys = require("sys");
var http = require("http");

var smtp = require('../lib/smtp');
var config = require("./config");

var demo = new smtp.connection(config.address, config.port);