var path = require('path');

var _log = require('bunyan').createLogger({
  name: 'drop',
  streams:[
    {
      type: 'rotating-file',
      path: path.join(__dirname, 'log/log'),
      period: '1w'
    },
    {
      level: 'debug',
      stream: process.stdout
    }
  ]
});

module.exports = _log;
