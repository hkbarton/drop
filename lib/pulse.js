var http = require('client-http'),
    util = require('./util'),
    cst = require('./const'),
    struct = require('./struct'),
    config = JSON.parse(process.argv[2]);

var _message = {
  updateManager:0
};

http.setTimeout(config.pulseTimeout);

var busyFlag = false;
var taskCnt = 0;
var finishTaskCnt = 0;
var selfIP = util.getPrimaryIP();
var upScanIP = selfIP;
var downScanIP = selfIP;

var pulseScanCount = 0;
var neighborTable = [];
var selfProductSign;
/*
  Pulse Compare Result Data Structure
  {
    productName: {
      selfstamp: selfVersionStamp,
      src: ip,
      srcstamp: sourceIPVersionStamp
    }
  }
*/
var pulseResult = {};

function asyncTask(fun, cb){
  taskCnt++;
  busyFlag = true;
  fun(function(){
    finishTaskCnt++;
    if (taskCnt==finishTaskCnt){
      taskCnt = 0;
      finishTaskCnt = 0;
      busyFlag = false;
      if (cb){
        cb();
      }
    }
  });
}

function pulseDetect(ip){
  asyncTask(function(taskcb){
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
      taskcb(); 
    }); 
  }, scanFinishCallback);
}

function scanFinishCallback(){
  if (neighborTable.length < config.pulseMinResponse && 
      pulseScanCount < config.pulseMaxTest){
    // continue scan
    scanNeighborPulse();
  }else{
    // TODO save neighbor information
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

function scanNeighborPulse(){
  upScanIP = util.increaseIP(upScanIP);
  downScanIP = util.decreaseIP(downScanIP);
  pulseDetect(upScanIP);
  pulseDetect(downScanIP);
  pulseScanCount += 2;
}

function startPulseDetect(){
  struct.getProductsSign(function(err, sign){
    if (err){
      // TODO log and report error
      return;
    }
    selfProductSign = sign;
    pulseResult = {};
    upScanIP = downScanIP = selfIP;
    pulseScanCount = 0;
    if (neighborTable.length>0){
      for(var index in neighborTable){
        pulseDetect(neighborTable[index]); 
      }
    }else{
      scanNeighborPulse();
    }
  });
}

process.on('message', function(m){
  if (m && m.msg){
    switch(m.msg){
      case _message.updateManager:
        cst.manager = m.data;
      break;
    }
  }
});

function main(){
  if (busyFlag){
    return;
  }
  // ---retrieve neighbor information from persistence file
  // TODO
  // ---report to manager
  // TODO
  // ---detect neighbor pulse, sync self
  startPulseDetect();
}

main();
setInterval(main, config.pulseInterval);
exports.message = _message;
