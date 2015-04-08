exports.checkFeedsLike = function(feeds, userId) {
  var _feeds = feeds.map(function(feed) {
    var isLike = feed.likes.some(function(liker) {
      return userId.toString() === liker._id.toString();
    });
    feed.isLike = isLike;
    feed.likes = feed.likes.slice(-5);
    return feed;
  });
  return _feeds;
}
