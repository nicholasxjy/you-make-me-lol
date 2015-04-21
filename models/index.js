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
require('./file');
require('./comment');
require('./tag');
require('./notification');
exports.User = mongoose.model('User');
exports.Feed = mongoose.model('Feed');
exports.File = mongoose.model('File');
exports.Comment = mongoose.model('Comment');
exports.Tag = mongoose.model('Tag');
exports.Notification = mongoose.model('Notification');
