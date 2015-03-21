'use strict';

(function() {
  angular
    .module('showfieApp')
    .factory('FeedService', [
      '$http',
      '$q',
      function($http, $q) {
        function create(data) {
          var deferred = $q.defer();
          $http({
            url: '/feed/create',
            method: 'POST',
            data: data
          }).success(function(data, status, headers, config) {
            deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            deferred.reject(data);
          });
          return deferred.promise;
        }
        return {
          create: create
        }
      }
    ])
})();
