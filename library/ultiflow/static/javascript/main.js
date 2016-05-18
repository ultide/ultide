define([ 'app', 'ultiflow-design-view' ], function( app ) {
  var $mainView = app.ui.mainView;
  var $mainNavBar = app.ui.mainNavBar;
  
  $designView = $('<div class="uf_design_view"></div>')
  $mainView.main_view('createView', 'flowchart', $designView);

  $mainNavBar.main_nav_bar('addButton', 'flowchart', 'Flowchart', '', function() {
    $mainView.main_view('showView', 'flowchart');
    $mainNavBar.main_nav_bar('activateButton', 'flowchart');
  });
  
  $designView.uf_design_view();
  
});

var helper = {};
helper.createPanel = function(title, content) {
  var $panel = $('<div class="panel panel-default"></div>');

  var $heading = $('<div class="panel-heading"><div>');
  $heading.appendTo($panel);

  var $title = $('<h3 class="panel-title"></h3>');
  $title.text(title);
  $title.appendTo($heading);

  var $content = $('<div class="panel-content"></div>');
  $content.append(content);
  $content.appendTo($panel);

  return $panel;
};