define(['ultiflow'], function(ultiflow) {
  var data = {};
  return function(paramKey, $divs, config, cbReady, cbChange) {
    var self = this;
    if (typeof config.attr == 'undefined') {
      config.attr = {};
    }

    if (typeof config.css == 'undefined') {
      config.css = {};
    }

    if (typeof config.fieldType == 'undefined') {
      config.fieldType = 'Core::text';
    }

    if (typeof config.fieldTypeConfig == 'undefined') {
      config.fieldTypeConfig = {};
    }

    var $table = $('<table class="table table-striped small"></table>');
    $table.appendTo($divs.content);


    var subparamKey = '__sub_' + paramKey;

    var $subdivs = {};
    $subdivs.content = $('<div />');

    $divs.content.append($subdivs.content);

    var subconfig = config.fieldTypeConfig;
    var submodule = null;

    function setSubmoduleDefaultValue() {
      var value = null;
      if (typeof subconfig.default != 'undefined') {
        value = subconfig.default;
      }

      submodule.setValue(value);
    }
    
    var allValues = {};

    ultiflow.loadFieldType(config.fieldType, function(moduleType) {
      var subCbReady = function(inst) {
        submodule = inst;
        setSubmoduleDefaultValue();

        cbReady(self);
      };

      submodule = new moduleType(subparamKey, $subdivs, subconfig, subCbReady, function() {}, {});


    });



    var $createArea = $('<div class="list-create-area"></div>');
    var $addButton = $('<button class="btn btn-primary">Add to list</button>');
    $addButton.css('margin-top', 5);
    $addButton.appendTo($createArea);

    $divs.content.append($createArea);

    var $editArea = $('<div class="list-edit-area"></div>');
    var $saveButton = $('<button class="btn btn-primary">Save change</button>');
    var $cancelButton = $('<button class="btn btn-default">Cancel</button>');
    $saveButton.css('margin-top', 5);
    $cancelButton.css('margin-top', 5);


    $saveButton.appendTo($editArea);
    $cancelButton.appendTo($editArea);
    $divs.content.append($editArea);

    function setEditMode(isEditMode) {
      $table.find('tr').removeClass('info');
      $createArea.css('display', isEditMode ? 'none' : 'block');
      $editArea.css('display', isEditMode ? 'block' : 'none');
      editingI = -1;
    }

    setEditMode(false);

    var editingI = -1;
    $saveButton.click(function() {
      var newValue = submodule.getValue();
      allValues[editingI] = newValue;
      setEditMode(false);
      refreshTable();
      setSubmoduleDefaultValue();
      cbChange(self);
    });

    $cancelButton.click(function() {
      setEditMode(false);
      setSubmoduleDefaultValue();
    });
    
    
    
    function refreshTable() {
      var fixHelperModified = function(e, tr) {
          var $originals = tr.children();
          var $helper = tr.clone();
          $helper.children().each(function(index) {
              $(this).width($originals.eq(index).width())
          });
          return $helper;
      };
      
      var dragged = function(e, tr) {
        var newValue = [];
        $table.find('tr').each(function () {
          var fromI = $(this).data('i');
          newValue.push(allValues[fromI]);
        });
        allValues = newValue;
        refreshTable();
        cbChange(self);
      };
      
      
      
      var val = [];
      if (typeof allValues != 'undefined') {
        val = allValues;
      }
      
      $table.empty();
      for (var i = 0; i < val.length; i++) {
        var valueStr = val[i];
        if (typeof submodule.getStringFromValue != 'undefined') {
          valueStr = submodule.getStringFromValue(valueStr);
        }
        var $line = $('<tr></tr>');
        $line.data('i', i);
        var $dragAndDropCell = $('<td class="list-handle" style="width: 16px;"><span class="glyphicon glyphicon-resize-vertical"></span>&nbsp;</td>');
        $dragAndDropCell.css('cursor', 'grab');
        $dragAndDropCell.appendTo($line);
        var $valueCell = $('<td></td>').text(valueStr);
        $valueCell.appendTo($line);
        var $actionsCell = $('<td style="width: 32px;"></td>');
        $actionsCell.appendTo($line);
        
        var $editAction = $('<span class="glyphicon glyphicon-pencil list-edit-item"></span>');
        $editAction.css('cursor', 'pointer');
        $editAction.appendTo($actionsCell);
        
        $actionsCell.append('&nbsp;');
        
        var $deleteAction = $('<span class="glyphicon glyphicon-remove list-remove-item"></span>');
        $deleteAction.css('cursor', 'pointer');
        $deleteAction.appendTo($actionsCell);
        
        $line.appendTo($table);
      }
      
      if (val.length == 0) {
        var $line = $('<tr><td class="warning" style="text-align: center;">The list is empty!</td></tr>');
        $line.appendTo($table);
      }
      
      $table.find('tbody').sortable({
        helper: fixHelperModified,
        stop: dragged,
        handle: '.list-handle',
        cursor: 'grabbing'
      }).disableSelection();
    };
    
    


    $addButton.click(function() {
      var newValue = submodule.getValue();
      allValues.push(newValue);
      refreshTable();
      setSubmoduleDefaultValue();
      cbChange(self);
    });

    $table.on('click', '.list-remove-item', function() {
      setEditMode(false);
      if (confirm('Are you sure you want to delete this item?')) {
        var i = $(this).closest('tr').data('i');
        allValues.splice(i, 1);
        refreshTable();
        cbChange();
      }
    });

    $table.on('click', '.list-edit-item', function() {
      setEditMode(true);
      var $tr = $(this).closest('tr');
      var i = $tr.data('i');
      submodule.setValue(allValues[i]);
      $tr.addClass('info');
      editingI = i;
    });


    
    
    
    this.setValue = function(val) {
      if (!$.isArray(val)) {
        val = [];
      }
      
      allValues = val;
      refreshTable();
    };
    this.getValue = function() {
      return allValues;
    };
    

  };
});