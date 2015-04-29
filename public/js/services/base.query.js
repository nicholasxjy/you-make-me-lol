(function() {
  'use strict';
  angular
    .module('showfieApp')
    .factory('BaseQuery', [
      '$http',
      '$q',
      function($http, $q) {
        var base = {};

        base.get = function(url, params) {
          var deferred = $q.defer();
          $http({
            url: url,
            method: 'GET',
            params: params
          }).success(function(data, status, headers, config) {
            deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            deferred.reject(data);
          });
          return deferred.promise;
        }

        base.post = function(url, data) {
          var deferred = $q.defer();
          $http({
            method: 'POST',
            url: url,
            data: data
          }).success(function(data, status, headers, config) {
            deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            deferred.reject(data);
          });
          return deferred.promise;
        }

        return base;
      }
    ])
})();
