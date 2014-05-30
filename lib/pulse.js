var http = require('client-http'),
    util = require('./util'),
    cst = require('./const'),
    config = JSON.parse(process.argv[2]);

var neighborTable = [];
var busyFlag = false;

function pulseHandle(data, err){
  if (err){
    console.log(err);
    return;
  }
}

function main(){
  if (busyFlag){
    return;
  }
  busyFlag = true;
  // ---report to manager
  // TODO
  // ---detect neighbor pulse, sync self
  var selfIP = util.getPrimaryIP();
  if (selfIP){
    selfIP = '192.168.1.253';
    var upip = util.increaseIP(selfIP);
    var downip = util.decreaseIP(selfIP);
    for (var i=0;i<config.pulseRange;i++){
      http.get('http://' + upip + cst.pulseUrl, pulseHandle);
      http.get('http://' + downip + cst.pulseUrl, pulseHandle);
      upip = util.increaseIP(upip);
      downip = util.decreaseIP(downip);
    }
  }else{
    // TODO report status
  } 
}

main();
setInterval(main, config.pulseInterval);
