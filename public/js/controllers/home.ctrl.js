(function() {
  angular
    .module('showfieApp')
    .controller('HomeCtrl', [
      'UserService',
      'FeedService',
      '$state',
      'ngCoolNoti',
      '$rootScope',
      '$timeout',
      function(UserService, FeedService, $state, ngCoolNoti, $rootScope, $timeout) {
        var self = this;
        self.feeds = [];

        

        var loadFeeds = function(after) {
          self.loadMoreSpinnerShow = true;

          FeedService.getFeeds(after)
            .then(function(data) {
              self.loadMoreSpinnerShow = false;
              if (data.feeds && data.feeds.length === 0) {
                self.loadMoreTip = '没有更多:(';
              }

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
          .then(function(res) {
            self.current_user = res.user;
            self.isAuthticated = true;
            return res.user;
          })
          .then(function(user) {
            if (user) {
              UserService.getUserFollowersForAt()
                .then(function(data) {
                  self.usersAt = data.users;
                })
            }
          })

        loadFeeds();


        self.loadMore = function() {
          loadFeeds(self.last_feed_createdAt);
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
