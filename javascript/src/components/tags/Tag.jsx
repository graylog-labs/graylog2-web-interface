'use strict';

var React = require('react');
var Label = require('react-bootstrap').Label;

var Tag = React.createClass({
    render() {
        return <Label className="tag" style={{fontSize: 12}}>{this.props.name}</Label>;
    }
});

module.exports = Tag;