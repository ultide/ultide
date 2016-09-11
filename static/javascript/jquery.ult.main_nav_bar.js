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
        orders: [],
        buttons: [],
        buttonsCbs: [],

        // the constructor
        _create: function() {
            this.els.topNavBar = $('<ul class="nav navbar-nav navbar-top"></ul>');
            this.els.topNavBar.appendTo(this.element);
        },

        addButton: function(key, text, icon, order, cbClicked) {
            var $li = $('<li></li>');
            //$li.appendTo(this.els.topNavBar);
            var $a = $('<a href="#"></a>');
            $a.appendTo($li);
            $a.text(text);
            var self = this;
            this.els.buttons[key] = $li;
            
            
            var position = this.orders.length;
            for (var i = 0; i < this.orders.length; i++) {
                if (this.orders[i] > order) {
                    position = i;
                    break;
                }
            }
            this.orders.splice(position, 0, order);
            this.buttons.splice(position, 0, $li);
            this.buttonsCbs.splice(position, 0, cbClicked);
            this.refreshButtons();
        },
        
        refreshButtons: function() {
            var self = this;
            this.els.topNavBar.empty();
            for (var i = 0; i < this.buttons.length; i++) {
                var $button = this.buttons[i];
                $button.data('index', i);
                this.els.topNavBar.append($button);
                $button.click(function(e) {
                    var $this = $(this);
                    e.preventDefault();
                    self.buttonsCbs[$this.data('index')]();
                });
            }
        },

        activateButton: function(key) {
            this.els.topNavBar.find('li').removeClass('active');
            this.els.buttons[key].addClass('active');
        }
    });
});