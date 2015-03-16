var express = require('express');
var router = express.Router();
var user = require('../api/user');

router.post('/new', user.create);
router.post('/login', user.login);
router.get('/current', user.current);


module.exports = router;
