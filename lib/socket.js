// communication port of each port
var express = require('express'),
    path = require('path'),
    http = require('http'),
    fs = require('fs'),
    subproc = require('./subproc'),
    config = require('./config'),
    cst = require('./const'),
    endpoint = require('./endpoint');

// ---resolve command line parameter
var params = (function(){
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
})();

// ---load config
var configPath = params.c || params.config;
if (configPath){
  configPath = path.normalize(configPath);
  if (configPath[0]!='/'){
    configPath = path.join(process.cwd(), configPath);
  }
  config.load(configPath);
}

// ---start drop node based on input start type
var server = express();
server.disable('x-powered-by');
var startType = params.t || params.type;
if (startType==='manager'){
  // TODO start as manager
}else if (startType==='node' || startType===undefined){
  // pulse, return all products information under this node
  server.get(cst.pulseUrl, endpoint.pulse);
  // pulse with manager node information, same as pulse
  // but pass with manager node information
  server.get(cst.pulseUrlWithManUpdate, endpoint.pulse);
  server.get(cst.syncUrl, endpoint.sync);
  subproc.startPulseProcess();
}else{
  console.error('Unknown run type [' + startType + 
    '], support run as [manager] or run as [node]');
  process.exit(1);
}

http.createServer(server).on('error', function(err){
  if (err.code=='EACCES'){
    console.error('[ERROR]Can\'t start node on port ' + config.port + 
      ', process exit.');
  }
  // TODO log
}).listen(config.port, function(){
  console.log('[SUCCESS]Drop node begin listen at ' + config.port + '...');
});
