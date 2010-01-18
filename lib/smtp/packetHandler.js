/* -*- Mode: JavaScript; tab-width: 2; indent-tabs-mode: nil -*- */
/*===============================================
  File:      PacketHandler.js
  
  Author:    Micheil Smith
  Description:
    Handles the parsing and processing of 
    incoming SMTP packets.
    
    We use the vendor Queue runner, 
    although, we replace certain parts to 
    make it's use cleaner.
===============================================*/
// Global
var sys = require("sys");
// Local
var EventEmitter = require("../vendor/eventEmitter");
var Pump = require("../vendor/Pump").Pump;

/*-----------------------------------------------
  PacketHandler
-----------------------------------------------*/
exports.PacketHandler = function(){
  var self = this;
  this.pump = new Pump(this._PumpProcess, this);
  
  this.pump.addListener("drain", function(){
    self._drain.call(self)
  });
  
  return this;
};

process.inherits(exports.PacketHandler, process.EventEmitter);

exports.PacketHandler.prototype.receive = function(data){
  var lines = data.split("\r\n");
  
  while(lines.length && (line = lines.shift())){
    this.pump.push(line);
  }
};

exports.PacketHandler.prototype._PumpProcess = function(pump){
  var pStatus = null, pContinues = true, pData = [], line;
  
  while(pContinues && pump._stream.length && (line = pump._stream.shift())){
    var packet = /([0-9]{3})([\ \-]{1})(.*)/.exec(line);
    
    pStatus = packet[1];
    pData.push(packet[3]);
    
    pContinues = (packet[2] == "-");
  }
  
  this.emit("packet", {
    status: pStatus,
    data: pData
  });
};

exports.PacketHandler.prototype._drain = function(){
  this.emit("drain");
};