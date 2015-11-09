/// <reference path="../../../declarations/jquery/jquery.d.ts" />

declare var $: any;
declare var jsRoutes: any;

import UserNotification = require("../../util/UserNotification");

export interface UsageStatsOptOutState {
    opt_out: boolean
}

export var UsageStatsOptOutStore = {
    pluginEnabled(): JQueryPromise<boolean> {
        var url = jsRoutes.controllers.api.UsageStatsApiController.pluginEnabled().url;
        var promise = $.getJSON(url);

        return promise;
    },
    getOptOutState(): JQueryPromise<UsageStatsOptOutState> {
        var url = jsRoutes.controllers.api.UsageStatsApiController.setOptOutState().url;
        var promise = $.getJSON(url);

        promise.fail((jqXHR, textStatus, errorThrown) => {
            UserNotification.error("Loading usage stats opt-out state failed: " + errorThrown);
        });

        return promise;
    },
    setOptOut(notify: boolean): JQueryPromise<boolean> {
        return this._sendOptOutState({opt_out: true}, () => {
            if (notify === true) {
                UserNotification.success("No anonymous usage stats will be sent.", "Opt-out created");
            }
        }, (jqXHR) => {
            UserNotification.error("Please try again",
                "Setting anonymous usage stats opt-out failed: " + jqXHR.responseText);
        });
    },
    setOptIn(notify: boolean): JQueryPromise<boolean> {
        return this._sendOptOutState({opt_out: false}, () => {
            if (notify === true) {
                UserNotification.success("Thank you for helping us making Graylog better!");
            }
        }, (jqXHR) => {
            UserNotification.error("Please try again",
                "Opt-in failed: " + jqXHR.responseText);
        });
    },
    _sendOptOutState(optOutState: UsageStatsOptOutState, success: Function, error: Function): JQueryPromise<boolean> {
        var url = jsRoutes.controllers.api.UsageStatsApiController.setOptOutState().url;
        var promise = $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify(optOutState),
            dataType: 'json',
            contentType: 'application/json'
        });

        promise.done(() => success());
        promise.fail((jqXHR) => error());

        return promise;
    }
};