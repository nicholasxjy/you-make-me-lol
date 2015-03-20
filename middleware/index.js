module.exports = {
  checkUser: function(req, res, next) {
    var sess = req.session;
    if (!sess || !sess.user) {
      return res.sendStatus(403);
    }
    next();
  }
}
