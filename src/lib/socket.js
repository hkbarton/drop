var express = require('express'),
    cst = require('./const'),
    endpoint = require('./endpoint');

// ---start drop node based on input start type
var server = express();
server.disable('x-powered-by');

// pulse, return all products information under this node
server.get(cst.pulseUrl, endpoint.pulse);
// pulse with manager node information, same as pulse
// but pass with manager node information
server.get(cst.pulseUrlWithManUpdate, endpoint.pulse);
server.get(cst.syncUrl, endpoint.sync);

// can be used in unit test
exports.server = server;
