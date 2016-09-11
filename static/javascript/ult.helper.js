define([ 'file_chooser' ], function( file_chooser ) {
    var helper = {};

    helper.fileChooser = function(customOptions) {
        var self = this;
        var DS = '/'; // @todo: OS independent

        var originalOptions = {
            action: 'load',
            type: 'file',
            path: '/', // @todo: OS independent
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
    }

    return helper;
});