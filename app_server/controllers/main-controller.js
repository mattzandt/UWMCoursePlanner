var firebase = require('firebase');

var config = {
  apiKey: "AIzaSyBMt3Dfq2_FGKpr73LVn74l2W0bNEb394c",
  authDomain: "uwm-course-planner-d42b0.firebaseapp.com",
  databaseURL: "https://uwm-course-planner-d42b0.firebaseio.com",
  storageBucket: "uwm-course-planner-d42b0.appspot.com",
  messagingSenderId: "938196517930"
};
firebase.initializeApp(config);

var firebaseRef = firebase.database().ref();

/* GET home page */
// module.exports exposes the named function index to routes
module.exports.index = function(req, res){
  firebaseRef.child('testCourses').once('value', function(snapshot){
	// res.render combines the view template file "/views/index.ejs" with the Javascript object to send as HTML response
    res.render('index', {courses : snapshot.val()});
  }, function(err){
      console.log(err);
  });
};

/* GET list of majors */
module.exports.majors = function(req, res){
  firebaseRef.child('majors').once('value', function(snapshot){
    res.json(snapshot.val());
  }, function(err){
    console.log(err);
  });
};

/* GET list of minors */
module.exports.minors = function(req, res){
  firebaseRef.child('minors').once('value', function(snapshot){
    res.json(snapshot.val());
  }, function(err){
    console.log(err);
  });
};

/* GET list of required courses */
module.exports.requiredCourses = function(req, res){
  firebaseRef.child('requiredCourses').once('value', function(snapshot){
    res.json(snapshot.val());
  }, function(err){
    console.log(err);
  });
};

/* GET list of courses */
module.exports.courses = function(req, res){
  firebaseRef.child('courses').once('value', function(snapshot){
    res.json(snapshot.val());
  }, function(err){
    console.log(err);
  });
};

// POST login
module.exports.login = function(req, res){
  firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.pass).then(function(){
    res.sendStatus(200);
  }, function(error){
    res.send(error.message);
  });
}

//POST logout
module.exports.logout = function(req, res){
  firebase.auth().signOut().then(function() {
    res.sendStatus(200);
  }, function(error){
    res.sendStatus(500);
  });
}

//POST register
module.exports.register = function(req, res){
  firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.pass).then(function() {
    res.sendStatus(200);
  }, function(error){
    res.send(error.message);
  });
}
