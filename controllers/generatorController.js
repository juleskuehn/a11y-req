// NOTE: "clause" == "fps" (functional performance statement)

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

// Display the content of all clauses
exports.all_clauses = (req, res, next) => {
  Clause.find()
    .exec((err, list_clauses) => {
      if (err) { return next(err); }
      list_clauses = list_clauses.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
      res.render('all_clauses', { title: strings.allClausesTitle, item_list: list_clauses });
    });
};

exports.create_get = (req, res, next) => {
  async.parallel({
    clauses: (callback) => Clause.find().exec(callback),
    presets: (callback) => Preset.find().sort([['order', 'ascending']]).exec(callback)
  }, (err, results) => {
    if (err) { return next(err); }
    results.clauses = toClauseTree(results.clauses);
    res.render('select_fps', {
      title: strings.createTitle,
      item_tree: results.clauses,
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
    results.fps = results.fps.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
    res.render('all_requirements', {
      title: strings.generatedRequirementsTitle,
      item_list: results.fps,
      intro: results.intro,
      annex: results.annex
    });
  });
};

// Reformat clause array into nested dict (nested clauses in parents)
/*
tree = {
  '5': {
    clause: { number: '5' },
    'children': {
      '5.1': {
        clause: { number: '5.1' },
        'children': {
          '5.1.1': {
            clause: { number: '5.1.1' },
            children: {}
          }
        }
      }
    }
  }
}
*/
const toClauseTree = (clauses) => {

  clauses = clauses.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
  let clauseTree = {};

  for (clause of clauses) {
    let ancestry = clause.number.split(".");
    let ancestors = [];

    while (ancestry.length > 0) {
      ancestors.push(ancestry.join('.'));
      ancestry.pop();
    }

    ancestors.reverse();
    let treeIndex = '["' + ancestors.join('"]["children"]["') + '"]';
    let eString = `clauseTree` + treeIndex + ` = {
      'clause': clause,
      'children': {}
    }`;
    eval(eString);
  }

  // Convert children objects to sorted arrays
  // No need for keys as they are duplicated in clause.number
  const sortChildren = (tree) => {
    // Base case
    if (Object.keys(tree).length === 0 && tree.constructor === Object) {
      return [];
    }
    // Convert top level of tree to array and sort
    tree = Object.values(tree);
    tree.sort((a, b) => a.clause.number.localeCompare(b.clause.number, undefined, { numeric: true }));
    // Recurse on children of top level nodes
    for (node of tree) {
      node.children = sortChildren(node.children);
    }
    return tree;
  }

  return sortChildren(clauseTree);
};