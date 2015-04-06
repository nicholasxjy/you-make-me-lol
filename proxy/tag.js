var Tag = require('../models').Tag;
var async = require('async');

module.exports = {
  create: function(text, cb) {
    Tag.findOne({text: text}, function(err, tag) {
      if (err) return cb(err);
      if (tag) {
        return cb(null, tag);
      }
      var tag = new Tag();
      tag.text = text;
      tag.save(cb);
    });
  }
}