define([
    'jquery',
    'jquery-ui'
],function($) {
  $.widget( "ultide.main_nav_bar", {
    options: {
    },
    els: {
      topNavBar: null,
      buttons: {}
    },
    
    // the constructor
    _create: function() {
      this.els.topNavBar = $('<ul class="nav navbar-nav navbar-top"></ul>');
      this.els.topNavBar.appendTo(this.element);
    },
    
    addButton: function(key, text, icon, cbClicked) {
      var $li = $('<li></li>');
      $li.appendTo(this.els.topNavBar);
      var $a = $('<a href="#"></a>');
      $a.appendTo($li);
      $a.text(text);
      var self = this;
      $a.click(function(e) {
        e.preventDefault();
        cbClicked();
      });
      this.els.buttons[key] = $li;
    },
    
    activateButton: function(key) {
      this.els.topNavBar.find('li').removeClass('active');
      this.els.buttons[key].addClass('active');
    }
  });
});