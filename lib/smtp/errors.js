/*===============================================
	File:      errors.js
	
	Author:    Micheil Smith
	Description:
		All the different client (and server) 
		error codes to translate to human text.
===============================================*/

var SMTPErrors = exports;

SMTPErrors.client = {
	"504": new Error("Command parameter not implemented"),
	"550": new Error("Requested action not taken: mailbox unavailable")
};