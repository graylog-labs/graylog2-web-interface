'use strict';

var React = require('react');

var Input = require('react-bootstrap').Input;

var DataFilter = React.createClass({
    getInitialState() {
        return {
            data: this.props.data,
            filterKeys: this.props.filterKeys,
            filter: ""
        };
    },
    componentWillReceiveProps(newProps) {
        if (this.state.data === newProps.data) {
            return;
        }

        this.setState({
            data: newProps.data,
            filterKeys: newProps.filterKeys
        }, this.filterData);
    },
    onFilterUpdate(event) {
        this.setState({filter: event.target.value}, this.filterData);
    },
    filterData() {
        var filteredData = this.state.data.filter((datum) => {
            return this.state.filterKeys.some((filterKey) => {
                var key = datum[filterKey];
                var value = this.state.filter.toLocaleLowerCase();

                var containsFilter = function (entry, value) {
                    if (typeof entry === 'undefined') {
                        return false;
                    }
                    return entry.toLocaleLowerCase().indexOf(value) !== -1;
                };

                if (typeof key === 'object') {
                    return key.some((arrayEntry) => containsFilter(arrayEntry, value));
                } else {
                    return containsFilter(key, value);
                }
            });
        });

        this.props.onFilterUpdate(filteredData);
    },
    render() {
        return (
            <form className="form-inline" onSubmit={(e) => e.preventDefault()}>
                <Input type="text"
                       groupClassName="form-group-sm"
                       label={this.props.label}
                       name="filter"
                       value={this.state.filter}
                       onChange={this.onFilterUpdate}/>
            </form>
        );
    }
});

module.exports = DataFilter;