import React, {Component, PropTypes} from 'react';
import MessageDetail from './MessageDetail';

class MessageShow extends Component {
  static propTypes = {
    message: PropTypes.object,
    inputs: PropTypes.object,
    streams: PropTypes.object,
    nodes: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.possiblyHighlight = this.possiblyHighlight.bind(this);
  }

  possiblyHighlight(fieldName) {
    // No highlighting for the message details view.
    return this.props.message.fields[fieldName];
  }

  render() {
    return (
      <div className="row content">
        <div className="col-md-12">
          <MessageDetail {...this.props} message={this.props.message}
                                         inputs={this.props.inputs}
                                         streams={this.props.streams}
                                         nodes={this.props.nodes}
                                         possiblyHighlight={this.possiblyHighlight}
                                         showTimestamp/>
        </div>
      </div>
    );
  }
}

export default MessageShow;
