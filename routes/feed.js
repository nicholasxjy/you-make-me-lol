var express = require('express');
var router = express.Router();
var feed = require('../api/feed');
var middleware = require('../middleware');

router.post('/create', middleware.checkUser, feed.create);
router.post('/delete', middleware.checkUser, feed.delete);
router.post('/delete_comment', middleware.checkUser, feed.deleteComment);

router.post('/toggle_like', middleware.checkUser, feed.toggleLike);
router.post('/add_comment', middleware.checkUser, feed.addComment);
router.get('/getfeeds', feed.getFeeds);
router.get('/detail', feed.getDetail);
router.get('/user_feeds', feed.getUserFeeds);

router.get('/more_comments', feed.moreComments);

module.exports = router;
