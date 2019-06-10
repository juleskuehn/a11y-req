const async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const Preset = require('../models/presetSchema');
const Clause = require('../models/clauseSchema');

const strings = {
  listTitle: 'Edit commodity presets',
  createTitle: 'Create commodity preset',
  presetNameRequired: 'Preset name required'
}

// Display list of all Presets
exports.preset_list = function (req, res, next) {
  Preset.find()
    .sort([['order', 'ascending']])
    .exec(function (err, list_presets) {
      if (err) { return next(err); }

      //Successful, so render
      res.render('item_list', { title: strings.listTitle, item_list: list_presets, type: 'preset' });
    });
};

// Display preset create form on GET
exports.preset_create_get = function (req, res, next) {
  Clause.find()
    .sort([['number', 'ascending']])
    .exec(function (err, list_fps) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('preset_form', { title: strings.createTitle, item_list: list_fps });
    });
};

// Handle Preset create on POST
exports.preset_create_post = [

  // Validate that the name field is not empty.
  body('name', strings.presetNameRequired).isLength({ min: 1 }).trim(),

  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Edge case: < 2 clauses selected
    if (!(req.body.clauses instanceof Array)) {
      if (typeof req.body.clauses === 'undefined')
        req.body.clauses = [];
      else
        req.body.clauses = new Array(req.body.clauses);
    }

    var preset = new Preset({
      name: req.body.name,
      frName: req.body.frName,
      description: req.body.description,
      frDescription: req.body.frDescription,
      clauses: req.body.clauses,
      order: req.body.order
    });

    if (!errors.isEmpty()) {
      // There are errors.
      Clause.find()
        .sort([['number', 'ascending']])
        .exec(function (err, list_fps) {
          if (err) { return next(err); }
          //Successful, so render
          res.render('preset_form', { title: strings.createTitle, item_list: list_fps, errors: errors.array() });
        });
    } else {
      // Data from form is valid.
      // Check if Preset with same name already exists.
      Preset.findOne({ 'name': req.body.name })
        .exec(function (err, found_preset) {
          if (err) { return next(err); }
          if (found_preset) { res.redirect(found_preset.url); }
          else {
            preset.save(function (err) {
              if (err) { return next(err); }
              // Preset saved. Redirect to preset detail page.
              res.redirect('/edit/presets');
            });
          }
        });
    }
  }
];

// Display preset update form on GET
exports.preset_update_get = function (req, res, next) {

  // Get preset for form
  async.parallel({
    preset: function (callback) {
      Preset.findById(req.params.id)
        .exec(callback);
    },
    clauses: function (callback) {
      Clause.find()
        .sort([['number', 'ascending']])
        .exec(callback);
    },
  }, function (err, results) {
    if (err) { return next(err); }
    if (results.preset == null) { // No results.
      var err = new Error('Preset not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render('preset_form', { title: 'Edit preset', item: results.preset, item_list: results.clauses });
  });

};

// Handle preset update on POST.
exports.preset_update_post = [

  // Validate that the name field is not empty.
  body('name', 'Preset name required').isLength({ min: 1 }).trim(),
  body('frName', 'French preset name required').isLength({ min: 1 }).trim(),

  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Edge case: < 2 clauses selected
    if (!(req.body.clauses instanceof Array)) {
      if (typeof req.body.clauses === 'undefined')
        req.body.clauses = [];
      else
        req.body.clauses = new Array(req.body.clauses);
    }

    // Create a preset object with escaped/trimmed data and old id.
    var preset = new Preset({
      name: req.body.name,
      frName: req.body.frName,
      description: req.body.description,
      frDescription: req.body.frDescription,
      clauses: req.body.clauses,
      order: req.body.order,
      _id: req.params.id //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. 
      res.render('preset_form', { title: 'Update preset', preset: preset, errors: errors.array() });
      return;
    } else {
      // Data from form is valid. Update the record.
      Preset.findByIdAndUpdate(req.params.id, preset, {}, function (err, thepreset) {
        if (err) { return next(err); }
        // Successful - redirect to preset detail page.
        res.redirect('/edit/presets');
      });
    }
  }
];


// Display Preset delete form on GET.
exports.preset_delete_get = function (req, res, next) {
  async.parallel({
    preset: function (callback) {
      Preset.findById(req.params.id).exec(callback)
    },
  }, function (err, results) {
    if (err) { return next(err); }
    if (results.preset == null) { // No results.
      res.redirect('/edit/presets');
    }
    // Successful, so render.
    res.render('item_delete', { title: 'Delete Preset', item: results.preset });
  });
};

// Handle Preset delete on POST.
exports.preset_delete_post = function (req, res, next) {
  async.parallel({
    preset: function (callback) {
      Preset.findById(req.body.itemid).exec(callback)
    },
  }, function (err, results) {
    if (err) { return next(err); }
    // Success. Delete object and redirect to the list of presets.
    Preset.findByIdAndRemove(req.body.itemid, function deletePreset(err) {
      if (err) { return next(err); }
      // Success - go to preset list
      res.redirect('/edit/presets')
    })
  });
};