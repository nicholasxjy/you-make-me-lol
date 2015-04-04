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

        self.isAuthticated = true;

        self.videoSource = {
          src: './media/codeschool_1403.mp4',
          poster: './images/poster_PayPal_Austin2.jpg'
        }

        var loadFeeds = function() {
          FeedService.getFeeds()
            .then(function(data) {
              // self.feeds = data.feeds;
              angular.forEach(data.feeds, function(feed) {
                if (feed.category === 'video') {
                  var attach_file = feed.attach_files[0];
                  var source = {
                    src: attach_file.url,
                    poster: attach_file.poster_url
                  };
                  feed.source = source;
                }
              });
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
