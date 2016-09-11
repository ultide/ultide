define([
    'app',
], function( app ) {
    var $mainView = app.ui.mainView;
    var $mainNavBar = app.ui.mainNavBar;

    $customView = $('<div style="text-align: center;"><h1>This is a custom view.</h1>You can customize it. See <code>library/demo/static/javascript/main.js</code>.<br><br>Click <a href="#">here</a> to see an illustration of communication between this page and the server.</div>')
    $mainView.main_view('createView', 'custom_view', $customView);

    $mainNavBar.main_nav_bar('addButton', 'custom_view', 'Custom', '', 1000, function() {
        $mainView.main_view('showView', 'custom_view');
        $mainNavBar.main_nav_bar('activateButton', 'custom_view');
    });

    $customView.find('a').click(function(e) {
        e.preventDefault();
        var message = prompt('Your message:');
        app.sendRequest('demo_ping', {'message': message}, function(response) {
            alert(response['demo_response']);
        });
    });

});
