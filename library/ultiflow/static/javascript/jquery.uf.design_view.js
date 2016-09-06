define([
  'app',
  'ultiflow-design-view',
  'ultiflow-process-main-infos',
  'ultiflow-propbar',
  'ultiflow-toolbar',
  'ultiflow-flowchart'], function( app ) {
  $(function() {
    $.widget( "ultiflow.uf_design_view", {
      options: {
      },
      els: {
        toolBar: null,
        flowchart: null,
        propBar: null,
        processMainInfos: null
      },
      state: null,

      // the constructor
      _create: function() {
        this.els.toolBar = $('<div class="uf-side-bar left uf-toolbar"></div>');
        this.els.toolBar.appendTo(this.element);
        this.els.toolBar.uf_toolbar();

        this.els.processMainInfos = $('<div class="uf-process-main-infos"></div>');
        this.els.processMainInfos.appendTo(this.element);
        this.els.processMainInfos.uf_process_main_infos();

        this.els.flowchart = $('<div class="uf-flowchart-container"></div>');
        this.els.flowchart.appendTo(this.element);
        this.els.flowchart.uf_flowchart();

        this.els.propBar = $('<div class="uf-side-bar right uf-propbar"></div>');
        this.els.propBar.appendTo(this.element);
        this.els.propBar.uf_propbar();

        this.els.flowchartNoFile = $('<div class="uf-flowchart-no-file"></div>');
        this.els.flowchartNoFile.append('<div class="inside"><span class="main_text">No process is loaded. Please open a process in your workspace.</span></div>');
        this.els.flowchartNoFile.appendTo(this.element);

        this.changeState('unopened');

        var self = this;
        app.onEvent('ultiflow::process_open', function(e, processData) {
          self.changeState('opened');
        });
      },

      changeState: function(newState) {
        this.element.removeClass(this.state).addClass(newState);
        this.state = newState;
      },
    });
  });
});