var UserProxy = require('../proxy/user');
var FeedProxy = require('../proxy/feed');
var validator = require('validator');
var async = require('async');
var CryptService = require('../services/crypt');
var EmailService = require('../services/email');
var qiniuService = require('../services/qiniu');
var config = require('../config');
var utils = require('../services/utils');
var NotiProxy = require('../proxy/notification');

module.exports = {
  create: function(req, res, next) {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var sess = req.session;

    if (!name || !email || !password) {
      return res.json({
        status: 'fail',
        msg: '信息不完整!'
      });
    }

    if (name.length < 6 || name.length > 20) {
      return res.json({
        status: 'fail',
        msg: '用户名长度为6-20'
      });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        status: 'fail',
        msg: '邮箱地址格式不正确'
      });
    }

    if (password.length < 6) {
      return res.json({
        status: 'fail',
        msg: '密码长度不小于6'
      });
    }

    if (!validator.isAlphanumeric(name)) {
      return res.json({
        status: 'fail',
        msg: '用户名只允许字母或数字'
      });
    }

    //check name and email unique
    async.waterfall([
      function(cb1) {
        UserProxy.findUsersByName(name, function(err, users) {
          if (err) return cb1(err);
          if (users && users.length > 0) {
            return res.json({
              status: 'fail',
              msg: '用户名已被注册'
            });
          }
          cb1(null);
        })
      },
      function(cb2) {
        UserProxy.findUsersByEmail(email, function(err, users) {
          if (err) return cb2(err);
          if (users && users.length > 0) {
            return res.json({
              status: 'fail',
              msg: '此邮箱已注册'
            })
          }
          cb2(null);
        })
      }
    ], function(err) {
      if (err) return next(err);
      //here should check these fields
      UserProxy.create(name, email, password, function(err, new_user) {
        if (err) return next(err);
        sess.user = new_user._id;
        //create cookie and send active email
        var token = CryptService.md5Hash(new_user.email+config.session_secret);
        EmailService.sendActiveEmail(new_user.email, token, new_user._id);
        var _cookieStr = new_user._id + '||' + new_user.name + '||' + new_user.email;
        var cookieToken = CryptService.enCrypt(_cookieStr, config.cookie.secret);

        res.cookie(config.cookie.name, cookieToken, {path: '/', maxAge: config.cookie.maxage});

        res.json({
          status: 'success',
          new_user: new_user
        });
      });
    })
  },
  login: function(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    var sess = req.session;
    if (!email || !password) {
      return res.json({
        status: 'fail',
        msg: '信息不完整!'
      });
    }

    async.waterfall([
      function(cb1) {
        UserProxy.getUserByEmail(email, function(err, user) {
          if (err) return cb1(err);
          if (!user) {
            return res.json({
              status: 'fail',
              msg: '没有此用户'
            });
          }
          cb1(null, user);
        })
      },
      function(user, cb2) {
        user.comparePass(password, function(err, isMatch) {
          if (err) return cb2(err);
          if (!isMatch) {
            return res.json({
              status: 'fail',
              msg: '邮箱和密码不匹配'
            })
          }
          cb2(null, user);
        })
      }
    ], function(err, result) {
      if (err) return next(err);
      sess.user = result._id;
      var _cookieStr = result._id + '||' + result.name + '||' + result.email;
      var cookieToken = CryptService.enCrypt(_cookieStr, config.cookie.secret);
      res.cookie(config.cookie.name, cookieToken, {path: '/', maxAge: config.cookie.maxage});
      return res.json({
        status: 'success',
        user: result
      })
    })
  },
  current: function(req, res, next) {
    var sess = req.session;
    if (!sess || !sess.user) {
      return res.sendStatus(404);
    }
    UserProxy.getCurrentUserInfo(sess.user, function(err, user) {
      if (err) return next(err);
      return res.json({
        status: 'success',
        user: user
      })
    });
  },
  getInfo: function(req, res, next) {
    var userId = req.session.user;
    var fields = '_id name avatar email age gender profile location bg_image';
    UserProxy.getUserById(userId, fields, function(err, user) {
      if (err) return next(err);
      return res.json({
        status: 'success',
        user: user
      })
    })
  },
  updateInfo: function(req, res, next) {
    var userId = req.session.user;
    var info = req.body.info;
    if (!info) {
      return res.json({
        status: 'fail',
        msg: 'Not set anything to update!'
      })
    }
    var fields = 'name age gender profile location';
    UserProxy.getUserById(userId, fields, function(err, user) {
      if (err) return next(err);
      if (!user) return res.sendStatus(403);
      user.name = info.name;
      user.age = info.age;
      user.gender = info.gender;
      user.location = info.location;
      user.profile = info.profile;

      user.save(function(err) {
        if (err) return next(err);
        return res.json({
          status: 'success',
          msg: 'Informations update successfully'
        })
      })
    })
  },
  uploadImage: function(req, res, next) {
    var userId = req.session.user;
    var file = req.files.file;
    var type = req.body.type;
    if (file === null || file === undefined) {
      return res.json({
        status: 'fail',
        msg: 'No file found!'
      });
    }
    async.parallel({
      user: function(cb1) {
        var fields = "_id avatar bg_image bg_blur_image";
        UserProxy.getUserById(userId, fields, function(err, user) {
          if (err) return cb1(err);
          return cb1(null, user);
        })
      },
      image: function(cb2) {
        var uptoken = qiniuService.generateUpToken();
        qiniuService.uploadFileLocalFile(file.mimetype, file.path, file.name, uptoken, null, function(err, file_info) {
          if (err) return cb2(err);
          cb2(null, file_info);
        });
      }
    }, function(err, result) {
      if (err) return next(err);
      if (type === 'user-avatar') {
        result.user.avatar = result.image.url + '?imageView2/5/w/200/h/200';
        result.user.save(function(err) {
          if (err) return next(err);
          return res.json({
            status: 'success',
            url: result.user.avatar
          })
        })
      } else {
        result.user.bg_image = result.image.url;
        result.user.bg_blur_image = result.image.url + '?imageMogr2/blur/50x50';
        result.user.save(function(err) {
          if (err) return next(err);
          return res.json({
            status: 'success',
            url: result.user.bg_image,
            blur_url: result.user.bg_blur_image
          })
        })
      }
    })
  },
  logout: function(req, res, next) {
    var sess = req.session;
    if (!sess || !sess.user) {
      return res.sendStatus(403);
    }
    sess.destroy(function(err) {
      if (err) return next(err);
      res.clearCookie(config.cookie.name, {path: '/'});
      res.json({
        status: 'success'
      });
    });
  },
  getInfoByName: function(req, res, next) {
    var name = req.query.name;
    if (!name) {
      return res.sendStatus(404);
    }
    async.waterfall([
      function(cb1) {
        var fields = '_id name avatar bg_image bg_blur_image age gender location profile followers followees post_count';
        UserProxy.getUserByName(name, fields, function(err, user) {
          if (err) return cb1(err);
          if (!user) {
            return res.sendStatus(404);
          }
          if (req.session && req.session.user) {
            if (req.session.user.toString() !== user._id.toString()) {
              //check user follow relation
              user = utils.checkFollowRelationByFollowees(user, req.session.user);
            }
          }
          return cb1(null, user);
        })
      }
    ], function(err, result) {
      if (err) return next(err);
      return res.json({
        status: 'success',
        user: result
      })
    })
  },
  getFollowesForAt: function(req, res, next) {
    var userId = req.session.user;

    UserProxy.getFollowesForAt(userId, function(err, user) {
      if (err) return next(err);
      var users = [];
      user.followers.forEach(function(follower) {
        var _user = {};
        _user.label = follower.name;
        _user._id = follower._id;

        users.push(_user);
      })
      return res.json({
        status: 'success',
        users: users
      })
    })
  },
  follow: function(req, res, next) {
    var userId = req.session.user;
    var followId = req.body.followId;
    if (!followId) {
      return res.sendStatus(403);
    }
    async.waterfall([
      function(cb1) {
        UserProxy.getUserById(userId, '_id name avatar followers', function(err, user) {
          if (err) return cb1(err);
          user.followers.push(followId);
          user.save(function(err, user) {
            if (err) return cb1(err);
            return cb1(null, user);
          })
        })
      },
      function(c_user, cb2) {
        UserProxy.getUserById(followId, '_id followees notifications', function(err, user) {
          if (err) return cb2(err);
          f_user = user;
          user.followees.push(userId);
          user.save(function(err, user) {
            if (err) return cb2(err);
            return cb2(null, {c_user: c_user, f_user: user});
          })
        })
      },
      function(noti, cb3) {
        //here send notification
        var noti_obj = {
          type: 'FOLLOW',
          sender: userId,
          text: ' followed you!',
          feed: null
        };
        NotiProxy.create(noti_obj, function(err, new_noti) {
          if (err) return cb3(err);
          noti.f_user.notifications.push(new_noti._id);
          noti.f_user.save(function(err) {
            if (err) return cb3(err);
            return cb3(null);
          })
        })
      }
    ], function(err, result) {
      if (err) return next(err);
      return res.json({
        status: 'success'
      })
    })
  },
  unfollow: function(req, res, next) {
    var userId = req.session.user;
    var unfollowId = req.body.unfollowId;
    if (!unfollowId) {
      return res.sendStatus(403);
    }

    async.parallel({
      unfollower: function(cb1) {
        UserProxy.getUserById(userId, 'followers', function(err, user) {
          if (err) return cb1(err);
          user.followers.pull(unfollowId);
          user.save(function(err, newUser) {
            if (err) return cb1(err);
            return cb1(null);
          })
        })
      },
      unfollowee: function(cb2) {
        UserProxy.getUserById(unfollowId, 'followees', function(err, user) {
          if (err) return cb2(err);
          user.followees.pull(userId);
          user.save(function(err) {
            if (err) return cb2(err);
            return cb2(null);
          })
        })
      }
    }, function(err, result) {
      if (err) return next(err);
      return res.json({
        status: 'success'
      })
    })
  }
}
