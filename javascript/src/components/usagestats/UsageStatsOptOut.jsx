/* global jsRoutes */
'use strict';

import React from 'react';
import { Panel, Button, Row, Col } from 'react-bootstrap';
import { UsageStatsOptOutStore } from '../../stores/usagestats/UsageStatsOptOutStore';

const UsageStatsOptOut = React.createClass({
    getInitialState() {
        return {
            optOutStateLoaded: false,
            optOutState: null
        };
    },
    componentDidMount() {
        UsageStatsOptOutStore.getOptOutState().done((optOutState) => {
            this.setState({optOutStateLoaded: true, optOutState: optOutState});
        });
    },
    _handleClickEnable() {
        UsageStatsOptOutStore.setOptIn(true);
        this.setState({optOutStateLoaded: true, optOutState: {opt_out: false}});
    },
    _handleClickDisable() {
        UsageStatsOptOutStore.setOptOut(true);
        this.setState({optOutStateLoaded: true, optOutState: {opt_out: true}});
    },
    render() {
        var content = null;

        if (this.state.optOutStateLoaded) {
            // We only show the opt-out form if there is no opt-out state!
            if (this.state.optOutState === null) {
                content = (
                    <Row className="content">
                        <Col md={12}>
                            <div>
                                Graylog periodically sends anonymous usage information to help us improve your experience.
                                {' '}
                                <Button bsSize="small" bsStyle="success" onClick={this._handleClickEnable}>Ok</Button>
                                {' '}
                                <Button bsSize="xsmall" bsStyle="link" onClick={this._handleClickDisable}>Don't send</Button>
                            </div>
                        </Col>
                    </Row>
                );
            }
        }

        return content;
    }
});

module.exports = UsageStatsOptOut;
