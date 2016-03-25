var cassandra = require('cassandra-driver');
var client = new cassandra.Client({ contactPoints: ['127.0.0.1'], keyspace: 'sensors'});
var uuid = require('node-uuid');

module.exports = {
  find: function(options, params, callback) {
    client.execute(this._prepareQuery(options), params, { prepare: true }, function(err, result) {
      console.log(err)
      if (err) {
        callback(err, []);
      } else {
        callback(null, result.rows);
      }
    });
  },

  findOne: function(id, callback) {
    client.execute(this._prepareQuery({ where: 'id = ?'}), [id], { prepare: true }, function(err, result) {
      if (err) {
        callback(err, []);
      } else {
        callback(null, result.first());
      }
    });
  },

  insert: function(columns, values, callback) {
    columns.push('id');
    values.push(uuid.v4());

    console.log(this._prepareInsertQuery(columns), values)

    client.execute(this._prepareInsertQuery(columns), values, { prepare: true}, function (err) {
      if (err) {
        console.log(err)
        callback(err, []);
      } else {
        callback(null);
      }
    });
  },

  _prepareQuery: function(options) {
    var select = (options.select === undefined) ? 'SELECT *' : 'SELECT ' + options.select;
    var where = (options.where === undefined) ? '' : 'WHERE ' + options.where;
    var order = (options.order === undefined) ? '' : 'ORDER BY ' + options.order;
    var limit = (options.limit === undefined) ? '' : 'LIMIT ' + options.limit;

    return (select + ' FROM readings ' + where + ' ' + order + ' ' + limit);
  },

  _prepareInsertQuery: function(columns) {
    var mask = []

    for (var i = 0; i < columns.length; i++) {
      mask.push('?');
    }

    return 'INSERT INTO readings (' + columns.join(',') + ') VALUES (' + mask.join(',') + ')';
  },
};
