/*===============================================
	File:      errors.js
	
	Author:    Micheil Smith
	Description:
		Defines all the different client and 
		server error codes to translate them 
		to human text.
===============================================*/

var SMTPErrors = exports;

SMTPErrors.client = {
	"unhandled": new Error("Received an unhandled status code"),
	// numeric:
	"504": new Error("Command parameter not implemented"),
	"550": new Error("Requested action not taken: mailbox unavailable"),
	"554": new Error("Transaction failed (Or, in the case of a connection-opening response, \"No SMTP service here\")")
};