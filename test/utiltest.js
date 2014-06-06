var assert = require('assert'),
    util = require('../lib/util');

describe('util', function(){
  it('should detect if a IP is or is not a private IP', function(){
    assert.equal(util.isPrivateIP('10.0.0.1'), true);
    assert.equal(util.isPrivateIP('11.0.0.1'), false);
    assert.equal(util.isPrivateIP('172.17.0.1'), true);
    assert.equal(util.isPrivateIP('172.32.0.1'), false);
    assert.equal(util.isPrivateIP('192.168.0.1'), true);
    assert.equal(util.isPrivateIP('192.169.0.1'), false);
  });

  it('should get primary internal IP', function(){
    var ip = util.getPrimaryIP();
    assert.equal((ip===null || ip.indexOf('192')===0 || 
      ip.indexOf('172')===0 || 
      ip.indexOf('10')===0), true);
  });
});
