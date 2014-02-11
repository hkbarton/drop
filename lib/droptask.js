// drop task, which execute the actual operation on deploy node
var Task = function(){
};

// drop task step, a step is actual shell command will execute when run a task
var Step = function(){
};

var CopyFiles = Step;
CopyFiles.prototype.execute = function(){
    console.log(this.stepID);
};

exports.StepCopyFiles = CopyFiles;
