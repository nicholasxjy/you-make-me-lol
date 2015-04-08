'use strict';

(function() {
  angular
    .module('showfieApp')
    .controller('HomeCtrl', [
      'UserService',
      'FeedService',
      '$state',
      'ngCoolNoti',
      '$rootScope',
      function(UserService, FeedService, $state, ngCoolNoti, $rootScope) {
        var self = this;

        self.unReadNotis = [
          {
            content: "Vivamus sagittis lacus vel augue laoreet rutrum faucibus.",
            creator: {
              name: 'Nicholas',
              avatar: '/images/user1.png'
            },
            createdAt: new Date()
          },
          {
            content: "She didn’t want to scare her second graders with an eye patch — or have to explain, over and over, why it was there.",
            creator: {
              name: 'Sophia',
              avatar: '/images/user3.png'
            },
            createdAt: new Date()
          }
        ];

        $rootScope.$on('feed:new', function(evt, newFeed) {
          loadFeeds();
        })

        var loadFeeds = function() {
          FeedService.getFeeds()
            .then(function(data) {
              console.log(data.feeds)
              // self.feeds = data.feeds;
              angular.forEach(data.feeds, function(feed) {
                if (feed.category === 'video') {
                  var attach_file = feed.attach_files[0];
                  var source = {
                    src: attach_file.url
                  };
                  feed.source = source;
                }
                if (feed.category === 'audio') {
                  var attach_file = feed.attach_files[0];
                  var source = {
                    audio: {
                      src: attach_file.url,
                      name: 'Sunday Morning',
                      author: 'Maroon Five',
                      cover: 'images/welcome.jpg'
                    }
                  }
                  feed.source = source;
                }
              });
              self.feeds = data.feeds;
            })
        }

        UserService.currentUser()
          .then(function(user) {
            self.current_user = user;
            self.isAuthticated = true;
          })

        loadFeeds();

        //toggle feed like
        self.toggleFeedLike = function(feed) {
          if (feed) {
            FeedService.toggleLike(feed)
              .then(function(data) {
                if (data.status === 'success') {
                  //dom
                  if (feed.isLike) {
                    feed.likes = feed.likes.filter(function(liker) {
                      return liker.id !== self.current_user.id;
                    })
                  } else {
                    feed.likes.push({
                      id: self.current_user.id,
                      name: self.current_user.name,
                      avatar: self.current_user.avatar
                    });
                  }
                  feed.isLike = !feed.isLike;
                }
              }, function(err) {
                console.log(err);
              })
          }
        }

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
      }
    ])
})();
