var crypto = require('crypto');
var config = require('../config');

module.exports = {
  md5Hash: function(str) {
    var hash = crypto.createHash('md5');
    hash.update(str);
    _str = hash.digest('hex');
    return _str;
  },
  enCrypt: function(str, secret) {
    var cipher = crypto.createCipher('aes192', secret);
    var enstr = cipher.update(str, 'utf8', 'hex');
    enstr += cipher.final('hex');
    return enstr;
  },
  deCrypt: function(str, secret) {
    var cipher = crypto.createCipheriv('aes192', secret);
    var destr = cipher.update(str, 'hex', 'utf8');
    destr += cipher.final('utf8');
    return destr;
  }
}