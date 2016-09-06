define(['app', 'ultiflow'], function( app, ultiflow ) {
  $.widget( "ultiflow.uf_propbar", {
    options: {
      labels: {
        nothingSelected: 'Nothing is selected. Click an operator\'s title to select it.'
      }
    },
    
    els: {
      content: null,
      nothing: null
    },
    operatorId: null,
    linkId: null,
    paramKeyToModule: null,
    
    // the constructor
    _create: function() {
      var self = this;
      this.els.content = $('<div class="uf-propbar-content"></div>');
      this.els.content.appendTo(this.element);
      
      this.els.nothing = $('<div class="nothing_selected"><span>'+this.options.labels.nothingSelected+'</span></div>');
      this.els.nothing.appendTo(this.element);
      
      app.onEvent('ultiflow::operator_select', function(e, operatorId) {
        self.displayOperatorParameters(operatorId);
      });
      
      app.onEvent('ultiflow::operator_unselect', function(e) {
        if (self.operatorId != null) {
          self.regenerateParameters();
          self.els.content.empty();
          self.els.nothing.show();
          self.operatorId = null;
        }
      });
      
      app.onEvent('ultiflow::link_select', function(e, linkId) {
        self.displayLinkParameters(linkId);
      });
      
      app.onEvent('ultiflow::link_unselect', function(e) {
        if (self.linkId != null) {
          self.els.content.empty();
          self.els.nothing.show();
          self.linkId = null;
        }
      });
      
      if (typeof document.__ufPropertyNum == 'undefined') {
        document.__ufPropertyNum++;
      }
    },
    
    displayLinkParameters: function(linkId) {
      this.linkId = linkId;
      this.operatorId = null;
      this.els.nothing.hide();
      var processData = ultiflow.getOpenedProcessData();
      var linkData = processData.process.links[linkId];
      
      this.els.content.empty();
      var $parametersList = $('<div class="uf-parameters-list"></div>');
      var $mainPanel = helper.createPanel('Main parameters', $parametersList);
      $mainPanel.appendTo(this.els.content);
      
      var $colorInput = $('<input type="color" class="form-control"/>');
      $colorInput.val(ultiflow.ui.flowchart.flowchartMethod('getLinkMainColor', linkId));
      var $colorParameter = this.generateParameterField('Color:', $colorInput);
      $colorParameter.appendTo($parametersList);
      
      var $deleteButton = $('<button type="button" class="btn btn-danger">Delete link</button>');
      var $actionsParameter = this.generateParameterField('Actions:', $deleteButton);
      
      $actionsParameter.appendTo($parametersList);
      
      $deleteButton.click(function() {
        app.triggerEvent('ultiflow::delete_selected');
      });
      
      $colorInput.change(function() {
        ultiflow.ui.flowchart.els.flowchart.flowchart('setLinkMainColor', linkId, $colorInput.val());
      });
      
      
    },
    
    displayOperatorParameters: function(operatorId) {
      this.operatorId = operatorId;
      this.linkId = null;
      this.paramKeyToModule = {};
      this.els.nothing.hide();
      var processData = ultiflow.getOpenedProcessData();
      var operatorData = processData.process.operators[operatorId];
      var operatorType = operatorData.type;
      var operatorProperties = ultiflow.ui.flowchart.flowchartMethod('getOperatorFullProperties', operatorData);
      var operatorTypeData = ultiflow.getOperatorInfos(operatorType);
      
      this.els.content.empty();
      var $parametersList = $('<div class="uf-parameters-list"></div>');
      var $mainPanel = helper.createPanel('Main parameters', $parametersList);
      $mainPanel.appendTo(this.els.content);
      
      var $titleInput = $('<input type="text" class="form-control"/>');
      $titleInput.val(ultiflow.ui.flowchart.flowchartMethod('getOperatorTitle', operatorId));
      var $titleParameter = this.generateParameterField('Title:', $titleInput);
      $titleParameter.appendTo($parametersList);
      
      var $typeParameter = this.generateParameterField('Type:', operatorTypeData.title);
      $typeParameter.appendTo($parametersList);
      
      var $deleteButton = $('<button type="button" class="btn btn-danger">Delete operator</button>');
      var $actionsParameter = this.generateParameterField('Actions:', $deleteButton);
      
      $actionsParameter.appendTo($parametersList);
      
      $deleteButton.click(function() {
        app.triggerEvent('ultiflow::delete_selected');
      });
      
      $titleInput.keyup(function() {
        ultiflow.ui.flowchart.els.flowchart.flowchart('setOperatorTitle', operatorId, $titleInput.val());
      });
      
      if (typeof operatorTypeData.parameters != 'undefined') {
        var operatorTypeParameters = this.processParameters(operatorTypeData.parameters);
        for (var i = 0; i < operatorTypeParameters.length; i++) {
          var panelInfos = operatorTypeParameters[i];
          var $parametersList = $('<div class="uf-parameters-list"></div>');
          var $panel = helper.createPanel(panelInfos.title, $parametersList);
          
          for (var j = 0; j < panelInfos.fields.length; j++) {
            var propInfos = panelInfos.fields[j];
            var propKey = propInfos.id;
            
            var $divs = this.generateEmptyParameterField(propInfos.label);
            $parametersList.append($divs.parameter);
            this.fillPropertyContent(operatorId, propKey, propInfos, $divs);
          }
          
          $panel.appendTo(this.els.content);
        }
      }
      
      
    },
    
    fillPropertyContent: function(operatorId, propKey, propInfos, $divs) {
      var self = this;
      var processData = ultiflow.getOpenedProcessData().process;
      
      var config = {};
      if (typeof propInfos.config != 'undefined') {
        config = propInfos.config;
      }
      var value = null;
      if (typeof processData.parameters != 'undefined' &&
          typeof processData.parameters[operatorId] != 'undefined' &&
          typeof processData.parameters[operatorId][propKey] != 'undefined') {
        value = processData.parameters[operatorId][propKey];
      }
      
      ultiflow.loadFieldType(propInfos.type, function(module) {
        
        var cbReady = function(inst) {
          if (value === null) {
            if (typeof config.default != 'undefined') {
              value = config.default;
            }
          }

          inst.setValue(value);
        }
        
        var cbChange = function() {
          self.regenerateParameters();
        };
        
        self.paramKeyToModule[propKey] = new module(propKey, $divs, config, cbReady, cbChange, propInfos);
        
        
      });
      
      
    },
    
    regenerateParameters: function() {
      if (this.operatorId != null) {
        var processData = ultiflow.getOpenedProcessData().process;
        var parameters = {};
        for (var paramKey in this.paramKeyToModule) {
          parameters[paramKey] = this.paramKeyToModule[paramKey].getValue();
        }
        if (typeof processData.parameters == 'undefined') {
          processData.parameters = {};
        }
        
        processData.parameters[this.operatorId] = parameters;
        app.triggerEvent('ultiflow::process_change_detected');
      }
    },
    
    processParameters: function(parameters) {
      if (parameters.length > 0 && typeof parameters[0].fields == 'undefined') {
        return [{title: 'Parameters', fields: parameters}];
      }
      return parameters;
    },
    
    generateParameterField: function(label, content) {
      var $divs = this.generateEmptyParameterField(label);
      $divs.content.append(content);
      return $divs.parameter;
    },
    
    generateEmptyParameterField: function(label) {
      var $parameter = $('<div class="uf-parameter"></div>');
      var $label = $('<label></label>').text(label);
      var $content = $('<div class="uf-parameter-content"></div>');
      $label.appendTo($parameter);
      $content.appendTo($parameter);
      return {parameter: $parameter, label: $label, content: $content};
    }
  });
});