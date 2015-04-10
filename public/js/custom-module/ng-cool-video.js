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
        template: '<div class="ng-cool-video"><div class="ng-cool-video-container" ng-click="togglePlay()"><div class="ng-cool-video-overlay" ng-show="!isPlaying"></div><video></video><div class="ng-cool-video-controls"><div class="ncv-actions"><?xml version="1.0" encoding="UTF-8" standalone="no"?><?xml version="1.0" encoding="UTF-8" standalone="no"?><svg ng-show="isPlaying" ng-click="pause($event)" width="42px" height="42px" viewBox="0 0 42 42" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"><g id="home" sketch:type="MSArtboardGroup" transform="translate(-960.000000, -513.000000)" fill-opacity="0.804234601" fill="#FFFFFF"><g id="pause-circle-outline" sketch:type="MSLayerGroup" transform="translate(960.000000, 513.000000)"><path d="M14.7,29.4 L18.9,29.4 L18.9,12.6 L14.7,12.6 L14.7,29.4 L14.7,29.4 Z M21,0 C9.45,0 0,9.45 0,21 C0,32.55 9.45,42 21,42 C32.55,42 42,32.55 42,21 C42,9.45 32.55,0 21,0 L21,0 Z M21,37.8 C11.76,37.8 4.2,30.24 4.2,21 C4.2,11.76 11.76,4.2 21,4.2 C30.24,4.2 37.8,11.76 37.8,21 C37.8,30.24 30.24,37.8 21,37.8 L21,37.8 Z M23.1,29.4 L27.3,29.4 L27.3,12.6 L23.1,12.6 L23.1,29.4 L23.1,29.4 Z" id="Shape" sketch:type="MSShapeGroup"></path></g></g></g></svg><svg ng-show="!isPlaying" ng-click="play($event)" width="42px" height="42px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"><g id="home" sketch:type="MSArtboardGroup" transform="translate(-961.000000, -558.000000)" stroke-opacity="0.803187274" stroke="#FFFFFF" stroke-width="2"><g id="play-circle-outline-2" sketch:type="MSLayerGroup" transform="translate(962.000000, 559.000000)"><path d="M12,21.75 L21,15 L12,8.25 L12,21.75 L12,21.75 Z M15,0 C6.75,0 0,6.75 0,15 C0,23.25 6.75,30 15,30 C23.25,30 30,23.25 30,15 C30,6.75 23.25,0 15,0 L15,0 Z" id="Shape" sketch:type="MSShapeGroup"></path></g></g></g></svg></div><div class="ncv-progress"><progress class="ncv-progress-bar" max="100" value="{{progressValue}}" ng-click="skipProgress($event)"></progress></div><div class="ncv-current-time"><span class="ncv-video-duration">{{playingTime}}</span></div><div class="ncv-mute"><i class="fa fa-volume-up" ng-click="volumeOff($event)" ng-show="!isMuted"></i><i class="fa fa-volume-off" ng-click="volumeOn($event)" ng-show="isMuted"></i></div><div class="ncv-sound-range"><input class="ncv-volume" type="range" max="10" min="0" value="5" ng-model="video.volume"></div></div><?xml version="1.0" encoding="UTF-8" standalone="no"?><svg ng-show="!isPlaying" ng-click="play($event)" class="video-center-icon" width="82px" height="82px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"><g id="home" sketch:type="MSArtboardGroup" transform="translate(-961.000000, -558.000000)" stroke-opacity="0.803187274" stroke="#FFFFFF" stroke-width="2"><g id="play-circle-outline-2" sketch:type="MSLayerGroup" transform="translate(962.000000, 559.000000)"><path d="M12,21.75 L21,15 L12,8.25 L12,21.75 L12,21.75 Z M15,0 C6.75,0 0,6.75 0,15 C0,23.25 6.75,30 15,30 C23.25,30 30,23.25 30,15 C30,6.75 23.25,0 15,0 L15,0 Z" id="Shape" sketch:type="MSShapeGroup"></path></g></g></g></svg></div></div></div>',
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
            video.width = 500;
            video.height = 286.5;
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
          $scope.play = function(e) {
            e.stopPropagation();
            video.play();
            $scope.isPlaying = true;
          };

          $scope.pause = function(e) {
            e.stopPropagation();
            video.pause();
            $scope.isPlaying = false;
          }
          //toggle mute

          $scope.volumeOff = function(e) {
            e.stopPropagation();
            video.muted = true;
            $scope.isMuted = true;
          };

          $scope.volumeOn = function(e) {
            e.stopPropagation();
            video.muted = false;
            $scope.isMuted = false;
          };

          //backward and forward

          $scope.playBackward = function(e) {
            e.stopPropagation();
            var toTime = video.currentTime - $scope.jumpInterval;
            if (toTime < 0) {
              video.currentTime = 0;
            } else {
              video.currentTime = toTime;
            }
            $scope.playingTime = calCulateTime();
            $scope.progressValue = calCulateProgress();
          };

          $scope.playForward = function(e) {
            e.stopPropagation();
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
            e.stopPropagation();
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
            volume_range.addEventListener('change', function(e) {
              e.stopPropagation();
              video.volume = parseFloat(this.value / 10);
            }, false);

            controls_con.addEventListener('click', function(e) {
              e.stopPropagation();
            });
          };
        }],
        link: function(scope, ele, attrs) {
          scope.init();
        }
      }
    }
  ])
})();
