import React, {PropTypes} from 'react';
import FieldHelpers from './FieldHelpers';

const BooleanField = React.createClass({
  propTypes: {
    typeName: PropTypes.string.isRequired,
    field: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any,
  },
  getInitialState() {
    return {
      typeName: this.props.typeName,
      field: this.props.field,
      title: this.props.title,
      value: (this.props.value === undefined ? this.props.field.default_value : this.props.value),
    };
  },
  componentWillReceiveProps(props) {
    this.setState(props);
  },
  render() {
    const field = this.state.field;
    const typeName = this.state.typeName;
    const value = this.state.value;
    return (
      <div className="form-group">
        <div className="checkbox">
          <label>
            <input id={typeName + '-' + field.title}
                   type="checkbox"
                   checked={value}
                   name={`configuration[${field.title}]`}
                   onChange={this.handleChange}/>

            {field.human_name}

            {FieldHelpers.optionalMarker(field)}
          </label>
        </div>
        <p className="help-block">{field.description}</p>
      </div>
    );
  },
  handleChange() {
    const newValue = !this.state.value;
    this.setState({value: newValue});
    this.props.onChange(this.state.title, newValue);
  },
});

export default BooleanField;
