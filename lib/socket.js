// communication port of each port
var express = require('express');

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
}else{
  console.error('Unknown run type [' + startType + 
    '], support run as [manager] or run as [node]');
  process.exit(1);
}

//var server = express();
