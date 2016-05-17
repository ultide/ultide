define([ 'app' ], function( app ) {
  var $mainView = app.ui.mainView;
  var $mainNavBar = app.ui.mainNavBar;
  
  $mainView.main_view('createView', 'flowchart', $('<div>titi</div>'));

  $mainNavBar.main_nav_bar('addButton', 'flowchart', 'Flowchart', '', function() {
    $mainView.main_view('showView', 'flowchart');
    $mainNavBar.main_nav_bar('activateButton', 'flowchart');
  });
});