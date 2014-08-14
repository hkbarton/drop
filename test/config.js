var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    config = require('../lib/config.js');

describe('config', function(){
  var configPath = path.join(__dirname, 'BDDTest.conf');

  before(function(){
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
  });

  after(function(){
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
    config.loadByArgs(args);
    assert(config.port===1234);
    assert(config.logRotate==='1m');
    assert(config.pulseInterval===3000); // default
    assert(config.logLevel==='info'); // default
    assert(config.pulseTimeout===5000); // default
    assert(config.hello===undefined);
  });

  it('should setup configure by configuration file', function(){
    config.loadByConfigFile(configPath);
    assert(config.port===4567);
    assert(config.pulseMaxTest===100);
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
