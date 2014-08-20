var http = require('client-http'),
    util = require('./util'),
    cst = require('./const'),
    struct = require('./struct'),
    config = require('./config.js');

var _messageType = {
  updateManager:0
};

var upScanIP, downScanIP;
var pulseScanCount = 0;
var neighborTable = [];
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

http.setTimeout(config.pulseTimeout);

function pulseDetect(ip, cb){
  http.get('http://' + ip + ':' + config.port + cst.pulseUrl, 
  function(data, err){
    if (err){
      neighborTable.splice(neighborTable.indexOf(ip),1); // remove broke neighbor
    }else{
      try{
        data = JSON.parse(data);
      }catch(e){
        data = {};
      }
      // save or remove this neighbor
      if (!data.sign || data.sign!=cst.dropSignature){ // not drop node return
        neighborTable.splice(neighborTable.indexOf(ip),1); // remove broke neighbor
        return;
      }
      if (neighborTable.indexOf(ip)<0){
        neighborTable.push(ip);      
      }
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

function saveNeighbor(){
  fs.writeFile(struct.neighborTableFile, JSON.stringify(neighborTable),
    {encoding:'utf8'});
}

function restoreNeighbor(){
  try{
    var resultStr = fs.readFileSync(struct.neighborTable, {encoding:'utf8'});
    neighborTable = JSON.parse(resultStr);
  }catch(e){
    log.error(e, 'Failed to restore neighbor info from persistence.');
    neighborTable = [];
  }
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
        for (var j=0;i<4;j++){
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
  if (neighborTable.length < config.pulseMinResponse && 
      pulseScanCount < config.pulseMaxTest){
    // continue scan
    scanNeighborPulse(this);
  }else{
    saveNeighbor();
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
    if (neighborTable.length>0){
      for(var index in neighborTable){
        pulseTaskGroup.push(pulseDetect, neighborTable[index]);
      }
      pulseTaskGroup.executeAll();
    }else{
      scanNeighborPulse(pulseTaskGroup);
    }
  });
}

exports.messageType = _messageType;
exports.saveNeighbor = saveNeighbor;
exports.restoreNeighbor = restoreNeighbor;
exports.getSelfIP = getSelfIP;
exports.startPulse = startPulse;
