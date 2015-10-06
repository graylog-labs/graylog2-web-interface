import React, {Component, PropTypes} from 'react';
import {Input, FormControls} from 'react-bootstrap';
import Spinner from 'components/common/Spinner';
import Immutable from 'immutable';

const PLACEHOLDER = 'placeholder';

class InputDropdown extends Component {
  static propTypes = {
    inputs: PropTypes.object,
    title: PropTypes.string,
    preselectedInputId: PropTypes.string,
    onLoadMessage: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this._onInputSelected = this._onInputSelected.bind(this);
    this._onLoadMessage = this._onLoadMessage.bind(this);

    this.state = {
      selectedInput: props.preselectedInputId || PLACEHOLDER,
    };
  }

  _formatInput(input) {
    return <option key={input.id} value={input.id}>{input.title} ({input.type})</option>;
  }

  _sortByTitle(input1, input2) {
    return input1.title.localeCompare(input2.title);
  }

  _onInputSelected() {
    this.setState({selectedInput: this.refs.inputSelector.getValue()});
  }

  _onLoadMessage() {
    this.props.onLoadMessage(this.state.selectedInput);
  }

  _formatStaticInput(input) {
    return (
      <Input type="select" style={{float: 'left', width: 400, marginRight: 10}} disabled>
        <option>{`${input.title} (${input.type})`}</option>
      </Input>
    );
  }

  render() {
    // When an input is pre-selected, show a static dropdown
    if (this.props.inputs && this.props.preselectedInputId) {
      return (
        <div>
          {this._formatStaticInput(this.props.inputs.get(this.props.preselectedInputId))}

          <a className="btn btn-info" disabled={this.state.selectedInput === PLACEHOLDER}
             onClick={this._onLoadMessage}>{this.props.title}</a>
        </div>
      );
    }

    if (this.props.inputs) {
      const inputs = Immutable.List(this.props.inputs.sort(this._sortByTitle).map(this._formatInput));
      return (
        <div>
          <Input ref="inputSelector" type="select" style={{float: 'left', width: 400, marginRight: 10}}
                 placeholder={PLACEHOLDER} onChange={this._onInputSelected}
                 defaultValue={this.state.selectedInput}>
            <option value={PLACEHOLDER}>Select an input</option>
            {inputs}
          </Input>

          <a className="btn btn-info" disabled={this.state.selectedInput === PLACEHOLDER}
             onClick={this._onLoadMessage}>{this.props.title}</a>
        </div>
      );
    } else {
      return <Spinner />;
    }
  }
}

export default InputDropdown;
