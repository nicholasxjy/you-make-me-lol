'use strict';

angular
  .module('showfieApp', [
    'ngSanitize',
    'ui.router',
    'angularFileUpload',
    'wu.masonry',
    'ngTagsInput',
    'ngCoolNoti',
    'ngCoolVideo',
    'ngCoolAudio',
    'ngCoolComponents'
  ])
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('welcome', {
        url: '/',
        templateUrl: 'template/welcome.html'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'template/signup.html'
      })
      .state('login', {
        url: '/login',
        templateUrl: 'template/login.html'
      })
      .state('forgetpass', {
        url: '/forgetpass',
        templateUrl: 'template/forgetpass.html'
      })
      .state('home', {
        url: '/home',
        templateUrl: 'template/home.html'
      })
      .state('explore', {
        url: '/explore',
        templateUrl: 'template/explore.html'
      })
      .state('messages', {
        url: '/messages',
        templateUrl: 'template/messages.html'
      })
      .state('user', {
        url: '/:name',
        templateUrl: 'template/user_page.html'
      })
      .state('setting', {
        url: '/setting',
        templateUrl: 'template/setting.html'
      })
      .state('bookmarks', {
        url: '/bookmarks',
        templateUrl: 'template/bookmarks.html'
      })
  })
