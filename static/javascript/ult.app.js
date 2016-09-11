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
            if (window.console)
                console.log('received', response);
            if (typeof app.requestCallbacks[response.request_id] != 'undefined') {
                app.requestCallbacks[response.request_id](response.data);
                delete app.requestCallbacks[response.request_id];
            }
        });
    };

    app.sendRequest = function(request, data, cb) {
        var reqId = app.request_id;
        app.request_id++;
        if (window.console)
            console.log('send', request, data);
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
    

    return app;
});
