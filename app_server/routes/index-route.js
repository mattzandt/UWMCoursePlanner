var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main-controller'); // require main.js file in controllers folder (external controller) so we can use its methods

/* GET home page. */
router.get('/', ctrlMain.index); // in route definition, references index method of the external controller file

/* GET list of majors */
router.get('/majors', ctrlMain.majors);

/* GET list of minors */
router.get('/minors', ctrlMain.minors);

// POST login
router.post('/login', ctrlMain.login);

//POST logout
router.post('/logout', ctrlMain.logout);

//POST register
router.post('/register', ctrlMain.register);

module.exports = router; // expose router constructor?
