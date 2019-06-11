const async = require('async');
const mongoose = require('mongoose');

const Clause = require('../models/clauseSchema');
const Info = require('../models/infoSchema');
const Preset = require('../models/presetSchema')

const strings = {
  allInfosTitle: 'All informative sections',
  allClausesTitle: 'All functional performance statements',
  generatorTitle: 'Generate requirements',
  createTitle: 'Select functional performance statements',
  selectedClausesTitle: 'Selected functional performance statements',
  generatedRequirementsTitle: 'Generated requirements'
};

exports.menu = (req, res, next) => {
  res.render('generator', { title: strings.generatorTitle });
};

// Display the content of all informative sections
exports.all_infos = (req, res, next) => {
  Info.find()
    .sort([['order', 'ascending']])
    .exec((err, list_infos) => {
      if (err) { return next(err); }
      res.render('all_infos', { title: strings.allInfosTitle, item_list: list_infos });
    });
};

// Display the content of all informative sections
exports.all_clauses = (req, res, next) => {
  Clause.find()
    .sort([['number', 'ascending']])
    .exec((err, list_clauses) => {
      if (err) { return next(err); }
      res.render('all_clauses', { title: strings.allClausesTitle, item_list: list_clauses });
    });
};

exports.create_get = (req, res, next) => {
  async.parallel({
    clauses: (callback) => Clause.find().sort([['number', 'ascending']]).exec(callback),
    presets: (callback) => Preset.find().sort([['order', 'ascending']]).exec(callback)
  }, (err, results) => {
    if (err) { return next(err); }
    res.render('select_fps', {
      title: strings.createTitle,
      item_list: results.clauses,
      preset_list: results.presets
    });
  });
};

// Handle Clause create on POST
exports.create_post = (req, res, next) => {

  // Edge case: < 2 clauses selected
  if (!(req.body.clauses instanceof Array)) {
    if (typeof req.body.clauses === 'undefined') {
      req.body.clauses = [];
    } else {
      req.body.clauses = new Array(req.body.clauses);
    }
  }

  let clause_ids = [];
  for (id of req.body.clauses) {
    clause_ids.push(mongoose.Types.ObjectId(id));
  }

  async.parallel({
    fps: (callback) => Clause.find({ '_id': { $in: clause_ids } }).exec(callback),
    intro: (callback) => {
      // Find sections with names NOT starting with "Annex"
      Info.find({ name: /^(?!Annex).*/ })
        .sort([['order', 'ascending']])
        .exec(callback);
    },
    annex: (callback) => {
      // Find sections with names starting with "Annex"
      Info.find({ name: /^Annex/ })
        .sort([['order', 'ascending']])
        .exec(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.fps == null) { // No clauses selected
      res.redirect('/view/create');
    }
    res.render('all_requirements', {
      title: strings.generatedRequirementsTitle,
      item_list: results.fps,
      intro: results.intro,
      annex: results.annex
    });
  });
};