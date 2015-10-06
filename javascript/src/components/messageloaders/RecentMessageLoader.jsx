import React, {Component, PropTypes} from 'react';
import InputDropdown from 'components/inputs/InputDropdown';
import InputsStore from 'stores/inputs/InputsStore';
import UserNotification from 'util/UserNotification';

class RecentMessageLoader extends Component {
  static propTypes = {
    inputs: PropTypes.object,
    onMessageLoaded: PropTypes.func.isRequired,
    selectedInputId: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick(inputId) {
    const input = this.props.inputs.get(inputId);
    if (!input) {
      UserNotification.error('Invalid input selected: ' + inputId,
        'Could not load message from invalid Input ' + inputId);
    }
    InputsStore.globalRecentMessage(input, (message) => {
      message.source_input_id = input.id;
      this.props.onMessageLoaded(message);
    });
  }

  render() {
    let helpMessage;
    if (this.props.selectedInputId) {
      helpMessage = 'Click on "Load Message" to load the most recent message from this input.';
    } else {
      helpMessage = 'Select an Input from the list below and click "Load Message" to load the most recent message from this input.';
    }
    return (
      <div style={{marginTop: 5}}>
        {helpMessage}
        <InputDropdown inputs={this.props.inputs} preselectedInputId={this.props.selectedInputId} onLoadMessage={this.onClick} title="Load Message"/>
      </div>
    );
  }
}

export default RecentMessageLoader;
