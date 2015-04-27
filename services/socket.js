var app = require('../app');
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(8080);

module.exports = function(cb) {
  io.on('connection', cb)
}
