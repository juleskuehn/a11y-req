// NOTE: "clause" == "fps" (functional performance statement)

const async = require('async');
const mongoose = require('mongoose');
const HtmlDocx = require('html-docx-js');

const Clause = require('../models/clauseSchema');
const Info = require('../models/infoSchema');
const toClauseTree = require('./clauseTree');

const getTestableClauses = (clauses) => 
  clauses.filter((clause) =>
    !clause.informative && clause.description.length > 0);

// Select functional accessibility requirements or preset
exports.wizard_get = (req, res, next) => {
  async.parallel({
    clauses: (callback) => Clause.find().exec(callback)
  }, (err, results) => {
    if (err) { return next(err); }
    res.render('wizard', {
      title: 'ICT accessibility requirements wizard',
      clause_tree: toClauseTree(results.clauses)
    });
  });
};

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
        orientation: req.body.orientation,
        margins: {
          top: 1304,
          bottom: 1304,
          left: 1134,
          right: 1134
        }
      }));
    });
  });
}