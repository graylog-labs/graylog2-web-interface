'use strict';

var React = require('react');
var Immutable = require('immutable');
var DropdownButton = require('react-bootstrap').DropdownButton;
var MenuItem = require('react-bootstrap').MenuItem;
var Label = require('react-bootstrap').Label;

var TypeAheadInput = require('../common/TypeAheadInput');

var TagsInput = React.createClass({
    BOOTSTRAP_STYLES: ["default", "success", "info", "warning", "danger", "primary"],
    _onNewTagAdd(event, text) {
        this.props.onTagAdd(text);
    },
    _onTagAdd(event, suggestion) {
        this.props.onTagAdd(suggestion.value);
        this.refs.tagInput.clear();
    },
    _onTagRemove(eventKey, href, target) {
        this.props.onTagRemove(target);
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
    _changeColour(tagTitle, style) {
        return (event) => {
            event.preventDefault();
            this.props.onTagUpdate(tagTitle, style);
        }
    },
    _getColourList(tagTitle) {
        return this.BOOTSTRAP_STYLES.map((style) => {
            return (
                <li key={style}><a href="#" onClick={this._changeColour(tagTitle, style)}><Label bsStyle={style}>{tagTitle}</Label></a></li>
            )
        });
    },
    render() {
        var tags = Immutable.OrderedSet(this.props.value).sortBy((tag) => tag.title).map((tag) => {
            return (
                <li key={`li-${tag.title}`}>
                    <DropdownButton bsStyle={tag.style || 'default'} title={tag.title} style={{marginRight: 5}}>
                        <li className="dropdown-submenu">
                            <a href="#">Change tag colour</a>
                            <ul className="dropdown-menu">
                                {this._getColourList(tag.title)}
                            </ul>
                        </li>
                        <MenuItem divider/>
                        <MenuItem eventKey="2" target={tag.title} onSelect={this._onTagRemove}>Delete from {this.props.entity}</MenuItem>
                    </DropdownButton>
                </li>
            );
        });

        return (
            <div className="tags-input">
                <TypeAheadInput ref="tagInput"
                                onFieldChange={this._onNewTagAdd}
                                onSuggestionSelected={this._onTagAdd}
                                suggestionText=""
                                suggestions={this.props.tags.map((tag) => tag.title)}
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