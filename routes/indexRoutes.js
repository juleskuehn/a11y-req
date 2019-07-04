const express = require('express');
const router = express.Router();

// GET home page (currently a list of clauses)
router.get('/', (req, res) => res.render('index', {title: 'ICT Accessibility Requirements Generator'}));

module.exports = router;