// NOTE: "clause" == "fps" (functional performance statement)

const async = require('async');
const mongoose = require('mongoose');

const Clause = require('../models/clauseSchema');
const Info = require('../models/infoSchema');
const Preset = require('../models/presetSchema');
const toClauseTree = require('./clauseTree');

const strings = {
  allInfosTitle: 'All informative sections',
  allClausesTitle: 'All functional performance statements',
  generatorTitle: 'Generate requirements',
  createTitle: 'Select functional performance statements',
  selectedClausesTitle: 'Selected functional performance statements',
  generatedRequirementsTitle: 'Generated requirements'
};

const breadcrumbs = [
  { url: '/', text: 'Home' }
];

exports.menu = (req, res, next) => {
  res.render('generator', {
    title: strings.generatorTitle,
    breadcrumbs: [
      { url: '/', text: 'Home' }
    ]
  });
};

// Display the content of all informative sections
exports.all_infos = (req, res, next) => {
  Info.find()
    .sort([['order', 'ascending']])
    .exec((err, list_infos) => {
      if (err) { return next(err); }
      res.render('all_infos', {
        title: strings.allInfosTitle,
        item_list: list_infos,
        breadcrumbs: breadcrumbs
      });
    });
};

// Display the content of all clauses
exports.all_clauses = (req, res, next) => {
  Clause.find()
    .exec((err, list_clauses) => {
      if (err) { return next(err); }
      list_clauses = list_clauses.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
      res.render('all_clauses', {
        title: strings.allClausesTitle,
        item_list: list_clauses,
        breadcrumbs: breadcrumbs
      });
    });
};

// Select functional performance statements or preset
exports.create_get = (req, res, next) => {
  async.parallel({
    clauses: (callback) => Clause.find().exec(callback),
    presets: (callback) => Preset.find().sort([['order', 'ascending']]).exec(callback)
  }, (err, results) => {
    if (err) { return next(err); }
    res.render('select_fps', {
      title: strings.createTitle,
      clause_tree: toClauseTree(results.clauses),
      preset_list: results.presets,
      breadcrumbs: breadcrumbs
    });
  });
};

// Renders output based on FPS selections to browser, along with download links
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
    results.fps = results.fps.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
    res.render('all_requirements', {
      title: strings.generatedRequirementsTitle,
      item_list: results.fps,
      intro: results.intro,
      annex: results.annex,
      breadcrumbs: [
        { url: '/', text: 'Home' },
        { url: '/view/create', text: 'Select functional performance statements'}
      ]
    });
  });
};

// Renders based on user's selected FPS to a downloadable HTML file for import in Word
exports.download_en = (req, res, next) => {

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
    results.fps = results.fps.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
    res.attachment('ICT Accessibility Requirements.html');
    res.render('download_en', {
      title: 'ICT Accessibility Requirements (Based on EN 301 549 – 2018)',
      item_list: results.fps,
      intro: results.intro,
      annex: results.annex
    });
  });
}

// Renders based on user's selected FPS to a downloadable HTML file for import in Word
exports.download_fr = (req, res, next) => {

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
    results.fps = results.fps.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
    res.attachment('Exigences en matière de TIC accessibles.html');
    res.render('download_fr', {
      title: 'Exigences en matière de TIC accessibles (basées sur la norme EN 301 549 – 2018)',
      item_list: results.fps,
      intro: results.intro,
      annex: results.annex
    });
  });
}