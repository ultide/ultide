ufApp.fileChooser = function(customOptions) {
  var self = this;
  this.getModulesInfos(function(modulesInfos) {
    var DS = modulesInfos.ds;
    
    var originalOptions = {
      action: 'load',
      type: 'file',
      path: modulesInfos.workspace_path,
      onSelected: function(path) {}
    };

    var options = $.extend({}, originalOptions, customOptions);

    var defaultTexts = {
      load: {
        file: {
          title: 'Load file',
          primaryButton: 'Load'
        },
        folder: {
          title: 'Load folder',
          primaryButton: 'Load'
        }
      },
      save: {
        file: {
          title: 'Save file',
          primaryButton: 'Save'
        },
        folder: {
          title: 'Save folder',
          primaryButton: 'Save'
        }
      }
    };
    

    var texts = defaultTexts[options.action][options.type];


    var str = `
    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 class="modal-title" id="myModalLabel">Modal title</h4>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer">
            <div style="float: left;">
              <button type="button" class="btn btn-default btn-create-folder">Create folder</button>
            </div>
            <div style="float: right;">
              <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary disabled">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;

    var $modal = $(str);
    var $title = $modal.find('.modal-title');
    var $body = $modal.find('.modal-body');
    var $primaryButton = $modal.find('.btn-primary');
    var $createFolderButton = $modal.find('.btn-create-folder');

    $title.text(texts.title);
    $primaryButton.text(texts.primaryButton);
    $body.file_chooser({
      onlyFolders: options.type == 'folder',
      onFileFolderSelect: function(type, path) {
        if (type == options.type) {
          $primaryButton.removeClass('disabled');
        } else {
          $primaryButton.addClass('disabled');
        }
      }
    });
    
    var path = options.path;
    var filePath = null;
    var splittedPath = path.split(DS);
    var lastSplittedPath = splittedPath[splittedPath.length - 1];
    if (lastSplittedPath != '') {
      filePath = lastSplittedPath;
      splittedPath.pop();
      path = splittedPath.join(DS);
    }
    
    $body.file_chooser('loadFolder', path);
    
    var selectedPath = null;
    
    $primaryButton.click(function() {
      var $this = $(this);
      if (!$this.hasClass('disabled')) {
        selectedPath = $body.file_chooser('getPath');
        $modal.modal('hide');
      }
    });
    
    $createFolderButton.click(function() {
      var folderName = prompt('New folder\'s name:');
      if (folderName != null) {
        var currentFolder = $body.file_chooser('getCurrentFolder');
        self.sendRequest(
          'create_folder',
          {
            parentFolder: currentFolder,
            newFolder: folderName
          },
          function(data) {
            if (data.success) {
              $body.file_chooser('refresh');
            } else {
              alert('Folder could not be created!');
            }
          }
        );
      }
    });

    $modal.modal();
    $modal.on('hidden.bs.modal',function() {
      options.onSelected(selectedPath);
      $modal.remove();
    });
  });
}

ufApp.treeDataFromOperatorData = function(tree, operators, path) {
  var res = [];
  for (var key in tree) {
    if (tree[key] == true) {
      res.push({
        id: key,
        text: operators[key].title,
        type: operators[key].type
      });
    } else {
      var newPath = path + '/' + key;
      res.push({
        id: newPath,
        text: key,
        children: this.treeDataFromOperatorData(tree[key], operators, newPath)
      });
    }
  }
  return res;
}


ufApp.operatorChooser = function(customOptions) {
  var self = this;
  this.getOperators(function(data) {

    
    var keys = ['library', 'workspace'];
    var texts = ['Library', 'Workspace'];
    var treeData = [];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];

      var partTreeData = ufApp.treeDataFromOperatorData(data.tree[key], data.list, key);
      treeData.push({
        id: key,
        text: texts[i],
        children: partTreeData
      });
    }
    
    
    
    var originalOptions = {
      operatorId: null,
      onSelected: function(path) {}
    };

    var options = $.extend({}, originalOptions, customOptions);
    

    var str = `
    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 class="modal-title" id="myModalLabel">Choose operator</h4>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer">
            <div style="float: left; line-height: 31px;">
              <div class="operator-id"></div>
            </div>
            <div style="float: right;">
              <button type="button" class="btn btn-default btn-cancel" data-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary disabled">Choose</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;

    var $modal = $(str);
    var $title = $modal.find('.modal-title');
    var $body = $modal.find('.modal-body');
    var $primaryButton = $modal.find('.btn-primary');
    var $cancelButton = $modal.find('.btn-cancel');
    var $operatorId = $modal.find('.operator-id');

    
    var $tree = $('<div style="height: 200px; overflow-y: auto;"></div>');
    $tree.appendTo($body);
    
    $tree.uf_tree({core: {data: treeData}});
    
    var selectedOperatorId = null;
    $tree.on('select_node.jstree', function(e, data) {
      if (data.node.type != 'default') {
        $primaryButton.removeClass('disabled');
        selectedOperatorId = data.node.id;
        $operatorId.text(data.node.id);
      } else {
        $primaryButton.addClass('disabled');
        selectedOperatorId = null;
        $operatorId.text('');
      }
    });
    
    $tree.on('loaded.jstree', function(e, data) {
      if (options.operatorId != null) {
        $tree.jstree('select_node', options.operatorId);
      }
    });
    
    
    $cancelButton.click(function() {
      selectedOperatorId = null;
    });
    
    
    $primaryButton.click(function() {
      var $this = $(this);
      if (!$this.hasClass('disabled')) {
        //selectedPath = $body.file_chooser('getPath');
        $modal.modal('hide');
      }
    });
    

    $modal.modal();
    $modal.on('hidden.bs.modal',function() {
      options.onSelected(selectedOperatorId);
      $modal.remove();
    });
  });
}