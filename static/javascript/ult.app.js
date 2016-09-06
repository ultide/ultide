define([ 'socket-io' ], function( io ) {
    var app = {};

    app.config = {
        server: {
            'host': document.domain,
            'port': location.port
        },
        user: {
            'login': 'root',
            'password': 'root'
        }
    };

    app.socket = null;
    app.request_id = 0;
    app.requestCallbacks = {};
    app.data = {};
    app.ui = {};

    app.start = function(cb) {
        this.socket = io.connect('ws://' + this.config.server.host + ':' + this.config.server.port + '/uide');

        var self = this;
        this.socket.on('connect', function() {
            self.sendRequest('login', self.config.user, function(data) {
                if (data.connected) {
                    cb();
                } else {
                    alert('Error ! Did not succeed to connect!');
                }
            });
        });

        this.socket.on('msg', function (response) {
            if (typeof response.auth_error != 'undefined' && response.auth_error) {
                alert('Authentification error! Please try again!');
            }
            if (typeof app.requestCallbacks[response.request_id] != 'undefined') {
                app.requestCallbacks[response.request_id](response.data);
                delete app.requestCallbacks[response.request_id];
            }
        });
    };

    app.sendRequest = function(request, data, cb) {
        var reqId = app.request_id;
        app.request_id++;
        this.socket.emit('msg', {request_id: reqId, request: request, data: data});
        if (typeof cb != 'undefined') {
            this.requestCallbacks[reqId] = cb;
        }
    };

    app.onEvent = function(name, cb) {
        $(document).on('uf:' + name, cb);
    };

    app.triggerEvent = function(name, params) {
        $(document).trigger('uf:' + name, params);
    };

    app.getUserProperty = function(key, cb) {
        this.sendRequest('get_user_property', {key: key}, function(data) {
            cb(data.value);
        });
    };

    app.setUserProperty = function(key, value, cb) {
        this.sendRequest('set_user_property', {key: key, value: value}, function(data) {
            cb(data.success);
        });
    };
    
    
    app.fileChooser = function(customOptions) {
        var self = this;
        this.getModulesInfos(function(modulesInfos) {
            var DS = '/';

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

    return app;
});
