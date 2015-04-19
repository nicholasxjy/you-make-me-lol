var UserProxy = require('../proxy/user');

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
}
