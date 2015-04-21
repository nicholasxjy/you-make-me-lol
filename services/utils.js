var UserProxy = require('../proxy/user');
var async = require('async');
exports.checkFeedsLike = function(feeds, userId) {
  var _feeds = feeds.map(function(feed) {
    var isLike = feed.likes.some(function(liker) {
      return userId.toString() === liker._id.toString();
    });
    feed = feed.toObject();
    feed.isLike = isLike;
    feed.likes = feed.likes.slice(-5);
    return feed;
  });
  return _feeds;
};

exports.checkFeedLike = function(feed, userId) {
  feed = feed.toObject();
  var isLike = feed.likes.some(function(liker) {
    return userId.toString() === liker._id.toString();
  });
  feed.isLike = isLike;
  return feed;
}

exports.checkFollowRelation = function(feeds, userId, cb) {
  UserProxy.getUserById(userId, 'followers', function(err, user) {
    if (err) return cb(err);
    var _feeds = feeds.map(function(feed) {
      var hasFollowed = user.followers.some(function(follower) {
        return feed.creator._id.toString() === follower.toString();
      });
      feed.creator.hasFollowed = hasFollowed;
      return feed;
    });
    return cb(null, _feeds);
  })
};

exports.formatCommentContentByUserNames = function(names, content, cb) {
  async.map(names, function(name, callback) {
    UserProxy.getUserByName(name, '_id name', function(err, user) {
      if (err) callback(err);
      if (user) {
        var tpl = '<a href="#/user/'+ user.name +'">@'+ user.name +'</a>';
        content = content.replace('@'+name, tpl);
        callback(null, user);
      } else {
        callback(null);
      }

    })
  }, function(err, results) {
    if (err) return cb(err);
    var doc = {};
    doc.users = results;
    doc.content = content;
    return cb(null, doc);
  })
};

exports.checkFollowRelationByFollowees = function(user, currentUserId) {
  user = user.toObject();
  var hasFollowed = user.followees.some(function(followee) {
    return currentUserId.toString() === followee.toString();
  });
  user.hasFollowed = hasFollowed;
  return user;
};
