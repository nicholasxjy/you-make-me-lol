var mongoose = require('mongoose');

var config = require('../config');

mongoose.connect(config.db.url, function(err) {
  if (err) {
    console.log('Connect db error: ', err.message);
    process.exit(1);
  }
  console.log('Mongodb connected...');
});

require('./user');
require('./feed');
require('./comment');
exports.User = mongoose.model('User');
exports.Feed = mongoose.model('Feed');
exports.Comment = mongoose.model('Comment');