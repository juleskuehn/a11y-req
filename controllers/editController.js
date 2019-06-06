const async = require('async');

const Clause = require('../models/clauseSchema');
const Info = require('../models/infoSchema');

// Display list of all Clauses
exports.edit_list = function (req, res, next) {
  res.render('index', { title: 'Edit content' });
};