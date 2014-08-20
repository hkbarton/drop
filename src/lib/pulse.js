var pulse = require('./pulselib.js'),
    config = require('./config.js');

process.on('message', function(m){
  if (m && m.msg){
    switch(m.msg){
      case pulse.messageType.updateManager:
        cst.manager = m.data;
      break;
    }
  }
});

// retrieve neighbor information from persistence file
pulse.restoreNeighbor();
// execute
pulse.startPulse();
setInterval(pulse.startPulse, config.pulseInterval);
