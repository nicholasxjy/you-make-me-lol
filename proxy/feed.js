var Feed = require('../models').Feed;
var async = require('async');

module.exports = {
  create: function(userId, data, cb) {
    var feed = new Feed();
    feed.category = data.category;
    feed.content = data.content;
    feed.attach_files = data.files;
    feed.creator = userId;
    feed.tags = data.tags;
    feed.comments = [];
    feed.likes = [];
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
