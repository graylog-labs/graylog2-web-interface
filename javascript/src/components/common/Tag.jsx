'use strict';

var React = require('react');

var Label = require('react-bootstrap').Label;

var Tag = React.createClass({
    render() {
        return <Label className="tag">{this.props.name}</Label>;
    }
});

module.exports = Tag;