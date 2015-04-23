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
    feed.location = data.location;
    feed.comments = [];
    feed.likes = [];
    feed.at_users = data.at_users || [];
    feed.save(cb);
  },
  getFeeds: function(query, opts, cb) {
    async.waterfall([
      function(cb1) {
        Feed.find(query, null, opts, function(err, feeds) {
          if (err) cb1(err);
          cb1(null, feeds);
        })
      },
      function(feeds, cb2) {
        var options = [
          {path: 'attach_files', model: 'File', select: 'caption url title singer_name cover_url'},
          {path: 'creator', model: 'User', select: '_id name avatar gender location bg_image profile'},
          {path: 'comments', model: 'Comment', options: {sort: {'createdAt': -1}, limit: 3}, select:'_id creator to_user content createdAt'},
          {path: 'likes', model: 'User', select: '_id name avatar'},
          {path: 'tags', model: 'Tag'}
        ];
        Feed.populate(feeds, options, function(err, pfeeds) {
          if (err) cb2(err);
          cb2(null, pfeeds);
        })
      },
      function(feeds, cb3) {
        var opt2 = [
          {path: 'comments.creator', model: 'User', select: '_id name avatar'},
          {path: 'comments.to_user', model: 'User', select: '_id name avatar'}
        ];
        Feed.populate(feeds, opt2, function(err, f_feeds) {
          if (err) return cb3(err);
          return cb3(null, f_feeds);
        })
      }
    ], function(err, feeds) {
      if (err) cb(err);
      cb(null, feeds);
    })
  },
  getUserFeeds: function(userId, cb) {
    async.waterfall([
      function(cb1) {
        Feed.find({creator: userId}, '_id attach_files creator tags content location createdAt category', function(err, feeds) {
          if (err) return cb1(err);
          return cb1(null, feeds);
        })
      },
      function(feeds, cb2) {
        var options = [
          {path: 'attach_files', model: 'File', select: 'caption url title singer_name cover_url'},
          {path: 'creator', model: 'User', select: '_id name avatar'},
          {path: 'tags', model: 'Tag'}
        ];
        Feed.populate(feeds, options, function(err, pfeeds) {
          if (err) return cb2(err);
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
          return cb1(null, feed);
        })
      },
      function(feed, cb2) {
        var options = [
          {path: 'attach_files', model: 'File', select: 'caption url title singer_name cover_url'},
          {path: 'creator', model: 'User', select: '_id name avatar followers followees'},
          {path: 'comments', model: 'Comment', options: {sort: {'createdAt': -1}, limit: 10}, select:'_id creator to_user content createdAt'},
          {path: 'likes', model: 'User', select: '_id name avatar'},
          {path: 'tags', model: 'Tag', select: 'text'}
        ];
        Feed.populate(feed, options, function(err, pfeed) {
          if (err) return cb2(err);
          return cb2(null, pfeed);
        })
      },
      function(feed, cb3) {
        var opt2 = [
          {path: 'comments.creator', model: 'User', select: '_id name avatar'},
          {path: 'comments.to_user', model: 'User', select: '_id name avatar'}
        ];
        Feed.populate(feed, opt2, function(err, f_feed) {
          if (err) return cb3(err);
          return cb3(null, f_feed);
        })
      }
    ], function(err, feed) {
      if (err) return cb(err);
      return cb(null, feed);
    })
  },
  getCountByUser: function(userId, cb) {
    Feed.count({creator: userId}, cb);
  }
}
