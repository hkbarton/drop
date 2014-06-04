// communication port of each port
var express = require('express'),
    path = require('path'),
    http = require('http'),
    fs = require('fs'),
    config = require('./config'),
    cst = require('./const'),
    endpoint = require('./endpoint');

// -------------------------------------------------------------------------
// init drop node
function resolveRunParams(){
  var args = process.argv;
  var result = {};
  if (args && args.length > 2){
    for (var i=2;i<args.length;i+=2){
      if (args[i] && args[i+1]){
        var key = args[i].replace(/^-+/g,'');
        result[key] = args[i+1];
      }
    }
  }
  return result;
}

var params = resolveRunParams();

var startType = params.t || params.type;
if (startType==='manager'){
  // TODO start as manager
}else if (startType==='node' || startType===undefined){
  // TODO start as node
  // 1. Regist to manager
  // 2. Download product description file from manager
  // 3. Check current node folder
  // init folder for store project data
}else{
  console.error('Unknown run type [' + startType + 
    '], support run as [manager] or run as [node]');
  process.exit(1);
}

var configPath = params.c || params.config;
if (configPath){
  configPath = path.normalize(configPath);
  if (configPath[0]!='/'){
    configPath = path.join(process.cwd(), configPath);
  }
  config.load(configPath);
}

// -------------------------------------------------------------------------
// define listen server
var server = express();
server.disable('x-powered-by');

// add endpoint
// --- drop node communication endpoint
// pulse, return all products information under this node
server.get(cst.pulseUrl, endpoint.pulse);

// start server
http.createServer(server).on('error', function(err){
  if (err.code=='EACCES'){
    console.error('[ERROR]Can\'t start node on port ' + config.port + 
      ', process exit.');
  }
  // TODO log
}).listen(config.port, function(){
  console.log('[SUCCESS]Drop node begin listen at ' + config.port + '...');
});

// -------------------------------------------------------------------------
// prepare to start child process
// config object will be passed in other child process (pulse & workder)
delete config.load;
var pulseProcess;
var workderProcess;

// -------------------------------------------------------------------------
// start pulse detecte process
function startPulseProcess(){
  pulseProcess = require('child_process').fork(
    path.join(__dirname, 'pulse.js'), [JSON.stringify(config)], {
    cwd:process.cwd()
  });
  pulseProcess.on('exit', pulseExitCallback);
  // handle message from pulse process
  pulseProcess.on('message', function(m){
    // re send message to worker
    workderProcess.send(m);
  });
}

function pulseExitCallback(code, signal){
  if (!code || code > 0){ // pulse process exit unexpect, try to restart it
    startPulseProcess();
  }
}

startPulseProcess();

// -------------------------------------------------------------------------
// start worker process
function startWorkerProcess(){
  workderProcess = require('child_process').fork(
    path.join(__dirname, 'worker.js'), [JSON.stringify(config)], {
    cwd:process.cwd()
  });
  workderProcess.on('exit', workerExitCallback);
}

function workerExitCallback(code, signal){
  if (!code || code > 0){ // pulse process exit unexpect, try to restart it
    startWorkerProcess();
  }
}

startWorkerProcess();
