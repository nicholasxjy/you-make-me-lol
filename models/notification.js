var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Noti = new Schema({
  read: {
    type: Boolean,
    default: false
  },
  noti_type: {
    type: String,
    default: ''
  },
  noti_text: {
    type: String,
    default: ''
  },
  sender: {
    type: ObjectId,
    ref: 'User'
  },
  to_feed: {
    type: ObjectId,
    ref: 'Feed'
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

mongoose.model('Notification', Noti);
