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

        var WEATHERICONS = {
          SUN: '<svg class="icon icon-sun"><use xlink:href="#icon-sun"></use></svg>',
          CLOUNDY: '<svg class="icon icon-cloudy"><use xlink:href="#icon-cloudy"></use></svg>',
          RAINY: '<svg class="icon icon-rainy"><use xlink:href="#icon-rainy"></use></svg>',
          LIGHTING: '<svg class="icon icon-lightning"><use xlink:href="#icon-lightning"></use></svg>',
          SNOWY: '<svg class="icon icon-snowy"><use xlink:href="#icon-snowy"></use></svg>',
          NONE: '<svg class="icon icon-none"><use xlink:href="#icon-none"></use></svg>'
        };

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


        var initMapByCity = function(city, domId) {
          var map = new AMap.Map(domId, {
            resizeEnable: true
          });
          map.setCity(city);
        }

        var getWeatherByCity = function(city) {
          var deferred = $q.defer();
          AMap.service('AMap.Weather', function() {
            var weather = new AMap.Weather();
            weather.getLive(city, function(err, data) {
              if (err) {
                deferred.reject(err);
              } else {
                if (data.weather.indexOf('晴') > -1) {
                  data.icon = WEATHERICONS.SUN;
                } else if (data.weather.indexOf('雨') > -1) {
                  data.icon = WEATHERICONS.RAINY;
                } else if (data.weather.indexOf('阴') > -1) {
                  data.icon = WEATHERICONS.CLOUNDY;
                } else if (data.weather.indexOf('雪') > -1) {
                  data.icon = WEATHERICONS.SNOWY;
                } else if (data.weather.indexOf('电') > -1) {
                  data.icon = WEATHERICONS.LIGHTING;
                } else {
                  data.icon = WEATHERICONS.NONE;
                }
                deferred.resolve(data);
              }
            });
          })
          return deferred.promise;
        }

        return {
          getLocationByIP: getLocationByIP,
          initMapByCity: initMapByCity,
          getWeatherByCity: getWeatherByCity
        }
      }
    ])
})();
