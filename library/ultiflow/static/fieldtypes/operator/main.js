define(['ultiflow'], function(ultiflow) {
  return function(paramKey, $divs, config, cbReady, cbChange) {
    var self = this;
    
    if (typeof config.attr == 'undefined') {
      config.attr = {};
    }

    if (typeof config.css == 'undefined') {
      config.css = {};
    }
    
    if (typeof config.fileChooser == 'undefined') {
      config.fileChooser = {};
    }
    
    var operatorId = null;
    
    var $input = $('<div style="text-align: center; margin-bottom: 5px;" />');
    $input.data('default', config.default);
    $input.attr(config.attr);
    $input.css(config.css);
    
    $input.appendTo($divs.content);

    var $browseButton = $('<button class="btn btn-primary">Choose operator</button>');
    $browseButton.appendTo($divs.content);
    
    $browseButton.click(function() {
      var operatorChooserConfig = {};
      operatorChooserConfig.operatorId = self.getValue();
      operatorChooserConfig.onSelected = function(selectedOperator) {
        if (selectedOperator != null) {
          self.setValue(selectedOperator);
          cbChange(self);
        }
      };
      ultiflow.operatorChooser(operatorChooserConfig);
    });
    
    this.setValue = function(val) {
      operatorId = val;
      if (operatorId == null) {
        $input.text('[No operator]');
        $input.css('font-style', 'italic');
      } else {
        $input.text(operatorId);
        $input.css('font-style', 'normal');
      }
    };
    
    this.getValue = function() {
      return operatorId;
    }
    
    cbReady(this);
  };
});