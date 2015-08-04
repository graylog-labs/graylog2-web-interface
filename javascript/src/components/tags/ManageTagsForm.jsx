'use strict';

var React = require('react');
var Immutable = require('immutable');
var TagsInput = require('./TagsInput');
var BootstrapModal = require('../bootstrap/BootstrapModal');

var ManageTagsForm = React.createClass({
    getInitialState() {
        return {
            tags: Immutable.OrderedSet(this.props.tags)
        };
    },
    open() {
        this.refs.configModal.open();
    },
    hide() {
        this.refs.configModal.close();
    },
    _findTagByTitle(tagTitle) {
        return this.state.tags.find((tag) => tagTitle.localeCompare(tag.title) === 0)
    },
    _onTagAdd(newTagTitle) {
        if (!this._findTagByTitle(newTagTitle)) {
            this.setState({tags: this.state.tags.add({title: newTagTitle, style: ''})});
        }
    },
    _onTagRemove(removedTagTitle) {
        var removedTag = this._findTagByTitle(removedTagTitle);
        if (removedTag) {
            this.setState({tags: this.state.tags.delete(removedTag)});
        }
    },
    _onTagUpdate(tagTitle, tagColour) {
        var updatedTag = this._findTagByTitle(tagTitle);
        if (updatedTag) {
            this.setState({tags: this.state.tags.delete(updatedTag).add({title: tagTitle, style: tagColour})});
        }
    },
    _saveTags() {
        this.props.onSaveTags(this.state.tags.toJS());
        this.hide();
    },
    render() {
        var configModalHeader = <h2 className="modal-title">Manage <em>{this.props.title}</em> tags</h2>;
        var configModalBody = (
            <div className="configuration">
                <p>Assign new or existing tags by typing in the text input.</p>
                <fieldset ref="inputFieldset">
                    <TagsInput value={this.state.tags}
                               tags={this.props.availableTags}
                               onTagAdd={this._onTagAdd}
                               onTagUpdate={this._onTagUpdate}
                               onTagRemove={this._onTagRemove}
                               entity={this.props.entity}/>
                </fieldset>
            </div>
        );

        return (
            <BootstrapModal ref="configModal"
                            onCancel={this.hide}
                            onConfirm={this._saveTags}
                            cancel="Cancel"
                            confirm="Save">
                {configModalHeader}
                {configModalBody}
            </BootstrapModal>
        );
    }
});

module.exports = ManageTagsForm;