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
      'Upload',
      'ngCoolNoti',
      'FeedService',
      'ngAudioTag',
      'ngGeo',
      'FileService',
      function($document, $timeout, $http, $rootScope, $q, Upload, ngCoolNoti, FeedService, ngAudioTag, ngGeo, FileService) {
        return {
          restrict: 'AE',
          controller: ['$scope', '$element', function($scope, $element) {
            $scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);

            $scope.canPosted = false;
            //this store the uploading functions when user cancel uploading, then we abort this uploading
            $scope.uploading_funs = [];
            $scope.mediaUploading = false;
            $scope.mediaUploaded = false;

            $scope.$watch('post_text', function(val) {
              if (val && val !== '') {
                $scope.canPosted = true;
              } else {
                $scope.canPosted = false;
              }
            });

            $scope.$watch('file_count', function(val) {
              if ($scope.selectedFiles && $scope.selectedFiles.length) {
                if (val === $scope.selectedFiles.length) {
                  $scope.canPosted = true;
                } else {
                  $scope.canPosted = false;
                }
              }
            });


            $scope.uploadImages = function(files, type) {
              $scope.file_count = 0;
              $scope.selectedFiles = files;
              //set max images length 3
              if (files && files.length > 3) {
                ngCoolNoti.create({
                  message: '图片一次最多上传3张',
                  position: 'top-right',
                  animation: 'jelly',
                  type: 'warning'
                });
                return false;
              }
              $scope.images = files;
              angular.forEach($scope.images, function(image) {
                var fun = Upload.upload({
                  url: '/file/upload',
                  file: image,
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
                    image.url = data.file_info.url;
                    image.fileId = data.file_info.fileId;
                    image.key = data.file_info.key;
                  }
                })
                $scope.uploading_funs.push(fun);
              })
            }

            $scope.uploadVideo = function(files, type) {
              $scope.file_count = 0;
              $scope.selectedFiles = files;
              $scope.mediaUploading = true;
              if (files && files.length > 0) {
                $scope.video = files[0];
                var fun = Upload.upload({
                  url: '/file/upload',
                  file: $scope.video,
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
                    $scope.video.url = data.file_info.url;
                    $scope.video.fileId = data.file_info.fileId;
                    $scope.video.key = data.file_info.key;

                    $scope.media = $scope.video;
                    $scope.mediaUploaded = true;
                  }
                })
                $scope.uploading_funs.push(fun);
              }
            };

            $scope.uploadAudio = function(files, type) {
              $scope.file_count = 0;
              $scope.selectedFiles = files;
              $scope.mediaUploading = true;
              if (files && files.length > 0) {
                $scope.audio = files[0];
                ngAudioTag.getTag($scope.audio)
                  .then(function(tag_info) {
                    var base64String = "";
                    var audio_tag = {};
                    if( "picture" in tag_info ) {
                      var image = tag_info.picture;
                      for (var i = 0; i < image.data.length; i++) {
                        base64String += String.fromCharCode(image.data[i]);
                      }
                    }
                    if (tag_info.title) {
                      audio_tag.title = tag_info.title;
                    }
                    if (tag_info.comment && tag_info.comment.text) {
                      audio_tag.comment = tag_info.comment.text.replace('music:', '');
                    }
                    if (tag_info.artist) {
                      audio_tag.artist = tag_info.artist;
                    }
                    audio_tag.data = window.btoa(base64String);
                    return audio_tag;
                  })
                  .then(function(audio_tag) {
                    var fun = Upload.upload({
                      url: '/file/upload',
                      file: $scope.audio,
                      fields: {
                        category: type,
                        audio_tag: audio_tag
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
                        $scope.audio.url = data.file_info.url;
                        $scope.audio.fileId = data.file_info.fileId;
                        $scope.audio.key = data.file_info.key;

                        $scope.media = $scope.audio;
                        $scope.mediaUploaded = true;
                      }
                    })
                    $scope.uploading_funs.push(fun);
                  })
              }
            }

            $scope.removeImage = function(index) {
              FileService.removeFile($scope.images[index])
                .then(function(data) {
                  $scope.images = $scope.images.filter(function(image, i) {
                    return i !== index;
                  });
                }, function(err) {
                  console.log(err);
                });
            };

            $scope.removeMedia = function(media) {
              FileService.removeFile(media)
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
              if (file.size > 10485760) {
                ngCoolNoti.create({
                  message: '文件最大为10MB',
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
                    $scope.location = 'Unknow';
                  }
                }, function(err) {
                  console.log(err);
                  $scope.location = 'Unknow';
                })
            }
          }],
          link: function(scope, ele, attrs) {
            function formatFeedInfo() {
              scope.share_files = [];
              if (scope.images) {
                scope.category = 'image';
                scope.share_files = scope.images.map(function(image) {
                  var item = {
                    fileId: image.fileId,
                    url: image.url,
                    caption: image.caption || '',
                    key: image.key
                  };
                  return item;
                });
              }
              if (scope.audio) {
                scope.category = 'audio';
                var item = {
                  fileId: scope.audio.fileId,
                  url: scope.audio.url,
                  key: scope.audio.key
                }
                scope.share_files.push(item);
              }
              if (scope.video) {
                scope.category = 'video';
                var item = {
                  fileId: scope.video.fileId,
                  url: scope.video.url,
                  key: scope.video.key
                }
                scope.share_files.push(item);
              }
            }
            scope.postShare = function() {
              formatFeedInfo();
              var feed = {
                text: scope.post_text,
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
            };

            scope.cancel = function(isPostDone) {
              if (!isPostDone) {
                //abort upload
                scope.uploading_funs.forEach(function(fun) {
                  fun.abort();
                });

                formatFeedInfo();

                if(scope.share_files && scope.share_files.length > 0) {
                  scope.share_files.forEach(function(file) {
                    if (file.fileId && file.key) {
                      FileService.removeFile(file);
                    }
                  })
                }
              }

              $(ele).find('.sf-create-main').addClass('jelley-out');
              $timeout(function() {
                scope.spinnerShow = false;
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
                scope.post_text = '';
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
    .directive('ckLightbox', [
      '$document',
      '$timeout',
      '$compile',
      function($document, $timeout, $compile) {
        return {
          restrict: 'AE',
          scope: {
            imageUrl: '@ngSrc'
          },
          link: function(scope, ele, attrs) {
            var body = $document.find('body');

            var tpl = '';
            tpl += '<div class="ck-lightbox">';
            tpl += '<div class="ck-lightbox-overlay"></div>';
            tpl += '<div class="lightbox-body">';
            tpl += '<div class="lightbox-content">';
            tpl += '<img ng-src="{{imageUrl}}" alt="photo" class="img-rounded" ng-show="imageReady">';
            tpl += '<div class="spinner" ng-show="!imageReady"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>';
            tpl += '</div></div></div>';

            $(ele[0]).on('click', function() {
              var templ = $compile(tpl)(scope);
              $timeout(function() {
                body.addClass('ck-lightbox-open');
                body.append(templ);
                var container = document.querySelector('.lightbox-content');
                var rect = container.getBoundingClientRect();
                setImageDimension(rect);

                $('.ck-lightbox').on('click', function() {
                  $(this).remove();
                  body.removeClass('ck-lightbox-open');
                })
              });
            });

            var setImageDimension = function(rect) {
              scope.imageReady = false;
              var $img = $('.ck-lightbox').find('img');
              var image = new Image();
              image.src = scope.imageUrl;
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
    .directive('ckFeedAction', function(FeedService) {
      return {
        restrict: 'AE',
        scope: {
          feed: '=feed',
          current_user: '=currentUser'
        },
        template: '<div class="post-action">\
                  <div class="like-action">\
                    <i class="fa fa-heart" ng-class="{\'isLike\': feed.isLike}" ng-click="toggleFeedLike()"></i>\
                    <span class="like-tip" ng-if="feed.likes_count == 1">\
                      <a ui-sref="user({name: feed.likes[0].name})">{{feed.likes[0].name}}</a> liked this\
                    </span>\
                    <span class="like-tip" ng-if="feed.likes_count == 2">\
                      <a ui-sref="user({name: feed.likes[0].name})">{{feed.likes[0].name}}</a> and <a ui-sref="user({name: feed.likes[1].name})">{{feed.likes[1].name}}</a> liked this\
                    </span>\
                    <span class="like-tip" ng-if="feed.likes_count > 2">\
                      <a ui-sref="user({name: feed.likes[0].name})">{{feed.likes[0].name}}</a> and <a >{{feed.likes_count - 1}} others</a> liked this\
                    </span>\
                  </div>\
                  <div class="likes-list" ng-if="feed.likes && feed.likes.length > 0">\
                    <a ng-repeat="liker in feed.likes" ui-sref="user({name: liker.name})">\
                      <img ng-src="{{liker.avatar}}" alt="avatar" class="img-rounded" ng-cool-tooltip tooltip-placement="top" title="{{liker.name}}">\
                    </a>\
                  </div>\
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
                      scope.feed.likes_count -= 1;
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
          template: '<div class="sf-map-card">\
            <div id="map-container">\
              <div class="weather-city"><i class="fa fa-map-marker"></i>\
                <span>{{weather.city}}</span>\
              </div>\
            </div>\
            <div class="sf-weathers">\
              <div ng-bind-html="weather.icon" class="weather-icon"></div>\
              <div class="weather-info">\
                <div class="weather-weather">\
                  <span>天气: </span>\
                  <span>{{weather.weather}}</span>\
                </div>\
                <div class="weather-temperature">\
                  <span>温度: </span>\
                  <span>{{weather.temperature}}&#176;C</span>\
                </div>\
                <div class="weather-time">\
                  <span>发布时间: </span>\
                  <span>{{weather.reportTime}}</span>\
                </div>\
              </div>\
            </div>\
          </div>',
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
    .directive('ckFeedActionMore', [
      'FeedService',
      'UserService',
      'ngCoolNoti',
      '$timeout',
      function(FeedService, UserService, ngCoolNoti,$timeout) {
        return {
          retrict: 'AE',
          scope: {
            feed: '=feed',
            current_user: '=currentUser'
          },
          template: '<div class="dropdown feed-right-dropdown">\
                      <a class="dropdown-toggle fa fa-angle-down" data-toggle="dropdown" role="button" aria-expanded="false"></a>\
                      <ul class="dropdown-menu" role="menu">\
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
                    ngCoolNoti.create({
                      message: '成功关注了'+feed.creator.name,
                      position: 'top-right',
                      type: 'success',
                      animation: 'jelly'
                    })
                  }
                })
            };

            scope.unfollow = function(feed) {
              UserService.unfollow(feed.creator._id)
                .then(function(data) {
                  if (data.status === 'success') {
                    feed.creator.followees = feed.creator.followees.filter(function(id) {
                      return id != scope.current_user._id;
                    });
                    feed.creator.hasFollowed = false;
                    ngCoolNoti.create({
                      message: '成功取消关注了'+feed.creator.name,
                      position: 'top-right',
                      type: 'success',
                      animation: 'jelly'
                    })
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
                  var $post = $(ele[0]).parents('.ck-post-item');
                  var $postcard = $post.find('.ck-post-card');
                  $postcard.addClass('bounceOut');
                  $timeout(function() {
                    $post.remove();
                  }, 1000);
                }, function(err) {
                  console.log(err);
                })
            }
          }
        }
      }
    ])
    .directive('ckFeedComments', [
      'FeedService',
      function(FeedService) {
        return {
          restrict: 'AE',
          scope: {
            feed: '=feed',
            current_user: '=currentUser'
          },
          template: '<div class="post-comments">\
                  <div class="comments-scroll">\
                  <div class="load-more-comment" ng-if="feed.comments_count > 3">\
                    <a ng-click="loadMoreComments()">More comments</a>\
                  </div>\
                  <div class="comments-list">\
                    <div class="comment-item" ng-repeat="comment in feed.comments">\
                      <div class="comment-avatar">\
                        <img ng-src="{{comment.creator.avatar}}" alt="avatar" class="img-rounded">\
                      </div>\
                      <div class="comment-body">\
                        <div class="comment-text">\
                          <a class="creator-link" ui-sref="user({name: comment.creator.name})">{{comment.creator.name}}</a>\
                          <span ng-bind-html="comment.content"></span>\
                        </div>\
                        <div class="comment-action">\
                          <span class="time">{{comment.createdAt | date: \'yyyy-MM-dd hh:mm\'}}</span>\
                          <i class="fa fa-reply" ng-cool-tooltip tooltip-placement="top" title="reply" ng-click="replyComment(comment)"></i>\
                          <i class="fa fa-trash-o" ng-if="comment.creator._id == current_user._id" ng-click="deleteComment(comment)" ng-cool-tooltip tooltip-placement="top" title="delete"></i>\
                        </div>\
                      </div>\
                    </div>\
                  </div>\
                  </div>\
                  <div class="add-comment comment-item">\
                    <div class="comment-avatar">\
                      <img ng-src="{{current_user.avatar}}" alt="avatar" class="img-rounded">\
                    </div>\
                    <div class="comment-body">\
                      <form class="comment-form">\
                        <input type="text" class="form-control" placeholder="写评论..." ng-model="commentWord">\
                      </form>\
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
            scope.replyComment = function(comment) {
              scope.commentWord = '@'+comment.creator.name + ' ';
              $(form).find('input').focus();
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
                  $state.go('signup');
                }, function(err) {
                  console.log(err);
                })
            }
          }
        }
      }
    ])
    .directive('ngCoolTooltip', function() {
      return {
        restrict: 'AE',
        link: function(scope, ele, attrs) {
          var placement = attrs.tooltipPlacement;
          attrs.$observe('title', function(val) {
            if (val !== '') {
              $(ele[0]).tooltip({
                title: val,
                placement: placement
              })
            }
          })
        }
      }
    })
    .directive('ckTitle', [
      '$rootScope',
      '$timeout',
      function($rootScope, $timeout) {
        return {
          restrict: 'AE',
          link: function(scope, ele, attrs) {
            var listener = function(evt, toState) {
              $timeout(function() {
                $rootScope.title = (toState.data && toState.data.pageTitle) ? toState.data.pageTitle : 'Cool Zone';
              });
            };

            $rootScope.$on('$stateChangeSuccess', listener);
          }
        }
      }

    ])
})();
