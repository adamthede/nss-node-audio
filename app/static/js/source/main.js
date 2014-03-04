(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    $(document).foundation();
    $('#albumview').on('click', '.delete', deleteAlbumFromDb);
  }

  function deleteAlbumFromDb(){
    var albumId = $(this).attr('id');
    var url = '/albums/' + albumId;
    var type = 'DELETE';
    var success = reloadPage;

    $.ajax({url:url, type:type, success:success});
  }

  function reloadPage(data){
    if(data.count){
      location.reload();
    }
  }

})();

