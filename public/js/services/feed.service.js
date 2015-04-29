(function() {
  angular
    .module('showfieApp')
    .factory('FeedService', [
      'BaseQuery',
      function(BaseQuery) {
        function create(data) {
          return BaseQuery.post('/feed/create', data);
        }

        function getFeeds(after) {
          return BaseQuery.get('/feed/getfeeds', {after: after});
        }

        function removeFile(file) {
          return BaseQuery.post('/feed/remove_file', {fileId: file.fileId, key: file.key});
        }

        function toggleLike(feed) {
          return BaseQuery.post('/feed/toggle_like', {feedId: feed._id});
        }

        function addComment(feedId, words) {
          return BaseQuery.post('/feed/add_comment', {feedId: feedId, content: words});
        }

        function getFeedDetail(id) {
          return BaseQuery.get('/feed/detail', {feedid: id});
        }

        function getFeedsByUser(userId) {
          return BaseQuery.get('/feed/user_feeds', {userId: userId});
        }

        function deleteFeed(feedId) {
          return BaseQuery.post('/feed/delete', {feedId: feedId});
        }

        function deleteComment(feedId, commentId) {
          return BaseQuery.post('/feed/delete_comment', {feedId: feedId, commentId: commentId});
        }

        function loadMoreComments(feedId, count) {
          return BaseQuery.get('/feed/more_comments', {feedId: feedId, skip: count});
        }
        return {
          create: create,
          getFeeds: getFeeds,
          removeFile: removeFile,
          toggleLike: toggleLike,
          addComment: addComment,
          getFeedDetail: getFeedDetail,
          getFeedsByUser: getFeedsByUser,
          deleteFeed: deleteFeed,
          deleteComment: deleteComment,
          loadMoreComments: loadMoreComments
        }
      }
    ])
})();
