'use strict';

var React = require('react');
var crossfilter = require('crossfilter');
var d3 = require('d3');

var VisualizationsStore = require('../../stores/visualizations/VisualizationsStore');

var MapVisualization = React.createClass({
    ZOOM_IN_FACTOR: 0.5,
    ZOOM_OUT_FACTOR: -0.5,
    MAX_ZOOM: 100,
    getInitialState() {
        this.mapData = crossfilter();
        this.dimension = this.mapData.dimension((d) => d.country);
        this.group = this.dimension.group().reduceSum((d) => d.messages);

        return {};
    },
    componentDidMount() {
        var mapPromise = VisualizationsStore.loadWorldMap();
        mapPromise.done((d) => this.renderMap(d));
        var citiesPromise = VisualizationsStore.loadCities();
        citiesPromise.done((d) => this._setCities(d));
    },
    _setCities(cities) {
        this.cities = cities;
    },
    renderMap(countries) {
        this.countries = countries;
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
            .projection(this.projection)
            .pointRadius(2);

        this.group = this.map.append("g");
        this.countryNamesGroup = this.map.append("g");
        this.citiesGroup = this.map.append("g");
        this.dataGroup = this.map.append("g");

        this.group.selectAll("path").data(countries.features).enter().append("svg:path").attr("d", this.path);

        this.initialTranslation = this.projection.translate();
        this.scale = this.projection.scale();

        this.zoom = d3.behavior.zoom()
            .scaleExtent([1, this.MAX_ZOOM])
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

        this._updateCountryLabels(scale);
        this._updateCities(scale);

        this.group.selectAll("path").attr("d", this.path);
        this.dataGroup.selectAll("path").attr("d", this.path);
    },
    _zoom(zoomFactor) {
        var currentZoomScale = this.zoom.scale();
        var currentZoomTranslation = this.zoom.translate();
        var minScale = this.zoom.scaleExtent()[0];
        var maxScale = this.zoom.scaleExtent()[1];

        var newZoomScale = currentZoomScale * (1 + zoomFactor);

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
        this._zoom(this.ZOOM_IN_FACTOR);
    },
    zoomOut() {
        this._zoom(this.ZOOM_OUT_FACTOR);
    },
    _updateCountryLabels(scale) {
        var selection = this.countryNamesGroup.selectAll(".country-label")
            .data(this.countries.features.filter((f) => f.properties.labelrank < scale - 3));

        selection
            .enter().append("text")
            .attr("class", (d) => "country-label " + d.id)
            .attr("transform", (d) => this._getCountryLabelTranslation(d))
            .attr("dy", "-0.35em")
            .style("text-anchor", "middle")
            .text((d) => d.properties.name);

        selection
            .exit().remove();

        selection
            .text((d) => d.properties.name)
            .attr("transform", (d) => this._getCountryLabelTranslation(d));
    },
    _getCountryLabelTranslation(data) {
        var centroid = this.path.centroid(data);
        // We need to reposition France's label, as it's placed in Spain :/
        if (data.id === "FRA") {
            centroid[0] += 15 * this.zoom.scale();
            centroid[1] -= 10 * this.zoom.scale();
        }
        return "translate(" + centroid + ")";
    },
    _updateCities(scale) {
        var cityLocationSelection = this.citiesGroup.selectAll("path")
            .data(this.cities.features.filter((f) => f.properties.labelrank < scale - 3));

        cityLocationSelection
            .enter().append("svg:path")
            .attr("d", this.path)
            .attr("class", "city");

        cityLocationSelection
            .exit().remove();

        cityLocationSelection
            .attr("d", this.path);

        var cityLabelSelection = this.citiesGroup.selectAll(".city-label")
            .data(this.cities.features.filter((f) => f.properties.labelrank < scale - 3));

        cityLabelSelection
            .enter().append("text")
            .attr("class", "city-label")
            .attr("transform", (d) => "translate(" + this.projection(d.geometry.coordinates) + ")")
            .attr("dy", ".35em")
            .attr("x", (d) => d.geometry.coordinates[0] > -1 ? -6 : 6)
            .style("text-anchor", (d) => d.geometry.coordinates[0] > -1 ? "end" : "start")
            .text((d) => d.properties.name);

        cityLabelSelection
            .exit().remove();

        cityLabelSelection
            .text((d) => d.properties.name)
            .attr("transform", (d) => "translate(" + this.projection(d.geometry.coordinates) + ")");
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