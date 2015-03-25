'use strict';

(function() {
  angular
    .module('showfieApp')
    .controller('HomeCtrl', [
      'UserService',
      'FeedService',
      '$state',
      'ngCoolNoti',
      function(UserService, FeedService, $state, ngCoolNoti) {
        var self = this;

        var loadFeeds = function() {
          FeedService.getFeeds()
            .then(function(data) {
              self.feeds = data.feeds;
            })
        }

        UserService.currentUser()
          .then(function(user) {
            self.current_user = user;
          })

        loadFeeds();

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

          // ngCoolNoti.create({
          //   type: 'success',
          //   message: 'This is sort of convincing to me!',
          //   animation: 'jelly',
          //   position: 'top-right'
          // })

          // return;

          if (!content || content === '') {
            return;
          }
          var data = {
            category: 'text',
            content: content
          };
          FeedService.create(data)
            .then(function(data) {
              content = '';
            })
        }
      }
    ])
})();
