var express = require('express');
var router = express.Router();

var suspend = require('suspend');
var url = require('url');

var boxModel = require('../models/box');

/* GET home page. */
router.get('/boxes', suspend.promise(function *(req, res, next) {
  try {
    var query = url.parse(req.url,true).query;
    var perPage = parseInt(query.perPage) || 50;
    var boxes = yield boxModel.find({ limit: perPage }, [], suspend.resume());

    res.json(boxes);
  } catch(e) {
    res.json(e.toString());
  }
}));

router.post('/boxes', suspend.promise(function *(req, res) {
  try {
    var columns = ['date'];
    var values = [new Date()];

    for (var i in req.body) {
      columns.push(i);
      values.push(req.body[i]);
    }

    var result = yield boxModel.insert(columns, values, suspend.resume());

    res.json({
      message: 'ok',
    });
  } catch (error) {
    res.json(error.toString());
  }
}));

router.get('/boxes/:id', suspend.promise(function *(req, res, next) {
  try {
    var box = yield boxModel.findOne(req.params.id, suspend.resume());

    res.json(box);
  } catch(e) {
    res.json(e.toString());
  }
}));

// Do we even PATCH here? Why?
router.patch('/boxes/:id', suspend.promise(function *(req, res, next) {

}));


module.exports = router;
