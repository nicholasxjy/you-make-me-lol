var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Tag = new Schema({
  text: {
    type: String,
    unique: true,
    index: true
  }
});

mongoose.model('Tag', Tag);