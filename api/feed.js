var async = require('async');
var qiniuService = require('../services/qiniu');
var fileProxy = require('../proxy/file');
var feedProxy = require('../proxy/feed');
var tagProxy = require('../proxy/tag');
var utils = require('../services/utils');

module.exports = {
  uploadFile: function(req, res, next) {
    var userId = req.session.user;
    var file = req.files.file;
    var category = req.body.category;
    console.log(file)
    if (file === null || file === undefined) {
      return res.json({
        status: 'fail',
        msg: 'No file found!'
      });
    }
    async.waterfall([
      function(cb1) {
        var uptoken = qiniuService.generateUpToken();
        qiniuService.uploadFileLocalFile(category, file.path, file.name, uptoken, null, function(err, file_info) {
          if (err) return cb1(err);
          cb1(null, file_info);
        });
      },
      function(file_info, cb2) {
        var file_obj = {
          key: file_info.key,
          url: file_info.url,
          author: userId,
          hash: file_info.hash,
          mimeType: file.mimetype,
          category: category
        };
        fileProxy.create(file_obj, function(err, newFile) {
          if (err) return cb2(err);
          file_info.fileId = newFile._id;
          cb2(null, file_info);
        })
      }
    ], function(err, result) {
      if (err) return next(err);
      res.json({
        status: 'success',
        file_info: {
          fileId: result.fileId,
          key: result.key,
          url: result.url
        }
      })
    })
  },
  removeFile: function(req, res, next) {
    //should check the authority
    var key = req.body.key;
    var userId = req.session.user;
    var fileId = req.body.fileId;
    async.waterfall([
      function(cb1) {
        fileProxy.findFileByQuery({
          _id: fileId,
          key: key,
          author: userId
        }, null, function(err, files) {
          if (err) return cb1(err);
          if (!files || files.length === 0) {
            return res.sendStatus(403);
          }
          cb1(null);
        });
      },
      function(cb2) {
        qiniuService.deleteFile(key, function(err, ret) {
          if (err) return cb2(err);
          cb2(null);
        });
      }
    ], function(err) {
      if (err) return next(err);
      fileProxy.removeFileById(fileId, function(err) {
        if (err) return next(err);
        res.json({
          status: 'success'
        })
      })
    })
  },
  create: function(req, res, next) {
    var userId = req.session.user;
    //first update every file caption if category is image

    var category = req.body.category;
    var files = req.body.share_files;
    var text = req.body.text;
    var tags = req.body.tags;


    if (category === 'image') {
      async.parallel({
        images: function(cb1) {
          async.map(files, function(image, callback) {
            if (image.caption && image.caption !== '') {
              fileProxy.updateCaptionById(image.fileId, image.caption, function(err) {
                if (err) return callback(err);
                return callback(null);
              })
            } else {
              return callback(null);
            }
          }, function(err) {
            if (err) return cb1(err);
            return cb1(null);
          })
        },
        tags: function(cb2) {
          //create all tags
          if (tags && tags.length > 0) {
            async.map(tags, function(tag, callback) {
              tagProxy.create(tag.text, function(err, newtag) {
                if (err) return callback(err);
                return callback(null, newtag);
              })
            }, function(err, results) {
              if (err) return cb2(err);
              return cb2(null, results)
            })
          } else {
            return cb2(null, []);
          }
        }
      }, function(err, result) {
        if (err) return next(err);
        var data = {};
        data.content = text;
        data.files = files.map(function(image) {
          return image.fileId;
        });
        data.tags = result.tags.map(function(tag) {
          return tag._id;
        });
        data.category = category;

        feedProxy.create(userId, data, function(err, newFeed) {
          if (err) return next(err);
          res.json({
            status: 'success',
            new_feed_id: newFeed._id
          });
        })
      })
    } else {
      async.waterfall([
        function(cb1) {
          //create all tags
          if (tags && tags.length > 0) {
            async.map(tags, function(tag, callback) {
              tagProxy.create(tag.text, function(err, newtag) {
                if (err) return callback(err);
                return callback(null, newtag);
              })
            }, function(err, results) {
              if (err) return cb1(err);
              return cb1(null, results)
            })
          } else {
            return cb1(null, []);
          }
        }
      ], function(err, tags) {
        if (err) return next(err);
        var data = {};
        data.content = text;
        data.category = 'text';
        if (category === 'audio') {
          data.category = 'audio';
        }
        if (category === 'video') {
          data.category = 'video';
        }
        if (files && files.length) {
          data.files = files.map(function(item) {
            return item.fileId;
          })
        } else {
          data.files = [];
        }

        data.tags = tags.map(function(tag) {
          return tag._id;
        });

        feedProxy.create(userId, data, function(err, newFeed) {
          if (err) return next(err);
          res.json({
            status: 'success',
            new_feed_id: newFeed._id
          });
        })

      })
    }
  },
  getFeeds: function(req, res, next) {
    feedProxy.getFeeds(null, null, function(err, feeds) {
      if (err) return next(err);

      //add filter properties response to
      _feeds = utils.homeFeedsFilter(feeds);
      res.json({
        status: 'success',
        feeds: _feeds
      })
    })
  }
}