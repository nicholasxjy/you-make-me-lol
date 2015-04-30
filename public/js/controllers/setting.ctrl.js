(function() {
  'use strict';
  angular
    .module('showfieApp')
    .controller('SettingCtrl', [
      'UserService',
      'ngCoolNoti',
      'Upload',
      function(UserService, ngCoolNoti, Upload) {
        var self = this;
        self.user = {};
        UserService.getUserInfo()
          .then(function(data) {
            self.current_user = data.user;
            angular.copy(self.current_user, self.user);
            self.isAuthticated = true;
          })
        
        self.submitSetting = function(user) {
          UserService.updateInfo(user)
            .then(function(data) {
              if (data.status === 'fail') {
                ngCoolNoti.create({
                  message: data.msg,
                  type: 'warning',
                  position: 'top-right',
                  timeout: 3000
                })
              } else {
                ngCoolNoti.create({
                  message: data.msg,
                  type: 'success',
                  timeout: 3000
                });
                self.current_user = self.user;
              }
            }, function(err) {
              console.log(err);
            })
        };


        self.uploadAvatarDone = true;
        self.uploadBgDone = true;

        self.uploadAvatar = function(files) {
          if (files && files.length > 0) {
            self.uploadImage(files[0], 'user-avatar');
          }
        }

        self.uploadPageBg = function(files) {
          if (files && files.length > 0) {
            self.uploadImage(files[0], 'user-bg');
          }
        }

        self.uploadImage = function(file, type) {
          if (type === 'user-avatar') {
            self.uploadAvatarDone = false;
            self.avatarUploading = true;
          } else {
            self.uploadBgDone = false;
            self.bgUploading = true;
          }
          Upload.upload({
            url: '/user/upload_image',
            file: file,
            fields: {
              type: type
            }
          }).success(function(data, status, headers, config) {
            if (type === 'user-avatar') {
              self.uploadAvatarDone = true;
              self.avatarUploading = false;
              self.current_user.avatar = self.user.avatar = data.url;
            } else {
              self.uploadBgDone = true;
              self.bgUploading = false;
              self.current_user.bg_image = self.user.bg_image = data.url;
              self.current_user.bg_blur_image = self.user.bg_blur_image = data.blur_url;
            }
          })
        }
      }
    ])
})();
