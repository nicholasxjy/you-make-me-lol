(function() {
  'use strict';
  angular
    .module('showfieApp')
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
                url: '/feed/remove_photo',
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
                    url: '/feed/remove_photo',
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

            var template = $http.get('template/partials/upload.html');

            scope.isDelete = false;

            scope.$watch('videos', function(files) {
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

                    });
                  }
                })
              })
            };
          }
        }
      }
    ])
})();
