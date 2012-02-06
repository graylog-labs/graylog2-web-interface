$(document).ajaxSend(function(e, xhr, options) {
  var token = $("meta[name='csrf-token']").attr("content");
  xhr.setRequestHeader("X-CSRF-Token", token);
});

$(document).ready(function(){

  // FULL MESSAGE LOADING //
  $(".messages-table tbody tr").on("click", function () {
    modal_name = "full-message-modal-" + $(this).attr("data-message-id");
    loading = "Loading ...";
    
    $("#full-message-modals").append("<div id='" + modal_name + "' class='modal fade full-message-modal'>" + loading + "</div>")
    msg_div = $("#" + modal_name);

    $.post(relative_url_root + "/messages/" + $(this).attr("data-message-id") + "?partial=true", function(data) {
      msg_div.html(data);
    });

    msg_div.modal({"backdrop":true, "keyboard":true})
  });
  // // //

  // SPARKLINES //
  $(".el-e-sparkline").sparkline(
    "html",
    {
      type: "line",
      width: "70px",
      height: "23px",
      lineColor: "#fd0c99",
      fillColor: "#fdd",
      spotColor: false,
      minSpotColor: false,
      maxSpotColor: false
    }
  );
  // // //
    
});
