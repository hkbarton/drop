var http = require('http'),
    subproc = require('./subproc.js'),
    config = require('./config.js'),
    cst = require('./const.js'),
    log = require('./log.js'),
    server = require('./socket.js').server;

http.createServer(server).on('error', function(err){
  log.error(err, 'Drop node service socket fail');
  if (err.code==cst.errCode.accessDeny || 
    err.code==cst.errCode.addressInUse){
    console.error('[FAIL] Can\'t start drop node, please check log file.');
    console.log('press any key to exit...');
    process.stdin.resume();
    process.stdin.on('data', function(){
      process.exit(1);
    });
  }
}).listen(config.port, function(){
  log.info('Drop node start, service port is ' + config.port);
  console.log('[SUCCESS] Drop node start.');
});

// start pulse sub process
subproc.startPulseProcess();
