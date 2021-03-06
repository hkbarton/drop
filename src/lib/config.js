var fs = require('fs'),
    pathUtil = require('path'),
    util = require('./util.js');

// default config
var _config = {
  port:3767,
  log:'./log/drop.log',
  logLevel:'info',
  logRotate:null,
  logCount:null,
  stdoutLevel:null,
  fileDir:'.file',
  tempDir:'.temp',
  dataDir:'.data',
  neighbor:[],
  priNeighborIprange:null,
  pulseInterval:60000,
  pulseTimeout:5000,
  pulseMinResponse:4,
  pulseMaxTest:10,
  // load function
  loadByArgs: loadByArgs,
  loadByConfigFile: loadByConfigFile
};

var _range_level = ['trace','debug','info','warn','error','fatal'];
var _range_rotate = ['1d','1w','1m','1y'];
var _regex_path = /^[\w\d\.\\\/\_\-\&\:]+$/;
var _regex_ip = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
var _regex_iprange = /^(\d{1,3}|\*)\.(\d{1,3}|\*)\.(\d{1,3}|\*)\.(\d{1,3}|\*)$/;

var _configSchema = {
  port:               {type:'number',range:[0]},
  log:                {type:'string',regex:_regex_path},
  logLevel:           {type:'string',range:_range_level},
  logRotate:          {type:'string',range:_range_rotate},
  logCount:           {type:'number',range:[0]},
  stdoutLevel:        {type:'string',range:_range_level},
  fileDir:            {type:'string',regex:_regex_path},
  tempDir:            {type:'string',regex:_regex_path},
  dataDir:            {type:'string',regex:_regex_path},
  neighbor:           {type:Array,regex:_regex_ip},
  priNeighborIprange: {type:'string',regex:_regex_iprange},
  pulseInterval:      {type:'number',range:[0]},
  pulseTimeout:       {type:'number',range:[0]},
  pulseMinResponse:   {type:'number',range:[0]},
  pulseMaxTest:       {type:'number',range:[0]},
};

function _validate(key, value){
  var type = _configSchema[key].type;
  var range = _configSchema[key].range;
  var regex = _configSchema[key].regex;
  if (type=='string'){
    if (range instanceof Array && range.length>0){
      if (range.indexOf(value)>-1){
        return value;
      }
    }else if(regex instanceof Object){
      if (value.match(regex)){
        return value;
      }
    }else{
      return value;
    }
  }else if (type=='number'){
    value = parseInt(value);
    if (!isNaN(value)){
      if (range instanceof Array && range.length>0){
        if (value > range[0] && (range.length < 2 || value < range[1])){
          return value;
        }
      }else{
        return value;
      }
    }
  }else if(type===Array){
    try{
      value = JSON.parse(value.replace(/\'/g,'"'));
    }catch(e){
      return null;
    }
    if (value instanceof Array){
      if (regex instanceof Object){
        var result = [];
        var item;
        while(value.length>0){
          item = value.pop();
          if (typeof item=='string' && item.match(regex)){
            result.push(item);
          }
        }
        return result;
      }else{
        return value;
      }
    }
  }
  return null;
}

function _set(key, value){
  var oriKey = key;
  if (key.indexOf('-')>-1){
    var keyParts = key.split(/-/g);
    key = keyParts[0];
    for (var i=1;i<keyParts.length;i++){
      if (keyParts[i].length>0){
        key += keyParts[i][0].toUpperCase() + 
          keyParts[i].substr(1, keyParts[i].length-1);
      }
    }
  }
  if (this[key]!==undefined){
    value = _validate(key, value);
    if (value!==null){
      this[key] = value;
    }else{
      console.warn('configure key ' + oriKey + ' has a invalidate value');
    }
  }else{
    console.warn(oriKey + ' is a invalidate configure key.');
  }
}

function loadByConfigFile(path){
  if (!util.isAbsolutePath(path)){
    path = pathUtil.join(process.cwd(), path);
  }
  try{
    var content = fs.readFileSync(path, {encoding:'utf8'});
    var reg = /\n([^#\n]+)#*[^\n]*/g;
    var match, pairStr=[];
    while((match=reg.exec(content))!==null){
      pairStr.push(match[1].trim());
    }
    var pair;
    for(var i=0;i<pairStr.length;i++){
      pair = pairStr[i].split(/\s+/); 
      _set.call(this, pair[0], pair[1]);
    }
  }catch(err){
    console.warn('Can\'t read configuration file coz: ' + String(err));
  }
}

function loadByArgs(args){
  if (args instanceof Array && args.length>0){
    var keyMatch, valueMatch;
    var key, value;
    for (var i=0;i<args.length;i++){
      key = null;
      value = null;
      keyMatch = args[i].match(/^-+([\w\d-]+)/);
      if (keyMatch){
        key = keyMatch[1];
        valueMatch = args[i+1].match(/^[^-\s]+$/);
        if (valueMatch){
          value = valueMatch[0];
          i++;
        }
        if (key=='config' && typeof value=='string'){
          loadByConfigFile.call(this, value);
        }else{
          _set.call(this, key, value);
        }
      }
    }
  }
}

// init load by command input
(function(){
  var args = process.argv.slice();
  // first 2 args are node and execute file path by node, we don't need this
  args.shift();
  args.shift();
  loadByArgs.call(_config, args);
})();

module.exports = _config;
