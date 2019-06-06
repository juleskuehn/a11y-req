const express = require('express');
const router = express.Router();

// GET home page (currently a list of clauses)
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Accessible ICT Procurement Requirements Generator' });
});

module.exports = router;