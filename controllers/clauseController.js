const async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const Clause = require('../models/clauseSchema');

// Display list of all Clauses
exports.clause_list = function (req, res, next) {
  Clause.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_clauses) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('clause_list', { title: 'Clause List', clause_list: list_clauses });
    });
};

// Display detail page for a specific Clause
// Using async so that functionality can be extended later (find parent, etc)
exports.clause_detail = function (req, res, next) {
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
    // Successful, so render
    res.render('clause_detail', { title: 'Clause Detail', clause: results.clause });
  });
};

// Display clause create form on GET
exports.clause_create_get = function (req, res, next) {
  res.render('clause_form', { title: 'Create Clause' });
};

// Handle Clause create on POST
exports.clause_create_post = [

  // Validate that the name field is not empty.
  body('name', 'Clause name required').isLength({ min: 1 }).trim(),

  // Sanitize (escape) the name field.
  sanitizeBody('name').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a clause object with escaped and trimmed data.
    var clause = new Clause(
      { name: req.body.name }
    );

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('clause_form', { title: 'Create Clause', clause: clause, errors: errors.array() });
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
              res.redirect(clause.url);
            });

          }

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
      res.redirect('/clauses');
    }
    // Successful, so render.
    res.render('clause_delete', { title: 'Delete Clause', clause: results.clause });
  });

};

// Handle Clause delete on POST.
exports.clause_delete_post = function (req, res, next) {

  async.parallel({
    clause: function (callback) {
      Clause.findById(req.body.clauseid).exec(callback)
    },
  }, function (err, results) {
    if (err) { return next(err); }
    // Success. Delete object and redirect to the list of clauses.
    Clause.findByIdAndRemove(req.body.clauseid, function deleteClause(err) {
      if (err) { return next(err); }
      // Success - go to clause list
      res.redirect('/clauses')
    })
  });
};

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
    res.render('clause_form', { title: 'Update clause', clause: results.clause });
  });

};

// Handle clause update on POST.
exports.clause_update_post = [

  // Validate that the name field is not empty.
  body('name', 'Clause name required').isLength({ min: 1 }).trim(),

  // Sanitize (escape) the name field.
  sanitizeBody('name').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a clause object with escaped/trimmed data and old id.
    var clause = new Clause({
      name: req.body.name,
      _id: req.params.id //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render('clause_form', { title: 'Update clause', clause: clause, errors: errors.array() });
      return;
    }
    else {
      // Data from form is valid. Update the record.
      Clause.findByIdAndUpdate(req.params.id, clause, {}, function (err, theclause) {
        if (err) { return next(err); }
        // Successful - redirect to clause detail page.
        res.redirect(theclause.url);
      });
    }
  }
];