var async = require('async');
var qiniuService = require('../services/qiniu');
var fileProxy = require('../proxy/file');
var feedProxy = require('../proxy/feed');
var tagProxy = require('../proxy/tag');
var UserProxy = require('../proxy/user');
var commentProxy = require('../proxy/comment');
var utils = require('../services/utils');
var id3 = require('id3js');
var NotiProxy = require('../proxy/notification');

exports.create = function(req, res, next) {
  var userId = req.session.user;
  //first update every file caption if category is image

  var category = req.body.category;
  var files = req.body.share_files;
  var text = req.body.text;
  var tags = req.body.tags;
  var location = req.body.location;

  var feedData = {};

  feedData.category = category;
  feedData.content = text;
  feedData.location = location;

  //check file
  feedData.files = files.map(function(file) {
    return file.fileId;
  })

  async.waterfall([
    function(cb1) {
      //create tags
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
    },
    function(tags, cb2) {
      feedData.tags = tags.map(function(tag) {
        return tag._id;
      });
      feedProxy.create(userId, feedData, function(err, newFeed) {
        if (err) return cb2(err);
        UserProxy.addPost(userId, function(err) {
          if (err) return cb2(err);
          return cb2(null, newFeed);
        })
      })
    },
    function(newFeed, cb4) {
      //handle content send notification to at users
      NotiProxy.sendNotiToAtUsers(newFeed, function(err, doc) {
        if (err) return cb4(err);
        if (!doc) return cb4(null, {feed: newFeed});
        var noti = {
          type: 'AT',
          text: '在post里@了你',
          sender: userId,
          feed: newFeed._id
        };

        NotiProxy.create(noti, function(err, noti) {
          if (err) return cb4(err);
          return cb4(null, {at_users: doc.users, noti: noti, feed: newFeed});
        })
      })
    },
    function(doc, cb5) {
      if (doc && doc.noti) {
        var at_ids = doc.at_users.map(function(user) {
          if (user && user._id) {
            return user._id;
          }
        })
        if (at_ids && at_ids.length > 0) {
          UserProxy.saveNewNotification(at_ids, doc.noti._id, function(err) {
            if (err) return cb5(err);
            return cb5(null, doc.feed);
          })
        } else {
          return cb5(null, doc.feed);
        }
      } else {
        return cb5(null, doc.feed);
      }
    }
  ], function(err, result) {
    if (err) return next(err);
    if (category === 'image') {
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
        if (err) return next(err);
        return res.json({
          status: 'success',
          new_feed_id: result._id
        })
      })
    } else {
      return res.json({
        status: 'success',
        new_feed_id: result._id
      })
    }
  })
};

exports.delete = function(req, res, next) {
  var userId = req.session.user;
  var feedId = req.body.feedId;
  if (!feedId) {
    return res.sendStatus(403);
  }
  async.waterfall([
    function(cb1) {
      feedProxy.getFeedById(feedId, function(err, feed) {
        if (err) return cb1(err);
        if (userId.toString() !== feed.creator.toString()) {
          return res.sendStatus(403);
        }
        feed.remove(function(err) {
          if (err) return cb1(err);
          return cb1(null);
        })
      })
    },
    function(cb2) {
      UserProxy.getUserById(userId, 'post_count', function(err, user) {
        if (err) return cb2(err);
        user.post_count -= 1;
        if (user.post_count < 0) {
          user.post_count = 0;
        }
        user.save(function(err) {
          if (err) return cb2(err);
          return cb2(null);
        })
      })
    }
  ], function(err) {
    if (err) return next(err);
    return res.json({
      status: 'success'
    })
  })
};

exports.deleteComment = function(req, res, next) {
  var userId = req.session.user;
  var feedId = req.body.feedId;
  var commentId = req.body.commentId;

  if (!feedId || !commentId) {
    return res.sendStatus(403);
  }
  async.waterfall([
    function(cb1) {
      commentProxy.findById(commentId, function(err, comment) {
        if (err) return cb1(err);
        if (userId.toString() !== comment.creator.toString()) {
          return res.sendStatus(403);
        }
        return cb1(null, comment);
      })
    },
    function(comment, cb2) {
      feedProxy.getFeedById(feedId, function(err, feed) {
        if (err) return cb2(err);
        feed.comments.pull(comment._id);
        feed.save(function(err) {
          if (err) return cb2(err);
          return cb2(null, comment);
        })
      })
    },
    function(comment, cb3) {
      comment.remove(function(err) {
        if (err) return cb3(err);
        return cb3(null);
      })
    }
  ], function(err) {
    if (err) return next(err);
    return res.json({
      status: 'success'
    })
  })
};

exports.getFeeds = function(req, res, next) {
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
};

exports.getDetail = function(req, res, next) {
  var feedId = req.query.feedId;
  if (!feedId) {
    return res.sendStatus(404);
  }
  feedProxy.getDetail(feedId, function(err, feed) {
    if (err) return next(err);
    if (!feed) {
      return res.sendStatus(404);
    }
    feed = feed.toObject();
    if (req.session && req.session.user) {
      feed = utils.checkFeedLike(feed, req.session.user);
      feed.creator = utils.checkFollowRelationByFollowees(feed.creator, req.session.user);
    }
    feed.likes_count = feed.likes.length;
    feed.likes = feed.likes.slice(-10);
    feed.comments_count = feed.comments.length;
    feed.comments = feed.comments.slice(0, 10);
    res.json(feed);
  })
};

exports.toggleLike = function(req, res, next) {
  var userId = req.session.user;
  var feedId = req.body.feedId;


  if (!feedId) {
    return res.sendStatus(403);
  }
  async.waterfall([
    function(cb1) {
      feedProxy.getFeedById(feedId, function(err, feed) {
        if (err) return cb1(err);
        var isLike = feed.likes.some(function(likeId) {
          return userId.toString() === likeId.toString();
        });
        return cb1(null, {feed: feed, isLike: isLike});
      })
    },
    function(doc, cb2) {
      var likeUsers = [];
      if (doc.isLike) {
        doc.feed.likes.pull(userId);
      } else {
        doc.feed.likes.unshift(userId);
      }
      doc.feed.save(function(err, new_feed) {
        if (err) return cb2(err);
        return cb2(null, {new_feed: new_feed, isLike: doc.isLike});
      });
    },
    function(doc, cb3) {
      if (!doc.isLike) {
        var ids = [];
        ids.push(userId);
        ids.push(doc.new_feed.creator);
        UserProxy.findUsersByIds(ids, '_id name avatar notifications', function(err, docs) {
          if (err) return cb3(err);
          if (docs && docs.length === 2) {
            cb3(null, {c_user: docs[0], f_user: docs[1], feed: doc.new_feed})
          } else {
            cb3(new Error('users length not right...'))
          }
        })
      } else {
        cb3(null, null);
      }
    },
    function(noti, cb4) {
      if (noti && noti.c_user && noti.f_user && noti.feed) {
        var noti_obj = {
          type: 'LIKE',
          feed: noti.feed._id,
          text: ' liked your feed!',
          sender: userId
        }
        NotiProxy.create(noti_obj, function(err, new_noti) {
          if (err) return cb4(err);
          noti.f_user.notifications.unshift(new_noti._id);
          noti.f_user.save(function(err) {
            if (err) return cb4(err);
            return cb4(null);
          })
        })
      } else {
        cb4(null);
      }
    }
  ], function(err) {
    if (err) return next(err);
    return res.json({
      status: 'success'
    });
  })
};

exports.addComment = function(req, res, next) {
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
      if (atUsers && atUsers.length > 0) {
        var userNames = atUsers.map(function(atUser) {
          var arr = atUser.trim().split('@');
          return arr[arr.length -1];
        });
        utils.formatContentByUserNames(userNames, content, function(err, doc) {
          if (err) return cb2(err);
          doc.feed = feed;
          return cb2(null, doc);
        })
      } else {
        var users = [];
        users.push(feed.creator);
        return cb2(null, {feed: feed, content: content, users: users});
      }
    },
    function(doc, cb3) {
      commentProxy.create(doc.feed._id, userId, doc.users, doc.content, function(err, comment) {
        if (err) return cb3(err);
        doc.feed.comments.push(comment._id);
        var _comment = {
          _id: comment._id,
          creator: comment.creator,
          to_users: comment.to_users,
          content: comment.content,
          createdAt: comment.createdAt
        }
        doc.feed.save(function(err) {
          if (err) return cb3(err);
          return cb3(null, {new_comment: _comment, feed: doc.feed});
        })
      })
    },
    function(doc, cb4) {
      var noti_obj = {
        type: 'COMMENT',
        text: doc.new_comment.content,
        sender: userId,
        feed: doc.feed._id
      };
      NotiProxy.create(noti_obj, function(err, new_noti) {
        if (err) return cb4(err);
        doc.new_comment.to_users.push(doc.feed.creator);
        return cb4(null, {noti: new_noti, comment: doc.new_comment});
      })
    },
    function(doc, cb5) {
      UserProxy.saveNewNotification(doc.comment.to_users, doc.noti._id,function(err) {
        if (err) return cb5(err);
        return cb5(null, doc.comment);
      })
    }
  ], function(err, result) {
    if (err) return next(err);
    return res.json({
      status: 'success',
      new_comment: result
    })
  })
};

exports.getUserFeeds = function(req, res, next) {
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
};

exports.moreComments = function(req, res, next) {
  var feedId = req.query.feedId;
  var skip = req.query.skip;
  if (!feedId) {
    return res.sendStatus(404);
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
      feedProxy.moreComments(feed, skip, function(err, pfeed) {
        if (err) return cb2(err);
        return cb2(null, pfeed.comments);
      })
    }
  ], function(err, results) {
    if (err) return next(err);
    return res.json({
      status: 'success',
      comments: results
    })
  })
};
