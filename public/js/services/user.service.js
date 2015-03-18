'use strict';

(function() {
  angular
    .module('showfieApp')
    .factory('UserService', [
      '$http',
      '$q',
      '$state',
      '$timeout',
      function($http, $q, $state, $timeout) {
        var current_user;
        function signUp(user) {
          var deferred = $q.defer();
          $http({
            method: 'POST',
            url: '/user/new',
            data: {
              name: user.name,
              email: user.email,
              password: user.password
            }
          }).success(function(data, status, headers, config) {
            current_user = data.new_user;
            deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            deferred.reject(data);
          });
          return deferred.promise;
        }
        function currentUser() {
          var deferred = $q.defer();
          if (current_user) {
            deferred.resolve(current_user);
          } else {
            $http({
              method: 'GET',
              url: '/user/current'
            }).success(function(data, status, headers, config) {
              deferred.resolve(data.user);
            }).error(function(data, status, headers, config) {
              deferred.reject(data);
            });
          }
          return deferred.promise;
        }

        function login(user) {
          var deferred = $q.defer();
          $http({
            method: 'POST',
            url: '/user/login',
            data: {
              email: user.email,
              password: user.password
            }
          }).success(function(data, status, headers, config) {
            current_user = data.user;
            deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            deferred.reject(data);
          });
          return deferred.promise;
        }

        function logout() {
          var deferred = $q.defer();
          $http({
            method: 'GET',
            url: '/user/logout',
          }).success(function(data, status, headers, config) {
            current_user = null;
            deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            deferred.reject(data);
          });
          return deferred.promise;
        }

        return {
          signUp: signUp,
          currentUser: currentUser,
          login: login,
          logout: logout
        }
      }
    ])
})();
