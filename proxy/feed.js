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
          {path: 'likes', model: 'User'},
          {path: 'tags', model: 'Tag'}
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
  },
  getDetail: function(id, cb) {
    async.waterfall([
      function(cb1) {
        Feed.findById(id, function(err, feed) {
          if (err) return cb1(err);
          if (!feed) {
            return cb1(new Error('Feed not found'));
          }
          return cb1(null, feed);
        })
      },
      function(feed, cb2) {
        var options = [
          {path: 'attach_files', model: 'File'},
          {path: 'creator', model: 'User'},
          {path: 'comments', model: 'Comment'},
          {path: 'likes', model: 'User'},
          {path: 'tags', model: 'Tag'}
        ];
        Feed.populate(feed, options, function(err, pfeed) {
          if (err) return cb2(err);
          return cb2(null, pfeed);
        })
      }
    ], function(err, feed) {
      if (err) return cb(err);
      return cb(null, feed);
    })
  }
}
