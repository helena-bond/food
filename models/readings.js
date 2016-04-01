var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Readings = new Schema({
  id : ObjectId,
  box_id: String,
  date: { type: Date, default: Date.now }
}, { strict: false });

module.exports = mongoose.model('Readings', Readings);
