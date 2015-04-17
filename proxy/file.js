var File = require('../models').File;

module.exports = {
  create: function(file_obj, cb) {
    var file = new File();
    file.key = file_obj.key;
    file.url = file_obj.url;
    file.author = file_obj.author;
    file.hash = file_obj.hash;
    file.mimeType = file_obj.mimeType;
    file.category = file_obj.category;
    file.caption = '';
    file.singer_name = file_obj.singer_name;
    file.title = file_obj.title;
    file.cover_url = file_obj.cover_url;
    file.album = file_obj.album;
    file.save(cb);
  },
  findFileByQuery: function(query, opt, cb) {
    File.find(query, null, opt, cb);
  },
  removeFileById: function(id, cb) {
    File.remove({_id: id}, cb);
  },
  updateCaptionById: function(id, caption, cb) {
    File.update({_id: id}, {caption: caption}, cb);
  }
}
