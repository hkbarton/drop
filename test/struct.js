var struct = require('../lib/struct'),
    assert = require('assert'),
    rimraf = require('rimraf'),
    path = require('path'),
    fs = require('fs');

describe('struct', function(){
  var nodeDataPath = path.join(__dirname, '../.data');
  var prd1 = path.join(nodeDataPath, 'prd1');
  var prd2 = path.join(nodeDataPath, 'prd2');
  var now = new Date();

  before(function(){
    fs.mkdirSync(prd1);
    fs.mkdirSync(path.join(prd1,now.getTime()+'_version4_' + now.getTime()));
    fs.mkdirSync(path.join(prd1,(now.getTime()-1000)+'_version3_' + now.getTime()));
    fs.mkdirSync(path.join(prd1,(now.getTime()-2000)+'_version2_' + now.getTime()));
    fs.mkdirSync(path.join(prd1,(now.getTime()-3000)+'_version1_' + now.getTime()));
    fs.mkdirSync(prd2);
    fs.mkdirSync(path.join(prd2,(now.getTime()-3000)+'_versiona_' + now.getTime()));
    fs.mkdirSync(path.join(prd2,(now.getTime()-5000)+'_versionb_' + now.getTime()));
  });

  after(function(){
    rimraf.sync(prd1);
    rimraf.sync(prd2);
  });

  it('should return the correct products structure and latest version number of each product', 
  function(done){
    struct.getProductsSign(function(err, data){
      if (err){
        throw err;
      }
      assert.equal(data.__self>=0, true);
      assert.equal(data.prd1==now.getTime(), true);
      assert.equal(data.prd2==now.getTime()-3000, true);
      done();
    });
  });

  it('should merge products sign from source server to current server', 
  function(done){
    struct.getProductsSign(function(err, data){
      if (err){
         throw err;
      }
      var srcProductSign = {
        prd1:now.getTime()+2000,
        prd2:now.getTime()-4000,
      };
      var mergeResult = struct.mergeProductSign(data, srcProductSign);
      assert.equal(mergeResult.prd2===undefined, true);
      assert.equal(mergeResult.__self===undefined, true);
      assert.equal(mergeResult.prd1.selfstamp===now.getTime(), true);
      assert.equal(mergeResult.prd1.srcstamp===now.getTime()+2000, true);
      done();
    });
  });

  it('shoud return correct product versions range', function(){
    var range = struct
      .getProductVersionsRange('prd1', now.getTime()-2000, now.getTime());
    assert.equal(range['prd1_'+(now.getTime()-1000)].path
      .indexOf('version3') > -1, true);
    assert.equal(range['prd1_'+now.getTime()].path
      .indexOf('version4') > -1, true);
  });
});
