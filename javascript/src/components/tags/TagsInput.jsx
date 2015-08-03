'use strict';

var React = require('react');
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
    _changeColour(event) {
        event.preventDefault();
        console.log("New colour:", event.target.getAttribute('data-colour'));
    },
    _getColourList(tagName) {
        return this.BOOTSTRAP_STYLES.map((style) => {
            return (
                <li key={style}><a href="#" onClick={this._changeColour} data-colour={style}><Label bsStyle={style}>{tagName}</Label></a></li>
            )
        });
    },
    render() {
        var tags = this.props.value.map((tag) => {
            return (
                <li key={`li-${tag}`}>
                    <DropdownButton bsStyle="default" title={tag} style={{marginRight: 5}}>
                        <li className="dropdown-submenu">
                            <a href="#">Change tag colour</a>
                            <ul className="dropdown-menu">
                                {this._getColourList(tag)}
                            </ul>
                        </li>
                        <MenuItem divider/>
                        <MenuItem eventKey="2" target={tag} onSelect={this._onTagRemove}>Delete from {this.props.entity}</MenuItem>
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