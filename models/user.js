var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var config = require('../config');
var bcrypt = require('bcrypt');

var User = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
  },
  nickname: {
    type: String
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    index: true
  },
  avatar: {
    type: String,
    default: config.user_default.avatar
  },
  bg_image: {
    type: String,
    default: config.user_default.bg_image
  },
  bg_blur_image: {
    type: String,
    default: config.user_default.bg_blur_image
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  gender: {
    type: String,
    enmu: config.user_default.genders,
    default: 'Secret'
  },
  age: {
    type: Number,
    default: config.user_default.age
  },
  location: {
    type: String,
    default: config.user_default.location
  },
  profile: {
    type: String,
    default: config.user_default.profile
  },
  post_count: {
    type: Number,
    default: 0
  },
  weibo: {
    type: String,
    default: ''
  },
  weichat: {
    type: String,
    default: ''
  },
  qq: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: false
  },
  followers: [{
    type: ObjectId,
    ref: 'User'
  }],
  followees: [{
    type: ObjectId,
    ref: 'User'
  }],
  notifications: [{
    type: ObjectId,
    ref: 'Notification'
  }],
  bookmarks: [{
    type: ObjectId,
    ref: 'Feed'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  last_Login_date: {
    type: Date
  }
});

User.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(config.salt_rounds, function(err, salt) {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;
      return next();
    });
  });
});

User.methods.comparePass = function(pass, cb) {
  var self = this;
  bcrypt.compare(pass, self.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    return cb(null, isMatch);
  });
};

mongoose.model('User', User);
