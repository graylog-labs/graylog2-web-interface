'use strict';

var React = require('react');

var Tag = require('../common/Tag');

var StreamTags = React.createClass({
    render() {
        return (
            <ul className="tag-list" style={{fontSize: 16, lineHeight: '23px'}}>
                <li><Tag name="foo"/></li>
                <li><Tag name="bar"/></li>
                <li><Tag name="baz"/></li>
            </ul>
        );
    }
});

module.exports = StreamTags;