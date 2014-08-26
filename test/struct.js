var assert = require('assert'),
    rimraf = require('rimraf'),
    path = require('path'),
    fs = require('fs'),
    struct = require('../src/lib/struct.js'),
    prepare = require('./prepare.js');

describe('struct', function(){
  before(function(){
    prepare.testProducts.create();
  });

  after(function(){
    //prepare.testProducts.destory();
  });

  it('should return the correct products structure and latest version number of each product', 
  function(done){
    struct.getProductsSign(function(err, data){
      if (err){
        throw err;
      }
      assert.equal(data.__self>=0, true);
      for(var i=0;i<prepare.testProducts.length;i++){
        var product = prepare.testProducts[i];
        assert(data[product.name]==product.latestVersion()); 
      }
      done();
    });
  });

  it('should merge products sign from source server to current server', 
  function(done){
    struct.getProductsSign(function(err, data){
      if (err){
         throw err;
      }
      var srcProductSign = {};
      srcProductSign[prepare.testProducts[0].name] = 
        prepare.testProducts[0].latestVersion() + 2000;
      srcProductSign[prepare.testProducts[1].name] = 
        prepare.testProducts[1].latestVersion() - 1000;
      var mergeResult = struct.mergeProductSign(data, srcProductSign);
      assert.equal(mergeResult.__self===undefined, true);
      assert(mergeResult[prepare.testProducts[1].name]===undefined);
      assert(mergeResult[prepare.testProducts[0].name].selfstamp===
        prepare.testProducts[0].latestVersion());
      assert(mergeResult[prepare.testProducts[0].name].srcstamp===
        prepare.testProducts[0].latestVersion() + 2000);
      done();
    });
  });

  it('shoud return correct product versions range', function(){
    var prd = prepare.testProducts[0];
    var range = struct.getProductVersionsRange(
      prd.name, prd.versions.version2, prd.versions.version4);
    assert(range[prd.name + '_' + prd.versions.version3].path
      .indexOf('version3') > -1);
    assert(range[prd.name + '_' + prd.versions.version4].path
      .indexOf('version4') > -1);
  });
});
