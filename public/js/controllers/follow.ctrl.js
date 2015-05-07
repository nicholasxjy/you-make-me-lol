(function() {
  'use strict';
  angular
    .module('showfieApp')
    .controller('FollowerCtrl', [
      'UserService',
      '$stateParams',
      function(UserService, $stateParams) {
        var self = this;
        var name = $stateParams.name;

        UserService.currentUser()
          .then(function(res) {
            self.current_user = res.user;
            self.isAuthticated = true;
          })

        UserService.getUserFollowers(name)
          .then(function(data) {
            self.user = data.user;
          })
      }
    ])
})();
