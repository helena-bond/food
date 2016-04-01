var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Box = new Schema({
  id : ObjectId,
  type : String,
}, { strict: false });

module.exports = mongoose.model('Box', Box);
