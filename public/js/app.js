(function() {
  angular
    .module('showfieApp', [
      'ngSanitize',
      'ui.router',
      'ngFileUpload',
      'ngTagsInput',
      'mentio',
      'ngCoolNoti',
      'ngCoolVideo',
      'ngCoolAudio',
      'ngCoolComponents',
      'ngAudioTag',
      'ngGeo'
    ])
    .constant('APPCONF', {
      Title: {
        signup: 'Cool Zone | Sign Up',
        login: 'Cool Zone | Login'
      }
    })
    .config(function($stateProvider, $urlRouterProvider, APPCONF) {
      $urlRouterProvider.otherwise('/signup');
      $stateProvider
        .state('signup', {
          url: '/signup',
          templateUrl: 'template/signup.html',
          data: {
            pageTitle: APPCONF.Title.signup
          }
        })
        .state('login', {
          url: '/login',
          templateUrl: 'template/login.html',
          data: {
            pageTitle: APPCONF.Title.login
          }
        })
        .state('forgetpass', {
          url: '/forgetpass',
          templateUrl: 'template/forgetpass.html'
        })
        .state('404', {
          templateUrl: 'template/404.html'
        })
        .state('403', {
          url: '/forbidden',
          templateUrl: 'template/403.html'
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
          url: '/user/:name',
          templateUrl: 'template/user_page.html'
        })
        .state('followers', {
          url: '/:name/followers',
          templateUrl: 'template/user_followers.html'
        })
        .state('followees', {
          url: '/:name/followees',
          templateUrl: 'template/user_followees.html'
        })
        .state('setting', {
          url: '/setting',
          templateUrl: 'template/setting.html'
        })
        .state('bookmarks', {
          url: '/bookmarks',
          templateUrl: 'template/bookmarks.html'
        })
        .state('feed', {
          url:'/feed/:id',
          templateUrl: 'template/feed-page.html'
        })
    })
})();
