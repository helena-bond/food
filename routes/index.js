var express = require('express');
var router = express.Router();

var suspend = require('suspend');
var url = require('url');

var boxModel = require('../models/box');
var readingsModel = require('../models/readings');

/* GET home page. */
router.get('/', suspend.promise(function *(req, res, next) {
  try {
    var query = url.parse(req.url,true).query;

    var per_page = parseInt(query.per_page) || 50;
    var page = parseInt(query.page) || 1;

    var boxes = yield readingsModel.find({}).sort({ date: -1 }).skip((page-1) * per_page).limit(per_page);

    var count = yield readingsModel.count();

    var nodeIds = yield readingsModel.distinct('box_id');

    var fields = [];
    for (var i in boxes) {
      var box = boxes[i]._doc;
      for (var j in box) {
        if ((['id', '_id', 'external_id', 'type', 'date', '__v', 'box_id'].indexOf(j)) < 0 && (fields.indexOf(j) < 0)) {
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
      page: page,
      per_page: per_page,
      pages: Math.ceil(count / per_page),
      fields: fields,
      current_data: current_data,
      boxes: boxes,
      nodeIds: nodeIds,
    });

  } catch(e) {
    res.json(e.toString());
  }

}));

router.get('/chart/:id/:type/:range', suspend.promise(function*(req, res, next) {
  if (['temperature', 'humidity', 'concentration'].indexOf(req.params.type) === -1) {
    res.status(404).end();
    return;
  }

  try {
    var d = new Date();
    var hour = d.getHours();
    var min = d.getMinutes();
    var month = d.getMonth();
    var year = d.getFullYear();
    var sec = d.getSeconds();
    var day = d.getDate();

    var date = null;
    var acc = null;

    switch (req.params.range) {
      case 'hour':
        acc = { $minute: '$date' };
        date = { $lte: new Date(d), $gte: new Date(year, month, day, hour) };
        break;
      case 'day':
         // Get results from start of current day to current time.
        acc = { $hour: '$date' };
        date = { $lte: new Date(d), $gte: new Date(year, month, day) }
        break;
      case 'month':
        // Get results from start of current month to current time.
        acc = { $dayOfMonth: '$date' };
        date = { $lte: new Date(d), $gte: new Date(year, month, 1) }
        break;
    }

    var dataset = yield readingsModel.aggregate([
      { $match: { date: date, box_id: req.params.id } },
      { $group: { _id: acc, value: { $avg: '$' + req.params.type } } }
    ], suspend.resume());

    dataset = dataset.sort(function(left, right) {
      if (left._id < right._id) {
        return -1;
      }
      else if (left._id === right._id) {
        return 0;
      }
      else {
        return 1;
      }
    });

    var data = [];
    var labels = [];

    for (var i in dataset) {
      if (dataset[i].value) {
        data.push(dataset[i].value);
      } else {
        data.push(0);
      }

      labels.push(dataset[i]._id);
    }

    var chart = {
      labels: labels,
      datasets: [
          {
              label: "My First dataset",
              fillColor: "rgba(220,220,220,0.2)",
              strokeColor: "rgba(220,220,220,1)",
              pointColor: "rgba(220,220,220,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: data
          }
      ]
    };

    res.render('chart', {
      type: req.params.type,
      data: chart,
      range: req.params.range,
      id: req.params.id,
    });
  } catch(e) {
    res.json(e.toString());
  }
}));

module.exports = router;
