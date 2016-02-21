var express = require('express');
var router = express.Router();

var suspend = require('suspend');
var url = require('url');

var boxModel = require('../models/box');

/* GET home page. */
router.get('/', suspend.promise(function *(req, res, next) {
  try {
    var query = url.parse(req.url,true).query;

    // var per_page = parseInt(query.per_page) || 30;
    // var page = parseInt(query.page) || 1;

    var boxes = yield boxModel.find({}).sort({ date: -1 }).limit(50);
    var fields = [];
    for (var i in boxes) {
      var box = boxes[i]._doc;
      for (var j in box) {
        if ((['id', '_id', 'external_id', 'type', 'date', '__v'].indexOf(j)) < 0 && (fields.indexOf(j) < 0)) {
          fields.push(j);
        }
      }
    }

    var current_data = '';
    if (boxes && boxes[0] && boxes[0]._doc) {
      for (var i in fields) {
        if (boxes[0]._doc[fields[i]]) {
          if (current_data.length > 0) current_data += ', ';
          current_data += fields[i] + ': ' + boxes[0]._doc[fields[i]];
        }
      }
    }

    res.render('index', {
      title: 'Box info',
      // page: page,
      // per_page: per_page,
      fields: fields,
      current_data: current_data,
      boxes: boxes
    });

  } catch(e) {
    res.json(e.toString());
  }

}));

module.exports = router;
