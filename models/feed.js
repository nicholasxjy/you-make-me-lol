var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var config = require('../config');

var Feed = new Schema({

  category: {
    type: String,
    emnu: config.feed_default.categories,
  },
  content: {
    type: String,
    default: ''
  },
  attach_files: [{
    type: ObjectId,
    ref: 'File'
  }],
  creator: {
    type: ObjectId,
    ref: 'User'
  },
  comments: [{
    type: ObjectId,
    ref: 'Comment'
  }],
  likes:[{
    type: ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Feed', Feed);
