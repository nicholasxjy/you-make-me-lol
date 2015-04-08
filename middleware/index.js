var userProxy = require('../proxy/user');
var feedProxy = require('../proxy/feed');

module.exports = {
  checkUser: function(req, res, next) {
    var sess = req.session;
    if (!sess || !sess.user) {
      return res.sendStatus(403);
    }
    userProxy.getUserById(sess.user, null, function(err, user) {
      if (err) return next(err);
      if (!user) return res.sendStatus(403);
      next();
    });
  },
  checkFeed: function(req, res, next) {
    var feedId = req.body.feedId || req.query.feedId;
    feedProxy.getFeedById(feedId, function(err, feed) {
      if (err) return next(err);
      if (!feed) return res.sendStatus(404);
      next();
    });
  }
}
