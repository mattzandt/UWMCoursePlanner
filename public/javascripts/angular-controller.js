angular.module('coursePlanner', []); // defines the module
angular.module('coursePlanner').controller('mController', mController); // binds the controller to the module

function mController(){
	this.course = 'CS552';
}

mController.prototype.yell = function() {
	console.log(this.course);
};
