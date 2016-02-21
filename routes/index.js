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

    var boxes = yield boxModel.find({});

    for (var i in boxes) {
      var info = {};
      var box = boxes[i]._doc;
      for (var j in box) {
        if (['id', '_id', 'external_id', 'type', 'date', '__v'].indexOf(j) < 0) {
          info[j] = box[j];
        }
      }
      boxes[i]._info = JSON.stringify(info);
    }

    res.render('index', {
      title: 'Boxes info',
      // page: page,
      // per_page: per_page,
      boxes: boxes
    });

  } catch(e) {
    res.json(e.toString());
  }

}));

module.exports = router;
