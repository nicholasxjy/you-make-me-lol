'use strict';

(function() {
  angular
    .module('showfieApp')
    .controller('UserCtrl', [
      'UserService',
      '$stateParams',
      '$state',
      function(UserService, $stateParams, $state) {
        var self = this;
        var name = $stateParams.name;

        UserService.getUserInfoByName(name)
          .then(function(data) {
            if (data.status === 'success') {
              self.user = data.user;
            } else {
              $state.go('404');
            }
          }, function(err) {
            console.log(err);
          })

        UserService.currentUser()
          .then(function(user) {
            self.current_user = user;
            self.isAuthenticated = true;
          })
      }
    ])
})();
