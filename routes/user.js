var express = require('express');
var router = express.Router();
var user = require('../api/user');
var middleware = require('../middleware');

router.post('/new', user.create);
router.post('/login', user.login);
router.post('/update_info', middleware.checkUser, user.updateInfo);
router.post('/upload_image', middleware.checkUser, user.uploadImage);
router.get('/current', user.current);
router.get('/logout', user.logout);
router.get('/info', middleware.checkUser, user.getInfo);
router.get('/info_name', user.getInfoByName);
router.get('/notifications', middleware.checkUser, user.getNotis);

router.get('/followers_at', middleware.checkUser, user.getFollowesForAt);

router.post('/follow', middleware.checkUser, user.follow);
router.post('/unfollow', middleware.checkUser, user.unfollow);

router.post('/mark_notis', middleware.checkUser, user.markNotis);

router.get('/followers', user.getFollowers);
router.get('/followees', user.getFollowees);
module.exports = router;
