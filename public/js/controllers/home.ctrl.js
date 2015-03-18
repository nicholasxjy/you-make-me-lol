'use strict';

(function() {
  angular
    .module('showfieApp')
    .controller('HomeCtrl', [
      'UserService',
      '$state',
      function(UserService, $state) {
        var self = this;

        UserService.currentUser()
          .then(function(data) {
            self.current_user = data;
            console.log(data);
          })

        self.logout = function() {
          UserService.logout()
            .then(function(data) {
              if (data.status === 'success') {
                $state.go('welcome');
              } else {
                alert('logout wrong!')
              }
            }, function(err) {
              console.log(err);
            })
        }
      }
    ])
})();
