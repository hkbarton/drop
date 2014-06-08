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
    fs.mkdirSync(path.join(prd1,now.getTime()+'_t_version1_' + now.getTime()));
    fs.mkdirSync(path.join(prd1,(now.getTime()-1000)+'_t_version2_' + now.getTime()));
    fs.mkdirSync(prd2);
    fs.mkdirSync(path.join(prd2,(now.getTime()-3000)+'_t_versiona_' + now.getTime()));
    fs.mkdirSync(path.join(prd2,(now.getTime()-5000)+'_t_versionb_' + now.getTime()));
  });

  after(function(){
    rimraf.sync(prd1);
    rimraf.sync(prd2);
  });

  it('should return the correct products structure and latest version number of each product', 
  function(done){
    struct.getProductsSign(function(err, data){
      assert.equal(data.prd__self>=0, true);
      assert.equal(data.prd1==now.getTime(), true);
      assert.equal(data.prd2==now.getTime()-3000, true);
      done();
    });
  });
});
