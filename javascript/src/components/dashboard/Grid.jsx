import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';

import Widget from 'components/widgets/Widget';

class Grid extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    widgets: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.instanceOf(Immutable.List)]),
    widgetHeight: PropTypes.number,
    widgetWidth: PropTypes.number,
  };

  static defaultProps = {
    widgetHeight: 200,
    widgetWidth: 410,
  };

  constructor(props) {
    super(props);

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    this.state = {
      columns: Math.floor(viewportWidth / props.widgetWidth),
      rows: Math.floor(viewportHeight / props.widgetHeight),
    };
  }

  render() {
    const formattedWidgets = this.props.widgets.map((widget) => {
      console.log(widget);
      return (
        <div key={widget.id} className="react-widget" style={{width: this.props.widgetWidth * widget.width, height: this.props.widgetHeight * widget.height}}>
          <Widget dashboardId={this.props.id} widgetId={widget.id}/>
        </div>
      );
    });

    return <div>{formattedWidgets}</div>;
  }

}

export default Grid;
