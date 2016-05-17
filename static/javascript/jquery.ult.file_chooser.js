$(function() {
  $.widget( "ultiflow.file_chooser", {
    options: {
      onlyFolders: false,
      onFileFolderSelect: function(type, path) {}
    },
    els: {
      folderInput: null,
      fileList: null,
      fileInput: null
    },
    currentParentFolder: null,
    currentFolder: null,
    chosenFile: null,
    chosenFileName: null,
    DS: null,
    
    // the constructor
    _create: function() {
      var self = this;
      
      var $inputGroup = $('<div class="input-group"></div>');
      var $inputGroupBtn = $('<span class="input-group-btn"></span>');
      
      $inputGroup.appendTo(this.element);
      $inputGroupBtn.appendTo($inputGroup);
      
      this.els.folderUpButton = $('<button class="btn btn-default">&nbsp;<span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span>&nbsp;</button>');
      this.els.folderUpButton.appendTo($inputGroupBtn);
      
      this.els.folderInput = $('<input type="text" class="form-control">');
      this.els.folderInput.appendTo($inputGroup);
      
      this.els.fileList = $('<div class="uf-file-chooser-list noselect"></div>');
      this.els.fileList.appendTo(this.element);
      
      var $fileInputGroup = $('<div class="form-group"></div>');
      var $fileInputLabel = $('<label class="control-label">Filename</label>');
      
      $fileInputLabel.appendTo($fileInputGroup);
      
      this.els.fileInput = $('<input type="text" class="form-control">');
      this.els.fileInput.appendTo($fileInputGroup);
      
      $fileInputGroup.appendTo(this.element);
      
      this.els.folderInput.keyup(function(e) {
        var $this = $(this);
        if (e.which == 13) {
          var splitted = $this.val().split(self.DS);
          if (splitted != '') {
            splitted.pop();
          }
          var newPath = splitted.join(self.DS);
          self.loadFolder(newPath);
        }
      });
      
      this.els.fileInput.keyup(function(e) {
        var $this = $(this);
        
        self.chooseFile(self.currentFolder + $this.val(), $this.val());
      });
      
      this.els.fileList.on('click', '.uf-file-chooser-item', function() {
        var $this = $(this);
        if ($this.data('type') == 'folder') {
          self.loadFolder($this.data('path'));
        } else {
          self.chooseFile($this.data('path'), $this.text());
          $this.addClass('selected');
          $this.siblings('.uf-file-chooser-item').removeClass('selected');
        }
      });
      
      this.els.folderUpButton.on('click', function() {
        self.loadFolder(self.currentParentFolder);
      });
    },
    
    loadFolder: function(folderPath, cbFinished) {
      var self = this;
      
      var fileTypeToClass = {
        dirs: {
          icon: 'folder-close',
          type: 'folder'
        },
        files: {
          icon: 'file',
          type: 'file'
        }
      };
      
      if (this.options.onlyFolders) {
        delete fileTypeToClass.files;
      }
      
      ufApp.sendRequest(
        'list_files',
        {
          path: folderPath
        },
        function(data) {
          if (folderPath[folderPath.length - 1] != data.ds) {
            folderPath += data.ds;
          }
          self.DS = data.ds;
          self.els.folderInput.val(folderPath);
          self.chosenFile = null;
          self.els.fileInput.val('');
          self.currentFolder = folderPath;
          self.currentParentFolder = data.parent;
          
          self.els.fileList.empty();
          
          for (var key in fileTypeToClass) {
            for (var i = 0; i < data[key].length; i++) {
              var $item = $('<div class="uf-file-chooser-item"></div>');
              $item.data({
                path: folderPath + data[key][i],
                type: fileTypeToClass[key].type
              });
              var $itemIcon = $('<span class="glyphicon"></span>');
              $itemIcon.addClass('glyphicon-' + fileTypeToClass[key].icon);
              $itemIcon.appendTo($item);
              var $itemText = $('<span class="uf-file-chooser-item-label"></span>');
              $itemText.text(data[key][i]);
              $itemText.appendTo($item);
              $item.appendTo(self.els.fileList);
            }
          }
          
          self.els.fileList.scrollTop(0);
          
          self.options.onFileFolderSelect('folder', self.currentFolder);
          
          if (typeof cbFinished != 'undefined') {
            cbFinished();
          }
        }
      );
      
      
    },
    
    chooseFile: function(filePath, fileName) {
      this.els.fileInput.val(fileName);
      this.chosenFile = filePath;
      this.chosenFileName = fileName;
      
      this.options.onFileFolderSelect('file', this.chosenFile);
    },
    
    getPath: function() {
      if (this.chosenFile == null) {
        return this.currentFolder;
      } else {
        return this.chosenFile;
      }
    },
    
    getCurrentFolder: function() {
      return this.currentFolder;
    },
    
    refresh: function() {
      var self = this;
      var chosenFile = this.chosenFile;
      var chosenFileName = this.chosenFileName;
      this.loadFolder(this.currentFolder, function() {
        if (chosenFile != null) {
          self.chooseFile(chosenFile, chosenFileName);
        }
      });
      
    }
  });
});