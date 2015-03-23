var Feed = require('../models').Feed;

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
  }
}
