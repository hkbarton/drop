var path = require('path'),
    util = require('./util'),
    Step = require('./step').Step;

// drop task, which execute the actual operation on deploy node
var Task = function(id, prd){
  this.id = id;
  this.context = {};
  this.context.product = prd;

  this.getNodePath = function(){
    var taskNodePathName = 'task_' + this.id;
    return path.join(this.context.product.getNodePath(), 
      taskNodePathName);
  };
  
  this.getNodeSrcFilesPath = function(){
    return path.join(getNodePath(), '.src'); 
  };

  this.createStep = function(stepFun, prevStep){
    stepFun.prototype = new Step(this, prevStep);
    return new stepFun();
  };
};

module.exports = Task;
