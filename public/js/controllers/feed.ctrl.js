(function() {
  'use strict';
  angular
    .module('showfieApp')
    .controller('FeedCtrl', [
      'UserService',
      'FeedService',
      '$stateParams',
      '$state',
      function(UserService, FeedService, $stateParams, $state) {
        var feedId = $stateParams.id;
        var self = this;
        if (!feedId) {
          $state.go('404');
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

        FeedService.getFeedDetail(feedId)
            .then(function(data) {
              if (data.category === 'video') {
                var attach_file = data.attach_files[0];
                var source = {
                  src: attach_file.url
                };
                data.source = source;
              }
              if (data.category === 'audio') {
                var attach_file = data.attach_files[0];
                var source = {
                  audio: {
                    src: attach_file.url,
                    name: attach_file.title || 'Unknow',
                    author: attach_file.singer_name || 'Unknow',
                    cover: attach_file.cover_url ||'images/audio_bg.jpg'
                  }
                }
                data.source = source;
              }
              self.feed = data;
            }, function(err) {              
              if (err === 'Not Found') {
                $state.go('404');
              }
            })

      }
    ])
})();
