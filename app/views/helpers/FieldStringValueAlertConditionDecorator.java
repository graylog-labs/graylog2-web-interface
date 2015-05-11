package views.helpers;

import controllers.routes;
import org.graylog2.restclient.models.Stream;
import org.graylog2.restclient.models.alerts.AlertCondition;
import play.api.mvc.Call;
import play.twirl.api.Html;

public class FieldStringValueAlertConditionDecorator extends AlertConditionDecorator {

    public FieldStringValueAlertConditionDecorator(AlertCondition condition) {
        super(condition);
    }

    public static Html loadTemplate(Stream stream, AlertCondition condition) {
        return views.html.partials.alerts.form_field_string_value.render(stream, new FieldStringValueAlertConditionDecorator(condition));
    }

    @Override
    public Call getFormAction(String streamId) {
        if (isEmptyCondition()) {
            return routes.AlertsController.addTypeFieldStringValue(streamId);
        } else {
            return routes.AlertsController.updateCondition(streamId, getId());
        }
    }

    @Override
    public String getFormId() {
        if (isEmptyCondition()) {
            return "field-string-value";
        } else {
            return "alert-condition-" + getId();
        }
    }

}
