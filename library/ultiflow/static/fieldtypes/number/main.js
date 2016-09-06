define([], function() {
  return function(paramKey, $divs, config, cbReady, cbChange) {
    var self = this;
    
    if (typeof config.attr == 'undefined') {
      config.attr = {};
    }

    if (typeof config.css == 'undefined') {
      config.css = {};
    }
    
    var $input = $('<input type="number" class="form-control" />');
    $input.data('default', config.default);
    $input.attr(config.attr);
    $input.css(config.css);

    $input.on('change', function() {
      cbChange(self);
    });

    $divs.content.append($input);
    
    this.setValue = function(val) {
      $input.val(val);
    };
    this.getValue = function() {
      return $input.val();
    };

    cbReady(this);
  };
});