var request = require('request'),
    fs = require('fs'),
    util = require('./util'),
    cst = require('./const'),
    struct = require('./struct'),
    config = require('./config.js'),
    log = require('./log.js');

var _messageType = {
  updateManager:0
};

var upScanIP, downScanIP;
var pulseScanCount = 0;
var selfProductSign;
//  Pulse Compare Result Data Structure
//  {
//    productName: {
//      selfstamp: selfVersionStamp,
//      src: ip,
//      srcstamp: sourceIPVersionStamp
//    }
//  }
var pulseResult = {};

var neighborTable = {
  scanedData:[],
  save: function(cb){
    fs.writeFile(struct.neighborTableFile, JSON.stringify(this.scanedData),
      {encoding:'utf8'}, cb);
  },
  restore: function(){
    try{
      var resultStr = fs.readFileSync(struct.neighborTableFile, 
        {encoding:'utf8'});
      this.scanedData = JSON.parse(resultStr);
      if (!(this.scanedData instanceof Array)){
        log.error('Persistenced neighbor info has wrong format');
        this.scanedData = [];
      }
    }catch(e){
      log.error(e, 'Failed to restore neighbor info from persistence.');
      this.scanedData = [];
    }
  },
  add: function(ip){ // only add to scaned data, if value not in configuration
    if (config.neighbor.indexOf(ip) < 0 && this.scanedData.indexOf(ip) < 0){
      this.scanedData.push(ip);
    }
  },
  remove: function(ip){ // only remove from scaned data
    var idx = this.scanedData.indexOf(ip);
    if (idx > -1){
      this.scanedData.splice(idx,1); 
    }
  },
  get: function(){
    var result = this.scanedData.slice();
    if (config.neighbor.length > 0){
      for (var i=0;i<config.neighbor.length;i++){
        if (result.indexOf(config.neighbor[i]) < 0){
          result.push(config.neighbor[i]);
        }
      }
    }
    return result;
  }
};

function pulseDetect(ip, cb){
  request.defaults({timeout:config.pulseTimeout}).
  get('http://' + ip + ':' + config.port + cst.pulseUrl, 
  function(err, res, data){
    if (err){
      neighborTable.remove(ip); // remove broke neighbor
    }else{
      try{
        data = JSON.parse(data);
      }catch(e){
        data = {};
      }
      // save or remove this neighbor
      if (!data.sign || data.sign!=cst.dropSignature){ // not drop node return
        neighborTable.remove(ip); // remove broke neighbor
      }else{
        neighborTable.add(ip);
        // update manager address if need
        if (!cst.manager && data.manager){
          cst.manager = data.manager;
        }
        // deal with return product structure
        var mergeResult = struct.mergeProductSign(selfProductSign, data.data);
        if (mergeResult && mergeResult.length>0){
          for (var prdName in mergeResult){
            var pulsePrd = pulseResult[prdName];
            if (pulsePrd){
              if (pulsePrd.srcstamp < mergeResult[prdName].srcstamp){
                pulsePrd.srcstamp = mergeResult[prdName].srcstamp;
                pulsePrd.src = ip;
              }
            }else{
              pulsePrd = mergeResult[prdName];
              pulsePrd.src = ip;
              pulseResult[prdName] = pulsePrd;
            }
          }
        }
      }
    }
    if (typeof cb=='function'){
      cb(pulseResult); 
    }
  }); 
}

function scanNeighborPulse(asyncTaskGroup){
  if (!(asyncTaskGroup instanceof util.AsyncTaskGroup)){
    throw new Error('scanNeighborPulse need a asyncTaskGroup as parameter');
  }
  upScanIP = util.increaseIP(upScanIP);
  downScanIP = util.decreaseIP(downScanIP);
  asyncTaskGroup.push(pulseDetect, upScanIP);
  asyncTaskGroup.push(pulseDetect, downScanIP);
  pulseScanCount += 2;
  asyncTaskGroup.executeAll();
}

function getSelfIP(){
  var result = null;
  var ips = util.getInternalIPv4s();
  var i = 0;
  if (ips.length > 0){
    result = ips[0];
    if (typeof config.priNeighborIprange=='string'){
      var ipRangeParts = config.priNeighborIprange.split('.');
      var ipParts, found = false;
      for (i=0;i<ips.length;i++){
        ipParts = ips[i].split('.');
        found = true;
        for (var j=0;j<4;j++){
          if (ipRangeParts[j]!='*' && ipRangeParts[j]!=ipParts[j]){
            found = false;
            break;
          }
        }
        if (found){
          result = ips[i];
          break;
        }
      }
    }else{
      for(i=0;i<ips.length;i++){
        if (util.isPrivateIP(ips[i])){
          result = ips[i];
          break;
        }
      }
    }
  }
  return result;
}

function finishOnePulseLoopCallback(){
  if (neighborTable.get().length < config.pulseMinResponse && 
      pulseScanCount < config.pulseMaxTest){
    // continue scan
    scanNeighborPulse(this);
  }else{
    neighborTable.save();
    // send a work to parent process
    // parent process will resend this work to worker process
    if (Object.keys(pulseResult).length > 0){
      var workerMsg = {
        type: require('./worker').type.sync,
        data: pulseResult
      };
      process.send(workerMsg);
    }
  }
}

var pulseTaskGroup;
function startPulse(){
  if (!(pulseTaskGroup instanceof util.AsyncTaskGroup)){
    pulseTaskGroup = new util.AsyncTaskGroup(finishOnePulseLoopCallback);
  }
  if (pulseTaskGroup.isBusy){
    return;
  }
  struct.getProductsSign(function(err, sign){
    if (err){
      log.error(err, 'Pulse failed: get product sign failed.');
      return;
    }
    selfProductSign = sign;
    pulseResult = {};
    upScanIP = downScanIP = getSelfIP();
    pulseScanCount = 0;
    var neighbors = neighborTable.get();
    if (neighbors.length > 0){
      for (var i=0;i<neighbors.length;i++){
        pulseTaskGroup.push(pulseDetect, neighbors[i]);
      }
      pulseTaskGroup.executeAll();
    }else{
      scanNeighborPulse(pulseTaskGroup);
    }
  });
}

exports.messageType = _messageType;
exports.neighborTable = neighborTable;
exports.startPulse = startPulse;
//{ DEV
exports.getSelfIP = getSelfIP;
exports.pulseResult = pulseResult;
exports.selfProductSign = selfProductSign;
exports.pulseDetect = pulseDetect;
//} DEV
