var firebase = require('firebase');

var config = {
  apiKey: "AIzaSyBMt3Dfq2_FGKpr73LVn74l2W0bNEb394c",
  authDomain: "uwm-course-planner-d42b0.firebaseapp.com",
  databaseURL: "https://uwm-course-planner-d42b0.firebaseio.com",
  storageBucket: "uwm-course-planner-d42b0.appspot.com",
  messagingSenderId: "938196517930"
};
firebase.initializeApp(config);

module.exports.courses = function(req, res){
  firebase.database().ref().child('testCourses').once('value', function(snapshot){
    res.render('index', {courses : snapshot.val()});
  }, function(err){
      console.log(err);
  });
};
