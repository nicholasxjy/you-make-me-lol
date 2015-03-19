'use strict';

(function() {
  angular
    .module('showfieApp')
    .controller('UserCtrl', [
      'UserService',
      '$stateParams',
      function(UserService, $stateParams) {
        var self = this;
        UserService.currentUser()
          .then(function(user) {
            self.current_user = user;
          })
      }
    ])
})();
