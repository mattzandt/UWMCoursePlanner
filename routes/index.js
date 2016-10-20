var express = require('express');
var firebase = require('firebase');
var router = express.Router();

var config = {
  apiKey: "AIzaSyBMt3Dfq2_FGKpr73LVn74l2W0bNEb394c",
  authDomain: "uwm-course-planner-d42b0.firebaseapp.com",
  databaseURL: "https://uwm-course-planner-d42b0.firebaseio.com",
  storageBucket: "uwm-course-planner-d42b0.appspot.com",
  messagingSenderId: "938196517930"
};
firebase.initializeApp(config);

/* GET home page. */
// Test route
router.get('/', function(req, res, next) {
  firebase.database().ref().child('testCourses').once('value', function(snapshot){
    res.json(snapshot.val());
  }, function(err){
      console.log(err);
  });
});

//GET majors

//

module.exports = router;
