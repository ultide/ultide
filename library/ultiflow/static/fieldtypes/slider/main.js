define([], function() {
  var data = {};
  return function(paramKey, $divs, config, cbReady, cbChange) {
    var self = this;
      
    var $container = $('<div/>');
    var $slider = $('<div style="margin-left: 10px; margin-right: 10px;" />');
    var $value = $('<small style="display: block; text-align: center;">Val</small>');
    $slider.appendTo($container);
    $value.appendTo($container);
    
    $slider.data('default', config['default']);
    
    config.stop = function(event, ui) {
      cbChange(self);
      $value.text($slider.slider('value'));
    };
    
    config.slide = function(event, ui) {
      $value.text($slider.slider('value'));
    };
    
    $divs.content.append($container);
    
    $slider.slider(config);
    
    this.setValue = function(val) {
      $slider.slider('value', val);
      $value.text($slider.slider('value'));
    };
    
    this.getValue = function() {
      return $slider.slider('value');
    };
    
    cbReady(this);
  };
});