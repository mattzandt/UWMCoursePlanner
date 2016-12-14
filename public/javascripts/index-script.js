$(function() {


	/********************************************** GLOBAL VARIABLES **********************************************/
	var requiredCoursesObj;
	var coursesObj;
	var loggedIn = false;

	var network;
	var data;
	var nodes;
	var edges;
	var container;
	var options;

	// model for current course plan
	var myCoursePlan = [];



	/********************************************** INITIALIZATION **********************************************/

	// TODO: uncomment to show modal intro again (hidden for testing)
	// $('.bs-example-modal-lg').modal('show');

	function initNetwork() {
		nodes = new vis.DataSet([{
			id: 1,
			label: 'Node 1',
			level: 1
		}, {
			id: 2,
			label: 'Node 2',
			level: 2
		}, {
			id: 3,
			label: 'Node 3',
			level: 3
		}, {
			id: 4,
			label: 'Node 4',
			level: 4
		}, {
			id: 5,
			label: 'Node 5',
			level: 4
		}]);

		// create an array with edges
		edges = new vis.DataSet([{
			from: 1,
			to: 3
		}, {
			from: 1,
			to: 2
		}, {
			from: 2,
			to: 4
		}, {
			from: 2,
			to: 5
		}]);

		// create a network
		container = document.getElementById('mynetwork');

		// provide the data in the vis format
		data = {
			nodes: nodes,
			edges: edges
		};

		options = {
			edges: {
				arrows: {
					to: {
						enabled: true,
						scaleFactor: 2
					}
				}
			},
			groups: {
				useDefaultGroups: false,
				Completed: {
					color: {
						background: '#FDB3B3',
						border: 'red'
					}
				},
				Planned: {},
			},
			layout: {
				randomSeed: undefined,
				improvedLayout: true,
				hierarchical: {
					enabled: true,
					levelSeparation: 700,
					nodeSpacing: 100,
					treeSpacing: 200,
					blockShifting: true,
					edgeMinimization: true,
					parentCentralization: false,
					direction: 'LR', // UD, DU, LR, RL
					sortMethod: 'directed' // hubsize, directed
				}
			},
			manipulation: {
				enabled: true,
				addNode: function(nodeData, callback) {
					/*
					nodeData.label = 'hello world';
					nodeData.level = 1;
					callback(nodeData);
					$.get('/majors', function(resp){
						var list = document.getElementById('major-minor-list');
						for(var key in resp){
							var element = document.createElement('button');
							element.setAttribute("class", "btn btn-primary btn-major center-block");
							element.setAttribute("type", "button");
							element.style.margin = "5px";
							element.innerText = key + ': ' + resp[key];
							list.appendChild(element);
						}
					});
					*/
					$('.add-node-modal-md').modal('show');
					nodeData.label = 'hello world';
					nodeData.level = 1;
				},
				editNode: function(nodeData, callback) {
					var doChange;
					var level = prompt(nodeData.label + ' is currently in semester ' + (nodeData.level + 1) + ". Enter a new semester number to move it to (1-12): ", nodeData.level + 1);
					if (prompt != null) {
						while (level < 1 || level > 12) {
							level = prompt('Invalid semester number entered! ' + nodeData.label + ' is currently in semester ' + (nodeData.level + 1) + ". Enter a new semester number to move it to (1-12): ", nodeData.level + 1);
						}
						// retrieve a filtered subset of the edges
						var postEdges = edges.get({
							filter: function(item) {
								return item.from == nodeData.id;
							}
						});
						for (var i = 0; i < postEdges.length; ++i) {
							var postKey = postEdges[i].to;
							var postNodes = nodes.get({
								filter: function(item) {
									return item.label == postKey;
								}
							});
							for (var i = 0; i < postNodes.length; ++i) {
								if (postNodes[i].level <= (level - 1)) {
									doChange = false;
									alert("Cannot move course after a dependent course!");
								}
							}
						}
						/*
						// retrieve a filtered subset of the edges
						var preEdges = edges.get({
						  filter: function (item) {
							return item.to == nodeData.id;
						}
						});
						for (var i = 0; i < preEdges.length; ++i) {
							var preKey = preEdges[i].to;
							var preNodes = nodes.get({
								filter: function (item) {
									return item.label == postKey;
								}
							});
							for (var i = 0; i < postNodes.length; ++i) {
								if (postNodes[i].level <= (level-1)) {
									doChange = false;
									alert("Cannot move course after a dependent course!");
								}
							}
						}
						*/
						if (doChange) {
							nodeData.level = level - 1;
							console.log(nodeData.level);
							callback(nodeData);
							network.setData(data);
							network.redraw();
						}
					}
				},
				addEdge: false,
				editEdge: false,
				deleteEdge: false,
			},
			nodes: {
				font: {
					size: 36, // px
				},
			},
			physics: {
				enabled: false,
				hierarchicalRepulsion: {
					nodeDistance: 35
				}
			}
		};

		// initialize your network!
		network = new vis.Network(container, data, options);
	}

	initNetwork();



	/*** MODEL/VIEW ***/
	// ADD COURSE
	// AUTOCOMPLETE FOR ADD COURSE
	var availableCourses = [
		'ARCH', 'ART', 'BIO SCI', 'CHEM', 'COMPSCI', 'ENGLISH', 'GEO SCI', 'MATH', 'MUSIC', 'PHILOS', 'PHYSICS', 'POL SCI', 'PSYCH'
	];
	$("#searchCourses").autocomplete({
		source: availableCourses
	});
	// ADD COURSE BUTTON
	$("#addCourseBtn").click(function() {
		$('#addCourseError').css("display", "none");
		// check if course exists
		var courseKey = $('#searchCourses').val();
		$.get('/course', {
			key: courseKey
		}, function(data, textStatus, jqXHR) {
			console.log('Add course status: ' + textStatus);
			if (textStatus == 'nocontent') {
				$('#addCourseError').text('Course ID not found in database! Please try again.').css("display", "inline").css("color", "red");
			} else {
				// validate input level
				var userLevel = $('#addCourseLevel').val();
				if (userLevel < 1 || userLevel > 12) {
					$('#addCourseError').text('Semester number must be between 1 and 12 (inclusive)! Please try again.').css("display", "inline").css("color", "red");
				} else {
					addCourseNode(courseKey, userLevel);
					$('.add-node-modal-md').modal('hide');
				}
			}
		});
		// check if it has pre-requisites
		// prepare to add courses to model
		// check for repeats
		// check for credit load
		// hide modal window
	});

	function addCourseNode(courseKey, userLevel) {
		var adjustedUserLevel = userLevel;
		console.log('User level:' + userLevel);
		// check is course is already in model
		if (!planContainsCourse(courseKey)) {
			$.get('/course', {
				key: courseKey
			}, function(data, textStatus, jqXHR) {
				console.log('Add course status: ' + textStatus);
				if (textStatus == 'success') {
					console.log(data);
					// check if it has pre-requisites
					var prereqs = data.prereq;
					console.log(prereqs);
					if (typeof prereqs != 'undefined') {
						for (var i = 0; i < prereqs.requirements.length; ++i) {
							// match regexp for prereq course key
							var re = /([a-zA-Z]+[ a-zA-Z]*\d+)/
							var re_result = re.exec(prereqs.requirements);
							console.log('Prereq re: ' + re_result);
							if (re_result != null) {
								var prereqKey = re_result[1];
								console.log(prereqKey);
								// add pre-requisites recursively
								if ((userLevel - 1) < 1) { // don't let prequisites go below user level 1
									++userLevel;
								}
								var plevel = addCourseNode(prereqKey, userLevel - 1);
								adjustedUserLevel = plevel + 1;
								console.log('Adjusted user level: ' + adjustedUserLevel);
							}
						}
					}
					// create course node
					var courseNode = insertCourseNode(courseKey, data, adjustedUserLevel);
					createCoursePlanGraph();
					return adjustedUserLevel;
				}
			});
			// internal level is 2, user level is one less
			// return the level it was actually added to?
		}
	}

	// EDIT COURSE BUTTON
	$("#editCourseBtn").click(function() {
		$('#editCourseError').css("display", "none");
		// validate input level
		var userLevel = $('#editCourseLevel').val();
		if (userLevel < 1 || userLevel > 12) {
			$('#editCourseError').text('Semester number must be between 1 and 12 (inclusive)! Please try again.').css("display", "inline").css("color", "red");
		} else {
			if (editCourseNode(currentSelNode, userLevel)) {
				$('.edit-node-modal-md').modal('hide');
			} else {
				$('#editCourseError').text('Semester number cannot be the same or less than that of a pre-requisite course. Please try again.').css("display", "inline").css("color", "red");
			}
		}
	});

	function editCourseNode(nodeData, userLevel) {
		// cannot <= pre-requisites
		$.get('/course', {
			key: nodeData.label
		}, function(data, textStatus, jqXHR) {
			console.log('Edit course status: ' + textStatus);
			if (textStatus == 'success') {
				console.log(data);
				// check if it has pre-requisites
				var prereqs = data.prereq;
				console.log(prereqs);
				if (typeof prereqs != 'undefined') {
					for (var i = 0; i < prereqs.requirements.length; ++i) {
						// match regexp for prereq course key
						var re = /([a-zA-Z]+[ a-zA-Z]*\d+)/
						var re_result = re.exec(prereqs.requirements[i]);
						console.log('Prereq re: ' + re_result);
						if (re_result != null) {
							var prereqKey = re_result[1];
							var prereqLevel = getCourseLevel(prereqKey);
							console.log('prereq lvl ' + prereqLevel + ' user level' + userLevel);
							if (typeof prereqLevel != 'undefined') {
								if (userLevel <= prereqLevel) {
									$('#editCourseError').text('Semester number cannot be the same or less than that of a pre-requisite course. Please try again.').css("display", "inline").css("color", "red");
									doEdit = false;
									return false;
								}
							}
						}
					}
				}
				// move course
				doEdit = true;
				console.log('ok edit');
				return true;
			}
		});
		// cannot >= post-requisites
	}

	// **MAJOR SELECTION**
	$("#selectMajor").click(function() {
		$.get('/majors', function(resp) {
			var list = document.getElementById('major-minor-list');
			for (var key in resp) {
				var element = document.createElement('button');
				element.setAttribute("class", "btn btn-primary btn-major center-block");
				element.setAttribute("type", "button");
				element.style.margin = "5px";
				element.innerText = key + ': ' + resp[key];
				list.appendChild(element);
			}
		});
		$('.major-minor-modal-md').modal('show');
	});

	// **CLICK MAJOR**
	$(document).on('click', '.btn-major', function() {
		console.log($(this).html());
		// match major key in button name
		var re = /(\w+):/
		var re_result = re.exec($(this).html());
		if (re_result != null) {
			var key = re_result[1];
			console.log('key: ' + key);
			if (key == 'COMPSCI') {
				// GET default plan for COMPSCI
				$.get('/defaultPlan', {
					major: key
				}, function(resp) {
					console.log('Resp length: ' + resp.length);
					createCoursePlanFromJSON(resp);
					drawCoursePlan();
				});
			}
		}
		$('.major-minor-modal-md').modal('hide');
	});

	// clears the major selection buttons so they don't keep growing
	$(".major-minor-modal-md").on("hidden.bs.modal", function() {
		document.getElementById('major-minor-list').innerHTML = '';
	});



	/******************************************* ACCOUNT-RELATED **********************************************/
	// ** LOAD PLAN **
	$(".loadPlan-modal-md").on("hidden.bs.modal", function() {
		document.getElementById('loadPlan-list').innerHTML = '';
		document.getElementById('noPlans').setAttribute('style', 'display:none;');
	});

	// ** LOAD PLAN SELECTION
	$("#loadBtn").click(function() {
		$.get('/planNames', function(data, textStatus, jqXHR) {
			if (textStatus == 'nocontent') {
				document.getElementById('noPlans').setAttribute('style', 'color: red;');
			} else {
				var list = document.getElementById('loadPlan-list');
				for (var key in data) {
					if (key == 'sharedNames') {
						for (var sharedKey in data[key]) {
							var element = document.createElement('button');
							element.setAttribute("class", "btn btn-primary btn-major center-block");
							element.setAttribute("type", "button");
							element.style.margin = "5px";
							element.id = sharedKey;
							console.log(key);
							console.log(sharedKey);
							element.innerText = data[key][sharedKey] + " (Shared with you)";
							element.addEventListener('click', function() {
								$.get('/getPlan', {
									planName: data[key][sharedKey]
								}, function(data, textStatus, jqXHR) {
									var loadedData = {
										nodes: $.map($.parseJSON(data.nodes)._data, function(el) {
											return el
										}),
										edges: $.map($.parseJSON(data.edges)._data, function(el) {
											return el
										})
									}
									network = new vis.Network(container, loadedData, options);
									$(".loadPlan-modal-md").modal('hide');
								});
							});
							list.appendChild(element);
						}
					} else {
						var element = document.createElement('button');
						element.setAttribute("class", "btn btn-primary btn-major center-block");
						element.setAttribute("type", "button");
						element.style.margin = "5px";
						element.id = key;
						element.innerText = data[key];
						element.addEventListener('click', function() {
							$.get('/getPlan', {
								planName: this.innerText
							}, function(data, textStatus, jqXHR) {
								var loadedData = {
									nodes: $.map($.parseJSON(data.nodes)._data, function(el) {
										return el
									}),
									edges: $.map($.parseJSON(data.edges)._data, function(el) {
										return el
									})
								}
								network = new vis.Network(container, loadedData, options);
								$(".loadPlan-modal-md").modal('hide');
							});
						});
						list.appendChild(element);
					}
				}
			}
		});
		$('.loadPlan-modal-md').modal('show');
	});

	// ***SHARE PLAN***
	$('#shareBtn').click(function() {
		if (loggedIn == true) {
			$('.sharePlan-modal').modal('show');
		} else $('.login-modal').modal('show');
	});

	$(".sharePlan-modal").on("hidden.bs.modal", function() {
		document.getElementById('noUser').setAttribute('style', 'display: none;');
		document.getElementById('noPlanName').setAttribute('style', 'display: none;');
		document.getElementById('shareEmailInput').value = '';
		document.getElementById('shareNameInput').value = '';
	});

	$('#shareModalBtn').click(function() {
		document.getElementById('noUser').setAttribute('style', 'display: none;');
		document.getElementById('noPlanName').setAttribute('style', 'display: none;');
		if (document.getElementById('shareEmailInput').value == '') {
			document.getElementById('noUser').setAttribute('style', 'color:red;');
		} else if (document.getElementById('shareNameInput').value == '') {
			document.getElementById('noPlanName').setAttribute('style', 'color:red;');
		} else {
			//	$('.savePlan-modal').modal('hide');
			$.post('/sharePlan', {
				planName: document.getElementById('shareNameInput').value,
				email: document.getElementById('shareEmailInput').value,
				nodes: JSON.stringify(nodes),
				edges: JSON.stringify(edges)
			}, function(data, textStatus, jqXHR) {
				if (textStatus == 'success') {
					$('.sharePlan-modal').modal('hide');
					$("#successSave").alert();
					$("#successSave").fadeTo(2000, 500).slideUp(500, function() {
						$("#successSave").slideUp(500);
					});
					console.log('successful share');
				} else if (textStatus == 'nocontent') {
					console.log('failed share: ' + textStatus);
					document.getElementById('noUser').setAttribute('style', 'color:red;');
				}
			});
		}
	});



	// ***SAVE PLAN***
	$('#saveBtn').click(function() {
		if (loggedIn == true) {
			$('.savePlan-modal').modal('show');
		} else $('.login-modal').modal('show');
	});

	$('#submitPlanName').click(function() {
		if (document.getElementById('planNameInput').value == '') {
			document.getElementById('emptySave').setAttribute('style', '');
		} else {
			$('.savePlan-modal').modal('hide');
			$.post('/savePlan', {
				planName: document.getElementById('planNameInput').value,
				nodes: JSON.stringify(nodes),
				edges: JSON.stringify(edges)
			}, function(resp) {
				if (resp == 'OK') {
					$("#successSave").alert();
					$("#successSave").fadeTo(2000, 500).slideUp(500, function() {
						$("#successSave").slideUp(500);
					});
					console.log('successful save');
				} else {
					console.log('failed save');
					$("#failSave").alert();
					$("#failSave").fadeTo(2000, 500).slideUp(500, function() {
						$("#failSave").slideUp(500);
					});
				}
			});
		}
	});

	$(".savePlan-modal").on("hidden.bs.modal", function() {
		document.getElementById('emptySave').setAttribute('style', 'display: none;');
		document.getElementById('planNameInput').value = '';
	});

	// ***LOGIN/LOGOUT***
	$('#submitLogin').click(function() {
		$.post('/login', {
			email: document.getElementById('loginEmail').value,
			pass: document.getElementById('loginPass').value
		}, function(resp) {
			if (resp == 'OK') {
				document.getElementById('loginFailed').setAttribute('style', 'display: none;');
				$('.login-modal').modal('hide');
				document.getElementById('loginBtn').setAttribute('style', 'display: none;');
				document.getElementById('logoutBtn').setAttribute('style', '');
				loggedIn = true;
			} else {
				document.getElementById('loginFailed').innerText = resp;
				document.getElementById('loginFailed').setAttribute('style', 'color: red;');
			}
		});
	});

	$(".login-modal").on("hidden.bs.modal", function() {
		document.getElementById('loginFailed').setAttribute('style', 'display: none;');
		document.getElementById('loginEmail').value = '';
		document.getElementById('loginPass').value = '';
	});

	$('#newBtn').click(function() {
		initNetwork();
		network.redraw();
	});

	$('#logoutBtn').click(function() {
		$.post('/logout', function(resp) {
			if (resp == 'OK') {
				document.getElementById('logoutBtn').setAttribute('style', 'display: none;');
				document.getElementById('loginBtn').setAttribute('style', '');
				initNetwork();
				network.redraw();
				loggedIn = false;
			} else {
				$('.logout-modal').modal('show');
			}
		});
	});

	$(".register-modal").on("hidden.bs.modal", function() {
		document.getElementById('passMismatch').setAttribute('style', 'display: none;');
		document.getElementById('regSuccess').setAttribute('style', 'display: none;');
		document.getElementById('regFail').setAttribute('style', 'display: none;');
	});

	$('#regBtn').click(function() {
		$('.login-modal').modal('hide');
		document.getElementById('regEmail').value = '';
		document.getElementById('regPass').value = '';
		document.getElementById('regPassAgain').value = '';
	});

	$('#submitReg').click(function() {
		if (document.getElementById('regPass').value !== document.getElementById('regPassAgain').value) {
			document.getElementById('regSuccess').setAttribute('style', 'display: none;');
			document.getElementById('regFail').setAttribute('style', 'display: none;');
			document.getElementById('passMismatch').setAttribute('style', "color: red;")
		} else {
			var userEmail = document.getElementById('regEmail').value;
			var userPass = document.getElementById('regPass').value;
			$.post('/register', {
				email: userEmail,
				pass: userPass
			}, function(resp) {
				if (resp == 'OK') {
					document.getElementById('regFail').setAttribute('style', 'display: none;');
					document.getElementById('passMismatch').setAttribute('style', 'display: none;');
					document.getElementById('regSuccess').innerText = 'Registration successful!';
					document.getElementById('regSuccess').setAttribute('style', 'color: blue;');
				} else {
					document.getElementById('passMismatch').setAttribute('style', 'display: none;');
					document.getElementById('regSuccess').setAttribute('style', 'display: none;');
					document.getElementById('regFail').innerText = resp;
					document.getElementById('regFail').setAttribute('style', 'color: red;')
				}
			});
		}
	});



	/********************************************** HELPER METHODS **********************************************/
	// parse default plan JSON and create course plan model
	function createCoursePlanFromJSON(jsonObj) {
		console.log('JSON: ' + jsonObj);
		var courseObj;
		var courseKey;
		var courseLevel;
		var courseTitle;
		var courseCredits;
		var courseNode;
		jsonObj.forEach(function(level, index, array) {
			// iterate over the course objects of the current "level"
			level.forEach(function(levelItem, index2, array2) {
				// turn each course object into a node
				courseObj = levelItem.course;
				//console.log(courseObj.key);
				courseKey = courseObj.key;
				courseLevel = index + 1; // level is zero-indexed in json
				courseTitle = courseObj.attributes.title;
				courseCredits = courseObj.attributes.credits;

				// construct new CourseNode object
				courseNode = new CourseNode(courseKey, courseTitle, courseCredits);
				courseNode.level = courseLevel;

				// add prereqs
				if (typeof levelItem.preReqs != 'undefined') {
					levelItem.preReqs.forEach(function(preReq, index3, array3) {
						courseNode.addPrereq(preReq.key);
					});
				}

				// add postreqs
				if (typeof levelItem.postReqs != 'undefined') {
					levelItem.postReqs.forEach(function(postReq, index3, array3) {
						courseNode.addPostreq(postReq.key);
					});
				}

				// add CourseNode to plan
				myCoursePlan.push(courseNode);
				//console.log('Course plan: ' +  myCoursePlan);
			});
		});
		debugCoursePlan();
	}



	// draw network using course plan model
	function drawCoursePlan() {
		var nodeArray = [];
		var edgeArray = [];
		var prereqText = '';
		var postreqText = '';
		var courseGroup;

		myCoursePlan.forEach(function(item, index, array) {
			prereqText = '';
			postreqText = '';
			// set group
			if (item.completed) {
				courseGroup = 'Completed';
			} else {
				courseGroup = 'Planned';
			}

			// write prereqs and create edges
			for (var i = 0; i < item.prereqs.length; ++i) {
				prereqText += ' ' + item.prereqs[i] + ','
			}

			// write postreqs
			for (var i = 0; i < item.postreqs.length; ++i) {
				postreqText += ' ' + item.postreqs[i] + ','
			}

			// create nodes and add to array
			nodeArray.push({
				id: item.key,
				label: item.key,
				level: item.level,
				title: '<b>Title:</b> ' + item.title + '<br/><b>Credits:</b> ' + item.credits + '<br/><b>Prereq(s):</b>' + prereqText + '<br/><b>Postreq(s):</b>' + postreqText + '<br/><b>Semester: </b>' + item.level,
				group: courseGroup
			});
		});

		myCoursePlan.forEach(function(item, index, array) {
			// create edges from prereqs and add to array
			for (var i = 0; i < item.prereqs.length; ++i) {
				edgeArray.push({
					from: item.prereqs[i],
					to: item.key
				});
			}
		});

		// set network data and redraw
		nodes = new vis.DataSet(nodeArray);
		edges = new vis.DataSet(edgeArray);
		data = {
			nodes: nodes,
			edges: edges
		};
		network.setData(data);
		network.redraw();
	}
	/*
	function createCoursePlanGraph() {
		// construct nodes for courses
		var nodeArray = [];
		var edgeArray = [];
		//console.log(resp);
		//console.log(resp.length);
		var levelArray;
		var courseObj;
		var courseKey;
		var courseLevel;
		var courseTitle;
		var courseCredits;
		var courseDesc;
		// iterate over the "levels" of default plan
		coursePlan.forEach(function (level, index, array){
			// iterate over the course objects of the current "level"
			level.forEach(function(levelItem, index2, array2){
				// turn each course object into a node
				courseObj = levelItem.course;
				//console.log(courseObj.key);
				courseKey = courseObj.key;
				courseLevel = index; // want "completed" at first level, so first semester = level 2
				courseTitle = courseObj.attributes.title;
				courseCredits = courseObj.attributes.credits;
				coursePrereqs = '';
				//console.log(courseKey + ' ' + courseLevel + ' ' + courseTitle + ' ' + courseCredits + ' ' + coursePrereqs);
				
				// for each course, construct an edge from its pre-requisite to it
				//console.log('Prereqs: ' + levelItem.preReqs);
				if (typeof levelItem.preReqs != 'undefined') {
					levelItem.preReqs.forEach(function(preReq, index3, array3) {
						//console.log('Prereq key: ' + preReq.key);
						edgeArray.push({from: preReq.key, to: courseKey});
						coursePrereqs += ' ' + preReq.key;
					});
				}
				nodeArray.push({id: courseKey, 
								label: courseKey, 
								level: courseLevel, 
								title: '<b>Title:</b> ' + courseTitle + '<br/><b>Credits:</b> ' + courseCredits + '<br/><b>Prereq(s):</b>' + coursePrereqs,
								group: 'Planned'});
			});	
		});
		// initialize network parameters and network
		nodes = new vis.DataSet(nodeArray);
		edges = new vis.DataSet(edgeArray);
		data = {
			nodes: nodes,
			edges: edges
		};
		network.setData(data);
	}
	*/

	function insertCourseNode(key, courseObj, userLevel) {
		// course attribute, key, level, postRe
		var preArr = new Array();
		var prereqs = courseObj.prereq;
		if (typeof prereqs != 'undefined') {
			for (var i = 0; i < prereqs.requirements.length; ++i) {
				// match regexp for prereq course key
				var re = /([a-zA-Z]+[ a-zA-Z]*\d+)/
				var re_result = re.exec(prereqs.requirements);
				if (re_result != null) {
					var prereqKey = re_result[1];
					console.log(prereqKey);
					var prereqObj = {
						"key": prereqKey
					};
					preArr.push(prereqObj);
				}
			}
		}
		var courseNode = {
			"course": {
				"attributes": {
					"credits": courseObj.credits,
					"title": courseObj.title
				},
				"key": key
			},
			"level": userLevel + 1,
			"postReqs": [],
			"preReqs": preArr
		};
		coursePlan[userLevel - 1].push(courseNode);
	}


	function setCourseNodeLevel(courseNode, level) {

	}

	function planContainsCourse(testKey) {
		// iterate over the "levels" of default plan
		for (var i = 0; i < coursePlan.length; ++i) {
			//console.log(coursePlan[i]);
			for (var j = 0; j < coursePlan[i].length; ++j) {
				var cObj = coursePlan[i][j].course;
				//console.log("Contains test: " + testKey + ', ' + cObj.key);
				if (testKey == cObj.key) {
					//console.log('true');
					return true;
				}
			}
		}
		return false;
	}

	function getCourseLevel(testKey) {
		for (var i = 0; i < coursePlan.length; ++i) {
			//console.log(coursePlan[i]);
			for (var j = 0; j < coursePlan[i].length; ++j) {
				var cObj = coursePlan[i][j].course;
				//console.log("Contains test: " + testKey + ', ' + cObj.key);
				if (testKey == cObj.key) {
					//console.log('true');
					return i + 1;
				}
			}
		}
	}

	function debugCoursePlan() {
		console.log('DEBUG COURSE PLAN');
		console.log('COURSE PLAN SIZE: ' + myCoursePlan.length);
		for (var i = 0; i < myCoursePlan.length; ++i) {
			console.log(myCoursePlan[i]);
		}
	}

	// if move node forwards, have to move post-requisites forwards
	// if move node backwards, have to move pre-requisites backwards

});