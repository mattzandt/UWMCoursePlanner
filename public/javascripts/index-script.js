$(function(){
	var requiredCoursesObj;
	var coursesObj;
	var loggedIn = false;

	// get all course data from DB
	$.get('/courses', function(resp){
		console.log(resp);
		coursesObj = resp;
	});

	// TODO: uncomment to show modal intro again (hidden for testing)
	// $('.bs-example-modal-lg').modal('show');
	var network;
	var data;
	var nodes;
	var edges;
	var container;
	var options;

	function initNetwork(){
		nodes = new vis.DataSet([
			{id: 1, label: 'Node 1', level: 1},
			{id: 2, label: 'Node 2', level: 2},
			{id: 3, label: 'Node 3', level: 3},
			{id: 4, label: 'Node 4', level: 4},
			{id: 5, label: 'Node 5', level: 4}
		]);

		// create an array with edges
		edges = new vis.DataSet([
			{from: 1, to: 3},
			{from: 1, to: 2},
			{from: 2, to: 4},
			{from: 2, to: 5}
		]);

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
						scaleFactor: 0.5
					}
				}
			},
					groups: {
				useDefaultGroups: false,
				/*
							Sophomore: {
									color: 'green'
							},
							Junior: {
									color: 'yellow'
							},
							Senior: {
					color: 'red'
				},
							NoStanding: {
									color: 'blue'
							}
				*/
					},
			layout: {
				randomSeed: undefined,
				improvedLayout:true,
				hierarchical: {
					enabled:true,
					levelSeparation: 420,
					nodeSpacing: 100,
					treeSpacing: 200,
					blockShifting: true,
					edgeMinimization: true,
					parentCentralization: false,
					direction: 'LR',        // UD, DU, LR, RL
					sortMethod: 'directed'   // hubsize, directed
				}
			},
			manipulation: {
				enabled: true,
				addNode: function(nodeData,callback) {
					nodeData.label = 'hello world';
					nodeData.level = 1;
					callback(nodeData);
				},
				editNode: function(nodeData,callback) {
					var level = prompt("Current node level is " + nodeData.level + ". Enter a new level: ", nodeData.level);
					if (prompt != null) {
						nodeData.level = level;
						console.log(nodeData.level);
						callback(nodeData);
						network.setData(data);
						network.redraw();
					}
				}
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
		//network.setOptions(options);
	}

	initNetwork();

	// ** LOAD PLAN **
	$(".loadPlan-modal-md").on("hidden.bs.modal", function () {
		document.getElementById('loadPlan-list').innerHTML = '';
		document.getElementById('noPlans').setAttribute('style', 'display:none;');
	});

	// ** LOAD PLAN SELECTION
	$("#loadBtn").click(function(){
		$.get('/planNames', function(data, textStatus, jqXHR){
			if (textStatus == 'nocontent'){ document.getElementById('noPlans').setAttribute('style', 'color: red;'); }
			else{
				var list = document.getElementById('loadPlan-list');
				for(var key in data){
					var element = document.createElement('button');
					element.setAttribute("class", "btn btn-primary btn-major center-block");
					element.setAttribute("type", "button");
					element.style.margin = "5px";
					element.id = key;
					element.innerText = data[key];
					element.addEventListener('click', function(){
						$.get('/getPlan', {planName : this.innerText}, function(data, textStatus, jqXHR){
							var loadedData = {
								nodes : $.map($.parseJSON(data.nodes)._data, function(el) { return el }),
								edges : $.map($.parseJSON(data.edges)._data, function(el) { return el })
							}
							network = new vis.Network(container, loadedData, options);
							$(".loadPlan-modal-md").modal('hide');
						});
					});
					list.appendChild(element);
				}
			}
		});
		$('.loadPlan-modal-md').modal('show');
	});

	// ***MAJOR/MINOR SELECTION**
	$("#selectMajor").click(function(){
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
		$('.major-minor-modal-md').modal('show');
	});

	// ***MAJOR BUTTONS***
	$(document).on('click', '.btn-major', function(){
		console.log($(this).html());
		// match major key in button name
		var re = /(\w+):/
		var re_result = re.exec($(this).html());
		if (re_result != null) {
			var key = re_result[1];
			console.log('key: ' + key);
			// get major data from DB
			$.get('/requiredCourses', function(resp){
				console.log(resp['majors'][key]);
				requiredCoursesObj = resp['majors'][key];
				// construct nodes for core courses
				var nodeArray = [];
				var edgeArray = [];
				console.log(requiredCoursesObj.core);
				console.log(coursesObj);
				requiredCoursesObj.core.forEach(function(item, index, array) {
					console.log(item);
					//nodeArray.push({id: item, label: item});
					console.log(coursesObj[item]);

					if (typeof coursesObj[item].prereq.standing != 'undefined') {
						var standing = coursesObj[item].prereq.standing;
						var courseTitle = coursesObj[item].title;
						var courseCredits = coursesObj[item].credits;
						console.log(standing);
						nodeArray.push({id: item, label: item, group: standing, title: '<b>Title:</b> ' + courseTitle + '<br/><b>Credits:</b> ' + courseCredits});
					}
					else {
						nodeArray.push({id: item, label: item, group: 'NoStanding', title: '<b>Title:</b> ' + courseTitle + '<br/><b>Credits:</b> ' + courseCredits});
					}

					// create array of edges from pre-req data
					console.log(coursesObj[item].prereq.requirements);



					if (typeof coursesObj[item].prereq.requirements != 'undefined') {
						coursesObj[item].prereq.requirements.forEach(function(item2, index2, array2) {
							edgeArray.push({from: item2, to: item});
						});
					}
				});
				// initialize network parameters and network
				nodes = new vis.DataSet(nodeArray);
				edges = new vis.DataSet(edgeArray);
				data = {
					nodes: nodes,
					edges: edges
				};
				network.setData(data);
			});
		}
		$('.major-minor-modal-md').modal('hide');
	});

	$("#selectMinor").click(function(){
		$.get('/minors', function(resp){
			var list = document.getElementById('major-minor-list');
			for(var key in resp){
				var element = document.createElement('button');
				element.setAttribute("class", "btn btn-primary center-block");
				element.setAttribute("type", "button");
				element.style.margin = "5px";
				element.innerText = resp[key];
				list.appendChild(element);
			}
		});
		$('.major-minor-modal-md').modal('show');
	});

	$(".major-minor-modal-md").on("hidden.bs.modal", function () {
    document.getElementById('major-minor-list').innerHTML = '';
	});

	// ***SAVE PLAN***
	$('#saveBtn').click(function(){
		if(loggedIn == true){
			$('.savePlan-modal').modal('show');
		}else $('.login-modal').modal('show');
	});

	$('#submitPlanName').click(function(){
		if(document.getElementById('planNameInput').value == ''){
			document.getElementById('emptySave').setAttribute('style', '');
		}else{
			$('.savePlan-modal').modal('hide');
			$.post('/savePlan', {planName : document.getElementById('planNameInput').value, nodes: JSON.stringify(nodes), edges: JSON.stringify(edges)}, function(resp){
				if (resp == 'OK'){
					$("#successSave").alert();
					$("#successSave").fadeTo(2000, 500).slideUp(500, function(){
						$("#successSave").slideUp(500);
					});
					console.log('successful save');
				}else {
					console.log('failed save');
					$("#failSave").alert();
					$("#failSave").fadeTo(2000, 500).slideUp(500, function(){
						$("#failSave").slideUp(500);
					});
				}
			});
		}
	});

	$(".savePlan-modal").on("hidden.bs.modal", function(){
		document.getElementById('emptySave').setAttribute('style', 'display: none;');
		document.getElementById('planNameInput').value = '';
	});

	// ***LOGIN/LOGOUT***
	$('#submitLogin').click(function(){
		$.post('/login', { email: document.getElementById('loginEmail').value, pass: document.getElementById('loginPass').value }, function(resp){
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

	$(".login-modal").on("hidden.bs.modal", function(){
		document.getElementById('loginFailed').setAttribute('style', 'display: none;');
		document.getElementById('loginEmail').value = '';
		document.getElementById('loginPass').value = '';
	});

	$('#newBtn').click(function(){
		initNetwork();
		network.redraw();
	});

	$('#logoutBtn').click(function(){
		$.post('/logout', function(resp){
			if(resp == 'OK'){
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

	$(".register-modal").on("hidden.bs.modal", function(){
		document.getElementById('passMismatch').setAttribute('style', 'display: none;');
		document.getElementById('regSuccess').setAttribute('style', 'display: none;');
		document.getElementById('regFail').setAttribute('style', 'display: none;');
	});

	$('#regBtn').click(function(){
		$('.login-modal').modal('hide');
		document.getElementById('regEmail').value = '';
		document.getElementById('regPass').value = '';
		document.getElementById('regPassAgain').value = '';
	});

	$('#submitReg').click(function(){
		if(document.getElementById('regPass').value !== document.getElementById('regPassAgain').value){
			document.getElementById('regSuccess').setAttribute('style', 'display: none;');
			document.getElementById('regFail').setAttribute('style', 'display: none;');
			document.getElementById('passMismatch').setAttribute('style', "color: red;")
		}else{
			var userEmail = document.getElementById('regEmail').value;
			var userPass = document.getElementById('regPass').value;
			$.post('/register', {email: userEmail, pass: userPass}, function(resp){
				if(resp == 'OK'){
					document.getElementById('regFail').setAttribute('style', 'display: none;');
					document.getElementById('passMismatch').setAttribute('style', 'display: none;');
					document.getElementById('regSuccess').innerText = 'Registration successful!';
					document.getElementById('regSuccess').setAttribute('style', 'color: blue;');
				} else{
					document.getElementById('passMismatch').setAttribute('style', 'display: none;');
					document.getElementById('regSuccess').setAttribute('style', 'display: none;');
					document.getElementById('regFail').innerText = resp;
					document.getElementById('regFail').setAttribute('style', 'color: red;')
				}
			});
		}
	});
});
//test comment
