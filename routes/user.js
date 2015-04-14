var express = require('express');
var router = express.Router();
var user = require('../api/user');
var middleware = require('../middleware');

router.post('/new', user.create);
router.post('/login', user.login);
router.get('/current', user.current);
router.get('/logout', user.logout);
router.get('/info', middleware.checkUser, user.getInfo);
module.exports = router;
