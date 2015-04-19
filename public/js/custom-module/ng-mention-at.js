(function() {
  'use strict';
  angular
    .module('ngMentionAt', [])
    .directive('ngMentionAt', [
      '$document',
      '$timeout',
      '$compile',
      function($document, $timeout, $compile) {
        return {
          restrict: 'AE',
          scope: {
            ngModel: '=',
            select: '&ngAtSelect',
            items: '=ngAtItems'
          },
          link: function(scope, ele, attrs) {

            var generateTpl = function() {
              var tpl = '';
              tpl += '<div class="ng-mention-at">'
              tpl += '<ul class="dropdown-menu ng-at-list">';
              tpl += '<li class="ng-at-item" ng-repeat="item in items" ng-click="select(item)">{{item.label}}</li>';
              tpl += '</ul>';
              tpl += '</div>';
              return tpl;
            }

            var body = $document.find('body');

            scope.$watch('ngModel', function(val) {
              if (val && val[val.length - 1] === '@') {
                var template = generateTpl();
                var tplEle = $compile(template)(scope);
                $timeout(function() {
                  body.append(tplEle);


                  var offset = $(ele[0]).offset();
                  //set the position
                  var caret_position = $(ele[0]).caret('position');
                  console.log(caret_position);

                  $('.ng-mention-at').css('top', offset.top + caret_position.top + caret_position.height + 5 +'px');
                  $('.ng-mention-at').css('left', offset.left + caret_position.left +'px');

                })
              }
            })

          }
        }
      }
    ])

})();