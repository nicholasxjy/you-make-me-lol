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
          controller: ['$scope', '$element', function($scope, $element) {


            $scope.mediaUploading = false;
            $scope.mediaUploaded = false;

            $scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);

            $scope.$watch('images', function(images) {
              if (images && images.length > 5) {
                ngCoolNoti.create({
                  message: 'Your files length should not be more than 5',
                  position: 'top-right',
                  animation: 'jelly',
                  type: 'warning'
                });
                $scope.images = null;
                return;
              }
              if (images && images.length > 0 && images.length <= 5) {
                $scope.upload($scope.images, 'image');
              }
            });

            $scope.$watch('audio', function(audio) {
              if (audio && audio.length) {
                $scope.upload(audio, 'audio');
              }
            });
            $scope.$watch('video', function(video) {
              if (video && video.length) {
                $scope.upload(video, 'video');
              }
            });
            $scope.upload = function(files, type) {
              if (type === 'audio' || type === 'video') {
                $scope.mediaUploading = true;
              }
              angular.forEach(files, function(file) {
                if (file) {
                  $upload.upload({
                    url: '/feed/upload_file',
                    file: file,
                    fields: {category: type}
                  }).success(function(data, status, headers, config) {
                    console.log(data);
                    if (data.status === 'fail') {
                      ngCoolNoti.create({
                        message: data.msg,
                        position: 'top-right',
                        animation: 'jelly',
                        type: 'danger'
                      });
                    } else {
                      file.url = data.file_info.url;
                      file.fileId = data.file_info.fileId;
                      file.key = data.file_info.key;

                      if (type === 'audio' || type === 'video') {
                        $scope.mediaUploaded = true;
                        $scope.media = file;
                        if (type === 'audio') {
                          $scope.audio = file;
                        }
                        if (type === 'video') {
                          $scope.video = file;
                        }
                      }
                    }
                  })
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
                  if (media.type.indexOf('audio')>-1) {
                    $scope.audio = null;
                  }
                  if (media.type.indexOf('video')>-1) {
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
              console.log(scope.images);
              console.log(scope.audio);
              console.log(scope.video);
              var text = $inputEdit.html();
              text = text.trim();
              if (text !== '') {
                return true;
              }
              if (scope.images && scope.images.length >0) {
                scoep.images = scope.images.map(function(item) {
                  var image = {
                    fileId: item.fileId,
                    url: item.url,
                    caption: item.caption || '',
                  }
                  return image;
                });
                return true;
              }
              if (scope.audio && scope.audio.length >0) {
                scope.audio = scope.audio.map(function(item) {
                  var audio = {
                    fileId: item.fileId,
                    url: item.url
                  }
                });
                return true;
              }
              if (scope.video && scope.video.length >0) {
                scope.video = scope.video.map(function(item) {
                  var video = {
                    fileId: item.fileId,
                    url: item.url
                  }
                });
                return true;
              }
              return false;
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
                  images: scope.images,
                  audio: scope.audio,
                  video: scope.video,
                  tags: scope.tags
                };
                FeedService.create(feed)
                  .then(function(data) {
                    scope.cancel();
                  }, function(err) {
                    console.log(err);
                  })
              }
            };

            scope.cancel = function() {
              scope.spinnerShow = false;
              scope.mediaReady = false;
              scope.images = null;
              scope.audio = null;
              scope.video = null;
              $(ele).find('.sf-create-wrap').addClass('zoomOut');
              $timeout(function() {
                ele.remove();
              }, 750);
            }
          }
        }
      }
    ])
    .directive('photoDisplay', function() {
      return {
        restrict: 'A',
        link: function(scope, ele, attrs) {
          var fullWidth = $(ele).width();
          var _perWidth = fullWidth / 3;
          $(ele).css('height', _perWidth+'px');
          $(ele).find('img')
          .css('width', _perWidth+'px')
          .css('height', _perWidth+'px');
        }
      }
    })
    .directive('sfPhotoUpload', [
      '$document',
      '$upload',
      '$http',
      '$q',
      '$compile',
      '$timeout',
      'FeedService',
      function($document, $upload, $http, $q, $compile, $timeout, FeedService) {
        return {
          restrict: 'A',
          link: function(scope, ele, attrs) {
            var body = $document.find('body');
            scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);
            var setStyle = function() {
              var fullWidth = $(document).width();
              var fullHeight = $(document).height();
              var windowHeight = $(window).height();
              var MARGIN = 40;
              var PREVIEW_OFFSET = 70;
              var _overlay = $('.upload-overlay');
              var _uploadwrap = $('.upload-wrap');
              var _uploadpreview = $('.upload-preview');
              _overlay.css('width', fullWidth+'px')
              .css('height', fullHeight+'px');

              _uploadwrap.css('width', (fullWidth-MARGIN*2) + 'px')
              .css('height', (windowHeight - MARGIN) + 'px')
              .css('top', 0).css('left', '40px');

              _uploadpreview.css('height',(windowHeight - MARGIN - 2*PREVIEW_OFFSET) + 'px')
              .css('width', '100%');
            };

            var calculateImageSize = function(size) {
              var finalSize = {};
              // the parent container 348 * 300
              // remove the padding, so left 308 * 280
              var imageWidth = size.width;
              var imageHeight = size.height;

              var ratioWidth = 308/imageWidth;
              var _tempHeight = imageHeight * ratioWidth;
              if (_tempHeight > 280) {
                //here should as height ratio
                var ratioHeight = 280/imageHeight;
                finalSize.width = imageWidth * ratioHeight;
                finalSize.height = 280;
              } else {
                finalSize.width = 308;
                finalSize.height = _tempHeight;
              }
              return finalSize;
            }

            var template = $http.get('template/partials/upload.html');

            scope.isDelete = false;

            scope.$watch('photos', function(files) {
              if (!scope.isDelete && files && files.length > 0) {
                scope.files = files;
                template.then(function(res) {
                  $compile(res.data)(scope, function(uploadHtml, scope) {
                    $timeout(function() {
                      body.append(uploadHtml);
                      setStyle();
                      //set style of the template

                      scope.upload(scope.files);
                    });
                  });
                });

              }
            });

            scope.upload = function(files) {
              angular.forEach(files, function(file) {
                // if (scope.fileReaderSupported && file.type.indexOf('image') > -1) {
                //   $timeout(function() {
                //     var fileReader = new FileReader();
                //     fileReader.readAsDataURL(file);
                //     var image = new Image();
                //     fileReader.onload = function(e) {
                //       $timeout(function() {
                //         image.src = e.target.result;
                //         image.onload = function() {
                //           console.log('width', this.width);
                //           console.log('height', this.height);

                //           var size = {
                //             width: this.width,
                //             height: this.height
                //           };

                //         }
                //       })
                //     }
                //   })
                // }


                file.spinnerShow = true;
                $upload.upload({
                  url: '/feed/upload_photo',
                  file: file
                }).success(function(data, status, headers, config) {
                  console.log(data);
                  if (data.status === 'fail') {
                    console.log(data.msg);
                  } else {
                    //get the file info, update ui
                    file.spinnerShow = false;
                    //calculate the image size for the best display
                    //fuck ya all!
                    $timeout(function() {
                      var size = {
                        width: data.file_info.image_info.width,
                        height: data.file_info.image_info.height
                      };
                      file.category = 'image';
                      file.url = data.file_info.url;
                      file.fileId = data.file_info.fileId;
                      file.key = data.file_info.key;
                      file.hash = data.file_info.hash;
                      var newSize = calculateImageSize(size);
                      file.width = newSize.width;
                      file.height = newSize.height;
                    });
                  }
                })
              })
            };

            scope.removeFile = function(file, index) {
              if (!file) {
                alert('No file!');
                return;
              }
              $http({
                method: 'POST',
                url: '/feed/remove_file',
                data: {
                  fileId: file.fileId,
                  key: file.key,
                  hash: file.hash
                }
              }).success(function(data, status, headers, config) {
                scope.isDelete = true;
                scope.files = scope.files.filter(function(file, i) {
                  return i !== index;
                });

                if (scope.files.length === 0) {
                  $('.sf-upload-wrap').remove();
                  scope.isDelete = false;
                }

              }).error(function(data, status, headers, config) {
                console.log('Something goes wrong.');
              })
            }
            scope.cancel = function() {
              if (scope.files && scope.files.length > 0) {
                var all = [];
                angular.forEach(scope.files, function(file) {
                  var filePromise = $http({
                    method: 'POST',
                    url: '/feed/remove_file',
                    data: {
                      fileId: file.fileId,
                      key: file.key,
                      hash: file.hash
                    }
                  });
                  all.push(filePromise);
                });
                $q.all(all)
                  .then(function(res) {
                    $('.sf-upload-wrap').remove();
                    scope.isDelete = false;
                  }, function(err) {
                    console.log('Something goes wrong!');
                  })
              }
            };

            scope.createFeed = function() {
              //here only upload images
              var data = {
                category: 'image',
                files: scope.files
              }
              FeedService.create(data)
                .then(function(data) {
                  $('.sf-upload-wrap').remove();
                  scope.isDelete = false;
                })
            }
          }
        }
      }
    ])
    .directive('sfVideoUpload', [
      '$document',
      '$upload',
      '$http',
      '$q',
      '$compile',
      '$timeout',
      'FeedService',
      '$sce',
      function($document, $upload, $http, $q, $compile, $timeout, FeedService, $sce) {
        return {
          restrict: 'A',
          link: function(scope, ele, attrs) {
            var body = $document.find('body');
            scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);
            var setStyle = function() {
              var fullWidth = $(document).width();
              var fullHeight = $(document).height();
              var windowHeight = $(window).height();
              var MARGIN = 40;
              var PREVIEW_OFFSET = 70;
              var _overlay = $('.upload-overlay');
              var _uploadwrap = $('.upload-wrap');
              var _uploadpreview = $('.upload-preview');
              _overlay.css('width', fullWidth+'px')
              .css('height', fullHeight+'px');

              _uploadwrap.css('width', (fullWidth-MARGIN*2) + 'px')
              .css('height', (windowHeight - MARGIN) + 'px')
              .css('top', 0).css('left', '40px');

              _uploadpreview.css('height',(windowHeight - MARGIN - 2*PREVIEW_OFFSET) + 'px')
              .css('width', '100%');
            };

            var template = $http.get('template/partials/upload_video.html');

            scope.isDelete = false;

            scope.$watch('videos', function(files) {
              if (!scope.isDelete && files && files.length > 0) {
                scope.file = files[0];
                template.then(function(res) {
                  $compile(res.data)(scope, function(uploadHtml, scope) {
                    $timeout(function() {
                      body.append(uploadHtml);
                      setStyle();
                      //set style of the template

                      scope.upload(scope.file);
                    });
                  });
                });

              }
            });

            scope.upload = function(file) {
              file.spinnerShow = true;
              $upload.upload({
                url: '/feed/upload_video',
                file: file
              }).success(function(data, status, headers, config) {
                console.log(data);
                if (data.status === 'fail') {
                  console.log(data.msg);
                } else {
                  //get the file info, update ui
                  file.spinnerShow = false;
                  //calculate the image size for the best display
                  //fuck ya all!
                  $timeout(function() {
                    file.fileId = data.file_info._id;
                    file.url = data.file_info.url;
                    file.key = data.file_info.key;
                    file.hash = data.file_info.hash;
                    file.width = '100%';
                    file.height = '100%';
                    file.category = 'video';
                    $timeout(function() {
                      var _uploadpreview = $('.upload-preview');
                      _uploadpreview.find('video').attr('src', file.url);
                    }, 500);
                  });
                }
              })
            };

            scope.cancel = function() {
              if (scope.file) {
                $http({
                  method: 'POST',
                  url: '/feed/remove_file',
                  data: {
                    fileId: scope.file.fileId,
                    key: scope.file.key,
                    hash: scope.file.hash
                  }
                }).success(function(data, status, headers, config) {
                  $('.sf-upload-wrap').remove();
                  scope.isDelete = false;
                }).error(function(data, status, headers, config) {
                  console.log('Something goes wrong!');
                });
              }
            };

            scope.createFeed = function() {
              //here only upload video
              scope.file.caption = 'Video Show';
              var files = [];
              files.push(scope.file);
              var data = {
                category: 'video',
                files: files
              }
              FeedService.create(data)
                .then(function(data) {
                  $('.sf-upload-wrap').remove();
                  scope.isDelete = false;
                })
            }
          }
        }
      }
    ])
})();
