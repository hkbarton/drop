var http = require('client-http'),
    util = require('./util'),
    cst = require('./const'),
    config = JSON.parse(process.argv[2]);

http.setTimeout(config.pulseTimeout);

var busyFlag = false;
var taskCnt = 0;
var finishTaskCnt = 0;
var selfIP = util.getPrimaryIP();
var upScanIP = selfIP;
var downScanIP = selfIP;

var neighborTable = [];

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
    console.log('try detect ' + ip);
    http.get('http://' + ip + cst.pulseUrl, function(data, err){
      if (err){
        neighborTable.splice(neighborTable.indexOf(ip),1); // remove broke neighbor
      }else{
        // save this neighbor
        if (neighborTable.indexOf(ip)<0){
          neighborTable.push(ip);      
        }
      }
      taskcb(); 
    }); 
  }, scanFinishCallback);
}

function scanFinishCallback(){
  if (neighborTable.length < config.pulseMinResponse){
    // continue scan
    scanNeighborPulse();
  }else{
    // reset scan
    upScanIP = downScanIP = selfIP;
    // TODO start sync file
  }
}

function scanNeighborPulse(){
  upScanIP = util.increaseIP(upScanIP);
  downScanIP = util.decreaseIP(downScanIP);
  pulseDetect(upScanIP);
  pulseDetect(downScanIP);
}

function startPulseDetect(){
  if (neighborTable.length>0){
    for(var index in neighborTable){
      pulseDetect(neighborTable[index]); 
    }
  }else{
    scanNeighborPulse();
  }
}

function main(){
  if (busyFlag){
    return;
  }
  // ---report to manager
  // TODO
  // ---detect neighbor pulse, sync self
  startPulseDetect();
}

main();
setInterval(main, config.pulseInterval);
