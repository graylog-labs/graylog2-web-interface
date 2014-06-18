package lib.notifications;

import com.google.common.collect.Maps;
import models.Stream;
import models.SystemJob;

import java.util.Map;

/**
 * @author Dennis Oelkers <dennis@torch.sh>
 */
public class StreamProcessingDisabled implements NotificationType {
    private final String streamTitle;
    private final long faultCount;

    public StreamProcessingDisabled(String streamTitle, long faultCount) {
        this.streamTitle = streamTitle;
        this.faultCount = faultCount;
    }

    @Override
    public Map<SystemJob.Type, String> options() {
        return Maps.newHashMap();
    }

    @Override
    public String getTitle() {
        return "Processing of a stream has been disabled due to excessive processing time.";
    }

    @Override
    public String getDescription() {
        return "The processing of stream <em>" + streamTitle
                + "</em> has taken too long for " + faultCount + " times. "
                + "To protect the stability of message processing, this stream has been disabled. "
                + "Please correct the stream rules and reenable the stream.";

    }

    @Override
    public boolean isCloseable() {
        return true;
    }
}
