'use strict';

var React = require('react');
var Label = require('react-bootstrap').Label;

var Tag = React.createClass({
    render() {
        return <Label className="tag" bsStyle={this.props.style || 'default'} style={{fontSize: 12}}>{this.props.title}</Label>;
    }
});

module.exports = Tag;