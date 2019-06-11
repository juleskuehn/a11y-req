const express = require('express');
const router = express.Router();

// GET home page (currently a list of clauses)
router.get('/', (req, res) => res.redirect('/view/create'));

module.exports = router;