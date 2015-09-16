import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';

import Grid from './Grid';
import DocumentationLink from 'components/support/DocumentationLink';

import DocsHelper from 'util/DocsHelper';

class Dashboard extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    widgets: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.instanceOf(Immutable.List)]),
  };

  constructor(props) {
    super(props);
    this.state = {widgets: Immutable.List(props.widgets)};
  }

  render() {
    let widgetList;

    if (this.state.widgets.count() === 0) {
      widgetList = (
        <div className="row content">
          <div className="col-md-12">
            <div className="alert alert-info no-widgets">
              This dashboard has no widgets yet. Learn how to add widgets in the
              {' '}<DocumentationLink page={DocsHelper.PAGES.DASHBOARDS} text="documentation"/>.
            </div>
          </div>
        </div>
      );
    } else {
      widgetList = (
        <div className="row">
          <div className="new-dashboard">
            <Grid id={this.props.id} widgets={this.props.widgets}/>
          </div>
          <br style={{clear: 'both'}}/>
        </div>
      );
    }
    return (
      <div>
        {widgetList}
      </div>
    );
  }
}

export default Dashboard;
