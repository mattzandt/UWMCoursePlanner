var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main-controller'); // require main.js file in controllers folder (external controller) so we can use its methods

/* GET home page. */
router.get('/', ctrlMain.index); // in route definition, references index method of the external controller file

/* GET list of majors */
router.get('/majors', ctrlMain.majors);

/* GET list of minors */
router.get('/minors', ctrlMain.minors);

/* GET curriculum */
router.get('/curriculum', ctrlMain.curriculum);

/* GET details for specific course */
router.get('/course', ctrlMain.course);

// POST login
router.post('/login', ctrlMain.login);

//POST logout
router.post('/logout', ctrlMain.logout);

//POST register
router.post('/register', ctrlMain.register);

//POST save plan
router.post('/savePlan', ctrlMain.savePlan);

//GET list of saved plan
router.get('/planNames', ctrlMain.planNames);

//GET plan
router.get('/getPlan', ctrlMain.getPlan);

//GET default plan for specified major
router.get('/defaultPlan', ctrlMain.defaultPlan);

//POST share plan to another user
router.post('/sharePlan', ctrlMain.sharePlan);

module.exports = router; // expose router constructor?
