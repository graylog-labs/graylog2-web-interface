'use strict';

var React = require('react');
var TypeAheadInput = require('../common/TypeAheadInput');

var TagsInput = React.createClass({
    _onNewTagAdd(event, text) {
        this.props.onTagAdd(text);
    },
    _onTagAdd(event, suggestion) {
        this.props.onTagAdd(suggestion.value);
    },
    _onTagRemove(event) {
        this.props.onTagRemove(event.target.getAttribute("data-target"));
    },
    // Avoid submitting the form when enter is pressed.
    // Instead we get the value of the input, as it is a new tag.
    _onKeyPress(event) {
        if (event.key !== 'Enter') {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        this.props.onTagAdd(this.refs.tagInput.getValue());
        this.refs.tagInput.clear();
    },
    render() {
        var tags = this.props.value.map((tag) => {
            return (
                <li key={`li-${tag}`}>
                    <span className="pill label label-default">
                        {tag}
                        <a className="tag-remove" data-target={tag} onClick={this._onTagRemove}/>
                    </span>
                </li>
            );
        });

        return (
            <div className="tags-input">
                <TypeAheadInput ref="tagInput"
                                onFieldChange={this._onNewTagAdd}
                                onSuggestionSelected={this._onTagAdd}
                                suggestionText=""
                                suggestions={this.props.tags}
                                displayKey="value"
                                onKeyPress={this._onKeyPress}/>
                <ul className="tag-list">
                    {tags}
                </ul>
            </div>
        );
    }
});

module.exports = TagsInput;