var assert = require('assert'),
    fs = require('fs'),
    pulse = require('../src/lib/pulselib.js'),
    struct = require('../src/lib/struct.js'),
    util = require('../src/lib/util.js'),
    config = require('../src/lib/config.js'),
    testServer = require('../src/lib/socket.js').server,
    prepare = require('./prepare.js');

describe('pulselib', function(){
  var tempWebServer;

  before(function(done){
    prepare.testProduct.create();
    tempWebServer = testServer.listen(config.port, function(){
      done();
    });
  });

  after(function(){
    tempWebServer.close();
    prepare.testProduct.destory();
  });

  it('should get right IP used for neighbor scan', function(){
    var ips = util.getInternalIPv4s();
    if (ips.length > 0){
      // test without prority IP range configure
      assert(pulse.getSelfIP()==ips[0]);
      // test with priotiy IP range configure
      if (ips.length > 1){
        var oriIPRangeValue = config.priNeighborIprange;
        for (var i=1;i<ips.length;i++){
          var ipGroup = ips[i].split('.');
          var ipRange = ipGroup[0] + '.' + ipGroup[1] + '.' + 
            ipGroup[2] + '.*';
          config.priNeighborIprange = ipRange;
          var selfIPGroup = pulse.getSelfIP().split('.');
          assert(selfIPGroup[0]==ipGroup[0]);
          assert(selfIPGroup[1]==ipGroup[1]);
          assert(selfIPGroup[2]==ipGroup[2]);
        }
        config.priNeighborIprange = oriIPRangeValue;
      }
    }
  });

  it('should manage scanned neighbors as well as configured neighbors well',
  function(done){
    fs.writeFileSync(struct.neighborTableFile, 
      '["192.168.0.1","192.168.0.2"]', {encoding:'utf8'});
    var oriConfigNeighbor = config.neighbor;
    config.loadByArgs(['--neighbor','["192.168.0.2","192.168.0.3"]']);
    pulse.neighborTable.restore();
    assert(pulse.neighborTable.get().length==3);
    pulse.neighborTable.remove('192.168.0.3'); // will not remove
    assert(pulse.neighborTable.get().length==3);
    pulse.neighborTable.remove('192.168.0.1'); // will remove
    assert(pulse.neighborTable.get().length==2);
    assert(pulse.neighborTable.get().indexOf('192.168.0.1')==-1);
    pulse.neighborTable.add('192.168.0.5');
    assert(pulse.neighborTable.get().length==3);
    assert(config.neighbor.length==2);
    pulse.neighborTable.save(function(){
      var savedNeighborStr = fs.readFileSync(struct.neighborTableFile,{
        encoding:'utf8'});
      var savedNeighbor = JSON.parse(savedNeighborStr);
      assert(savedNeighbor.length==2);
      assert(savedNeighbor.indexOf('192.168.0.2')>-1);
      assert(savedNeighbor.indexOf('192.168.0.5')>-1);
      config.neighbor = oriConfigNeighbor;
      fs.unlink(struct.neighborTableFile);
      done();
    });
  });

  it('should detect neighbor pulse and get the right pulse result',
  function(done){
    var fakeProduct = prepare.testProduct.products[0];
    pulse.selfProductSign[fakeProduct.name] = fakeProduct.versions.version2;
    pulse.pulseDetect('localhost', function(result){
      // should save the success pulse dest ip
      assert(pulse.neighborTable.get().indexOf('localhost') > -1);
      // should successful generate pulse result
      assert(result[fakeProduct.name] instanceof Object);
      assert(result[fakeProduct.name].selfstamp == 
        fakeProduct.versions.version2);
      assert(result[fakeProduct.name].srcstamp == fakeProduct.latestVersion);
      assert(result[fakeProduct.name].src == 'localhost');
      done();
    });
  });
});
