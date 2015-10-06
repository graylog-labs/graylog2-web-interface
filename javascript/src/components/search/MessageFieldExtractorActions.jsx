import React, {Component, PropTypes} from 'react';
import {DropdownButton, MenuItem}  from 'react-bootstrap';
import ExtractorUtils from 'util/ExtractorUtils';

class MessageFieldExtractorActions extends Component {
  static propTypes = {
    fieldName: PropTypes.string.isRequired,
    message: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.newExtractorRoutes = ExtractorUtils.getNewExtractorRoutes(props.message.source_node_id,
      props.message.source_input_id, props.fieldName, props.message.index, props.message.id);
  }

  componentWillReceiveProps(nextProps) {
    this.newExtractorRoutes = ExtractorUtils.getNewExtractorRoutes(nextProps.message.source_node_id,
      nextProps.message.source_input_id, nextProps.fieldName, nextProps.message.index, nextProps.message.id);
  }

  _formatExtractorMenuItem(extractorType) {
    return (
      <MenuItem key={`menu-item-${extractorType}`} href={this.newExtractorRoutes[extractorType]}>
        {ExtractorUtils.getReadableExtractorTypeName(extractorType)}
      </MenuItem>
    );
  }

  render() {
    return (
      <div className="message-field-actions pull-right">
        <DropdownButton pullRight
                     bsSize="xsmall"
                     title="Select extractor type"
                     key={1}
                     id={`select-extractor-type-dropdown-field-${this.props.fieldName}`}>
          {ExtractorUtils.EXTRACTOR_TYPES.map(extractorType => this._formatExtractorMenuItem(extractorType))}
        </DropdownButton>
      </div>
    );
  }
}

export default MessageFieldExtractorActions;
