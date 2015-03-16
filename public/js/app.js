'use strict';

angular
  .module('showfieApp', [
    'ui.router'
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
  })
