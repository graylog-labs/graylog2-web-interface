/* global jsRoutes, substringMatcher */

'use strict';

var React = require('react');
var Immutable = require('immutable');
var Input = require('react-bootstrap').Input;
var $ = require('jquery');

var TypeAheadInput = React.createClass({

    componentDidMount() {
        var fieldInput = $(this.refs.fieldInput.getInputDOMNode());

        // this.props.suggestions:
        // [ { value: "some string"}, { value: "otherstring" } ]
        fieldInput.typeahead({
                hint: true,
                highlight: true,
                minLength: 1
            },
            {
                name: 'dataset-name',
                displayKey: this.props.displayKey,
                source: substringMatcher(this.props.suggestions, this.props.displayKey, 6),
                templates: {
                    suggestion: (value) => { return "<div>Select for filtering: " + value.value + "</div>"; }
                }
            });

        if (typeof this.props.onTypeaheadLoaded === 'function') {
            this.props.onTypeaheadLoaded();
            fieldInput.typeahead('close');
        }
        var fieldFormGroup = React.findDOMNode(this.refs.fieldInput);
        $(fieldFormGroup).on('typeahead:change typeahead:select typeahead:autocomplete', (event, suggestion) => {
            this.props.onSuggestionSelected(event, suggestion);
        });
    },
    componentWillUnmount() {
        var fieldInput = $(this.refs.fieldInput.getInputDOMNode());
        fieldInput.typeahead('destroy');
        var fieldFormGroup = React.findDOMNode(this.refs.fieldInput);
        $(fieldFormGroup).off('typeahead:change typeahead:select typeahead:autocomplete');
    },

    componentWillReceiveProps(newProps) {
        // TODO
    },

    render() {
        return <Input type="text" ref="fieldInput"
                      wrapperClassName="typeahead-wrapper"/>;
    }
});

module.exports = TypeAheadInput;
