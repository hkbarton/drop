var assert = require('assert'),
    request = require('request'),
    tar = require('tar-stream'),
    pathlib = require('path'),
    fs = require('fs'),
    async = require('async'),
    prepare = require('./prepare.js'),
    struct = require('../src/lib/struct.js'),
    config = require('../src/lib/config.js'),
    testServer = require('../src/lib/socket.js').server;

describe('endpoint', function(){
  var tempWebServer;

  before(function(done){
    prepare.testProduct.create(true);
    tempWebServer = testServer.listen(config.port, function(){
      done();
    });
  });

  after(function(){
    tempWebServer.close();
    prepare.testProduct.destory();
  });

  it('should sync files as need from endpoint', function(done){
    var fakeProduct = prepare.testProduct.products[0];
    var prdName = fakeProduct.name;
    var fromVersion = fakeProduct.versions.version2;
    // start version is the version should be first sync
    var startVersion = fakeProduct.versions.version3;
    var toVersion = fakeProduct.versions.version4;
    var originSeveFilePath = [
      pathlib.join(struct.tempDir, prdName + '_' + startVersion + '.tar.gz'), 
      pathlib.join(struct.tempDir, prdName + '_' + toVersion + '.tar.gz'), 
    ];
    var syncedFilePath = [
      pathlib.join(__dirname, prdName + '_' + startVersion + '.tar.gz'),
      pathlib.join(__dirname, prdName + '_' + toVersion + '.tar.gz'),
    ];
    var syncUrl = 'http://localhost:' + config.port;
    syncUrl += '/sync/' + prdName + '/' + 
      fromVersion + '/' + toVersion;
    var unpackStream = tar.extract();
    var syncedFileWriterParallel = []; 
    unpackStream.on('entry', function(header, stream, callback){
      var output = fs.createWriteStream(pathlib.join(__dirname, 
        pathlib.basename(header.name)));
      syncedFileWriterParallel.push(function(cb){
        output.on('finish', cb);
      });
      stream.pipe(output);
      stream.on('error', function(err){
        throw err;
      });
      stream.on('end', function(){
        callback();
      });
    });
    unpackStream.on('finish', function(){
      async.parallel(syncedFileWriterParallel, function(){
        for (var i=0;i<originSeveFilePath.length;i++){
          assert(fs.existsSync(originSeveFilePath[i]));
          assert(fs.existsSync(syncedFilePath[i]));
          assert(fs.statSync(originSeveFilePath[i]).size==
            fs.statSync(syncedFilePath[i]).size);
          fs.unlinkSync(originSeveFilePath[i]);
          fs.unlinkSync(syncedFilePath[i]);
        }
        done();
      });
    });
    var rq = request(syncUrl);
    rq.on('response', function(resp){
      if (resp.statusCode!=200){
        throw 'Server return ' + resp.statusCode;
      }
      resp.request.pipe(unpackStream);
    });
  });
});
