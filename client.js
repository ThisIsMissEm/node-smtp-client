var sys = require("sys");
var http = require("http");



var smtp = require('./lib/smtp');
var config = require("./config");

var demo = smtp.create(config.port, config.address);

demo.starttls();

demo.connect(config.helo, config.user, config.secret, config.authtype);
