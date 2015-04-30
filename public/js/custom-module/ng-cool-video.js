(function() {
  'use strict';
  var m = angular.module('ngCoolVideo', []);


  //directive add html stuff
  m.directive('ngCoolVideo', [
    '$sce',
    '$timeout',
    function videoDirective($sce, $timeout) {

      return {
        restrict: 'AE',
        scope: {
          source: '=source'
        },
        transclude: true,
        replace: true,
        template: '<div class="ng-cool-video">\
          <div class="ng-cool-video-container">\
            <video width="100%"></video>\
            <div class="ng-cool-video-controls">\
              <div class="ncv-actions">\
                <i class="fa fa-backward" ng-click="playBackward()"></i>\
                <i class="fa fa-pause" ng-click="pause()" ng-show="isPlaying"></i>\
                <i class="fa fa-play" ng-click="play()" ng-show="!isPlaying"></i>\
                <i class="fa fa-forward" ng-click="playForward()"></i>\
              </div>\
              <div class="ncv-progress">\
                <progress class="ncv-progress-bar" max="100" value="{{progressValue}}" ng-click="skipProgress($event)"></progress>\
              </div>\
              <div class="ncv-current-time">\
                <span class="ncv-video-duration">{{playingTime}}</span>\
              </div>\
              <div class="ncv-mute">\
                <i class="fa fa-volume-up" ng-click="toggleVolume()"></i>\
              </div>\
              <div class="ncv-sound-range">\
                <input class="ncv-volume" type="range" max="10" min="0" value="5" ng-model="video.volume">\
              </div>\
            </div>\
          </div>\
        </div>',
        controller: ['$scope', '$element', function($scope, $element) {

          //check source first
          if (!$scope.source || !$scope.source.src) {
            throw new Error('Not set source object, check the api :)');
            return;
          }
          // DOM objects
          var container = $element[0].querySelector('.ng-cool-video-container');
          var video = $element[0].querySelector('video');
          var progressBar = $element[0].querySelector('.ncv-progress progress');
          var volume_range = $element[0].querySelector(".ncv-sound-range input[type='range']");
          var controls_con = $element[0].querySelector('.ng-cool-video-controls');
          // angular element
          var $video = angular.element(video);
          var $progressBar = angular.element(progressBar);

          //private method
          var calCulateTime = function() {
            var secs = parseInt(video.currentTime % 60);
            var mins = parseInt((video.currentTime / 60) % 60);

            // Ensure it's two digits. For example, 03 rather than 3.
            secs = ("0" + secs).slice(-2);
            mins = ("0" + mins).slice(-2);
            return mins + ':' + secs;
          }

          var calCulateProgress = function() {
            var percent = (100 / video.duration) * video.currentTime;
            return percent;
          }

          //init
          $scope.init = function() {
            $scope.playingTime = '00:00';
            $scope.progressValue = 0;
            $scope.isPlaying = false;
            $scope.isMuted = false;
            $scope.jumpInterval = 10;
            $scope.setInterface();
            $scope.addEvents();
          };

          $scope.setInterface = function setInterface() {
            var isArray = angular.isArray($scope.source.src);

            if (isArray) {
              var _sourceHtml = '';
              angular.forEach($scope.source.src, function(item) {
                _sourceHtml += '<source src="' + item.url + '" type="' + item.type + '">';
              });
              $video.append(angular.element(_sourceHtml));
            } else {
              $video.attr('src', $scope.source.src);
            }
            if ($scope.source.poster) {
              $video.attr('poster', $scope.source.poster);
            }

            //here set preload false
            video.preload = false;
            // set video dimension
            // video.width = 100%;

            if ($scope.source.config) {
              if ($scope.source.config.autoplay) {
                video.autoplay = true;
              }
              if ($scope.source.config.loop) {
                video.loop = true;
              }
              if ($scope.source.config.preload) {
                video.preload = true;
              }
            }
          };

          $scope.togglePlay = function() {
            if ($scope.isPlaying) {
              video.pause();
            } else {
              video.play();
            }
            $scope.isPlaying = !$scope.isPlaying;
          }

          //toggle play pause
          $scope.play = function() {
            video.play();
            $scope.isPlaying = true;
          };

          $scope.pause = function() {
            video.pause();
            $scope.isPlaying = false;
          }
          //toggle mute

          $scope.toggleVolume = function() {
            video.muted = !video.muted;
            $scope.isMuted = !$scope.isMuted;
          }

          $scope.volumeOff = function() {
            video.muted = true;
            $scope.isMuted = true;
          };

          $scope.volumeOn = function() {
            video.muted = false;
            $scope.isMuted = false;
          };

          //backward and forward

          $scope.playBackward = function() {

            var toTime = video.currentTime - $scope.jumpInterval;
            if (toTime < 0) {
              video.currentTime = 0;
            } else {
              video.currentTime = toTime;
            }
            $scope.playingTime = calCulateTime();
            $scope.progressValue = calCulateProgress();
          };

          $scope.playForward = function() {
            var toTime = video.currentTime + $scope.jumpInterval;
            if (toTime > video.duration) {
              video.currentTime = video.duration;
            } else {
              video.currentTime = toTime;
            }
            $scope.playingTime = calCulateTime();
            $scope.progressValue = calCulateProgress();
          };

          $scope.skipProgress = function(e) {
            //update time and progress
            var target = e.target;
            var rectProgress = target.getBoundingClientRect();
            var offsetX = 0;
            if (e.offsetX) {
              offsetX = e.offsetX;
            } else {
              offsetX = e.pageX - rectProgress.x;
            }
            var pos = offsetX / target.offsetWidth;
            video.currentTime = pos * video.duration;
            $scope.playingTime = calCulateTime();
            $scope.progressValue = calCulateProgress();
          }

          $scope.addEvents = function() {

            // video.addEventListener('loadedmetadata', function() {
            //   //set video dimension
            //   var width = this.videoWidth;
            //   var height = this.videoHeight;
            //   var conWidth = container.clientWidth;
            //   this.width = conWidth;
            //   this.height = height * (conWidth/width);
            //
            // }, false);

            //time update
            // progress update
            video.addEventListener('timeupdate', function() {
              $scope.playingTime = calCulateTime();
              $scope.progressValue = calCulateProgress();
              $scope.$apply();
            }, false);

            //angular seems dont support input[range] stuff so let's do it event
            volume_range.addEventListener('change', function() {
              video.volume = parseFloat(this.value / 10);
            }, false);
          };
        }],
        link: function(scope, ele, attrs) {
          scope.init();
        }
      }
    }
  ])
})();
