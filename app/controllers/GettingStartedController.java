package controllers;

import org.graylog2.restclient.lib.ServerNodes;
import org.graylog2.restclient.models.Node;
import play.Play;
import play.mvc.Result;

import javax.inject.Inject;

public class GettingStartedController extends AuthenticatedController {
    private final ServerNodes serverNodes;

    @Inject
    public GettingStartedController(ServerNodes serverNodes) {
        this.serverNodes = serverNodes;
    }

    public Result index(boolean menu) {
        final Node master = serverNodes.master();
        return ok(views.html.gettingstarted.index.render(currentUser(),
                                                         master.getClusterId(),
                                                         master.loadSystemInformation().operatingSystem,
                                                         master.getVersion(),
                                                         Play.application().configuration().getString(
                                                                 "getting-started.url",
                                                                 "https://versioncheck.graylog.com/getting-started"),
                                                         menu
                                                         ));
    }
}
