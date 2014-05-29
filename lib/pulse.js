var http = require('client-http'),
    util = require('./util'),
    config = JSON.parse(process.argv[2]);

var busyFlag = false;

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
      // TODO
      upip = util.increaseIP(upip);
      downip = util.decreaseIP(downip);
    }
  }else{
    // TODO report status
  } 
}

main();
setInterval(main, config.pulseInterval);
