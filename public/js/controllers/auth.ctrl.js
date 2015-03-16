'use strict';

(function() {
  angular
    .module('showfieApp')
    .controller('SignupCtrl', [
      '$rootScope',
      'UserService',
      '$state',
      '$timeout',
      function($rootscope, UserService, $state, $timeout) {
        var self = this;
        self.signUping = false;
        self.signUp = function(user) {
          self.spinnerShow = true;
          self.signUping = true;
          UserService.signUp(user)
            .then(function(data) {
              if (data.status === 'fail') {
                self.spinnerShow = false;
                self.signUping = false;
                $timeout(function() {
                  //here should tip user
                  self.hasError = true;
                  self.error = data.msg;
                }, 1000);
              } else {
                self.spinnerShow = false;
                self.signUping = false;
                $timeout(function() {
                  $state.go('home');
                }, 500);
              }
            }, function(err) {
              console.log(err.message);
            })
        }
      }
    ])
    .controller('LoginCtrl', [
      'UserService',
      '$state',
      '$timeout',
      function(UserService, $state, $timeout) {
        var self = this;
        self.login = function(user) {
          UserService.login(user)
            .then(function(data) {
              if (data.status === 'fail') {
                self.hasError = true;
                self.error = data.msg;
              } else {
                $state.go('home');
              }
            }, function(err) {
              console.log(err.message);
            })
        }
      }
    ])
})();