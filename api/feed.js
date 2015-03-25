var async = require('async');
var qiniuService = require('../services/qiniu');
var fileProxy = require('../proxy/file');
var feedProxy = require('../proxy/feed');

module.exports = {
  uploadPhoto: function(req, res, next) {
    var userId = req.session.user;
    var file = req.files.file;
    if (!file) {
      return res.json({
        status: 'fail',
        msg: 'No file found!'
      });
    }
    var fileType = 'image';
    async.waterfall([
      function(cb1) {
        var uptoken = qiniuService.generateUpToken();
        qiniuService.uploadFileLocalFile(fileType, file.path, file.name, uptoken, null, function(err, file_info) {
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
          category: 'image',
          width: file_info.image_info.width,
          height: file_info.image_info.height
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
        file_info: result
      })
    })
  },
  uploadVideo: function(req, res, next) {
    var userId = req.session.user;
    var file = req.files.file;
    if (!file) {
      return res.json({
        status: 'fail',
        msg: 'File not found!'
      });
    }
    var fileType = 'video';
    async.waterfall([
      function(cb1) {
        var uptoken = qiniuService.generateUpToken();
        qiniuService.uploadFileLocalFile(fileType, file.path, file.name, uptoken, null, function(err, file_info) {
          if (err) return cb1(err);
          cb1(null, file_info);
        });
      },
      function(file_info, cb2) {
        var file_obj = {
          key: file_info.key,
          url: file_info.url,
          poster_url: file_info.poster_url,
          hash: file_info.hash,
          author: userId,
          mimeType: file.mimetype,
          category: 'video',
          width: 200,
          height: 200
        };
        fileProxy.create(file_obj, function(err, newFile) {
          if (err) return cb2(err);
          cb2(null, newFile);
        })
      }
    ], function(err, result) {
      if (err) return next(err);
      res.json({
        status: 'success',
        file_info: result
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
        fileProxy.findFileByQuery({_id: fileId, key: key, author: userId}, null, function(err, files) {
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
    var category = req.body.category;
    var userId = req.session.user;
    //first update every file caption if category is image

    if (category === 'text') {
      var content = req.body.content;

      feedProxy.create(userId, {content: content, category: category}, function(err, newFeed) {
        if (err) return next(err);
        res.json({
          status: 'success',
          new_feed: newFeed
        })
      })

    } else {
      var files = req.body.files;


      async.waterfall([
        function(cb1) {
          async.map(files, function(file, cb) {
            fileProxy.updateCaptionById(file.fileId, file.caption, function(err) {
              if (err) return cb(err);
              cb(null);
            })
          }, function(err) {
            if (err) return cb1(err);
            cb1(null);
          })
        },
        function(cb2) {
          feedProxy.create(userId, {files: files, category: category}, function(err, newFeed) {
            if (err) return cb2(err);
            cb2(null, newFeed);
          })
        }
      ], function(err, result) {
        if (err) return next(err);
        res.json({
          status: 'success',
          new_feed: result
        })
      })
    }
  },
  getFeeds: function(req, res, next) {
    feedProxy.getFeeds(null, null, function(err, feeds) {
      if (err) return next(err);
      res.json({
        status: 'success',
        feeds: feeds
      })
    })
  }
}
