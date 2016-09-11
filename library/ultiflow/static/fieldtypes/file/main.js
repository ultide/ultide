define(['helper'], function(helper) {
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
    
    var $inputGroup = $('<div class="input-group"></div>');
    var $inputGroupBtn = $('<span class="input-group-btn"></span>');
    
    
    var $input = $('<input type="text" class="form-control" />');
    $input.data('default', config.default);
    $input.attr(config.attr);
    $input.css(config.css);
    
    $input.appendTo($inputGroup);
    
    
    $inputGroupBtn.appendTo($inputGroup);

    var $browseButton = $('<button class="btn btn-default">Browse</button>');
    $browseButton.appendTo($inputGroupBtn);
    
    $browseButton.click(function() {
      var fileChooserConfig = config.fileChooser;
      var filePath = self.getValue();
      if (filePath != null && filePath != '') {
        fileChooserConfig.path = filePath;
      }
      fileChooserConfig.onSelected = function(path) {
        if (path != null) {
          self.setValue(path);
          cbChange(self);
        }
      };
      helper.fileChooser(fileChooserConfig);
    });
    
    
    $input.on('change', function() {
      cbChange(self);
    });

    $divs.content.append($inputGroup);
    
    this.setValue = function(val) {
      $input.val(val);
    };
    
    this.getValue = function() {
      return $input.val();
    }
    
    cbReady(this);
  };
});