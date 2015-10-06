import React, {Component, PropTypes} from 'react';
import {Tabs, Tab} from 'react-bootstrap';
import Immutable from 'immutable';

import RecentMessageLoader from './RecentMessageLoader';
import MessageShow from 'components/search/MessageShow';
import InputsStore from 'stores/inputs/InputsStore';
import MessageLoader from 'components/extractors/MessageLoader';

class LoaderTabs extends Component {
  static propTypes = {
    messageId: PropTypes.string,
    index: PropTypes.string,
    onMessageLoaded: PropTypes.func,
    selectedInputId: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.loadData = this.loadData.bind(this);
    this.onMessageLoaded = this.onMessageLoaded.bind(this);

    this.state = {
      message: undefined,
      inputs: undefined,
    };
  }

  componentDidMount() {
    this.loadData();
    if (this.props.messageId && this.props.index) {
      this.refs.messageLoader.submit(this.props.messageId, this.props.index);
    }
  }

  onMessageLoaded(message) {
    message.formatted_fields.timestamp = message.fields.timestamp;
    message.fields._id = message.id;
    this.setState({message: message});
    if (this.props.onMessageLoaded) {
      this.props.onMessageLoaded(message);
    }
  }

  loadData() {
    InputsStore.list((inputsList) => {
      const inputs = {};
      inputsList.forEach(input => {
        inputs[input.id] = input;
      });
      this.setState({inputs: Immutable.Map(inputs)});
    });
  }

  render() {
    let displayMessage;
    if (this.state.message && this.state.inputs) {
      displayMessage = (
        <div className="col-md-12">
          <MessageShow message={this.state.message} inputs={this.state.inputs}
                       disableTestAgainstStream disableFieldActions/>
        </div>
      );
    }

    let defaultActiveKey;
    if (this.props.messageId && this.props.index) {
      defaultActiveKey = 2;
    } else {
      defaultActiveKey = 1;
    }
    return (
      <div>
        <Tabs defaultActiveKey={defaultActiveKey} animation={false}>
          <Tab eventKey={1} title="Recent" style={{marginBottom: '10px'}}>
            <RecentMessageLoader inputs={this.state.inputs}
                                 selectedInputId={this.props.selectedInputId}
                                 onMessageLoaded={this.onMessageLoaded}/>
          </Tab>
          <Tab eventKey={2} title="Manual" style={{marginBottom: '10px'}}>
            <div style={{marginTop: '5px', marginBottom: '15px'}}>
              Please provide the id and index of the message that you want to load in this form:
            </div>

            <MessageLoader ref="messageLoader" onMessageLoaded={this.onMessageLoaded} hidden={false} hideText/>
          </Tab>
        </Tabs>
        {displayMessage}
      </div>
    );
  }
}

export default LoaderTabs;
