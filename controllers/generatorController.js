const async = require('async');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const Clause = require('../models/clauseSchema');
const Info = require('../models/infoSchema');

const strings = {
  allInfosTitle: 'All informative sections',
  allClausesTitle: 'All functional performance statements',
  generatorTitle: 'Generate requirements',
  createTitle: 'Select functional performance statements',
  selectedClausesTitle: 'Selected functional performance statements',
  generatedRequirementsTitle: 'Generated requirements'
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

exports.create_get = function (req, res, next) {
  Clause.find()
    .sort([['number', 'ascending']])
    .exec(function (err, list_clauses) {
      if (err) { return next(err); }

      //Successful, so render
      res.render('select_fps', { title: strings.createTitle, item_list: list_clauses });
    });
};

// Handle Clause create on POST
exports.create_post = [

  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors.
      res.redirect('/view/create');
      return;
    }
    else {
      // Data from form is valid
      // Get selected clauses
      let clause_ids = []
      if (typeof(req.body.clause) != typeof([])) {
        req.body.clause = [req.body.clause];
      }
      for (id of req.body.clause) {
        clause_ids.push(mongoose.Types.ObjectId(id));
      }
      async.parallel({
        fps: function (callback) {
          Clause.find({
            '_id': {
              $in: clause_ids
            }
          }).exec(callback);
        },
        intro: function (callback) {
          Info.find({name: /^(?!Annex).*/})
          .sort([['order', 'ascending']])
          .exec(callback);
        },
        annex: function (callback) {
          Info.find({name: /^Annex/})
          .sort([['order', 'ascending']])
          .exec(callback);
        },
      }, function (err, results) {
        if (err) { return next(err); }
        if (results.fps == null) { // No clauses selected
          res.redirect('/view/create');
        }
        // Successful, so render.
        res.render('all_requirements', { title: strings.generatedRequirementsTitle, item_list: results.fps, intro: results.intro, annex: results.annex });
      });
      // Clause.find({
      //   '_id': {
      //     $in: clause_ids
      //   }
      // }, function (err, list_clauses) {
      //   if (err) { return next(err); }
      //   //Successful, so render
      //   res.render('all_clauses', { title: strings.selectedClausesTitle, item_list: list_clauses });

      // });
    }
  }
];