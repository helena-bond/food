var express = require('express');
var router = express.Router();

var suspend = require('suspend');
var url = require('url');

var boxModel = require('../models/box');
var readingsModel = require('../models/readings');

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

// Do we even PATCH here? Why?
router.patch('/boxes/:id', suspend.promise(function *(req, res, next) {

}));

router.post(['/boxes/:id/readings', '/boxes/readings'], suspend.promise(function* (req, res, next) {
  try {
    if (req.body.data) {

      if (req.body.data.length) {

        // processing bulk data
        var readings = [];
        for (var i in req.body.data) {
          readings[i] = {};
          for (var j in req.body.data[i]) {
            readings[i][j] = req.body.data[i][j];
            readings[i].date = new Date();
          }
          if (req.params.id) {
            readings[i].box_id = req.params.id;
          }
        }

        var result = yield readingsModel.collection.insert(readings, suspend.resume());

        res.json({
          message: 'ok'
        });

      } else {

        // processing single data
        var readings = new readingsModel();

        for (var i in req.body.data) {
          readings.set(i, req.body.data[i]);
        }
        if (req.params.id) {
          readings.set('box_id', req.params.id);
        }

        var result = yield readings.save(suspend.resume());

        res.json({
          message: 'ok'
        });

      }
    } else {
      throw new Error('Request body should have data attribute');
    }
  } catch(e) {
    res.json(e.toString());
  }
}));

router.get(['/boxes/:id/readings', '/boxes/readings'], suspend.promise(function *(req, res, next) {
  try {
    var query = url.parse(req.url,true).query;

    var per_page = parseInt(query.per_page) || 30;
    var page = parseInt(query.page) || 1;

    var where = {};
    if (req.params.id) {
      where.box_id = req.params.id;
    }

    var boxes = yield readingsModel.find(where).skip((page-1) * per_page).limit(per_page);

    res.json(boxes);
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




module.exports = router;
