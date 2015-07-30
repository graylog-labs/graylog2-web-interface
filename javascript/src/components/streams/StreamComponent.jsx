'use strict';

var React = require('react');
var Immutable = require('immutable');

var StreamsStore = require('../../stores/streams/StreamsStore');
var StreamList = require('./StreamList');
var CreateStreamButton = require('./CreateStreamButton');
var SupportLink = require('../support/SupportLink');
var PermissionsMixin = require('../../util/PermissionsMixin');
var StreamRulesStore = require('../../stores/streams/StreamRulesStore');
var UsersStore = require('../../stores/users/UsersStore');
var Col = require('react-bootstrap').Col;
var UserNotification = require('../../util/UserNotification');
var Spinner = require('../common/Spinner');
var TypeAheadDataFilter = require('../common/TypeAheadDataFilter');

var DocsHelper = require('../../util/DocsHelper');
var DocumentationLink = require('../support/DocumentationLink');

var StreamComponent = React.createClass({
    mixins: [PermissionsMixin],
    getInitialState() {
        return {
            streamsLoaded: false,
            streamRuleTypesLoaded: false,
            tags: Immutable.OrderedSet(["foo", "bar", "baz", "one", "two", "three", "four"]),
            filteredStreams: []
        };
    },
    componentDidMount() {
        this.loadData();
        StreamRulesStore.types((types) => {
            this.setState({streamRuleTypes: types, streamRuleTypesLoaded: true});
        });
        UsersStore.load(this.props.username).done((user) => {
            this.setState({user: user});
        });
        StreamsStore.onChange(this.loadData);
        StreamRulesStore.onChange(this.loadData);
    },
    loadData() {
        StreamsStore.load((streams) => {
            streams = streams.map((stream) => {
                var endIndex = Math.floor(Math.random() * (this.state.tags.count() - 1)) + 1;
                stream.tags = this.state.tags.slice(0, endIndex).toJS();
                return stream
            });
            this.setState({streams: streams, filteredStreams: streams, streamsLoaded: true});
        });
    },
    _onSave(streamId, stream) {
        StreamsStore.save(stream, () => {
            UserNotification.success("Stream has been successfully created.", "Success");
        });
    },
    _filterStreams(filteredStreams) {
        this.setState({filteredStreams: filteredStreams});
    },
    render() {
        var createStreamButton = (this.isPermitted(this.props.permissions, ["streams:create"]) ?
            <CreateStreamButton ref='createStreamButton' bsSize="large" bsStyle="success" onSave={this._onSave} /> :
            "");
        var pageHeader = (
            <div className="row content content-head">
                <Col md={10}>
                    <h1>Streams</h1>

                    <p className="description">
                        You can route incoming messages into streams by applying rules against them. If a
                        message
                        matches all rules of a stream it is routed into it. A message can be routed into
                        multiple
                        streams. You can for example create a stream that contains all SSH logins and configure
                        to be alerted whenever there are more logins than usual.

                        Read more about streams in the <DocumentationLink page={DocsHelper.PAGES.STREAMS} text="documentation"/>.
                    </p>

                    <SupportLink>
                        Take a look at the
                        {' '}<DocumentationLink page={DocsHelper.PAGES.EXTERNAL_DASHBOARDS} text="Graylog stream dashboards"/>{' '}
                        for wall-mounted displays or other integrations.
                    </SupportLink>
                </Col>
                {this.state.streams && this.state.streamRuleTypes &&
                    <Col md={2} style={{textAlign: 'center', marginTop: '35px'}}>{createStreamButton}</Col>}
            </div>
        );

        if (this.state.streamsLoaded && this.state.streamRuleTypesLoaded) {
            var streamList;

            if (this.state.streams.length > 0 && this.state.filteredStreams.length === 0) {
                streamList = <div>No streams matched your filter criteria.</div>;
            } else {
                streamList = (
                    <StreamList streams={this.state.filteredStreams} streamRuleTypes={this.state.streamRuleTypes}
                                permissions={this.props.permissions} user={this.state.user}
                                onStreamCreated={this._onSave} />
                );
            }

            return (
                <div>
                    {pageHeader}

                    <div className="row content">
                        <Col md={12}>
                            <TypeAheadDataFilter id="stream-filter"
                                                 displayKey="value"
                                                 label="Filter streams"
                                                 filterBy="tag"
                                                 filterSuggestions={this.state.tags.toJS()}
                                                 data={this.state.streams}
                                                 searchInKeys={['name', 'description']}
                                                 onDataFiltered={this._filterStreams}/>
                        </Col>
                    </div>
                    <div className="row content">
                        <Col md={12}>
                            {streamList}
                        </Col>
                    </div>
                </div>
            );
        } else {
            return (
                <div>
                    {pageHeader}

                    <div className="row content"><div style={{marginLeft: 10}}><Spinner/></div></div>
                </div>
            );
        }
    }
});

module.exports = StreamComponent;
