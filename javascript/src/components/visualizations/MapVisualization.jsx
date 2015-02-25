'use strict';

var React = require('react');
var crossfilter = require('crossfilter');
var d3 = require('d3');

var VisualizationsStore = require('../../stores/visualizations/VisualizationsStore');

var MapVisualization = React.createClass({
    getInitialState() {
        this.mapData = crossfilter();
        this.dimension = this.mapData.dimension((d) => d.country);
        this.group = this.dimension.group().reduceSum((d) => d.messages);

        return {};
    },
    componentDidMount() {
        var mapPromise = VisualizationsStore.loadWorldMap();
        mapPromise.done((d) => this.renderMap(d));
    },
    renderMap(countries) {
        var width = 1000;
        var height = 500;

        this.map = d3.select("div#map-visualization").append("svg")
            .attr("width", width)
            .attr("height", height);

        // Draw an overlay to capture mouse events
        this.map.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height);

        this.projection = d3.geo.equirectangular()
            .translate([width / 2, height / 2])
            .scale((width - 1) / 2 / Math.PI);

        this.path = d3.geo.path()
            .projection(this.projection);

        this.group = this.map.append("g");

        this.group.selectAll("path").data(countries.features).enter().append("svg:path").attr("d", this.path);

        this.initialTranslation = this.projection.translate();
        this.scale = this.projection.scale();

        this.zoom = d3.behavior.zoom()
            .scaleExtent([1, 10])
            .on("zoom", () => {
                this._updateProjection(d3.event.scale, d3.event.translate);
            });

        this.map.call(this.zoom)
            .call(this.zoom.event);
    },
    _updateProjection(scale, translation) {
        var tx = this.initialTranslation[0] * scale + translation[0];
        var ty = this.initialTranslation[1] * scale + translation[1];

        this.projection
            .translate([tx, ty])
            .scale(this.scale * scale);

        this.group.selectAll("path").attr("d", this.path);
    },
    _zoom(zoomDelta) {
        var currentZoomScale = this.zoom.scale();
        var currentZoomTranslation = this.zoom.translate();
        var minScale = this.zoom.scaleExtent()[0];
        var maxScale = this.zoom.scaleExtent()[1];

        var newZoomScale = currentZoomScale + zoomDelta;

        if (newZoomScale < minScale) {
            newZoomScale = minScale;
        }
        if (newZoomScale > maxScale) {
            newZoomScale = maxScale;
        }

        var tx;
        var ty;

        if (newZoomScale === this.zoom.scaleExtent()[0]) {
            // Center the map when we zoom out completely
            tx = this.initialTranslation[0] - (this.initialTranslation[0] * newZoomScale);
            ty = this.initialTranslation[1] - (this.initialTranslation[1] * newZoomScale);
        } else {
            // Use the current center of the map's visible area as translation
            tx = this.initialTranslation[0] + (currentZoomTranslation[0] - this.initialTranslation[0]) / currentZoomScale * newZoomScale;
            ty = this.initialTranslation[1] + (currentZoomTranslation[1] - this.initialTranslation[1]) / currentZoomScale * newZoomScale;
        }
        var newTranslation = [tx, ty];

        this.zoom
            .scale(newZoomScale)
            .translate(newTranslation);

        this._updateProjection(newZoomScale, newTranslation);
    },
    zoomIn() {
        this._zoom(0.5);
    },
    zoomOut() {
        this._zoom(-0.5);
    },
    drawData() {
    },
    render() {
        return (
            <div>
                <button className="btn btn-mini" onClick={this.zoomIn}>+</button>
                <button className="btn btn-mini" onClick={this.zoomOut}>-</button>
                <div id="map-visualization"/>
            </div>
        );
    }
});

module.exports = MapVisualization;