var async = require('async');
var qiniuService = require('../services/qiniu');
var fileProxy = require('../proxy/file');
var feedProxy = require('../proxy/feed');
var tagProxy = require('../proxy/tag');
var UserProxy = require('../proxy/user');
var commentProxy = require('../proxy/comment');
var utils = require('../services/utils');
var id3 = require('id3js');


module.exports = {
  uploadFile: function(req, res, next) {
    var userId = req.session.user;
    var file = req.files.file;
    var category = req.body.category;
    var title = req.body.title;
    var artist = req.body.artist || '';
    var comment = req.body.comment;
    var audio_data = req.body.audio_data || '';

    var fileObj = {};
    fileObj.category = category;
    fileObj.artist = artist;
    fileObj.audio_data = audio_data;
    fileObj.title = title;
    if (category === 'audio' && comment !== '') {
      var _comment = JSON.parse(comment);
      fileObj.comment = _comment;
    }
    if (file === null || file === undefined) {
      return res.json({
        status: 'fail',
        msg: 'No file found!'
      });
    }
    async.waterfall([
      function(cb1) {
        var uptoken = qiniuService.generateUpToken();
        qiniuService.uploadFileLocalFile(fileObj, file.path, file.name, uptoken, null, function(err, file_info) {
          if (err) return cb1(err);
          cb1(null, file_info);
        });
      },
      function(file_info, cb2) {
        var _file_obj = null;
        if (category === 'audio') {
          var file_obj = {
            key: file_info.audio.key,
            url: file_info.audio.url,
            author: userId,
            hash: file_info.audio.hash,
            mimeType: file.mimetype,
            category: category,
            singer_name: fileObj.artist || '',
            title: title || comment['musicName'] || '',
            cover_url: file_info.cover.url,
            album: comment['album'] || ''
          };
          _file_obj = file_obj;
        } else {
          var file_obj = {
            key: file_info.key,
            url: file_info.url,
            author: userId,
            hash: file_info.hash,
            mimeType: file.mimetype,
            category: category,
          };
          _file_obj = file_obj;
        }

        fileProxy.create(_file_obj, function(err, newFile) {
          if (err) return cb2(err);
          file_info.fileId = newFile._id;
          cb2(null, file_info);
        })
      }
    ], function(err, result) {
      if (err) return next(err);
      if (category === 'image') {
        res.json({
          status: 'success',
          file_info: {
            fileId: result.fileId,
            key: result.key,
            url: result.url
          }
        })
      } else {
        res.json({
          status: 'success',
          file_info: {
            fileId: result.fileId
          }
        })
      }
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
    var location = req.body.location;

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

        data.location = location || 'Unknow';

        feedProxy.create(userId, data, function(err, newFeed) {
          if (err) return next(err);
          //here user post_count +1
          UserProxy.addPost(userId, function(err) {
            if (err) return next(err);
            res.json({
              status: 'success',
              new_feed_id: newFeed._id
            });
          })
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
          UserProxy.addPost(userId, function(err) {
            if (err) return next(err);
            res.json({
              status: 'success',
              new_feed_id: newFeed._id
            });
          })
        })

      })
    }
  },
  getFeeds: function(req, res, next) {
    var after = req.query.after;
    var query = null;
    if (after) {
      query = {
        createdAt: {$lt: after}
      };
    }

    var options = {
      sort: {
        createdAt: '-1'
      },
      limit: 30
    }
    feedProxy.getFeeds(query, options, function(err, feeds) {
      if (err) return next(err);

      if (req.session && req.session.user) {
        var userId = req.session.user;
        // check user like feed or not and slice likes 5 : slice(-5) for display
        feeds = utils.checkFeedsLike(feeds, userId);
        // check user and feed follow relation
        feeds = utils.checkFollowRelation(feeds, userId, function(err, f_feeds) {
          if (err) return next(err);
            res.json({
              status: 'success',
              feeds: f_feeds
            })
        })
      } else {
        res.json({
          status: 'success',
          feeds: feeds
        })
      }
    })
  },
  getDetail: function(req, res, next) {
    var feedId = req.query.feedId;
    if (!feedId) {
      return res.sendStatus(404);
    }
    feedProxy.getDetail(feedId, function(err, feed) {
      if (err) return next(err);
      if (!feed) {
        return res.sendStatus(404);
      }
      if (req.session && req.session.user) {
        feed = utils.checkFeedLike(feed, req.session.user);
      }

      feed.likes = feed.likes.slice(-6);
      res.json(feed);
    })
  },
  toggleLike: function(req, res, next) {
    var userId = req.session.user;
    var feedId = req.body.feedId;
    var isLike = req.body.isLike;

    if (!feedId) {
      return res.sendStatus(403);
    }
    async.waterfall([
      function(cb1) {
        feedProxy.getFeedById(feedId, function(err, feed) {
          if (err) return cb1(err);
          return cb1(null, feed);
        })
      },
      function(feed, cb2) {
        var likeUsers = [];
        if (isLike) {
          feed.likes.pull(userId);
        } else {
          feed.likes.push(userId);
        }
        feed.save(function(err) {
          if (err) return cb2(err);
          return cb2(null);
        });
      }
    ], function(err) {
      if (err) return next(err);
      return res.json({
        status: 'success'
      });
    })
  },
  addComment: function(req, res, next) {
    var feedId = req.body.feedId;
    var content = req.body.content;
    var userId = req.session.user;

    if (!feedId) {
      return res.sendStatus(404);
    }

    if (!content) {
      return res.json({
        status: 'fail',
        msg: 'Nothing to comment!'
      })
    }

    async.waterfall([
      function(cb1) {
        feedProxy.getFeedById(feedId, function(err, feed) {
          if (err) return cb1(err);
          if (!feed) return res.sendStatus(404);
          return cb1(null, feed);
        })
      },
      function(feed, cb2) {
        // here handle the comment to users
        // create html for comment content
        var regex = /@\w+\s/g;
        var atUsers = content.match(regex);
        console.log(atUsers);
        if (atUsers && atUsers.length > 0) {
          var userNames = atUsers.map(function(atUser) {
            var arr = atUser.trim().split('@');
            return arr[arr.length -1];
          });

          console.log(userNames)
          utils.formatCommentContentByUserNames(userNames, content, function(err, doc) {
            if (err) return cb2(err);
            doc.feed = feed;
            return cb2(null, doc);
          })
        }
      },
      function(doc, cb3) {
        commentProxy.create(doc.feed._id, userId, doc.users, doc.content, function(err, comment) {
          if (err) return cb3(err);
          doc.feed.comments.push(comment._id);
          var _comment = {
            id: comment._id,
            creator: comment.creator,
            to_users: comment.to_users,
            content: comment.content,
            createdAt: comment.createdAt
          }
          doc.feed.save(function(err) {
            if (err) return cb3(err);
            return cb3(null, _comment);
          })
        })
      }
    ], function(err, result) {
      if (err) return next(err);
      return res.json({
        status: 'success',
        new_comment: result
      })
    })
  },
  getUserFeeds: function(req, res, next) {
    var userId = req.query.userId;
    if (!userId) {
      return res.sendStatus(404);
    }
    async.waterfall([
      function(cb1) {
        UserProxy.getUserById(userId, null, function(err, user) {
          if (err) return cb1(err);
          if (!user) return res.sendStatus(404);
          return cb1(null, user);
        })
      },
      function(user, cb2) {
        feedProxy.getUserFeeds(user._id, function(err, feeds) {
          if (err) return cb2(err);
          return res.json(feeds);
        })
      }
    ])
  }
}
