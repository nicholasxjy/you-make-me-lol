(function() {
  'use strict';
  angular
    .module('showfieApp')
    .controller('SettingCtrl', [
      'UserService',
      'ngCoolNoti',
      function(UserService, ngCoolNoti) {
        var self = this;
        self.user = {};
        UserService.getUserInfo()
          .then(function(data) {
            self.current_user = data.user;
            angular.copy(self.current_user, self.user);
            self.isAuthticated = true;
          })
      }
    ])
})();
