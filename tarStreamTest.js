var tar = require('tar-stream'),
    async = require('async'),
    fs = require('fs'),
    fstream = require('fstream'),
    path = require('path'),
    async = require('async');

var pack = tar.pack();

var file1Path = path.resolve('Gruntfile.js');
var file1Size = fs.statSync(path.resolve(file1Path)).size;
var file1Reader = fstream.Reader(file1Path);

var file2Path = path.resolve('README.md');
var file2Size = fs.statSync(path.resolve(file2Path)).size;
var file2Reader = fstream.Reader(file2Path);

var outputFile = fs.createWriteStream(path.resolve('test.tar'));

var entry1 = pack.entry({name:'Gruntfile.js',size:file1Size});
//var entry2 = pack.entry({name:'README.md',size:file2Size});

file1Reader.on('ready', function(){
  file1Reader.pipe(entry1);
});

//file2Reader.on('ready', function(){
  //file2Reader.pipe(entry2);
//});

async.parallel([
  function(callback){
    file1Reader.on('end', function(){
      callback();
    });
  },
  //function(callback){
    //file2Reader.on('end', function(){
      //callback();
    //});
  //}
], function(err){
  pack.finalize();
  pack.pipe(outputFile);
});


