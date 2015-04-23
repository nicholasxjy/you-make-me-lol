(function() {
  'use strict';
  angular
    .module('showfieApp')
    .controller('MessageCtrl', [
      'UserService',
      function(UserService) {
        var self = this;
        UserService.currentUser()
          .then(function(user) {
            self.current_user = user;
            self.isAuthticated = true;
            return user;
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
