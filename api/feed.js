var async = require('async');
var qiniuService = require('../services/qiniu');
var fileProxy = require('../proxy/file');

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
    async.waterfall([
      function(cb1) {
        var uptoken = qiniuService.generateUpToken();
        qiniuService.uploadFileLocalFile(file.path, file.name, uptoken, null, function(err, file_info) {
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
  removePhoto: function(req, res, next) {
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
      res.json({
        status: 'success'
      })
    })
  },
  create: function(req, res, next) {
    var data = req.body.data;
    var userId = req.session.user;

  }
}