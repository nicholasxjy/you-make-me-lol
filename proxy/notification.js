var Noti = require('../models').Notification;
var async = require('async');
var userProxy = require('../proxy/user');
var utils = require('../services/utils');


function create(obj, cb) {
  var noti = new Noti();
  noti.noti_type = obj.type;
  noti.noti_text = obj.text;
  noti.sender = obj.sender;
  noti.to_feed = obj.feed;
  noti.save(cb);
};

exports.create = create;

exports.markAllNoti = function(user, cb) {
  Noti.update({_id: {'$in': user.notifications}}, {read: true}, {multi: true}, cb);
};

exports.sendNotiToAtUsers = function(feed, cb) {
  if (feed && feed.content && feed.content !== '') {
    var regex = /@\w+\s/g;
    var atUsers = data.content.match(regex);
    if (atUsers && atUsers.length > 0) {
      var usernames = atUsers.map(function(atuser) {
        var arr = atuser.trim().split('@');
        return arr[arr.length -1];
      });
      utils.formatContentByUserNames(usernames, feed.content, function(err, doc) {
        if (err) return cb(err);
        return cb(null, doc);
      })
    } else {
      return cb(null, null);
    }
  } else {
    return cb(null, null);
  }
}
