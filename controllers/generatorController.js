// NOTE: "clause" == "fps" (functional performance statement)

const async = require('async');
const mongoose = require('mongoose');
const HtmlDocx = require('html-docx-js');

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
  generatedRequirementsTitle: 'Generated requirements',
  wizardTitle: 'Requirement selection wizard'
};

const breadcrumbs = [
  { url: '/', text: 'Home' }
];

// Select functional accessibility requirements or preset
exports.wizard_get = (req, res, next) => {
  async.parallel({
    clauses: (callback) => Clause.find().exec(callback)
  }, (err, results) => {
    if (err) { return next(err); }
    res.render('wizard', {
      title: strings.wizardTitle,
      clause_tree: toClauseTree(results.clauses)
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
      preset_list: results.presets
    });
  });
};

// Renders download links for various output formats
exports.create_post = (req, res, next) => {

  // Edge case: < 2 clauses selected
  if (!(req.body.clauses instanceof Array)) {
    if (typeof req.body.clauses === 'undefined') {
      req.body.clauses = [];
    } else {
      req.body.clauses = new Array(req.body.clauses);
    }
  }

  res.render('download_chooser', {
    title: strings.generatedRequirementsTitle,
    clause_list: req.body.clauses,
    breadcrumbs: breadcrumbs
  });

};

// Renders based on user's selected FPS to a downloadable Word file
exports.download_full_en = (req, res, next) => {
  download(req, res, next, {
    filename: 'ICT Accessibility Requirements.docx',
    template: 'download_full_en',
    title: 'ICT Accessibility Requirements (Based on EN 301 549 – 2018)'
  });
}

exports.download_full_fr = (req, res, next) => {
  download(req, res, next, {
    filename: 'Exigences en matière de TIC accessibles.docx',
    template: 'download_full_fr',
    title: 'Exigences en matière de TIC accessibles (basées sur la norme EN 301 549 – 2018)'
  });
}

// Renders based on user's selected FPS to a downloadable Word file
exports.download_test_table_en = (req, res, next) => {
  download(req, res, next, {
    filename: 'ICT Accessibility Requirements.docx',
    template: 'download_test_table_en',
    title: 'ICT Accessibility Requirements (Based on EN 301 549 – 2018)'
  });
}

exports.download_test_table_fr = (req, res, next) => {
  download(req, res, next, {
    filename: 'Exigences en matière de TIC accessibles.docx',
    template: 'download_test_table_fr',
    title: 'Exigences en matière de TIC accessibles (basées sur la norme EN 301 549 – 2018)'
  });
}

// Renders based on user's selected FPS to a downloadable Word file
exports.download_clause_details_en = (req, res, next) => {
  download(req, res, next, {
    filename: 'ICT Accessibility Requirements.docx',
    template: 'download_clause_details_en',
    title: 'ICT Accessibility Requirements (Based on EN 301 549 – 2018)'
  });
}

exports.download_clause_details_fr = (req, res, next) => {
  download(req, res, next, {
    filename: 'Exigences en matière de TIC accessibles.docx',
    template: 'download_clause_details_fr',
    title: 'Exigences en matière de TIC accessibles (basées sur la norme EN 301 549 – 2018)'
  });
}

// Renders based on user's selected FPS to a downloadable Word file
exports.download_clause_list_en = (req, res, next) => {
  download(req, res, next, {
    filename: 'ICT Accessibility Requirements.docx',
    template: 'download_clause_list_en',
    title: 'ICT Accessibility Requirements (Based on EN 301 549 – 2018)'
  });
}

exports.download_clause_list_fr = (req, res, next) => {
  download(req, res, next, {
    filename: 'Exigences en matière de TIC accessibles.docx',
    template: 'download_clause_list_fr',
    title: 'Exigences en matière de TIC accessibles (basées sur la norme EN 301 549 – 2018)'
  });
}

exports.download = (req, res, next) => {
  let strings = { template: req.params.template };
  if (req.params.template.slice(-2) === 'fr') {
    strings.filename = 'Exigences en matière de TIC accessibles.docx';
    strings.title = 'Exigences en matière de TIC accessibles (basées sur la norme EN 301 549 – 2018)';
  } else {
    strings.filename = 'ICT Accessibility Requirements.docx';
    strings.title = 'ICT Accessibility Requirements (Based on EN 301 549 – 2018)';
  }
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
    },
    (err, output) => {
      res.send(HtmlDocx.asBlob(output, {
        orientation: 'landscape',
        margins: {}
      }));
    });
  });
}

const getTestableClauses = (clauses) => 
  clauses.filter((clause) =>
    !clause.informative && clause.description.length > 0);