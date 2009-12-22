var sys = require("sys");
var http = require("http");



var smtp = require('./lib/smtp');
var config = require("./config/config");

var demo = smtp.create(config.port, config.address, true);

demo.debug = true;
demo.connect(config.helo, config.user, config.secret, config.authtype);