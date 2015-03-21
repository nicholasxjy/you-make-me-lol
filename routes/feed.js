var express = require('express');
var router = express.Router();
var feed = require('../api/feed');
var middleware = require('../middleware');

router.post('/upload_photo', middleware.checkUser, feed.uploadPhoto);
router.post('/remove_photo', middleware.checkUser, feed.removePhoto);
router.post('/create', middleware.checkUser, feed.create);
module.exports = router;
