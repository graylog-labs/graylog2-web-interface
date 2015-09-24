import React, {Component, PropTypes} from 'react';

import Widget from 'components/widgets/Widget';

class GridCell extends Component {
  static propTypes = {
    dashboardId: PropTypes.string.isRequired,
    widget: PropTypes.object.isRequired,
    widgetPosition: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    margin: PropTypes.number.isRequired,
  };

  render() {
    return (
      <div className="widget-container" style={this._getWidgetStyle(this.props.widgetPosition)}>
        <Widget dashboardId={this.props.dashboardId} widgetId={this.props.widget.id}/>
      </div>
    );
  }

  _getWidgetStyle(widgetPosition) {
    return {
      width: this.props.width * widgetPosition.width + (this.props.margin * (widgetPosition.width - 1)),
      height: this.props.height * widgetPosition.height + (this.props.margin * (widgetPosition.height - 1)),
      left: (this.props.width + this.props.margin) * widgetPosition.column,
      top: (this.props.height + this.props.margin) * widgetPosition.row,
    };
  }
}

export default GridCell;
