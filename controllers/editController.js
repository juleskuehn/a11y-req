const async = require('async');

const Clause = require('../models/clauseSchema');
const Info = require('../models/infoSchema');

const strings = {
  editListTitle: 'Edit content'
}

// Display list of all Clauses
exports.edit_list = function (req, res, next) {
  res.render('edit', { title: strings.editListTitle });
};