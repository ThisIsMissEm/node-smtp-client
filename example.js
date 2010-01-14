var sys = require("sys");
var http = require("http");



var smtp = require('./lib/smtp');

var demo = smtp.create(25, "MAILSERVER.com");

demo.connect("localhost");
demo.addListener("ready", function(){
	demo.getok("MAIL FROM:<YOUR@EMAIL.COM>", function(){
		demo.getok("RCPT TO:<THEM@EMAIL.COM>", function(){
			demo.wait("DATA", function(packet){
				if(packet.status == 354){
					demo.send("To: THEM <THEM@EMAIL.COM>");
					demo.send("From: YOUR <YOUR@EMAIL.COM>");
					demo.send("Subject: YOUR SUBJECT");
					demo.send("");
					demo.send("YOUR MESSAGE");
					demo.getok(".", function(pkt){
						sys.puts(sys.inspect(pkt));
					});
				}
			})
		});
	});
});