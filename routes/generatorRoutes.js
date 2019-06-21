const express = require('express');
const router = express.Router();

const generator_controller = require('../controllers/generatorController');

router.get('/', generator_controller.menu);

router.get('/infos', generator_controller.all_infos);

router.get('/clauses', generator_controller.all_clauses);

router.get('/create', generator_controller.create_get);

router.post('/create', generator_controller.create_post);

router.post('/download-en', generator_controller.download_en);

router.post('/download-fr', generator_controller.download_fr);

module.exports = router;