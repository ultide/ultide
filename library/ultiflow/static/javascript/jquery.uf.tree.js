$(function() {
  $.widget( "ultiflow.uf_tree", {
    options: {
    },
    
    // the constructor
    _create: function() {
      var defaultOptions = {
        'core' : {
          'animation': false,
        },
        'types': {
          'default': {
            'icon': 'images/folder.png'
          },
          'operator': {
            'icon': 'images/gear.png'
          },
          'process': {
            'icon': 'images/gear_combination.png'
          }
        },
        'plugins': ['types', 'dnd']
      };
      
      var options = $.extend(true, defaultOptions, this.options);
      
      this.element.jstree(options);
      
      // https://groups.google.com/forum/#!topic/jstree/BYppISuCFRE
      
      /*
      $('.drag')
      .on('mousedown', function (e) {
        console.log(e);
          return $.vakata.dnd.start(e, { 'jstree' : true, 'obj' : $(this), 'nodes' : [{ id : true, text: $(this).text() }] }, '<div id="jstree-dnd" class="jstree-default"><i class="jstree-icon jstree-er"></i>' + $(this).text() + ' (titi)</div>');
      });
      */
      var defaultHelper = null;
      var operatorHelper = null;
      
      if (typeof document.__uftreeInitialized == 'undefined') {
        document.__uftreeInitialized = true;
        $(document)
        .on('dnd_start.vakata', function (e, data) {
          var data = {type: data.data.nodes[0]};
          operatorHelper = ufApp.ui.flowchart.getOperatorElement(data);
          defaultHelper = null;
          /*
          console.log(data);
          var operatorId = data.data.nodes[0];
          console.log(operatorId, ufApp.isOperatorDefined(operatorId));
          if (ufApp.isOperatorDefined(operatorId)) {
            data.helper.text('toto');
          
          }
          */
        })
        .on('dnd_move.vakata', function (e, data) {
          if (defaultHelper == null) {
            defaultHelper = data.helper.html();
          }
          var t = $(data.event.target);
          if(!t.closest('.jstree').length) {
            if(t.closest('.uf-flowchart').length) {
              //data.helper.find('.jstree-icon').removeClass('jstree-er').addClass('jstree-ok');
              data.helper.html(operatorHelper);
            }
            else {
              data.helper.html(defaultHelper);
              //data.helper.find('.jstree-icon').removeClass('jstree-ok').addClass('jstree-er');
            }
          }
        })
        .on('dnd_stop.vakata', function (e, data) {
          var t = $(data.event.target);
          if(!t.closest('.jstree').length) {
            if(t.closest('.uf-flowchart').length) {
              var elOffset = data.helper.offset();
              
              var $flowchart = ufApp.ui.flowchart.els.flowchart;
              var flowchartOffset = $flowchart.offset();

              var relativeLeft = elOffset.left - flowchartOffset.left;
              var relativeTop = elOffset.top - flowchartOffset.top;

              var positionRatio = $flowchart.flowchart('getPositionRatio');
              relativeLeft /= positionRatio;
              relativeTop /= positionRatio;

              var data = {type: data.data.nodes[0]};
              data.left = relativeLeft;
              data.top = relativeTop;
              ufApp.ui.flowchart.addOperator(data);
            }
          }
        });
      }
      
      
      
      
      
    }
  });
});