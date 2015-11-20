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
  render() {
    const field = this.props.field;
    const typeName = this.props.typeName;
    const title = this.props.title;
    const value = this._getEffectiveValue();
    return (
      <div className="form-group">
        <div className="checkbox">
          <label>
            <input id={typeName + '-' + title}
                   type="checkbox"
                   checked={value}
                   name={`configuration[${title}]`}
                   onChange={this.handleChange}/>

            {field.human_name}

            {FieldHelpers.optionalMarker(field)}
          </label>
        </div>
        <p className="help-block">{field.description}</p>
      </div>
    );
  },
  _getEffectiveValue() {
    return (this.props.value === undefined ? this.props.field.default_value : this.props.value);
  },
  handleChange() {
    const newValue = !this._getEffectiveValue();
    this.setState({value: newValue});
    this.props.onChange(this.props.title, newValue);
  },
});

export default BooleanField;
