(function() {
  angular
    .module('showfieApp')
    .controller('UserCtrl', [
      'UserService',
      'FeedService',
      '$stateParams',
      '$state',
      function(UserService, FeedService, $stateParams, $state) {
        var self = this;
        var name = $stateParams.name;

        UserService.getUserInfoByName(name)
          .then(function(data) {
            if (data.status === 'success') {
              self.user = data.user;
              return self.user;
            } else {
              $state.go('404');
            }
          }, function(err) {
            console.log(err);
          })
          .then(function(user) {
            FeedService.getFeedsByUser(user._id)
              .then(function(data) {
                angular.forEach(data, function(feed) {
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
                });
                self.feeds = data;
              }, function(err) {
                console.log(err);
              })
          })

        UserService.currentUser()
          .then(function(user) {
            self.current_user = user;
            self.isAuthenticated = true;
          })
      }
    ])
})();
