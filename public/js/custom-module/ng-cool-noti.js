(function() {
  'use strict';
  var m = angular.module('ngCoolNoti', []);

  m.provider('ngCoolNoti', function notiProvider() {
    var defaults = this.defaults = {
      container: 'body',
      position: 'top-right',
      animation: 'jelly',
      timeout: 5000,
      showClose: true,
      hasUserAvatar: false,
      avatar_url: '',
      type: 'success',
      message: 'Is this pretty awesome? Love ya all :)'
    };

    this.getDefaults = function() {
      return this.defaults;
    };

    this.setDefaults = function(newDefaults) {
      angular.extend(this.defaults, newDefaults);
    };

    this.$get = ['$document', '$timeout', function($document, $timeout) {
      var self = this;
      var container = $document.find('body');

      var generateTemplate = function(opts) {
        var position_class = "cool-noti-" + opts.position;
        var animation_class = "cool-noti-" + opts.animation;
        var type_class = "cool-noti-" + opts.type;

        var all_class = "ng-cool-noti " + type_class + ' ' + position_class + ' ' + animation_class;


        var _tpl = "";

        _tpl += '<div class="' + all_class + '"><div class="cool-noti-inner">';
        if (opts.hasUserAvatar) {
          _tpl += '<div class="cool-noti-avatar"><img src="' + opts.avatar_url + '" /></div>'
          _tpl += '<div class="cool-noti-message cool-noti-avatar-message">'
          + opts.message + '</div>';
        } else {
          _tpl += '<div class="cool-noti-message">'
          + opts.message + '</div>';
        }
        if (opts.showClose) {
          _tpl += '<i class="fa fa-close cool-noti-close"></i>'
        }

        _tpl += '</div></div>';

        return _tpl;
      }
      var notiApi = {};
      //根据用户配置生成 通知
      notiApi.create = function(opts) {
        opts = opts || {};
        var _copyDefaults = angular.copy(self.defaults);
        angular.extend(_copyDefaults, opts);

        if (_copyDefaults.container) {
          container = $document.find(_copyDefaults.container);
        }

        var template = generateTemplate(_copyDefaults);

        var _ele = angular.element(template);

        angular.element(container).append(_ele);
        _ele.addClass('cool-noti-show');
        $timeout(function() {
          _ele.removeClass('cool-noti-show').addClass('cool-noti-hide');
          $timeout(function() {
            _ele.remove();
          }, 1000);
        }, _copyDefaults.timeout);

        //bind close event
        if (_copyDefaults.showClose) {

          var _closeEle = angular.element(_ele.find('i'));

          _closeEle.on('click', function(e) {
            _ele.removeClass('cool-noti-show').addClass('cool-noti-hide');
            $timeout(function() {
              _ele.remove();
            }, 1000);
          })
        }

      }
      return notiApi;
    }]
  })

})();