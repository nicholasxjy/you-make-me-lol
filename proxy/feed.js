var Feed = require('../models').Feed;
var async = require('async');

module.exports = {
  create: function(userId, data, cb) {
    var category = data.category;
    var feed = new Feed();
    feed.category = category;
    feed.content = '';
    feed.attach_files = [];
    feed.creator = userId;
    feed.comments = [];
    feed.likes = [];
    if (category === 'text') {
      feed.content = data.content;
    } else {
      feed.attach_files = data.files.map(function(file) {
        return file.fileId;
      });
    }
    feed.save(cb);
  },
  getFeeds: function(query, opts, cb) {
    async.waterfall([
      function(cb1) {
        Feed.find(query, opts, function(err, feeds) {
          if (err) cb1(err);
          cb1(null, feeds);
        })
      },
      function(feeds, cb2) {
        var options = [
          {path: 'attach_files', model: 'File'},
          {path: 'creator', model: 'User'},
          {path: 'comments', model: 'Comment'},
          {path: 'likes', model: 'User'}
        ];
        Feed.populate(feeds, options, function(err, pfeeds) {
          if (err) cb2(err);
          cb2(null, pfeeds);
        })
      }
    ], function(err, feeds) {
      if (err) cb(err);
      cb(null, feeds);
    })
  },
  getFeedById: function(id, cb) {
    Feed.findById(id, cb);
  }
}
