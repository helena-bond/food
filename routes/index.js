var express = require('express');
var router = express.Router();

var suspend = require('suspend');
var url = require('url');

var boxModel = require('../models/box');

/* GET home page. */
router.get('/', suspend.promise(function *(req, res, next) {
  try {
    var excluded = ['id', '_id', 'external_id', 'type', 'date', '__v', 'get', 'values', 'keys', 'forEach'];
    var query = url.parse(req.url,true).query;
    var boxes = yield boxModel.find({ limit: 50 }, [], suspend.resume());
    var fields = [];
    var current_data = '';

    for (var i in boxes) {
      var box = boxes[i];
      for (var j in box) {
        if ((excluded.indexOf(j)) < 0 && (fields.indexOf(j) < 0)) {
          fields.push(j);
        }
      }
    }

    if (boxes && boxes[0]) {
      for (var i in fields) {
        if (boxes[0][fields[i]]) {
          if (current_data.length > 0) current_data += ', ';
          current_data += fields[i] + ': ' + boxes[0][fields[i]];
        }
      }
    }

    res.render('index', {
      title: 'Box info',
      fields: fields,
      current_data: current_data,
      boxes: boxes
    });

  } catch(e) {
    res.json(e.toString());
  }
}));

module.exports = router;
