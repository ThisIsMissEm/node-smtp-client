**Author:** Micheil Smith  

**Description:** Notes for the development of an SMTP Client.

----
	
## Using AUTH ##

The AUTH command in SMTP has consistent syntax of:	

	AUTH type

It has a few main types, these are: 

*	PLAIN
*	LOGIN
*	CRAM-MD5

### AUTH PLAIN ###
This takes in one piece of data, generally sent as an optional parameter to the main packet. This data consists of a base64 encoded string of the clients username and secret / password.

#### Example ####
	> AUTH PLAIN
	334 ...
	> base64_encode("\0"+username+"\0"+secret)
	235 2.7.0 ...

### AUTH LOGIN ###
This method of authentication appears to be a three stage packet, first you need to send AUTH LOGIN, then the username encoded in base64, and finally get a 250 response from sending the secret encoded in base64.

#### Example ####
	> AUTH LOGIN
	334 ...
	> base64_encode(username)
	334 ...
	> base64_encode(secret)
	235 2.7.0 ...

### AUTH CRAM-MD5 ###
This method is a bit different to the first two in that it's server initiated. After sending an AUTH CRAM-MD5 packet, the smtp server should send back a CRAM-MD5 string, this is then used in further transactions for authentication.

#### Example ####
	> AUTH CRAM-MD5
	334 TOKEN
	> base64_encode( username +" "+ md5_encode(secret, TOKEN));
	235 2.7.0 ...

## Using telnet to connect to an SMTP Server ##
Connecting with telnet to an SMTP Server is rather simple as long as you know the host and the port the server is running on. Generally the port will be something like 25, 465, or 587. Then, connecting is simple:
	
	$ telnet HOST PORT

## Using OpenSSL to connect to an SMTP Server ##

When using openssl, it automatically carries out the handshake and STARTTLS packets with the SMTP Server, you can start a tls/ssl smtp client connection using:

	$ openssl s_client -ign_eof -crlf -starttls smtp -connect HOST:PORT

For example, using the gmail smtp servers, that may be:

	$ openssl s_client -ign_eof -crlf -starttls smtp -connect smtp.gmail.com:587