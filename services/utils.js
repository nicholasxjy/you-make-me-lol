exports.homeFeedsFilter = function(feeds) {
  var _feeds = [];
  feeds.forEach(function(feed) {
    var _feed = {};
    _feed.id = feed._id;
    _feed.attach_files = feed.attach_files.map(function(file) {
      return {caption: file.caption, url: file.url};
    });

    _feed.category = feed.category;
    _feed.createdAt = feed.createdAt;
    _feed.creator = {
      id: feed.creator._id,
      name: feed.creator.name,
      avatar: feed.creator.avatar
    };

    _feed.tags = feed.tags.map(function(tag) {
      return tag.text;
    });

    _feed.content = feed.content;
    _feed.comments = feed.comments.map(function(comment) {
      var _comment = {
        id: comment._id,
        creator: {
          id: comment.creator._id,
          name: comment.creator.name,
          avatar: comment.creator.avatar
        },
        to_user: {
          id: comment.to_user._id,
          name: comment.to_user.name,
          avatar: comment.to_user.avatar
        },
        content: comment.content,
        createdAt: comment.createdAt
      }
      return _comment;
    });
    _feed.likes = feed.likes.map(function(liker) {
      var _liker = {
        id: liker._id,
        name: liker.name,
        avatar: liker.avatar
      }
      return _liker;
    });

    _feeds.push(_feed);
  });
  return _feeds;
};

exports.homeCurrentUserFilter = function(user) {
  var _user = {};
  _user.name = user.name;
  _user.id = user._id;
  _user.avatar = user.avatar;
  return _user;
};

exports.checkFeedsLike = function(feeds, userId) {
  var _feeds = feeds.map(function(feed) {
    var isLike = feed.likes.some(function(liker) {
      return userId === liker.id.toString();
    });
    feed.isLike = isLike;
    return feed;
  });
  return _feeds;
}
