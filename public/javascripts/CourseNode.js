var CourseNode = function (key, title, credits) {
	this.key = key;
	this.title = title;
	this.credits = credits;
	// pre-reqs, array of course keys
	this.prereqs = [];
	// post-reqs, array of course keys
	this.postreqs = [];
	this.level = 0;
	this.completed = false;
	// instantiate with: var course1 = new CourseNode();
	console.log("Instance of CourseNode " + this.key + " created");
};

CourseNode.prototype.addPrereq = function(prereqKey) {
	this.prereqs.push(prereqKey);
	console.log('CourseNode ' + this.key + ' prereqs: ' + this.prereqs);
};

CourseNode.prototype.addPostreq = function(postreqKey) {
	this.postreqs.push(postreqKey);
	console.log('CourseNode ' + this.key + ' postreqs: ' + this.postreqs);
};