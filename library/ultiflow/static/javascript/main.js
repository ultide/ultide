define([
  'app',
  'ultiflow-design-view',
  'css!static/modules/ultiflow/css/main',
  'css!static/modules/ultiflow/plugins/jstree/dist/themes/default/style.min',
  'css!static/modules/ultiflow/plugins/jquery.flowchart/jquery.flowchart.min.css'
], function( app ) {
  var $mainView = app.ui.mainView;
  var $mainNavBar = app.ui.mainNavBar;
  
  $designView = $('<div class="uf_design_view"></div>')
  $mainView.main_view('createView', 'flowchart', $designView);

  $mainNavBar.main_nav_bar('addButton', 'flowchart', 'Flowchart', '', 10, function() {
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

helper.treeDataFromOperatorData = function(tree, operators, path) {
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