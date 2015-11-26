'use strict';

declare var $: any;

import UserNotification = require("../../util/UserNotification");
import URLUtils = require("../../util/URLUtils");

interface GrokPattern {
    id: string;
    name: string;
    pattern: string;
}

var GettingStartedStore = {
    URL: URLUtils.appPrefixed('/a/system/gettingstarted/dismiss'),

    dismiss(callback:() => void) {
        var failCallback = (jqXHR, textStatus, errorThrown) => {
            UserNotification.error("Dismissing Getting Started Guide failed with status: " + errorThrown,
                "Could not dismiss guide");
        };

        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: this.URL,
            data: "{}"
        }).done(() => {
            callback();
        }).fail(failCallback);
    },
};

export = GettingStartedStore;