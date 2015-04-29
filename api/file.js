var async = require('async');
var qiniuService = require('../services/qiniu');
var fileProxy = require('../proxy/file');

module.exports = {
  upload: function(req, res, next) {
    var userId = req.session.user;
    var file = req.files.file;
    var category = req.body.category;
    var audio_tag = req.body.audio_tag;

    if (file === null || file === undefined) {
      return res.json({
        status: 'fail',
        msg: 'No file found!'
      });
    }

    if (category === 'image' || category === 'video') {
      async.waterfall([
        function(cb1) {
          //upload image and get url
          var uptoken = qiniuService.generateUpToken();
          qiniuService.uploadLocalFile(uptoken, file.name, file.path, null, function(err, ret) {
            if (err) return cb1(err);
            return cb1(null, ret);
          })
        },
        function(ret, cb2) {
          //create image file depend on url
          var image_info = {
            key: ret.key,
            url: ret.url,
            author: userId,
            hash: ret.hash,
            mimeType: file.mimetype,
            category: category
          };
          fileProxy.create(image_info, function(err, new_image) {
            if (err) return cb2(err);
            return cb2(null, new_image);
          })
        }
      ], function(err, result) {
        if (err) return next(err);
        return res.json({
          status: 'success',
          file_info: {
            fileId: result._id,
            url: result.url,
            key: result.key
          }
        })
      })
    } else if (category === 'audio') {
      async.waterfall([
        function(cb1) {
          //upload audio file
          var uptoken = qiniuService.generateUpToken();
          qiniuService.uploadLocalFile(uptoken, file.name, file.path, null, function(err, ret) {
            if (err) return cb1(err);
            return cb1(null, ret);
          })
        },
        function(ret, cb2) {
          //check other audio info, and upload cover
          var audioInfo = {};

          audioInfo.key = ret.key;
          audioInfo.url = ret.url;
          audioInfo.hash = ret.hash;
          audioInfo.author = userId;
          audioInfo.mimeType = file.mimetype;
          audioInfo.category = category;

          if (audio_tag && audio_tag.data && audio_tag.data !== '') {
            var key = ret.key.split('.')[0]+'_cover'+'.png';
            var bufData = new Buffer(audio_data.data, 'base64');
            qiniuService.uploadFileBuf(uptoken, key, audio_tag.data, extra, function(err, tag_ret) {
              if (err) return cb2(err);
              audioInfo.cover_url = tag_ret.url;
              return cb2(null, audioInfo);
            })
          } else {
            return cb2(null, audioInfo);
          }
        },
        function(audioInfo, cb3) {
          // get other audio singer album etc... and create audio file
          if (audio_tag && audio_tag.title && audio_tag.title !== '') {
            audioInfo.title = audio_tag.title;
          }
          if (audio_tag && audio_tag.artist && audio_tag.artist !== '') {
            audioInfo.singer_name = audio_tag.artist;
          }

          if (audio_tag && audio_tag.comment && audio_tag.comment !== '') {
            var comment = JSON.parse(audio_tag.comment);
            if (typeof comment === 'object') {
              if (comment.hasOwnProperty('musicName')) {
                audioInfo.title = comment['musicName'];
              }
              if (comment.hasOwnProperty('artist')) {
                audioInfo.singer_name = comment['artist'][0][0];
              }
            }
          }

          fileProxy.create(audioInfo, function(err, new_audio) {
            if (err) return cb3(err);
            return cb3(null, new_audio);
          })
        }
      ], function(err, result) {
        if (err) return next(err);
        return res.json({
          status: 'success',
          file_info: {
            fileId: result._id,
            url: result.url,
            key: result.key
          }
        })
      })
    }
  },
  delete: function(req, res, next) {
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
  }
}
