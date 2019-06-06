const async = require('async');

const Clause = require('../models/clauseSchema');
const Info = require('../models/infoSchema');

const strings = {
  allInfosTitle: 'All informative sections',
  allClausesTitle: 'All functional performance statements',
  generatorTitle: 'View contents'
};

exports.menu = function (req, res, next) {
  res.render('generator', { title: strings.generatorTitle });
};

// Display the content of all informative sections
exports.all_infos = function (req, res, next) {
  Info.find()
    .sort([['order', 'ascending']])
    .exec(function (err, list_infos) {
      if (err) { return next(err); }

      //Successful, so render
      res.render('all_infos', { title: strings.allInfosTitle, item_list: list_infos });
    });
};

// Display the content of all informative sections
exports.all_clauses = function (req, res, next) {
  Clause.find()
    .sort([['number', 'ascending']])
    .exec(function (err, list_clauses) {
      if (err) { return next(err); }

      //Successful, so render
      res.render('all_clauses', { title: strings.allClausesTitle, item_list: list_clauses });
    });
};