'use strict';

(function() {
  angular
    .module('showfieApp')
    .controller('HomeCtrl', [
      'UserService',
      'FeedService',
      '$state',
      function(UserService, FeedService, $state) {
        var self = this;

        UserService.currentUser()
          .then(function(user) {
            self.current_user = user;
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
        };

        self.postFeed = function(content) {
          if (!content || content === '') {
            return;
          }
          var data = {
            category: 'text',
            content: content
          };
          FeedService.create(data)
            .then(function(data) {
              console.log(data);
            })
        }
      }
    ])
})();
