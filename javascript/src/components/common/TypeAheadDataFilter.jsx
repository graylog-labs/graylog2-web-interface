'use strict';

var React = require('react');
var Immutable = require('immutable');
var TypeAheadInput = require('./TypeAheadInput');

var TypeAheadDataFilter = React.createClass({
    getInitialState() {
        return {
            searchText: '',
            filters: Immutable.OrderedSet()
        };
    },
    _onFieldChange(event, text) {
        this.setState({searchText: text});
    },
    _onSuggestionSelected(event, suggestion) {
        this.setState({filters: this.state.filters.add(suggestion[this.props.displayKey])});
        this.refs.typeAheadInput.clear();
    },
    _onFilterRemoved(event) {
        event.preventDefault();
        this.setState({filters: this.state.filters.delete(event.target.getAttribute("data-target"))});
    },
    render() {
        var filters = this.state.filters.map((filter) => {
            return (
                <li key={`li-${filter}`}>
                    <span className="pill label label-default">
                        tag: {filter}
                        <a className="tag-remove" data-target={filter} onClick={this._onFilterRemoved}></a>
                    </span>
                </li>
            );
        });

        return (
            <div className="filter">
                <TypeAheadInput ref="typeAheadInput"
                                onFieldChange={this._onFieldChange}
                                onSuggestionSelected={this._onSuggestionSelected}
                                suggestionText={`Filter by ${this.props.filterBy}: `} {...this.props}/>
                <ul className="pill-list">
                    {filters}
                </ul>
                <span>Searching for "{this.state.searchText}"</span>
            </div>
        );
    }
});

module.exports = TypeAheadDataFilter;