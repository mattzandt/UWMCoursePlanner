var firebase = require('firebase');

var config = {
  apiKey: "AIzaSyBMt3Dfq2_FGKpr73LVn74l2W0bNEb394c",
  authDomain: "uwm-course-planner-d42b0.firebaseapp.com",
  databaseURL: "https://uwm-course-planner-d42b0.firebaseio.com",
  storageBucket: "uwm-course-planner-d42b0.appspot.com",
  messagingSenderId: "938196517930"
};
firebase.initializeApp(config);

/* GET home page */
// module.exports exposes the named function index to routes
module.exports.index = function(req, res){
  firebase.database().ref().child('testCourses').once('value', function(snapshot){
	// res.render combines the view template file "/views/index.ejs" with the Javascript object to send as HTML response
    res.render('index', {courses : snapshot.val()});
  }, function(err){
      console.log(err);
  });
};
