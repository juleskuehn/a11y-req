const express = require('express');
const router = express.Router();

const generator_controller = require('../controllers/generatorController');

router.get('/', generator_controller.menu);

router.get('/infos', generator_controller.all_infos);

router.get('/clauses', generator_controller.all_clauses);

module.exports = router;