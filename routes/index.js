var express = require('express');
var router = express.Router();
var ctrlCourses = require('../controllers/courses');

router.get('/', ctrlCourses.courses);

module.exports = router;
