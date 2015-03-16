var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var util = require('util');
var config = require('../config');

transporter = nodemailer.createTransport(smtpTransport(config.mail_config));
module.exports = {
  sendActiveEmail: function(email, token, id) {
    var from = util.format('%s <%s>', config.site.name, config.mail_config.auth.user);
    var to = email;
    var subject = config.site.name + '帐号激活';
    var content = '<h2><a href='+ config.site.host +'/active_account?token='+ token +'&id='+ id +'>帐号激活</a></h2>';
    transporter.sendMail({
      from: from,
      to: to,
      subject: subject,
      html: content
    }, function(err, res) {
      if (err) {
        console.log('Send Active Email Error: ', err.message);
      }
    })
  }
}