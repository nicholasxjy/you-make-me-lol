(function() {
  'use strict';
  angular
    .module('ngGeo', [])
    .factory('ngGeo', [
      '$http',
      '$q',
      '$timeout',
      function($http, $q, $timeout) {
        if (!BMap) {
          throw new Error('no baidu map set!');
          return false;
        }

        var getLocationCoords = function() {
          var deferred = $q.defer();
          if ("geolocation" in navigator) {
            /* geolocation is available */
            console.log('getting coords....')
            navigator.geolocation.getCurrentPosition(function(position) {
              console.log(position)
              deferred.resolve(position);
            }, function(err) {
              console.log(err.message);
              deferred.reject(err)
            }, { enableHighAccuracy: true, timeout: 60*1000, maximumAge: 60*1000 });

          } else {
            /* geolocation IS NOT available */
            deferred.reject('No geolocation can get');
          }
          return deferred.promise;
        }

        var coordsToAddress = function(coords) {
          var deferred = $q.defer();
          // 创建地理编码实例
          var myGeo = new BMap.Geocoder();
          // 根据坐标得到地址描述
          myGeo.getLocation(new BMap.Point(coords.longitude, coords.latitude), function(result){
            if (result){
              console.log(result)
              deferred.resolve(result);
            } else {
              deferred.reject('No address can get');
            }
          });
          return deferred.promise;
        }


        return {
          getLocationCoords: getLocationCoords,
          coordsToAddress: coordsToAddress
        }

      }
    ])
})();
