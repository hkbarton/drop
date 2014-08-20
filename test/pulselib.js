var assert = require('assert'),
    pulse = require('../src/lib/pulselib.js'),
    util = require('../src/lib/util.js'),
    config = require('../src/lib/config.js');

describe('pulselib', function(){
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
});
