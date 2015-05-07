(function() {
  'use strict';
  var m = angular.module('ngCoolComponents', []);
  m.directive('sfUserCardPopover', [
    '$http',
    '$q',
    '$timeout',
    '$document',
    '$compile',
    function($http, $q, $timeout, $document, $compile) {
      return {
        restrict: 'AE',
        transclude: true,
        scope: {
          user: '=user',
          current_user: '=currentUser'
        },
        template: '<img ng-src="{{user.avatar}}" alt="avatar" class="img-rounded img-popover">\
        <div class="sf-card user-card user-card-popover" ng-show="popoverShow">\
          <div class="card-top">\
            <div class="user-card-banner" style="background-image: url(\'{{user.bg_image}}\')">\
            </div>\
            <div class="user-avatar">\
              <img ng-src="{{user.avatar}}" alt="Avatar" class="img-responsive img-circle">\
            </div>\
            <div class="user-link">\
              <a ui-sref="user({name: user.name})">{{user.name}}</a>\
            </div>\
            <div class="user-other">\
              <i class="fa fa-user"></i><span>{{user.gender}}</span>\
              <i class="fa fa-map-marker"></i><span>{{user.location}}</span>\
            </div>\
            <div class="user-profile">\
              {{user.profile}}\
            </div>\
          </div>\
        </div>',
        link: function(scope, ele, attrs) {
          scope.popoverShow = false;
          var pop_timespan = null;
          var $img = $(ele[0]).find('.img-popover');
          $img.on('mouseover', function(e) {
            if (!pop_timespan) {
              pop_timespan = $timeout(function() {
                pop_timespan = null;
                scope.popoverShow = true;
                scope.$apply();
              }, 500)
            }
          })

          $img.on('mouseleave', function() {
            if (pop_timespan) {
              $timeout.cancel(pop_timespan);
              pop_timespan = null;
            } else {
              scope.popoverShow = false;
              scope.$apply();
            }
          })
        }
      }
    }
  ])
})();
