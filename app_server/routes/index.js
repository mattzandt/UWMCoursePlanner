var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main'); // require main.js file in controllers folder (external controller) so we can use its methods

/* GET home page. */
router.get('/', ctrlMain.index); // in route definition, references index method of the external controller file

module.exports = router; // expose router constructor?
