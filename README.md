An SMTP/ESMTP Client module for Node.js (maybe one day in a far off gallaxy I might write the server)

Features:
- Very basic protocol implementation
- Very basic wrapper around the protocol to provide a bit of a nice interface for use in applications.

Issues:
- Cannot implement ssl/tls connections yet, hence mailservers like Google Mail which require STARTTLS and ssl/tls connections cannot be used yet.
- Experimental, I'm no genius when it comes to figuring out an RFC that was originally older then me. Use at your own risk, If you encounter problems, add them as an issue on the github project.

