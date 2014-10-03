var request = require('request'),
    fs = require('fs');

var rq = request('https://www.google.com/images/srpr111/logo11w.png');
rq.on('response', function(resp){
  if (resp.statusCode!=200){
    console.log(resp.body);
    return;
  }
  rq.pipe(fs.createWriteStream('test.png'));
});
