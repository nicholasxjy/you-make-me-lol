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
  getUserById: function(id, cb) {
    User.findById(id, cb);
  }
}