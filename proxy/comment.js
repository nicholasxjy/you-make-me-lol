var Comment = require('../models').Comment;

module.exports = {
  create: function(feedId, userId, touser, content, cb) {
    var comment = new Comment();
    comment.to_feed = feedId;
    comment.to_user = touser;
    comment.content = content;
    comment.creator = userId;
    comment.save(function(err, newComment) {
      if (err) return cb(err);
      var options = [
        {path: 'to_user', model: 'User', select: '_id name avatar'},
        {path: 'creator', model: 'User', select: '_id name avatar'}
      ];
      Comment.populate(newComment, options, cb);
    });
  }
}
