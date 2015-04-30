(function() {
  'use strict';
  angular
    .module('showfieApp')
    .controller('MessageCtrl', [
      'UserService',
      function(UserService) {
        var self = this;
        UserService.currentUser()
          .then(function(res) {
            self.current_user = res.user;
            self.isAuthticated = true;
            return res.user;
          })
          .then(function(user) {
            UserService.getNotifications()
              .then(function(data) {
                self.notifications = data;
              })
          })

        self.markAllNoti = function() {
          UserService.markAllNoti()
            .then(function(data) {
              self.markedAll = true;
              self.current_user.notifications = [];
            }, function(err) {
              console.log(err);
            })
        }
      }
    ])
})();
