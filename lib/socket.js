// communication port of each port
var express = require('express'),
    path = require('path'),
    http = require('http'),
    config = require('./config');

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
  var nodeFolder = path.join(__dirname, '../'); // the up folder of bin folder
}else{
  console.error('Unknown run type [' + startType + 
    '], support run as [manager] or run as [node]');
  process.exit(1);
}

var configPath = params.c || params.config;
if (configPath){
  configPath = path.join(process.cwd(), configPath);
  config.load(configPath);
}

// start server
var server = express();
server.disable('x-powered-by');
http.createServer(server).on('error', function(err){
  if (err.code=='EACCES'){
    console.error('[ERROR]Can\'t start node on port ' + config.port + 
      ', process exit.');
  }
  // TODO log
}).listen(config.port, function(){
  console.log('[SUCCESS]Drop node begin listen at ' + config.port + '...');
});
