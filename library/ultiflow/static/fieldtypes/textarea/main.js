define([], function() {
  return function(paramKey, $divs, config, cbReady, cbChange) {
    var self = this;
    
    if (typeof config.attr == 'undefined') {
      config.attr = {};
    }

    if (typeof config.css == 'undefined') {
      config.css = {};
    }
    
    var $input = $('<textarea class="form-control"></textarea>');
    $input.data('default', config.default);
    $input.attr(config.attr);
    $input.css(config.css);
    
    $input.on('change', function() {
      cbChange();
    });
    
    $divs.content.append($input);
    
    this.setValue = function(val) {
      $input.val(val);
    };
    
    this.getValue = function() {
      return $input.val();
    };
    
    cbReady(self);
  };
});