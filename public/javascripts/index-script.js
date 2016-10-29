$(function(){
	// TODO: uncomment to show modal intro again (hidden for testing)
	// $('.bs-example-modal-lg').modal('show');

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
	var options = {};

	// initialize your network!
	var network = new vis.Network(container, data, options);

	$("#selectMajor").click(function(){
		$.get('/majors', function(resp){
			var list = document.getElementById('major-minor-list');
			for(var key in resp){
				var element = document.createElement('li');
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
				var element = document.createElement('li');
				element.innerText = resp[key];
				list.appendChild(element);
			}
		});
		$('.major-minor-modal-md').modal('show');
	});

	$(".major-minor-modal-md").on("hidden.bs.modal", function () {
    document.getElementById('major-minor-list').innerHTML = '';
	});
});
