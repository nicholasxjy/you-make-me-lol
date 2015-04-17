(function() {
  'use strict';
  if (!ID3) {
    throw new Error('no ID3 dependency');
    return false;
  }
  angular
    .module('ngAudioTag', [])
    .factory('ngAudioTag', [
      '$http',
      '$q',
      function($http, $q) {
        var getTag = function(file) {
          var deferred = $q.defer();
          ID3.loadTags(file.name, function() {
            var tags = ID3.getAllTags(file.name);
            deferred.resolve(tags);
          }, {
            tags: ["artist", "title", "album", "year", "comment", "track", "genre", "lyrics", "picture"],
            dataReader: FileAPIReader(file)
          });
          return deferred.promise;
        }

        return {
          getTag: getTag
        }
      }])
})();
