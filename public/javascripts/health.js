$(document).ready(function() {

  var $throughput = $(".health-throughput-current"),
      jsonCount,
      updateThroughput;

  updateThroughput = function() {
    $.post("/health/currentthroughput", function(json) {
      jsonCount = parseInt(json.count, 10);

      $throughput.html(jsonCount / 5); // /5, because this is the 5 second sum and we want only the 1 second average
      $throughput.fadeOut(200, function() {
        $throughput.fadeIn(200);
      });
    }, "json");
  };

  updateThroughput();

  setInterval(function(){
    // Update current throughput every 5 seconds
    updateThroughput();
  }, 5000);

});