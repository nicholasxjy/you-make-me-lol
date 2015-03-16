var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Comment = new Schema({
  to_feed: {
    type: ObjectId,
    ref: 'Feed'
  },
  to_user: {
    type: ObjectId,
    ref: 'User'
  },
  author: {
    type: ObjectId,
    ref: 'User'
  },
  content: {
    type: String
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

mongoose.model('Comment', Comment);
