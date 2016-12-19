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

// add a prereq if it doesn't already exist
CourseNode.prototype.addPrereq = function(prereqKey) {
	var isDuplicate = false;
	for (var i = 0; i < this.prereqs.length; ++i) {
		if(prereqKey == this.prereqs[i]) {
			isDuplicate = true;
			break;
		}
	}
	if(!isDuplicate) {
		this.prereqs.push(prereqKey);
		console.log('Added prereq ' + prereqKey + ' to CourseNode ' + this.key + ' prereqs: ' + this.prereqs);
	}
	else {
		console.log('Duplicate exists for ' + prereqKey + '! CourseNode ' + this.key + ' prereqs: ' + this.prereqs);
	}

};

// add a postreq if it doesn't already exist
CourseNode.prototype.addPostreq = function(postreqKey) {
	var isDuplicate = false;
	for (var i = 0; i < this.postreqs.length; ++i) {
		if(postreqKey == this.postreqs[i]) {
			isDuplicate = true;
			break;
		}
	}
	if(!isDuplicate) {
		this.postreqs.push(postreqKey);
		console.log('Added postreq ' + postreqKey + ' to CourseNode ' + this.key + ' postreqs: ' + this.postreqs);
	}
	else {
		console.log('Duplicate exists for ' + postreqKey + '! CourseNode ' + this.key + ' postreqs: ' + this.postreqs);
	}

};

// remove a postreq if it exists
CourseNode.prototype.removePostreq = function(postreqKey) {
	var isRemoved = false;
	for (var i = 0; i < this.postreqs.length; ++i) {
		if(postreqKey == this.postreqs[i]) {
			this.postreqs.splice(i,1);
			isRemoved = true;
			break;
		}
	}
	if (isRemoved) {
		console.log('Removed postreq ' + postreqKey + ' from CourseNode ' + this.key + ' postreqs: ' + this.postreqs);
	}
	else {
		console.log('No remove. Postreq ' + postreqKey + ' not found in CourseNode ' + this.key + ' postreqs: ' + this.postreqs);
	}
};
