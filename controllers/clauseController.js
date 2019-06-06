const async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const Clause = require('../models/clauseSchema');

const strings = {
  listTitle: 'Edit clauses',
  createTitle: 'Create clause',
  sectionTitleRequired: 'Clause title required'
}

// Display list of all Clauses
exports.clause_list = function (req, res, next) {
  Clause.find()
    .sort([['order', 'descending']])
    .exec(function (err, list_clauses) {
      if (err) { return next(err); }
      
      //Successful, so render
      res.render('item_list', { title: strings.listTitle, item_list: list_clauses, type: 'clause' });
    });
};

// Display clause create form on GET
exports.clause_create_get = function (req, res, next) {
  res.render('clause_form', { title: strings.createTitle });
};

// Handle Clause create on POST
exports.clause_create_post = [

  // Validate that the name field is not empty.
  body('name', strings.sectionTitleRequired).isLength({ min: 1 }).trim(),

  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    var clause = new Clause({
      name: req.body.name
    });

    if (!errors.isEmpty()) {
      // There are errors.
      res.render('clause_form', { title: strings.createTitle, clause: clause, errors: errors.array() });
      return;
    }
    else {
      // Data from form is valid.
      // Check if Clause with same name already exists.
      Clause.findOne({ 'name': req.body.name })
        .exec(function (err, found_clause) {
          if (err) { return next(err); }

          if (found_clause) {
            // Clause exists, redirect to its detail page.
            res.redirect(found_clause.url);
          }
          else {

            clause.save(function (err) {
              if (err) { return next(err); }
              // Clause saved. Redirect to clause detail page.
              res.redirect('/edit/clauses');
            });

          }

        });
    }
  }
];

// Display clause update form on GET
exports.clause_update_get = function (req, res, next) {

  // Get clause for form
  async.parallel({
    clause: function (callback) {
      Clause.findById(req.params.id)
        .exec(callback);
    },
  }, function (err, results) {
    if (err) { return next(err); }
    if (results.clause == null) { // No results.
      var err = new Error('Clause not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render('clause_form', { title: 'Edit clause', item: results.clause });
  });

};

// Handle clause update on POST.
exports.clause_update_post = [

  // Validate that the name field is not empty.
  body('name', 'Clause name required').isLength({ min: 1 }).trim(),

  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a clause object with escaped/trimmed data and old id.
    var clause = new Clause({
      name: req.body.name,
      _id: req.params.id //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. 
      res.render('clause_form', { title: 'Update clause', clause: clause, errors: errors.array() });
      return;
    }
    else {
      // Data from form is valid. Update the record.
      Clause.findByIdAndUpdate(req.params.id, clause, {}, function (err, theclause) {
        if (err) { return next(err); }
        // Successful - redirect to clause detail page.
        res.redirect('/edit/clauses');
      });
    }
  }
];


// Display Clause delete form on GET.
exports.clause_delete_get = function (req, res, next) {

  async.parallel({
    clause: function (callback) {
      Clause.findById(req.params.id).exec(callback)
    },
  }, function (err, results) {
    if (err) { return next(err); }
    if (results.clause == null) { // No results.
      res.redirect('/edit/clauses');
    }
    // Successful, so render.
    res.render('item_delete', { title: 'Delete Clause', item: results.clause });
  });

};

// Handle Clause delete on POST.
exports.clause_delete_post = function (req, res, next) {

  async.parallel({
    clause: function (callback) {
      Clause.findById(req.body.itemid).exec(callback)
    },
  }, function (err, results) {
    if (err) { return next(err); }
    // Success. Delete object and redirect to the list of clauses.
    Clause.findByIdAndRemove(req.body.itemid, function deleteClause(err) {
      if (err) { return next(err); }
      // Success - go to clause list
      res.redirect('/edit/clauses')
    })
  });
};