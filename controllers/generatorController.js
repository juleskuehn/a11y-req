// NOTE: "clause" == "fps" (functional performance statement)

const async = require('async');
const mongoose = require('mongoose');

const Clause = require('../models/clauseSchema');
const Info = require('../models/infoSchema');
const Preset = require('../models/presetSchema');
const toClauseTree = require('./clauseTree');

const strings = {
  allInfosTitle: 'All informative sections',
  allClausesTitle: 'All functional accessibility requirements',
  generatorTitle: 'Generate requirements',
  createTitle: 'Select functional accessibility requirements',
  selectedClausesTitle: 'Selected functional accessibility requirements',
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

// Select functional accessibility requirements or preset
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
      test_list: getTestableClauses(results.fps),
      intro: results.intro,
      annex: results.annex,
      breadcrumbs: [
        { url: '/', text: 'Home' },
        { url: '/view/create', text: 'Select functional accessibility requirements' }
      ]
    });
  });
};

// Renders based on user's selected FPS to a downloadable HTML file for import in Word
exports.download_en = (req, res, next) => {
  download_full(req, res, next, {
    filename: 'ICT Accessibility Requirements.html',
    template: 'download_en',
    title: 'ICT Accessibility Requirements (Based on EN 301 549 – 2018)'
  });
}

exports.download_fr = (req, res, next) => {
  download_full(req, res, next, {
    filename: 'Exigences en matière de TIC accessibles.html',
    template: 'download_fr',
    title: 'Exigences en matière de TIC accessibles (basées sur la norme EN 301 549 – 2018)'
  });
}

// Renders based on user's selected FPS to a downloadable HTML file for import in Word
exports.onlyClauses_en = (req, res, next) => {
  download_full(req, res, next, {
    filename: 'ICT Accessibility Requirements - Short.html',
    template: 'onlyClauses_en',
    title: 'ICT Accessibility Requirements (Based on EN 301 549 – 2018)'
  });
}

exports.onlyClauses_fr = (req, res, next) => {
  download_full(req, res, next, {
    filename: 'Exigences en matière de TIC accessibles - brève.html',
    template: 'onlyClauses_fr',
    title: 'Exigences en matière de TIC accessibles (basées sur la norme EN 301 549 – 2018)'
  });
}

const download_full = (req, res, next, strings) => {
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
    res.attachment(strings.filename);
    res.render(strings.template, {
      title: strings.title,
      item_list: results.fps,
      test_list: getTestableClauses(results.fps),
      intro: results.intro,
      annex: results.annex
    });
  });
}

const getTestableClauses = (clauses) => 
  clauses.filter((clause) =>
    !clause.informative && clause.description.length > 0);