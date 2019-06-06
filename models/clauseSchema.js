const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClauseSchema = new Schema(
  {
    name: {type: String, required: true}
  }
);

ClauseSchema.virtual('url').get(function() {
  return '/edit/clause/' + this._id;
});

module.exports = mongoose.model('Clause', ClauseSchema);