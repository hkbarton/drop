var path = require('path'), 
    worker = require('./worker'),
    config = require('./config');

var _childProcess = {
  pulseProcess: null
};

function startPulseProcess(){
  _childProcess.pulseProcess = require('child_process').fork(
    path.join(__dirname, 'pulse.js'), process.argv, {
    cwd:process.cwd()
  });
  _childProcess.pulseProcess.on('exit', pulseExitCallback);
  // handle message from pulse process to main process
  _childProcess.pulseProcess.on('message', function(m){
    // this code run in main process
    worker.doWorkByMsg(m);
  });
}

function pulseExitCallback(code, signal){
  if (!code || code > 0){ // pulse process exit unexpect, try to restart it
    startPulseProcess();
  }
}

exports.pulseProcess = _childProcess.pulseProcess;
exports.startPulseProcess = startPulseProcess;
