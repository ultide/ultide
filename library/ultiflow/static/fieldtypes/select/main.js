define([], function() {
  return function(paramKey, $divs, config, cbReady, cbChange) {
    var self = this;
    
    if (typeof config.attr == 'undefined') {
      config.attr = {};
    }

    if (typeof config.css == 'undefined') {
      config.css = {};
    }

    if (typeof config.options == 'undefined') {
      config.options = {};
    }
    
    var $select = $('<select class="form-control" />');
      
    for (var i in config.options) {
      var option = config.options[i];
      var $option = $('<option />');
      $option.attr('value', option.value);
      $option.text(option.label);
      $option.appendTo($select);
    }

    $select.data('default', config.selected);
    $select.attr(config.attr);
    $select.css(config.css);

    $select.on('change', function() {
      cbChange(self);
    });

    $divs.content.append($select);
    
    this.setValue = function(val) {
      $select.val(val);
    };
    
    this.getValue = function() {
      return $select.val();
    }

    cbReady(this);
  };
});