'use strict';

var React = require('react');

var Tag = require('../tags/Tag');

var StreamTags = React.createClass({
    render() {
        var formattedTags = this.props.tags.map((tag) => {
            return <li key={"li-" + tag}><Tag name={tag}/></li>
        });
        return (
            <ul className="tag-list" style={{fontSize: 16, lineHeight: '23px'}}>
                {formattedTags}
            </ul>
        );
    }
});

module.exports = StreamTags;