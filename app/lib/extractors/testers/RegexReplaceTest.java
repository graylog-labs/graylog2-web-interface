/**
 * This file is part of Graylog.
 * <p/>
 * Graylog is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * <p/>
 * Graylog is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * <p/>
 * You should have received a copy of the GNU General Public License
 * along with Graylog.  If not, see <http://www.gnu.org/licenses/>.
 */

package lib.extractors.testers;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;
import com.google.inject.Inject;
import org.graylog2.rest.models.tools.requests.RegexReplaceTestRequest;
import org.graylog2.rest.models.tools.responses.RegexReplaceTesterResponse;
import org.graylog2.restclient.lib.APIException;
import org.graylog2.restclient.lib.ApiClient;

import java.io.IOException;
import java.util.Map;

public class RegexReplaceTest {

    private final ApiClient api;

    @Inject
    private RegexReplaceTest(ApiClient api) {
        this.api = api;
    }

    public Map<String, Object> test(RegexReplaceTestRequest request) throws IOException, APIException {
        RegexReplaceTesterResponse r = api.post(RegexReplaceTesterResponse.class)
                .path("/tools/regex_replace_tester")
                .body(request)
                .execute();

        final Map<String, Object> result = Maps.newHashMap();
        result.put("string", r.string());
        result.put("regex", r.regex());
        result.put("replacement", r.replacement());
        result.put("replace_all", r.replaceAll());
        result.put("finds", r.matched());

        final RegexReplaceTesterResponse.Match matchResponse = r.match();
        if (r.matched() && matchResponse != null) {
            result.put(
                    "match", ImmutableMap.<String, Object>of(
                            "start", matchResponse.start(),
                            "end", matchResponse.end(),
                            "match", matchResponse.match()
                    )
            );
        }

        return result;
    }
}
