var express = require('express');
var router = express.Router();
var feed = require('../api/feed');
var middleware = require('../middleware');

router.post('/upload_file', middleware.checkUser, feed.uploadFile);
router.post('/remove_file', middleware.checkUser, feed.removeFile);
router.post('/create', middleware.checkUser, feed.create);
router.get('/getfeeds', feed.getFeeds);
module.exports = router;
