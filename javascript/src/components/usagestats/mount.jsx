'use strict';

var React = require('react');
var UsageStatsOptOut = require('./UsageStatsOptOut');
var UsageStatsOptIn = require('./UsageStatsOptIn');

var optOutElement = document.getElementById('usage-stats-opt-out');
var optInElement = document.getElementById('usage-stats-opt-in');

if (optOutElement) {
    React.render(<UsageStatsOptOut/>, optOutElement);
}

if (optInElement) {
    React.render(<UsageStatsOptIn/>, optInElement);
}
