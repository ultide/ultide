define([
  'app',
], function( app ) {
  var $mainView = app.ui.mainView;
  var $mainNavBar = app.ui.mainNavBar;
  
  $customView = $('<div style="text-align: center;"><h1>This is a custom view.</h1>You can customize it. See <code>library/demo/static/javascript/main.js</code>.</div>')
  $mainView.main_view('createView', 'custom_view', $customView);

  $mainNavBar.main_nav_bar('addButton', 'custom_view', 'Custom', '', 1000, function() {
    $mainView.main_view('showView', 'custom_view');
    $mainNavBar.main_nav_bar('activateButton', 'custom_view');
  });
  
});
