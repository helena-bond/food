var express = require('express');
var router = express.Router();

var suspend = require('suspend');
var url = require('url');

var boxModel = require('../models/box');

/* GET home page. */
router.get('/', suspend.promise(function *(req, res, next) {
  try {
    var query = url.parse(req.url,true).query;

    var per_page = parseInt(query.per_page) || 50;
    var page = parseInt(query.page) || 1;

    var boxes = yield boxModel.find({}).sort({ date: -1 }).skip((page-1) * per_page).limit(per_page);

    var count = yield boxModel.count();

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
      page: page,
      per_page: per_page,
      pages: Math.ceil(count / per_page),
      fields: fields,
      current_data: current_data,
      boxes: boxes
    });

  } catch(e) {
    res.json(e.toString());
  }

}));

// router.get('/chart/:type/:range', suspend.promise(function*(req, res, next) {

//   try {
//     var d = new Date(2016, 2, 19, 23, 59, 59);
//     var hour = d.getHours();
//     var min = d.getMinutes();
//     var month = d.getMonth();
//     var year = d.getFullYear();
//     var sec = d.getSeconds();
//     var day = d.getDate();

//     var where = {};

//     switch (req.params.range) {
//       case 'hour':
//         where.date = { $lte: new Date(d), $gte: new Date(year, month, day, hour) };
//         break;
//       case 'day':
//         where.date = { $lte: new Date(d), $gte: new Date(year, month, day) } // Get results from start of current day to current time.
//         break;
//       case 'month':
//         where.date = { $lte: new Date(d), $gte: new Date(year, month, 1) } // Get results from start of current month to current time.
//         break;
//     }

//     var boxes = yield boxModel.find(where).sort({ date: 1 }).batchSize(1000000000);

//     var dataset = [];
//     var last_date = false;
//     var tmp = [];
//     var dates = [];
//     for (var i in boxes) { dates.push(boxes[i].date);
//       if (last_date) {

//         var new_date = true;
//         var dt = new Date(boxes[i].date);

//         switch (req.params.range) {
//           case 'hour':
//             new_date = ((dt.getMinutes() - last_date.getMinutes()) >= 5);
//             if (dt.getMinutes() == 59 && last_date.getMinutes() != 59) {
//               new_date = true;
//             }
//             break;
//           case 'day':
//             new_date = (dt.getHours() !== last_date.getHours());
//             break;
//           case 'month':
//             new_date = (dt.getDate() !== last_date.getDate());
//             break;
//           default:
//             new_date =  (tmp.length > (boxes.length / 20));
//         }

//         if (i == (boxes.length - 1)) {
//           new_date = true;
//           tmp.push(boxes[i]);
//         }

//         if (new_date) {
//           var av = 0;
//           for (var j in tmp) {
//             av += tmp[j]._doc[req.params.type];
//           }
//           av = av / tmp.length;
//           dataset.push({
//             date: last_date,
//             value: av
//           });

//           tmp = [];
//           last_date = new Date(boxes[i].date);
//         }

//         tmp.push(boxes[i]);
//       } else {
//         last_date = new Date(boxes[i].date);
//         tmp.push(boxes[i]);
//       }
//     }

//     var data = [];
//     var labels = [];
//     for (var i in dataset) {
//       if (dataset[i].value && parseFloat(dataset[i].value)) {
//         data.push(parseFloat(dataset[i].value));
//       } else {
//         data.push(0);
//       }

//       var dt = new Date(dataset[i].date);
//       switch(req.params.range) {
//         case 'hour':
//           labels.push( dt.getMinutes());
//           break;
//         case 'day':
//           labels.push(dt.getHours() + ':' + dt.getMinutes());
//           break;
//         case 'month':
//           labels.push(dt.getDate() + '(' + dt.getHours() + ':' + dt.getMinutes() + ')');
//           break;
//         default:
//           labels.push(dt);
//       }
//     }

//     var chart = {
//       labels: labels,
//       datasets: [
//           {
//               label: "My First dataset",
//               fillColor: "rgba(220,220,220,0.2)",
//               strokeColor: "rgba(220,220,220,1)",
//               pointColor: "rgba(220,220,220,1)",
//               pointStrokeColor: "#fff",
//               pointHighlightFill: "#fff",
//               pointHighlightStroke: "rgba(220,220,220,1)",
//               data: data
//           }
//       ]
//     };

//     res.render('chart', {
//       type: req.params.type,
//       data: chart,
//       range: req.params.range
//     });
//   } catch(e) {
//     console.log(e)
//     res.json(e.toString());
//   }


// }));

module.exports = router;
