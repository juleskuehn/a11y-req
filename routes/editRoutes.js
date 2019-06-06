const express = require('express');
const router = express.Router();

// Require controller modules.
const clause_controller = require('../controllers/clauseController');

// GET edit (admin) page (currently a list of clauses)
router.get('/', clause_controller.clause_list);

// GET request for creating a Clause
router.get('/clause/create', clause_controller.clause_create_get);

// POST request for creating a Clause
router.post('/clause/create', clause_controller.clause_create_post);

// GET request to delete Clause
router.get('/clause/:id/delete', clause_controller.clause_delete_get);

// POST request to delete Clause
router.post('/clause/:id/delete', clause_controller.clause_delete_post);

// GET request to update Clause
router.get('/clause/:id/update', clause_controller.clause_update_get);

// POST request to update Clause
router.post('/clause/:id/update', clause_controller.clause_update_post);

// GET request for one Clause
router.get('/clause/:id', clause_controller.clause_detail);

// GET request for list of all Clauses
router.get('/clauses', clause_controller.clause_list);

module.exports = router;