var User = require('../models').User;

module.exports = {
  create: function(name, email, password, cb) {
    var user = new User();
    user.name = name;
    user.email = email;
    user.password = password;
    user.save(cb);
  },
  findUsersByName: function(name, cb) {
    User.find({name: name}, cb);
  },
  findUsersByEmail: function(email, cb) {
    User.find({email: email}, cb);
  },
  getUserByEmail: function(email, cb) {
    User.findOne({email: email}).select('+password').exec(cb);
  },
  getUserById: function(id, fields, cb) {
    fields = fields || null;
    User.findById(id, fields, cb);
  },
  getUserByName: function(name, fields, cb) {
    fields = fields || null;
    User.findOne({name: name}, fields, cb)
  },
  addPost: function(userId, cb) {
    User.findById(userId, 'post_count', function(err, user) {
      if (err) return cb(err);
      user.post_count = user.post_count + 1;
      user.save(cb);
    })
  }
}
