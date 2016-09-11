define(['app'], function( app ) {
  $.widget( "ultiflow.uf_process_main_infos", {
    options: {
    },
    els: {
      title: null,
      path: null,
      state: null
    },
    timeoutId: null,
    
    // the constructor
    _create: function() {
      this.els.title = $('<span class="uf-process-title"></span>');
      this.els.title.appendTo(this.element);
      
      this.els.state = $('<span class="uf-process-state"><span class="uf-process-state-saving">Saving changes...</span><span class="uf-process-state-saved">Changes saved.</span><span class="uf-process-state-error">Error!</span></span>');
      this.els.state.appendTo(this.element);
      
      this.els.path = $('<span class="uf-process-path"></span>');
      this.els.path.appendTo(this.element);
      
      var self = this;
      app.onEvent('ultiflow::process_open', function(e, operatorData) {
        self.setProcess(operatorData);
      });
      
      app.onEvent('ultiflow::process_change_detected', function(e) {
        self.setState('saving');
      });
      
      app.onEvent('ultiflow::process_saved', function(e, success) {
        if (success) {
          self.setState('saved', 3000);
        } else {
          self.setState('error');
        }
      });
    },
    
    setProcess: function(process) {
      this.els.title.text(process.title);
      //this.els.path.text(process.path);
    },
    
    setState: function(state, timeout) {
      if (typeof timeout == 'undefined') {
        timeout = false;
      }
      clearTimeout(this.timeoutId);
      this.els.state.show();
      this.els.state.find('span').hide();
      if (state != false) {
        this.els.state.find('.uf-process-state-' + state).show();
        if (timeout != false) {
          var self = this;
          this.timeoutId = setTimeout(function() {
            self.setState(false);
          }, timeout);
        }
      }
    }
  });
});