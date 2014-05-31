var fs = require('fs');

var _config = {
  port:80,
  pulseInterval:3000,
  pulseTimeout:5000,
  pulseMinResponse:4,
  load:_load 
};

function _load(path){
  if (path){
    try{
      var configStr = fs.readFileSync(path, {
        encoding: 'utf8'
      });
      var newConfig = JSON.parse(configStr);
      for(var key in newConfig){
        _config[key] = newConfig[key];
      }
    }catch(ex){
      if (ex.code==='ENOENT'){
        console.warn('[WARN]' + path + ' not found, use default configuration...');
        // TODO log
        return; 
      }
      console.log(ex);
      // TODO write log
    }
  }
}

module.exports = _config;
