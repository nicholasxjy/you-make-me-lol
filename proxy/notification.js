var Noti = require('../models').Notification;

module.exports = {
  create: function(obj, cb) {
    var noti = new Noti();
    noti.noti_type = obj.type;
    noti.noti_text = obj.text;
    noti.sender = obj.sender;
    noti.to_feed = obj.feed;
    noti.save(cb);
  }
}
