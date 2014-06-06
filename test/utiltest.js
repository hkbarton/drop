var util = require('../lib/util');

console.log(util.getPrimaryIP());

console.log(util.isPrivateIP('10.0.0.1'));
console.log(util.isPrivateIP('11.0.0.1'));
console.log(util.isPrivateIP('172.17.0.1'));
console.log(util.isPrivateIP('172.32.0.1'));
console.log(util.isPrivateIP('192.168.0.1'));
console.log(util.isPrivateIP('192.169.0.1'));
