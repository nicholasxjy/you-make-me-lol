(function() {
  'use strict';
  angular
    .module('showfieApp')
    .directive('sfCreateFeed', [
      '$document',
      '$timeout',
      '$http',
      '$compile',
      function($document, $timeout, $http, $compile) {
        return {
          restrict: 'AE',
          scope: {
            current_user: '=currentUser',
            usersAt: '=usersAt'
          },
          link: function(scope, ele, attrs) {
            var body = $document.find('body')[0];
            var $body = angular.element(body);

            ele.on('click', function() {
              //append dom to body
              var template = $http.get('template/partials/create-bar.html');
              template.success(function(data) {
                var tpl = $compile(data)(scope);
                $timeout(function() {
                  $body.append(tpl);
                  $body.addClass('create-open');
                  var $main = $('.sf-create-main');
                  $main.addClass('jelley-in');
                  $timeout(function() {
                    $main.removeClass('jelley-in');
                  }, 1200);
                });
              })
            })
          }
        }
      }
    ])
    .directive('sfUploadFeed', [
      '$document',
      '$timeout',
      '$http',
      '$rootScope',
      '$q',
      '$upload',
      'ngCoolNoti',
      'FeedService',
      'ngAudioTag',
      'ngGeo',
      function($document, $timeout, $http, $rootScope, $q, $upload, ngCoolNoti, FeedService, ngAudioTag, ngGeo) {
        return {
          restrict: 'AE',
          controller: ['$scope', '$element', function($scope, $element) {
            $scope.mediaUploading = false;
            $scope.mediaUploaded = false;
            $scope.canPosted = false;
            $scope.upload_funs = [];
            $scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);

            $scope.$watch('file_count', function(val) {
              if ($scope.selectedFiles && $scope.selectedFiles.length) {
                if (val === $scope.selectedFiles.length) {
                  $scope.canPosted = true;
                } else {
                  $scope.canPosted = false;
                }
              }
            });

            $scope.$watch('feedWords', function(val) {
              if (val && val !== '') {
                $scope.canPosted = true;
              } else {
                $scope.canPosted = false;
              }
            })

            $scope.upload = function(files, type) {

              $scope.selectedFiles = files;
              $scope.file_count = 0;
              if (files && files.length > 0) {
                if (type === 'image') {
                  if (files && files.length > 3) {
                    ngCoolNoti.create({
                      message: 'Images length should not be more than 3',
                      position: 'top-right',
                      animation: 'jelly',
                      type: 'warning'
                    });
                    return false;
                  }
                  $scope.images = files;
                }
                if (type === 'audio') {
                  $scope.audio = files;
                }
                if (type === 'video') {
                  $scope.video = files;
                }
              } else {
                return false;
              }
              if (type === 'audio' || type === 'video') {
                $scope.mediaUploading = true;
              }

              if (type === 'audio') {
                ngAudioTag.getTag(files[0])
                  .then(function(tagdata) {
                    var base64String = "";
                    if( "picture" in tagdata ) {
                      var image = tagdata.picture;
                      for (var i = 0; i < image.data.length; i++) {
                        base64String += String.fromCharCode(image.data[i]);
                      }
                    }
                    var fields = {};
                    fields.category = type;
                    if (tagdata.title) {
                      fields.title = tagdata.title;
                    }
                    if (tagdata.comment && tagdata.comment.text) {
                      fields.comment = tagdata.comment.text.replace('music:', '');
                    }
                    if (tagdata.artist) {
                      fields.artist = tagdata.artist;
                    }
                    fields.audio_data = window.btoa(base64String);
                    angular.forEach(files, function(file) {
                      if (file) {
                        var fun = $upload.upload({
                          url: '/feed/upload_file',
                          file: file,
                          fields: fields
                        }).success(function(data, status, headers, config) {
                          if (data.status === 'fail') {
                            ngCoolNoti.create({
                              message: data.msg,
                              position: 'top-right',
                              animation: 'jelly',
                              type: 'danger'
                            });
                          } else {
                            $scope.file_count += 1;
                            file.url = data.file_info.url;
                            file.fileId = data.file_info.fileId;
                            file.key = data.file_info.key;
                            if (type === 'audio' || type === 'video') {
                              $scope.mediaUploaded = true;
                              $scope.media = file;
                            }
                          }
                        })
                        $scope.upload_funs.push(fun);
                      }
                    });
                  })
              } else {
                angular.forEach(files, function(file) {
                  if (file) {
                    var fun = $upload.upload({
                      url: '/feed/upload_file',
                      file: file,
                      fields: {
                        category: type
                      }
                    }).success(function(data, status, headers, config) {
                      if (data.status === 'fail') {
                        ngCoolNoti.create({
                          message: data.msg,
                          position: 'top-right',
                          animation: 'jelly',
                          type: 'danger'
                        });
                      } else {
                        $scope.file_count += 1;
                        file.url = data.file_info.url;
                        file.fileId = data.file_info.fileId;
                        file.key = data.file_info.key;
                        if (type === 'audio' || type === 'video') {
                          $scope.mediaUploaded = true;
                          $scope.media = file;
                        }
                      }
                    })
                    $scope.upload_funs.push(fun);
                  }
                });
              }
            };

            $scope.removeImage = function(index) {
              FeedService.removeFile($scope.images[index])
                .then(function(data) {
                  $scope.images = $scope.images.filter(function(image, i) {
                    return i !== index;
                  });
                }, function(err) {
                  console.log(err);
                });
            };

            $scope.removeMedia = function(media) {
              FeedService.removeFile(media)
                .then(function(data) {
                  if (media.type.indexOf('audio') > -1) {
                    $scope.audio = null;
                  }
                  if (media.type.indexOf('video') > -1) {
                    $scope.video = null;
                  }
                  $scope.mediaUploading = false;
                  $scope.mediaUploaded = false;
                  $scope.media = null;
                }, function(err) {
                  console.log(err);
                })
            }

            $scope.validateFile = function(file, type) {
              if (file.size > 50485760) {
                ngCoolNoti.create({
                  message: 'Your file size too large!',
                  position: 'top-right',
                  animation: 'jelly',
                  type: 'warning'
                });

                if (type === 'image') {
                  $scope.images = null;
                }
                if (type === 'audio') {
                  $scope.audio = null;
                }
                if (type === 'video') {
                  $scope.video = null;
                }
                return false;
              }
            };


            $scope.getLocation = function() {
              ngGeo.getLocationByIP()
                .then(function(data) {
                  if (data.city !== '') {
                    $scope.location = data.city;
                  } else {
                    $scope.location = 'Location Not Found';
                  }
                }, function(err) {
                  console.log(err);
                })
            }

          }],
          link: function(scope, ele, attrs) {

            var checkContents = function() {
              var hasContents = false;
              if (scope.feedWords && scope.feedWords !== '') {
                hasContents = true;
              }
              if (scope.images && scope.images.length > 0) {
                scope.category = 'image';
                scope.share_files = scope.images.map(function(item) {
                  var image = {
                    fileId: item.fileId,
                    url: item.url,
                    caption: item.caption || '',
                    key: item.key
                  }
                  return image;
                });
                hasContents = true;
              }
              if (scope.audio && scope.audio.length>0) {
                scope.category = 'audio';
                scope.share_files = scope.audio.map(function(item) {
                  return {fileId: item.fileId,url: item.url, key:item.key}
                })
                hasContents = true;
              }
              if (scope.video && scope.video.length>0) {
                scope.category = 'video';
                scope.share_files = scope.video.map(function(item) {
                  return {fileId: item.fileId,url: item.url, key:item.key}
                })
                hasContents = true;
              }
              return hasContents;
            }



            scope.postShare = function() {
              if (!checkContents()) {
                ngCoolNoti.create({
                  message: 'You add nothing to share :(',
                  position: 'top-right',
                  animation: 'jelly',
                  type: 'danger'
                });
                return false;
              } else {
                var feed = {
                  text: scope.feedWords,
                  category: scope.category,
                  share_files: scope.share_files,
                  tags: scope.tags,
                  location: scope.location
                };
                FeedService.create(feed)
                  .then(function(data) {
                    scope.cancel(true);
                    scope.$emit('feed:new', {new_feed_id: data.new_feed_id});
                  }, function(err) {
                    console.log(err);
                  })
              }
            };

            scope.cancel = function(isPostDone) {
              if (!isPostDone) {
                //abort upload
                scope.upload_funs.forEach(function(fun) {
                  fun.abort();
                });

                checkContents();

                if(scope.share_files && scope.share_files.length > 0) {
                  scope.share_files.forEach(function(file) {
                    if (file.fileId && file.key) {
                      FeedService.removeFile(file)
                        .then(function(data) {
                          console.log(data);
                        })
                    }
                  })
                }
              }

              $(ele).find('.sf-create-main').addClass('jelley-out');
              $timeout(function() {
                scope.spinnerShow = false;
                scope.mediaReady = false;
                scope.mediaUploading = false;
                scope.mediaUploaded = false;
                scope.file_count = null;
                scope.selectedFiles = null;
                scope.canPosted = false;
                scope.images = null;
                scope.audio = null;
                scope.video = null;
                scope.category = null;
                scope.share_files = null;
                scope.feedWords = '';
                scope.location = null;
                scope.tags = null;

                ele.remove();
                $document.find('body').removeClass('create-open');
              }, 950);
            }
          }
        }
      }
    ])
    .directive('sfFeedDetailShow', [
      '$document',
      '$compile',
      '$http',
      '$q',
      '$timeout',
      function($document, $compile, $http, $q, $timeout) {
        return {
          restrict: 'AE',
          scope: {
            feedId: '=feedId',
            usersAt: '=usersAt',
            current_user: '=currentUser'
          },
          link: function(scope, ele, attrs) {
            var body = $document.find('body');
            attrs.$observe('currentImageIndex', function(val) {
              if (val) {
                scope.current_image_index = parseInt(val, 10);
              }
            });
            ele.on('click', function() {
              var all = [];
              var feedPromise = $http({
                method: 'GET',
                url: '/feed/detail',
                params: {feedId: scope.feedId}
              });

              var tplPromise = $http.get('template/partials/feed-detail.html');

              all.push(feedPromise);
              all.push(tplPromise);
              $q.all(all)
                .then(function(res) {
                  if (res && res.length === 2) {
                    scope.feed = res[0].data;
                    var tpl = $compile(res[1].data)(scope);
                    $timeout(function() {
                      body.append(angular.element(tpl));

                      var detail_con = body[0].querySelector('.sf-feed-detail');
                      body.addClass('sf-feed-detail-open');
                      $('.feed-detail-container').addClass('in');
                    })
                  }
                }, function(err) {
                  console.log(err);
                })
            })
          }
        }
      }
    ])
    .directive('sfFeedDetail', [
      '$document',
      '$timeout',
      'FeedService',
      'ngCoolNoti',
      function($document, $timeout, FeedService, ngCoolNoti) {
        return {
          restrict: 'AE',
          link: function(scope, ele, attrs) {
            var body = $document.find('body');
            scope.closeFeedDetail = function() {
              $('.feed-detail-container').removeClass('in').addClass('out');
              $timeout(function() {
                ele.remove();
                body.removeClass('sf-feed-detail-open');
              }, 1000);
            };
          }
        }
      }
    ])
    .directive('sfFeedAddComment', [
      '$document',
      '$timeout',
      'FeedService',
      'UserService',
      function($document, $timeout, FeedService, UserService) {
        return {
          restrict: 'AE',
          scope: {
            feed: '=feed',
            usersAt: '=usersAt'
          },
          transclude: true,
          template: '<div class="feed-add-comment"><div class="feed-add-comment-inner"><form class="comment-form"><input type="text" class="form-control" placeholder="Add a comment" mentio mentio-items="usersAt" ng-model="commentWord"></form></div></div>',
          link: function(scope, ele, attrs) {
            var form = ele[0].querySelector('form.comment-form');
            form.addEventListener('submit', function() {
              if (scope.commentWord === '') {
                return;
              } else {
                FeedService.addComment(scope.feed._id, scope.commentWord)
                  .then(function(data) {
                    if (data.status === 'success') {
                      var new_c = data.new_comment;
                      console.log(new_c)
                      scope.feed.comments.unshift(new_c);

                      //remove input
                      scope.commentWord = '';
                    }
                  }, function(err) {
                    console.log(err);
                  })
              }
            })
          }
        }
      }
    ])
    .directive('sfFeedGallery', [
      '$timeout',
      '$document',
      function($timeout, $document) {
        return {
          restrict: 'AE',
          scope: {
            feed: '=feed',
            current_image_index: '@currentImageIndex'
          },
          template: '<div class="feed-detail-image-preview"><img ng-show="imageReady" ng-src="{{current_image.url}}" alt="Photo"><i class="ti-angle-left" ng-click="preImage()"></i><i class="ti-angle-right" ng-click="nextImage()"></i><div class="image-caption">{{current_image.caption}}</div><div ng-show="!imageReady" ng-include="\'template/spinner.html\'"></div></div>',
          link: function(scope, ele, attrs) {
            //calculate image for displaying
            scope.imageReady = false;
            var $img = ele.find('img');
            var setImageDimension = function(rect) {
              var image = new Image();
              image.src = scope.current_image.url;
              image.onload = function() {
                var real = {};
                var img_width = image.width;
                var img_height = image.height;

                var width_radio = rect.width/img_width;
                var height_radio = rect.height/img_height;

                if (width_radio >= height_radio) {
                  real.width = img_width * height_radio;
                  real.height = img_height * height_radio;
                } else {
                  real.width = img_width * width_radio;
                  real.height = img_height * width_radio;
                }
                $img.css('width', real.width + 'px');
                $img.css('height', real.height + 'px');
                $img.css('margin-top', (-real.height/2)+'px');
                $img.css('margin-left', (-real.width/2)+'px');
                $timeout(function() {
                  scope.imageReady = true;
                }, 300)
              }
            }

            scope.current_image = scope.feed.attach_files[scope.current_image_index];
            $timeout(function() {
              var rect = scope.rect = ele[0].getBoundingClientRect();
              setImageDimension(rect);
            }, 500);

            scope.preImage = function() {
              var current_index = 0;
              angular.forEach(scope.feed.attach_files, function(item, index) {
                if (item._id === scope.current_image._id) {
                  current_index = index;
                }
              });
              current_index = current_index - 1;
              if (current_index < 0) {
                current_index = scope.feed.attach_files.length - 1;
              }
              scope.current_image = scope.feed.attach_files[current_index];
              setImageDimension(scope.rect);
            };

            scope.nextImage = function() {
              var current_index = 0;
              angular.forEach(scope.feed.attach_files, function(item, index) {
                if (item._id === scope.current_image._id) {
                  current_index = index;
                }
              });
              current_index = current_index + 1;
              if (current_index > scope.feed.attach_files.length -1) {
                current_index = 0;
              }
              scope.current_image = scope.feed.attach_files[current_index];
              setImageDimension(scope.rect);
            };

          }
        }
      }
    ])
    .directive('sfBannerScrollBlur', [
      '$window',
      function($window) {
        return {
          restrict: 'AE',
          link: function(scope, ele, attrs) {
            $(window).on('scroll', function() {
              var val = 0;
              val = $(window).scrollTop()/450;
              if (val <= 1) {
                $(ele[0]).find('.sf-banner-blur').css('opacity', val);
              }
            })
          }
        }
      }
    ])
    .directive('sfFeedAction', function(FeedService) {
      return {
        restrict: 'AE',
        scope: {
          feed: '=feed',
          current_user: '=currentUser'
        },
        template: '<div class="feed-actions">\
                    <a ng-click="toggleFeedLike()" class="toggle-like-link">\
                      <svg ng-show="!feed.isLike" width="24px" height="23px" viewBox="0 0 24 23" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"><g id="detail" sketch:type="MSArtboardGroup" transform="translate(-617.000000, -373.000000)" fill="#CCCCCC"><path d="M629,395.488889 L627.32,393.777778 C621.08,388.155556 617,384.366667 617,379.722222 C617,375.933333 619.88,373 623.6,373 C625.64,373 627.68,373.977778 629,375.566667 C630.32,373.977778 632.36,373 634.4,373 C638.12,373 641,375.933333 641,379.722222 C641,384.366667 636.92,388.155556 630.68,393.777778 L629,395.488889 L629,395.488889 Z" id="Shape" sketch:type="MSShapeGroup"></path></g></g></svg><svg ng-show="feed.isLike" width="24px" height="23px" viewBox="0 0 24 23" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"><g id="detail" sketch:type="MSArtboardGroup" transform="translate(-617.000000, -373.000000)" fill="#FF5252"><path d="M629,395.488889 L627.32,393.777778 C621.08,388.155556 617,384.366667 617,379.722222 C617,375.933333 619.88,373 623.6,373 C625.64,373 627.68,373.977778 629,375.566667 C630.32,373.977778 632.36,373 634.4,373 C638.12,373 641,375.933333 641,379.722222 C641,384.366667 636.92,388.155556 630.68,393.777778 L629,395.488889 L629,395.488889 Z" id="Shape" sketch:type="MSShapeGroup"></path></g></g></svg>\
                      <span class="likes-count" ng-if="feed.likes_count > 0">{{feed.likes_count | formatCount}}</span>\
                    </a>\
                    <ul class="list-inline likes-list" ng-if="feed.likes && feed.likes.length > 0">\
                      <li ng-repeat="liker in feed.likes">\
                        <a ui-sref="user({name: liker.name})">\
                          <img ng-src="{{liker.avatar}}" class="img-rounded" alt="" ng-cool-tooltip="{{liker.name}}">\
                        </a>\
                      </li>\
                    </ul>\
                  </div>',
        link: function(scope, ele, attrs) {
          scope.toggleFeedLike = function() {
            if (scope.feed) {
              FeedService.toggleLike(scope.feed)
                .then(function(data) {
                  if (data.status === 'success') {
                    //dom
                    if (scope.feed.isLike) {
                      scope.feed.likes = scope.feed.likes.filter(function(liker) {
                        return liker._id !== scope.current_user._id;
                      })
                    } else {
                      scope.feed.likes.unshift({
                        _id: scope.current_user._id,
                        name: scope.current_user.name,
                        avatar: scope.current_user.avatar
                      });
                      scope.feed.likes_count += 1;
                    }
                    scope.feed.isLike = !scope.feed.isLike;
                  }
                }, function(err) {
                  console.log(err);
                })
            }
          }
        }
      }
    })
    .directive('sfWeatherCard', [
      '$timeout',
      'ngGeo',
      function($timeout, ngGeo) {
        return {
          restrict: 'AE',
          scope: {
            current_user: '=currentUser'
          },
          template: '<div class="sf-map-card"><div id="map-container"><div class="weather-city"><i class="ti-location-pin"></i><span>{{weather.city}}</span></div></div><div class="sf-weathers"><div ng-bind-html="weather.icon" class="weather-icon"></div><div class="weather-info"><div class="weather-weather"><span>天气: </span><span>{{weather.weather}}</span></div><div class="weather-temperature"><span>温度: </span><span>{{weather.temperature}}&#176;C</span></div><div class="weather-time"><span>发布时间: </span><span>{{weather.reportTime}}</span></div></div></div></div>',
          controller: ['$scope', function($scope) {

          }],
          link: function(scope, ele, attrs) {
            scope.$watch('current_user', function(val) {
              if (val) {
                var domId = 'map-container';
                var city = scope.current_user.location === 'others' ? '上海市': scope.current_user.location;
                ngGeo.initMapByCity(city, domId);

                ngGeo.getWeatherByCity(city)
                  .then(function(info) {
                    if (info) {
                      scope.weather = info;
                    }
                  }, function(err) {
                    console.log(err);
                  })
              }
            })
          }
        }
      }
    ])
    .directive('sfFeedActionMore', [
      'FeedService',
      'UserService',
      'ngCoolNoti',
      function(FeedService, UserService, ngCoolNoti) {
        return {
          retrict: 'AE',
          scope: {
            feed: '=feed',
            current_user: '=currentUser'
          },
          template: '<div class="dropdown feed-right-dropdown">\
                      <a class="dropdown-toggle ti-angle-down" data-toggle="dropdown" role="button" aria-expanded="false"></a>\
                      <ul class="dropdown-menu" role="menu">\
                        <li class="dropdown-arrow feed-drop-arrow"></li>\
                        <li ng-if="(current_user._id != feed.creator._id) && feed.creator.hasFollowed"><a ng-click="unfollow(feed)">unfollow {{feed.creator.name}}</a></li>\
                        <li ng-if="(current_user._id != feed.creator._id) && !feed.creator.hasFollowed"><a ng-click="follow(feed)">follow {{feed.creator.name}}</a></li>\
                        <li ng-if="current_user._id == feed.creator._id"><a ng-click="delete(feed)">delete post</a></li>\
                        <li><a ng-click="share(feed)">share feed</a></li>\
                        <li><a ng-click="bookmark(feed)">bookmark feed</a></li>\
                        <li><a ui-sref="feed({id: feed._id})">view detail</a></li>\
                      </ul>\
                    </div>',
          link: function(scope, ele, attrs) {
            scope.follow = function(feed) {
              UserService.follow(feed.creator._id)
                .then(function(data) {
                  if (data.status === 'success') {
                    scope.current_user.followers.push(feed.creator._id);
                    feed.creator.hasFollowed = true;
                  }
                })
            };

            scope.unfollow = function(feed) {
              UserService.unfollow(feed.creator._id)
                .then(function(data) {
                  if (data.status === 'success') {
                    feed.creator.followees = feed.creator.followees.filter(function(item) {
                      return item._id != scope.current_user._id;
                    });
                    feed.creator.hasFollowed = false;
                  }
                })
            };

            scope.bookmark = function(feed) {

            }

            scope.delete = function(feed) {
              FeedService.deleteFeed(feed._id)
                .then(function(data) {
                  // cound down post count of currentUser
                  scope.current_user.post_count -= 1;

                  //here modify the dom

                  var $sfFeed = $(ele[0]).parents('.sf-feed');
                  var tpl = '<div class="feed-delete-overlay">\
                    <div class="delete-wrap">\
                    <div class="delete-icon">\
                      <i class="ti-check"></i>\
                    </div>\
                    <div class="delete-tip">\
                      Post deleted\
                    </div>\
                    <div class="remove-feed">\
                      <a class="remove-feed-link">dismiss</a>\
                    </div>\
                    </div>\
                  </div>';
                  $sfFeed.prepend(tpl);
                  var $wrap = $sfFeed.find('.delete-wrap');
                  var height = $wrap.height();
                  var width = $wrap.width();
                  $wrap.css('margin-top', (-height/2) + 'px');
                  $wrap.css('margin-left', (-width/2) + 'px');
                  var $removelink = $sfFeed.find('.remove-feed-link');
                  $removelink.on('click', function() {
                    $sfFeed.remove();
                  });

                }, function(err) {
                  console.log(err);
                })
            }
          }
        }
      }
    ])
    .directive('sfFeedComments', [
      'FeedService',
      function(FeedService) {
        return {
          restrict: 'AE',
          scope: {
            feed: '=feed',
            current_user: '=currentUser'
          },
          template: '<div class="comments-more" ng-if="feed.comments.length > 0">\
            <a ng-click="loadMoreComments()">More Comments</a>\
          </div>\
          <div class="feed-comment-item" ng-repeat="comment in feed.comments">\
            <div class="comment-user-avatar">\
              <a ui-sref="user({name: comment.creator.name})">\
                <img ng-src="{{comment.creator.avatar}}" alt="" class="img-rounded">\
              </a>\
            </div>\
            <div class="comment-content">\
              <div class="top">\
                <a class="comment-user-name" ui-sref="user({name: comment.creator.name})">{{comment.creator.name}}</a>\
                <span class="comment-time">{{comment.createdAt | sinceTime}}</span>\
                <i class="ti-trash pull-right" ng-if="comment.creator._id == current_user._id" ng-click="deleteComment(comment)"></i>\
              </div>\
              <div class="comment-words" ng-bind-html="comment.content">\
              </div>\
            </div>\
          </div>',
          link: function(scope, ele, attrs) {

            function checkCommentsExist(comment) {
              var isExist = scope.feed.comments.some(function(item) {
                return item._id === comment._id;
              });
              return isExist;
            }

            scope.deleteComment = function(comment) {
              FeedService.deleteComment(scope.feed._id, comment._id)
                .then(function(data) {
                  scope.feed.comments = scope.feed.comments.filter(function(item) {
                    return item._id !== comment._id;
                  })
                }, function(err) {
                  console.log(err);
                })
            }

            scope.loadMoreComments = function() {
              var count = scope.feed.comments.length;
              FeedService.loadMoreComments(scope.feed._id, count)
                .then(function(data) {
                  data.comments.forEach(function(comment) {
                    if(!checkCommentsExist(comment)) {
                      scope.feed.comments.push(comment);
                    }
                  }, function(err) {
                    console.log(err);
                  })
                })
            }
          }
        }
      }
    ])
    .directive('sfLogout', [
      'UserService',
      '$state',
      function(UserService, $state) {
        return {
          restrict: 'AE',
          template: '<a ng-click="logout()">Logout</a>',
          link: function(scope, ele, attrs) {
            scope.logout = function() {
              UserService.logout()
                .then(function(data) {
                  $state.go('welcome');
                }, function(err) {
                  console.log(err);
                })
            }
          }
        }
      }
    ])
})();
