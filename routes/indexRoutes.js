const express = require('express');
const router = express.Router();

// GET home page (currently a list of clauses)
// router.get('/', function (req, res, next) {
//   res.render('index', { title: 'Accessible ICT Procurement Requirements Generator' });
// });

const generator_controller = require('../controllers/generatorController');

// GET home page (currently shows all infos)
router.get('/', generator_controller.all_infos);

module.exports = router;