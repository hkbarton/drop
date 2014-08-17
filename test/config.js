var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    config = require('../lib/config.js');

describe('config', function(){
  var configPath = path.join(__dirname, 'BDDTest.conf');
  var oriWarnStdout = console.warn;

  before(function(){
    // igonre stdout from config.js in test module
    console.warn = function(){};
    // write test conf file
    fs.writeFileSync(configPath, 
      '# this is a comment\n', {encoding:'utf8'});
    fs.appendFileSync(configPath, 
      'port 4567\n', {encoding:'utf8'});
    fs.appendFileSync(configPath, 
      '\n', {encoding:'utf8'});
    fs.appendFileSync(configPath, 
      '# this is a comment with a empty comment line\n#\n', {encoding:'utf8'});
    fs.appendFileSync(configPath, 
      'pulse-max-test 100 # some comment after value\n', {encoding:'utf8'});
    fs.appendFileSync(configPath, '\n', {encoding:'utf8'});
    fs.appendFileSync(configPath, 
      'neighbor ["172.16.0.1","172.16.0.2","abc.12.d.c"]\n',{encoding:'utf8'});
  });

  after(function(){
    // restore normal console.warn
    console.warn = oriWarnStdout;
    // delete test conf file
    fs.unlink(configPath);
  });

  it('should setup configure by shell args', function(){
    var args = [];
    // number configure, should be success
    args.push('--port'); args.push('1234');
    // string configure, should be success
    args.push('--log-rotate'); args.push('1m');
    // number configure, give string here, should be failed and keep default
    args.push('--pulse-interval'); args.push('abc');
    // give invalidate value, should be fail and keep default
    args.push('--log-level'); args.push('hello');
    // give no value, should be fail and keep default
    args.push('--pulse-timeout');
    // give invalidate key, should be ignore this key
    args.push('--hello'); args.push('world');
    // give invalidate value which not match in regex rule, keep default
    args.push('--file-dir'); args.push('$%ds');
    // validate value which match the regex check 
    args.push('--temp-dir'); args.push('./temp/temp1');
    // only validate item in array setting get setted
    args.push('--neighbor');
    args.push("['192.168.0.1','1234.4.5.6','10.0.0.1']");
    config.loadByArgs(args);
    assert(config.port===1234);
    assert(config.logRotate==='1m');
    assert(config.pulseInterval===60000); // default
    assert(config.logLevel==='info'); // default
    assert(config.pulseTimeout===5000); // default
    assert(config.hello===undefined);
    assert(config.fileDir==='.file');
    assert(config.tempDir==='./temp/temp1');
    assert(config.neighbor.length===2);
    assert(config.neighbor.indexOf('192.168.0.1')>-1);
    assert(config.neighbor.indexOf('10.0.0.1')>-1);
  });

  it('should setup configure by configuration file', function(){
    config.loadByConfigFile(configPath);
    assert(config.port===4567);
    assert(config.pulseMaxTest===100);
    assert(config.neighbor.length===2);
    assert(config.neighbor.indexOf('172.16.0.1')>-1);
    assert(config.neighbor.indexOf('172.16.0.2')>-1);
  });

  it('should combine args setup and configuration file setup', function(){
    fs.appendFileSync(configPath, 
      'pulse-min-response 200\n', {encoding:'utf8'});
    var args = [];
    args.push('--config'); args.push(configPath);
    // override setting in configuration file
    args.push('--port'); args.push('9999'); 
    config.loadByArgs(args);
    assert(config.port===9999);
    assert(config.pulseMinResponse===200);
    assert(config.pulseMaxTest===100);
  });
});
