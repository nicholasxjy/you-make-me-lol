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
    _feed.comments = feed.comments;
    _feed.likes = feed.likes;

    _feeds.push(_feed);
  });
  return _feeds;
}