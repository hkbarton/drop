var pathlib = require('path'),
    fs = require('fs'),
    cst = require('./const.js'),
    config = require('./config.js'),
    util = require('./util.js');

function init(){
  // create log path if it not exist
  var logPath = config.log;
  if (!util.isAbsolutePath(logPath)){
    logPath = pathlib.join(process.cwd(), logPath);
  }
  var logDir = pathlib.dirname(logPath);
  try{
    fs.mkdirSync(logDir);
  }catch(e){
    if (e.code!=cst.errCode.fileAlreadyExist){
      console.error('Can\'t create directory for log: ' + String(e));
      logPath = null;
    }
  }
  // init log stream
  var logStream = [];
  if (typeof logPath=='string'){
    var defaultLog = {
      type: 'file',
      level: config.logLevel,
      path: logPath
    };
    if (typeof config.logRotate==='string'){
      defaultLog.type = 'rotating-file';
      defaultLog.period = config.logRotate;
    }
    if (typeof config.logCount==='number' && config.logCount>0){
      defaultLog.count = config.logCount;
    }
    logStream.push(defaultLog);
  }
  if (typeof config.stdoutLevel==='string'){
    var stdoutLog = {
      level:config.stdoutLevel,
      stream: process.stdout
    };
    logStream.push(stdoutLog);
  }
  return logStream;
}

module.exports = require('bunyan').createLogger({
  name: 'drop',
  streams: init()
});
