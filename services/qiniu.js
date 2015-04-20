var qiniu = require('qiniu');
var config = require('../config');
var async = require('async');
var request = require('request');
var CryptService = require('./crypt');

qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY;
var BUCKET_NAME = config.qiniu.BUCKET_NAME;
var DOMAIN = config.qiniu.DOMAIN;

module.exports = {
  generateUpToken: function() {
    var policy = new qiniu.rs.PutPolicy(BUCKET_NAME);
    return policy.token();
  },
  uploadFileBuf: function(uptoken, key, body, extra, cb) {
    var myExtra = extra || new qiniu.io.PutExtra();
    qiniu.io.put(uptoken, key, body, extra, function(err, ret) {
      if (err) return cb(err);
      ret.url = DOMAIN + '/' + ret.key;
      return cb(null, ret);
    })
  },
  uploadFileLocalFile: function(fileObj, localFile, key, uptoken, extra, cb) {
    var myExtra = extra || new qiniu.io.PutExtra();
    if (fileObj.category === 'audio') {
      async.parallel({
        audio: function(cb1) {
          qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
            if (err) {
              cb1(err);
            }
            ret.url = DOMAIN + '/' + ret.key;
            cb1(null, ret);
          });
        },
        cover: function(cb2) {
          if (fileObj.audio_data && fileObj.audio_data !== '') {
            var bufData = new Buffer(fileObj.audio_data, 'base64');
            var myExtra = extra || new qiniu.io.PutExtra();
            qiniu.io.put(uptoken, key.split('.')[0]+'_cover'+'.png', bufData, extra, function(err, ret) {
              if (err) return cb2(err);
              ret.url = DOMAIN + '/' + ret.key;
              return cb2(null, ret);
            });
          } else {
            return cb2(null);
          }
        }
      }, function(err, result) {
        if (err) return cb(err);
        return cb(null, result);
      })
    } else {
      qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
        if (err) {
          return cb(err);
        }
        ret.url = DOMAIN + '/' + ret.key;
        return cb(null, ret);
      });
    }
  },
  deleteFile: function(key, cb) {
    var client = new qiniu.rs.Client();
    client.remove(BUCKET_NAME, key, function(err, ret) {
      if (err) return cb(err);
      cb(null, ret);
    })
  }
}
