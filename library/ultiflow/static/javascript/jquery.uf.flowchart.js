define([
    'app',
    'ultiflow',
    'ultiflow-lib-mousewheel',
    'ultiflow-lib-panzoom',
    'ultiflow-lib-flowchart'], function( app, ultiflow ) {
    $.widget( "ultiflow.uf_flowchart", {
        options: {

        },
        els: {
            flowchart: null,
            flowchartMiniView: null,
            flowchartMiniViewFocus: null,
            flowchartMiniContent: null
        },
        cx: null,
        cy: null,
        timeoutChangeId: null,
        timeoutChangeLength: 500,
        isSettingData: false,
        possibleZooms: [0.5, 0.75, 1, 2, 3],
        currentZoom: 2,
        currentZoomRatio: 1,

        // the constructor
        _create: function() {
            var $flowchart = $('<div class="uf-flowchart"></div>');
            this.els.flowchart = $flowchart;
            this.element.append(this.els.flowchart);

            var $flowchartMiniView = $('<div class="uf-flowchart-mini-view"></div>');
            this.els.flowchartMiniView = $flowchartMiniView;
            this.element.append(this.els.flowchartMiniView);

            this.els.flowchartMiniViewContent = $('<svg class="uf-flowchart-mini-view-content"></svg>');
            this.els.flowchartMiniViewContent.appendTo(this.els.flowchartMiniView);

            var $flowchartMiniViewFocus = $('<div class="uf-flowchart-mini-view-focus"></div>');
            this.els.flowchartMiniViewFocus = $flowchartMiniViewFocus;
            this.els.flowchartMiniView.append(this.els.flowchartMiniViewFocus);

            var $container = this.element;
            var self = this;


            // Panzoom initialization...
            $flowchart.panzoom({
                onChange: function(e) {
                    self._refreshMiniViewPosition();
                }
            });

            // Centering panzoom
            this.centerView();
            
            // Panzoom zoom handling...
            $container.on('mousewheel.focal', function( e ) {
                e.preventDefault();
                var delta = (e.delta || e.originalEvent.wheelDelta) || e.originalEvent.detail;
                var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
                self.currentZoom = Math.max(0, Math.min(self.possibleZooms.length - 1, (self.currentZoom + (zoomOut * 2 - 1))));
                self.currentZoomRatio = self.possibleZooms[self.currentZoom];
                $flowchart.flowchart('setPositionRatio', self.currentZoomRatio);
                $flowchart.panzoom('zoom', self.currentZoomRatio, {
                    animate: false,
                    focal: e
                });
            });

            var data = {};

            var options = this.options;
            options.linkVerticalDecal = 1;
            options.data = data;
            options.onAfterChange = function() {
                self.changeDetected();
            };
            options.onOperatorSelect = function(operatorId) {
                app.triggerEvent('ultiflow::operator_select', operatorId);
                return true;
            }
            options.onOperatorUnselect = function() {
                app.triggerEvent('ultiflow::operator_unselect');
                return true;
            }
            options.onLinkSelect = function(linkId) {
                app.triggerEvent('ultiflow::link_select', linkId);
                return true;
            }
            options.onLinkUnselect = function() {
                app.triggerEvent('ultiflow::link_unselect');
                return true;
            }


            // Apply the plugin on a standard, empty div...
            $flowchart.flowchart(options);

            ultiflow.ui.flowchart = this;      

            $(document).keydown(function(e) {
                if (e.keyCode == 8 && $(':focus').length == 0) {
                    e.preventDefault();
                }
            });


            $(document).keyup(function(e) {
                if (e.keyCode == 8 && $(':focus').length == 0) {
                    self.els.flowchart.flowchart('deleteSelected');
                }
            });

            app.onEvent('ultiflow::process_open', function(e, processData) {
                self.setData(processData.process);
            });

            app.onEvent('ultiflow::delete_selected', function() {
                self.els.flowchart.flowchart('deleteSelected');
            });

        },
        
        centerView: function() {
            this.cx = this.els.flowchart.width() / 2;
            this.cy = this.els.flowchart.height() / 2;
            this.els.flowchart.panzoom('pan', -this.cx + this.element.width() / 2, -this.cy + this.element.height() / 2);
            this._refreshMiniViewPosition();
        },

        _refreshMiniViewPosition: function() {
            var elementOffset = this.element.offset();
            var flowchartOffset = this.els.flowchart.offset();
            var flowchartWidth = this.els.flowchart.width();
            var flowchartHeight = this.els.flowchart.height();
            var rTop = (elementOffset.top - flowchartOffset.top) / (flowchartHeight * this.currentZoomRatio);
            var rLeft = (elementOffset.left - flowchartOffset.left) / (flowchartWidth * this.currentZoomRatio);
            var rWidth = this.element.width() / (flowchartWidth * this.currentZoomRatio);
            var rHeight = this.element.height() / (flowchartHeight * this.currentZoomRatio);
            var miniViewWidth = this.els.flowchartMiniView.width();
            var miniViewHeight = this.els.flowchartMiniView.height();
            this.els.flowchartMiniViewFocus.css({
                left: rLeft * miniViewWidth,
                top: rTop * miniViewHeight,
                width: rWidth * miniViewWidth,
                height: rHeight * miniViewHeight
            });
        },

        _refreshMiniViewContent: function(data) {
            this.els.flowchartMiniViewContent.empty();

            var flowchartWidth = this.els.flowchart.width();
            var flowchartHeight = this.els.flowchart.height();

            var miniViewWidth = this.els.flowchartMiniView.width();
            var miniViewHeight = this.els.flowchartMiniView.height();

            var operatorsPositions = {};

            if (typeof data.operators != 'undefined') {
                for (var operatorId in data.operators) {
                    var operator = data.operators[operatorId];
                    var operatorElement = this.getOperatorElement(operator);
                    var rLeft = (operator.left + this.cx + operatorElement.width() / 2) / flowchartHeight;
                    var rTop = (operator.top + this.cy + operatorElement.height() / 2) / flowchartWidth;

                    operatorPosition = {left: rLeft * miniViewWidth, top: rTop * miniViewHeight};
                    operatorsPositions[operatorId] = operatorPosition;

                    var shape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    shape.setAttribute("stroke", "none");
                    shape.setAttribute("x", operatorPosition.left - 1);
                    shape.setAttribute("y", operatorPosition.top - 1);
                    shape.setAttribute("width", 3);
                    shape.setAttribute("height", 3);
                    this.els.flowchartMiniViewContent[0].appendChild(shape);
                }
            }

            if (typeof data.links != 'undefined') {
                for (var linkId in data.links) {
                    var link = data.links[linkId];

                    var fromPosition = operatorsPositions[link.fromOperator];
                    var toPosition = operatorsPositions[link.toOperator];

                    var shape = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    shape.setAttribute("x1", fromPosition.left);
                    shape.setAttribute("y1", fromPosition.top);
                    shape.setAttribute("x2", toPosition.left);
                    shape.setAttribute("y2", toPosition.top);
                    shape.setAttribute("stroke-width", "1");
                    shape.setAttribute("stroke", "black");
                    shape.setAttribute("fill", "none");
                    this.els.flowchartMiniViewContent[0].appendChild(shape);
                }
            }

        },

        setData: function(originalData) {
            data = $.extend(true, originalData);
            this.isSettingData = true;
            this._refreshMiniViewContent(data);
            var self = this;
            if (typeof data.operators != 'undefined') {
                for (var operatorId in data.operators) {
                    var operator = data.operators[operatorId];
                    operator.left += this.cx;
                    operator.top += this.cy;
                    //this.postProcessOperatorData(operator);
                }
            }
            ultiflow.getOperators(function(operators) {
                data.operatorTypes = operators.list;
                self.els.flowchart.flowchart('setData', data);
            });
            this.isSettingData = false;
            
            this.centerView();
        },

        getData: function() {
            var data = this.els.flowchart.flowchart('getData');
            delete data.operatorTypes;
            if (typeof data.operators != 'undefined') {
                for (var operatorId in data.operators) {
                    var operator = data.operators[operatorId];
                    operator.left -= this.cx;
                    operator.top -= this.cy;
                }
            }
            return data;
        },

        addOperator: function(operatorData) {
            //this.postProcessOperatorData(operatorData);
            // todo: check same ids ?
            this.els.flowchart.flowchart('addOperator', operatorData);
        },

        getOperatorElement: function(operatorData) {
            //this.postProcessOperatorData(operatorData);
            return this.els.flowchart.flowchart('getOperatorElement', operatorData);
        },

        changeDetected: function() {
            if (this.isSettingData) {
                return; 
            }
            var self = this;

            var currentProcessData = ultiflow.getOpenedProcessData();
            var flowchartData = this.getData();
            var flowchartProcess = $.extend(true, {}, flowchartData);

            currentProcessData.process.operators = flowchartData.operators;
            currentProcessData.process.links = flowchartData.links;
            
            var operatorsParameters = Object.keys(currentProcessData.process.parameters)
            for (var operatorId in operatorsParameters) {
                if (typeof currentProcessData.process.operators[operatorId] == 'undefined') {
                    delete currentProcessData.process.parameters[operatorId];
                }
            }

            console.log(currentProcessData.process.parameters);
            app.triggerEvent('ultiflow::process_change_detected');

            this._refreshMiniViewContent(flowchartData);
        },

        flowchartMethod: function(methodName, data) {
            return this.els.flowchart.flowchart(methodName, data);
        }
    });
});