const express = require('express');
const router = express.Router();

const generator_controller = require('../controllers/generatorController');

// GET home page (currently shows all infos)
router.get('/', generator_controller.all_infos);

module.exports = router;