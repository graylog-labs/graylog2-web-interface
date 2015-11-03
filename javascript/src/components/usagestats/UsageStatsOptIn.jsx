/* global jsRoutes */
'use strict';

import React from 'react';
import { Panel, Button, Row, Col } from 'react-bootstrap';
import { UsageStatsOptOutStore } from '../../stores/usagestats/UsageStatsOptOutStore';

const UsageStatsOptIn = React.createClass({
    getInitialState() {
        return {
            optOutStateLoaded: false,
            optOutState: null
        };
    },
    _handleClickEnable() {
        UsageStatsOptOutStore.setOptIn(false);
        this.setState({optOutStateLoaded: true, optOutState: {opt_out: false}});
    },
    _handleClickDisable() {
        UsageStatsOptOutStore.setOptOut(false);
        this.setState({optOutStateLoaded: true, optOutState: {opt_out: true}});
    },
    render() {
        var content = null;

        if (this.state.optOutStateLoaded) {
            // We only show the opt-out form if there is no opt-out state!
            if (this.state.optOutState !== null) {
                var form = null;

                if (this.state.optOutState.opt_out === true) {
                    form = (
                        <div>
                            <p className="description">
                                Anonymous usage statistics collection is currently <strong>disabled</strong>. You can enable it to help us making Graylog better.
                            </p>
                            <Button bsSize="small" bsStyle="success" onClick={this._handleClickEnable}>Enable</Button>
                        </div>
                    );
                } else {
                    form = (
                        <div>
                            <p className="description">
                                You decided to <strong>enable</strong> the anonymous usage statistics collection to make Graylog better. Thank you!
                            </p>
                            <Button bsSize="small" bsStyle="info" onClick={this._handleClickDisable}>Disable</Button>
                        </div>
                    );
                }

                content = (
                    <Row className="content">
                        <Col md={12}>
                            <h2><i className="fa fa-bar-chart"></i> Anonymous Usage Statistics</h2>
                            {form}
                        </Col>
                    </Row>
                );
            }
        } else {
            UsageStatsOptOutStore.getOptOutState().done((optOutState) => {
                this.setState({optOutStateLoaded: true, optOutState: optOutState});
            });
        }

        return content;
    }
});

module.exports = UsageStatsOptIn;
