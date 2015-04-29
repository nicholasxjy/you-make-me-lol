(function() {
  angular
    .module('showfieApp')
    .factory('FileService', [
      'BaseQuery',
      function(BaseQuery) {


        function removeFile(file) {
          return BaseQuery.post('/file/delete', {fileId: file.fileId, key: file.key});
        }

        return {
          removeFile: removeFile
        }
      }
    ])
})();
