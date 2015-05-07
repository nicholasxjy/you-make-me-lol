(function() {
  angular
    .module('showfieApp')
    .factory('UserService', [
      'BaseQuery',
      function(BaseQuery) {
        var current_user;
        function signUp(user) {
          var data = {
            name: user.name,
            email: user.email,
            password: user.password
          };
          return BaseQuery.post('/user/new', data);
        }
        function currentUser() {
          return BaseQuery.get('/user/current');
        }

        function login(user) {
          return BaseQuery.post('/user/login', {
            email: user.email,
            password: user.password
          });
        }

        function logout() {
          return BaseQuery.get('/user/logout');
        }

        function getUserInfo() {
          return BaseQuery.get('/user/info');
        }

        function updateInfo(user) {
          return BaseQuery.post('/user/update_info', {info: user});
        }

        function getUserInfoByName(name) {
          return BaseQuery.get('/user/info_name', {name: name});
        }

        function getUserFollowersForAt() {
          return BaseQuery.get('/user/followers_at');
        }

        function follow(userId) {
          return BaseQuery.post('/user/follow', {followId: userId});
        }

        function unfollow(userId) {
          return BaseQuery.post('/user/unfollow', {unfollowId: userId});
        }

        function getNotifications() {
          return BaseQuery.get('/user/notifications');
        }

        function markAllNoti() {
          return BaseQuery.post('/user/mark_notis');
        }

        function getUserFollowers(name) {
          return BaseQuery.get('/user/followers', {name: name});
        }

        function getUserFollowees(name) {
          return BaseQuery.get('/user/followees', {name: name});
        }

        return {
          signUp: signUp,
          currentUser: currentUser,
          login: login,
          logout: logout,
          getUserInfo: getUserInfo,
          updateInfo: updateInfo,
          getUserInfoByName: getUserInfoByName,
          getUserFollowersForAt: getUserFollowersForAt,
          follow: follow,
          unfollow: unfollow,
          getNotifications: getNotifications,
          markAllNoti: markAllNoti,
          getUserFollowers: getUserFollowers,
          getUserFollowees: getUserFollowees
        }
      }
    ])
})();
