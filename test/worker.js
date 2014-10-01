var assert = require('assert'),
    fs = require('fs'),
    prepare = require('./prepare.js'),
    work = require('../src/lib/worker.js');

describe('worker', function(){
  before(function(){
    // create fake product with fake version files
    prepare.testProduct.create(true); 
  });

  after(function(){
    prepare.testProduct.destory();
  });

  it('should pack product version files into tempDir and retrun the path',
  function(done){
    var fakeProduct = prepare.testProduct.products[0];
    var retrieveVersionInfo = {
      prd: fakeProduct.name,
      from: fakeProduct.versions.version1,
      to: fakeProduct.versions.version3
    };
    work.getPackedVersionFilePaths(retrieveVersionInfo, function(err, paths){
      if (err) console.log(err);
      assert(paths.length==2);
      assert(paths[0].indexOf(fakeProduct.versions.version2) > -1);
      assert(paths[1].indexOf(fakeProduct.versions.version3) > -1);
      for (var i=0;i<paths.length;i++){
        assert(fs.existsSync(paths[i]));
        fs.unlinkSync(paths[i]);
      }
      done();
    });
  });
});
