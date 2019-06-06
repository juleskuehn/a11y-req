const express = require('express');
const router = express.Router();

// Require controller modules.
const edit_controller = require('../controllers/editController');
const clause_controller = require('../controllers/clauseController');
const info_controller = require('../controllers/infoController');

// GET edit (admin) page
router.get('/', edit_controller.edit_list);


/* Clauses */

// GET request for list of all Clauses
router.get('/clauses', clause_controller.clause_list);

// GET request for creating a Clause
router.get('/clause/create', clause_controller.clause_create_get);

// POST request for creating a Clause
router.post('/clause/create', clause_controller.clause_create_post);

// GET request to edit Clause
router.get('/clause/:id', clause_controller.clause_update_get);

// POST request to edit Clause
router.post('/clause/:id', clause_controller.clause_update_post);

// GET request to delete Clause
router.get('/clause/:id/delete', clause_controller.clause_delete_get);

// POST request to delete Clause
router.post('/clause/:id/delete', clause_controller.clause_delete_post);


/* Informative Sections */

// GET request for list of all Infos
router.get('/infos', info_controller.info_list);

// GET request for creating a Info
router.get('/info/create', info_controller.info_create_get);

// POST request for creating a Info
router.post('/info/create', info_controller.info_create_post);

// GET request to edit Info
router.get('/info/:id', info_controller.info_update_get);

// POST request to edit Info
router.post('/info/:id', info_controller.info_update_post);

// GET request to delete Info
router.get('/info/:id/delete', info_controller.info_delete_get);

// POST request to delete Info
router.post('/info/:id/delete', info_controller.info_delete_post);


module.exports = router;