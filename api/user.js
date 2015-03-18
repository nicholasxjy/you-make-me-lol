var UserProxy = require('../proxy/user');
var validator = require('validator');
var async = require('async');
var CryptService = require('../services/crypt');
var EmailService = require('../services/email');
var config = require('../config');

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
    UserProxy.getUserById(sess.user, function(err, user) {
      if (err) return next(err);
      return res.json({
        status: 'success',
        user: user
      })
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
  }
}
