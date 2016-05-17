define([
    'jquery',
    'jquery-ui'
],function($) {
  $.widget( "ultide.main_view", {
    options: {
    },
    els: {
      views: {}
    },
    currentView: null,
    
    // the constructor
    _create: function() {
      
    },
    
    createView: function(name, $content) {
      if (typeof this.els.views[name] != 'undefined') {
        this.els.views[name].remove();
      }
      $content.hide();
      this.els.views[name] = $content;
      this.els.views[name].appendTo(this.element);
    },
    
    showView: function(name) {
      if (this.currentView != null) {
        this.els.views[this.currentView].hide();
      }
      this.currentView = name;
      this.els.views[name].show();
    }
  });
});