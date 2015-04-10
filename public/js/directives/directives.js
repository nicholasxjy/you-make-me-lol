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
          link: function(scope, ele, attrs) {
            var body = $document.find('body')[0];
            var $body = angular.element(body);
            attrs.$observe('sfCreateFeed', function(val) {
              scope.current_user_avatar = val;
            });
            ele.on('click', function() {
              //append dom to body
              var template = $http.get('template/partials/create-bar.html');
              template.success(function(data) {
                var tpl = $compile(data)(scope);
                $timeout(function() {
                  $body.append(tpl);
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
      function($document, $timeout, $http, $rootScope, $q, $upload, ngCoolNoti, FeedService) {
        return {
          restrict: 'AE',
          scope: false,
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
            $scope.upload = function(files, type) {
              $scope.selectedFiles = files;
              $scope.file_count = 0;
              if (files && files.length > 0) {
                if (type === 'image') {
                  if (files && files.length > 5) {
                    ngCoolNoti.create({
                      message: 'Images length should not be more than 5',
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
              if (file.size > 10485760) {
                ngCoolNoti.create({
                  message: 'Your file size should be less than 10MB',
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

          }],
          link: function(scope, ele, attrs) {

            var textPlaceholder = ele[0].querySelector('.create-placeholder');
            var inputEdit = ele[0].querySelector('.input-edit');

            var $textPlaceholder = $(textPlaceholder);
            var $inputEdit = $(inputEdit);

            $inputEdit.on('keyup', function(e) {
              var val = $(this).html();
              if (val !== '') {
                $textPlaceholder.hide();
              } else {
                $textPlaceholder.show();
              }
            });

            var checkContents = function() {
              var hasContents = false;
              var text = $inputEdit.html();
              text = text.trim();
              if (text !== '') {
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

              var text = $inputEdit.html();
              text = text.trim();
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
                  text: text,
                  category: scope.category,
                  share_files: scope.share_files,
                  tags: scope.tags
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
              scope.tags = null;

              $(ele).find('.sf-create-wrap').addClass('zoomOut');
              $timeout(function() {
                ele.remove();
              }, 750);
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
            feedId: '=feedId'
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

                      var rect = detail_con.getBoundingClientRect();
                      var $container = $('.feed-detail-container');
                      $container.css('width', (rect.width - 200)+'px');
                      $container.css('height', (rect.height - 100)+'px');

                      var $content = $('.feed-gallery');

                      $content.css('width', (rect.width - 200 -320)+'px');
                      $content.css('height', (rect.height - 100)+'px');

                      body.addClass('sf-feed-detail-open');
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
          controller: ['$scope', function($scope) {
            $scope.isCommenting = false;
            $scope.canPostComment = false;
            $scope.touser = $scope.feed.creator.id;
          }],
          link: function(scope, ele, attrs) {
            var body = $document.find('body');
            var $comment_input = $(ele).find('.comment-input');
            var $comment_fake_input = $(ele).find('.comment-fake-input');
            scope.closeFeedDetail = function() {
              ele.remove();
              body.removeClass('sf-feed-detail-open');
            };

            scope.cancelComment = function() {
              $comment_input.html('');
              scope.isCommenting = false;
            };

            scope.postComment = function(feed) {
              var comment_words = $comment_input.html();
              FeedService.addComment(feed.id, comment_words, scope.touser)
                .then(function(data) {
                  if (data.status === 'success') {

                    var comment = data.new_comment;
                    comment.content = comment_words;

                    feed.comments.push(comment);

                    $comment_input.html('');
                    scope.isCommenting = false;

                  } else {
                    ngCoolNoti.create({
                      message: data.msg,
                      position: 'top-right',
                      timeout: 4000,
                      type: 'danger'
                    });
                  }
                }, function(err) {
                  console.log(err);
                })
            }

            $comment_input.on('keyup', function(e) {
              var val = $(this).html();
              if (val !== '') {
                scope.canPostComment = true;
              } else {
                scope.canPostComment = false;
              }
              scope.$apply();
            });

            $comment_fake_input.on('focus', function() {
              scope.isCommenting = true;
              var input = ele[0].querySelector('.comment-input');
              var s = window.getSelection();
              var r = document.createRange();
              r.collapse(false);
              r.setStart(input, 0);
              r.setEnd(input, 0);
              s.removeAllRanges();
              s.addRange(r);
              scope.$apply();
            });

          }
        }
      }
    ])
    .directive('sfFeedAddComment', [
      '$document',
      '$timeout',
      'FeedService',
      function($document, $timeout, FeedService) {
        return {
          restrict: 'AE',
          scope: {
            feed: '=feed'
          },
          transclude: true,
          template: '<div class="feed-add-comment"><div class="feed-fake-comment-input"><input type="text" class="form-control sf-form-control" placeholder="Add a comment"></div><div class="feed-comment-input"><div class="comment-input" contentEditable="true"></div><button class="sf-btn sf-btn-success comment-post">post comment</button><button class="sf-btn sf-btn-default comment-cancel">cancel</button></div></div>',
          link: function(scope, ele, attrs) {
            var fake_con = ele[0].querySelector('.feed-fake-comment-input');
            var real_con = ele[0].querySelector('.feed-comment-input');
            var input = ele[0].querySelector('.feed-fake-comment-input input');
            var cancel = ele[0].querySelector('.comment-cancel');
            var post = ele[0].querySelector('.comment-post');

            var comment_input = ele[0].querySelector('.comment-input');

            var $fake_con = angular.element(fake_con);
            var $real_con = angular.element(real_con);
            var $comment_input = angular.element(comment_input);
            input.addEventListener('focus', function(e) {
              $timeout(function() {
                $fake_con.css('display', 'none');
                $real_con.css('display', 'block');
              }, 200)

            });

            cancel.addEventListener('click', function() {
              $comment_input.html('');
              $real_con.css('display', 'none');
              $fake_con.css('display', 'block');
            });

            post.addEventListener('click', function() {
              var comment = $comment_input.html();
              if (comment.trim() === '') {
                return false;
              }
              scope.touser = scope.feed.creator._id;
              FeedService.addComment(scope.feed._id, comment, scope.touser)
                .then(function(data) {
                  var c_obj = data.new_comment;
                  c_obj.content = comment;
                  scope.feed.comments.push(c_obj);
                  $timeout(function() {
                    $comment_input.html('');
                    $real_con.css('display', 'none');
                    $fake_con.css('display', 'block');
                  })

                }, function(err) {
                  console.log(err);
                })
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
          template: '<div class="feed-detail-image-preview"><img ng-show="imageReady" ng-src="{{current_image.url}}" alt="Photo"><i class="fa fa-chevron-left" ng-click="preImage()"></i><i class="fa fa-chevron-right" ng-click="nextImage()"></i><div class="image-caption">{{current_image.caption || \'When he asked me to move in with him, we had only been dating a few months. It was a romantic proposition, but a practical one too.\'}}</div><div ng-show="!imageReady" ng-include="\'template/spinner.html\'"></div></div>',
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
              }
            }

            scope.current_image = scope.feed.attach_files[scope.current_image_index];
            $timeout(function() {
              var rect = scope.rect = ele[0].getBoundingClientRect();
              setImageDimension(rect);
              scope.imageReady = true;
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
})();
