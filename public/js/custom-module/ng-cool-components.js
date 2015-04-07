(function() {
  'use strict';
  var m = angular.module('ngCoolComponents', []);
  m.directive('ngCoolTooltip', [
    '$document',
    '$timeout',
    function($document, $timeout) {
      return {
        restrict: 'AE',
        link: function(scope, ele, attrs) {
          var body = $document.find('body')[0];
          var container = ele[0];

          var $body = angular.element(body);
          var generateTemplate = function(tooltip) {
            var _tpl = '';
            _tpl += '<div class="ng-cool-tooltip ' + tooltip.effect + '">';
            _tpl += '<div class="ng-cool-arrow ' + tooltip.position +'"></div>';
            _tpl += '<div class="ng-cool-tooltip-content">';
            _tpl += tooltip.content;
            _tpl += '</div>';
            _tpl += '</div>';
            return _tpl;
          };

          var tooltip = {};
          tooltip.effect = attrs.effect || 'fade';
          tooltip.position = attrs.position || 'top';
          attrs.$observe('ngCoolTooltip', function(val) {
            tooltip.content = val;
            var template = generateTemplate(tooltip);
            var $template = angular.element(template);
            tooltip.template = $template;
          });

          //bind events
          container.addEventListener('mouseover', function() {
            $timeout(function() {
              $body.append(tooltip.template);
              tooltip.template.css('position', 'fixed');
              var rectContainer = container.getBoundingClientRect();
              var rectTooltip = tooltip.template[0].getBoundingClientRect();
              var tooltipPosition = {};

              if (tooltip.position === 'top') {
                tooltipPosition.left = rectContainer.left + rectContainer.width/2 - rectTooltip.width/2;
                tooltipPosition.top = rectContainer.top - rectTooltip.height - 8;
              }
              if (tooltip.position === 'bottom') {
                tooltipPosition.left = rectContainer.left + rectContainer.width/2 - rectTooltip.width/2;
                tooltipPosition.top = rectContainer.top + rectContainer.height + 3;
              }
              tooltip.template.css('left', tooltipPosition.left+'px');
              tooltip.template.css('top', tooltipPosition.top+'px');
              tooltip.template.removeClass('out').addClass('in');
            }, 300);
          }, false);

          container.addEventListener('mouseout', function() {
            tooltip.template.removeClass('in').addClass('out');
            $timeout(function() {
              tooltip.template.remove();
            }, 300);
          }, false);
        }
      }
    }
  ]);
  m.directive('ngCoolPopover', [
    '$document',
    '$timeout',
    '$compile',
    function($document, $timeout, $compile) {
      return {
        restrict: 'AE',
        scope: {
          source: '=source'
        },
        link: function(scope, ele, attrs) {
          //dom
          var document = $document[0];
          var body = $document.find('body')[0];
          var container = ele[0];

          //angular element
          var $body = angular.element(body);

          var popover = {};
          var position = attrs.position || 'top';
          var effect = attrs.effect || 'slideInUp';
          var id = attrs.ngCoolPopover;
          popover.position = position;
          popover.effect = effect;
          popover.id = id;

          var generateTemplate = function(popover) {
            var _tpl = '';
            _tpl += '<div class="ng-cool-popover ' + popover.effect + '" id="ng-cool-popover-' + popover.id + '">';
            _tpl += '<div class="ng-cool-popover-inner">';
            if (angular.isString(scope.source)) {
              _tpl += '<div class="ng-cool-popover-content">' + scope.source + '</div>';
            }
            if (angular.isArray(scope.source)) {
              _tpl += '<ul class="notification-list popover-notilist">';
              _tpl += '<li class="popover-noti-item" ng-repeat="item in source">';
              _tpl += '<div class="noti-avatar">';
              _tpl += '<a ui-sref="user({name: item.creator.name})" ng-href="/#/{{item.creator.name}}">';
              _tpl += '<img ng-src="{{item.creator.avatar}}" class="creator-avatar img-responsive img-circle">';
              _tpl += '</a>';
              _tpl += '</div>';

              _tpl += '<a ui-sref="message" ng-href="messages" class="popover-item-content">';
              _tpl += '{{item.content}}';
              _tpl += '<div class="noti-time">{{item.createdAt | date: "yyyy-MM-dd"}}</div>';
              _tpl += '</a>';

              _tpl += '</li>';
              _tpl += '</ul>';

              _tpl += '<div class="noti-more"><a ng-href="messages">More Notifications</a></div>'
            };
            _tpl += '</div>';
            _tpl += '<div class="ng-cool-popover-arrow"></div>';
            _tpl += '</div>';
            return _tpl;
          }

          var removeOtherPopovers = function() {
            // remove other popovers
            var popoverDom = document.querySelector('.ng-cool-popover');
            var $popover = angular.element(popover);
            $timeout(function() {
              $popover.remove();
            });
          }

          container.addEventListener('click', function(e) {
            var popoverDom = document.querySelector('#ng-cool-popover-' + popover.id);
            if (popoverDom) {
              angular.element(popoverDom).remove();
              return;
            }

            removeOtherPopovers();

            var template = generateTemplate(popover);
            var $template = $compile(template)(scope);
            $timeout(function() {
              $body.append($template);

              //choose the specific popover
              var thePopover = document.querySelector('#ng-cool-popover-' + popover.id);
              var $popover = angular.element(thePopover);

              //here set popover position
              var triggerRect = container.getBoundingClientRect();
              var popoverRect = thePopover.getBoundingClientRect();
              $popover.css('position', 'absolute');
              var popover_top = triggerRect.top + triggerRect.height + 10;
              var popover_left = triggerRect.left + triggerRect.width / 2 - 30;
              $popover.css('top', popover_top+'px');
              $popover.css('left', popover_left+'px');

              //add click

              thePopover.addEventListener('click', function(e) {
                e.stopPropagation();
              });

              //add document event hide popover
              document.addEventListener('click', function() {
                $timeout(function() {
                  $popover.remove();
                });
              });
            });
          }, false);
        }
      }
  }])
})();
