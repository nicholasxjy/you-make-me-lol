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

        function getFeeds(after) {
          var deferred = $q.defer();
          $http({
            method: 'GET',
            url: '/feed/getfeeds',
            params: {
              after: after
            }
          }).success(function(data, status, headers, config) {
            deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            deferred.reject(data);
          });
          return deferred.promise;
        }

        function removeFile(file) {
          var deferred = $q.defer();
          $http({
            method: 'POST',
            url: '/feed/remove_file',
            data: {
              fileId: file.fileId,
              key: file.key
            }
          }).success(function(data, status, headers, config) {
            deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            deferred.reject(data);
          });
          return deferred.promise;
        }

        function toggleLike(feed) {
          var deferred = $q.defer();
          $http({
            method: 'POST',
            url: '/feed/toggle_like',
            data: {
              feedId: feed._id,
              isLike: feed.isLike
            }
          }).success(function(data, status, headers, config) {
            deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            deferred.reject(data);
          });
          return deferred.promise;
        }

        function addComment(feedId, words, touser) {
          var deferred = $q.defer();
          $http({
            method: 'POST',
            url: '/feed/add_comment',
            data: {
              feedId: feedId,
              content: words,
              touser: touser
            }
          }).success(function(data, status, headers, config) {
            deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            deferred.reject(data);
          });
          return deferred.promise;
        }

        return {
          create: create,
          getFeeds: getFeeds,
          removeFile: removeFile,
          toggleLike: toggleLike,
          addComment: addComment
        }
      }
    ])
})();
