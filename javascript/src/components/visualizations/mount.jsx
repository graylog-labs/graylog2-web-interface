'use strict';

var React = require('react/addons');
var MapVisualization = require('./MapVisualization');

var $ = require('jquery');
var mapContainer = $('#map-container');

if (mapContainer.length !== 0) {
    React.render(<MapVisualization/>, mapContainer[0]);
}
