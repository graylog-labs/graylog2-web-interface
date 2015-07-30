'use strict';

var React = require('react');

var TagsInput = require('react-tagsinput');
var BootstrapModal = require('../bootstrap/BootstrapModal');

var ManageTagsForm = React.createClass({
    getInitialState() {
        return {
            tags: this.props.tags
        };
    },
    open() {
        this.refs.configModal.open();
    },
    hide() {
        this.refs.configModal.close();
    },
    _onTagAdd(newTag) {
        this.setState({tags: this.state.tags.add(newTag)});
    },
    _onTagRemove(removedTag) {
        this.setState({tags: this.state.tags.delete(removedTag)});
    },
    _saveTags() {
        this.props.onSaveTags(this.state.tags);
        this.hide();
    },
    render() {
        var tagInputStyle = {
            div: "form-group",
            input: "form-control",
            tag: "tag tag-standalone label label-default",
            invalid: "tag-input-error",
            remove: "tag-remove"
        };
        var configModalHeader = <h2 className="modal-title">Manage <em>{this.props.title}</em> tags</h2>;
        var configModalBody = (
            <div className="configuration">
                <p>Assign new or existing tags by typing in the text input.</p>
                <fieldset ref="inputFieldset">
                    <TagsInput value={this.state.tags}
                               classNames={tagInputStyle}
                               onTagAdd={this._onTagAdd}
                               onTagRemove={this._onTagRemove}/>
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