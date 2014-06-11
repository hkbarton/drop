var _message = {
  sync:0 
};

var workQueue = [];
var busyFlag = false;

process.on('message', function(m){
  if (m && m.msg){
    workQueue.push(m);
  }
});

function main(){
  if (busyFlag){
    return;
  }
  busyFlag = true;
  while(workQueue.length>0){
    var workMsg = workQueue.pop();
    switch(workMsg.msg){
      case _message.sync:
      // TODO download from siber node
      break;
    }
  }
  busyFlag = false;
}

main();
setInterval(main, 2000);
exports.message = _message;
