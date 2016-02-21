var express = require('express');
var router = express.Router();

var suspend = require('suspend');
var url = require('url');

var boxModel = require('../models/box');

/* GET home page. */
router.get('/boxes', suspend.promise(function *(req, res, next) {
  try {
    var query = url.parse(req.url,true).query;

    var per_page = parseInt(query.per_page) || 30;
    var page = parseInt(query.page) || 1;

    var boxes = yield boxModel.find({}).skip((page-1) * per_page).limit(per_page);

    res.json(boxes);
  } catch(e) {
    res.json(e.toString());
  }

}));

router.post('/boxes', suspend.promise(function *(req, res, next) {
  try {
    var box = new boxModel();

    for (var i in req.body) {
      box.set(i, req.body[i])
      // box[i] = req.body[i];
    }

    var result = yield box.save(suspend.resume());

    res.json({
      message: 'ok'
    });
  } catch(e) {
    res.json(e.toString());
  }
}));

router.get('/boxes/:id', suspend.promise(function *(req, res, next) {
  try {
    var box = yield boxModel.findOne({ external_id: req.params.id });

    res.json(box);
  } catch(e) {
    res.json(e.toString());
  }
}));

// Do we even PATCH here? Why?
router.patch('/boxes/:id', suspend.promise(function *(req, res, next) {

}));


module.exports = router;
