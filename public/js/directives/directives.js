(function() {
  'use strict';
  angular
    .module('showfieApp')
    .directive('photoDisplay', function() {
      return {
        restrict: 'A',
        link: function(scope, ele, attrs) {
          var fullWidth = $(ele).width();
          var _perWidth = fullWidth / 3;
          $(ele).css('height', _perWidth+'px');
          $(ele).find('img')
          .css('width', _perWidth+'px')
          .css('height', _perWidth+'px');
        }
      }
    })
})();