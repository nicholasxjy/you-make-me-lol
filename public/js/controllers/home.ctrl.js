'use strict';

(function() {
  angular
    .module('showfieApp')
    .controller('HomeCtrl', [
      'UserService',
      function(UserService) {
        var self = this;

        UserService.currentUser()
          .then(function(data) {
            self.current_user = data;
            console.log(data);
          })
      }
    ])
})();
