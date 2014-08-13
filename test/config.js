var assert = require('assert'),
    fs = require('fs'),
    config = require('../lib/config.js');

describe('config', function(){
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
  });

  it('should combine args setup and configuration file setup', function(){
  });
});
