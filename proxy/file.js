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
    file.width = file_obj.width;
    file.height = file_obj.height;
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
