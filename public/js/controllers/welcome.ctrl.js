'use strict';
(function() {
  angular
    .module('showfieApp')
    .controller('WelcomeCtrl', [
      '$rootScope',
      '$document',
      function($rootScope, $document) {
        $document.title = 'Welcome to Showfie';
      }
    ])
})();
