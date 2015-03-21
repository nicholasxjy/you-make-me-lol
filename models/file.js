var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var config = require('../config');

var File = new Schema({
  key: String,
  url: String,
  author: {
    type: ObjectId,
    ref: 'User'
  },
  caption: {
    type: String,
    default: ''
  },
  hash: String,
  mimeType: String,
  category: {
    type: String,
    enum: config.feed_default.categories
  },
  width: {
    type: Number,
    default: 0
  },
  height: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('File', File);
