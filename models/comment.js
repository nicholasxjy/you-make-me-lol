var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Comment = new Schema({
  to_feed: {
    type: ObjectId,
    ref: 'Feed'
  },
  to_users: [{
    type: ObjectId,
    ref: 'User'
  }],
  creator: {
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
