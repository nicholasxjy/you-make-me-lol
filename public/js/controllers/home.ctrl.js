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
        self.feeds = [];

        $rootScope.$on('feed:new', function(evt, newFeed) {
          loadFeeds();
        })

        var loadFeeds = function(after) {
          FeedService.getFeeds(after)
            .then(function(data) {
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
                      name: attach_file.title || 'Unknow',
                      author: attach_file.singer_name || 'Unknow',
                      cover: attach_file.cover_url ||'images/audio_bg.jpg'
                    }
                  }
                  feed.source = source;
                }
                self.feeds.push(feed);
              });

              if (self.feeds.length >0) {
                var last_feed = self.feeds[self.feeds.length -1];
                self.last_feed_createdAt = last_feed.createdAt;
              }
            })
        }

        UserService.currentUser()
          .then(function(user) {
            self.current_user = user;
            self.isAuthticated = true;
            return user;
          })
          .then(function(user) {
            if (user) {
              UserService.getUserFollowersForAt()
                .then(function(data) {
                  self.usersAt = data.users;
                  console.log(self.usersAt)
                })
            }
          })

        loadFeeds();


        self.loadMore = function() {
          loadFeeds(self.last_feed_createdAt);
        }

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
                    feed.likes.unshift({
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
        };

        self.follow = function(feed) {
          UserService.follow(feed.creator._id)
            .then(function(data) {
              if (data.status === 'success') {
                self.current_user.followers.push(feed.creator._id);
                feed.creator.hasFollowed = true;
              }
            })
        };

        self.unfollow = function(feed) {
          UserService.unfollow(feed.creator._id)
            .then(function(data) {
              if (data.status === 'success') {
                feed.creator.followees = feed.creator.followees.filter(function(item) {
                  return item._id != self.current_user._id;
                });
                feed.creator.hasFollowed = false;
              }
            })
        };

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
