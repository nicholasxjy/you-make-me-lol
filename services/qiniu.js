var qiniu = require('qiniu');
var config = require('../config');
var async = require('async');
var request = require('request');

qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY;
var BUCKET_NAME = config.qiniu.BUCKET_NAME;
var DOMAIN = config.qiniu.DOMAIN;

module.exports = {
  generateUpToken: function() {
    var policy = new qiniu.rs.PutPolicy(BUCKET_NAME);
    return policy.token();
  },
  uploadFileLocalFile: function(localFile, key, uptoken, extra, cb) {
    var myExtra = extra || new qiniu.io.PutExtra();
    async.waterfall([
      function(cb1) {
        qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
          if (err) {
            return cb1(err);
          }
          ret.url = DOMAIN + '/' + ret.key;
          cb1(null, ret);
        });
      },
      function(ret, cb2) {
        var image_info_url = ret.url+'?imageInfo';
        request({url: image_info_url, json: true}, function(err, res, info) {
          if (err) return cb2(err);
          var file_info = {
            url: ret.url,
            key: ret.key,
            hash: ret.hash,
            image_info: info
          };
          cb2(null, file_info);
        })
      }
    ], function(err, result) {
      if (err) return cb(err);
      cb(null, result);
    });
  },
  deleteFile: function(key, cb) {
    var client = new qiniu.rs.Client();
    client.remove(BUCKET_NAME, key, function(err, ret) {
      if (err) return cb(err);
      cb(null, ret);
    })
  }
}
