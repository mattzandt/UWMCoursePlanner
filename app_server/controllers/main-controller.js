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

/* GET curriculum for specific major */
module.exports.curriculum = function(req, res){
  firebaseRef.child('curriculum').child(req.query.major).once('value', function(snapshot){
    if (snapshot.val() == null){
      res.sendStatus(204);
    }else{
      res.json(snapshot.val());
    }
  }, function(err){
    console.log(err);
    res.sendStatus(500);
  });
};

/* GET details of a specific course */
module.exports.course = function(req, res){
  console.log(req.query.key);
  firebaseRef.child('courses').child(req.query.key).once('value', function(snapshot){
    if(snapshot.val() == null){
      res.sendStatus(204);
    }else{
      res.json(snapshot.val());
    }
  }, function(err){
    console.log(err);
    res.sendStatus(500);
  });
};

// POST login
module.exports.login = function(req, res){
  firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.pass).then(function(){
    var exists = false;
    firebaseRef.child('users').once('value', function(snapshot){
      snapshot.forEach(function (snap){
        if (snap.val() == req.body.email) {
          exists = true;
        }
      });
      if(exists == false){
        var uid = firebase.auth().currentUser.uid;
        firebaseRef.child('users').child(uid).set(req.body.email);
      }
    });
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

//POST save a plan
module.exports.savePlan = function(req, res){
  var plansRef = firebaseRef.child("savedPlans");
  var uid = firebase.auth().currentUser.uid;
  if (uid != null){
    console.log('Saving plan named ' + req.body.planName + ' for ' + uid + '...');
    plansRef.child(uid).child(req.body.planName).update({
      'nodes' : req.body.nodes,
      'edges' : req.body.edges,
	  'model' : req.body.model
    });
    var exists = false;
    plansRef.child(uid).child('planNames').once('value', function(snapshot){
      snapshot.forEach(function (snap){
        if (snap.val() == req.body.planName) {
          exists = true;
        }
      });
      if (exists == false) {
        plansRef.child(uid).child('planNames').push(req.body.planName);
      }
    });
    res.sendStatus(200);
  }else {
    console.log('failed to get current user');
    res.sendStatus(500);
  }
}

// GET retrieve list of plans from database
module.exports.planNames = function(req, res){
  var uid = firebase.auth().currentUser.uid;
  var plansRef = firebaseRef.child('savedPlans');
  plansRef.once('value', function(snap){
    if(!(snap.hasChild(uid)) || !(snap.child(uid).hasChild('planNames'))){
      res.sendStatus(204);
    }else{
      if (uid != null){
        var planNames = [];
        plansRef.child(uid).child('planNames').once('value', function(snapshot){
          res.json(snapshot.val());
        });
      }
    }
  });
}

//GET plan
module.exports.getPlan = function(req, res){
  var uid = firebase.auth().currentUser.uid;
  var plansRef = firebaseRef.child('savedPlans');
  console.log(req.query.planName);
  plansRef.once('value', function(snap){
    if(!(snap.hasChild(uid)) || !(snap.child(uid).child(req.query.planName))){
      res.sendStatus(204);
    }else{
      plansRef.child(uid).child(req.query.planName).once('value', function(snap){
        res.json(snap.val());
      });
    }
  });
}

// GET default plan for majors
module.exports.defaultPlan = function(req, res){
  firebaseRef.child('defaultPlans').child(req.query.major).once('value', function(snap){
    if (snap.val() == null){
      res.sendStatus(204);
    }else{
      res.json(snap.val());
    }
  }, function(error){
    console.log(error);
    res.sendStatus(500);
  });
}

// SHARE plan
module.exports.sharePlan = function(req, res){
  var uid;
  console.log(req.body.email);
  firebase.auth().fetchProvidersForEmail(req.body.email).then(function(result){
    if(result.length == 0){
      res.sendStatus(204);
    }else{
      console.log('here3');
      firebaseRef.child('users').once('value', function(snap){
        console.log('here1');
        snap.forEach(function (snap){
          console.log(snap.val());
          if (snap.val() == req.body.email) {
            firebaseRef.child('savedPlans').child(snap.key).child(req.body.planName).update({
				'nodes' : req.body.nodes,
				'edges' : req.body.edges,
				'model' : req.body.model});
            firebaseRef.child('savedPlans').child(snap.key).child('planNames').child('sharedNames').push(req.body.planName);
          }
        });
      });
      res.sendStatus(200);
    }
  }, function(error){
    res.sendStatus(204);
  });
}
