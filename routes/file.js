var express = require('express');
var router = express.Router();
var middleware = require('../middleware');
var file = require('../api/file');

router.post('/upload', middleware.checkUser, file.upload);
router.post('/delete', middleware.checkUser, file.delete);

module.exports = router;
