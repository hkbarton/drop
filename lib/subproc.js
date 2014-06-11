var path = require('path'), 
    config = require('./config');

var _childProcess = {
  pulseProcess: null,
  workerProcess: null
};

function startPulseProcess(){
  _childProcess.pulseProcess = require('child_process').fork(
    path.join(__dirname, 'pulse.js'), [JSON.stringify(config)], {
    cwd:process.cwd()
  });
  _childProcess.pulseProcess.on('exit', pulseExitCallback);
  // handle message from pulse process
  _childProcess.pulseProcess.on('message', function(m){
    // re send message to worker
    _childProcess.workderProcess.send(m);
  });
}

function pulseExitCallback(code, signal){
  if (!code || code > 0){ // pulse process exit unexpect, try to restart it
    startPulseProcess();
  }
}

function startWorkerProcess(){
  _childProcess.workderProcess = require('child_process').fork(
    path.join(__dirname, 'worker.js'), [JSON.stringify(config)], {
    cwd:process.cwd()
  });
  _childProcess.workderProcess.on('exit', workerExitCallback);
}

function workerExitCallback(code, signal){
  if (!code || code > 0){ // pulse process exit unexpect, try to restart it
    startWorkerProcess();
  }
}

exports.childProcess = _childProcess;
exports.startPulseProcess = startPulseProcess;
exports.startWorkerProcess = startWorkerProcess;
