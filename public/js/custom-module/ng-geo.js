(function() {
  'use strict';
  angular
    .module('ngGeo', [])
    .factory('ngGeo', [
      '$http',
      '$q',
      '$timeout',
      function($http, $q, $timeout) {
        if (!AMap) {
          throw new Error('no gaode map set!');
          return false;
        }

        var getLocationByIP = function() {
          var deferred = $q.defer();
          AMap.service(["AMap.CitySearch"], function() {
            var citySearch = new AMap.CitySearch();
            citySearch.getLocalCity(function(status, result) {
              if (status === 'complete' && result.info === 'OK') {
                deferred.resolve(result);
              } else {
                deferred.reject('No data can get!');
              }
            })
          })
          return deferred.promise;
        }




        return {
          getLocationByIP: getLocationByIP
        }

      }
    ])
})();
