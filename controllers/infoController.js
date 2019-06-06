const async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const Info = require('../models/infoSchema');

const strings = {
  listTitle: 'Edit informative sections',
  createTitle: 'Create informative section',
  sectionTitleRequired: 'Section title required'
}

// Display list of all Infos
exports.info_list = function (req, res, next) {
  Info.find()
    .sort([['order', 'descending']])
    .exec(function (err, list_infos) {
      if (err) { return next(err); }
      
      //Successful, so render
      res.render('item_list', { title: strings.listTitle, item_list: list_infos, type: 'info' });
    });
};

// Display info create form on GET
exports.info_create_get = function (req, res, next) {
  res.render('info_form', { title: strings.createTitle });
};

// Handle Info create on POST
exports.info_create_post = [

  // Validate that the name field is not empty.
  body('name', strings.sectionTitleRequired).isLength({ min: 1 }).trim(),

  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    var info = new Info({
      name: req.body.name,
      showHeading: req.body.showHeading === 'on',
      bodyHtml: req.body.bodyHtml
    });

    if (!errors.isEmpty()) {
      // There are errors.
      res.render('info_form', { title: strings.createTitle, info: info, errors: errors.array() });
      return;
    }
    else {
      // Data from form is valid.
      // Check if Info with same name already exists.
      Info.findOne({ 'name': req.body.name })
        .exec(function (err, found_info) {
          if (err) { return next(err); }

          if (found_info) {
            // Info exists, redirect to its detail page.
            res.redirect(found_info.url);
          }
          else {

            info.save(function (err) {
              if (err) { return next(err); }
              // Info saved. Redirect to info detail page.
              res.redirect('/edit/infos');
            });

          }

        });
    }
  }
];

// Display info update form on GET
exports.info_update_get = function (req, res, next) {

  // Get info for form
  async.parallel({
    info: function (callback) {
      Info.findById(req.params.id)
        .exec(callback);
    },
  }, function (err, results) {
    if (err) { return next(err); }
    if (results.info == null) { // No results.
      var err = new Error('Info not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render('info_form', { title: 'Edit info', item: results.info });
  });

};

// Handle info update on POST.
exports.info_update_post = [

  // Validate that the name field is not empty.
  body('name', 'Info name required').isLength({ min: 1 }).trim(),

  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a info object with escaped/trimmed data and old id.
    var info = new Info({
      name: req.body.name,
      showHeading: req.body.showHeading === 'on',
      bodyHtml: req.body.bodyHtml,
      _id: req.params.id //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. 
      res.render('info_form', { title: 'Update info', info: info, errors: errors.array() });
      return;
    }
    else {
      // Data from form is valid. Update the record.
      Info.findByIdAndUpdate(req.params.id, info, {}, function (err, theinfo) {
        if (err) { return next(err); }
        // Successful - redirect to info detail page.
        res.redirect('/edit/infos');
      });
    }
  }
];


// Display Info delete form on GET.
exports.info_delete_get = function (req, res, next) {

  async.parallel({
    info: function (callback) {
      Info.findById(req.params.id).exec(callback)
    },
  }, function (err, results) {
    if (err) { return next(err); }
    if (results.info == null) { // No results.
      res.redirect('/edit/infos');
    }
    // Successful, so render.
    res.render('item_delete', { title: 'Delete Info', item: results.info });
  });

};

// Handle Info delete on POST.
exports.info_delete_post = function (req, res, next) {

  async.parallel({
    info: function (callback) {
      Info.findById(req.body.itemid).exec(callback)
    },
  }, function (err, results) {
    if (err) { return next(err); }
    // Success. Delete object and redirect to the list of infos.
    Info.findByIdAndRemove(req.body.itemid, function deleteInfo(err) {
      if (err) { return next(err); }
      // Success - go to info list
      res.redirect('/edit/infos')
    })
  });
};