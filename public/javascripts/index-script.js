$(function(){
	// TODO: uncomment to show modal intro again (hidden for testing)

	var nodes = new vis.DataSet([
		{id: 1, label: 'Node 1'},
		{id: 2, label: 'Node 2'},
		{id: 3, label: 'Node 3'},
		{id: 4, label: 'Node 4'},
		{id: 5, label: 'Node 5'}
	]);

	// create an array with edges
	var edges = new vis.DataSet([
		{from: 1, to: 3},
		{from: 1, to: 2},
		{from: 2, to: 4},
		{from: 2, to: 5}
	]);

	// create a network
	var container = document.getElementById('mynetwork');

	// provide the data in the vis format
	var data = {
		nodes: nodes,
		edges: edges
	};

	var options = {
		layout: {
	    randomSeed: undefined,
	    improvedLayout:true,
	    hierarchical: {
	      enabled:true,
	      levelSeparation: 150,
	      nodeSpacing: 100,
	      treeSpacing: 200,
	      blockShifting: true,
	      edgeMinimization: true,
	      parentCentralization: false,
	      direction: 'LR',        // UD, DU, LR, RL
	      sortMethod: 'hubsize'   // hubsize, directed
	    }
	  }
	};

	// initialize your network!
	var network = new vis.Network(container, data, options);
	var options = {

		physics: {
			enabled: true,
			hierarchicalRepulsion: {
				nodeDistance: 35
			}
		}
	}
	network.setOptions(options);

	// ***MAJOR/MINOR SELECTION**
	$("#selectMajor").click(function(){
		$.get('/majors', function(resp){
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

	// ***LOGIN/LOGOUT***
	$('#submitLogin').click(function(){
		$.post('/login', { email: document.getElementById('loginEmail').value, pass: document.getElementById('loginPass').value }, function(resp){
			if (resp == 'OK') {
				document.getElementById('loginFailed').setAttribute('style', 'display: none;');
				$('.login-modal').modal('hide');
				document.getElementById('loginBtn').setAttribute('style', 'display: none;');
				document.getElementById('logoutBtn').setAttribute('style', '');
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

	$('#logoutBtn').click(function(){
		$.post('/logout', function(resp){
			if(resp == 'OK'){
				document.getElementById('logoutBtn').setAttribute('style', 'display: none;');
				document.getElementById('loginBtn').setAttribute('style', '');
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
