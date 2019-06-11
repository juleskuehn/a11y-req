const async = require('async');

const Clause = require('../models/clauseSchema');
const Preset = require('../models/presetSchema.js');

const strings = {
  listTitle: 'Edit clauses',
  createTitle: 'Create clause',
  clauseNameRequired: 'Clause name required',
  clauseNumberRequired: 'Clause number required',
  deleteClause: 'Delete clause',
  editClause: 'Edit clause',
  clauseNotFound: 'Clause not found',
  updateClause: 'Update clause'
}

// Display list of all Clauses
exports.clause_list = (req, res, next) => {
  Clause.find()
    .sort([['number', 'ascending']])
    .exec((err, list_clauses) => {
      if (err) { return next(err); }
      res.render('clause_list', { title: strings.listTitle, item_list: list_clauses });
    });
};

// Display clause create form on GET
exports.clause_create_get = (req, res, next) => {
  res.render('clause_form', { title: strings.createTitle });
};

// Handle Clause create on POST
exports.clause_create_post = (req, res, next) => {

  let clause = new Clause({
    number: req.body.number,
    name: req.body.name,
    frName: req.body.frName,
    informative: req.body.informative === 'on',
    description: req.body.description,
    frDescription: req.body.frDescription,
    compliance: req.body.compliance,
    frCompliance: req.body.frCompliance
  });

  // Check if Clause with same name already exists.
  Clause.findOne({ 'number': req.body.number }).exec((err, found_clause) => {
    if (err) { return next(err); }
    if (found_clause) {
      // Clause exists, redirect to its detail page.
      res.redirect(found_clause.url);
    } else {
      clause.save((err) => {
        if (err) { return next(err); }
        // Clause saved. Redirect to clause list.
        res.redirect('/edit/clauses');
      });
    }
  });
};

// Display clause update form on GET
exports.clause_update_get = (req, res, next) => {

  // Get clause for form
  async.parallel({
    clause: (callback) => Clause.findById(req.params.id).exec(callback)
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.clause == null) { // No results
      let err = new Error(strings.clauseNotFound);
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render('clause_form', { title: strings.editClause, item: results.clause });
  });
};

// Handle clause update on POST.
exports.clause_update_post = (req, res, next) => {

  // Create a clause object with old id.
  let clause = new Clause({
    number: req.body.number,
    name: req.body.name,
    frName: req.body.frName,
    informative: req.body.informative === 'on',
    description: req.body.description,
    frDescription: req.body.frDescription,
    compliance: req.body.compliance,
    frCompliance: req.body.frCompliance,
    _id: req.params.id // This is required, or a new ID will be assigned
  });

  Clause.findByIdAndUpdate(req.params.id, clause, {}, (err, theclause) => {
    if (err) { return next(err); }
    res.redirect('/edit/clauses'); // Success: redirect to clause list.
  });
};

// Display Clause delete form on GET.
exports.clause_delete_get = (req, res, next) => {
  async.parallel({
    clause: (callback) => Clause.findById(req.params.id).exec(callback)
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.clause == null) { res.redirect('/edit/clauses'); }
    res.render('item_delete', { title: strings.deleteClause, item: results.clause });
  });
};

// Handle Clause delete on POST.
exports.clause_delete_post = (req, res, next) => {

  async.parallel({
    clause: (callback) =>
      Clause.findById(req.body.itemid).exec(callback),
    clause_presets: (callback) =>
      Preset.find({ clauses: req.body.itemid }).exec(callback)
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.clause_presets.length > 0) {
      // Clause has presets referencing it which must be deleted first
      res.render('item_delete', {
        title: strings.deleteClause,
        item: results.clause,
        dependencies: results.clause_presets
      });
      return;
    }

    // Delete object and redirect to the list of clauses
    Clause.findByIdAndRemove(req.body.itemid, (err) => {
      if (err) { return next(err); }
      res.redirect('/edit/clauses'); // Success - go to clause list
    })
  });
};