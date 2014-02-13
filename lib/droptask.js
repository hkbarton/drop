var fs = require('fs');

// drop task, which execute the actual operation on deploy node
var Task = function(prd){
  var contextPrd = prd;

  return {
    context:{
      product:contextPrd
    }
  };
};

// drop task step, a step is actual shell command will execute when run a task
var Step = function(task){
  var contextTask = task;
  
  return {
    context:{
      task: contextTask
    }
  };
};

var CopyFiles = Step;
CopyFiles.prototype.execute = function(args){
  if (!args){
    throw 'error'; // TODO
  }
  var sourcePath = args[0];
  if (!sourcePath){
    throw 'error'; // TODO
  }
};

var UpdateConfig = Step;
UpdateConfig.prototype.execute = function(args){
};

var RunCommand = Step;
RunCommand.prototype.execute = function(args){
};

exports.StepCopyFiles = CopyFiles;
exports.StepUpdateConfig = UpdateConfig;
exports.StepRunCommand = RunCommand;
