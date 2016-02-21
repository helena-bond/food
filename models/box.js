var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/iot_for_food');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Box = new Schema({
  id : ObjectId,
  external_id: String,
  type : String,
  date: { type: Date, default: Date.now }
}, { strict: false });

module.exports = mongoose.model('Box', Box);
