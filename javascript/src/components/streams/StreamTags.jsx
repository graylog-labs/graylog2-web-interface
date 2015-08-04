'use strict';

var React = require('react');

var Tag = require('../tags/Tag');

var StreamTags = React.createClass({
    render() {
        var formattedTags = this.props.tags.map((tag) => {
            return <li key={"li-" + tag.title}><Tag title={tag.title} style={tag.style}/></li>
        });

        if (this.props.tags === 0) {
            return <div className="stream-tags"></div>;
        } else {
            return (
                <ul className="stream-tags tag-list" style={{fontSize: 16}}>
                    {formattedTags}
                </ul>
            );
        }
    }
});

module.exports = StreamTags;