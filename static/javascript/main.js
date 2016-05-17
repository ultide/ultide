require([ 'jquery', 'app', 'main-nav-bar', 'main-view'], function($, app) {
  var $mainNavBar = $('.main-nav-bar');
  $mainNavBar.main_nav_bar();
  app.ui.mainNavBar = $mainNavBar;
  
  var $mainView = $('.main-view');
  $mainView.main_view();
  app.ui.mainView = $mainView;
  
  $mainView.main_view('createView', 'welcome', $('<div>Welcome</div>'));
  $mainView.main_view('showView', 'welcome');
  
  $mainNavBar.main_nav_bar('addButton', 'welcome', 'Welcome', '', function() {
    $mainView.main_view('showView', 'welcome');
    $mainNavBar.main_nav_bar('activateButton', 'welcome');
  });
  $mainNavBar.main_nav_bar('activateButton', 'welcome');
  
  
  app.start(function() {    
    app.sendRequest(
      'get_js',
      {},
      function(data) {
        require.config({
          'paths': data.require_paths
        });
        
        require(data.main_js);
      }
    );
  });
});
