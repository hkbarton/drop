var fs = require('fs');

var _config = {
  port:80,
  load:_load 
};

function _load(path){
  if (path){
    try{
      var configStr = fs.readFileSync(path, {
        encoding: 'utf8'
      });
      _config = JSON.parse(configStr);
    }catch(ex){
      console.log(ex);
      // TODO write log
    }
  }
}

module.exports = _config;
