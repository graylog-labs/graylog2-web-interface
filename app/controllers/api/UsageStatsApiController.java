/*
 * Copyright 2012-2015 TORCH GmbH, 2015 Graylog, Inc.
 *
 * This file is part of Graylog.
 *
 * Graylog is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Graylog is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Graylog.  If not, see <http://www.gnu.org/licenses/>.
 */
package controllers.api;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.net.MediaType;
import controllers.AuthenticatedController;
import lib.json.Json;
import org.graylog2.restclient.models.UsageStatsConfigurationResponse;
import org.graylog2.restclient.models.UsageStatsOptOutState;
import org.graylog2.restclient.models.UsageStatsService;
import play.mvc.Result;

import javax.inject.Inject;

public class UsageStatsApiController extends AuthenticatedController {
    private final UsageStatsService usageStatsService;

    @Inject
    public UsageStatsApiController(UsageStatsService usageStatsService) {
        this.usageStatsService = usageStatsService;
    }

    public Result pluginEnabled() {
        final UsageStatsConfigurationResponse config = usageStatsService.getConfig();
        final PluginEnabledResponse response = new PluginEnabledResponse(config != null && config.isEnabled());

        return ok(Json.toJsonString(response));
    }

    public Result getOptOutState() {
        final UsageStatsOptOutState optOutState = usageStatsService.getOptOutState();

        return ok(Json.toJsonString(optOutState)).as(MediaType.JSON_UTF_8.toString());
    }

    public Result setOptOutState() {
        final JsonNode json = request().body().asJson();
        final UsageStatsOptOutState optOutState = Json.fromJson(json, UsageStatsOptOutState.class);

        usageStatsService.setOptOutState(optOutState);

        return ok();
    }

    @JsonAutoDetect
    private static class PluginEnabledResponse {
        @JsonProperty("plugin_enabled")
        private final boolean pluginEnabled;

        public PluginEnabledResponse(boolean pluginEnabled) {
            this.pluginEnabled = pluginEnabled;
        }
    }
}
