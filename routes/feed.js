var express = require('express');
var router = express.Router();
var feed = require('../api/feed');
var middleware = require('../middleware');

router.post('/upload_photo', middleware.checkUser, feed.uploadPhoto);
router.post('/remove_file', middleware.checkUser, feed.removeFile);
router.post('/create', middleware.checkUser, feed.create);
router.post('/upload_video', middleware.checkUser, feed.uploadVideo);
router.get('/getfeeds', feed.getFeeds);
module.exports = router;
