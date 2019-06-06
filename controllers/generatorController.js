const async = require('async');

const Clause = require('../models/clauseSchema');
const Info = require('../models/infoSchema');

const strings = {
  allInfosTitle: 'All informative sections'
}

// Display the content of all informative sections
exports.all_infos = function (req, res, next) {
  Info.find()
    .sort([['order', 'descending']])
    .exec(function (err, list_infos) {
      if (err) { return next(err); }

      //Successful, so render
      res.render('all_infos', { title: strings.allInfosTitle, item_list: list_infos });
    });
};