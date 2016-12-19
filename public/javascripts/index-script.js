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
	var recursionCount = 0; // used to ensure when a recursive call has completely finished, remember to RESET!
	var preAddArray = []; // array of course nodes to be added to plan, remember to RESET!
	var uniquePreAddArray = []; // subset of preAddArray = array of unique course nodes to be added to plan, remember to RESET!

	var curSelNode = '';

	/********************************************** INITIALIZATION **********************************************/

	// TODO: uncomment to show modal intro again (hidden for testing)
	//$('.bs-example-modal-lg').modal('show');

	function initNetwork() {
		var cn1 = new CourseNode('MATH116', 'Introductory Computer Programming', 3);
		cn1.level = 1;
		cn1.addPostreq('COMPSCI250');
		cn1.addPostreq('COMPSCI251');
		cn1.addPostreq('COMPSCI315');
		cn1.addPostreq('COMPSCI351');						

		var cn2 = new CourseNode('COMPSCI250', 'Introductory Computer Programming', 3);
		cn2.level = 2;
		cn2.addPrereq('MATH116');
		cn2.addPostreq('COMPSCI251');	
		cn2.addPostreq('COMPSCI315');
		
		var cn3 = new CourseNode('COMPSCI251', 'Intermediate Computer Programming', 3);
		cn3.level = 3;
		cn3.addPrereq('MATH116');
		cn3.addPrereq('COMPSCI250');
		cn3.addPostreq('COMPSCI351');				

		var cn4 = new CourseNode('COMPSCI315', 'Introduction to Computer Organization and Assembly Language Programming', 3);
		cn4.level = 3;
		cn4.addPrereq('MATH116');
		cn4.addPrereq('COMPSCI250');

		var cn5 = new CourseNode('COMPSCI351', 'Data Structures and Algorithms', 3);
		cn5.level = 4;
		cn5.addPrereq('MATH116');
		cn5.addPrereq('COMPSCI251');

		myCoursePlan = [];
		myCoursePlan.push(cn1);
		myCoursePlan.push(cn2);
		myCoursePlan.push(cn3);
		myCoursePlan.push(cn4);
		myCoursePlan.push(cn5);

		appendLog('Minimum sample plan loaded');

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

		// create a network
		container = document.getElementById('mynetwork');

		// create options object
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
					$('.add-node-modal-md').modal('show');
					callback();
				},
				editNode: function(nodeData, callback) {
					$('#editCourseId').text(nodeData.id);
					$('#editCourseCurLevel').text(nodeData.level);
					console.log("Currently selected node: " + nodeData.id);
					curSelNode = nodeData.id;
					var cn = getCourseNodeFromPlan(curSelNode);
					if (cn.completed == true) {
						$('#completedCheckbox').prop("checked", true);
					}
					else {
						$('#completedCheckbox').prop("checked", false);
					}
					$('.edit-node-modal-md').modal('show');
					callback();
				},
				deleteNode: function(data, callback) {
					console.log("Currently selected node: " + data.nodes);
					console.log("Currently selected edges: " + data.edges);
					curSelNode = data.nodes;
					var r = confirm("Deleting a course node will also delete all post-requisite courses. Are you sure you want to proceed?");
					if (r == true) {
						deleteCourseNode(curSelNode);
						//console.log("Draw update");
						drawCoursePlan();
					} else {
					    
					}					
					// TODO: confirm dialogue
					callback();
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
				enabled: true,
				hierarchicalRepulsion: {
					nodeDistance: 200
				}
			}
		};

		// initialize your network!
		network = new vis.Network(container, data, options);
	}

	initNetwork();


	/************************************************* MODEL/VIEW *************************************************/

	// ADD COURSE
	// AUTOCOMPLETE FOR ADD COURSE
	var availableCourses = [
		'ARCH', 'ART', 'BIO SCI', 'CHEM', 'COMPSCI', 'ENGLISH', 'GEO SCI', 'GERMAN', 'MATH', 'MUSIC', 'PHILOS', 'PHYSICS', 'POL SCI', 'PSYCH'
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
				var userLevel = parseInt($('#addCourseLevel').val());
				if (userLevel < 1 || userLevel > 12) {
					$('#addCourseError').text('Semester number must be between 1 and 12 (inclusive)! Please try again.').css("display", "inline").css("color", "red");
				} else {
					preAddCourse(courseKey, userLevel);
					//processPreAdd();
				}
			}
		});
	});

	// EDIT COURSE BUTTON
	$("#editCourseBtn").click(function() {
		$('#editCourseError').css("display", "none");
		// validate input level
		var userLevel = parseInt($('#editCourseLevel').val());
		console.log("User level " + userLevel);
		var completed = $('#completedCheckbox').prop("checked");
		if (userLevel < 1 || userLevel > 12) {
			$('#editCourseError').text('Semester number must be between 1 and 12 (inclusive)! Please try again.').css("display", "inline").css("color", "red");
		} else {
			var cn = getCourseNodeFromPlan(curSelNode);
			userLevel = cn.level;
			editCourseNode(curSelNode, userLevel, completed);
		}
	});


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

	// **MAJOR BTN CLICK**
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
					appendLog('Default computer science plan loaded');
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
		myCoursePlan = [];
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
		updatePostReqs();
		//debugCourseNodeArr(myCoursePlan);
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


	function getCourseAjax(courseKey) {
		$.get('/course', {
			key: courseKey
		}, function(data, textStatus, jqXHR) {
			if (textStatus == 'success') {
				console.log('Got ' + data.key + ' from database');
				return data;
			}
		});
	}

	function preAddCourse(courseKey, level) {
		appendLog('Preparing to add ' + courseKey);
		++recursionCount;
		console.log('recursionCount: ' + recursionCount);
		$.get('/course', {
			key: courseKey
		}, function(data, textStatus, jqXHR) {
			console.log('Add course status: ' + textStatus);
			if (textStatus == 'success') {
				console.log(data);
				// create course node
				var courseNode = new CourseNode(courseKey, data.title, data.credits);
				courseNode.level = level;
				// check if it has pre-requisites
				var prereqs = data.prereq;
				console.log(courseKey + 'prereqs: ' + prereqs);
				if (typeof prereqs != 'undefined') {
					appendLog('Prerequisite(s) for ' + courseKey + ' found!');
					for (var i = 0; i < prereqs.requirements.length; ++i) {
						// match regexp for prereq course key
						var re = /([a-zA-Z]+[ a-zA-Z]*\d+)/
						var re_result = re.exec(prereqs.requirements[i]);
						console.log('Prereq re: ' + re_result);
						if (re_result != null) {
							var prereqKey = re_result[1];
							console.log('Prereq key ' + prereqKey);
							courseNode.addPrereq(prereqKey);
							// add pre-requisites recursively
							prereqLevel = level - 1;
							preAddCourse(prereqKey, prereqLevel);
						}
					}
				}
				--recursionCount;
				console.log('recursionCount: ' + recursionCount);
				preAddArray.push(courseNode);
				debugCourseNodeArr(preAddArray);
				//  && typeof callback=="function"
				if(recursionCount === 0) {
					console.log('Recursion done');
					processPreAdd();
				}
			}
		});
	}

	function processPreAdd() {
		console.log("PREPROCESS");
		debugCourseNodeArr(preAddArray);
		// if there are duplicates, delete the ones with higher level(s)
		var uniqueCourseArr = [];
		var currKey;
		var currLevel;
		for(var i = 0; i < preAddArray.length; ++i) {
			currKey = preAddArray[i].key;
			currLevel = preAddArray[i].level;
			var uniqueCourse  = new UniqueCourse(currKey, i);
			var uniqueInd = searchCourseInd(uniqueCourseArr, currKey);
			if (uniqueInd < 0) {
				// if not found, push in new unique course
				uniqueCourse.level = currLevel;
				uniqueCourseArr.push(uniqueCourse);
			}
			else {
				// if found, check if currLevel is lower
				if (currLevel < uniqueCourseArr[uniqueInd].level) {
					// update index and level
					uniqueCourseArr[uniqueInd].level = currLevel;
					uniqueCourseArr[uniqueInd].index = i;
				}
			}
		}
		debugCourseNodeArr(uniqueCourseArr);
		// use uniqueCourseArr to splice preAddArray
		for(var i = 0; i < uniqueCourseArr.length; ++i) {
			var preInd = uniqueCourseArr[i].index;
			var courseNode = preAddArray[preInd];
			var courseNodeClone = cloneCourseNode(courseNode);
			//console.log('courseNodeClone level: ',  courseNodeClone.level);
			uniquePreAddArray.push(courseNodeClone);
		}
		//console.log('AFTER CLONE');
		//console.log(uniquePreAddArray[0].level);
		debugCourseNodeArr(uniquePreAddArray);
		//console.log(uniquePreAddArray[0].level);

		// sort the list by ascending levels
		uniquePreAddArray.sort(function (a, b){
			if(a.level > b.level) {
				return 1;
			}
			if(a.level < b.level) {
				return -1;
			}
			return 0;
		});

		console.log('AFTER SORT');
		debugCourseNodeArr(uniquePreAddArray);

		// try inserting each course, starting with lowest level
		console.log('Start inserting');
		var planChanged = false;
		for (var i = 0; i < uniquePreAddArray.length; ++i) {
			if (insertCourseInPlan(uniquePreAddArray[i])) {
				planChanged = true;
			}
		}

		console.log('Plan changed: ' + planChanged);

		if(planChanged) {
			// update all post-reqs
			// for each course node, its prereqs should have it as a postreq
			console.log("Updating postreqs");
			updatePostReqs();
			console.log('Updated myCoursePlan:');
			debugCourseNodeArr(myCoursePlan);

			// draw plan
			drawCoursePlan();
		}


		// reset arrays and count
		uniquePreAddArray = [];
		preAddArray = [];
		recursionCount = 0;

		// hide modal
		$('.add-node-modal-md').modal('hide');
	};

	// for each course node, verify that its prereqs should have it as a postreq, otherwise fix
	function updatePostReqs() {
		for (var i = 0; i < myCoursePlan.length; ++i) {
			var cn = myCoursePlan[i];
			for (var j = 0; j < cn.prereqs.length; ++j) {
				var pk = cn.prereqs[j];
				var pn = getCourseNodeFromPlan(pk);
				if (pn) {
					pn.addPostreq(cn.key);
				}
			}
		}
	}

	function editCourseNode(courseKey, userLevel, completed) {
		var courseNode = getCourseNodeFromPlan(courseKey)
		var doEdit = true;
		console.log("Editing node: " + courseNode.title);
		// do nothing if level is the same
		if (userLevel == courseNode.level) {
			appendLog('Semester number entered for ' + courseNode.key + ' is same as current semester. Skipping move.');
			doEdit = false;
		}
		else {
			// level cannot <= pre-requisites level
			var preNode;
			for (var i = 0; i < courseNode.prereqs.length; ++i) {
				preNode = getCourseNodeFromPlan(courseNode.prereqs[i]);
				if (userLevel <= preNode.level) {
					appendLog('Cannot move ' + courseNode.key + ' to a semester that is before or concurrent to its prerequisite ' + preNode.key + '. Aborting move.');
					doEdit = false;
					break;
				}
			}
			// level cannot cannot >= post-requisites level
			var postNode;
			for (var i = 0; i < courseNode.postreqs.length; ++i) {
				postNode = getCourseNodeFromPlan(courseNode.postreqs[i]);
				if (userLevel >= postNode.level) {
					appendLog('Cannot move ' + courseNode.key + ' to a semester that is after or concurrent to its postrequisite ' + postNode.key + '. Aborting move.');
					doEdit = false;
					break;
				}
			}
		}
		if (doEdit) {
			appendLog('Moved ' + courseNode.key + ' from semester ' + courseNode.level + ' to ' + userLevel + '.');
			courseNode.level = userLevel;
			drawCoursePlan();
		}

		markCourseNode(courseKey, completed);
		drawCoursePlan();

		$('.edit-node-modal-md').modal('hide');
		// TODO: if move node forwards, have to move post-requisites forwards
		// TODO: if move node backwards, have to move pre-requisites backwards
	}

	function markCourseNode(courseKey, completed) {
		var courseNode = getCourseNodeFromPlan(courseKey);
		if (courseNode) {
			if (courseNode.completed != completed) {
				if (completed == true) {
					// mark all prereqs as completed
					appendLog("Marking all prereqs of " + courseNode.key + " as completed.");
					for (var i = 0; i < courseNode.prereqs.length; ++i) {
						markCourseNode(courseNode.prereqs[i], completed);
					}
					appendLog('Marked ' + courseNode.key + ' from semester ' + courseNode.level + ' as completed.');									
				}
				else {
					// mark all postreqs as planned
					appendLog("Marking all postreqs of " + courseNode.key + " as planned.");
					for (var i = 0; i < courseNode.postreqs.length; ++i) {
						markCourseNode(courseNode.postreqs[i], completed);
					}
					appendLog('Marked ' + courseNode.key + ' from semester ' + courseNode.level + ' as planned.');									
				}
				courseNode.completed = completed;
			}			
		}
	}

	function deleteCourseNode(courseKey) {
		var courseNode = getCourseNodeFromPlan(courseKey);
		console.log("Removing " + courseNode.key);
		// have to remove all postreqs recursively
		while (courseNode.postreqs.length > 0) {
			deleteCourseNode(courseNode.postreqs.pop());
		}
		var courseIndex = searchCourseInd(myCoursePlan, courseKey);
		myCoursePlan.splice(courseIndex, 1);
		appendLog("Deleted " + courseNode.key);
		// update the postreqs property of all prereqs
		var preNode;
		for (var i = 0; i < courseNode.prereqs.length; ++i) {
			console.log('PREREQ: ' + courseNode.prereqs[i]);
			preNode = getCourseNodeFromPlan(courseNode.prereqs[i]);
			if (preNode) {
				preNode.removePostreq(courseNode.key);
				appendLog("Updated postreqs for prereq: " + preNode.key);
			}
		}
	}

	function planContainsCourse(testKey) {
		for (var i = 0; i < myCoursePlan.length; ++i) {
			if (testKey == myCoursePlan[i].key) {
				console.log("Contains" + testKey + " true");
				return true;
			}
		}
		return false;
	}

	// search an array for a course key and return the index if found
	function searchCourseInd(arr, courseKey) {
		for (var i = 0; i < arr.length; ++i) {
			if (arr[i].key == courseKey) {
				return i;
			}
		}
		return -1;
}
	function getCourseNodeFromPlan(testKey) {
		for (var i = 0; i < myCoursePlan.length; ++i) {
			if (testKey == myCoursePlan[i].key) {
				return myCoursePlan[i];
			}
		}
		return false;
	}
	// get the level of a course in the current course plan
	function getCourseLevel(testKey) {
		for (var i = 0; i < myCoursePlan.length; ++i) {
			if (testKey == myCoursePlan[i].key) {
				return myCoursePlan[i].level;
			}
		}
		return false;
	}

	function debugCourseNodeArr(courseNodeArr) {
		console.log('DEBUG COURSE NODE ARRAY');
		console.log('ARRAY SIZE: ' +  courseNodeArr.length);
		for (var i = 0; i < courseNodeArr.length; ++i) {
			console.log(courseNodeArr[i]);
		}
	}

	// clone a course node and return the clone
	function cloneCourseNode(courseNode) {
		var clone = new CourseNode(courseNode.key, courseNode.title, courseNode.credits);
		clone.level = courseNode.level;
		console.log('Cloned level: ' + courseNode.level + ', ' + clone.level);
		clone.completed = courseNode.completed;
		for (var i = 0; i < courseNode.prereqs.length; ++i) {
			clone.addPrereq(courseNode.prereqs[i]);
		}
		for (var i = 0; i < courseNode.postreqs.length; ++i) {
			clone.addPostreq(courseNode.postreqs[i]);
		}
		console.log('Cloned level: ' + clone.level);
		return clone;
	}

	function appendLog(text) {
		$('#log ul').append('<li>' + text + '</li>');
	}

	// try to insert a course node into the current plan
	function insertCourseInPlan(courseNode) {
		// check if course already in plan
		if(planContainsCourse(courseNode.key)) {
			appendLog('Course ' + courseNode.key + ' is already in plan. Skipping insertion.');
			return false;
		}
		else {
			// check if level is in range
			if (courseNode.level < 1 || courseNode.level > 12) {
				appendLog('Course ' + courseNode.key + ' cannot be inserted at semester ' + courseNode.level + ' because the semester number is out of range (1-12).');
				// TODO: prompt insert at shifted level?
				return false;
			}
			// check if plan contains all pre-requisites
			var prereqs = courseNode.prereqs;
			for (var i = 0; i < prereqs.length; ++i) {
				if(!planContainsCourse(prereqs[i])) {
					appendLog('Course ' + courseNode.key + ' is missing prerequisite course ' + prereqs[i] + '! Cannot insert.');
					return false;
				}
				else {
					// check if pre-requisite level is below course level
					var preLevel = getCourseLevel(prereqs[i]);
					if (preLevel >= courseNode.level) {
						appendLog('Course ' + courseNode.key + ' semester number is less than or equal to that of pre-requisite ' + prereqs[i] + '! Cannot insert.');
						return false;
					}
				}
			}
			myCoursePlan.push(courseNode);
			appendLog('Course ' + courseNode.key + ' was inserted at semester ' + courseNode.level + '.');
			return true;
		}
	}
});