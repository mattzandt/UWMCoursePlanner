var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main'); // require main.js file in controllers folder (external controller) so we can use its methods

/* GET home page. */
router.get('/', ctrlMain.index); // in route definition, references index method of the external controller file

/* GET list of majors */
router.get('/majors', ctrlMain.majors);

/* GET list of minors */
router.get('/minors', ctrlMain.minors);

module.exports = router; // expose router constructor?
