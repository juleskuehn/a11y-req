const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InfoSchema = new Schema(
  {
    name: { type: String, required: true },
    showHeading: { type: Boolean, required: true },
    bodyHtml: { type: String }
  }
);

InfoSchema.virtual('url').get(function () {
  return '/edit/info/' + this._id;
});

module.exports = mongoose.model('Info', InfoSchema);