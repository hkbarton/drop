var path = require('path'),
    config = require('./config.js');

function init(){
  var logStream = [];
  var defaultLog = {
    type: 'file',
    level: config.logLevel,
    path: path.join(__dirname, config.log)
  };
  if (typeof config.logRotate==='string'){
    defaultLog.type = 'rotating-file';
    defaultLog.period = config.logRotate;
  }
  if (typeof config.logCount==='number' && config.logCount>0){
    defaultLog.count = config.logCount;
  }
  logStream.add(defaultLog);
  if (typeof config.stdoutLevel==='string'){
    var stdoutLog = {
      level:config.stdoutLevel,
      stream: process.stdout
    };
    logStream.add(stdoutLog);
  }
  return logStream;
}

module.exports = require('bunyan').createLogger({
  name: 'drop',
  streams: init()
});
